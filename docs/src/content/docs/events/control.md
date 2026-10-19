---
title: Control events
description: Every high-level connection event, its arguments, and when it is emitted.
sidebar:
  order: 1
---

Control events describe the connector's connection and decoding process. They are separate from the TikTok `WebcastEvent.CONTROL_MESSAGE` payload.

Replace `creator_username` with a live creator. Each example registers its listener before connecting.

## Connected

`ControlEvent.CONNECTED` (`connected`) receives one `TikTokLiveConnectionState`. It fires after `connect()` has completed its socket setup and set `isConnected` to `true`.

```ts
import { ControlEvent, TikTokLiveConnection } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(ControlEvent.CONNECTED, (state) => {
    console.log('Connected to room:', state.roomId);
    console.log('Room information loaded:', Boolean(state.roomInfo));
});
await connection.connect();
```

## Disconnected

`ControlEvent.DISCONNECTED` (`disconnected`) receives `{ code, reason }` after an established socket closes. The client clears connection state and cached room/gift information before emitting it. A connection attempt that fails before setup completes rejects `connect()`; do not depend on a disconnected event for every failed attempt.

```ts
import { ControlEvent, TikTokLiveConnection } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(ControlEvent.DISCONNECTED, ({ code, reason }) => {
    console.log('Disconnected:', code, reason);
});
await connection.connect();
```

See [connection lifecycle](https://ttlc.docs.isaackogan.com/getting-started/connection/) for reconnecting and retry timing.

## Error

`ControlEvent.ERROR` (`error`) receives `{ info, exception }`. `info` identifies the operation and `exception` is the underlying error. The exported handler type is currently loose; the runtime emits this wrapper object.

Handled errors are emitted only when a listener exists. Methods such as `connect()` and decorated fetch methods can both emit an error notification and reject their promise. Catch the promise rejection as well; logging both paths can produce duplicate error reports.

```ts
import { ControlEvent, TikTokLiveConnection } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(ControlEvent.ERROR, ({ info, exception }) => console.error(info, exception));
try {
    await connection.connect();
} catch (error) {
    console.error('Connection failed:', error);
}
```

## WebSocket connected

`ControlEvent.WEBSOCKET_CONNECTED` (`websocketConnected`) receives the `WebcastWebSocketClient`. It fires after the socket opens and the room-entry request is sent, but before the high-level CONNECTED event. Waiting for the room-entry response is a separate step.

```ts
import { ControlEvent, TikTokLiveConnection } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(ControlEvent.WEBSOCKET_CONNECTED, (client) => {
    console.log('WebSocket open:', client.open);
});
await connection.connect();
```

## Enter room

`ControlEvent.ENTER_ROOM` (`enterRoom`) receives the `DecodedWebcastPushFrame` for an `im_enter_room_resp` response. This acknowledges a room-entry packet; it is not the same event as a viewer joining the room.

```ts
import { ControlEvent, TikTokLiveConnection } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(ControlEvent.ENTER_ROOM, (frame) => console.log('Room-entry acknowledgement:', frame));
await connection.connect();
```

## WebSocket bytes

`ControlEvent.WEBSOCKET_DATA` (`websocketData`) receives the incoming socket bytes before container decoding. Use it when diagnosing frames that do not produce a decoded message. Initial data obtained from the signing response does not arrive through this socket-byte event.

```ts
import { ControlEvent, TikTokLiveConnection } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(ControlEvent.WEBSOCKET_DATA, (bytes) => console.log('WebSocket bytes:', bytes.byteLength));
await connection.connect();
```

## Decoded data

`ControlEvent.DECODED_DATA` (`decodedData`) receives three arguments:

1. The protobuf message method name, such as `WebcastChatMessage`.
2. A decoded wrapper `{ type, data }`.
3. The original nested message's binary payload.

The second argument is not the chat or gift object itself. Read its `data` property:

```ts
import { ControlEvent, TikTokLiveConnection } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(ControlEvent.DECODED_DATA, (method, decoded, binary) => {
    console.log(method, decoded.type, decoded.data, binary.byteLength);
});
await connection.connect();
```

It fires for successfully decoded messages in the initial batch and subsequent socket batches, before named dispatch. Unknown or filtered nested messages do not emit it.

## Raw data

`ControlEvent.RAW_DATA` (`rawData`) is declared with `(method, payload)` arguments, but the modern client's dispatcher does not currently emit it. The legacy adapter does. On the modern client, use WEBSOCKET_DATA for whole frames or the third DECODED_DATA argument for a successfully decoded nested payload.

To inspect a method name and its original nested bytes on the modern client:

```ts
import { ControlEvent, TikTokLiveConnection } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(ControlEvent.DECODED_DATA, (method, _decoded, binary) => {
    console.log('Original message payload:', method, binary);
});
await connection.connect();
```

This covers successfully decoded messages; use the WebSocket-bytes example above when decoding itself fails.

## Ordering

Initial decoded/named events can occur before WEBSOCKET_CONNECTED and CONNECTED. DECODED_DATA precedes the named event for the same decoded message. Asynchronous application listeners are not awaited by Node's event emitter.
