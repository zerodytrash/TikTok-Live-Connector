import * as tikTokSchema from './tiktok-schema';
import { MessageFns, WebcastResponse, WebcastWebsocketMessage } from './tiktok-schema';
import { AxiosRequestConfig } from 'axios';
import TikTokSigner from '@/lib/web/lib/tiktok-signer';

export type WebcastPushConnectionOptions = {
    processInitialData: boolean;
    fetchRoomInfoOnConnect: boolean;
    enableExtendedGiftInfo: boolean;
    enableWebsocketUpgrade: boolean;
    enableRequestPolling: boolean;
    requestPollingIntervalMs: number;
    sessionId: string | null;
    clientParams: Record<string, string>;
    requestHeaders: {};
    websocketHeaders: {};
    requestOptions: {};
    websocketOptions: {};
    signProviderOptions: {}
    authenticateWs: boolean;
    preferredAgentIds: string[];
    connectWithUniqueId: boolean;
    logFetchFallbackErrors: boolean;

    // Override the default websocket provider
    signedWebSocketProvider?: (props: FetchSignedWebSocketParams) => Promise<WebcastResponse>
}


export type RoomInfo = Record<string, any> & { status: number }
export type RoomGiftInfo = any;

export type FetchSignedWebSocketParams = {
    roomId?: string;
    uniqueId?: string;
    preferredAgentIds?: string[];
    sessionId?: string;
}


export type WebcastHttpClientConfig = {
    customHeaders: Record<string, string>;
    axiosOptions: AxiosRequestConfig;
    clientParams: Record<string, string>;
    authenticateWs?: boolean;
    webSigner?: TikTokSigner;
}

export interface WebcastPushConnectionWebSocketParams extends Record<string, any> {
    compress?: string;
}


export type DecodedWebcastWebsocketMessage = WebcastWebsocketMessage & {
    webcastResponse?: any;
}


export interface IWebcastConfig extends Record<string, any> {
    TIKTOK_HOST_WEB: string;
    TIKTOK_HOST_WEBCAST: string;
    TIKTOK_HTTP_ORIGIN: string;
    DEFAULT_HTTP_CLIENT_PARAMS: Record<string, any>;
    DEFAULT_WS_CLIENT_PARAMS: Record<string, any>;
    DEFAULT_REQUEST_HEADERS: Record<string, any> & {
        'User-Agent': string;
    };
    WEBCAST_VERSION_CODE: string;
}

export interface IWebcastDeserializeConfig {
    skipMessageTypes: string[];
}

type ExtractMessageType<T> = T extends MessageFns<infer U> ? U : never;

// Messages
export type WebcastMessage = {
    [K in keyof typeof tikTokSchema as ExtractMessageType<typeof tikTokSchema[K]> extends never ? never : K]:
    ExtractMessageType<typeof tikTokSchema[K]>;
};

// Top-Level Messages
export type WebcastEventMessage = {
    [K in keyof WebcastMessage as K extends `Webcast${string}` ? K : never]: WebcastMessage[K];
};

declare module '@/types/tiktok-schema' {
    export interface Message {
        decodedData?: WebcastEventMessage[keyof WebcastEventMessage];
    }
}


export type WebcastWsEvent =
    string
    | 'webcastResponse'
    | 'unknownResponse'
    | 'messageDecodingFailed'
    | 'connect'
    | 'connectFailed'
    | 'httpResponse';


export type WebcastHttpClientRequestParams = Omit<Omit<AxiosRequestConfig, 'url'>, 'baseURL'> & {
    host: string;
    path: string;
    params?: Record<string, string>;
    signRequest: boolean;
};


