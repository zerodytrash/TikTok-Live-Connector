---
title: Games, commerce, and partnerships
description: Games, commerce, and partnerships events, payloads, and dispatch behavior.
---

These protocol messages are available as subscriptions. Their detailed business workflows remain outside the connector; consult the schema for the exact fields and preserve unknown subtypes.

Each entry below lists the listener alias and payload type. Field lists are selected schema fields, not guarantees that every nested value will be populated. The [protobuf reference](https://ttlc.docs.isaackogan.com/schema/) contains the full message definitions.

Replace `creator_username` with a live creator. Each example registers its listener before connecting.

## Oec live shopping

**Subscribe:** `WebcastEvent.OEC_LIVE_SHOPPING` or `"oecLiveShopping"`

**Payload:** `WebcastOecLiveShoppingMessage`

A live-shopping protocol message. The connector does not fetch a complete shop catalog or execute a purchase.

Schema fields include `actionType`, `liveProductNumber`, `popProduct`, `traceInfo`, `hotTags`, `atmosphereTagInfo`, `livePermissionInfo`, `productSnapShot`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.OEC_LIVE_SHOPPING, (event) => {
    const product = event.popProduct;
    if (product) console.log({ title: product.title, price: product.price, url: product.openUrl });
});
await connection.connect();
```

## Live game intro

**Subscribe:** `WebcastEvent.LIVE_GAME_INTRO` or `"liveGameIntro"`

**Payload:** `WebcastLiveGameIntroMessage`

A live-game introduction payload. Receiving it is separate from a game-ranking notification.

Schema fields include `content`, `hasRankInfo`.

## Partnership drops update

**Subscribe:** `WebcastEvent.PARTNERSHIP_DROPS_UPDATE` or `"partnershipDropsUpdate"`

**Payload:** `WebcastPartnershipDropsUpdateMessage`

A partnership drops update payload. Check its state and campaign context rather than treating it as a reward claim.

Schema fields include `changeMode`, `dropsId`, `taskId`, `eventId`, `anchorUid`.

## Partnership game offline

**Subscribe:** `WebcastEvent.PARTNERSHIP_GAME_OFFLINE` or `"partnershipGameOffline"`

**Payload:** `WebcastPartnershipGameOfflineMessage`

A partnership game-offline payload. It is not the creator's STREAM_END event.

Schema fields include `offlineGameList`.

## Partnership punish

**Subscribe:** `WebcastEvent.PARTNERSHIP_PUNISH` or `"partnershipPunish"`

**Payload:** `WebcastPartnershipPunishMessage`

A partnership punishment payload. It is distinct from battle punishment completion.

Schema fields include `punishInfo`.
