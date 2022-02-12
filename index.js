const { EventEmitter } = require('events');

const TikTokHttpClient = require('./lib/tiktokHttpClient.js');
const WebcastWebsocket = require('./lib/webcastWebsocket.js');
const { getRoomIdFromMainPageHtml, validateAndNormalizeUniqueId } = require('./lib/tiktokUtils.js');
const { simplifyObject } = require('./lib/webcastDataConverter.js');

const Config = require('./lib/webcastConfig.js');

const events = {
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
    RAWDATA: 'rawData',
    STREAMEND: 'streamEnd',
    WSCONNECTED: 'websocketConnected'
}

/**
 * Wrapper class for TikTok's internal Webcast Push Service
 */
class WebcastPushConnection extends EventEmitter {
    #options;
    #uniqueStreamerId;
    #roomId;
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
     * Create a new instance
     * @param {string} uniqueId TikTok username (from URL)
     * @param {object} [options] Connection options
     * @param {boolean} [options[].processInitialData=true] Process the initital data which includes messages of the last minutes
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
            ...this.#options.clientParams
        };

        this.#setUnconnected();
    }

    #setOptions(options) {
        this.#options = Object.assign({
            // Default
            processInitialData: true,
            enableExtendedGiftInfo: false,
            enableWebsocketUpgrade: true,
            requestPollingIntervalMs: 1000,
            clientParams: {},
            requestHeaders: {},
            websocketHeaders: {}
        }, options);
    }

    #setUnconnected() {
        this.#isConnecting = false;
        this.#isConnected = false;
        this.#isPollingEnabled = false;
        this.#isWsUpgradeDone = false;
        this.#clientParams.cursor = '';
    }

    /**
     * Connect to the current live stream room
     * @returns {Promise} Promise that will be resolved when the connection is established.
     */
    connect() {
        return new Promise(async (resolve, reject) => {

            if (this.#isConnecting) {
                reject(new Error('Already connecting!'));
                return;
            }

            if (this.#isConnected) {
                reject(new Error('Already connected!'));
                return;
            }

            this.#isConnecting = true;

            try {

                await this.#retrieveRoomId();

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

                resolve(state);
                this.emit(events.CONNECTED, state);

            } catch (err) {
                reject(err);
                this.#handleError(err, 'Error while connecting');
            }

            this.#isConnecting = false;
        })
    }

    /**
     * Close the connection to the live stream
     */
    disconnect() {
        if (this.#isConnected) {

            if (this.#isWsUpgradeDone && this.#websocket.connection.connected) {
                this.#websocket.connection.close();
            }

            // Reset state
            this.#setUnconnected();

            this.emit(events.DISCONNECTED);
        }
    }

    /**
     * Get the current connection state
     * @returns {object} current state object
     */
    getState() {
        return {
            isConnected: this.#isConnected,
            roomId: this.#roomId,
            upgradedToWebsocket: this.#isWsUpgradeDone
        };
    }

    async #retrieveRoomId() {
        let mainPageHtml = await this.#httpClient.getMainPage(`@${this.#uniqueStreamerId}/live`);
        let roomId = getRoomIdFromMainPageHtml(mainPageHtml);

        this.#roomId = roomId;
        this.#clientParams.room_id = roomId;
    }

    async #fetchAvailableGifts() {
        try {
            let response = await this.#httpClient.getJsonObjectFromWebcastApi('gift/list/', this.#clientParams);
            this.#availableGifts = response.data.gifts;
        } catch (err) {
            throw new Error(`Failed to fetch available gifts. ${err}`);
        }
    }

    async #startFetchRoomPolling() {
        this.#isPollingEnabled = true;

        let sleepMs = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
        this.#clientParams.cursor = webcastResponse.cursor;

        // Upgrade to Websocket offered? => Try upgrade
        if (!this.#isWsUpgradeDone && this.#options.enableWebsocketUpgrade && upgradeToWsOffered) {
            await this.#tryUpgradeToWebsocket(webcastResponse);
        }

        if (isInitial && !this.#options.processInitialData) {
            return;
        }

        this.#processWebcastResponse(webcastResponse);
    }

    async #tryUpgradeToWebsocket(webcastResponse) {
        try {
            // Websocket specific params
            let wsParams = {
                imprp: webcastResponse.wsParam.value
            }

            // Wait until ws connected, then stop request polling
            await this.#setupWebsocket(webcastResponse.wsUrl, wsParams);

            this.#isWsUpgradeDone = true;
            this.#isPollingEnabled = false;

            this.emit(events.WSCONNECTED, this.#websocket);

        } catch (err) {
            this.#handleError(err, 'Upgrade to websocket failed. Using request polling...');
        }
    }

    async #setupWebsocket(wsUrl, wsParams) {
        return new Promise((resolve, reject) => {

            this.#websocket = new WebcastWebsocket(wsUrl, this.#httpClient.cookieJar, this.#clientParams, wsParams, this.#options.websocketHeaders);

            this.#websocket.on('connect', wsConnection => {

                resolve();

                wsConnection.on('error', err => this.#handleError(err, 'Websocket Error'));
                wsConnection.on('close', () => {
                    this.disconnect();
                });
            })

            this.#websocket.on('connectFailed', err => reject(`Websocket connection failed, ${err}`));
            this.#websocket.on('webcastResponse', msg => this.#processWebcastResponse(msg));
            this.#websocket.on('messageDecodingFailed', err => this.#handleError(err, 'Websocket message decoding failed'));
        })
    }

    #processWebcastResponse(webcastResponse) {

        // Emit raw (protobuf encoded) data for a use case specific processing
        webcastResponse.messages.forEach(message => {
            this.emit(events.RAWDATA, message.type, message.binary);
        });

        // Process and emit decoded data depending on the the message type
        webcastResponse.messages.filter(x => x.decodedData).forEach(message => {

            let simplifiedObj = simplifyObject(message.decodedData);

            switch (message.type) {
                case 'WebcastControlMessage':
                    if (message.decodedData.action === 3) {
                        this.emit(events.STREAMEND);
                        this.disconnect();
                    }
                    break;
                case 'WebcastRoomUserSeqMessage':
                    this.emit(events.ROOMUSER, simplifiedObj);
                    break;
                case 'WebcastChatMessage':
                    this.emit(events.CHAT, simplifiedObj);
                    break;
                case 'WebcastMemberMessage':
                    this.emit(events.MEMBER, simplifiedObj);
                    break;
                case 'WebcastGiftMessage':
                    if (Array.isArray(this.#availableGifts) && simplifiedObj.giftId) {
                        // Add extended gift info if option enabled
                        simplifiedObj.extendedGiftInfo = this.#availableGifts.find(x => x.id === simplifiedObj.giftId);
                    }
                    this.emit(events.GIFT, simplifiedObj);
                    break;
                case 'WebcastSocialMessage':
                    this.emit(events.SOCIAL, simplifiedObj);
                    break;
                case 'WebcastLikeMessage':
                    this.emit(events.LIKE, simplifiedObj);
                    break;
                case 'WebcastQuestionNewMessage':
                    this.emit(events.QUESTIONNEW, simplifiedObj);
                    break;
            }
        });
    }

    #handleError(exception, info) {
        if (this.listenerCount(events.ERROR) > 0) {
            this.emit(events.ERROR, { info, exception });
        }
    }
}

module.exports = {
    WebcastPushConnection
}