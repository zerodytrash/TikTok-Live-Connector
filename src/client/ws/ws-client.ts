import {
    DecodedWebcastWebsocketMessage,
    WebcastPushConnectionClientParams,
    WebcastPushConnectionWebSocketParams
} from '../../types';
import { client as WebSocket, connection as WebSocketConnection, Message as WebSocketMessage } from 'websocket';
import * as http from 'node:http';
import { deserializeWebSocketMessage } from './proto-utils';
import { WebcastWebsocketAck } from '../../.proto/tiktokSchema';
import { BinaryWriter } from '@bufbuild/protobuf/wire';
import Config from '../web/config';

export default class WsClient extends WebSocket {
    protected pingInterval: NodeJS.Timeout | null;
    protected connection: WebSocketConnection | null;
    protected wsParams: WebcastPushConnectionClientParams & WebcastPushConnectionWebSocketParams;
    protected wsHeaders: Record<string, string>;
    protected wsUrlWithParams: string;

    constructor(
        wsUrl: string,
        cookieJar: any,
        clientParams: WebcastPushConnectionClientParams,
        wsParams: WebcastPushConnectionWebSocketParams,
        customHeaders: Record<string, string>,
        webSocketOptions: http.RequestOptions,
        protected webSocketPingIntervalMs: number = 10000
    ) {

        super();

        this.pingInterval = null;
        this.connection = null;
        this.wsParams = { ...clientParams, ...wsParams };
        this.wsUrlWithParams = `${wsUrl}?${new URLSearchParams(this.wsParams)}&version_code=${Config.WEBCAST_VERSION_CODE}`;
        this.wsHeaders = { Cookie: cookieJar.getCookieString(), ...(customHeaders || {}) };

        this.on('connect', this.onConnect.bind(this));
        this.connect(this.wsUrlWithParams, '', Config.TIKTOK_URL_WEB, this.wsHeaders, webSocketOptions);
    }

    protected onConnect(wsConnection: WebSocketConnection) {
        this.connection = wsConnection;
        this.pingInterval = setInterval(() => this.sendPing(), this.webSocketPingIntervalMs);
        this.connection.on('message', this.onMessage.bind(this));
        this.connection.on('close', this.onDisconnect.bind(this));
    }

    protected onDisconnect() {
        clearInterval(this.pingInterval);
        this.pingInterval = null;
        this.connection = null;
    }

    protected async onMessage(message: WebSocketMessage) {
        if (message.type !== 'binary') {
            return;
        }

        try {
            let decodedContainer: DecodedWebcastWebsocketMessage = await deserializeWebSocketMessage(message.binaryData);

            if (decodedContainer.id != null) {
                this.sendAck(decodedContainer.id);
            }

            if (decodedContainer.webcastResponse != null) {
                this.emit('webcastResponse', decodedContainer.webcastResponse);
            }

        } catch (err) {
            this.emit('messageDecodingFailed', err);
        }

    }

    /**
     * Static Keep-Alive ping
     */
    protected sendPing() {
        this.connection.sendBytes(Buffer.from('3A026862', 'hex'));
    }

    /**
     * Message Acknowledgement
     * @param id The message id to acknowledge
     */
    protected sendAck(id: number) {
        const ackMessage: BinaryWriter = WebcastWebsocketAck.encode({ type: 'ack', id });
        this.connection.sendBytes(Buffer.from(ackMessage.finish()));
    }
}

