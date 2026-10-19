---
title: Gifts and streaks
description: Read gifts, handle cumulative streak counts, and fetch gift metadata.
---

`WebcastEvent.GIFT` delivers a `WebcastGiftMessage`. Useful fields include `giftId`, `repeatCount`, `repeatEnd`, `groupId`, `user`, `toUser`, and the optional `gift` message.

## Count a streak once

For streakable gifts (`gift.type === 1`), TikTok can send multiple updates while the streak grows. `repeatCount` is the cumulative count for that update. Counting every update as an additional `repeatCount` overcounts the streak.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.GIFT, (event) => {
    if (!event.gift) return;
    if (event.gift.type === 1 && event.repeatEnd !== 1) return;

    console.log({
        sender: event.user?.displayId,
        recipientId: event.toUser?.id,
        giftId: event.giftId,
        name: event.gift.name,
        count: event.repeatCount,
        diamondsPerGift: event.gift.diamondCount,
    });
});
await connection.connect();
```

If you show intermediate progress, update a streak's displayed count rather than adding the cumulative value repeatedly. `groupId`, sender, gift, and room context can help distinguish concurrent streaks. Do not assume a gift ID identifies a unique transaction.

The gift's diamond count is metadata, not a guaranteed cash payout. Regional pricing, platform accounting, and creator revenue are separate from this event.

## Gift metadata

`enableExtendedGiftInfo: true` fetches the available gift list before opening the socket. The client stores the array in `connection.availableGifts` and finds matching entries for `event.extendedGiftInfo`.

The public `fetchAvailableGifts()` method returns a list using the current `roomId`. It does **not** update `availableGifts` itself in this checkout. Resolve the room first if you call it before connecting:

```ts
import { TikTokLiveConnection } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
await connection.fetchRoomId();
const gifts = await connection.fetchAvailableGifts();
console.log(gifts);
```

`RoomGiftInfo` and `RoomGiftsResponse` are currently loose types. Check returned data before using it. Gift-list requests are signed; their failure can prevent a connection when extended metadata is enabled.

## Related events

Gift-panel changes, gift prompts, broadcast notices, restrictions, and goal updates have their own events. They are not additional paid gifts. See the [gift event reference](https://ttlc.docs.isaackogan.com/events/gifts-and-goals/).
