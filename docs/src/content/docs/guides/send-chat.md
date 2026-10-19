---
title: Send chat messages
description: Send a message through the provider using an authenticated TikTok session.
---

`sendMessage(content, roomId?)` uses `RouteConfig.sendRoomChatFromProvider`. It requires a room ID, a usable TikTok session, and the provider's permission for its send-chat endpoint. Reading a public room does not grant the ability to send chat.

```ts
import { TikTokLiveConnection } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {
    signApiKey: process.env.SIGN_API_KEY,
    session: {
        cookie: {
            type: 'cookie',
            value: {
                sessionId: process.env.TIKTOK_SESSION_ID ?? '',
                ttTargetIdc: process.env.TIKTOK_TARGET_IDC ?? '',
            },
        },
    },
});

const roomId = await connection.fetchRoomId();
const response = await connection.sendMessage('Hello!', roomId);
console.log(response);
```

The method defaults to the connection's current `roomId`. Supplying a room ID lets you use it without opening a WebSocket. The response is the provider's `WebcastRoomChatRouteResponse`, not a received `WebcastChatMessage` event.

The current handler prefers the cookie header over OAuth when the cookie jar is nonempty. Provider responses 401 and 403 become `PremiumFeatureError`; other non-200 responses become `InvalidResponseError`. Consult [authentication](https://ttlc.docs.isaackogan.com/configuration/authentication/) for the session shapes and [troubleshooting](https://ttlc.docs.isaackogan.com/troubleshooting/) for failures.

Avoid automatically replying to every message without your own rate control and loop prevention. The connector does not implement a send queue or per-user moderation policy.
