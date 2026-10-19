---
title: Power-Ups
description: Detect battle cards and identify their senders and target anchors.
---

Listen to `WebcastEvent.LINK_MIC_BATTLE_ITEM_CARD` (`linkMicBattleItemCard`). Its payload is `WebcastLinkMicBattleItemCard`, the Node.js counterpart of Python's `LinkMicBattleItemCardEvent`.

The same event carries card use, awards, guides, and effect notices. Check `msgType` before treating a message as someone using a Power-Up.

## Identify a card use

```ts
import { BattleCardMsgType, TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.LINK_MIC_BATTLE_ITEM_CARD, (event) => {
    if (event.msgType !== BattleCardMsgType.USE_CRITICAL_STRIKE_CARD) return;

    const use = event.useCriticalStrikeCard;
    const card = use?.cardInfo;
    console.log({
        battleId: event.battleId,
        senderId: card?.sendUser?.user?.userId,
        senderName: card?.sendUser?.user?.displayId,
        targetAnchorId: card?.toAnchorId,
        anchorId: use?.anchorId,
    });
});
await connection.connect();
```

The card sender uses a small battle-specific user message. Its fields are `userId`, `displayId`, and `nickName`; they differ from the ordinary `User` message's `id` and `nickname`.

## All card actions

| `BattleCardMsgType` member | Payload | Sender and target information |
| --- | --- | --- |
| `USE_CRITICAL_STRIKE_CARD` | `useCriticalStrikeCard` | `cardInfo` |
| `USE_SMOKE_CARD` | `useSmokeCard` | `cardInfo` |
| `USE_EXTRA_TIME_CARD` | `useExtraTimeCard` | `cardInfo` |
| `USE_SPECIAL_EFFECT_CARD` | `useSpecialEffectCard` | `cardInfo` |
| `USE_POTION_CARD` | `usePotionCard` | `cardInfo` |
| `USE_WAVE_CARD` | `useWaveCard` | `cardInfo` |
| `USE_TOP_2_CARD` | `useTop2Card` | `cardInfo.common` |
| `USE_TOP_3_CARD` | `useTop3Card` | `cardInfo.common` |
| `USE_VAULT_GLOVE_CARD` | `useVaultGloveCard` | `cardInfo.common` |

Once you have the information object, read `sendUser.user` for the sender and `toAnchorId` for the target. Some variants also expose `toAnchorIdStr`. The use wrapper's `anchorId` is a separate field; do not substitute it for the target.

The remaining defined actions include `UNKNOWN_CARD_ACTION`, `CARD_OBTAIN_GUIDE`, `AWARD_CARD_NOTICE`, and `SPECIAL_EFFECT_NOTICE`; the codec also exposes `UNRECOGNIZED`. Read `cardObtainGuide`, `awardCardNotice`, or `specialEffectNotice` as appropriate. In particular, the sender paths for a card use do not describe an award's user list or an effect notice's `fromUserId`.

## Awards and effect notices

`awardCardNotice.awardedUsers` lists the award recipients as battle-user wrappers. Read each entry's `user` object for its ID and name; the parent `awardReason` supplies the encoded reason. An award recipient is not necessarily the person who sent a card.

`specialEffectNotice` has its own `fromUserId` and `toAnchorId`, describing the sender and beneficiary anchor for that notice. Do not read a card-use sender path from this different payload.

```ts
import { BattleCardMsgType, TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.LINK_MIC_BATTLE_ITEM_CARD, (event) => {
    if (event.msgType === BattleCardMsgType.AWARD_CARD_NOTICE) {
        for (const recipient of event.awardCardNotice?.awardedUsers ?? []) {
            console.log(event.awardReason, recipient.user?.userId, recipient.user?.displayId);
        }
    } else if (event.msgType === BattleCardMsgType.SPECIAL_EFFECT_NOTICE) {
        console.log(event.specialEffectNotice?.fromUserId, event.specialEffectNotice?.toAnchorId);
    }
});
await connection.connect();
```

## Times, IDs, and missing fields

Card information exposes fields such as `sendTimeSec`, `effectTimeSec`, and `effectLastDuration`. Keep their encoded values until your application has established the appropriate interpretation for that card. The suffix on a field name is part of the schema, not an application-level timing guarantee.

IDs are strings and may exceed JavaScript's safe integer range. Nested messages may be absent; empty strings and `"0"` can represent an unspecified ID. Keep an unknown sender or target unknown rather than assigning it to the connected host.

## Cohost battles

A card can target another anchor in the battle. Special-effect cards also contain `affectedAnchorPairs`, each with a `sourceAnchorId` and `targetAnchorId`. Preserve every pair when the effect affects more than one host.

The connector delivers these fields but does not resolve a complete team topology or normalize all card variants into one object. Combine them with the battle's participant and team messages if your application needs that view. Reliable attribution across every 3:1, 1:3, or 1:2 layout has not been established by the synthetic fixtures.

## What is verified

The offline fixtures verify decoding and modern-client dispatch for all nine use variants, guide/award/effect notices, absent nested fields, unknown action values, and multiple affected anchor pairs. They establish schema compatibility, not live delivery frequency or every rule of TikTok's battle UI.

See the generated [protobuf reference](/schema/) for all card fields and enums, and [battles](/guides/battles/) for participant and score messages.
