import {
    WebcastChatMessage,
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
import { RoomGiftInfo, RoomInfo } from '@/types/index';

export enum ControlEvent {
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    ERROR = 'error',
    RAW_DATA = 'rawData',
    DECODEDDATA = 'decodedData',
    STREAM_END = 'streamEnd',
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
    SHARE = 'share'
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

    // Custom Events
    [Event.FOLLOW]: EventHandler<WebcastSocialMessage>,
    [Event.SHARE]: EventHandler<WebcastSocialMessage>,

    // Control Events
    [ControlEvent.CONNECTED]: EventHandler<WebcastPushConnectionState>,
    [ControlEvent.DISCONNECTED]: EventHandler<void>,
    [ControlEvent.ERROR]: EventHandler<any>,
    [ControlEvent.RAW_DATA]: (type: string, data: Uint8Array) => void | Promise<void>;
    [ControlEvent.DECODEDDATA]: (type: string, event: any, data: Uint8Array) => void | Promise<void>;
    [ControlEvent.STREAM_END]: EventHandler<any>,
    [ControlEvent.WSCONNECTED]: EventHandler<any>

};


export type WebcastPushConnectionState = {
    isConnected: boolean,
    roomId: string,
    roomInfo: RoomInfo | null,
    availableGifts: RoomGiftInfo | null
};
