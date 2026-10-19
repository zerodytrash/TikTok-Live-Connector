---
title: Subscriptions and super fans
description: Subscriptions and super fans events, payloads, and dispatch behavior.
---

The three super-fan events are derived from barrage or envelope messages. SUB_NOTIFY and SUB_PIN_EVENT are separate protocol messages. Do not treat every subscription notification as a newly purchased subscription.

Each entry below lists the listener alias and payload type. Field lists are selected schema fields, not guarantees that every nested value will be populated. The [protobuf reference](/schema/) contains the full message definitions.

Replace `creator_username` with a live creator. Each example registers its listener before connecting.

## Super fan

**Subscribe:** `WebcastEvent.SUPER_FAN` or `"superFan"`

**Payload:** `WebcastBarrageMessage`

A barrage identified by a `ttlive_superfan` content key, excluding the join-specific case. The same payload is also emitted as BARRAGE.

Schema fields include `event`, `msgType`, `icon`, `content`, `duration`, `background`, `rightIcon`, `displayConfig`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.SUPER_FAN, (event) => {
    console.log(event.content?.defaultPattern, event.commonBarrageContent?.defaultPattern);
});
await connection.connect();
```

## Super fan join

**Subscribe:** `WebcastEvent.SUPER_FAN_JOIN` or `"superFanJoin"`

**Payload:** `WebcastBarrageMessage`

A barrage identified by the `ttlive_superfan_commentnotif_superfanjoined` key. It is emitted instead of SUPER_FAN, and also as BARRAGE.

Schema fields include `event`, `msgType`, `icon`, `content`, `duration`, `background`, `rightIcon`, `displayConfig`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.SUPER_FAN_JOIN, (event) => {
    console.log(event.content?.defaultPattern, event.commonBarrageContent?.defaultPattern);
});
await connection.connect();
```

## Super fan box

**Subscribe:** `WebcastEvent.SUPER_FAN_BOX` or `"superFanBox"`

**Payload:** `WebcastEnvelopeMessage`

An envelope identified by its `ttlive_superfanbox` display key or `EnvelopeBusinessType.SUPER_FAN_BOX`. The same payload is also emitted as ENVELOPE.

Schema fields include `envelopeInfo`, `display`, `publicAreaMsgCommon`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.SUPER_FAN_BOX, (event) => {
    console.log('Super Fan Box:', event.envelopeInfo);
});
await connection.connect();
```

## Sub notify

**Subscribe:** `WebcastEvent.SUB_NOTIFY` or `"subNotify"`

**Payload:** `WebcastSubNotifyMessage`

A subscription notification. Inspect `messageType`, `subscribeType`, `subscribingStatus`, and related enum fields to distinguish its subtype.

Schema fields include `user`, `exhibitionType`, `subMonth`, `subscribeType`, `oldSubscribeStatus`, `messageType`, `subscribingStatus`, `isSend`.

## Sub pin event

**Subscribe:** `WebcastEvent.SUB_PIN_EVENT` or `"subPinEvent"`

**Payload:** `WebcastSubPinEventMessage`

A subscription pin-event payload. It is separate from the general ROOM_PIN message.

Schema fields include `actionType`, `card`, `operatorUserId`.
