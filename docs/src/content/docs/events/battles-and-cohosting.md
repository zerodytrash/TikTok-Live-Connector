---
title: Battles and cohosting
description: Battles and cohosting events, payloads, and dispatch behavior.
---

These messages retain their original battle, channel, anchor, and team fields. The client does not normalize them into a single battle model. See [battles](https://ttlc.docs.isaackogan.com/guides/battles/) and [Power-Ups](https://ttlc.docs.isaackogan.com/guides/power-ups/) for interpretation and limits.

Each entry below lists the listener alias and payload type. Field lists are selected schema fields, not guarantees that every nested value will be populated. The [protobuf reference](https://ttlc.docs.isaackogan.com/schema/) contains the full message definitions.

Replace `creator_username` with a live creator. Each example registers its listener before connecting.

## Link mic battle

**Subscribe:** `WebcastEvent.LINK_MIC_BATTLE` or `"linkMicBattle"`

**Payload:** `WebcastLinkMicBattle`

A battle action/state message. Inspect `action`, `battleSettings`, participant structures, and team/result data; every arrival is not necessarily a new battle.

Schema fields include `battleId`, `battleSettings`, `action`, `battleResult`, `fuzzyDisplayConfig`, `inviteeGiftPermissionType`, `armies`, `anchorsInfo`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.LINK_MIC_BATTLE, (event) => {
    console.log('Battle:', event.battleId, 'action:', event.action);
    const participants = event.anchorsInfo
        .map((anchor) => anchor.value?.user?.displayId ?? anchor.value?.user?.nickName)
        .filter(Boolean);
    console.log('Participants:', participants.join(' vs '));
});
await connection.connect();
```

## Link mic armies

**Subscribe:** `WebcastEvent.LINK_MIC_ARMIES` or `"linkMicArmies"`

**Payload:** `WebcastLinkMicArmies`

A battle score/contributor update. It can include both anchor-keyed `armies` and `teamArmies`.

Schema fields include `battleId`, `armies`, `channelId`, `sendGiftSuccessTime`, `updateBattleScoreTime`, `triggerReason`, `fromUserId`, `giftId`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.LINK_MIC_ARMIES, (event) => {
    console.log({
        battleId: event.battleId,
        giftId: event.giftId,
        giftCount: event.giftCount,
        totalDiamonds: event.totalDiamondCount,
        armies: event.armies,
        teamArmies: event.teamArmies,
    });
});
await connection.connect();
```

## Link mic battle item card

**Subscribe:** `WebcastEvent.LINK_MIC_BATTLE_ITEM_CARD` or `"linkMicBattleItemCard"`

**Payload:** `WebcastLinkMicBattleItemCard`

Battle Power-Up use, awards, guides, and special-effect notices. Discriminate on `msgType`.

Schema fields include `battleId`, `msgType`, `cardObtainGuide`, `useCriticalStrikeCard`, `useSmokeCard`, `awardCardNotice`, `useExtraTimeCard`, `useSpecialEffectCard`.

## Link mic battle punish finish

**Subscribe:** `WebcastEvent.LINK_MIC_BATTLE_PUNISH_FINISH` or `"linkMicBattlePunishFinish"`

**Payload:** `WebcastLinkMicBattlePunishFinish`

A battle punishment-phase completion message, including battle/channel IDs and a reason.

Schema fields include `channelId`, `opUid`, `reason`, `battleId`, `battleSettings`, `matchPunishExtraInfo`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.LINK_MIC_BATTLE_PUNISH_FINISH, (event) => {
    console.log({ battleId: event.battleId, channelId: event.channelId, reason: event.reason });
});
await connection.connect();
```

## Link mic battle task

**Subscribe:** `WebcastEvent.LINK_MIC_BATTLE_TASK` or `"linkMicBattleTask"`

**Payload:** `WebcastLinkmicBattleTaskMessage`

A battle task message. The client passes through the task payload without a task-state abstraction.

Schema fields include `taskMessageType`, `start`, `taskUpdate`, `taskSettle`, `reward`, `battleId`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.LINK_MIC_BATTLE_TASK, (event) => {
    console.log('Battle task:', event.battleId, event.taskMessageType);
    console.log('Progress:', event.taskUpdate?.progress);
    console.log('Settlement:', event.taskSettle);
});
await connection.connect();
```

