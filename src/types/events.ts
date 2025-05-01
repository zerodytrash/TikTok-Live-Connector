import {
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
import { RoomGiftInfo, RoomInfo, WebcastMessage } from '@/types/index';

export enum ControlEvent {
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    ERROR = 'error',
    RAW_DATA = 'rawData',
    DECODEDDATA = 'decodedData',
    WSCONNECTED = 'websocketConnected'
}


export enum Event {
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
}

export enum ConnectState {
    DISCONNECTED = 'DISCONNECTED',
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED'
}

export type EventHandler<T> = (event: T) => void | Promise<void>;


export type EventMap = {
    // Message Events
    [Event.CHAT]: EventHandler<WebcastChatMessage>
    [Event.MEMBER]: EventHandler<WebcastMemberMessage>
    [Event.GIFT]: EventHandler<WebcastGiftMessage>,
    [Event.ROOM_USER]: EventHandler<WebcastRoomUserSeqMessage>,
    [Event.SOCIAL]: EventHandler<WebcastSocialMessage>,
    [Event.LIKE]: EventHandler<WebcastLikeMessage>,
    [Event.QUESTION_NEW]: EventHandler<WebcastQuestionNewMessage>,
    [Event.LINK_MIC_BATTLE]: EventHandler<WebcastLinkMicBattle>,
    [Event.LINK_MIC_ARMIES]: EventHandler<WebcastLinkMicArmies>,
    [Event.LIVE_INTRO]: EventHandler<WebcastLiveIntroMessage>,
    [Event.EMOTE]: EventHandler<WebcastEmoteChatMessage>,
    [Event.ENVELOPE]: EventHandler<WebcastEnvelopeMessage>,
    [Event.SUBSCRIBE]: EventHandler<WebcastSubNotifyMessage>,
    [Event.STREAM_END]: EventHandler<WebcastControlMessage>,

    // Custom Events
    [Event.FOLLOW]: EventHandler<WebcastSocialMessage>,
    [Event.SHARE]: EventHandler<WebcastSocialMessage>,

    // Control Events
    [ControlEvent.CONNECTED]: EventHandler<WebcastPushConnectionState>,
    [ControlEvent.DISCONNECTED]: EventHandler<void>,
    [ControlEvent.ERROR]: EventHandler<any>,
    [ControlEvent.RAW_DATA]: (type: string, data: Uint8Array) => void | Promise<void>;
    [ControlEvent.DECODEDDATA]: (type: string, event: any, data: Uint8Array) => void | Promise<void>;
    [ControlEvent.WSCONNECTED]: EventHandler<any>

};

export const WebcastEventMap: Partial<Record<keyof WebcastMessage, string>> = {
    'WebcastChatMessage': Event.CHAT,
    'WebcastMemberMessage': Event.MEMBER,
    'WebcastRoomUserSeqMessage': Event.ROOM_USER,
    'WebcastSocialMessage': Event.SOCIAL,
    'WebcastLikeMessage': Event.LIKE,
    'WebcastQuestionNewMessage': Event.QUESTION_NEW,
    'WebcastLinkMicBattle': Event.LINK_MIC_BATTLE,
    'WebcastLinkMicArmies': Event.LINK_MIC_ARMIES,
    'WebcastLiveIntroMessage': Event.LIVE_INTRO,
    'WebcastEmoteChatMessage': Event.EMOTE,
    'WebcastEnvelopeMessage': Event.ENVELOPE,
    'WebcastSubNotifyMessage': Event.SUBSCRIBE
};


export type WebcastPushConnectionState = {
    isConnected: boolean,
    roomId: string,
    roomInfo: RoomInfo | null,
    availableGifts: RoomGiftInfo | null
};
