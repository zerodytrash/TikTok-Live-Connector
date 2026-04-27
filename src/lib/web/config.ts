import {
    fetchRoomIdFromEulerRoute,
    fetchRoomInfoFromApiLiveRoute,
    fetchRoomInfoFromEulerRoute,
    fetchRoomInfoFromHtmlRoute,
    fetchRoomInfoRoute,
    fetchSignedWebSocketFromEulerRoute,
    fetchWebcastSignatureFromEulerRoute,
    sendRoomChatFromEulerRoute
} from '@/lib/web/routes';
import { fetchIsLiveComposite, fetchRoomIdComposite } from '@/lib/web/routes/composite';
import { GetWebConfigParams } from '@/types/web';
import {
    generateDeviceId,
    getRandomDevicePreset,
    getRandomLocationPreset,
    getRandomScreenPreset
} from '@/lib/web/lib/device-presets';
import { fetchRoomGiftsRoute } from '@/lib/web/routes/base/fetch-room-gifts';
import { WebcastWebConfigDefaults } from '@/lib/web/defaults';

/**
 * Global route registry. Call sites should read handlers from here (e.g. RouteConfig.fetchRoomInfo(...))
 * rather than importing the route functions directly, so downstream consumers can swap implementations:
 *
 *   import { RouteConfig } from 'tiktok-live-connector';
 *   RouteConfig.fetchRoomInfo = async ({ webClient, roomId }) => { ... };
 *
 */
export const RouteConfig = {
    // Base (webClient)
    fetchRoomGifts: fetchRoomGiftsRoute,
    fetchRoomInfo: fetchRoomInfoRoute,
    fetchRoomInfoFromApiLive: fetchRoomInfoFromApiLiveRoute,
    fetchRoomInfoFromHtml: fetchRoomInfoFromHtmlRoute,

    // Overridable, Euler-default operations
    fetchRoomIdFromProvider: fetchRoomIdFromEulerRoute,
    fetchRoomInfoFromProvider: fetchRoomInfoFromEulerRoute,
    fetchSignedWebSocketFromProvider: fetchSignedWebSocketFromEulerRoute,
    fetchWebcastSignatureFromProvider: fetchWebcastSignatureFromEulerRoute,
    sendRoomChatFromProvider: sendRoomChatFromEulerRoute,

    // Composite
    fetchRoomIdComposite: fetchRoomIdComposite,
    fetchIsLiveComposite: fetchIsLiveComposite
} satisfies Record<string, (...args: any[]) => any>;


export const getWebConfig = ({ device, location, screen }: GetWebConfigParams): WebcastWebConfigDefaults => {

    const baseConfig = structuredClone(WebcastWebConfigDefaults);

    baseConfig.DEFAULT_HTTP_CLIENT_PARAMS.app_language = location.lang;
    baseConfig.DEFAULT_HTTP_CLIENT_PARAMS.browser_language = location.lang_country;
    baseConfig.DEFAULT_HTTP_CLIENT_PARAMS.browser_name = device.browser_name;
    baseConfig.DEFAULT_HTTP_CLIENT_PARAMS.browser_platform = device.browser_platform;
    baseConfig.DEFAULT_HTTP_CLIENT_PARAMS.browser_version = device.browser_version;
    baseConfig.DEFAULT_HTTP_CLIENT_PARAMS.screen_height = screen.screen_height.toString();
    baseConfig.DEFAULT_HTTP_CLIENT_PARAMS.screen_width = screen.screen_width.toString();
    baseConfig.DEFAULT_HTTP_CLIENT_PARAMS.tz_name = location.tz_name;
    baseConfig.DEFAULT_HTTP_CLIENT_PARAMS.os = device.os;
    baseConfig.DEFAULT_HTTP_CLIENT_PARAMS.priority_region = location.country;
    baseConfig.DEFAULT_HTTP_CLIENT_PARAMS.region = location.country;
    baseConfig.DEFAULT_HTTP_CLIENT_PARAMS.webcast_language = location.lang;
    baseConfig.DEFAULT_HTTP_CLIENT_PARAMS.device_id = generateDeviceId();

    baseConfig.DEFAULT_HTTP_CLIENT_HEADERS['User-Agent'] = device.user_agent;
    return baseConfig;
};


export const getRandomPresets = () => {
    return {
        device: getRandomDevicePreset(),
        screen: getRandomScreenPreset(),
        location: getRandomLocationPreset()
    };
}

