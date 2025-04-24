import {
    AlreadyConnectedError,
    AlreadyConnectingError,
    ExtractRoomIdError,
    InvalidResponseError,
    InvalidSessionIdError,
    UserOfflineError
} from '@/types/errors';

import { EventEmitter } from 'node:events';
import { ControlEvents, RoomGiftInfo, RoomInfo, WebcastPushConnectionOptions } from '@/types';
import Config from '@/lib/modules/config';
import { getRoomIdFromMainPageHtml, validateAndNormalizeUniqueId } from '@/lib/modules/client-utilities';
import WebcastHttpClient from '@/lib/webcast-http-client';
import WebcastWsClient from '@/lib/webcast-ws-client';
import { WebcastResponse } from '@/types/tiktok-schema';
import { deserializeMessage, deserializeWebSocketMessage } from '@/lib/modules/protobuf-utilities';


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
    SUBSCRIBE: 'subscribe'
};

const CustomEvents = {
    FOLLOW: 'follow',
    SHARE: 'share'
};

export enum ConnectState {
    DISCONNECTED = 'DISCONNECTED',
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED'
}


export class WebcastPushConnection extends EventEmitter {

    // Default Options
    protected options: WebcastPushConnectionOptions = {
        processInitialData: true,
        fetchRoomInfoOnConnect: true,
        enableExtendedGiftInfo: false,
        enableWebsocketUpgrade: true,
        enableRequestPolling: true,
        requestPollingIntervalMs: 1000,
        sessionId: null,
        clientParams: {room_id: '', cursor: '', internal_ext: ''},
        requestHeaders: {},
        websocketHeaders: Config.DEFAULT_REQUEST_HEADERS,
        requestOptions: {},
        websocketOptions: {},
        signProviderOptions: {}
    };

    public readonly uniqueStreamerId: string;
    public readonly httpClient: WebcastHttpClient;
    public wsClient: WebcastWsClient | null = null;
    protected _roomInfo: RoomInfo | null = null;
    protected _availableGifts: Record<any, any> | null = null;
    protected _connectState: ConnectState = ConnectState.DISCONNECTED;

    public get roomInfo() {
        return this._roomInfo;
    }

    public get availableGifts() {
        return this._availableGifts;
    }

    public get isConnecting() {
        return this._connectState === ConnectState.CONNECTING;
    }

    public get isConnected() {
        return this._connectState === ConnectState.CONNECTED;
    }

    public get clientParams() {
        return this.httpClient.clientParams;
    }

    public get roomId(): string {
        return this.clientParams.room_id;
    }

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
     */
    constructor(
        uniqueId: string,
        options?: WebcastPushConnectionOptions
    ) {
        super();
        this.options = Object.assign(this.options, options || {});
        this.uniqueStreamerId = validateAndNormalizeUniqueId(uniqueId);

        this.httpClient = new WebcastHttpClient(
            this.options.requestHeaders,
            this.options.requestOptions,
            this.options.sessionId,
            this.options.signProviderOptions,
            this.options.clientParams
        );

        this.setDisconnected();
    }

