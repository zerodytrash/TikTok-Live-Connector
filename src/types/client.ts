import * as tikTokSchema from './tiktok-schema';
import { MessageFns, WebcastResponse, WebcastWebsocketMessage } from './tiktok-schema';
import { AxiosRequestConfig } from 'axios';
import * as http from 'node:http';

export type TikTokLiveConnectionOptions = {
    processInitialData: boolean;
    fetchRoomInfoOnConnect: boolean;
    enableExtendedGiftInfo: boolean;
    enableRequestPolling: boolean;
    requestPollingIntervalMs: number;
    sessionId: string | null;
    signApiKey: string | null;
    authenticateWs: boolean;
    preferredAgentIds: string[];
    connectWithUniqueId: boolean;
    disableEulerFallbacks: boolean;

    webClientParams: Record<string, string>;
    webClientHeaders: Record<string, string>;
    webClientOptions: AxiosRequestConfig;

    wsClientHeaders: Record<string, string>;
    wsClientParams: Record<string, string>;
    wsClientOptions: http.RequestOptions;

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
    signApiKey?: string;
}

export interface TikTokLiveConnectionWebSocketParams extends Record<string, any> {
    compress?: string;
}


export type DecodedWebcastWebsocketMessage = WebcastWebsocketMessage & {
    webcastResponse?: any;
}


export interface IWebcastConfig {
    TIKTOK_HOST_WEB: string;
    TIKTOK_HOST_WEBCAST: string;
    TIKTOK_HTTP_ORIGIN: string;

    // HTTP Client Options
    DEFAULT_HTTP_CLIENT_COOKIES: Record<string, string>;
    DEFAULT_HTTP_CLIENT_PARAMS: Record<string, string>;
    DEFAULT_HTTP_CLIENT_OPTIONS: AxiosRequestConfig;
    DEFAULT_WS_CLIENT_PARAMS_APPEND_PARAMETER: string;
    DEFAULT_HTTP_CLIENT_HEADERS: Record<string, string> & {
        'User-Agent': string;
    };

    // WS Client Options
    DEFAULT_WS_CLIENT_PARAMS: Record<string, string>;
    DEFAULT_WS_CLIENT_HEADERS: Record<string, string> & {
        'User-Agent': string;
    };

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


