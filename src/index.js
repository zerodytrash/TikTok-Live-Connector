const { EventEmitter } = require('node:events');

const TikTokHttpClient = require('./lib/tiktokHttpClient.js');
const WebcastWebsocket = require('./lib/webcastWebsocket.js');
const { getRoomIdFromMainPageHtml, validateAndNormalizeUniqueId, addUniqueId, removeUniqueId } = require('./lib/tiktokUtils.js');
const { simplifyObject } = require('./lib/webcastDataConverter.js');
const { deserializeMessage, deserializeWebsocketMessage } = require('./lib/webcastProtobuf.js');

const Config = require('./lib/webcastConfig.js');
const {
    AlreadyConnectingError,
    AlreadyConnectedError,
    UserOfflineError,
    NoWSUpgradeError,
    InvalidSessionIdError,
    InvalidResponseError,
    ExtractRoomIdError,
    InitialFetchError,
} = require('./lib/tiktokErrors');

const ControlEvents = {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    ERROR: 'error',
    RAWDATA: 'rawData',
    DECODEDDATA: 'decodedData',
    STREAMEND: 'streamEnd',
    WSCONNECTED: 'websocketConnected',
};

const MessageEvents = {
    CHAT: 'chat',
    MEMBER: 'member',
    GIFT: 'gift',
    ROOMUSER: 'roomUser',
    SOCIAL: 'social',
    LIKE: 'like',
    QUESTIONNEW: 'questionNew',
    LINKMICBATTLE: 'linkMicBattle',
    LINKMICARMIES: 'linkMicArmies',
    LIVEINTRO: 'liveIntro',
    EMOTE: 'emote',
    ENVELOPE: 'envelope',
    SUBSCRIBE: 'subscribe',
};

