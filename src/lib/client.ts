import {
    AlreadyConnectedError,
    AlreadyConnectingError,
    ExtractRoomIdError,
    InvalidResponseError,
    UserOfflineError
} from '@/types/errors';

import TypedEventEmitter from 'typed-emitter';
import { EventEmitter } from 'node:events';
import { WebcastResponse } from '@/types/tiktok-schema';
import WebcastWsClient from '@/lib/ws/lib/ws-client';
import Config from '@/lib/config';
import { RoomGiftInfo, RoomInfo, WebcastPushConnectionOptions } from '@/types';
import { validateAndNormalizeUniqueId } from '@/lib/utilities';
import { RoomInfoResponse, WebcastWebClient } from '@/lib/web';
import TikTokSigner from '@/lib/web/lib/tiktok-signer';
import { ConnectState, ControlEvents, EventMap, WebcastPushConnectionState } from '@/types/events';


export class WebcastPushConnection extends (EventEmitter as new () => TypedEventEmitter<EventMap>) {

    // Public properties
    public webClient: WebcastWebClient;
    public wsClient: WebcastWsClient | null = null;

    // Protected properties
    protected _roomInfo: RoomInfo | null = null;
    protected _availableGifts: Record<any, any> | null = null;
    protected _connectState: ConnectState = ConnectState.DISCONNECTED;

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
     * @param {object} [options[].signProviderOptions={}] Custom request options for the TikTok signing server. Here you can specify a `host`, `params`, and `headers`.
     * @param {TikTokSigner} [signer] TikTok Signer instance. If not provided, a new instance will be created using the provided options
     */
    constructor(
        public readonly uniqueId: string,
        private readonly options?: WebcastPushConnectionOptions,
        public readonly signer?: TikTokSigner
    ) {
        super();

        this.uniqueId = validateAndNormalizeUniqueId(uniqueId);

        this.webClient = new WebcastWebClient(
            this.options?.requestHeaders || {},
            this.options?.requestOptions || {},
            this.options?.clientParams || {},
            signer
        );

        this.webClient.cookieJar.sessionId = this.options?.sessionId;
        this.setDisconnected();
    }

    /**
     * Set the connection state to disconnected
     * @protected
     */
    protected setDisconnected() {
        this._connectState = ConnectState.DISCONNECTED;
        this._roomInfo = null;

        // Reset the client parameters
        this.clientParams.cursor = '';
        this.clientParams.roomId = '';
        this.clientParams.internal_ext = '';
    }

    /**
     * Get the current Room Info
     */
    public get roomInfo(): RoomInfoResponse {
        return this._roomInfo;
    }

    /**
     * Get the available gifts
     */
    public get availableGifts() {
        return this._availableGifts;
    }

    /**
     * Get the current connection state
     */
    public get isConnecting() {
        return this._connectState === ConnectState.CONNECTING;
    }

    /**
     * Check if the connection is established
     */
    public get isConnected() {
        return this._connectState === ConnectState.CONNECTED;
    }

    /**
     * Get the current client parameters
     */
    public get clientParams() {
        return this.webClient.clientParams;
    }

    /**
     * Get the current room ID
     */
    public get roomId(): string {
        return this.clientParams.room_id;
    }

    /**
     * Connects to the live stream of the specified streamer
     * @param roomId Room ID to connect to. If not specified, the room ID will be retrieved from the TikTok API
     */
    async connect(roomId?: string): Promise<void> {

        switch (this._connectState) {
            case ConnectState.CONNECTED:
                throw new AlreadyConnectedError('Already connected!');

            case ConnectState.CONNECTING:
                throw new AlreadyConnectingError('Already connecting!');

            default:
            case ConnectState.DISCONNECTED:
                try {
                    this._connectState = ConnectState.CONNECTING;
                    await this._connect(roomId);
                    this._connectState = ConnectState.CONNECTED;
                    this.emit(ControlEvents.CONNECTED, this.getState());
                } catch (err) {
                    this._connectState = ConnectState.DISCONNECTED;
                    this.handleError(err, 'Error while connecting');
                    throw err;
                }
        }
    }

    /**
     * Connects to the live stream of the specified streamer
     *
     * @param roomId Room ID to connect to. If not specified, the room ID will be retrieved from the TikTok API
     * @protected
     */
    protected async _connect(roomId?: string): Promise<void> {

        // First we set the Room ID
        this.clientParams.room_id = roomId || this.clientParams.room_id || await this.fetchRoomId();
        // <Optional> Fetch Room Info
        if (this.options?.fetchRoomInfoOnConnect) {
            this._roomInfo = await this.fetchRoomInfo();

            if (this._roomInfo.status === 4) {
                throw new UserOfflineError('LIVE has ended');
            }

        }

        // <Optional> Fetch Gift Info
        if (this.options?.enableExtendedGiftInfo) {
            this._availableGifts = await this.fetchAvailableGifts();
        }

        // <Required> Fetch initial room info
        // TODO switch to fetch, not sign
        let webcastResponse: WebcastResponse = await this.webClient.getDeserializedObjectFromWebcastApi('im/fetch/', this.clientParams, 'WebcastResponse', true);

        // <Optional> Process the initial data
        if (this.options?.processInitialData) {
            this.processWebcastResponse(webcastResponse);
        }

        // If we didn't receive a cursor
        if (!webcastResponse.cursor) {
            throw new InvalidResponseError('Missing cursor in initial fetch response.');
        }

        // Update client parameters
        this.clientParams.cursor = webcastResponse.cursor;
        this.clientParams.internal_ext = webcastResponse.internalExt;

        // Connect to the WebSocket
        const wsParams: Record<string, any> = { compress: 'gzip' };
        webcastResponse.wsParams.forEach((wsParam) => wsParams[wsParam.name] = wsParam.value);
        this.wsClient = await this.setupWebsocket(webcastResponse.wsUrl, wsParams);
        this.emit(ControlEvents.WSCONNECTED, this.wsClient);

    }

