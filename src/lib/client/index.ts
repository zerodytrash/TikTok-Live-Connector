import {
    AlreadyConnectedError,
    AlreadyConnectingError,
    ConnectTimeoutError,
    InvalidResponseError,
    UserOfflineError
} from '@/types/errors';
import { EventEmitter } from 'node:events';
import WebcastWebSocketClient, { createWebSocketProvider } from '@/lib/ws/lib/ws-client';
import {
    DecodedData,
    DecodedWebcastPushFrame,
    RoomGiftInfo,
    RoomInfo,
    TikTokLiveConnectionBundledAuthOptions,
    TikTokLiveConnectionMutableOptions,
    TikTokLiveConstructorConnectionOptions,
    WebSocketParams
} from '@/types/client';
import { validateAndNormalizeUniqueId } from '@/lib/ws/lib/proto-utils';
import {
    ConnectState,
    ControlEvent,
    TikTokLiveConnectionState,
    WebcastEvent,
    WebcastEventMap,
    WebcastTypedClient
} from '@/types/events';
import { ControlAction, EnvelopeBusinessType, ProtoMessageFetchResult } from 'tiktok-live-proto/v3';
import EulerStreamApiClient, { WebcastRoomChatRouteResponse } from '@eulerstream/euler-api-sdk';
import WebcastHttpClient from '@/lib/web/lib/http-client';
import { EulerFetchRoute, RoomInfoResponse } from '@/lib/web/routes';
import { HandleError } from '@/lib/client/utilities';
import { getRandomPresets, getWebConfig, RouteConfig } from '@/lib/web/config';
import WebcastCookieJar from '@/lib/web/lib/cookie-jar';
import { GetWebConfigParams, WebSocketDynamicParams } from '@/types/web';
import { RoomGiftsResponse } from '@/lib/web/routes/base/fetch-room-gifts';
import { getWebSocketConfigDefaults } from '@/lib/ws';
import { SignConfig } from '@/lib/web/routes/euler/config';

export { HandleError } from './utilities';

export class TikTokLiveConnection extends (EventEmitter as WebcastTypedClient) {

    // Mutable options
    public readonly options: TikTokLiveConnectionMutableOptions;

    // Managed references
    protected _webClient: WebcastHttpClient;
    protected _wsClientInstance: WebcastWebSocketClient | null = null;
    protected _wsClientProvider: (params: WebSocketDynamicParams) => WebcastWebSocketClient;
    protected _devicePresets: GetWebConfigParams;
    protected _roomInfo: RoomInfo | null = null;
    protected _availableGifts: RoomGiftsResponse | null = null;
    protected _connectState: ConnectState = ConnectState.DISCONNECTED;

