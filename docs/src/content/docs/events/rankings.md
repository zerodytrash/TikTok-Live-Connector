---
title: Rankings
description: Rankings events, payloads, and dispatch behavior.
---

Ranking notifications, text, rewards, and game ranks use different messages. A rank update is not necessarily a new gift or a battle score update.

Each entry below lists the listener alias and payload type. Field lists are selected schema fields, not guarantees that every nested value will be populated. The [protobuf reference](/schema/) contains the full message definitions.

## Hourly rank

**Subscribe:** `WebcastEvent.HOURLY_RANK` or `"hourlyRank"`

**Payload:** `WebcastHourlyRankRewardMessage`

An hourly-ranking reward notification. The payload describes the reward/notification, not a complete historical leaderboard.

Schema fields include `winners`.

## Rank update

**Subscribe:** `WebcastEvent.RANK_UPDATE` or `"rankUpdate"`

**Payload:** `WebcastRankUpdateMessage`

A rank update payload. Preserve the ranking category and version/context fields when present.

Schema fields include `updates`, `groupType`, `opType`, `rankPriority`, `tabs`, `isAnimationLoopPlay`, `animationLoopForOff`, `unionAnimation`.

## Rank text

**Subscribe:** `WebcastEvent.RANK_TEXT` or `"rankText"`

**Payload:** `WebcastRankTextMessage`

Ranking-related display text. This notification is not itself a full rank list.

Schema fields include `scene`, `ownerIdxBeforeUpdate`, `ownerIdxAfterUpdate`, `selfGetBadgeMsg`, `otherGetBadgeMsg`, `curUserId`, `leftIcon`, `content`.

## Game rank notify

**Subscribe:** `WebcastEvent.GAME_RANK_NOTIFY` or `"gameRankNotify"`

**Payload:** `WebcastGameRankNotifyMessage`

A game-ranking notification with a message subtype and optional notification text.

Schema fields include `msgType`, `notifyText`.
