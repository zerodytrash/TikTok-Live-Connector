import * as tikTokSchema from '../../.proto/tiktokSchema';
import { MessageFns, WebcastWebsocketMessage } from '../../.proto/tiktokSchema';

export type WebcastPushConnectionOptions = {
    processInitialData: boolean;
    fetchRoomInfoOnConnect: boolean;
    enableExtendedGiftInfo: boolean;
    enableWebsocketUpgrade: boolean;
    enableRequestPolling: boolean;
    requestPollingIntervalMs: number;
    sessionId: string | null;
    clientParams: {};
    requestHeaders: {};
    websocketHeaders: {};
    requestOptions: {};
    websocketOptions: {};
    signProviderOptions: {}
}

export type WebcastPushConnectionClientParams = {
    room_id: string;
    cursor: string;
    internal_ext: string;
}

export interface WebcastPushConnectionWebSocketParams extends Record<string, any> {
    compress?: string;
}


export type DecodedWebcastWebsocketMessage = WebcastWebsocketMessage & {
    webcastResponse?: any;
}


export interface IWebcastConfig extends Record<string, any> {
    TIKTOK_URL_WEB: string;
    TIKTOK_URL_WEBCAST: string;
    TIKTOK_HTTP_ORIGIN: string;
    DEFAULT_CLIENT_PARAMS: Record<string, any>;
    DEFAULT_REQUEST_HEADERS: Record<string, any>;
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

export interface IWebcastSignatureProviderConfig {
    enabled: boolean;
    signProviderHost: string;
    signProviderFallbackHosts: string[];
    extraParams: Record<string, any>;
}


declare module '../../.proto/tiktokSchema' {
    export interface Message {
        decodedData?: WebcastEventMessage[keyof WebcastEventMessage];
    }

}
