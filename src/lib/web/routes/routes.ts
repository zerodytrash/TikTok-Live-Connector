export enum BaseFetchRoute {
    FETCH_ROOM_GIFTS = 'fetchRoomGiftsRoute',
    FETCH_ROOM_INFO = 'fetchRoomInfoRoute',
    FETCH_ROOM_INFO_API_LIVE = 'fetchRoomInfoApiLiveRoute',
    FETCH_ROOM_INFO_HTML = 'fetchRoomInfoHtmlRoute',
}

export enum CompositeFetchRoute {
    FETCH_IS_LIVE = 'fetchIsLiveRoute',
    FETCH_ROOM_ID = 'fetchRoomIdRoute',
}

export enum EulerFetchRoute {
    FETCH_ROOM_ID = 'fetchRoomIdFromEulerRoute',
    FETCH_ROOM_INFO = 'fetchRoomInfoFromEulerRoute',
    FETCH_SIGNED_WEBSOCKET = 'fetchSignedWebSocketFromEulerRoute',
    FETCH_WEBCAST_SIGNATURE = 'fetchWebcastSignatureFromEulerRoute',
    SEND_ROOM_CHAT = 'sendRoomChatFromEulerRoute'
}
