---
title: Room information and viewers
description: Fetch room data and distinguish viewer snapshots from joins and likes.
---

`fetchRoomId(uniqueId?)` resolves and stores a room ID. `fetchRoomInfo(roomId?)` fetches room information, resolves an ID first if necessary, and caches its result in `roomInfo`. You can call these without opening a WebSocket.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
const roomId = await connection.fetchRoomId();
const roomInfo = await connection.fetchRoomInfo(roomId);
console.log(roomId, roomInfo);

connection.on(WebcastEvent.ROOM_USER, (event) => {
    console.log({ viewers: event.total, totalUser: event.totalUser, ranks: event.ranks });
});
```

The room-info response type is currently loose. Check the returned shape and `data.status` rather than treating every response as a complete, stable schema.

## Viewer events

`ROOM_USER` delivers `WebcastRoomUserSeqMessage`, including `total`, `totalUser`, `ranks`, `seats`, and popularity fields. These include string-encoded counts. A viewer snapshot and a room's cumulative audience count are different measurements; do not substitute one for another without checking the upstream field's behavior.

`MEMBER` is a join/member message. Counting it is not a reliable substitute for an exact current viewer count, and a corresponding leave event is not guaranteed for each viewer.

`LIKE` carries both the update's `count` and a `total` field. Likes are not unique viewers. See [chat and audience events](/events/chat-and-audience/).

## Polling

Use `fetchIsLive()` or `waitUntilLive()` for live detection instead of opening repeated WebSockets. Polling and connection attempts can consume different provider limits. Cache room metadata when appropriate and avoid making an HTTP request for every chat or viewer update.
