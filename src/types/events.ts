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
} from '@/types/tiktok/webcast';
import { RoomGiftInfo, RoomInfo, WebcastEventMessage, WebcastMessage } from '@/types/client';
import TikTokWsClient from '@/lib/ws/lib/ws-client';
import { ControlAction } from '@/types/tiktok/enums';

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
    // Old Events - Added 1.X.X
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
    BARRAGE = 'barrage',

    // New Events - Added 2.0.4
    HOURLY_RANK = 'hourlyRank',
    GOAL_UPDATE = 'goalUpdate',
    ROOM_MESSAGE = 'roomMessage',
    CAPTION_MESSAGE = 'captionMessage',
    IM_DELETE = 'imDelete',
    IN_ROOM_BANNER = 'inRoomBanner',
    RANK_UPDATE = 'rankUpdate',
    POLL_MESSAGE = 'pollMessage',
    RANK_TEXT = 'rankText',
    LINK_MIC_BATTLE_PUNISH_FINISH = 'linkMicBattlePunishFinish',
    LINK_MIC_BATTLE_TASK = 'linkMicBattleTask',
    LINK_MIC_FAN_TICKET_METHOD = 'linkMicFanTicketMethod',
    LINK_MIC_METHOD = 'linkMicMethod',
    UNAUTHORIZED_MEMBER = 'unauthorizedMember',
    OEC_LIVE_SHOPPING = 'oecLiveShopping',
    MSG_DETECT = 'msgDetect',
    LINK_MESSAGE = 'linkMessage',
    ROOM_VERIFY = 'roomVerify',
    LINK_LAYER = 'linkLayer',
    ROOM_PIN = 'roomPin',
}


export enum ConnectState {
    DISCONNECTED = 'DISCONNECTED',
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED'
}

export type EventHandler<T> = (event: T) => void | Promise<void>;

export type ClientEventMap = {

    // Custom Events
    [WebcastEvent.FOLLOW]: EventHandler<WebcastSocialMessage>,
    [WebcastEvent.SHARE]: EventHandler<WebcastSocialMessage>,
    [WebcastEvent.STREAM_END]: (event: { action: ControlAction }) => void | Promise<void>,

    // Control Events
    [ControlEvent.CONNECTED]: EventHandler<TikTokLiveConnectionState>,
    [ControlEvent.DISCONNECTED]: EventHandler<void>,
    [ControlEvent.ERROR]: EventHandler<any>,
    [ControlEvent.WEBSOCKET_DATA]: EventHandler<Uint8Array>,
    [ControlEvent.RAW_DATA]: (type: string, data: Uint8Array) => void | Promise<void>,
    [ControlEvent.DECODED_DATA]: (type: string, event: any, binary: Uint8Array) => void | Promise<void>,
    [ControlEvent.WEBSOCKET_CONNECTED]: EventHandler<TikTokWsClient>,

    // Old Message Events - Added 1.X.X
    [WebcastEvent.CHAT]: EventHandler<WebcastChatMessage>,
    [WebcastEvent.MEMBER]: EventHandler<WebcastMemberMessage>,
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
    [WebcastEvent.CONTROL_MESSAGE]: EventHandler<WebcastControlMessage>,
    [WebcastEvent.BARRAGE]: EventHandler<WebcastMessage>,
    [WebcastEvent.HOURLY_RANK]: EventHandler<WebcastMessage>,

    // New Message Events - Added 2.0.4
    [WebcastEvent.GOAL_UPDATE]: EventHandler<WebcastMessage>,
    [WebcastEvent.ROOM_MESSAGE]: EventHandler<WebcastMessage>,
    [WebcastEvent.CAPTION_MESSAGE]: EventHandler<WebcastMessage>,
    [WebcastEvent.IM_DELETE]: EventHandler<WebcastMessage>,
    [WebcastEvent.IN_ROOM_BANNER]: EventHandler<WebcastMessage>,
    [WebcastEvent.RANK_UPDATE]: EventHandler<WebcastMessage>,
    [WebcastEvent.POLL_MESSAGE]: EventHandler<WebcastMessage>,
    [WebcastEvent.RANK_TEXT]: EventHandler<WebcastMessage>,
    [WebcastEvent.LINK_MIC_BATTLE_PUNISH_FINISH]: EventHandler<WebcastMessage>,
    [WebcastEvent.LINK_MIC_BATTLE_TASK]: EventHandler<WebcastMessage>,
    [WebcastEvent.LINK_MIC_FAN_TICKET_METHOD]: EventHandler<WebcastMessage>,
    [WebcastEvent.LINK_MIC_METHOD]: EventHandler<WebcastMessage>,
    [WebcastEvent.UNAUTHORIZED_MEMBER]: EventHandler<WebcastMessage>,
    [WebcastEvent.OEC_LIVE_SHOPPING]: EventHandler<WebcastMessage>,
    [WebcastEvent.MSG_DETECT]: EventHandler<WebcastMessage>,
    [WebcastEvent.LINK_MESSAGE]: EventHandler<WebcastMessage>,
    [WebcastEvent.ROOM_VERIFY]: EventHandler<WebcastMessage>,
    [WebcastEvent.LINK_LAYER]: EventHandler<WebcastMessage>,
    [WebcastEvent.ROOM_PIN]: EventHandler<WebcastMessage>,
};

