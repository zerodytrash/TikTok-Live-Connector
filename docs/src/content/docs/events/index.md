---
title: Event catalog
description: Every modern-client event, its subscription name, and payload type.
sidebar:
  order: 0
---

Use `connection.on(WebcastEvent.NAME, handler)` for livestream messages and `ControlEvent.NAME` for connection notifications. Enum values and their string aliases identify the same listener.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.CHAT, (event) => {
    console.log(event.user?.displayId, event.content);
});
await connection.connect();
```

The tables cover all 68 `WebcastEvent` members in this checkout. See [control events](https://ttlc.docs.isaackogan.com/events/control/) for all eight `ControlEvent` members and their argument lists. Types are inferred from `ClientEventMap`; the [API reference](https://ttlc.docs.isaackogan.com/api/) and [protobuf reference](https://ttlc.docs.isaackogan.com/schema/) provide their full definitions.

Messages are not flattened. IDs and 64-bit counts often use strings; nested messages can be absent. A defined subscription does not guarantee that TikTok emits it in every room. Fields described only by the schema should not be treated as a verified live workflow.

## Find an event

| Event | Listener string | Payload | Reference |
| --- | --- | --- | --- |
| `WebcastEvent.CHAT` | `chat` | `WebcastChatMessage` | [Chat and audience](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#chat) |
| `WebcastEvent.MEMBER` | `member` | `WebcastMemberMessage` | [Chat and audience](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#member) |
| `WebcastEvent.ROOM_USER` | `roomUser` | `WebcastRoomUserSeqMessage` | [Chat and audience](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#room-user) |
| `WebcastEvent.LIKE` | `like` | `WebcastLikeMessage` | [Chat and audience](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#like) |
| `WebcastEvent.SOCIAL` | `social` | `WebcastSocialMessage` | [Chat and audience](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#social) |
| `WebcastEvent.FOLLOW` | `follow` | `WebcastSocialMessage` | [Chat and audience](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#follow) |
| `WebcastEvent.SHARE` | `share` | `WebcastSocialMessage` | [Chat and audience](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#share) |
| `WebcastEvent.QUESTION_NEW` | `questionNew` | `WebcastQuestionNewMessage` | [Chat and audience](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#question-new) |
| `WebcastEvent.EMOTE` | `emote` | `WebcastEmoteChatMessage` | [Chat and audience](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#emote) |
| `WebcastEvent.GIFT` | `gift` | `WebcastGiftMessage` | [Gifts and goals](https://ttlc.docs.isaackogan.com/events/gifts-and-goals/#gift) |
| `WebcastEvent.ENVELOPE` | `envelope` | `WebcastEnvelopeMessage` | [Gifts and goals](https://ttlc.docs.isaackogan.com/events/gifts-and-goals/#envelope) |
| `WebcastEvent.GOAL_UPDATE` | `goalUpdate` | `WebcastGoalUpdateMessage` | [Gifts and goals](https://ttlc.docs.isaackogan.com/events/gifts-and-goals/#goal-update) |
| `WebcastEvent.BOOST_CARD` | `boostCard` | `WebcastBoostCardMessage` | [Gifts and goals](https://ttlc.docs.isaackogan.com/events/gifts-and-goals/#boost-card) |
| `WebcastEvent.GIFT_BROADCAST` | `giftBroadcast` | `WebcastGiftBroadcastMessage` | [Gifts and goals](https://ttlc.docs.isaackogan.com/events/gifts-and-goals/#gift-broadcast) |
| `WebcastEvent.GIFT_DYNAMIC_RESTRICTION` | `giftDynamicRestriction` | `WebcastGiftDynamicRestrictionMessage` | [Gifts and goals](https://ttlc.docs.isaackogan.com/events/gifts-and-goals/#gift-dynamic-restriction) |
| `WebcastEvent.GIFT_PANEL_UPDATE` | `giftPanelUpdate` | `WebcastGiftPanelUpdateMessage` | [Gifts and goals](https://ttlc.docs.isaackogan.com/events/gifts-and-goals/#gift-panel-update) |
| `WebcastEvent.GIFT_PROMPT` | `giftPrompt` | `WebcastGiftPromptMessage` | [Gifts and goals](https://ttlc.docs.isaackogan.com/events/gifts-and-goals/#gift-prompt) |
| `WebcastEvent.LINK_MIC_BATTLE` | `linkMicBattle` | `WebcastLinkMicBattle` | [Battles and cohosting](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#link-mic-battle) |
| `WebcastEvent.LINK_MIC_ARMIES` | `linkMicArmies` | `WebcastLinkMicArmies` | [Battles and cohosting](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#link-mic-armies) |
| `WebcastEvent.LINK_MIC_BATTLE_ITEM_CARD` | `linkMicBattleItemCard` | `WebcastLinkMicBattleItemCard` | [Battles and cohosting](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#link-mic-battle-item-card) |
| `WebcastEvent.LINK_MIC_BATTLE_PUNISH_FINISH` | `linkMicBattlePunishFinish` | `WebcastLinkMicBattlePunishFinish` | [Battles and cohosting](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#link-mic-battle-punish-finish) |
| `WebcastEvent.LINK_MIC_BATTLE_TASK` | `linkMicBattleTask` | `WebcastLinkmicBattleTaskMessage` | [Battles and cohosting](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#link-mic-battle-task) |
| `WebcastEvent.LINK_MIC_FAN_TICKET_METHOD` | `linkMicFanTicketMethod` | `WebcastLinkMicFanTicketMethod` | [Battles and cohosting](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#link-mic-fan-ticket-method) |
| `WebcastEvent.LINK_MIC_METHOD` | `linkMicMethod` | `WebcastLinkMicMethod` | [Battles and cohosting](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#link-mic-method) |
| `WebcastEvent.LINK_MESSAGE` | `linkMessage` | `WebcastLinkMessage` | [Battles and cohosting](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#link-message) |
| `WebcastEvent.LINK_LAYER` | `linkLayer` | `WebcastLinkLayerMessage` | [Battles and cohosting](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#link-layer) |
| `WebcastEvent.LINK_MIC_LAYOUT_STATE` | `linkMicLayoutState` | `WebcastLinkMicLayoutStateMessage` | [Battles and cohosting](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#link-mic-layout-state) |
| `WebcastEvent.LINK_STATE` | `linkState` | `WebcastLinkStateMessage` | [Battles and cohosting](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#link-state) |
| `WebcastEvent.SPEAKER` | `speaker` | `WebcastSpeakerMessage` | [Battles and cohosting](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#speaker) |
| `WebcastEvent.SUPER_FAN` | `superFan` | `WebcastBarrageMessage` | [Subscriptions and super fans](https://ttlc.docs.isaackogan.com/events/subscriptions-and-fans/#super-fan) |
| `WebcastEvent.SUPER_FAN_JOIN` | `superFanJoin` | `WebcastBarrageMessage` | [Subscriptions and super fans](https://ttlc.docs.isaackogan.com/events/subscriptions-and-fans/#super-fan-join) |
| `WebcastEvent.SUPER_FAN_BOX` | `superFanBox` | `WebcastEnvelopeMessage` | [Subscriptions and super fans](https://ttlc.docs.isaackogan.com/events/subscriptions-and-fans/#super-fan-box) |
| `WebcastEvent.SUB_NOTIFY` | `subNotify` | `WebcastSubNotifyMessage` | [Subscriptions and super fans](https://ttlc.docs.isaackogan.com/events/subscriptions-and-fans/#sub-notify) |
| `WebcastEvent.SUB_PIN_EVENT` | `subPinEvent` | `WebcastSubPinEventMessage` | [Subscriptions and super fans](https://ttlc.docs.isaackogan.com/events/subscriptions-and-fans/#sub-pin-event) |
| `WebcastEvent.LIVE_INTRO` | `liveIntro` | `WebcastLiveIntroMessage` | [Room messages and display](https://ttlc.docs.isaackogan.com/events/room-and-display/#live-intro) |
| `WebcastEvent.BARRAGE` | `barrage` | `WebcastBarrageMessage` | [Room messages and display](https://ttlc.docs.isaackogan.com/events/room-and-display/#barrage) |
| `WebcastEvent.SYSTEM` | `system` | `WebcastSystemMessage` | [Room messages and display](https://ttlc.docs.isaackogan.com/events/room-and-display/#system) |
| `WebcastEvent.ROOM_MESSAGE` | `roomMessage` | `WebcastRoomMessage` | [Room messages and display](https://ttlc.docs.isaackogan.com/events/room-and-display/#room-message) |
| `WebcastEvent.CAPTION_MESSAGE` | `captionMessage` | `WebcastCaptionMessage` | [Room messages and display](https://ttlc.docs.isaackogan.com/events/room-and-display/#caption-message) |
| `WebcastEvent.IN_ROOM_BANNER` | `inRoomBanner` | `WebcastInRoomBannerMessage` | [Room messages and display](https://ttlc.docs.isaackogan.com/events/room-and-display/#in-room-banner) |
| `WebcastEvent.POLL_MESSAGE` | `pollMessage` | `WebcastPollMessage` | [Room messages and display](https://ttlc.docs.isaackogan.com/events/room-and-display/#poll-message) |
| `WebcastEvent.ROOM_PIN` | `roomPin` | `WebcastRoomPinMessage` | [Room messages and display](https://ttlc.docs.isaackogan.com/events/room-and-display/#room-pin) |
| `WebcastEvent.BOTTOM_MESSAGE` | `bottomMessage` | `WebcastBottomMessage` | [Room messages and display](https://ttlc.docs.isaackogan.com/events/room-and-display/#bottom-message) |
| `WebcastEvent.CAPSULE` | `capsule` | `WebcastCapsuleMessage` | [Room messages and display](https://ttlc.docs.isaackogan.com/events/room-and-display/#capsule) |
| `WebcastEvent.GUIDE` | `guide` | `WebcastGuideMessage` | [Room messages and display](https://ttlc.docs.isaackogan.com/events/room-and-display/#guide) |
| `WebcastEvent.MARQUEE_ANNOUNCEMENT` | `marqueeAnnouncement` | `WebcastMarqueeAnnouncementMessage` | [Room messages and display](https://ttlc.docs.isaackogan.com/events/room-and-display/#marquee-announcement) |
| `WebcastEvent.NOTICE` | `notice` | `WebcastNoticeMessage` | [Room messages and display](https://ttlc.docs.isaackogan.com/events/room-and-display/#notice) |
| `WebcastEvent.ROOM_NOTIFY` | `roomNotify` | `WebcastRoomNotifyMessage` | [Room messages and display](https://ttlc.docs.isaackogan.com/events/room-and-display/#room-notify) |
| `WebcastEvent.TOAST` | `toast` | `WebcastToastMessage` | [Room messages and display](https://ttlc.docs.isaackogan.com/events/room-and-display/#toast) |
| `WebcastEvent.VIEWER_PICKS_UPDATE` | `viewerPicksUpdate` | `WebcastViewerPicksUpdateMessage` | [Room messages and display](https://ttlc.docs.isaackogan.com/events/room-and-display/#viewer-picks-update) |
| `WebcastEvent.HOURLY_RANK` | `hourlyRank` | `WebcastHourlyRankRewardMessage` | [Rankings](https://ttlc.docs.isaackogan.com/events/rankings/#hourly-rank) |
| `WebcastEvent.RANK_UPDATE` | `rankUpdate` | `WebcastRankUpdateMessage` | [Rankings](https://ttlc.docs.isaackogan.com/events/rankings/#rank-update) |
| `WebcastEvent.RANK_TEXT` | `rankText` | `WebcastRankTextMessage` | [Rankings](https://ttlc.docs.isaackogan.com/events/rankings/#rank-text) |
| `WebcastEvent.GAME_RANK_NOTIFY` | `gameRankNotify` | `WebcastGameRankNotifyMessage` | [Rankings](https://ttlc.docs.isaackogan.com/events/rankings/#game-rank-notify) |
| `WebcastEvent.IM_DELETE` | `imDelete` | `WebcastImDeleteMessage` | [Moderation and access](https://ttlc.docs.isaackogan.com/events/moderation-and-access/#im-delete) |
| `WebcastEvent.UNAUTHORIZED_MEMBER` | `unauthorizedMember` | `WebcastUnauthorizedMemberMessage` | [Moderation and access](https://ttlc.docs.isaackogan.com/events/moderation-and-access/#unauthorized-member) |
| `WebcastEvent.MSG_DETECT` | `msgDetect` | `WebcastMsgDetectMessage` | [Moderation and access](https://ttlc.docs.isaackogan.com/events/moderation-and-access/#msg-detect) |
| `WebcastEvent.ROOM_VERIFY` | `roomVerify` | `WebcastRoomVerifyMessage` | [Moderation and access](https://ttlc.docs.isaackogan.com/events/moderation-and-access/#room-verify) |
| `WebcastEvent.ACCESS_CONTROL` | `accessControl` | `WebcastAccessControlMessage` | [Moderation and access](https://ttlc.docs.isaackogan.com/events/moderation-and-access/#access-control) |
| `WebcastEvent.ACCESS_RECALL` | `accessRecall` | `WebcastAccessRecallMessage` | [Moderation and access](https://ttlc.docs.isaackogan.com/events/moderation-and-access/#access-recall) |
| `WebcastEvent.PERCEPTION` | `perception` | `WebcastPerceptionMessage` | [Moderation and access](https://ttlc.docs.isaackogan.com/events/moderation-and-access/#perception) |
| `WebcastEvent.OEC_LIVE_SHOPPING` | `oecLiveShopping` | `WebcastOecLiveShoppingMessage` | [Games, commerce, and partnerships](https://ttlc.docs.isaackogan.com/events/games-and-commerce/#oec-live-shopping) |
| `WebcastEvent.LIVE_GAME_INTRO` | `liveGameIntro` | `WebcastLiveGameIntroMessage` | [Games, commerce, and partnerships](https://ttlc.docs.isaackogan.com/events/games-and-commerce/#live-game-intro) |
| `WebcastEvent.PARTNERSHIP_DROPS_UPDATE` | `partnershipDropsUpdate` | `WebcastPartnershipDropsUpdateMessage` | [Games, commerce, and partnerships](https://ttlc.docs.isaackogan.com/events/games-and-commerce/#partnership-drops-update) |
| `WebcastEvent.PARTNERSHIP_GAME_OFFLINE` | `partnershipGameOffline` | `WebcastPartnershipGameOfflineMessage` | [Games, commerce, and partnerships](https://ttlc.docs.isaackogan.com/events/games-and-commerce/#partnership-game-offline) |
| `WebcastEvent.PARTNERSHIP_PUNISH` | `partnershipPunish` | `WebcastPartnershipPunishMessage` | [Games, commerce, and partnerships](https://ttlc.docs.isaackogan.com/events/games-and-commerce/#partnership-punish) |
| `WebcastEvent.CONTROL_MESSAGE` | `controlMessage` | `WebcastControlMessage` | [Stream control](https://ttlc.docs.isaackogan.com/events/stream-control/#control-message) |
| `WebcastEvent.STREAM_END` | `streamEnd` | `{ action: ControlAction }` | [Stream control](https://ttlc.docs.isaackogan.com/events/stream-control/#stream-end) |

## Delivery and processing

Register listeners before connecting to receive initial data. Disable `processInitialData` if your application should skip the signing response's historical batch.

The modern dispatcher sends each recognized social follow/share to its derived event instead of SOCIAL. Super-fan barrage/envelope messages additionally emit their original BARRAGE/ENVELOPE event; do not double-count them if listening to both.

Asynchronous listeners need their own rejection handling. The client does not await your listener's returned promise. [Decode filters](https://ttlc.docs.isaackogan.com/advanced/protocol/) affect all connections and also suppress events derived from filtered messages.
