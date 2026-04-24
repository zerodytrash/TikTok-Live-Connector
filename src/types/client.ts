import { AxiosRequestConfig } from 'axios';
import * as tikTokSchema from 'tiktok-live-proto/v2';
import { MessageFns, ProtoMessageFetchResult, WebcastPushFrame } from 'tiktok-live-proto/v2';
import { ClientOptions } from 'ws';

// Authentication options: either sessionId + ttTargetIdc, oauthToken, or nothing
// NOTE: At runtime, provide either (sessionId + ttTargetIdc) OR oauthToken, not both
export type TikTokLiveConnectionBundledOptions = {
    // Mobile mode requires authentication
    useMobile: true;
    sessionId?: string | null;
    ttTargetIdc?: string | null;
    oauthToken?: string | null;
    authenticateWs: true;
} | {
    // Web mode
    useMobile?: false;
    sessionId?: string | null;
    ttTargetIdc?: string | null;
    oauthToken?: string | null;
    authenticateWs?: boolean;
}


export type TikTokLiveConnectionOptions = TikTokLiveConnectionBundledOptions & {
    processInitialData: boolean;
    fetchRoomInfoOnConnect: boolean;
    enableExtendedGiftInfo: boolean;
    enableRequestPolling: boolean;
    requestPollingIntervalMs: number;
    signApiKey: string | null;
    connectWithUniqueId: boolean;
    disableEulerFallbacks: boolean;

    webClientParams: Record<string, string>;
    webClientHeaders: Record<string, string>;
    webClientOptions: AxiosRequestConfig;

    wsClientHeaders: Record<string, string>;
    wsClientParams: Record<string, string>;
    wsClientOptions: ClientOptions;

    // Override the default websocket provider
    signedWebSocketProvider?: (props: FetchSignedWebSocketParams) => Promise<ProtoMessageFetchResult>
}

export type TikTokLiveConstructorConnectionOptions =
    Partial<TikTokLiveConnectionOptions>
    & TikTokLiveConnectionBundledOptions


export type RoomInfo = Record<string, any> & { data: { status: number } }
export type RoomGiftInfo = any;

export type FetchSignedWebSocketParams = {
    roomId?: string;
    uniqueId?: string;
    ttTargetIdc?: string;
    sessionId?: string;
    oauthToken?: string;
    useMobile?: boolean;
}


export type WebcastHttpClientConfig = {
    customHeaders: Record<string, string>;
    axiosOptions: AxiosRequestConfig;
    clientParams: Record<string, string>;
    authenticateWs?: boolean;
    signApiKey?: string;
    oauthToken?: string;
}

export type DecodedWebcastPushFrame = WebcastPushFrame & {
    protoMessageFetchResult?: ProtoMessageFetchResult;
}


export interface WebcastConfig {
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
    showBase64OnDecodeError: boolean;
}


export interface IWebcastDeserializeConfig {
    skipMessageTypes: (keyof WebcastEventMessage)[];
}


export type DecodedData = {
    [K in keyof WebcastEventMessage]: {
        type: K;
        data: WebcastEventMessage[K]
    }
}[keyof WebcastEventMessage];

declare module 'tiktok-live-proto/v2' {
    export interface BaseProtoMessage {
        decodedData?: DecodedData;
        decodeError?: any;
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

