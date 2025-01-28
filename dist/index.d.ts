/**
 * Wrapper class for TikTok's internal Webcast Push Service
 */
export class WebcastPushConnection extends EventEmitter {
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
    constructor(uniqueId: string, options?: {
        processInitialData?: boolean;
        fetchRoomInfoOnConnect?: boolean;
        enableExtendedGiftInfo?: boolean;
        enableWebsocketUpgrade?: boolean;
        enableRequestPolling?: boolean;
        requestPollingIntervalMs?: number;
        sessionId?: string;
        clientParams?: object;
        requestHeaders?: object;
        websocketHeaders?: object;
        requestOptions?: object;
        websocketOptions?: object;
        signProviderOptions?: object;
    });
    /**
     * Connects to the current live stream room
     * @param {string} [roomId] If you want to connect to a specific roomId. Otherwise the current roomId will be retrieved.
     * @returns {Promise} Promise that will be resolved when the connection is established.
     */
    connect(roomId?: string): Promise<any>;
    /**
     * Disconnects the connection to the live stream
     */
    disconnect(): void;
    /**
     * Get the current connection state including the cached room info and all available gifts (if `enableExtendedGiftInfo` option enabled)
     * @returns {object} current state object
     */
    getState(): object;
    /**
     * Get the current room info (including streamer info, room status and statistics)
     * @returns {Promise} Promise that will be resolved when the room info has been retrieved from the API
     */
    getRoomInfo(): Promise<any>;
    /**
     * Get a list of all available gifts including gift name, image url, diamont cost and a lot of other information
     * @returns {Promise} Promise that will be resolved when all available gifts has been retrieved from the API
     */
    getAvailableGifts(): Promise<any>;
    /**
     * Sends a chat message into the current live room using the provided session cookie
     * @param {string} text Message Content
     * @param {string} [sessionId] The "sessionid" cookie value from your TikTok Website if not provided via the constructor options
     * @returns {Promise} Promise that will be resolved when the chat message has been submitted to the API
     */
    sendMessage(text: string, sessionId?: string): Promise<any>;
    /**
     * Decodes and processes a binary webcast data package that you have received via the `rawData` event (for debugging purposes only)
     * @param {string} messageType
     * @param {Buffer} messageBuffer
     */
    decodeProtobufMessage(messageType: string, messageBuffer: Buffer): Promise<void>;
    #private;
}
import { EventEmitter } from "events";
export declare const signatureProvider: typeof import("./lib/tiktokSignatureProvider");
export declare const webcastProtobuf: typeof import("./lib/webcastProtobuf.js");
//# sourceMappingURL=index.d.ts.map