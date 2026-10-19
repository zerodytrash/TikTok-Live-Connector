---
title: Gifts and goals
description: Gifts and goals events, payloads, and dispatch behavior.
---

Gift actions, gift UI messages, envelopes, and goals are separate subscriptions. Only a GIFT message represents the gift event used by the streak-handling guide. See [gifts and streaks](/guides/gifts/).

Each entry below lists the listener alias and payload type. Field lists are selected schema fields, not guarantees that every nested value will be populated. The [protobuf reference](/schema/) contains the full message definitions.

## Gift

**Subscribe:** `WebcastEvent.GIFT` or `"gift"`

**Payload:** `WebcastGiftMessage`

A gift message. Handle cumulative streak updates using `repeatCount`, `repeatEnd`, and the gift type before counting it.

Schema fields include `giftId`, `fanTicketCount`, `groupCount`, `repeatCount`, `comboCount`, `user`, `toUser`, `repeatEnd`.

## Envelope

**Subscribe:** `WebcastEvent.ENVELOPE` or `"envelope"`

**Payload:** `WebcastEnvelopeMessage`

An envelope or treasure-box message. A recognized super-fan box also emits SUPER_FAN_BOX.

Schema fields include `envelopeInfo`, `display`, `publicAreaMsgCommon`.

## Goal update

**Subscribe:** `WebcastEvent.GOAL_UPDATE` or `"goalUpdate"`

**Payload:** `WebcastGoalUpdateMessage`

A goal-state update. Inspect the payload's goal records and do not treat the update itself as another gift.

Schema fields include `indicator`, `goal`, `contributorId`, `contributorAvatar`, `contributorDisplayId`, `contributeSubgoal`, `contributeCount`, `contributeScore`.

## Boost card

**Subscribe:** `WebcastEvent.BOOST_CARD` or `"boostCard"`

**Payload:** `WebcastBoostCardMessage`

A room boost-card message. This is a different protocol message from battle Power-Ups on LINK_MIC_BATTLE_ITEM_CARD.

Schema fields include `cards`.

## Gift broadcast

**Subscribe:** `WebcastEvent.GIFT_BROADCAST` or `"giftBroadcast"`

**Payload:** `WebcastGiftBroadcastMessage`

A gift broadcast notice. It is not an additional GIFT receipt for accounting.

Schema fields include `fromUserId`, `leftIcon`, `notify`.

## Gift dynamic restriction

**Subscribe:** `WebcastEvent.GIFT_DYNAMIC_RESTRICTION` or `"giftDynamicRestriction"`

**Payload:** `WebcastGiftDynamicRestrictionMessage`

A gift restriction payload. Interpret the nested restriction structure for the applicable UI or feature.

Schema fields include `dynamicRestriction`.

## Gift panel update

**Subscribe:** `WebcastEvent.GIFT_PANEL_UPDATE` or `"giftPanelUpdate"`

**Payload:** `WebcastGiftPanelUpdateMessage`

An update to the gift panel, with gallery, goal, and room-based gift data when supplied.

Schema fields include `roomId`, `timestamp`, `galleryData`, `goalData`, `roomBasedGiftData`, `strategyContext`.

## Gift prompt

**Subscribe:** `WebcastEvent.GIFT_PROMPT` or `"giftPrompt"`

**Payload:** `WebcastGiftPromptMessage`

A gift-related prompt. The schema includes prompt text and restriction-related fields; a prompt is not a completed gift.

Schema fields include `title`, `body`, `blockNumDays`, `orderId`, `orderTimestamp`, `inUserGiftingAddictionExpr`, `popUpSchema`.
