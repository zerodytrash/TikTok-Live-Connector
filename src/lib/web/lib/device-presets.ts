import { DevicePreset, LocationPreset, ScreenPreset } from '@/types/web';

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

export function userAgentToDevicePreset(userAgent: string): DevicePreset {
    const firstSlash = userAgent.indexOf('/');
    const browserName = userAgent.substring(0, firstSlash);
    const browserVersion = userAgent.substring(firstSlash + 1);

    return {
        user_agent: userAgent,
        browser_name: browserName,
        browser_version: browserVersion,
        browser_platform: userAgent.includes('Macintosh') ? 'MacIntel' : 'Win32',
        os: userAgent.includes('Macintosh') ? 'mac' : 'windows'
    };
}

export function getRandomDevicePreset(): DevicePreset {
    return (process.env.RANDOMIZE_TIKTOK_DEVICE?.toLowerCase() === 'true') ? Devices[Math.floor(Math.random() * Devices.length)] : Devices[6];
}

export function getRandomLocationPreset(): LocationPreset {
    return (process.env.RANDOMIZE_TIKTOK_LOCATION?.toLowerCase() === 'true') ? Locations[Math.floor(Math.random() * Locations.length)] : {
        lang_country: 'en-DE',
        lang: 'en',
        country: 'DE',
        tz_name: 'Europe/Berlin'
    };
}

export function getRandomScreenPreset(): ScreenPreset {
    return (process.env.RANDOMIZE_TIKTOK_SCREEN?.toLowerCase() === 'true') ? Screens[Math.floor(Math.random() * Screens.length)] : {
        screen_width: 1920,
        screen_height: 1080
    };
}


export function generateDeviceId() {
    let digits = '';
    for (let i = 0; i < 19; i++) {
        digits += Math.floor(Math.random() * 10);
    }
    return digits;
}

export const Devices: DevicePreset[] = UserAgents.map((userAgent: string) => userAgentToDevicePreset(userAgent));
