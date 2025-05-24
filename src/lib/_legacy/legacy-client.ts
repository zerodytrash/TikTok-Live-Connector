import { ProtoMessageFetchResult, WebcastControlMessage } from '@/types/tiktok/webcast';
import { EventEmitter } from 'node:events';
import { simplifyObject } from '@/lib/_legacy/data-converter';
import { TikTokLiveConnection } from '@/lib';
import { ControlEvent, WebcastEvent } from '@/types/events';

/**
 * The legacy WebcastPushConnection class for backwards compatibility.
 * @deprecated Use TikTokLiveConnection instead.
 */
export class WebcastPushConnection extends (TikTokLiveConnection as new (...args: any[]) => EventEmitter & TikTokLiveConnection) {

    protected async processProtoMessageFetchResult(fetchResult: ProtoMessageFetchResult): Promise<void> {

        fetchResult.messages.forEach((message) => {
            this.emit(ControlEvent.RAW_DATA, message.type, message.payload);
        });

        // Process and emit decoded data depending on the message type
        fetchResult.messages
            .forEach((message) => {
                let simplifiedObj = simplifyObject(message.decodedData.data || {});
                this.emit(ControlEvent.DECODED_DATA, message.type, simplifiedObj, message.payload);

                switch (message.type) {
                    case 'WebcastControlMessage':
                        // Known control actions:
                        // 3 = Stream terminated by user
                        // 4 = Stream terminated by platform moderator (ban)
                        const action = (message.decodedData.data as WebcastControlMessage).action;
                        if ([3, 4].includes(action)) {
                            this.emit(WebcastEvent.STREAM_END, { action });
                            this.disconnect();
                        }
                        break;
                    case 'WebcastRoomUserSeqMessage':
                        this.emit(WebcastEvent.ROOM_USER, simplifiedObj);
                        break;
                    case 'WebcastChatMessage':
                        this.emit(WebcastEvent.CHAT, simplifiedObj);
                        break;
                    case 'WebcastMemberMessage':
                        this.emit(WebcastEvent.MEMBER, simplifiedObj);
                        break;
                    case 'WebcastGiftMessage':
                        // Add extended gift info if option enabled
                        if (Array.isArray(this.availableGifts) && simplifiedObj.giftId) {
                            simplifiedObj.extendedGiftInfo = this.availableGifts.find((x) => x.id === simplifiedObj.giftId);
                        }
                        this.emit(WebcastEvent.GIFT, simplifiedObj);
                        break;
                    case 'WebcastSocialMessage':
                        this.emit(WebcastEvent.SOCIAL, simplifiedObj);
                        if (simplifiedObj.displayType?.includes('follow')) {
                            this.emit(WebcastEvent.FOLLOW, simplifiedObj);
                        }
                        if (simplifiedObj.displayType?.includes('share')) {
                            this.emit(WebcastEvent.SHARE, simplifiedObj);
                        }
                        break;
                    case 'WebcastLikeMessage':
                        this.emit(WebcastEvent.LIKE, simplifiedObj);
                        break;
                    case 'WebcastQuestionNewMessage':
                        this.emit(WebcastEvent.QUESTION_NEW, simplifiedObj);
                        break;
                    case 'WebcastLinkMicBattle':
                        this.emit(WebcastEvent.LINK_MIC_BATTLE, simplifiedObj);
                        break;
                    case 'WebcastLinkMicArmies':
                        this.emit(WebcastEvent.LINK_MIC_ARMIES, simplifiedObj);
                        break;
                    case 'WebcastLiveIntroMessage':
                        this.emit(WebcastEvent.LIVE_INTRO, simplifiedObj);
                        break;
                    case 'WebcastEmoteChatMessage':
                        this.emit(WebcastEvent.EMOTE, simplifiedObj);
                        break;
                    case 'WebcastEnvelopeMessage':
                        this.emit(WebcastEvent.ENVELOPE, simplifiedObj);
                        break;
                    case 'WebcastSubNotifyMessage':
                        this.emit(WebcastEvent.SUBSCRIBE, simplifiedObj);
                        break;
                }
            });
    }


}

