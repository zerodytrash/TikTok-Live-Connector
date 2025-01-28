const Config = require('./webcastConfig.js');
const websocket = require('websocket');
const { deserializeWebsocketMessage, serializeMessage } = require('./webcastProtobuf.js');

class WebcastWebsocket extends websocket.client {
    constructor(wsUrl, cookieJar, clientParams, wsParams, customHeaders, websocketOptions) {
        super();
        this.pingInterval = null;
        this.connection = null;
        this.wsParams = { ...clientParams, ...wsParams };
        this.wsUrlWithParams = `${wsUrl}?${new URLSearchParams(this.wsParams)}&version_code=${Config.WEBCAST_VERSION_CODE}`;
        this.wsHeaders = {
            Cookie: cookieJar.getCookieString(),
            ...(customHeaders || {}),
        };

        this.#handleEvents();
        this.connect(this.wsUrlWithParams, '', Config.TIKTOK_URL_WEB, this.wsHeaders, websocketOptions);
    }

    #handleEvents() {
        this.on('connect', (wsConnection) => {
            this.connection = wsConnection;
            this.pingInterval = setInterval(() => this.#sendPing(), 10000);

            wsConnection.on('message', (message) => {
                if (message.type === 'binary') {
                    this.#handleMessage(message);
                }
            });

            wsConnection.on('close', () => {
                clearInterval(this.pingInterval);
            });
        });
    }

    async #handleMessage(message) {
        try {
            let decodedContainer = await deserializeWebsocketMessage(message.binaryData);

            if (decodedContainer.id > 0) {
                this.#sendAck(decodedContainer.id);
            }

            // Emit 'WebcastResponse' from ws message container if decoding success
            if (typeof decodedContainer.webcastResponse === 'object') {
                this.emit('webcastResponse', decodedContainer.webcastResponse);
            }
        } catch (err) {
            this.emit('messageDecodingFailed', err);
        }
    }

    #sendPing() {
        // Send static connection alive ping
        this.connection.sendBytes(Buffer.from('3A026862', 'hex'));
    }

    #sendAck(id) {
        let ackMsg = serializeMessage('WebcastWebsocketAck', { type: 'ack', id });
        this.connection.sendBytes(ackMsg);
    }
}

module.exports = WebcastWebsocket;