const CustomEvents = {
    FOLLOW: 'follow',
    SHARE: 'share',
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
     * @param {boolean} [options[].enableRequestPolling=true] Use request polling if no WebSocket upgrade is offered. If `false` an exception will be thrown if TikTok does not offer a WebSocket upgrade.
     * @param {number} [options[].requestPollingIntervalMs=1000] Request polling interval if WebSocket is not used
     * @param {string} [options[].sessionId=null] The session ID from the "sessionid" cookie is required if you want to send automated messages in the chat.
     * @param {object} [options[].clientParams={}] Custom client params for Webcast API
     * @param {object} [options[].requestHeaders={}] Custom request headers for axios
     * @param {object} [options[].websocketHeaders={}] Custom request headers for websocket.client
     * @param {object} [options[].requestOptions={}] Custom request options for axios. Here you can specify an `httpsAgent` to use a proxy and a `timeout` value for example.
     * @param {object} [options[].websocketOptions={}] Custom request options for websocket.client. Here you can specify an `agent` to use a proxy and a `timeout` value for example.
     * @param {object} [options[].signProviderOptions={}] Custom request options for the TikTok signing server. By default, the custom server is prioritized and will be attempted first. If you prefer to use it as a fallback, set `isFallback: true`. Here you can specify a `host`, `params`, and `headers`.
     */
    constructor(uniqueId, options) {
        super();

        this.#setOptions(options || {});

        this.#uniqueStreamerId = validateAndNormalizeUniqueId(uniqueId);
        this.#httpClient = new TikTokHttpClient(this.#options.requestHeaders, this.#options.requestOptions, this.#options.signProviderOptions, this.#options.sessionId);

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
                enableRequestPolling: true,
                requestPollingIntervalMs: 1000,
                sessionId: null,
                clientParams: {},
                requestHeaders: {},
                websocketHeaders: Config.DEFAULT_REQUEST_HEADERS,
                requestOptions: {},
                websocketOptions: {},
                signProviderOptions: {},
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
        this.#clientParams.internal_ext = '';
    }

    /**
     * Connects to the current live stream room
     * @param {string} [roomId] If you want to connect to a specific roomId. Otherwise the current roomId will be retrieved.
     * @returns {Promise} Promise that will be resolved when the connection is established.
     */
    async connect(roomId = null) {
        if (this.#isConnecting) {
            throw new AlreadyConnectingError('Already connecting!');
        }

        if (this.#isConnected) {
            throw new AlreadyConnectedError('Already connected!');
        }

        this.#isConnecting = true;

        // add streamerId to uu
        addUniqueId(this.#uniqueStreamerId);

        try {
            // roomId already specified?
            if (roomId) {
                this.#roomId = roomId;
                this.#clientParams.room_id = roomId;
            } else {
                await this.#retrieveRoomId();
            }

            // Fetch room info if option enabled
            if (this.#options.fetchRoomInfoOnConnect) {
                await this.#fetchRoomInfo();

                // Prevent connections to finished rooms
                if (this.#roomInfo.status === 4) {
                    throw new UserOfflineError('LIVE has ended');
                }
            }

            // Fetch all available gift info if option enabled
            if (this.#options.enableExtendedGiftInfo) {
                await this.#fetchAvailableGifts();
            }

            try {
                await this.#fetchRoomData(true);
            } catch (ex) {
                let jsonError;
                let retryAfter;

                try {
                    jsonError = JSON.parse(ex.response.data.toString());
                    retryAfter = ex.response.headers?.['retry-after'] ? parseInt(ex.response.headers['retry-after']) : null;
                } catch (parseErr) {
                    throw ex;
                }

                if (!jsonError) throw ex;
                const errorMessage = jsonError?.error || 'Failed to retrieve the initial room data.';
                throw new InitialFetchError(errorMessage, retryAfter);
            }

            // Sometimes no upgrade to WebSocket is offered by TikTok
            // In that case we use request polling (if enabled and possible)
            if (!this.#isWsUpgradeDone) {
                if (!this.#options.enableRequestPolling) {
                    throw new NoWSUpgradeError('TikTok does not offer a websocket upgrade and request polling is disabled (`enableRequestPolling` option).');
                }

                if (!this.#options.sessionId) {
                    // We cannot use request polling if the user has no sessionid defined.
                    // The reason for this is that TikTok needs a valid signature if the user is not logged in.
                    // Signing a request every second would generate too much traffic to the signing server.
                    // If a sessionid is present a signature is not required.
                    throw new NoWSUpgradeError('TikTok does not offer a websocket upgrade. Please provide a valid `sessionId` to use request polling instead.');
                }

                this.#startFetchRoomPolling();
            }

            this.#isConnected = true;

            let state = this.getState();

            this.emit(ControlEvents.CONNECTED, state);
            return state;
        } catch (err) {
            this.#handleError(err, 'Error while connecting');

            // remove streamerId from uu on connect fail
            removeUniqueId(this.#uniqueStreamerId);

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

            // remove streamerId from uu
            removeUniqueId(this.#uniqueStreamerId);

            this.emit(ControlEvents.DISCONNECTED);
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
     * Sends a chat message into the current live room using the provided session cookie
     * @param {string} text Message Content
     * @param {string} [sessionId] The "sessionid" cookie value from your TikTok Website if not provided via the constructor options
     * @returns {Promise} Promise that will be resolved when the chat message has been submitted to the API
     */
    async sendMessage(text, sessionId) {
        if (sessionId) {
            // Update sessionId
            this.#options.sessionId = sessionId;
        }

        if (!this.#options.sessionId) {
            throw new InvalidSessionIdError('Missing SessionId. Please provide your current SessionId to use this feature.');
        }

        try {
            // Retrieve current room_id if not connected
            if (!this.#isConnected) {
                await this.#retrieveRoomId();
            }

            // Add the session cookie to the CookieJar
            this.#httpClient.setSessionId(this.#options.sessionId);

            // Submit the chat request
            let requestParams = { ...this.#clientParams, content: text };
            let response = await this.#httpClient.postFormDataToWebcastApi('room/chat/', requestParams, null);

            // Success?
            if (response?.status_code === 0) {
                return response.data;
            }

            // Handle errors
            switch (response?.status_code) {
                case 20003:
                    throw new InvalidSessionIdError('Your SessionId has expired. Please provide a new one.');
                default:
                    throw new InvalidResponseError(`TikTok responded with status code ${response?.status_code}: ${response?.data?.message}`, response);
            }
        } catch (err) {
            throw new InvalidResponseError(`Failed to send chat message. ${err.message}`, err);
        }
    }

    /**
     * Decodes and processes a binary webcast data package that you have received via the `rawData` event (for debugging purposes only)
     * @param {string} messageType
     * @param {Buffer} messageBuffer
     */
    async decodeProtobufMessage(messageType, messageBuffer) {
        switch (messageType) {
            case 'WebcastResponse': {
                let decodedWebcastResponse = deserializeMessage(messageType, messageBuffer);
                this.#processWebcastResponse(decodedWebcastResponse);
                break;
            }

            case 'WebcastWebsocketMessage': {
                let decodedWebcastWebsocketMessage = await deserializeWebsocketMessage(messageBuffer);
                if (typeof decodedWebcastWebsocketMessage.webcastResponse === 'object') {
                    this.#processWebcastResponse(decodedWebcastWebsocketMessage.webcastResponse);
                }
                break;
            }

            default: {
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
        }
    }

    async #retrieveRoomId() {
        try {
            let mainPageHtml = await this.#httpClient.getMainPage(`@${this.#uniqueStreamerId}/live`);

            try {
                let roomId = getRoomIdFromMainPageHtml(mainPageHtml);

                this.#roomId = roomId;
                this.#clientParams.room_id = roomId;
            } catch (err) {
                // Use fallback method
                let roomData = await this.#httpClient.getJsonObjectFromTiktokApi('api-live/user/room/', {
                    ...this.#clientParams,
                    uniqueId: this.#uniqueStreamerId,
                    sourceType: 54,
                });

                if (roomData.statusCode) throw new InvalidResponseError(`API Error ${roomData.statusCode} (${roomData.message || 'Unknown Error'})`, undefined);

                this.#roomId = roomData.data.user.roomId;
                this.#clientParams.room_id = roomData.data.user.roomId;
            }
        } catch (err) {
            throw new ExtractRoomIdError(`Failed to retrieve room_id from page source. ${err.message}`);
        }
    }

    async #fetchRoomInfo() {
        try {
            let response = await this.#httpClient.getJsonObjectFromWebcastApi('room/info/', this.#clientParams);
            this.#roomInfo = response.data;
        } catch (err) {
            throw new InvalidResponseError(`Failed to fetch room info. ${err.message}`, err);
        }
    }

    async #fetchAvailableGifts() {
        try {
            let response = await this.#httpClient.getJsonObjectFromWebcastApi('gift/list/', this.#clientParams);
            this.#availableGifts = response.data.gifts;
        } catch (err) {
            throw new InvalidResponseError(`Failed to fetch available gifts. ${err.message}`, err);
        }
    }

    async #startFetchRoomPolling() {
        this.#isPollingEnabled = true;

        let sleepMs = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        while (this.#isPollingEnabled) {
            try {
                await this.#fetchRoomData(false);
            } catch (err) {
                this.#handleError(err, 'Error while fetching webcast data via request polling');
            }

            await sleepMs(this.#options.requestPollingIntervalMs);
        }
    }

    async #fetchRoomData(isInitial) {
        let webcastResponse = await this.#httpClient.getDeserializedObjectFromWebcastApi('im/fetch/', this.#clientParams, 'WebcastResponse', isInitial);
        let upgradeToWsOffered = !!webcastResponse.wsUrl;

        if (!webcastResponse.cursor) {
            if (isInitial) {
                throw new InvalidResponseError('Missing cursor in initial fetch response.');
            } else {
                this.#handleError(null, 'Missing cursor in fetch response.');
            }
        }

        // Set cursor and internal_ext param to continue with the next request
        if (webcastResponse.cursor) this.#clientParams.cursor = webcastResponse.cursor;
        if (webcastResponse.internalExt) this.#clientParams.internal_ext = webcastResponse.internalExt;

        if (isInitial) {
            // Upgrade to Websocket offered? => Try upgrade
            if (this.#options.enableWebsocketUpgrade && upgradeToWsOffered) {
                await this.#tryUpgradeToWebsocket(webcastResponse);
            }
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
                compress: 'gzip',
            };

            for (let wsParam of webcastResponse.wsParams) {
                wsParams[wsParam.name] = wsParam.value;
            }

            // Wait until ws connected, then stop request polling
            await this.#setupWebsocket(webcastResponse.wsUrl, wsParams);

            this.#isWsUpgradeDone = true;
            this.#isPollingEnabled = false;

            this.emit(ControlEvents.WSCONNECTED, this.#websocket);
        } catch (err) {
            this.#handleError(err, 'Upgrade to websocket failed');
        }
    }

    async #setupWebsocket(wsUrl, wsParams) {
        return new Promise((resolve, reject) => {
            this.#websocket = new WebcastWebsocket(wsUrl, this.#httpClient.cookieJar, this.#clientParams, wsParams, this.#options.websocketHeaders, this.#options.websocketOptions);

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

            // Hard timeout if the WebSocketClient library does not handle connect errors correctly.
            setTimeout(() => reject('Websocket not responding'), 30000);
        });
    }

    #processWebcastResponse(webcastResponse) {
        // Emit raw (protobuf encoded) data for a use case specific processing
        webcastResponse.messages.forEach((message) => {
            this.emit(ControlEvents.RAWDATA, message.type, message.binary);
        });

        // Process and emit decoded data depending on the the message type
        webcastResponse.messages
            .filter((x) => x.decodedData)
            .forEach((message) => {
                let simplifiedObj = simplifyObject(message.decodedData);

                this.emit(ControlEvents.DECODEDDATA, message.type, simplifiedObj, message.binary);

                switch (message.type) {
                    case 'WebcastControlMessage':
                        // Known control actions:
                        // 3 = Stream terminated by user
                        // 4 = Stream terminated by platform moderator (ban)
                        const action = message.decodedData.action;
                        if ([3, 4].includes(action)) {
                            this.emit(ControlEvents.STREAMEND, { action });
                            this.disconnect();
                        }
                        break;
                    case 'WebcastRoomUserSeqMessage':
                        this.emit(MessageEvents.ROOMUSER, simplifiedObj);
                        break;
                    case 'WebcastChatMessage':
                        this.emit(MessageEvents.CHAT, simplifiedObj);
                        break;
                    case 'WebcastMemberMessage':
                        this.emit(MessageEvents.MEMBER, simplifiedObj);
                        break;
                    case 'WebcastGiftMessage':
                        // Add extended gift info if option enabled
                        if (Array.isArray(this.#availableGifts) && simplifiedObj.giftId) {
                            simplifiedObj.extendedGiftInfo = this.#availableGifts.find((x) => x.id === simplifiedObj.giftId);
                        }
                        this.emit(MessageEvents.GIFT, simplifiedObj);
                        break;
                    case 'WebcastSocialMessage':
                        this.emit(MessageEvents.SOCIAL, simplifiedObj);
                        if (simplifiedObj.displayType?.includes('follow')) {
                            this.emit(CustomEvents.FOLLOW, simplifiedObj);
                        }
                        if (simplifiedObj.displayType?.includes('share')) {
                            this.emit(CustomEvents.SHARE, simplifiedObj);
                        }
                        break;
                    case 'WebcastLikeMessage':
                        this.emit(MessageEvents.LIKE, simplifiedObj);
                        break;
                    case 'WebcastQuestionNewMessage':
                        this.emit(MessageEvents.QUESTIONNEW, simplifiedObj);
                        break;
                    case 'WebcastLinkMicBattle':
                        this.emit(MessageEvents.LINKMICBATTLE, simplifiedObj);
                        break;
                    case 'WebcastLinkMicArmies':
                        this.emit(MessageEvents.LINKMICARMIES, simplifiedObj);
                        break;
                    case 'WebcastLiveIntroMessage':
                        this.emit(MessageEvents.LIVEINTRO, simplifiedObj);
                        break;
                    case 'WebcastEmoteChatMessage':
                        this.emit(MessageEvents.EMOTE, simplifiedObj);
                        break;
                    case 'WebcastEnvelopeMessage':
                        this.emit(MessageEvents.ENVELOPE, simplifiedObj);
                        break;
                    case 'WebcastSubNotifyMessage':
                        this.emit(MessageEvents.SUBSCRIBE, simplifiedObj);
                        break;
                }
            });
    }

    #handleError(exception, info) {
        if (this.listenerCount(ControlEvents.ERROR) > 0) {
            this.emit(ControlEvents.ERROR, { info, exception });
        }
    }
}

module.exports = {
    WebcastPushConnection,
    signatureProvider: require('./lib/tiktokSignatureProvider'),
    webcastProtobuf: require('./lib/webcastProtobuf.js'),
};
