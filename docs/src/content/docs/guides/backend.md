---
title: Applications and overlays
description: Use the connector in a Node.js backend and forward selected data to your UI.
---

Run the connector in a Node.js backend or desktop main process. Forward the data your interface needs through your own WebSocket, HTTP, or IPC layer. Provider keys and TikTok session cookies should stay in that trusted process.

## Shape data for your interface

Modern payloads can be large. Select fields before passing them to an overlay:

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.CHAT, (event) => {
    const message = {
        id: event.common?.msgId,
        userId: event.user?.id,
        username: event.user?.displayId,
        text: event.content,
    };
    // Pass this object to your application's WebSocket or IPC transport.
    console.log(message);
});
await connection.connect();
```

Render user text as text, not executable HTML. Keep stable string IDs for deduplication and use your own bounded queue for slow consumers.

## Multiple rooms

Use a separate `TikTokLiveConnection` instance per room. The clients have separate state and cookie jars, but `SignConfig`, `RouteConfig`, `WebcastDeserializeConfig`, and the fallback configs are global. Changing one of those affects other connections in the process.

Use explicit provider instances when separate credentials are required. Coordinate connection attempts to respect provider limits, and register listeners once per instance.

## Shutdown

Call `disconnect()` during a controlled shutdown. Stop polling, reconnect loops, queues, and any UI transports owned by your application. Closing the connector does not stop other timers or sockets that your application created.
