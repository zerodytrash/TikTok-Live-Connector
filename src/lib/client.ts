import {
    AlreadyConnectedError,
    AlreadyConnectingError,
    FetchIsLiveError,
    InvalidResponseError,
    UserOfflineError
} from '@/types/errors';

import TypedEventEmitter from 'typed-emitter';
import { EventEmitter } from 'node:events';
import TikTokWsClient from '@/lib/ws/lib/ws-client';
import Config from '@/lib/config';
import { DecodedData, RoomGiftInfo, RoomInfo, TikTokLiveConnectionOptions, WebSocketParams } from '@/types/client';
import { validateAndNormalizeUniqueId } from '@/lib/utilities';
import { RoomInfoResponse, TikTokWebClient } from '@/lib/web';
import { EulerSigner } from '@/lib/web/lib/tiktok-signer';
import {
    ClientEventMap,
    ConnectState,
    ControlEvent,
    TikTokLiveConnectionState,
    WebcastEvent,
    WebcastEventMap
} from '@/types/events';
import { IWebcastRoomChatPayload, IWebcastRoomChatRouteResponse } from '@eulerstream/euler-api-sdk';
import { ProtoMessageFetchResult } from '@/types';
import { ControlAction } from '@/types/tiktok/enums';


export class TikTokLiveConnection extends (EventEmitter as new () => TypedEventEmitter<ClientEventMap>) {

    // Public properties
    public webClient: TikTokWebClient;
    public wsClient: TikTokWsClient | null = null;

    // Protected properties
    protected _roomInfo: RoomInfo | null = null;
    protected _availableGifts: Record<any, any> | null = null;
    protected _connectState: ConnectState = ConnectState.DISCONNECTED;
    public readonly options: TikTokLiveConnectionOptions;

    /**
     * Create a new TikTokLiveConnection instance
     * @param {string} uniqueId TikTok username (from URL)
     * @param {object} [options] Connection options
     * @param {boolean} [options[].authenticateWs=false] Authenticate the WebSocket connection using the session ID from the "sessionid" cookie
     * @param {boolean} [options[].processInitialData=true] Process the initital data which includes messages of the last minutes
     * @param {boolean} [options[].fetchRoomInfoOnConnect=false] Fetch the room info (room status, streamer info, etc.) on connect (will be returned when calling connect())
     * @param {boolean} [options[].enableExtendedGiftInfo=false] Enable this option to get extended information on 'gift' events like gift name and cost
     * @param {boolean} [options[].enableRequestPolling=true] Use request polling if no WebSocket upgrade is offered. If `false` an exception will be thrown if TikTok does not offer a WebSocket upgrade.
     * @param {number} [options[].requestPollingIntervalMs=1000] Request polling interval if WebSocket is not used
     * @param {string} [options[].sessionId=null] The session ID from the "sessionid" cookie is required if you want to send automated messages in the chat.
     * @param {object} [options[].webClientParams={}] Custom client params for Webcast API
     * @param {object} [options[].webClientHeaders={}] Custom request headers for axios
     * @param {object} [options[].websocketHeaders={}] Custom request headers for websocket.client
     * @param {object} [options[].webClientOptions={}] Custom request options for axios. Here you can specify an `httpsAgent` to use a proxy and a `timeout` value for example.
     * @param {object} [options[].websocketOptions={}] Custom request options for websocket.client. Here you can specify an `agent` to use a proxy and a `timeout` value for example.
     * @param {string[]} [options[].preferredAgentIds=[]] Preferred agent IDs to use for the WebSocket connection. If not specified, the default agent IDs will be used.
     * @param {boolean} [options[].connectWithUniqueId=false] Connect to the live stream using the unique ID instead of the room ID. If `true`, the room ID will be fetched from the TikTok API.
     * @param {boolean} [options[].logFetchFallbackErrors=false] Log errors when falling back to the API or Euler source
     * @param {function} [options[].signedWebSocketProvider] Custom function to fetch the signed WebSocket URL. If not specified, the default function will be used.
     * @param {EulerSigner} [signer] TikTok Signer instance. If not provided, a new instance will be created using the provided options
     */
    constructor(
        public readonly uniqueId: string,
        options?: Partial<TikTokLiveConnectionOptions>,
        public readonly signer?: EulerSigner
    ) {
        super();
        this.uniqueId = validateAndNormalizeUniqueId(uniqueId);

        // Assign the options
        this.options = {
            preferredAgentIds: [],
            connectWithUniqueId: false,
            processInitialData: true,
            fetchRoomInfoOnConnect: true,
            enableExtendedGiftInfo: false,
            enableRequestPolling: true,
            requestPollingIntervalMs: 1000,
            sessionId: null,
            ttTargetIdc: null,
            signApiKey: null,
            disableEulerFallbacks: false,

            // Override Http client params
            webClientParams: {},
            webClientHeaders: {},
            webClientOptions: {},

            // Override WebSocket params
            wsClientHeaders: {},
            wsClientOptions: {},
            wsClientParams: {},

            authenticateWs: false,
            signedWebSocketProvider: undefined,
            ...options
        };

        this.webClient = new TikTokWebClient(
            {
                customHeaders: this.options?.webClientHeaders || {},
                axiosOptions: this.options?.webClientOptions,
                clientParams: this.options?.webClientParams || {},
                authenticateWs: this.options?.authenticateWs || false,
                signApiKey: this.options?.signApiKey ?? undefined
            },
            signer
        );

        this.webClient.cookieJar.setSession(this.options.sessionId, this.options.ttTargetIdc);
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
        this.clientParams.room_id = '';
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
        return this.webClient.roomId;
    }