    /**
     * Disconnects the connection to the live stream
     */
    async disconnect(): Promise<void> {

        if (!this.isConnected) {
            return;
        }

        await this.wsClient?.close();
        this.setDisconnected();
        this.emit(ControlEvents.DISCONNECTED);
    }

    /**
     * Get the current connection state including the cached room info and all available gifts
     * (if `enableExtendedGiftInfo` option enabled)
     */
    public getState(): WebcastPushConnectionState {
        return {
            isConnected: this.isConnected,
            roomId: this.roomId,
            roomInfo: this.roomInfo,
            availableGifts: this.availableGifts
        };
    }


    /**
     * Sends a chat message into the current live room using the provided session cookie
     * @param content Message Content
     * @param  sessionId The "sessionid" cookie value from your TikTok Website if not provided via the constructor options
     * @returns Promise that will be resolved when the chat message has been submitted to the API
     */
    async sendMessage(content: string, sessionId?: string) {
        this.webClient.cookieJar.sessionId = sessionId || this.webClient.cookieJar.sessionId;
        this.webClient.sendRoomChat({ content });
    }

    /**
     * Fetch the room ID from the TikTok API
     *
     * @protected
     */
    protected async fetchRoomId(): Promise<string> {

        // Method 1
        try {
            await this.webClient.roomIdFromHtml({ uniqueId: this.uniqueId });
        } catch (ex) {
            console.error('Failed to retrieve roomId from main page, falling back to API source...', ex);
        }

        // Method 2 (Fallback)
        try {
            await this.webClient.roomIdFromApi({ uniqueId: this.uniqueId });
        } catch (err) {
            throw new ExtractRoomIdError(`Failed to retrieve room_id from page source. ${err.message}`);
        }

        return this.roomId;

    }

    /**
     * Get the current room info (including streamer info, room status and statistics)
     * @returns Promise that will be resolved when the room info has been retrieved from the API
     */
    public async fetchRoomInfo(): Promise<RoomInfoResponse> {
        if (!this.webClient.roomId) await this.fetchRoomId();
        this._roomInfo = await this.webClient.roomInfo();
        return this._roomInfo;
    }

    /**
     * Get the available gifts in the current room
     * @returns Promise that will be resolved when the available gifts have been retrieved from the API
     */
    public async fetchAvailableGifts(): Promise<RoomGiftInfo> {
        try {
            let response = await this.webClient.getJsonObjectFromWebcastApi('gift/list/', this.clientParams);
            return response.data.gifts;
        } catch (err) {
            throw new InvalidResponseError(`Failed to fetch available gifts. ${err.message}`, err);
        }
    }

    /**
     * Setup the WebSocket connection
     *
     * @param wsUrl WebSocket URL
     * @param wsParams WebSocket parameters
     * @returns Promise that will be resolved when the WebSocket connection is established
     * @protected
     */
    protected async setupWebsocket(wsUrl: string, wsParams: Record<string, string>): Promise<WebcastWsClient> {
        return new Promise<WebcastWsClient>((resolve, reject) => {

            // Instantiate the client
            const wsClient = new WebcastWsClient(
                wsUrl,
                this.webClient.cookieJar,
                { ...this.clientParams, ...Config.DEFAULT_WS_CLIENT_PARAMS, ...wsParams },
                this.options?.websocketHeaders,
                this.options?.websocketOptions
            );

            // Handle the connection
            wsClient.on('connect', (ws) => {
                ws.on('error', (e: any) => this.handleError(e, 'WebSocket Error'));
                ws.on('close', () => this.disconnect());
                resolve(wsClient);
            });

            wsClient.on('connectFailed', (err: any) => reject(`Websocket connection failed, ${err}`));
            wsClient.on('webcastResponse', (msg: WebcastResponse) => this.processWebcastResponse(msg));
            wsClient.on('messageDecodingFailed', (err: any) => this.handleError(err, 'Websocket message decoding failed'));
            setTimeout(() => reject('Websocket not responding'), 20_000);
        });
    }

    protected processWebcastResponse(webcastResponse: WebcastResponse) {
        console.log('Received...', webcastResponse);
        // Emit raw (protobuf encoded) data for a use case specific processing
    }

    /**
     * Handle the error event
     *
     * @param exception Exception object
     * @param info Additional information about the error
     * @protected
     */
    protected handleError(exception: Error, info: string): void {
        if (this.listenerCount(ControlEvents.ERROR) < 1) {
            return;
        }

        this.emit(ControlEvents.ERROR, { info, exception });
    }

}


