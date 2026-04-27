/**
 * Hint the order of the map by putting a templated value for an item that must be dynamically generated.
 */
const TEMPLATED_VALUE = '[UNRESOLVED]';

export const WebcastWebConfigDefaults = {
    TIKTOK_HOST_WEB: 'www.tiktok.com',
    TIKTOK_HOST_WEBCAST: 'webcast.tiktok.com',
    TIKTOK_HTTP_ORIGIN: 'https://www.tiktok.com',
    DEFAULT_HTTP_CLIENT_OPTIONS: {},
    DEFAULT_HTTP_CLIENT_HEADERS: {
        'Cookie': 'tt-target-idc=useast1a',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
        'User-Agent': TEMPLATED_VALUE,
        'Accept': 'text/html,application/json,application/protobuf',
        'Referer': 'https://www.tiktok.com/',
        'Origin': 'https://www.tiktok.com',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'Sec-Fetch-Site': 'same-site',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Ua-Mobile': '?0'
    },
    DEFAULT_HTTP_CLIENT_PARAMS: {
        'aid': (1988).toString(),
        'app_language': TEMPLATED_VALUE,
        'app_name': 'tiktok_web',
        'browser_language': TEMPLATED_VALUE,
        'browser_name': TEMPLATED_VALUE,
        'browser_online': 'true',
        'browser_platform': TEMPLATED_VALUE,
        'browser_version': TEMPLATED_VALUE,
        'cookie_enabled': 'true',
        'device_platform': 'web_pc',
        'focus_state': 'true',
        'from_page': 'user',
        'history_len': '10',
        'is_fullscreen': 'false',
        'is_page_visible': 'true',
        'screen_height': TEMPLATED_VALUE,
        'screen_width': TEMPLATED_VALUE,
        'tz_name': TEMPLATED_VALUE,
        'referer': 'https://www.tiktok.com/',
        'root_referer': 'https://www.tiktok.com/',
        'channel': 'tiktok_web',
        'data_collection_enabled': 'true',
        'os': TEMPLATED_VALUE,
        'priority_region': TEMPLATED_VALUE,
        'region': TEMPLATED_VALUE,
        'user_is_login': 'true',
        'webcast_language': TEMPLATED_VALUE,
        'device_id': TEMPLATED_VALUE
    },
    SESSION_COOKIE_NAMES: ['sessionid', 'sessionid_ss', 'sid_tt', 'sid_guard'],
    TARGET_IDC_COOKIE_NAME: 'tt-target-idc'
};

export type WebcastWebConfigDefaults = typeof WebcastWebConfigDefaults;