    protected setDisconnected() {
        this._connectState = ConnectState.DISCONNECTED;
        this._roomInfo = null;
        this.clientParams.cursor = '';
        this.clientParams.internal_ext = '';
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

    protected async _connect(roomId?: string): Promise<void> {

        // First we set the Room ID
        this.clientParams.room_id = roomId || this.clientParams.room_id || await this.retrieveRoomId();

        // <Optional> Fetch Room Info
        if (this.options.fetchRoomInfoOnConnect) {
            this._roomInfo = await this.fetchRoomInfo();

            if (this._roomInfo.status === 4) {
                throw new UserOfflineError('LIVE has ended');
            }

        }

        // <Optional> Fetch Gift Info
        if (this.options.enableExtendedGiftInfo) {
            this._availableGifts = await this.fetchAvailableGifts();
        }

        // <Required> Fetch initial room info
        let webcastResponse: WebcastResponse = await this.httpClient.getDeserializedObjectFromWebcastApi('im/fetch/', this.clientParams, 'WebcastResponse', true);
        let upgradeToWsOffered = !!webcastResponse.wsUrl;

        // <Optional> Process the initial data
        if (this.options.processInitialData) {
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
    disconnect(): void {

        if (!this.isConnected) {
            return;
        }

        this.wsClient?.close();
        this.setDisconnected();
        this.emit(ControlEvents.DISCONNECTED);
    }

    /**
     * Get the current connection state including the cached room info and all available gifts (if `enableExtendedGiftInfo` option enabled)
     */
    public getState() {
        return {
            isConnected: this.isConnected,
            roomId: this.roomId,
            roomInfo: this.roomInfo,
            availableGifts: this.availableGifts
        };
    }

    /**
     * Get the current room info (including streamer info, room status and statistics)
     * @returns {Promise} Promise that will be resolved when the room info has been retrieved from the API
     */
    async getRoomInfo() {
        // Retrieve current room_id if not connected
        if (!this.isConnected) {
            await this.retrieveRoomId();
        }

        await this.fetchRoomInfo();

        return this.roomInfo;
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
            this.options.sessionId = sessionId;
        }

        if (!this.options.sessionId) {
            throw new InvalidSessionIdError('Missing SessionId. Please provide your current SessionId to use this feature.');
        }

        try {
            // Retrieve current room_id if not connected
            if (!this.isConnected) {
                await this.retrieveRoomId();
            }

            // Add the session cookie to the CookieJar
            this.httpClient.setSessionId(this.options.sessionId);

            // Submit the chat request
            let requestParams = { ...this.clientParams, content: text };
            let response = await this.httpClient.postFormDataToWebcastApi('room/chat/', requestParams, null);

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
                this.processWebcastResponse(decodedWebcastResponse);
                break;
            }

            case 'WebcastWebsocketMessage': {
                let decodedWebcastWebsocketMessage = await deserializeWebSocketMessage(messageBuffer);
                if (typeof decodedWebcastWebsocketMessage.webcastResponse === 'object') {
                    this.processWebcastResponse(decodedWebcastWebsocketMessage.webcastResponse);
                }
                break;
            }

            default: {
                let webcastMessage = deserializeMessage(messageType, messageBuffer);
                this.processWebcastResponse({
                    messages: [
                        {
                            decodedData: webcastMessage,
                            type: messageType
                        }
                    ]
                });
            }
        }
    }

    protected retrieveRoomId(): Promise<string> {
        try {
            let mainPageHtml = await this.httpClient.getMainPage(`@${this.uniqueStreamerId}/live`);

            try {
                let roomId = getRoomIdFromMainPageHtml(mainPageHtml);
                this.clientParams.room_id = roomId;
            } catch (err) {
                // Use fallback method
                let roomData = await this.httpClient.getJsonObjectFromTiktokApi('api-live/user/room/', {
                    ...this.clientParams,
                    uniqueId: this.uniqueStreamerId,
                    sourceType: 54
                });

                if (roomData.statusCode) throw new InvalidResponseError(`API Error ${roomData.statusCode} (${roomData.message || 'Unknown Error'})`, undefined);

                this.roomId = roomData.data.user.roomId;
                this.clientParams.room_id = roomData.data.user.roomId;
            }
        } catch (err) {
            throw new ExtractRoomIdError(`Failed to retrieve room_id from page source. ${err.message}`);
        }
    }

    public async fetchRoomInfo(): Promise<RoomInfo> {
        try {
            return await this.httpClient.getJsonObjectFromWebcastApi('room/info/', this.clientParams);
        } catch (err) {
            throw new InvalidResponseError(`Failed to fetch room info. ${err.message}`, err);
        }
    }

    public async fetchAvailableGifts(): Promise<RoomGiftInfo> {
        try {
            let response = await this.httpClient.getJsonObjectFromWebcastApi('gift/list/', this.clientParams);
            return response.data.gifts;
        } catch (err) {
            throw new InvalidResponseError(`Failed to fetch available gifts. ${err.message}`, err);
        }
    }


    protected async setupWebsocket(wsUrl: string, wsParams: Record<string, string>): Promise<WebcastWsClient> {
        return new Promise<WebcastWsClient>((resolve, reject) => {

            // Instantiate the client
            const wsClient = new WebcastWsClient(
                wsUrl,
                this.httpClient.cookieJar,
                this.clientParams,
                wsParams,
                this.options.websocketHeaders,
                this.options.websocketOptions
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
                        if (Array.isArray(this.availableGifts) && simplifiedObj.giftId) {
                            simplifiedObj.extendedGiftInfo = this.availableGifts.find((x) => x.id === simplifiedObj.giftId);
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

    protected handleError(exception: Error, info: string): void {
        if (this.listenerCount(ControlEvents.ERROR) > 0) {
            this.emit(ControlEvents.ERROR, { info, exception });
        }
    }

}
