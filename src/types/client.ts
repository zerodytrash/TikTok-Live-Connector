import * as tikTokSchema from './tiktok/webcast';
import { MessageFns, ProtoMessageFetchResult, WebcastPushFrame } from './tiktok/webcast';
import { AxiosRequestConfig } from 'axios';
import * as http from 'node:http';

export type TikTokLiveConnectionOptions = {
    processInitialData: boolean;
    fetchRoomInfoOnConnect: boolean;
    enableExtendedGiftInfo: boolean;
    enableRequestPolling: boolean;
    requestPollingIntervalMs: number;
    sessionId: string | null;
    ttTargetIdc: string | null;
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
    signedWebSocketProvider?: (props: FetchSignedWebSocketParams) => Promise<ProtoMessageFetchResult>
}


export type RoomInfo = Record<string, any> & { data: { status: number } }
export type RoomGiftInfo = any;

export type FetchSignedWebSocketParams = {
    roomId?: string;
    uniqueId?: string;
    preferredAgentIds?: string[];
    ttTargetIdc?: string;
    sessionId?: string;
}


export type WebcastHttpClientConfig = {
    customHeaders: Record<string, string>;
    axiosOptions: AxiosRequestConfig;
    clientParams: Record<string, string>;
    authenticateWs?: boolean;
    signApiKey?: string;
}

export type DecodedWebcastPushFrame = WebcastPushFrame & {
    protoMessageFetchResult?: ProtoMessageFetchResult;
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


type ExtractMessageType<T> = T extends MessageFns<infer U> ? U : never;

// Messages
export type WebcastMessage = {
    [K in keyof typeof tikTokSchema as ExtractMessageType<typeof tikTokSchema[K]> extends never ? never : K]:
    ExtractMessageType<typeof tikTokSchema[K]>;
};

type HasCommon<T> = T extends { common: any } ? T : never;


// Top-Level Messages
export type WebcastEventMessage = {
    [K in keyof WebcastMessage as HasCommon<WebcastMessage[K]> extends never ? never : K]: WebcastMessage[K];
};


export interface IWebcastDeserializeConfig {
    skipMessageTypes: (keyof WebcastEventMessage)[];
}


export type DecodedData = {
    [K in keyof WebcastEventMessage]: {
        type: K;
        data: WebcastEventMessage[K]
    }
}[keyof WebcastEventMessage];

declare module '@/types/tiktok/webcast' {
    export interface BaseProtoMessage {
        decodedData?: DecodedData;
    }

    export interface WebcastGiftMessage {
        extendedGiftInfo?: any;
    }

}

export type WebcastHttpClientRequestParams = Omit<Omit<AxiosRequestConfig, 'url'>, 'baseURL'> & {
    host: string;
    path: string;
    params?: Record<string, string>;
    signRequest: boolean;
};


export type WebSocketParams = {
    [key: string]: string;
    compress?: string;
    room_id: string;
    internal_ext: string;
    cursor: string;
}