    /**
     * Get the current connection state including the cached room info and all available gifts
     * (if `enableExtendedGiftInfo` option enabled)
     */
    public get state(): TikTokLiveConnectionState {
        return {
            isConnected: this.isConnected,
            roomId: this.roomId,
            roomInfo: this.roomInfo,
            availableGifts: this.availableGifts
        };
    }

    /**
     * Connects to the live stream of the specified streamer
     * @param roomId Room ID to connect to. If not specified, the room ID will be retrieved from the TikTok API
     * @returns The current connection state
     */
    async connect(roomId?: string): Promise<TikTokLiveConnectionState> {

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
                    this.emit(ControlEvent.CONNECTED, this.state);
                    return this.state;
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
            this.clientParams.room_id = roomId || this.clientParams.room_id || await this.fetchRoomId();
        }

        // <Optional> Fetch Room Info
        if (this.options?.fetchRoomInfoOnConnect) {
            this._roomInfo = await this.fetchRoomInfo();
            if (this._roomInfo.data.status === 4) {
                throw new UserOfflineError('The requested user isn\'t online :(');
            }
        }

        // <Optional> Fetch Gift Info
        if (this.options?.enableExtendedGiftInfo) {
            this._availableGifts = await this.fetchAvailableGifts();
        }

        // <Required> Fetch initial room info. Let the user specify their own backend for signing, if they don't want to use Euler
        const protoMessageFetchResult: ProtoMessageFetchResult = await (this.options.signedWebSocketProvider || this.webClient.fetchSignedWebSocketFromEuler)(
            {
                roomId: (roomId || !this.options.connectWithUniqueId) ? this.roomId : undefined,
                uniqueId: this.options.connectWithUniqueId ? this.uniqueId : undefined,
                preferredAgentIds: this.options.preferredAgentIds,
                sessionId: this.options.authenticateWs ? this.options.sessionId : undefined
            }
        );

        // <Optional> Process the initial data
        if (this.options?.processInitialData) {
            await this.processProtoMessageFetchResult(protoMessageFetchResult);
        }

        // If we didn't receive a cursor
        if (!protoMessageFetchResult.cursor) {
            throw new InvalidResponseError('Missing cursor in initial fetch response.');
        }

        // Update client parameters
        this.clientParams.cursor = protoMessageFetchResult.cursor;
        this.clientParams.internal_ext = protoMessageFetchResult.internalExt;

        // Connect to the WebSocket
        const wsParams: WebSocketParams = {
            compress: 'gzip',
            room_id: this.roomId,
            internal_ext: protoMessageFetchResult.internalExt,
            cursor: protoMessageFetchResult.cursor,
            ...protoMessageFetchResult.wsParams
        };

