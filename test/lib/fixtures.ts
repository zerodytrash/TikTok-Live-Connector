export const TEST_ROOM_ID = '7140000000000000001';
export const TEST_UNIQUE_ID = 'unit-test-live';

export const LIVE_ROOM_USER_INFO_FIXTURE = {
    user: {
        roomId: TEST_ROOM_ID
    },
    liveRoom: {
        roomId: TEST_ROOM_ID,
        status: 2
    }
};

export const OFFLINE_LIVE_ROOM_USER_INFO_FIXTURE = {
    user: {
        roomId: TEST_ROOM_ID
    },
    liveRoom: {
        roomId: TEST_ROOM_ID,
        status: 4
    }
};

export const API_LIVE_ROOM_INFO_FIXTURE = {
    statusCode: 0,
    data: {
        user: {
            roomId: TEST_ROOM_ID
        },
        liveRoom: {
            roomId: TEST_ROOM_ID,
            status: 2
        }
    }
};

export function buildSigiStateHtml(liveRoomUserInfo: unknown = LIVE_ROOM_USER_INFO_FIXTURE): string {
    return [
        '<!DOCTYPE html>',
        '<html>',
        '<body>',
        `<script id="SIGI_STATE" type="application/json">${JSON.stringify({ LiveRoom: { liveRoomUserInfo } })}</script>`,
        '</body>',
        '</html>'
    ].join('');
}

export function buildBrokenSigiStateHtml(serializedPayload: string = '{"LiveRoom":'): string {
    return [
        '<!DOCTYPE html>',
        '<html>',
        '<body>',
        `<script id="SIGI_STATE" type="application/json">${serializedPayload}</script>`,
        '</body>',
        '</html>'
    ].join('');
}
