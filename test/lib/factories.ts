import type WebcastHttpClient from '@/lib/web/lib/http-client';
import type { CookieSessionBundle, OAuthTokenSessionBundle } from '@/types/client';
import type EulerStreamApiClient from 'tiktok-live-api-sdk';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { vi } from 'vitest';

export function createCookieSessionBundle(
    overrides: Partial<CookieSessionBundle['value']> = {}
): CookieSessionBundle {
    return {
        type: 'cookie',
        value: {
            sessionId: 'session-id',
            ttTargetIdc: 'useast1a',
            ...overrides
        }
    };
}

export function createOAuthTokenSessionBundle(value: string = 'oauth-token'): OAuthTokenSessionBundle {
    return {
        type: 'oAuthToken',
        value
    };
}

export function createMockWebClient(overrides: Record<string, any> = {}) {
    const cookieJar = {
        getCookieString: vi.fn<() => Promise<string>>(async () => ''),
        getSessionBundle: vi.fn<() => Promise<CookieSessionBundle | null>>(async () => null),
        processSetCookieHeader: vi.fn(async () => undefined),
        setCookie: vi.fn(async () => undefined),
        setSessionBundle: vi.fn(async () => undefined)
    };

    const webClient = {
        roomId: '',
        clientParams: {
            aid: '1988'
        },
        clientHeaders: {
            'User-Agent': 'vitest-agent'
        },
        oAuthSessionBundle: null,
        cookieJar,
        getHtmlFromTikTokWebsite: vi.fn(),
        getJsonObjectFromTikTokApi: vi.fn(),
        getJsonObjectFromWebcastApi: vi.fn()
    };

    return {
        ...webClient,
        ...overrides,
        cookieJar: {
            ...cookieJar,
            ...(overrides.cookieJar || {})
        }
    } as WebcastHttpClient & typeof webClient;
}

export function createMockEulerClient(
    overrides: {
        configuration?: Record<string, any>,
        general?: Record<string, any>,
        anchors?: Record<string, any>,
        rooms?: Record<string, any>
    } = {}
) {
    const client = {
        configuration: {
            basePath: 'https://api.eulerstream.com',
            ...(overrides.configuration || {})
        },
        general: {
            signTikTokUrl: vi.fn(),
            ...(overrides.general || {})
        },
        anchors: {
            retrieveRoomId: vi.fn(),
            retrieveRoomInfo: vi.fn(),
            ...(overrides.anchors || {})
        },
        rooms: {
            fetchWebcastURL: vi.fn(),
            sendRoomChat: vi.fn(),
            ...(overrides.rooms || {})
        }
    };

    return client as EulerStreamApiClient & typeof client;
}

export function createAxiosResponse<T>(
    data: T,
    overrides: Partial<AxiosResponse<T>> = {}
): AxiosResponse<T> {
    return {
        data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: {} } as InternalAxiosRequestConfig,
        ...overrides
    };
}

export type MockWebClient = ReturnType<typeof createMockWebClient>;
export type MockEulerClient = ReturnType<typeof createMockEulerClient>;
