import { OptionsInit } from 'got';
import * as tikTokSchema from 'tiktok-live-proto/v2';
import { MessageFns, ProtoMessageFetchResult, WebcastPushFrame } from 'tiktok-live-proto/v2';
import { ClientOptions as WsWebSocketConfig } from 'ws';
import EulerStreamApiClient from '@eulerstream/euler-api-sdk';
import { GetWebConfigParams, WebcastGotHttpConfig } from '@/types/web';
import { WebcastWebSocketConfigDefaults } from '@/lib/ws';
import { WebcastWebConfigDefaults } from '@/lib/web/defaults';

export type CookieSessionBundle = {
    type: 'cookie',
    value: {
        ttTargetIdc: string;
        sessionId: string;
    }
}

export type OAuthTokenSessionBundle = {
    type: 'oAuthToken',
    value: string;
}

export type SessionBundle = {
    cookie: CookieSessionBundle;
    oAuthToken: OAuthTokenSessionBundle;
}

type SessionBundleWithCookie = Omit<Partial<SessionBundle>, 'cookie'> & { cookie: SessionBundle['cookie'] };

export type TikTokLiveConnectionBundledAuthOptions = {
    // Mobile mode requires authentication
    useMobile: true;
    session: SessionBundleWithCookie;
    authenticateWs: true;
} | {
    // Web mode with authenticated WebSocket
    useMobile?: false;
    session: SessionBundleWithCookie
    authenticateWs?: true;
} | {
    useMobile?: false;
    session?: Partial<SessionBundle>
    authenticateWs?: false;
}
export type TikTokLiveConnectionProviderOptions = {

    /**
     * Ignored if `eulerApiInstance` is provided. If not, an instance will be created with this API key (or the one from env vars if not provided).
     */
    signApiKey?: string;

    /**
     * Pass an existing instance of the Euler Stream API client to be used for all requests to Euler's endpoints. Or use SignConfig.
     */
    eulerApiInstance?: EulerStreamApiClient
} & TikTokLiveConnectionBundledAuthOptions


export type TikTokLiveConnectionOptions = TikTokLiveConnectionProviderOptions & {
    processInitialData: boolean;
    fetchRoomInfoOnConnect: boolean;
    enableExtendedGiftInfo: boolean;

    // Replace client presets
    clientPresets?: GetWebConfigParams;

    webClientOptions?: WebcastGotHttpConfig;
    wsClientOptions?: WsWebSocketConfig;

    webConfigOverrides?: Partial<WebcastWebConfigDefaults>;
    wsConfigOverrides?: Partial<WebcastWebSocketConfigDefaults>;
}

export type TikTokLiveConstructorConnectionOptions =
    Partial<TikTokLiveConnectionOptions>
    & TikTokLiveConnectionProviderOptions


export type TikTokLiveConnectionMutableOptions = Pick<
    TikTokLiveConnectionOptions,
    'processInitialData' | 'fetchRoomInfoOnConnect' | 'enableExtendedGiftInfo' | 'authenticateWs' | 'useMobile'
>;

export type RoomInfo = Record<string, any> & { data: { status: number } }
export type RoomGiftInfo = any;


export type DecodedWebcastPushFrame = WebcastPushFrame & {
    protoMessageFetchResult?: ProtoMessageFetchResult;
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

export type WebcastHttpClientRequestParams =
    Omit<OptionsInit, 'url' | 'prefixUrl' | 'searchParams' | 'cookieJar' | 'headers'>
    & {
    host: string;
    path: string;
    headers?: Record<string, string>
    searchParams?: Record<string, string>;
    signRequest: boolean;
};


export type WebSocketParams = {
    [key: string]: string | undefined;
    compress?: string;
    room_id: string;
    internal_ext: string;
    cursor: string;
}


