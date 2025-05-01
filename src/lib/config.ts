import { IWebcastConfig } from '@/types/client';


import { generateDeviceId, userAgentToDevicePreset } from '@/lib/utilities';
import { ClientConfiguration } from '@eulerstream/euler-api-sdk';
import { VERSION } from '@/version';

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


export const Locations: LocationPreset[] = [
    {
        'lang_country': 'en-GB',
        'lang': 'en',
        'country': 'GB',
        'tz_name': 'Europe/London'
    },
    {
        'lang_country': 'en-CA',
        'lang': 'en',
        'country': 'CA',
        'tz_name': 'America/Toronto'
    },
    {
        'lang_country': 'en-AU',
        'lang': 'en',
        'country': 'AU',
        'tz_name': 'Australia/Sydney'
    },
    {
        'lang_country': 'en-NZ',
        'lang': 'en',
        'country': 'NZ',
        'tz_name': 'Pacific/Auckland'
    },
    {
        'lang_country': 'en-ZA',
        'lang': 'en',
        'country': 'ZA',
        'tz_name': 'Africa/Johannesburg'
    },
    {
        'lang_country': 'en-IE',
        'lang': 'en',
        'country': 'IE',
        'tz_name': 'Europe/Dublin'
    },
    {
        'lang_country': 'en-JM',
        'lang': 'en',
        'country': 'JM',
        'tz_name': 'America/Jamaica'
    },
    {
        'lang_country': 'en-BZ',
        'lang': 'en',
        'country': 'BZ',
        'tz_name': 'America/Belize'
    },
    {
        'lang_country': 'en-TT',
        'lang': 'en',
        'country': 'TT',
        'tz_name': 'America/Port_of_Spain'
    }
];


export const Screens: ScreenPreset[] = [
    {
        'screen_width': 1920,
        'screen_height': 1080
    },
    {
        'screen_width': 2560,
        'screen_height': 1440
    },
    {
        'screen_width': 3840,
        'screen_height': 2160
    },
    {
        'screen_width': 4096,
        'screen_height': 2160
    },
    {
        'screen_width': 5120,
        'screen_height': 2880
    },
    {
        'screen_width': 7680,
        'screen_height': 4320
    },
    {
        'screen_width': 1152,
        'screen_height': 2048
    },
    {
        'screen_width': 1440,
        'screen_height': 2560
    },
    {
        'screen_width': 2160,
        'screen_height': 3840
    },
    {
        'screen_width': 4320,
        'screen_height': 7680
    }
];

export const UserAgents: string[] = [
    // Latest Chrome UA's -> https://www.whatismybrowser.com/guides/the-latest-user-agent/chrome
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',

    // Latest Safari UA's -> https://www.whatismybrowser.com/guides/the-latest-user-agent/safari
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15',

    // Latest Firefox UA's -> https://www.whatismybrowser.com/guides/the-latest-user-agent/firefox
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.7; rv:130.0) Gecko/20100101 Firefox/130.0',

    // Latest Edge UA's -> https://www.whatismybrowser.com/guides/the-latest-user-agent/edge
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/128.0.2739.79',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/128.0.2739.79',

    // Latest Opera UA's -> https://www.whatismybrowser.com/guides/the-latest-user-agent/opera
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 OPR/113.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 OPR/113.0.0.0'
];


export const Devices: DevicePreset[] = UserAgents.map((userAgent: string) => userAgentToDevicePreset(userAgent));

// Pick a device
export const Device: DevicePreset = (process.env.RANDOMIZE_TIKTOK_DEVICE?.toLowerCase() === 'true') ? Devices[Math.floor(Math.random() * Devices.length)] : {
    browser_platform: 'Win32',
    browser_name: 'Mozilla',
    browser_version: '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
    os: 'windows'
};