export const WebcastEventMap: Record<BasicWebcastEventMessage, keyof ClientEventMap> = {

    // Old Events - Added 1.X.X
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
    'WebcastBarrageMessage': WebcastEvent.BARRAGE,

    // New Events - Added 2.0.4
    'WebcastHourlyRankMessage': WebcastEvent.HOURLY_RANK,
    'WebcastGoalUpdateMessage': WebcastEvent.GOAL_UPDATE,
    'WebcastRoomMessage': WebcastEvent.ROOM_MESSAGE,
    'WebcastCaptionMessage': WebcastEvent.CAPTION_MESSAGE,
    'WebcastControlMessage': WebcastEvent.CONTROL_MESSAGE,
    'WebcastImDeleteMessage': WebcastEvent.IM_DELETE,
    'WebcastInRoomBannerMessage': WebcastEvent.IN_ROOM_BANNER,
    'WebcastRankUpdateMessage': WebcastEvent.RANK_UPDATE,
    'WebcastPollMessage': WebcastEvent.POLL_MESSAGE,
    'WebcastRankTextMessage': WebcastEvent.RANK_TEXT,
    'WebcastLinkMicBattlePunishFinish': WebcastEvent.LINK_MIC_BATTLE_PUNISH_FINISH,
    'WebcastLinkmicBattleTaskMessage': WebcastEvent.LINK_MIC_BATTLE_TASK,
    'WebcastLinkMicFanTicketMethod': WebcastEvent.LINK_MIC_FAN_TICKET_METHOD,
    'WebcastLinkMicMethod': WebcastEvent.LINK_MIC_METHOD,
    'WebcastUnauthorizedMemberMessage': WebcastEvent.UNAUTHORIZED_MEMBER,
    'WebcastOecLiveShoppingMessage': WebcastEvent.OEC_LIVE_SHOPPING,
    'WebcastMsgDetectMessage': WebcastEvent.MSG_DETECT,
    'WebcastLinkMessage': WebcastEvent.LINK_MESSAGE,
    'RoomVerifyMessage': WebcastEvent.ROOM_VERIFY,
    'WebcastLinkLayerMessage': WebcastEvent.LINK_LAYER,
    'WebcastRoomPinMessage': WebcastEvent.ROOM_PIN
};


export type BasicWebcastEventMessage = keyof Omit<
    WebcastEventMessage,
    'WebcastGiftMessage'
>;


export type TikTokLiveConnectionState = {
    isConnected: boolean,
    roomId: string,
    roomInfo: RoomInfo | null,
    availableGifts: RoomGiftInfo | null
};
