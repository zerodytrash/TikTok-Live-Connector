---
title: Connection lifecycle
description: Resolve rooms, connect, disconnect, and wait for a creator to go live.
---

## Connect

`connect(roomId?)` returns a `Promise<TikTokLiveConnectionState>`. It resolves after the WebSocket opens, room entry has been requested, and the client has set `isConnected` to `true`. It does not wait for the separate `ENTER_ROOM` acknowledgement.

The connection resolves a room ID, optionally fetches room information and gifts, obtains the signed WebSocket URL and initial message batch, then opens the socket. `processInitialData` controls whether that initial batch is emitted. Those messages may predate your connection.

Pass a string room ID to `connect(roomId)` to bypass room-ID lookup. This does not bypass signing or the other enabled fetches.

Calling `connect()` during an existing attempt throws `AlreadyConnectingError`. Calling it after connecting throws `AlreadyConnectedError`. A failed attempt resets the state and rejects the promise; it can also emit an error notification if an error listener is registered.

## State and properties

| Property | Meaning |
| --- | --- |
| `uniqueId` | Normalized username supplied to the constructor. |
| `isConnecting` | Whether a connection attempt is in progress. |
| `isConnected` | Whether the high-level client has completed its connection attempt. |
| `roomId` | Room ID held by the HTTP client; `''` when cleared. |
| `roomInfo` | Cached result of `fetchRoomInfo()`; initially `null`. |
| `availableGifts` | Gift list loaded during connection with `enableExtendedGiftInfo`; initially `null`. |
| `state` | A new object containing `isConnected`, `isConnecting`, `roomId`, `roomInfo`, and `availableGifts`. |
| `options` | Retained options: `processInitialData`, `fetchRoomInfoOnConnect`, `enableExtendedGiftInfo`, `authenticateWs`, and `useMobile`. |
| `webClient` | Managed `WebcastHttpClient`, including its cookie jar. |
| `apiClient` | The Euler Stream SDK client used by the HTTP client. |
| `wsClient` | Active `WebcastWebSocketClient`, or `null`. |
| `clientParams` | The HTTP client's mutable query-parameter object. |

`roomInfo` and `availableGifts` are cleared when the high-level client resets after a disconnect or failed connection. Keep your own copies if your application needs them later.

## Disconnect and reconnect

`disconnect()` requests a WebSocket close and waits for the socket to close. If necessary it terminates the socket after `WS_DISCONNECT_TIMEOUT_MS`, which defaults to 2,000 ms. Calling it when disconnected is safe.

The client does not automatically reconnect. If your application reconnects, use a delay and a single connection loop. Do not add duplicate listeners on each attempt. A creator ending a stream or a signing rate limit needs different handling from a short network interruption.

The `streamEnd` event is emitted for ended and suspended stream control actions, and the client then disconnects. `disconnected` provides the socket close code and reason; it does not by itself prove the creator ended the stream.

## Check live status

Use `fetchIsLive(uniqueId?)` to check status without opening a WebSocket. Room lookup and live-status checks try HTML, TikTok's API, and then the provider. [Fallback configuration](/advanced/routes/) can disable individual sources.

```ts
import { TikTokLiveConnection } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(new Error('Stopped waiting')), 300_000);

try {
    await connection.waitUntilLive(60, controller.signal);
    await connection.connect();
} catch (error) {
    console.error(error);
} finally {
    clearTimeout(timeout);
}
```

`waitUntilLive(seconds = 60, abortSignal?)` checks immediately, then polls after each offline result. The interval is clamped to at least 30 seconds. It resolves when live, rejects on an aborted signal, and rejects if a status check fails. It does not silently retry failed requests.

## Handle asynchronous listeners

Listeners may return promises, but Node's `EventEmitter` does not await them. Catch failures inside an asynchronous listener. Keep slow work in a queue so a busy room cannot create unlimited concurrent requests.