## Link mic fan ticket method

**Subscribe:** `WebcastEvent.LINK_MIC_FAN_TICKET_METHOD` or `"linkMicFanTicketMethod"`

**Payload:** `WebcastLinkMicFanTicketMethod`

Fan-ticket room-notice content associated with link-mic activity.

Schema fields include `fanTicketRoomNotice`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.LINK_MIC_FAN_TICKET_METHOD, (event) => {
    const notice = event.fanTicketRoomNotice;
    if (notice) console.log('Total fan tickets:', notice.totalLinkmicFanTicket, 'users:', notice.userFanTicket.length);
});
await connection.connect();
```

## Link mic method

**Subscribe:** `WebcastEvent.LINK_MIC_METHOD` or `"linkMicMethod"`

**Payload:** `WebcastLinkMicMethod`

A link-mic protocol message with `messageType` and connection/participant fields. Numeric subtypes require verification for the applicable flow.

Schema fields include `messageType`, `accessKey`, `anchorLinkmicId`, `userId`, `fanTicket`, `totalLinkmicFanTicket`, `channelId`, `layout`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.LINK_MIC_METHOD, (event) => {
    console.log({
        messageType: event.messageType,
        channelId: event.channelId,
        userId: event.userId,
        toUserId: event.toUserId,
    });
});
await connection.connect();
```

## Link message

**Subscribe:** `WebcastEvent.LINK_MESSAGE` or `"linkMessage"`

**Payload:** `WebcastLinkMessage`

A link/cohost protocol message. Select the nested content using its message subtype; the client does not interpret the workflow.

Schema fields include `messageType`, `linkerId`, `scene`, `inviteContent`, `replyContent`, `createContent`, `closeContent`, `enterContent`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.LINK_MESSAGE, (event) => {
    console.log('Link message:', event.messageType, 'scene:', event.scene);
    console.log('Invitation:', event.inviteContent?.fromUserId, event.inviteContent?.actionId);
    console.log('Reply:', event.replyContent?.replyStatus, event.replyContent?.fromUserId, event.replyContent?.toUserId);
});
await connection.connect();
```

## Link layer

**Subscribe:** `WebcastEvent.LINK_LAYER` or `"linkLayer"`

**Payload:** `WebcastLinkLayerMessage`

A link-layer message containing variant-specific cohost/multilive content. Schema support does not establish a complete invite-state model.

Schema fields include `messageType`, `channelId`, `scene`, `source`, `centerizedIdc`, `rtcRoomId`, `version`, `linkerMode`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.LINK_LAYER, (event) => {
    console.log('Link layer:', event.messageType, event.channelId, event.scene);
    console.log('Invitee link-mic ID:', event.inviteContent?.inviteeLinkMicId);
    console.log('Owner link-mic ID:', event.createChannelContent?.ownerLinkMicId);
});
await connection.connect();
```

## Link mic layout state

**Subscribe:** `WebcastEvent.LINK_MIC_LAYOUT_STATE` or `"linkMicLayoutState"`

**Payload:** `WebcastLinkMicLayoutStateMessage`

A link-mic layout-state payload. Keep its state/version context when applying changes to your own model.

Schema fields include `channelId`, `scene`, `version`, `bizLayoutState`, `bizSpotList`.

## Link state

**Subscribe:** `WebcastEvent.LINK_STATE` or `"linkState"`

**Payload:** `WebcastLinkStateMessage`

A link-state protocol payload. Treat unknown states and absent nested messages explicitly.

Schema fields include `channelId`, `scene`, `version`, `needAck`, `layout`, `userStates`, `clientSendTime`, `stateType`.

## Speaker

**Subscribe:** `WebcastEvent.SPEAKER` or `"speaker"`

**Payload:** `WebcastSpeakerMessage`

The v3 speaker message. This installed schema exposes only `common`; it cannot identify an active speaker from a dedicated user field.
