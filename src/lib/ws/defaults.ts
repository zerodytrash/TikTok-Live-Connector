import { WebcastWebConfigDefaults } from '@/lib/web/defaults';
import { WebSocketDynamicParams } from '@/types/web';

const TEMPLATED_VALUE = '[UNRESOLVED]';

export const WebSocketConfigDefaults = {
    TIKTOK_HOST_WS: WebcastWebConfigDefaults.TIKTOK_HOST_WEB,
    DEFAULT_WS_CLIENT_PARAMS: {
        'version_code': '180800',
        'aid': (1988).toString(),
        'app_language': TEMPLATED_VALUE,
        'app_name': 'tiktok_web',
        'browser_platform': TEMPLATED_VALUE,
        'browser_language': TEMPLATED_VALUE,
        'browser_name': TEMPLATED_VALUE,
        'browser_version': TEMPLATED_VALUE,
        'browser_online': 'true',
        'cookie_enabled': 'true',
        'tz_name': TEMPLATED_VALUE,
        'device_platform': 'web',
        'identity': 'audience',
        'live_id': '12',
        'webcast_language': TEMPLATED_VALUE,
        'ws_direct': '0',
        'sup_ws_ds_opt': '1',
        'update_version_code': '2.0.0',
        'did_rule': '3',
        'screen_height': TEMPLATED_VALUE,
        'screen_width': TEMPLATED_VALUE,
        'heartbeat_duration': '0',
        'resp_content_type': 'protobuf',
        'history_comment_count': '6',
        'client_enter': '1',
        'last_rtt': ((Math.random() * 100) + 100).toString()
    },
    DEFAULT_WS_CLIENT_PARAMS_APPEND_PARAMETER: '&version_code=270000',
    DEFAULT_WS_CLIENT_HEADERS: {
        'User-Agent': TEMPLATED_VALUE
    },
    DEFAULT_WS_PING_INTERVAL: 10000
};

export type WebcastWebSocketConfigDefaults = typeof WebSocketConfigDefaults;
export type WebcastWebSocketConfig = WebcastWebSocketConfigDefaults & WebSocketDynamicParams;
