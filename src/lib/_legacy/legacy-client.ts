import { WebcastControlMessage, WebcastResponse } from '@/types/tiktok-schema';
import { EventEmitter } from 'node:events';
import { simplifyObject } from '@/lib/_legacy/data-converter';
import { WebcastPushConnection } from '@/lib';
import { ControlEvent, Event } from '@/types/events';

/**
 * Emits events in the same way as the original WebcastPushConnection class for backwards compatibility.
 * Specifically, uses the data-converter.js
 */
export class LegacyWebcastPushConnection extends (WebcastPushConnection as new (...args: any[]) => EventEmitter & WebcastPushConnection) {

    protected async processWebcastResponse(webcastResponse: WebcastResponse): Promise<void> {

        webcastResponse.messages.forEach((message) => {
            this.emit(ControlEvent.RAW_DATA, message.type, message.binary);
        });

        // Process and emit decoded data depending on the message type
        webcastResponse.messages
            .forEach((message) => {
                let simplifiedObj = simplifyObject(message.decodedData || {});
                this.emit(ControlEvent.DECODEDDATA, message.type, simplifiedObj, message.binary);

                switch (message.type) {
                    case 'WebcastControlMessage':
                        // Known control actions:
                        // 3 = Stream terminated by user
                        // 4 = Stream terminated by platform moderator (ban)
                        const action = (message.decodedData as WebcastControlMessage).action;
                        if ([3, 4].includes(action)) {
                            this.emit(ControlEvent.STREAM_END, { action });
                            this.disconnect();
                        }
                        break;
                    case 'WebcastRoomUserSeqMessage':
                        this.emit(Event.ROOM_USER, simplifiedObj);
                        break;
                    case 'WebcastChatMessage':
                        this.emit(Event.CHAT, simplifiedObj);
                        break;
                    case 'WebcastMemberMessage':
                        this.emit(Event.MEMBER, simplifiedObj);
                        break;
                    case 'WebcastGiftMessage':
                        // Add extended gift info if option enabled
                        if (Array.isArray(this.availableGifts) && simplifiedObj.giftId) {
                            simplifiedObj.extendedGiftInfo = this.availableGifts.find((x) => x.id === simplifiedObj.giftId);
                        }
                        this.emit(Event.GIFT, simplifiedObj);
                        break;
                    case 'WebcastSocialMessage':
                        this.emit(Event.SOCIAL, simplifiedObj);
                        if (simplifiedObj.displayType?.includes('follow')) {
                            this.emit(Event.FOLLOW, simplifiedObj);
                        }
                        if (simplifiedObj.displayType?.includes('share')) {
                            this.emit(Event.SHARE, simplifiedObj);
                        }
                        break;
                    case 'WebcastLikeMessage':
                        this.emit(Event.LIKE, simplifiedObj);
                        break;
                    case 'WebcastQuestionNewMessage':
                        this.emit(Event.QUESTION_NEW, simplifiedObj);
                        break;
                    case 'WebcastLinkMicBattle':
                        this.emit(Event.LINK_MIC_BATTLE, simplifiedObj);
                        break;
                    case 'WebcastLinkMicArmies':
                        this.emit(Event.LINK_MIC_ARMIES, simplifiedObj);
                        break;
                    case 'WebcastLiveIntroMessage':
                        this.emit(Event.LIVE_INTRO, simplifiedObj);
                        break;
                    case 'WebcastEmoteChatMessage':
                        this.emit(Event.EMOTE, simplifiedObj);
                        break;
                    case 'WebcastEnvelopeMessage':
                        this.emit(Event.ENVELOPE, simplifiedObj);
                        break;
                    case 'WebcastSubNotifyMessage':
                        this.emit(Event.SUBSCRIBE, simplifiedObj);
                        break;
                }
            });
    }


}

