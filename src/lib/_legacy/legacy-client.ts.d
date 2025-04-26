import { WebcastControlMessage, WebcastResponse } from '@/types/tiktok-schema';
import { EventEmitter } from 'node:events';
import { simplifyObject } from '@/lib/_legacy/data-converter';
import { WebcastPushConnection } from '@/lib';
import { ControlEvents, CustomEvents, MessageEvents } from '@/types/events';

export * from './data-converter';

export class LegacyWebcastPushConnection extends (WebcastPushConnection as new (...args: any[]) => EventEmitter & WebcastPushConnection) {

    protected processWebcastResponse(webcastResponse: WebcastResponse) {

        webcastResponse.messages.forEach((message) => {
            this.emit(ControlEvents.RAWDATA, message.type, message.binary);
        });

        // Process and emit decoded data depending on the message type
        webcastResponse.messages
            .filter((x) => x.decodedData)
            .forEach((message) => {
                let simplifiedObj = simplifyObject(message.decodedData);
                this.emit(ControlEvents.DECODEDDATA, message.type, simplifiedObj, message.binary);

                switch (message.type) {
                    case 'WebcastControlMessage':
                        // Known control actions:
                        // 3 = Stream terminated by user
                        // 4 = Stream terminated by platform moderator (ban)
                        const action = (message.decodedData as WebcastControlMessage).action;
                        if ([3, 4].includes(action)) {
                            this.emit(ControlEvents.STREAMEND, { action });
                            this.disconnect();
                        }
                        break;
                    case 'WebcastRoomUserSeqMessage':
                        this.emit(MessageEvents.ROOMUSER, simplifiedObj);
                        break;
                    case 'WebcastChatMessage':
                        this.emit(MessageEvents.CHAT, simplifiedObj);
                        break;
                    case 'WebcastMemberMessage':
                        this.emit(MessageEvents.MEMBER, simplifiedObj);
                        break;
                    case 'WebcastGiftMessage':
                        // Add extended gift info if option enabled
                        if (Array.isArray(this.availableGifts) && simplifiedObj.giftId) {
                            simplifiedObj.extendedGiftInfo = this.availableGifts.find((x) => x.id === simplifiedObj.giftId);
                        }
                        this.emit(MessageEvents.GIFT, simplifiedObj);
                        break;
                    case 'WebcastSocialMessage':
                        this.emit(MessageEvents.SOCIAL, simplifiedObj);
                        if (simplifiedObj.displayType?.includes('follow')) {
                            this.emit(CustomEvents.FOLLOW, simplifiedObj);
                        }
                        if (simplifiedObj.displayType?.includes('share')) {
                            this.emit(CustomEvents.SHARE, simplifiedObj);
                        }
                        break;
                    case 'WebcastLikeMessage':
                        this.emit(MessageEvents.LIKE, simplifiedObj);
                        break;
                    case 'WebcastQuestionNewMessage':
                        this.emit(MessageEvents.QUESTIONNEW, simplifiedObj);
                        break;
                    case 'WebcastLinkMicBattle':
                        this.emit(MessageEvents.LINKMICBATTLE, simplifiedObj);
                        break;
                    case 'WebcastLinkMicArmies':
                        this.emit(MessageEvents.LINKMICARMIES, simplifiedObj);
                        break;
                    case 'WebcastLiveIntroMessage':
                        this.emit(MessageEvents.LIVEINTRO, simplifiedObj);
                        break;
                    case 'WebcastEmoteChatMessage':
                        this.emit(MessageEvents.EMOTE, simplifiedObj);
                        break;
                    case 'WebcastEnvelopeMessage':
                        this.emit(MessageEvents.ENVELOPE, simplifiedObj);
                        break;
                    case 'WebcastSubNotifyMessage':
                        this.emit(MessageEvents.SUBSCRIBE, simplifiedObj);
                        break;
                }
            });
    }


}

