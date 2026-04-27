import { OptionsInit as BaseGotHttpConfig, PromiseCookieJar } from 'got';
import { CookieSessionBundle, WebSocketParams } from '@/types/client';

export type LocationPreset = {
    lang: string,
    lang_country: string,
    country: string,
    tz_name: string
}

export type DevicePreset = {
    browser_version: string,
    browser_name: string,
    browser_platform: string,
    user_agent: string,
    os: string
}

export type ScreenPreset = {
    screen_width: number;
    screen_height: number;
}

export type GetWebConfigParams = {
    screen: ScreenPreset,
    location: LocationPreset,
    device: DevicePreset,
}

export type WebSocketDynamicParams = {
    roomId: string,
    baseUrl: string,
    wsParams: WebSocketParams;
    wsHeaders: Record<string, string>
}

export type GetWebSocketConfigParams = GetWebConfigParams;

export interface AbstractWebcastCookieJar extends PromiseCookieJar {

    // Inherited
    getCookieString: (url: string) => Promise<string>;
    setCookie: (rawCookie: string, url: string) => Promise<unknown>;

    // Added
    processSetCookieHeader(setCookieHeader: unknown): Promise<void>;

    getSessionBundle(): Promise<CookieSessionBundle | null>;

    setSessionBundle(session: CookieSessionBundle): Promise<void>;
}

/**
 * Narrow type to only allow Record-based params
 */
export type WebcastGotHttpConfig = Omit<BaseGotHttpConfig, 'searchParams' | 'cookieJar'> & {
    searchParams?: Record<string, string>,
    cookieJar: AbstractWebcastCookieJar
};