        this.wsClient = await this.setupWebsocket(protoMessageFetchResult.wsUrl, wsParams);
        this.emit(ControlEvent.WEBSOCKET_CONNECTED, this.wsClient);

    }

    /**
     * Disconnects the connection to the live stream
     */
    async disconnect(): Promise<void> {
        if (this.isConnected) {
            await this.wsClient?.close();
        }
    }

    /**
     * Fetch the room ID from the TikTok API
     * @param uniqueId Optional unique ID to use instead of the current one
     */
    public async fetchRoomId(uniqueId?: string): Promise<string> {
        let errors: any[] = [];
        uniqueId ||= this.uniqueId;

        // Method 1
        try {
            const roomInfo = await this.webClient.fetchRoomInfoFromHtml({ uniqueId: uniqueId });
            const roomId = roomInfo.liveRoomUserInfo.liveRoom.roomId;
            if (!roomId) throw new Error('Failed to extract Room ID from HTML.');
            return roomId;
        } catch (ex) {
            this.handleError(ex, 'Failed to retrieve Room ID from main page, falling back to API source...');
            errors.push(ex);
        }

        // Method 2 (API Fallback)
        try {
            const roomData = await this.webClient.fetchRoomInfoFromApiLive({ uniqueId: uniqueId });
            const roomId = roomData?.data?.user?.roomId;
            if (!roomId) throw new Error('Failed to extract Room ID from API.');
            return roomId;
        } catch (ex) {
            this.handleError(ex, 'Failed to retrieve Room ID from API source, falling back to Euler source...');
            errors.push(ex);
        }

        // Method 3 (Euler Fallback)
        if (!this.options.disableEulerFallbacks) {
            try {
                const response = await this.webClient.fetchRoomIdFromEuler({ uniqueId: uniqueId });
                if (!response.ok) throw new Error(`Failed to retrieve Room ID from Euler due to an error: ${response.message}`);
                if (!response.room_id) throw new Error('Failed to extract Room ID from Euler.');
                return response.room_id;
            } catch (err) {
                this.handleError(err, 'Failed to retrieve Room ID from Euler source, no more sources available...');
                errors.push(err);
            }
        }

        // If we reach this point, it means all sources have failed
        const errMsg: string = 'Failed to retrieve Room ID from all sources.';
        const failErr = new FetchIsLiveError(errors, errMsg);
        this.handleError(failErr, errMsg);
        throw failErr;
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
            this.handleError(ex, 'Failed to retrieve room info for live status from main page, falling back to API source...');
            errors.push(ex);
        }

        // Method 2 (API)
        try {
            const roomData = await this.webClient.fetchRoomInfoFromApiLive({ uniqueId: this.uniqueId });
            if (roomData?.data?.liveRoom?.status === undefined) throw new Error('Failed to extract status from API.');
            return isOnline(roomData?.data?.liveRoom?.status);
        } catch (err) {
            this.handleError(err, 'Failed to retrieve room info for live status from API source, falling back to Euler source...');
            errors.push(err);
        }

        // Method 3 (Euler)
        if (!this.options.disableEulerFallbacks) {
            try {
                const roomData = await this.webClient.fetchRoomIdFromEuler({ uniqueId: this.uniqueId });
                if (roomData.code !== 200) throw new Error('Failed to extract status from Euler.');
                return roomData.is_live;
            } catch (err) {
                this.handleError(err, 'Failed to retrieve room info for live status from Euler source, no more sources available...');
                errors.push(err);
            }
        }

        // If we reach this point, it means all sources have failed
        const errMsg: string = 'Failed to retrieve live status rom all sources.';
        const failErr = new FetchIsLiveError(errors, errMsg);
        this.handleError(failErr, errMsg);
        throw failErr;

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
            let response = await this.webClient.getJsonObjectFromWebcastApi('gift/list/', this.clientParams);
            return response.data.gifts;
        } catch (err) {
            throw new InvalidResponseError(`Failed to fetch available gifts. ${err.message}`, err);
        }
    }

    /**
     * Send a message to a TikTok LIVE Room
     *
     * @param content Message content to send to the stream
     * @param options Optional parameters for the message (incl. parameter overrides)
     */
    public async sendMessage(content: string, options?: Partial<Omit<IWebcastRoomChatPayload, 'content'>>): Promise<IWebcastRoomChatRouteResponse> {

        const roomId = options?.roomId || this.roomId;
        if (!roomId) {
            throw new Error('Room ID is required to send a message.');
        }

        const sessionId = options?.sessionId || this.webClient.cookieJar.sessionId;
        if (!sessionId) {
            throw new Error('Session ID is required to send a message.');
        }

        const ttTargetIdc = options?.ttTargetIdc || this.webClient.cookieJar.ttTargetIdc;
        if (!ttTargetIdc) {
            throw new Error('ttTargetIdc is required to send a message.');
        }

        return this.webClient.sendRoomChatFromEuler(
            {
                content: content,
                roomId: roomId,
                sessionId: sessionId,
                ttTargetIdc: ttTargetIdc
            }
        );
    }

    /**
     * Set up the WebSocket connection
     *
     * @param wsUrl WebSocket URL
     * @param wsParams WebSocket parameters
     * @returns Promise that will be resolved when the WebSocket connection is established
     * @protected
     */
    protected async setupWebsocket(wsUrl: string, wsParams: WebSocketParams): Promise<TikTokWsClient> {
        return new Promise<TikTokWsClient>((resolve, reject) => {

            // Instantiate the client
            const wsClient = new TikTokWsClient(
                wsUrl,
                this.webClient.cookieJar,
                { ...Config.DEFAULT_WS_CLIENT_PARAMS, ...this.options.wsClientParams, ...wsParams },
                { ...Config.DEFAULT_WS_CLIENT_HEADERS, ...this.options?.wsClientHeaders },
                this.options?.wsClientOptions
            );

            // Handle the connection
            wsClient.on('connect', (ws) => {
                clearTimeout(connectTimeout);
                ws.on('error', (e: any) => this.handleError(e, 'WebSocket Error'));
                ws.on('close', () => {
                    this.setDisconnected();
                    this.emit(ControlEvent.DISCONNECTED);
                });
                resolve(wsClient);
            });

            wsClient.on('connectFailed', (err: any) => reject(`Websocket connection failed, ${err}`));
            wsClient.on('protoMessageFetchResult', this.processProtoMessageFetchResult.bind(this));
            wsClient.on('webSocketData', (data: Uint8Array) => this.emit(ControlEvent.WEBSOCKET_DATA, data));
            wsClient.on('messageDecodingFailed', (err: any) => this.handleError(err, 'Websocket message decoding failed'));
            const connectTimeout = setTimeout(() => reject('Websocket not responding'), 20_000);
        });
    }

    protected async processProtoMessageFetchResult(protoMessageFetchResult: ProtoMessageFetchResult): Promise<void> {

        for (const message of protoMessageFetchResult.messages) {

            if (!message.decodedData) {
                continue;
            }

            // Emit the decoded data
            this.emit(
                ControlEvent.DECODED_DATA,
                message.type,
                message.decodedData,
                message.payload
            );

            // Process & emit decoded data depending on the message type
            try {
                await this.processDecodedData(message.decodedData);
            } catch (ex) {
                this.handleError(ex, 'Failed to process decoded data');
            }

        }

    }

    protected async processDecodedData({ data, type }: DecodedData): Promise<boolean | void> {

        // Emit a decoded data event
        switch (type) {

            case 'WebcastSocialMessage':

                if (data.common.displayText.displayType?.includes('follow')) {
                    return this.emit(WebcastEvent.FOLLOW, data);
                }

                if (data.common.displayText.displayType?.includes('share')) {
                    return this.emit(WebcastEvent.SHARE, data);
                }

                // First, emit the raw social message
                return this.emit(WebcastEvent.SOCIAL, data);

            case 'WebcastControlMessage':

                // Send raw message
                this.emit(WebcastEvent.CONTROL_MESSAGE, data);

                if (data.action === ControlAction.CONTROL_ACTION_STREAM_ENDED || data.action === ControlAction.CONTROL_ACTION_STREAM_SUSPENDED) {
                    this.emit(WebcastEvent.STREAM_END, { action: data.action });
                    await this.disconnect();
                }

                return;

            case 'WebcastGiftMessage':

                // Add extended gift info if available
                if (Array.isArray(this.availableGifts) && data.giftId) {
                    data.extendedGiftInfo = this.availableGifts.find((x) => x.id === data.giftId);
                }

                return this.emit(WebcastEvent.GIFT, data);
            default:

                // Handle all other events
                const basicEvent = WebcastEventMap[type];
                return basicEvent && this.emit(basicEvent, data);

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


