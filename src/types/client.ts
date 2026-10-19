import { OptionsInit } from 'got';
import * as tikTokSchema from 'tiktok-live-proto/v3';
import { ProtoMessageFetchResult, WebcastPushFrame } from 'tiktok-live-proto/v3';
import type { BinaryReader, BinaryWriter } from '@bufbuild/protobuf/wire';
import { ClientOptions as WsWebSocketConfig } from 'ws';
import EulerStreamApiClient from 'tiktok-live-api-sdk';
import { GetWebConfigParams, WebcastGotHttpConfig } from '@/types/web';
import { WebcastWebSocketConfigDefaults } from '@/lib/ws';
import { WebcastWebConfigDefaults } from '@/lib/web/defaults';

interface MessageFns<T> {
    encode(message: T, writer?: BinaryWriter): BinaryWriter;

    decode(input: BinaryReader | Uint8Array, length?: number): T;
}

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
     * Writes the global SignConfig API key before client construction. An explicit eulerApiInstance uses
     * its own configuration; an already cached provider client is not rebuilt when this value changes.
     */
    signApiKey?: string;

    /**
     * Pass an existing instance of the Euler Stream API client to be used for all requests to Euler's endpoints. Or use SignConfig.
     */
    eulerApiInstance?: EulerStreamApiClient
} & TikTokLiveConnectionBundledAuthOptions


export type TikTokLiveConnectionOptions = TikTokLiveConnectionProviderOptions & {
    /** Emit messages from the initial signing response. Defaults to true. */
    processInitialData: boolean;
    /** Fetch and cache room information before opening the socket. Defaults to true. */
    fetchRoomInfoOnConnect: boolean;
    /** Fetch and cache gifts during connection, then attach matching metadata to gift events. Defaults to false. */
    enableExtendedGiftInfo: boolean;

    /** Device, location, and screen presets. Randomization defaults are controlled by the environment. */
    clientPresets?: GetWebConfigParams;

    /** Got options. Headers and searchParams are merged; the current constructor drops timeout. */
    webClientOptions?: WebcastGotHttpConfig;
    /** ws transport options. Dynamic connection headers take precedence over supplied headers. */
    wsClientOptions?: WsWebSocketConfig;

    /** Shallow replacement of resolved HTTP protocol config fields, including whole nested objects. */
    webConfigOverrides?: Partial<WebcastWebConfigDefaults>;
    /** Shallow replacement of resolved WebSocket protocol config fields, including whole nested objects. */
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
export type WebcastEventMessage = Omit<
    {
        [K in keyof WebcastMessage as HasCommon<WebcastMessage[K]> extends never ? never : K]: WebcastMessage[K];
    },
    'VaultGloveCardInfo' | 'Top2CardInfo' | 'Top3CardInfo'
>


export type IWebcastDeserializeConfig = {
    /**
     * When specified, messages of these types will be skipped during deserialization. This is useful for large messages that you don't need, to save CPU and memory.
     */
    skipMessageTypes: (keyof WebcastEventMessage)[] | null;

    /**
     * When specified, only messages of these types will be deserialized. skipMessageTypes will be ignored if this is set.
     */
    includeMessageTypes: (keyof WebcastEventMessage)[] | null;

    /**
     * Show the base64-encoded original message in the error message when deserialization fails. This can be useful for debugging and for creating issues with the original message data.
     */
    showBase64OnDecodeError: boolean;
}


export type DecodedData = {
    [K in keyof WebcastEventMessage]: {
        type: K;
        data: WebcastEventMessage[K]
    }
}[keyof WebcastEventMessage];

declare module 'tiktok-live-proto/v3' {
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


