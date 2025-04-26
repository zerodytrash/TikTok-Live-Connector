import {
    WebcastChatMessage, WebcastEmoteChatMessage, WebcastEnvelopeMessage,
    WebcastGiftMessage, WebcastLikeMessage, WebcastLinkMicArmies, WebcastLinkMicBattle, WebcastLiveIntroMessage,
    WebcastMemberMessage, WebcastQuestionNewMessage,
    WebcastRoomUserSeqMessage, WebcastSocialMessage, WebcastSubNotifyMessage
} from '@/types/tiktok-schema';
import { RoomGiftInfo, RoomInfo } from '@/types/index';

export enum ControlEvents {
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    ERROR = 'error',
    RAWDATA = 'rawData',
    DECODEDDATA = 'decodedData',
    STREAMEND = 'streamEnd',
    WSCONNECTED = 'websocketConnected'
}


export enum MessageEvents {
    CHAT = 'chat',
    MEMBER = 'member',
    GIFT = 'gift',
    ROOMUSER = 'roomUser',
    SOCIAL = 'social',
    LIKE = 'like',
    QUESTIONNEW = 'questionNew',
    LINKMICBATTLE = 'linkMicBattle',
    LINKMICARMIES = 'linkMicArmies',
    LIVEINTRO = 'liveIntro',
    EMOTE = 'emote',
    ENVELOPE = 'envelope',
    SUBSCRIBE = 'subscribe'
}

export enum CustomEvents {
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
    [MessageEvents.CHAT]: EventHandler<WebcastChatMessage>
    [MessageEvents.MEMBER]: EventHandler<WebcastMemberMessage>
    [MessageEvents.GIFT]: EventHandler<WebcastGiftMessage>,
    [MessageEvents.ROOMUSER]: EventHandler<WebcastRoomUserSeqMessage>,
    [MessageEvents.SOCIAL]: EventHandler<WebcastSocialMessage>,
    [MessageEvents.LIKE]: EventHandler<WebcastLikeMessage>,
    [MessageEvents.QUESTIONNEW]: EventHandler<WebcastQuestionNewMessage>,
    [MessageEvents.LINKMICBATTLE]: EventHandler<WebcastLinkMicBattle>,
    [MessageEvents.LINKMICARMIES]: EventHandler<WebcastLinkMicArmies>,
    [MessageEvents.LIVEINTRO]: EventHandler<WebcastLiveIntroMessage>,
    [MessageEvents.EMOTE]: EventHandler<WebcastEmoteChatMessage>,
    [MessageEvents.ENVELOPE]: EventHandler<WebcastEnvelopeMessage>,
    [MessageEvents.SUBSCRIBE]: EventHandler<WebcastSubNotifyMessage>,

    // Custom Events
    [CustomEvents.FOLLOW]: EventHandler<WebcastSocialMessage>,
    [CustomEvents.SHARE]: EventHandler<WebcastSocialMessage>,

    // Control Events
    [ControlEvents.CONNECTED]: EventHandler<WebcastPushConnectionState>,
    [ControlEvents.DISCONNECTED]: EventHandler<void>,
    [ControlEvents.ERROR]: EventHandler<any>,
    [ControlEvents.RAWDATA]: (type: string, data: Uint8Array) => void | Promise<void>;
    [ControlEvents.DECODEDDATA]: (type: string, event: any, data: Uint8Array) => void | Promise<void>;
    [ControlEvents.STREAMEND]: EventHandler<any>,
    [ControlEvents.WSCONNECTED]: EventHandler<any>

};


export type WebcastPushConnectionState = {
    isConnected: boolean,
    roomId: string,
    roomInfo: RoomInfo | null,
    availableGifts: RoomGiftInfo | null
};