    /**
     * Create a new TikTokLiveConnection instance.
     *
     * @param uniqueId TikTok username (with or without leading `@`, or a full `https://www.tiktok.com/@user/live` URL).
     * @param options Connection options.
     * @param options.signApiKey Optional Euler Stream API key. If provided, written to the global `SignConfig.apiKey` before the underlying Euler client is created. Ignored when `eulerApiInstance` is also passed.
     * @param options.eulerApiInstance Optional pre-built Euler Stream API client. Takes precedence over `signApiKey`.
     * @param options.session Authenticated session bundle. Pass `session.cookie` to seed the cookie jar with `sessionid` and `tt-target-idc`, and/or `session.oAuthToken` to send an OAuth token to the sign server. Required when `authenticateWs` or `useMobile` is true.
     * @param options.authenticateWs Forward the session cookies / OAuth token to the sign server so the WebSocket is authenticated. Defaults to false.
     * @param options.useMobile Use the mobile WebSocket flow. Implies `authenticateWs: true` and requires `session.cookie`. Defaults to false.
     * @param options.processInitialData Decode and emit the message batch returned in the initial sign response. Defaults to true.
     * @param options.fetchRoomInfoOnConnect Fetch room info during connect, throwing `UserOfflineError` if the streamer is not live. Defaults to true.
     * @param options.enableExtendedGiftInfo Fetch the room gift list during connect so `WebcastGiftMessage` events carry an `extendedGiftInfo` field. Defaults to false.
     * @param options.clientPresets Pre-built device, screen, and location presets. Defaults to a freshly randomized set from `getRandomPresets()`.
     * @param options.webClientOptions Extra `got` options applied to the HTTP client (proxy agent, timeouts, etc.). Headers and search params from this object are merged with the defaults; transport-only fields are passed through.
     * @param options.wsClientOptions Extra `ws` options applied to the WebSocket client.
     * @param options.webConfigOverrides Partial overrides for the resolved `WebcastWebConfigDefaults` used by the HTTP client.
     * @param options.wsConfigOverrides Partial overrides for the resolved `WebcastWebSocketConfigDefaults` used by the WebSocket client.
     */
    constructor(
        public readonly uniqueId: string,
        options: TikTokLiveConstructorConnectionOptions
    ) {
        super();

        // Clean the Unique ID
        this.uniqueId = validateAndNormalizeUniqueId(uniqueId);

        // Extract mutable options
        this.options = {
            processInitialData: options.processInitialData ?? true,
            fetchRoomInfoOnConnect: options.fetchRoomInfoOnConnect ?? true,
            enableExtendedGiftInfo: options.enableExtendedGiftInfo ?? false,
            authenticateWs: options.authenticateWs,
            useMobile: options.useMobile
        };

        // Set the API key globally if provided
        if (options.signApiKey) {
            SignConfig.apiKey = options.signApiKey;
        }

        // Generate the webcast config
        this._devicePresets = options.clientPresets ?? getRandomPresets();
        const webcastWebConfig = { ...getWebConfig(this._devicePresets), ...options.webConfigOverrides };

        // Handle passed initial cookie data
        if (options.session?.cookie) {
            webcastWebConfig.DEFAULT_HTTP_CLIENT_HEADERS['Cookie'] = WebcastCookieJar.serializeCookieSessionBundle(
                webcastWebConfig,
                options.session.cookie
            );
        }

        // Instantiate the Web Client
        this._webClient = new WebcastHttpClient(
            webcastWebConfig,
            options.eulerApiInstance,
            options.webClientOptions
        );

        // Handle OAuth Session inclusion
        if (options.session?.oAuthToken) {
            this._webClient.oAuthSessionBundle = options.session.oAuthToken;
        }

        // Generate websocket config
        const webcastWebSocketConfig = { ...getWebSocketConfigDefaults(this._devicePresets), ...options.wsConfigOverrides };

        // Create the client provider, immutable
        this._wsClientProvider = createWebSocketProvider(
            webcastWebSocketConfig,
            options.wsClientOptions
        );

        this.setDisconnected();
    }

    /**
     * Get the current Web Client instance
     */
    public get webClient(): WebcastHttpClient {
        return this._webClient;
    }

    /**
     * Get an instance of the underlying API Client
     */
    public get apiClient(): EulerStreamApiClient {
        return this._webClient.apiClient;
    }

    /**
     * Get the current WebSocket client instance. Will be `null` if not connected.
     */
    public get wsClient(): WebcastWebSocketClient | null {
        return this._wsClientInstance;
    }

    /**
     * Set the connection state to disconnected
     * @protected
     */
    protected setDisconnected() {
        this._connectState = ConnectState.DISCONNECTED;
        this._roomInfo = null;
        this._availableGifts = null;

        // Reset the client parameters
        this.clientParams.cursor = '';
        this.clientParams.room_id = '';
        this.clientParams.internal_ext = '';
    }

