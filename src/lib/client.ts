import {
    AlreadyConnectedError,
    AlreadyConnectingError,
    ExtractRoomIdError,
    FetchIsLiveError,
    InvalidResponseError,
    UserOfflineError
} from '@/types/errors';

import TypedEventEmitter from 'typed-emitter';
import { EventEmitter } from 'node:events';
import { ControlAction, WebcastControlMessage, WebcastResponse } from '@/types/tiktok-schema';
import WebcastWsClient from '@/lib/ws/lib/ws-client';
import Config from '@/lib/config';
import { RoomGiftInfo, RoomInfo, WebcastPushConnectionOptions } from '@/types';
import { validateAndNormalizeUniqueId } from '@/lib/utilities';
import { RoomInfoResponse, WebcastWebClient } from '@/lib/web';
import TikTokSigner from '@/lib/web/lib/tiktok-signer';
import {
    ConnectState,
    ControlEvent,
    Event,
    EventMap,
    WebcastEventMap,
    WebcastPushConnectionState
} from '@/types/events';


export class WebcastPushConnection extends (EventEmitter as new () => TypedEventEmitter<EventMap>) {

    // Public properties
    public webClient: WebcastWebClient;
    public wsClient: WebcastWsClient | null = null;

    // Protected properties
    protected _roomInfo: RoomInfo | null = null;
    protected _availableGifts: Record<any, any> | null = null;
    protected _connectState: ConnectState = ConnectState.DISCONNECTED;
    public readonly options: WebcastPushConnectionOptions;

