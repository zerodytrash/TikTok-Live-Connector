import { BinaryWriter } from '@bufbuild/protobuf/wire';
import { DecodedWebcastPushFrame } from '@/types/client';
import { createBaseWebcastPushFrame, deserializeWebSocketMessage } from '@/lib/ws/lib/proto-utils';
import { ClientOptions as WsWebSocketConfig, WebSocket } from 'ws';
import { HeartBeatMessage, WebcastImEnterRoomMessage } from 'tiktok-live-proto/v3';
import { generateUniqId, WebcastWebSocketConfig, WebcastWebSocketConfigDefaults } from '@/lib/ws';
import { WebcastTypedWebSocket } from '@/types/ws';
import { WebSocketDynamicParams } from '@/types/web';

const textEncoder = new TextEncoder();

/**
 * Creates a WebSocket provider function that can be used to create WebcastWebSocketClient instances with dynamic parameters.
 *
 * @param webcastWebSocketConfig The default WebSocket configuration to use for all clients created by this provider. Dynamic parameters will override these defaults.
 * @param wsClientOptions The WebSocket client options to use for all clients created by this provider. These options will be merged with any dynamic parameters provided when creating a client.
 *
 */
export function createWebSocketProvider(
    webcastWebSocketConfig: WebcastWebSocketConfigDefaults,
    wsClientOptions?: WsWebSocketConfig
) {

    return (dynamicParams: WebSocketDynamicParams) => {
        const mergedConfig: WebcastWebSocketConfig = {
            ...webcastWebSocketConfig,
            ...dynamicParams
        };

        return new WebcastWebSocketClient(mergedConfig, wsClientOptions);
    };

}

export default class WebcastWebSocketClient extends (WebSocket as WebcastTypedWebSocket) {

    protected pingInterval: NodeJS.Timeout | null;
    protected seqId: number = 1;
    protected enterUniqueId: string | null = null;
    protected roomId: string;

    protected webcastWsConfig: WebcastWebSocketConfig;

    constructor(
        webcastWebSocketConfig: WebcastWebSocketConfig,
        wsClientOptions?: WsWebSocketConfig
    ) {
        const { headers: wsHeaders, ...reducedWsClientOptions } = wsClientOptions || {};

        // Merge headers & params
        const cleanWebcastConfig = structuredClone(webcastWebSocketConfig);
        cleanWebcastConfig.DEFAULT_WS_CLIENT_PARAMS = { ...cleanWebcastConfig.DEFAULT_WS_CLIENT_PARAMS, ...webcastWebSocketConfig.wsParams };
        cleanWebcastConfig.DEFAULT_WS_CLIENT_HEADERS = { ...cleanWebcastConfig.DEFAULT_WS_CLIENT_HEADERS, ...wsHeaders, ...webcastWebSocketConfig.wsHeaders };

        const webSocketUrl = webcastWebSocketConfig.baseUrl + '?'
            + `${new URLSearchParams(cleanWebcastConfig.DEFAULT_WS_CLIENT_PARAMS)}`
            + `${cleanWebcastConfig.DEFAULT_WS_CLIENT_PARAMS_APPEND_PARAMETER}`;

        super(
            webSocketUrl,
            {

                headers: cleanWebcastConfig.DEFAULT_WS_CLIENT_HEADERS,

                // Host is the TikTok host
                host: cleanWebcastConfig.TIKTOK_HOST_WS,

                ...reducedWsClientOptions,
                autoPong: false
            }
        );

        this.webcastWsConfig = cleanWebcastConfig;
        this.pingInterval = null;
        this.on('message', this.onMessage.bind(this));
        this.on('close', this.onDisconnect.bind(this));
    }

    public get open(): boolean {
        return this.readyState === WebSocket.OPEN;
    }

    /**
     * Send a message to the WebSocket server
     * @param data The message to send
     * @returns True if the message was sent, false otherwise
     */
    public sendBytes(data: Uint8Array): boolean {
        if (this.open) {
            super.send(Buffer.from(data));
            return true;
        }
        return false;
    }

    protected onDisconnect() {

        if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }

