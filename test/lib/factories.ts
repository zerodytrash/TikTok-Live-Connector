import type WebcastHttpClient from '@/lib/web/lib/http-client';
import type { CookieSessionBundle, OAuthTokenSessionBundle } from '@/types/client';
import type EulerStreamApiClient from '@eulerstream/euler-api-sdk';
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
        webcast?: Record<string, any>,
        premium?: Record<string, any>
    } = {}
) {
    const client = {
        configuration: {
            basePath: 'https://tiktok.eulerstream.com',
            ...(overrides.configuration || {})
        },
        webcast: {
            retrieveRoomId: vi.fn(),
            signWebcastUrl: vi.fn(),
            fetchWebcastURL: vi.fn(),
            ...(overrides.webcast || {})
        },
        premium: {
            retrieveRoomInfo: vi.fn(),
            sendRoomChat: vi.fn(),
            ...(overrides.premium || {})
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
