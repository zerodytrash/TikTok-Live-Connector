import { WebcastWebSocketConfigDefaults, WebSocketConfigDefaults } from '@/lib/ws/defaults';
import { GetWebSocketConfigParams } from '@/types/web';

export function getWebSocketConfigDefaults(
    {
        device,
        screen,
        location
    }: GetWebSocketConfigParams
): WebcastWebSocketConfigDefaults {

    const baseConfig = structuredClone(WebSocketConfigDefaults);

    baseConfig.DEFAULT_WS_CLIENT_PARAMS.app_language = location.lang;
    baseConfig.DEFAULT_WS_CLIENT_PARAMS.browser_platform = device.browser_platform;
    baseConfig.DEFAULT_WS_CLIENT_PARAMS.browser_language = location.lang_country;
    baseConfig.DEFAULT_WS_CLIENT_PARAMS.browser_name = device.browser_name;
    baseConfig.DEFAULT_WS_CLIENT_PARAMS.browser_version = device.browser_version;
    baseConfig.DEFAULT_WS_CLIENT_PARAMS.tz_name = location.tz_name;
    baseConfig.DEFAULT_WS_CLIENT_PARAMS.webcast_language = location.lang;
    baseConfig.DEFAULT_WS_CLIENT_PARAMS.screen_height = screen.screen_height.toString();
    baseConfig.DEFAULT_WS_CLIENT_PARAMS.screen_width = screen.screen_width.toString();

    baseConfig.DEFAULT_WS_CLIENT_PARAMS['User-Agent'] = device.user_agent;
    baseConfig.DEFAULT_WS_CLIENT_HEADERS['User-Agent'] = device.user_agent;

    return baseConfig;
}