        this.pingInterval = null;
        this.seqId = 1;
    }

    /**
     * Handle incoming messages
     * @param message The incoming WebSocket message (type => Buffer)
     * @protected
     */
    protected async onMessage(message: Buffer) {

        // Emit WebSocket data
        this.emit('webSocketData', message);

        //  If the message is binary, decode it
        try {
            const decodedContainer: DecodedWebcastPushFrame = await deserializeWebSocketMessage(message);

            // If the message has a decoded protoMessageFetchResult, emit it
            if (decodedContainer.protoMessageFetchResult) {

                // If it needs an ack, send the ack
                if (decodedContainer.protoMessageFetchResult.needAck) {
                    this.sendAck(decodedContainer);
                }

                this.emit('protoMessageFetchResult', decodedContainer.protoMessageFetchResult);
            }

            // If it's a room enter, emit
            if (decodedContainer.payloadType === 'im_enter_room_resp') {
                this.emit('imEnteredRoom', decodedContainer);
            }

        } catch (err) {
            this.emit('messageDecodingFailed', err);
        }

    }

    /**
     * Static Keep-Alive ping
     */
    protected sendHeartbeat() {

        // Create the heartbeat
        const hb = HeartBeatMessage.encode(
            {
                roomId: this.webcastWsConfig.roomId,
                sendPacketSeqId: String(this.seqId)
            }
        );

        // Wrap it in the WebcastPushFrame
        const webcastPushFrame: BinaryWriter = createBaseWebcastPushFrame(
            {
                payloadEncoding: 'pb',
                payloadType: 'hb',
                payload: Buffer.from(hb.finish()),
                service: undefined,
                method: undefined,
                headers: []
            }
        );

        this.sendBytes(Buffer.from(webcastPushFrame.finish()));
        this.seqId++;
    }

    /**
     * Switch to a different TikTok LIVE room while connected to the WebSocket
     *
     * @param roomId The room ID to switch to
     */
    public switchRooms(roomId: string): void {
        this.seqId = 1;

        // nextLong(1, Long.MAX_VALUE) to prevent cross-room bleeding (client generates, server echoes back)
        // via Android APK
        this.enterUniqueId = generateUniqId();

        const imEnterRoomMessage: BinaryWriter = WebcastImEnterRoomMessage.encode(
            {
                roomId: roomId,
                roomTag: '',
                liveRegion: '',
                liveId: '12', // Static value for all streams (via decompiled APK)
                identity: 'audience',
                cursor: '',
                accountType: '0',
                enterUniqueId: this.enterUniqueId,
                filterWelcomeMsg: '0',
                isAnchorContinueKeepMsg: false
            }
        );

        const webcastPushFrame: BinaryWriter = createBaseWebcastPushFrame(
            {
                payloadEncoding: 'pb',
                payloadType: 'im_enter_room',
                payload: Buffer.from(imEnterRoomMessage.finish())
            }
        );

        this.sendBytes(Buffer.from(webcastPushFrame.finish()));

        // For mobile compatibility, we should only do the ping heartbeat AFTER connecting to a room
        // For reference, payload_handler_hb (1000) is the close code if you don't
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
        }

        this.pingInterval = setInterval(() => this.sendHeartbeat(), this.webcastWsConfig.DEFAULT_WS_PING_INTERVAL);
    }


    /**
     * Acknowledge the message was received
     */
    protected sendAck({ logId, protoMessageFetchResult }: DecodedWebcastPushFrame): void {

        // Always send an ACK for the message
        if (!logId) {
            return;
        }

        if (!protoMessageFetchResult?.internalExt) {
            if (!process.env.DISABLE_ACK_LOG_WARNING) {
                console.error('No internalExt found for message that needs ACK, skipping ACK');
            }
            return;
        }

        const webcastPushFrame: BinaryWriter = createBaseWebcastPushFrame(
            {
                logId: logId,
                payloadEncoding: 'pb',
                payloadType: 'ack',
                payload: Buffer.from(textEncoder.encode(protoMessageFetchResult.internalExt))
            }
        );

        this.sendBytes(Buffer.from(webcastPushFrame.finish()));
    }

}

