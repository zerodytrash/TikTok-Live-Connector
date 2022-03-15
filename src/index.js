const { EventEmitter } = require('events');

const TikTokHttpClient = require('./lib/tiktokHttpClient.js');
const WebcastWebsocket = require('./lib/webcastWebsocket.js');
const { getRoomIdFromMainPageHtml, validateAndNormalizeUniqueId } = require('./lib/tiktokUtils.js');
const { simplifyObject } = require('./lib/webcastDataConverter.js');
const { deserializeMessage } = require('./lib/webcastProtobuf.js');

const Config = require('./lib/webcastConfig.js');

const Events = {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    ERROR: 'error',
    CHAT: 'chat',
    MEMBER: 'member',
    GIFT: 'gift',
    ROOMUSER: 'roomUser',
    SOCIAL: 'social',
    LIKE: 'like',
    QUESTIONNEW: 'questionNew',
    LINKMICBATTLE: 'linkMicBattle',
    LINKMICARMIES: 'linkMicArmies',
    RAWDATA: 'rawData',
    STREAMEND: 'streamEnd',
    WSCONNECTED: 'websocketConnected',
};

/**
 * Wrapper class for TikTok's internal Webcast Push Service
 */
class WebcastPushConnection extends EventEmitter {
    #options;
    #uniqueStreamerId;
    #roomId;
    #roomInfo;
    #clientParams;
    #httpClient;
    #availableGifts;

    // Websocket
    #websocket;

    // State
    #isConnecting;
    #isConnected;
    #isPollingEnabled;
    #isWsUpgradeDone;

    /**
     * Create a new WebcastPushConnection instance
     * @param {string} uniqueId TikTok username (from URL)
     * @param {object} [options] Connection options
     * @param {boolean} [options[].processInitialData=true] Process the initital data which includes messages of the last minutes
     * @param {boolean} [options[].fetchRoomInfoOnConnect=true] Fetch the room info (room status, streamer info, etc.) on connect (will be returned when calling connect())
     * @param {boolean} [options[].enableExtendedGiftInfo=false] Enable this option to get extended information on 'gift' events like gift name and cost
     * @param {boolean} [options[].enableWebsocketUpgrade=true] Use WebSocket instead of request polling if TikTok offers it
     * @param {number} [options[].requestPollingIntervalMs=1000] Request polling interval if WebSocket is not used
     * @param {object} [options[].clientParams={}] Custom client params for Webcast API
     * @param {object} [options[].requestHeaders={}] Custom request headers for axios
     * @param {object} [options[].websocketHeaders={}] Custom request headers for websocket.client
     */
    constructor(uniqueId, options) {
        super();

        this.#setOptions(options || {});

        this.#uniqueStreamerId = validateAndNormalizeUniqueId(uniqueId);
        this.#httpClient = new TikTokHttpClient(this.#options.requestHeaders);

        this.#clientParams = {
            ...Config.DEFAULT_CLIENT_PARAMS,
            ...this.#options.clientParams,
        };