    /**
     * Create a new WebcastPushConnection instance
     * @param {string} uniqueId TikTok username (from URL)
     * @param {object} [options] Connection options
     * @param {boolean} [options[].authenticateWs=false] Authenticate the WebSocket connection using the session ID from the "sessionid" cookie
     * @param {boolean} [options[].processInitialData=true] Process the initital data which includes messages of the last minutes
     * @param {boolean} [options[].fetchRoomInfoOnConnect=false] Fetch the room info (room status, streamer info, etc.) on connect (will be returned when calling connect())
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
     * @param {string[]} [options[].preferredAgentIds=[]] Preferred agent IDs to use for the WebSocket connection. If not specified, the default agent IDs will be used.
     * @param {boolean} [options[].connectWithUniqueId=false] Connect to the live stream using the unique ID instead of the room ID. If `true`, the room ID will be fetched from the TikTok API.
     * @param {boolean} [options[].logFetchFallbackErrors=false] Log errors when falling back to the API or Euler source
     * @param {function} [options[].signedWebSocketProvider] Custom function to fetch the signed WebSocket URL. If not specified, the default function will be used.
     * @param {TikTokSigner} [signer] TikTok Signer instance. If not provided, a new instance will be created using the provided options
     */
    constructor(
        public readonly uniqueId: string,
        options?: Partial<WebcastPushConnectionOptions>,
        public readonly signer?: TikTokSigner
    ) {
        super();

        this.uniqueId = validateAndNormalizeUniqueId(uniqueId);


        // Assign the options
        this.options = {
            preferredAgentIds: [],
            connectWithUniqueId: false,
            processInitialData: true,
            fetchRoomInfoOnConnect: false,
            enableExtendedGiftInfo: false,
            enableWebsocketUpgrade: true,
            enableRequestPolling: true,
            requestPollingIntervalMs: 1000,
            sessionId: null,
            clientParams: {},
            requestHeaders: {},
            websocketHeaders: {},
            requestOptions: {},
            websocketOptions: {},
            signProviderOptions: {},
            authenticateWs: false,
            signedWebSocketProvider: undefined,
            logFetchFallbackErrors: false,
            ...options
        };

        this.webClient = new WebcastWebClient(
            {
                customHeaders: this.options?.requestHeaders || {},
                axiosOptions: this.options?.requestOptions,
                clientParams: this.options?.clientParams || {},
                authenticateWs: this.options?.authenticateWs || false
            },
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
                    this.emit(ControlEvent.CONNECTED, this.getState());
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
        if (!this.options.connectWithUniqueId || this.options.fetchRoomInfoOnConnect || this.options.enableExtendedGiftInfo) {
            console.log('~!!', !this.options.connectWithUniqueId, this.options.fetchRoomInfoOnConnect, this.options.enableExtendedGiftInfo);
            this.clientParams.room_id = roomId || this.clientParams.room_id || await this.fetchRoomId();
        }

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

        // <Required> Fetch initial room info. Let the user specify their own backend for signing, if they don't want to use Euler
        const webcastResponse: WebcastResponse = await (this.options.signedWebSocketProvider || this.webClient.fetchSignedWebSocketFromEuler)(
            {
                roomId: (roomId || !this.options.connectWithUniqueId) ? this.clientParams.room_id : undefined,
                uniqueId: this.options.connectWithUniqueId ? this.uniqueId : undefined,
                preferredAgentIds: this.options.preferredAgentIds,
                sessionId: this.options.authenticateWs && this.options.sessionId
            }
        );

        // <Optional> Process the initial data
        if (this.options?.processInitialData) {
            await this.processWebcastResponse(webcastResponse);
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
        this.emit(ControlEvent.WSCONNECTED, this.wsClient);

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
        this.emit(ControlEvent.DISCONNECTED);
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
    public async fetchRoomId(): Promise<string> {
        let errors: any[] = [];

        // Method 1
        try {
            const roomInfo = await this.webClient.fetchRoomInfoFromHtml({ uniqueId: this.uniqueId });
            const roomId = roomInfo.liveRoomUserInfo.liveRoom.roomId;
            if (!roomId) throw new Error('Failed to extract roomId from HTML.');
        } catch (ex) {
            this.options.logFetchFallbackErrors && console.error('Failed to retrieve roomId from main page, falling back to API source...');
            errors.push(ex);
        }

        // Method 2 (API Fallback)
        try {
            const roomData = await this.webClient.fetchRoomInfoFromApiLive({ uniqueId: this.uniqueId });
            this.webClient.roomId = roomData.data.user.roomId;
        } catch (err) {
            this.options.logFetchFallbackErrors && console.error('Failed to retrieve roomId from API source, falling back to Euler source...');
            errors.push(err);
        }

        // Method 3 (Euler Fallback)
        try {
            await this.webClient.fetchRoomIdFromEuler({ uniqueId: this.uniqueId });
        } catch (err) {
            errors.push(err);
            throw new ExtractRoomIdError(errors, `Failed to retrieve room_id from all sources. ${err.message}`);
        }

        return this.roomId;

    }

    public async fetchIsLive(): Promise<boolean> {
        const errors: any[] = [];
        const isOnline = (status: number) => status !== 4;

        // Method 1 (HTML)
        try {
            const roomInfo = await this.webClient.fetchRoomInfoFromHtml({ uniqueId: this.uniqueId });
            if (roomInfo?.liveRoomUserInfo?.liveRoom?.status === undefined) throw new Error('Failed to extract status from HTML.');
            return isOnline(roomInfo?.liveRoomUserInfo?.liveRoom?.status);
        } catch (ex) {
            this.options.logFetchFallbackErrors && console.error('Failed to retrieve room info from main page, falling back to API source...', ex);
            errors.push(ex);
        }

        // Method 2 (API)
        try {
            const roomData = await this.webClient.fetchRoomInfoFromApiLive({ uniqueId: this.uniqueId });
            if (roomData?.data?.liveRoom?.status === undefined) throw new Error('Failed to extract status from API.');
            return isOnline(roomData?.data?.liveRoom?.status);
        } catch (err) {
            this.options.logFetchFallbackErrors && console.error('Failed to retrieve room info from API source, falling back to Euler source...', err);
            errors.push(err);
        }

        // Method 3 (Euler)
        try {
            const roomData = await this.webClient.fetchRoomIdFromEuler({ uniqueId: this.uniqueId });
            if (roomData.code !== 200) throw new Error('Failed to extract status from Euler.');
            return roomData.is_live;
        } catch (err) {
            this.options.logFetchFallbackErrors && console.error('Failed to retrieve room info from Euler source...', err);
            errors.push(err);
            throw new FetchIsLiveError(errors, `Failed to retrieve room_id from all sources. ${err.message}`);
        }

    }

    /**
     * Wait until the streamer is live
     * @param seconds Number of seconds to wait before checking if the streamer is live again
     */
    public async waitUntilLive(seconds: number = 60): Promise<void> {
        seconds = Math.max(30, seconds);

        return new Promise(async (resolve) => {
            const fetchIsLive = async () => {
                const isLive = await this.fetchIsLive();

                if (isLive) {
                    clearInterval(interval);
                    resolve();
                }
            };

            const interval = setInterval(async () => fetchIsLive(), seconds * 1000);
            await fetchIsLive();
        });

    }

    /**
     * Get the current room info (including streamer info, room status and statistics)
     * @returns Promise that will be resolved when the room info has been retrieved from the API
     */
    public async fetchRoomInfo(): Promise<RoomInfoResponse> {
        if (!this.webClient.roomId) await this.fetchRoomId();
        this._roomInfo = await this.webClient.fetchRoomInfo();
        return this._roomInfo;
    }

    /**
     * Get the available gifts in the current room
     * @returns Promise that will be resolved when the available gifts have been retrieved from the API
     */
    public async fetchAvailableGifts(): Promise<RoomGiftInfo> {
        try {
            let response = await this.webClient.getJsonObjectFromWebcastApi('/gift/list/', this.clientParams);
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

    protected async processWebcastResponse(webcastResponse: WebcastResponse): Promise<void> {

        // Emit Raw Data
        webcastResponse.messages.forEach((
            message) => this.emit(ControlEvent.RAW_DATA, message.type, message.binary)
        );

        // Process and emit decoded data depending on the message type
        for (let message of webcastResponse.messages) {
            const messageData = message.decodedData || {} as any;

            // Emit a decoded data event
            this.emit(
                ControlEvent.DECODEDDATA,
                message.type, message.decodedData || {},
                message.binary
            );

            // Attempt to get it from the map
            const basicEvent = WebcastEventMap[message.type];
            if (basicEvent) {
                this.emit(basicEvent, messageData);
                return;
            }

            // Handle custom events
            switch (message.type) {
                case 'WebcastControlMessage':
                    const controlMessage = messageData as WebcastControlMessage;
                    if (controlMessage.action === ControlAction.CONTROL_ACTION_STREAM_SUSPENDED || controlMessage.action === ControlAction.CONTROL_ACTION_STREAM_ENDED) {
                        this.emit(Event.STREAM_END, { action: controlMessage.action });
                        await this.disconnect();
                    }
                    break;
                case 'WebcastGiftMessage':
                    // Add extended gift info if option enabled
                    if (Array.isArray(this.availableGifts) && messageData.giftId) {
                        messageData.extendedGiftInfo = this.availableGifts.find((x) => x.id === messageData.giftId);
                    }
                    this.emit(Event.GIFT, messageData);
                    break;
                case 'WebcastSocialMessage':
                    this.emit(Event.SOCIAL, messageData);
                    if (messageData.displayType?.includes('follow')) {
                        this.emit(Event.FOLLOW, messageData);
                    }
                    if (messageData.displayType?.includes('share')) {
                        this.emit(Event.SHARE, messageData);
                    }
                    break;
            }

        }


    }

    /**
     * Handle the error event
     *
     * @param exception Exception object
     * @param info Additional information about the error
     * @protected
     */
    protected handleError(exception: Error, info: string): void {
        if (this.listenerCount(ControlEvent.ERROR) < 1) {
            return;
        }

        this.emit(ControlEvent.ERROR, { info, exception });
    }

}


