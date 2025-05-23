import {
    ControlAction,
    WebcastChatMessage,
    WebcastControlMessage,
    WebcastEmoteChatMessage,
    WebcastEnvelopeMessage,
    WebcastGiftMessage,
    WebcastLikeMessage,
    WebcastLinkMicArmies,
    WebcastLinkMicBattle,
    WebcastLiveIntroMessage,
    WebcastMemberMessage,
    WebcastQuestionNewMessage,
    WebcastRoomUserSeqMessage,
    WebcastSocialMessage,
    WebcastSubNotifyMessage
} from '@/types/tiktok-schema';
import { RoomGiftInfo, RoomInfo, WebcastEventMessage, WebcastMessage } from '@/types/client';
import TikTokWsClient from '@/lib/ws/lib/ws-client';

export enum ControlEvent {
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    ERROR = 'error',
    RAW_DATA = 'rawData',
    DECODED_DATA = 'decodedData',
    WEBSOCKET_CONNECTED = 'websocketConnected',
    WEBSOCKET_DATA = 'websocketData',
}


export enum WebcastEvent {
    CHAT = 'chat',
    MEMBER = 'member',
    GIFT = 'gift',
    ROOM_USER = 'roomUser',
    SOCIAL = 'social',
    LIKE = 'like',
    QUESTION_NEW = 'questionNew',
    LINK_MIC_BATTLE = 'linkMicBattle',
    LINK_MIC_ARMIES = 'linkMicArmies',
    LIVE_INTRO = 'liveIntro',
    EMOTE = 'emote',
    ENVELOPE = 'envelope',
    SUBSCRIBE = 'subscribe',
    FOLLOW = 'follow',
    SHARE = 'share',
    STREAM_END = 'streamEnd',
    CONTROL_MESSAGE = 'controlMessage',
    BARRAGE = 'barrage'
}

export enum ConnectState {
    DISCONNECTED = 'DISCONNECTED',
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED'
}

export type EventHandler<T> = (event: T) => void | Promise<void>;


export type EventMap = {
    // Message Events
    [WebcastEvent.CHAT]: EventHandler<WebcastChatMessage>
    [WebcastEvent.MEMBER]: EventHandler<WebcastMemberMessage>
    [WebcastEvent.GIFT]: EventHandler<WebcastGiftMessage>,
    [WebcastEvent.ROOM_USER]: EventHandler<WebcastRoomUserSeqMessage>,
    [WebcastEvent.SOCIAL]: EventHandler<WebcastSocialMessage>,
    [WebcastEvent.LIKE]: EventHandler<WebcastLikeMessage>,
    [WebcastEvent.QUESTION_NEW]: EventHandler<WebcastQuestionNewMessage>,
    [WebcastEvent.LINK_MIC_BATTLE]: EventHandler<WebcastLinkMicBattle>,
    [WebcastEvent.LINK_MIC_ARMIES]: EventHandler<WebcastLinkMicArmies>,
    [WebcastEvent.LIVE_INTRO]: EventHandler<WebcastLiveIntroMessage>,
    [WebcastEvent.EMOTE]: EventHandler<WebcastEmoteChatMessage>,
    [WebcastEvent.ENVELOPE]: EventHandler<WebcastEnvelopeMessage>,
    [WebcastEvent.SUBSCRIBE]: EventHandler<WebcastSubNotifyMessage>,
    [WebcastEvent.STREAM_END]: (event: {action: ControlAction}) => void | Promise<void>,
    [WebcastEvent.CONTROL_MESSAGE]: EventHandler<WebcastControlMessage>,
    [WebcastEvent.BARRAGE]: EventHandler<WebcastMessage>,

    // Custom Events
    [WebcastEvent.FOLLOW]: EventHandler<WebcastSocialMessage>,
    [WebcastEvent.SHARE]: EventHandler<WebcastSocialMessage>,

    // Control Events
    [ControlEvent.CONNECTED]: EventHandler<TikTokLiveConnectionState>,
    [ControlEvent.DISCONNECTED]: EventHandler<void>,
    [ControlEvent.ERROR]: EventHandler<any>,
    [ControlEvent.WEBSOCKET_DATA]: EventHandler<Uint8Array>,
    [ControlEvent.RAW_DATA]: (type: string, data: Uint8Array) => void | Promise<void>;
    [ControlEvent.DECODED_DATA]: (type: string, event: any, binary: Uint8Array) => void | Promise<void>;
    [ControlEvent.WEBSOCKET_CONNECTED]: EventHandler<TikTokWsClient>

};

export const WebcastEventMap: Partial<Record<keyof WebcastEventMessage, keyof EventMap>> = {
    'WebcastChatMessage': WebcastEvent.CHAT,
    'WebcastMemberMessage': WebcastEvent.MEMBER,
    'WebcastRoomUserSeqMessage': WebcastEvent.ROOM_USER,
    'WebcastSocialMessage': WebcastEvent.SOCIAL,
    'WebcastLikeMessage': WebcastEvent.LIKE,
    'WebcastQuestionNewMessage': WebcastEvent.QUESTION_NEW,
    'WebcastLinkMicBattle': WebcastEvent.LINK_MIC_BATTLE,
    'WebcastLinkMicArmies': WebcastEvent.LINK_MIC_ARMIES,
    'WebcastLiveIntroMessage': WebcastEvent.LIVE_INTRO,
    'WebcastEmoteChatMessage': WebcastEvent.EMOTE,
    'WebcastEnvelopeMessage': WebcastEvent.ENVELOPE,
    'WebcastSubNotifyMessage': WebcastEvent.SUBSCRIBE,
    'WebcastBarrageMessage': WebcastEvent.BARRAGE
};


export type TikTokLiveConnectionState = {
    isConnected: boolean,
    roomId: string,
    roomInfo: RoomInfo | null,
    availableGifts: RoomGiftInfo | null
};