        this.#setUnconnected();
    }

    #setOptions(providedOptions) {
        this.#options = Object.assign(
            {
                // Default
                processInitialData: true,
                fetchRoomInfoOnConnect: true,
                enableExtendedGiftInfo: false,
                enableWebsocketUpgrade: true,
                requestPollingIntervalMs: 1000,
                clientParams: {},
                requestHeaders: {},
                websocketHeaders: {},
            },
            providedOptions
        );
    }

    #setUnconnected() {
        this.#roomInfo = null;
        this.#isConnecting = false;
        this.#isConnected = false;
        this.#isPollingEnabled = false;
        this.#isWsUpgradeDone = false;
        this.#clientParams.cursor = '';
    }

    /**
     * Connects to the current live stream room
     * @returns {Promise} Promise that will be resolved when the connection is established.
     */
    async connect() {
        if (this.#isConnecting) {
            throw new Error('Already connecting!');
        }

        if (this.#isConnected) {
            throw new Error('Already connected!');
        }

        this.#isConnecting = true;

        try {
            await this.#retrieveRoomId();

            // Fetch room info if option enabled
            if (this.#options.fetchRoomInfoOnConnect) {
                await this.#fetchRoomInfo();

                // Prevent connections to finished rooms
                if (this.#roomInfo.status === 4) {
                    throw new Error('LIVE has ended');
                }
            }

            // Fetch all available gift info if option enabled
            if (this.#options.enableExtendedGiftInfo) {
                await this.#fetchAvailableGifts();
            }

            await this.#fetchRoomData(true);

            this.#isConnected = true;

            // Sometimes no upgrade to websocket is offered by TikTok
            // In that case we use request polling
            if (!this.#isWsUpgradeDone) {
                this.#startFetchRoomPolling();
            }

            let state = this.getState();

            this.emit(Events.CONNECTED, state);
            return state;
        } catch (err) {
            this.#handleError(err, 'Error while connecting');
            throw err;
        } finally {
            this.#isConnecting = false;
        }
    }

    /**
     * Disconnects the connection to the live stream
     */
    disconnect() {
        if (this.#isConnected) {
            if (this.#isWsUpgradeDone && this.#websocket.connection.connected) {
                this.#websocket.connection.close();
            }

            // Reset state
            this.#setUnconnected();

            this.emit(Events.DISCONNECTED);
        }
    }

    /**
     * Get the current connection state including the cached room info and all available gifts (if `enableExtendedGiftInfo` option enabled)
     * @returns {object} current state object
     */
    getState() {
        return {
            isConnected: this.#isConnected,
            upgradedToWebsocket: this.#isWsUpgradeDone,
            roomId: this.#roomId,
            roomInfo: this.#roomInfo,
            availableGifts: this.#availableGifts,
        };
    }

    /**
     * Get the current room info (including streamer info, room status and statistics)
     * @returns {Promise} Promise that will be resolved when the room info has been retrieved from the API
     */
    async getRoomInfo() {
        // Retrieve current room_id if not connected
        if (!this.#isConnected) {
            await this.#retrieveRoomId();
        }

        await this.#fetchRoomInfo();

        return this.#roomInfo;
    }

    /**
     * Get a list of all available gifts including gift name, image url, diamont cost and a lot of other information
     * @returns {Promise} Promise that will be resolved when all available gifts has been retrieved from the API
     */
    async getAvailableGifts() {
        await this.#fetchAvailableGifts();

        return this.#availableGifts;
    }

    /**
     * Decodes and processes a binary webcast data package that you have received via the `rawData` event (for debugging purposes only)
     * @param {string} messageType
     * @param {Buffer} messageBuffer
     */
    decodeProtobufMessage(messageType, messageBuffer) {
        let webcastMessage = deserializeMessage(messageType, messageBuffer);
        this.#processWebcastResponse({
            messages: [
                {
                    decodedData: webcastMessage,
                    type: messageType,
                },
            ],
        });
    }

    async #retrieveRoomId() {
        try {
            let mainPageHtml = await this.#httpClient.getMainPage(`@${this.#uniqueStreamerId}/live`);
            let roomId = getRoomIdFromMainPageHtml(mainPageHtml);

            this.#roomId = roomId;
            this.#clientParams.room_id = roomId;
        } catch (err) {
            throw new Error(`Failed to retrieve room_id from page source. ${err.message}`);
        }
    }

    async #fetchRoomInfo() {
        try {
            let response = await this.#httpClient.getJsonObjectFromWebcastApi('room/info/', this.#clientParams);
            this.#roomInfo = response.data;
        } catch (err) {
            throw new Error(`Failed to fetch room info. ${err.message}`);
        }
    }

    async #fetchAvailableGifts() {
        try {
            let response = await this.#httpClient.getJsonObjectFromWebcastApi('gift/list/', this.#clientParams);
            this.#availableGifts = response.data.gifts;
        } catch (err) {
            throw new Error(`Failed to fetch available gifts. ${err.message}`);
        }
    }

    async #startFetchRoomPolling() {
        this.#isPollingEnabled = true;

        let sleepMs = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        while (this.#isPollingEnabled) {
            try {
                await this.#fetchRoomData();
            } catch (err) {
                this.#handleError(err, 'Error while fetching webcast data via request polling');
            }

            await sleepMs(this.#options.requestPollingIntervalMs);
        }
    }

    async #fetchRoomData(isInitial) {
        let webcastResponse = await this.#httpClient.getDeserializedObjectFromWebcastApi('im/fetch/', this.#clientParams, 'WebcastResponse');
        let upgradeToWsOffered = !!webcastResponse.wsUrl && !!webcastResponse.wsParam;

        // Set cursor param to continue with the next request
        if (webcastResponse.cursor) {
            this.#clientParams.cursor = webcastResponse.cursor;
        }

        // Upgrade to Websocket offered? => Try upgrade
        if (!this.#isWsUpgradeDone && this.#options.enableWebsocketUpgrade && upgradeToWsOffered) {
            await this.#tryUpgradeToWebsocket(webcastResponse);
        }

        // Skip processing initial data if option disabled
        if (isInitial && !this.#options.processInitialData) {
            return;
        }

        this.#processWebcastResponse(webcastResponse);
    }

    async #tryUpgradeToWebsocket(webcastResponse) {
        try {
            // Websocket specific params
            let wsParams = {
                imprp: webcastResponse.wsParam.value,
            };

            // Wait until ws connected, then stop request polling
            await this.#setupWebsocket(webcastResponse.wsUrl, wsParams);

            this.#isWsUpgradeDone = true;
            this.#isPollingEnabled = false;

            this.emit(Events.WSCONNECTED, this.#websocket);
        } catch (err) {
            this.#handleError(err, 'Upgrade to websocket failed. Using request polling...');
        }
    }

    async #setupWebsocket(wsUrl, wsParams) {
        return new Promise((resolve, reject) => {
            this.#websocket = new WebcastWebsocket(wsUrl, this.#httpClient.cookieJar, this.#clientParams, wsParams, this.#options.websocketHeaders);

            this.#websocket.on('connect', (wsConnection) => {
                resolve();

                wsConnection.on('error', (err) => this.#handleError(err, 'Websocket Error'));
                wsConnection.on('close', () => {
                    this.disconnect();
                });
            });

            this.#websocket.on('connectFailed', (err) => reject(`Websocket connection failed, ${err}`));
            this.#websocket.on('webcastResponse', (msg) => this.#processWebcastResponse(msg));
            this.#websocket.on('messageDecodingFailed', (err) => this.#handleError(err, 'Websocket message decoding failed'));
        });
    }

    #processWebcastResponse(webcastResponse) {
        // Emit raw (protobuf encoded) data for a use case specific processing
        webcastResponse.messages.forEach((message) => {
            this.emit(Events.RAWDATA, message.type, message.binary);
        });

        // Process and emit decoded data depending on the the message type
        webcastResponse.messages
            .filter((x) => x.decodedData)
            .forEach((message) => {
                let simplifiedObj = simplifyObject(message.decodedData);

                switch (message.type) {
                    case 'WebcastControlMessage':
                        if (message.decodedData.action === 3) {
                            this.emit(Events.STREAMEND);
                            this.disconnect();
                        }
                        break;
                    case 'WebcastRoomUserSeqMessage':
                        this.emit(Events.ROOMUSER, simplifiedObj);
                        break;
                    case 'WebcastChatMessage':
                        this.emit(Events.CHAT, simplifiedObj);
                        break;
                    case 'WebcastMemberMessage':
                        this.emit(Events.MEMBER, simplifiedObj);
                        break;
                    case 'WebcastGiftMessage':
                        // Add extended gift info if option enabled
                        if (Array.isArray(this.#availableGifts) && simplifiedObj.giftId) {
                            simplifiedObj.extendedGiftInfo = this.#availableGifts.find((x) => x.id === simplifiedObj.giftId);
                        }
                        this.emit(Events.GIFT, simplifiedObj);
                        break;
                    case 'WebcastSocialMessage':
                        this.emit(Events.SOCIAL, simplifiedObj);
                        break;
                    case 'WebcastLikeMessage':
                        this.emit(Events.LIKE, simplifiedObj);
                        break;
                    case 'WebcastQuestionNewMessage':
                        this.emit(Events.QUESTIONNEW, simplifiedObj);
                        break;
                    case 'WebcastLinkMicBattle':
                        this.emit(Events.LINKMICBATTLE, simplifiedObj);
                        break;
                    case 'WebcastLinkMicArmies':
                        this.emit(Events.LINKMICARMIES, simplifiedObj);
                        break;
                }
            });
    }

    #handleError(exception, info) {
        if (this.listenerCount(Events.ERROR) > 0) {
            this.emit(Events.ERROR, { info, exception });
        }
    }
}

module.exports = {
    WebcastPushConnection,
};
