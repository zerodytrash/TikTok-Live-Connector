import { EventEmitter } from 'node:events';
import { ControlEvent, WebcastEvent } from '@/types/events';
import { TikTokLiveConstructorConnectionOptions, WebcastEventMessage } from '@/types';
import { simplifyObject } from '@/lib/client/legacy/data-converter';
import { BaseProtoMessage, ProtoMessageFetchResult, WebcastControlMessage } from 'tiktok-live-proto/v3';
import { TikTokLiveConnection } from '@/lib/client';

export * from './data-converter';

/**
 * Cast that preserves the real `(uniqueId, options)` constructor signature while exposing the
 * loose `EventEmitter.emit(...)` overload. Required because the legacy class emits the flattened
 * `simplifiedObj` shape, which doesn't satisfy the strict `ClientEventMap` payload types.
 */
type WebcastPushConnectionBase = new (
    uniqueId: string,
    options: TikTokLiveConstructorConnectionOptions
) => EventEmitter & TikTokLiveConnection;

/**
 * The legacy WebcastPushConnection class for backwards compatibility.
 * @deprecated Use TikTokLiveConnection instead.
 */
export class WebcastPushConnection extends (TikTokLiveConnection as unknown as WebcastPushConnectionBase) {

    protected async processProtoMessageFetchResult(fetchResult: ProtoMessageFetchResult): Promise<void> {

        fetchResult.messages.forEach((message) => {
            this.emit(ControlEvent.RAW_DATA, message.method, message.payload);
        });

        // Process and emit decoded data depending on the message type
        fetchResult.messages
            .forEach((message: BaseProtoMessage) => {
                let simplifiedObj = simplifyObject(message.method as keyof WebcastEventMessage, message.decodedData?.data || {});
                this.emit(ControlEvent.DECODED_DATA, message.method, simplifiedObj, message.payload);

                switch (message.method) {
                    case 'WebcastControlMessage':
                        // Known control actions:
                        // 3 = Stream terminated by user
                        // 4 = Stream terminated by platform moderator (ban)
                        const action = (message.decodedData?.data as WebcastControlMessage | undefined)?.action;
                        if (action !== undefined && [3, 4].includes(action)) {
                            this.emit(WebcastEvent.STREAM_END, { action });
                            void this.disconnect().catch(() => {});
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
                    case 'WebcastBarrageMessage': {
                        this.emit(WebcastEvent.BARRAGE, simplifiedObj);
                        const displayTypes = [
                            simplifiedObj.content?.displayType,
                            simplifiedObj.commonBarrageContent?.displayType,
                            simplifiedObj.displayType
                        ]
                            .filter((v: unknown): v is string => typeof v === 'string' && v.length > 0)
                            .map((v: string) => v.toLowerCase());

                        if (displayTypes.some((v) => v.includes('ttlive_superfan_commentnotif_superfanjoined'))) {
                            this.emit(WebcastEvent.SUPER_FAN_JOIN, simplifiedObj);
                        } else if (displayTypes.some((v) => v.includes('ttlive_superfan'))) {
                            this.emit(WebcastEvent.SUPER_FAN, simplifiedObj);
                        }
                        break;
                    }
                    case 'WebcastEnvelopeMessage':
                        this.emit(WebcastEvent.ENVELOPE, simplifiedObj);
                        if (
                            simplifiedObj.displayType?.toLowerCase()?.includes('ttlive_superfanbox')
                            || simplifiedObj.envelopeInfo?.businessType === 19
                        ) {
                            this.emit(WebcastEvent.SUPER_FAN_BOX, simplifiedObj);
                        }
                        break;
                }
            });
    }


}

