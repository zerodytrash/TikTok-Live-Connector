import { WebcastEventMessage } from './index';
import { QuestionDetails, WebcastEmoteChatMessage, WebcastSubEmote } from '../proto/tiktokSchema';

export type BadgeSimplified = {
    type?: string;
    badgeSceneType: number;
    url?: string;
    level?: number;
}



export type UserSimplified = {
    userId?: string;
    secUid?: string;
    uniqueId?: string;
    nickname?: string;
    profilePictureUrl?: string;
    followRole?: number;
    userBadges: BadgeSimplified[];
    userSceneTypes: number[];
    userDetails: {
        createTime?: string;
        bioDescription?: string;
        profilePictureUrls?: string[];
    };
    followInfo?: {
        followingCount: number;
        followerCount: number;
        followStatus: number;
        pushStatus: number;
    };
    isModerator: boolean;
    isNewGifter: boolean;
    isSubscriber: boolean;
    topGifterRank?: number;
    gifterLevel: number;
    teamMemberLevel: number;
}

export interface BattleArmy {
    hostUserId: string;
    points: number;
    participants: [];
}

export type EmoteSimplified = {
    emoteId: string;
    emoteImageUrl: string;
}

export type ChatEmoteSimplified = EmoteSimplified & {
    placeInComment: number;

}

declare module '../proto/tiktokSchema' {
    export interface Message {
        decodedData?: WebcastEventMessage[keyof WebcastEventMessage];
    }

    export interface WebcastQuestionNewMessage extends Partial<QuestionDetails> {
    }

    export interface WebcastGiftMessage {
        gift: {
            gift_id: number;
            repeat_count: number;
            repeat_end: number;
            gift_type: number;
        };
    }

    export interface WebcastLinkMicArmies {
        battleArmies: BattleArmy[];
    }

    export interface WebcastEmoteChatMessage extends EmoteSimplified {
    }

    export interface WebcastSubEmote extends EmoteSimplified {

    }

    export interface WebcastChatMessage {
        emotes?: ChatEmoteSimplified[];
    }
}