    /**
     * Get the current Room Info
     */
    public get roomInfo(): any {
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
            isConnecting: this.isConnecting,
            roomId: this.roomId,
            roomInfo: this.roomInfo,
            availableGifts: this.availableGifts
        };
    }

    /**
     * Connects to the live stream of the specified streamer
     *
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
                    this.setDisconnected();
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
        roomId ||= this.roomId || await this.fetchRoomId();
        this.webClient.roomId = roomId;

        if (this.options?.fetchRoomInfoOnConnect) {
            this._roomInfo = await this.fetchRoomInfo();
            if (this._roomInfo?.data?.status === 4) {
                throw new UserOfflineError('The requested user isn\'t online :(');
            }
        }

        if (this.options?.enableExtendedGiftInfo) {
            this._availableGifts = await this.fetchAvailableGifts();
        }

        let bundledOptions: TikTokLiveConnectionBundledAuthOptions;

        if (this.options.useMobile) {
            const cookieBundle = await this.webClient.cookieJar.getSessionBundle();
            const oauthBundle = this.webClient.oAuthSessionBundle;

            if (!cookieBundle) {
                throw new TypeError('Cookie Bundle could not be found.');
            }

            bundledOptions = {
                useMobile: true,
                authenticateWs: true,
                session: {
                    cookie: cookieBundle,
                    oAuthToken: oauthBundle ?? undefined
                }
            };
        } else {
            bundledOptions = { useMobile: false };
        }

        const {
            fetchResult: protoMessageFetchResult,
            fetchResultCookieHeader,
            fetchResultRoomId
        } = await RouteConfig.fetchSignedWebSocketFromProvider({
            webClient: this._webClient,
            apiClient: this.apiClient,
            roomId: roomId,
            cursor: this.clientParams.cursor,
            ...bundledOptions
        });


        await this.webClient.cookieJar.processSetCookieHeader(fetchResultCookieHeader);

        if (fetchResultRoomId) {
            this.webClient.roomId = roomId = fetchResultRoomId;
        }

        // <Optional> Process the initial data
        if (this.options?.processInitialData) {
            await this.processProtoMessageFetchResult(protoMessageFetchResult);
        }

        // If we didn't receive a cursor
        if (!protoMessageFetchResult.cursor) {
            throw new InvalidResponseError({ routeId: EulerFetchRoute.FETCH_SIGNED_WEBSOCKET }, 'Missing cursor in initial fetch response.');
        }

        // Update client parameters
        this.clientParams.cursor = protoMessageFetchResult.cursor;
        this.clientParams.internal_ext = protoMessageFetchResult.internalExt;

        // Connect to the WebSocket
        const wsParams: WebSocketParams = {
            compress: 'gzip',
            room_id: this.roomId,
            internal_ext: protoMessageFetchResult.internalExt,
            cursor: protoMessageFetchResult.cursor
        };

        // Filter for only defined params, like web does
        for (const [key, value] of Object.entries(protoMessageFetchResult.routeParams || {})) {
            if (value) wsParams[key] = value;
        }

        // Create the WebSocket client
        return this.setupWebsocket(
            protoMessageFetchResult.pushServer,
            wsParams,
            roomId
        );
    }

    /**
     * Disconnects the connection to the live stream
     */
    async disconnect(): Promise<void> {
        const wsClient = this._wsClientInstance;
        if (!this.isConnected || !wsClient) {
            this.setDisconnected();
            return;
        }

        await new Promise<void>((resolve) => {
            const onClose = () => {
                clearTimeout(forceTerminate);
                resolve();
            };
            const forceTerminate = setTimeout(() => {
                wsClient.terminate();
            }, parseInt(process.env.WS_DISCONNECT_TIMEOUT_MS || '2000'));
            wsClient.once('close', onClose);
            wsClient.close();
        });
    }

    /**
     * Fetch the room ID from the TikTok API
     *
     * @param uniqueId Optional unique ID to use instead of the current one
     */
    @HandleError('Failed to retrieve Room ID from all sources.')
    public async fetchRoomId(uniqueId: string = this.uniqueId): Promise<string> {
        this._webClient.roomId = await RouteConfig.fetchRoomIdComposite(
            {
                uniqueId,
                webClient: this.webClient,
                apiClient: this.apiClient
            }
        );
        return this._webClient.roomId;
    }

    /**
     * Fetch whether the streamer is currently live
     */
    @HandleError('Failed to retrieve live status from all sources.')
    public async fetchIsLive(uniqueId: string = this.uniqueId): Promise<boolean> {
        return RouteConfig.fetchIsLiveComposite(
            {
                uniqueId: uniqueId,
                webClient: this.webClient,
                apiClient: this.apiClient
            }
        );
    }

    /**
     * Get the current room info (including streamer info, room status and statistics)
     * @returns Promise that will be resolved when the room info has been retrieved from the API
     */
    @HandleError('Failed to fetch room info.')
    public async fetchRoomInfo(roomId: string = this.roomId): Promise<RoomInfoResponse> {

        if (!roomId) {
            roomId = await this.fetchRoomId();
        }

        this._roomInfo = await RouteConfig.fetchRoomInfo({ roomId: roomId, webClient: this.webClient });
        return this._roomInfo;
    }

    /**
     * Get the available gifts in the current room
     * @returns Promise that will be resolved when the available gifts have been retrieved from the API
     */
    @HandleError('Failed to fetch room gifts.')
    public async fetchAvailableGifts(): Promise<RoomGiftInfo> {
        return RouteConfig.fetchRoomGifts(
            {
                roomId: this.roomId,
                webClient: this.webClient
            }
        );
    }

    /**
     * Send a message to a TikTok LIVE Room
     *
     * @param content Message content to send to the stream
     * @param roomId Target room ID. If not specified, the message will be sent to the currently connected room. Note that a room ID is required to send a message, so if you're not currently connected to a room you must specify a room ID.
     */
    @HandleError('Failed to send message.')
    public async sendMessage(content: string, roomId = this.roomId): Promise<WebcastRoomChatRouteResponse> {

        return RouteConfig.sendRoomChatFromProvider(
            {
                content,
                roomId,
                webClient: this.webClient,
                apiClient: this.apiClient
            }
        );

    }

    /**
     * Set up the WebSocket connection
     *
     * @param wsUrl WebSocket URL
     * @param wsParams WebSocket parameters
     * @param roomId The room ID to connect to with the WebSocket client
     * @returns Promise that will be resolved when the WebSocket connection is established
     * @protected
     */
    protected async setupWebsocket(
        wsUrl: string,
        wsParams: WebSocketParams,
        roomId: string
    ): Promise<void> {

        // Create the WebSocket
        const wsClient = this._wsClientInstance = this._wsClientProvider(
            {
                roomId: roomId,
                baseUrl: wsUrl,
                wsParams: wsParams,
                wsHeaders: {
                    Cookie: await this.webClient.cookieJar.getCookieString()
                }
            }
        );

        // Create the connect promise
        const connectPromise = new Promise<void>((resolve, reject) => {

            const onConnectTimeout = () => {
                // Kill the connection attempt
                this._wsClientInstance?.close(1000);

                if (this._wsClientInstance === wsClient) {
                    this._wsClientInstance = null;
                }

                reject(new ConnectTimeoutError('Timed out whilst connecting to WebSocket'));
            };

            const onConnectError = (err: Error) => {
                if (this._wsClientInstance === wsClient) {
                    this._wsClientInstance = null;
                }
                clearTimeout(connectTimeout);
                reject(err);
            };

            // Note: Fires AFTER the 'error' event, so this is where we deregister events.
            const onConnectClose = () => {
                clearTimeout(connectTimeout);
                wsClient.removeAllListeners();
            };

            const onConnectOpen = () => {
                clearTimeout(connectTimeout);

                wsClient.removeListener('open', onConnectOpen);
                wsClient.removeListener('error', onConnectError);
                wsClient.removeListener('close', onConnectClose);

                // Start piping errors to the error handler
                // Resolve successfully
                resolve();
            };

            const connectTimeout = setTimeout(
                onConnectTimeout,
                parseInt(process.env.WS_CONNECT_TIMEOUT_MS || '20000')
            );

            wsClient.once('error', onConnectError);
            wsClient.once('open', onConnectOpen);
            wsClient.once('close', onConnectClose);

        });

        // Eagerly start piping presumptively to prevent race conditions & handle pre-connect info
        wsClient.on('protoMessageFetchResult', this.processProtoMessageFetchResult.bind(this));
        wsClient.on('imEnteredRoom', (data: DecodedWebcastPushFrame) => this.emit(ControlEvent.ENTER_ROOM, data));
        wsClient.on('webSocketData', (data: Uint8Array) => this.emit(ControlEvent.WEBSOCKET_DATA, data));
        wsClient.on('messageDecodingFailed', (err: any) => this.handleError(err, 'Websocket message decoding failed'));

        // Now wait for the promise
        // If the promise rejects, the below code won't be executed and the error will be handled in the catch block of the connect() method
        await connectPromise;

        // Handle onError when it occurs post-connect
        wsClient.on('error', (e) => {
            this.handleError(e, 'WebSocket Error after connecting');
        });

        // Handle onClose post-connect
        wsClient.on('close', (code, reason) => {
            wsClient.removeAllListeners();

            if (this._wsClientInstance === wsClient) {
                this._wsClientInstance = null;
            }

            this.setDisconnected();
            this.emit(ControlEvent.DISCONNECTED, { code, reason: reason.toString() });
        });

        // Switch into the room officially
        wsClient.switchRooms(roomId);
        this.emit(ControlEvent.WEBSOCKET_CONNECTED, wsClient);

    }

    protected async processProtoMessageFetchResult(protoMessageFetchResult: ProtoMessageFetchResult): Promise<void> {

        for (const message of protoMessageFetchResult.messages) {

            if (!message.decodedData) {
                continue;
            }

            // Emit the decoded data
            this.emit(
                ControlEvent.DECODED_DATA,
                message.method,
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
                if (data.common?.displayText?.key?.includes('follow')) {
                    return this.emit(WebcastEvent.FOLLOW, data);
                }

                if (data.common?.displayText?.key?.includes('share')) {
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
            case 'WebcastBarrageMessage': {
                const displayTypes = [data.content?.key, data.commonBarrageContent?.key]
                    .filter((v): v is string => typeof v === 'string' && v.length > 0)
                    .map((v) => v.toLowerCase());

                if (displayTypes.some((v) => v.includes('ttlive_superfan_commentnotif_superfanjoined'))) {
                    this.emit(WebcastEvent.SUPER_FAN_JOIN, data);
                } else if (displayTypes.some((v) => v.includes('ttlive_superfan'))) {
                    this.emit(WebcastEvent.SUPER_FAN, data);
                }

                return this.emit(WebcastEvent.BARRAGE, data);
            }
            case 'WebcastEnvelopeMessage':
                if (
                    data.common?.displayText?.key?.toLowerCase().includes('ttlive_superfanbox')
                    || (data.envelopeInfo?.businessType as number) === EnvelopeBusinessType.SUPER_FAN_BOX
                ) {
                    this.emit(WebcastEvent.SUPER_FAN_BOX, data);
                }

                return this.emit(WebcastEvent.ENVELOPE, data);
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

    /**
     * Wait until the streamer is live
     *
     * @param seconds Number of seconds to wait before checking if the streamer is live again
     * @param abortSignal Process will keep checking if the streamer is live every `seconds` seconds until the streamer is live or the abort signal is triggered
     *
     */
    public async waitUntilLive(
        seconds: number = 60,
        abortSignal?: AbortSignal
    ): Promise<void> {
        seconds = Math.max(30, seconds);

        return new Promise<void>((resolve, reject) => {

            if (abortSignal?.aborted) {
                return reject(abortSignal.reason);
            }

            let timer: ReturnType<typeof setTimeout> | undefined;

            const cleanup = () => {
                if (timer !== undefined) clearTimeout(timer);
                abortSignal?.removeEventListener('abort', onAbort);
            };

            const onAbort = () => {
                cleanup();
                reject(abortSignal!.reason);
            };

            const check = async () => {
                try {
                    const isLive = await this.fetchIsLive();
                    if (abortSignal?.aborted) return; // abort handler already rejected
                    if (isLive) {
                        cleanup();
                        resolve();
                        return;
                    }
                    timer = setTimeout(check, seconds * 1000);
                } catch (err) {
                    if (abortSignal?.aborted) return;
                    cleanup();
                    reject(err);
                }
            };

            abortSignal?.addEventListener('abort', onAbort, { once: true });
            check();
        });
    }


}
