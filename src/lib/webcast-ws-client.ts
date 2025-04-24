import { client as WebSocket, connection as WebSocketConnection, Message as WebSocketMessage } from 'websocket';
import * as http from 'node:http';
import { BinaryWriter } from '@bufbuild/protobuf/wire';
import {
    DecodedWebcastWebsocketMessage,
    WebcastPushConnectionClientParams,
    WebcastPushConnectionWebSocketParams,
    WebcastWsEvent
} from '@/types';
import { WebcastWebsocketAck } from '@/types/tiktok-schema';
import { deserializeWebSocketMessage } from '@/lib/modules/protobuf-utilities';
import Config from '@/lib/modules/config';

export default class WebcastWSClient extends WebSocket {
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

    public override emit(eventName: WebcastWsEvent, ...args: any[]): boolean {
        return super.emit(eventName, ...args);
    }

    public override on(event: WebcastWsEvent, cb: any): this {
        return super.on(event as any, cb);
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

    public close() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
    }
}

