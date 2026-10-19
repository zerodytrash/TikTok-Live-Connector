---
title: WebSocket client
description: The low-level socket, room-entry packets, heartbeats, and acknowledgements.
---

`connection.wsClient` is a `WebcastWebSocketClient`, which extends `ws.WebSocket`. It is `null` before setup and after cleanup. The high-level connection manages its room entry, message decoding, close handling, and errors.

## Additional public members

- `open`: whether the socket's `readyState` equals `WebSocket.OPEN`.
- `sendBytes(data)`: sends bytes only when open and returns a boolean indicating whether it sent them.
- `switchRooms(roomId)`: sends a room-entry packet, resets the packet sequence, and starts the protocol heartbeat timer.

Calling `wsClient.switchRooms()` directly does not update the high-level client's room ID, cached metadata, or other state. Prefer a separate high-level connection per room unless you manage all of that state yourself.

## Low-level events

| Event | Arguments |
| --- | --- |
| `webSocketData` | Original message bytes. Note the capital `S`; the high-level event string is `websocketData`. |
| `protoMessageFetchResult` | Decoded batch containing its nested messages. |
| `imEnteredRoom` | Decoded container for an `im_enter_room_resp` packet. |
| `messageDecodingFailed` | Error while decoding an incoming container. |
| `close` | Standard socket close information at runtime; the exported map's dedicated `close` entry is narrower. |

Other standard `ws` events remain available through the inherited socket interface. `WebcastWebSocketEventMap` and `WebcastTypedWebSocket` describe the connector's added typing.

## Construction

`createWebSocketProvider(config, wsClientOptions?)` returns a function accepting `WebSocketDynamicParams`: `{ roomId, baseUrl, wsParams, wsHeaders }`. The provider merges defaults with these dynamic values and creates a socket.

Dynamic socket headers are applied after custom `wsClientOptions.headers`. Query parameters come from resolved defaults plus the dynamic `wsParams`, followed by the configured append-parameter string. `autoPong` is forced to `false` by the connector.

The high-level client supplies the full cookie jar when `authenticateWs` is enabled. Otherwise, it uses `getAnonymousCookieString()` to omit configured session and target-IDC cookies. See [authentication](https://ttlc.docs.isaackogan.com/configuration/authentication/) for the separate signing request and its host allowlist.

## Heartbeats and acknowledgements

The default heartbeat interval is 10,000 ms. The timer begins when switching into a room and is cleared on close. Sequence IDs advance with heartbeats.

When a decoded batch requests an acknowledgement, the client sends one using the container's `logId` and batch `internalExt`. Missing `internalExt` skips the acknowledgement and can produce a warning. `DISABLE_ACK_LOG_WARNING` suppresses that warning; it does not repair the missing data.

See [protocol decoding](https://ttlc.docs.isaackogan.com/advanced/protocol/) for frame structure and [control events](https://ttlc.docs.isaackogan.com/events/control/) for high-level connection notifications.
