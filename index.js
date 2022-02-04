const { EventEmitter } = require('events');

const TikTokHttpClient = require('./components/tiktokHttpClient.js');
const WebcastWebsocket = require('./components/webcastWebsocket.js');
const { getRoomIdFromMainPageResponse, validateAndNormalizeUniqueId } = require('./components/tiktokUtils.js');
const { simplifyObject } = require('./components/webcastDataConverter.js');

const Config = require('./components/webcastConfig.js');

const events = {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    ERROR: 'error',
    CHAT: 'chat',
    MEMBER: 'member',
    GIFT: 'gift',
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
     * @param {boolean} [options[].processInitialData=true] Process the initital data which includes messages of the last minutes.
     * @param {boolean} [options[].enableWebsocketUpgrade=true] Use WebSocket instead of request polling if TikTok offers it.
     * @param {number} [options[].requestPollingIntervalMs=1000] Request polling interval if WebSocket is not used.
     */
    constructor(uniqueId, options) {
        super();

        this.#uniqueStreamerId = validateAndNormalizeUniqueId(uniqueId);

        this.#clientParams = Object.assign({}, Config.DEFAULT_CLIENT_PARAMS);
        this.#httpClient = new TikTokHttpClient();

        this.#setUnconnected();
        this.#setOptions(options || {});
    }

    #setUnconnected() {
        this.#isConnecting = false;
        this.#isConnected = false;
        this.#isPollingEnabled = false;
        this.#isWsUpgradeDone = false;
        this.#clientParams.cursor = "";
    }

    #setOptions(options) {
        this.#options = Object.assign({
            // Default
            processInitialData: true,
            enableWebsocketUpgrade: true,
            requestPollingIntervalMs: 1000
        }, options);
    }

    /**
     * Connect to the current live stream room
     * @returns {Promise} Promise that will be resolved when the connection is established.
     */
    connect() {
        return new Promise(async (resolve, reject) => {

            if (this.#isConnecting) {
                reject("Already connecting!");
                return;
            }

            if (this.#isConnected) {
                reject("Already connected!");
                return;
            }

            this.#isConnecting = true;

            try {

                await this.#retrieveRoomId();
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
                this.#handleError(err, 'Error while connecting');
                reject(err);
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
        let roomId = getRoomIdFromMainPageResponse(mainPageHtml);

        this.#roomId = roomId;
        this.#clientParams.room_id = roomId;
    }

    async #startFetchRoomPolling() {
        this.#isPollingEnabled = true;

        let sleepMs = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        while(this.#isPollingEnabled) {
            try {
                await this.#fetchRoomData();
            } catch (err) {
                this.#handleError(err, 'Error while fetching webcast data via request polling');
            }

            await sleepMs(this.#options.requestPollingIntervalMs);
        }
    }

    async #fetchRoomData(isInitial) {

        let webcastResponse = await this.#httpClient.getDeserializedObjectFromWebcastApi("im/fetch/", this.#clientParams, "WebcastResponse");
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
            this.#handleError(err, "Upgrade to websocket failed. Using request polling...");
        }
    }

    async #setupWebsocket(wsUrl, wsParams) {
        return new Promise((resolve, reject) => {

            this.#websocket = new WebcastWebsocket(wsUrl, this.#httpClient.cookieJar, this.#clientParams, wsParams);

            this.#websocket.on('connect', wsConnection => {

                resolve();

                wsConnection.on('error', err => this.#handleError(err, "Websocket Error"));
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
            switch (message.type) {
                case 'WebcastControlMessage':
                    if (message.decodedData.action === 3) {
                        this.emit(events.STREAMEND);
                        this.disconnect();
                    }
                    break;
                case 'WebcastChatMessage':
                    this.emit(events.CHAT, simplifyObject(message.decodedData));
                    break;
                case 'WebcastMemberMessage':
                    this.emit(events.MEMBER, simplifyObject(message.decodedData));
                    break;
                case 'WebcastGiftMessage':
                    this.emit(events.GIFT, simplifyObject(message.decodedData));
                    break;
            }
        });
    }

    #handleError(exception, info) {
        this.emit(events.ERROR, { info, exception });
    }
}

module.exports = {
    WebcastPushConnection
}