// Pick a location
export const Location: LocationPreset = (process.env.RANDOMIZE_TIKTOK_LOCATION?.toLowerCase() === 'true') ? Locations[Math.floor(Math.random() * Locations.length)] : {
    lang_country: 'en-US',
    lang: 'en',
    country: 'GB',
    tz_name: 'Europe/Berlin'
};

export const Screen: ScreenPreset = (process.env.RANDOMIZE_TIKTOK_SCREEN?.toLowerCase() === 'true') ? Screens[Math.floor(Math.random() * Screens.length)] : {
    screen_width: 1920,
    screen_height: 1080
};


const Config: IWebcastConfig = {
    TIKTOK_HOST_WEB: 'www.tiktok.com',
    TIKTOK_HOST_WEBCAST: 'webcast.tiktok.com',
    TIKTOK_HTTP_ORIGIN: 'https://www.tiktok.com',
    DEFAULT_HTTP_CLIENT_COOKIES: {
        'tt-target-idc': 'useast1a'
    },
    DEFAULT_HTTP_CLIENT_PARAMS: {
        'aid': 1988,
        'app_language': Location['lang'],
        'app_name': 'tiktok_web',
        'browser_language': Location['lang_country'],
        'browser_name': Device['browser_name'],
        'browser_online': 'true',
        'browser_platform': Device['browser_platform'],
        'browser_version': Device['browser_version'],
        'cookie_enabled': 'true',
        'device_platform': 'web_pc',
        'focus_state': 'true',
        'from_page': 'user',
        'history_len': '10',
        'is_fullscreen': 'false',
        'is_page_visible': 'true',
        'screen_height': Screen['screen_height'],
        'screen_width': Screen['screen_width'],
        'tz_name': Location['tz_name'],
        'referer': 'https://www.tiktok.com/',
        'root_referer': 'https://www.tiktok.com/',
        'channel': 'tiktok_web',
        'data_collection_enabled': 'true',
        'os': Device['os'],
        'priority_region': Location['country'],
        'region': Location['country'],
        'user_is_login': 'true',
        'webcast_language': Location['lang'],
        'device_id': generateDeviceId(),
    },
    DEFAULT_WS_CLIENT_PARAMS: {
        'aid': 1988,
        'app_language': Location['lang'],
        'app_name': 'tiktok_web',
        'browser_platform': Device['browser_platform'],
        'browser_language': Location['lang_country'],
        'browser_name': Device['browser_name'],
        'browser_version': Device['browser_version'],
        'browser_online': 'true',
        'cookie_enabled': 'true',
        'tz_name': Location['tz_name'],
        'device_platform': 'web',
        'debug': 'false',
        'host': 'webcast.tiktok.com',
        'identity': 'audience',
        'live_id': '12',
        'sup_ws_ds_opt': '1',
        'update_version_code': '2.0.0',
        'version_code': '180800',
        'did_rule': '3',
        'screen_height': Screen['screen_height'],
        'screen_width': Screen['screen_width'],
        'heartbeat_duration': '0',
        'resp_content_type': 'protobuf',
        'history_comment_count': '6',
        // We think last_rtt means "last round trip time" in millis.
        'last_rtt': Math.floor(Math.random() * 100) + 100
    },

    DEFAULT_REQUEST_HEADERS: {
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/json,application/protobuf',
        'Referer': 'https://www.tiktok.com/',
        'Origin': 'https://www.tiktok.com',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        "Sec-Fetch-Site": 'same-site',
        "Sec-Fetch-Mode": 'cors',
        "Sec-Fetch-Dest": 'empty',
        "Sec-Fetch-Ua-Mobile": '?0',
    },

    WEBCAST_VERSION_CODE: '180800'
};

export const SignConfig: Partial<ClientConfiguration> = {
    basePath: process.env.SIGN_API_URL || 'https://tiktok.eulerstream.com',
    apiKey: process.env.SIGN_API_KEY,
    baseOptions: {
        headers: { 'User-Agent': `tiktok-live-connector/${VERSION} ${process.platform}` },
        validateStatus: () => true
    },
};

export default Config;
