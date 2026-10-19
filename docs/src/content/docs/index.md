---
title: Getting Started
description: Install TikTok LIVE Connector and receive comments and gifts from a livestream with Node.js.
---

TikTok LIVE Connector receives comments, gifts, likes, follows, viewer counts, battles, and other events from a TikTok livestream. Connect with a creator's username using `TikTokLiveConnection`.

## Prerequisites

- Node.js 20 or newer, with the connector running in a Node.js process. It uses Node HTTP and WebSocket libraries; a webpage should receive selected events through your own backend.
- An ESM entry point. Use an `.mjs` file, or set `"type": "module"` in your application's `package.json`.
- No TikTok login for public livestreams. Signing uses a third-party provider, [Euler Stream](https://www.eulerstream.com/) by default. Authenticated and mobile connections have additional requirements; see [authentication](/configuration/authentication/).

This is an unofficial reverse-engineering project. TikTok can change its protocol without notice, and a defined event may not be sent in every room or region. See [protocol types](/advanced/protocol/) for how to distinguish schema definitions from verified event behavior.

## Install

```sh
npm install tiktok-live-connector
```

## Listen to a livestream

Save this as `chat.mjs`, replace `creator_username` with a creator who is live, and run `node chat.mjs`.

```ts
import { ControlEvent, TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username');

connection.on(ControlEvent.ERROR, ({ info, exception }) => {
    console.error(info, exception);
});

connection.on(WebcastEvent.CHAT, (event) => {
    console.log(`${event.user?.displayId ?? 'unknown'}: ${event.content}`);
});

connection.on(WebcastEvent.GIFT, (event) => {
    console.log(`${event.user?.displayId ?? 'unknown'} sent gift ${event.giftId}`);
});

try {
    const state = await connection.connect();
    console.log(`Connected to room ${state.roomId}`);
} catch (error) {
    console.error('Could not connect', error);
}

process.once('SIGINT', () => {
    void connection.disconnect();
});
```

Register listeners before calling `connect()`: the initial signing response can contain messages that are emitted before the connection promise resolves.

The constructor accepts a plain username, a username with `@`, or a `https://www.tiktok.com/@creator/live` URL. Its second argument is an optional options object.

## Read modern payloads

The modern client exposes protobuf fields without flattening them. For chat, the text is `event.content`, the username is `event.user?.displayId`, and the numeric user ID is `event.user?.id`. Older examples using `comment`, `uniqueId`, or top-level user fields describe different payloads.

Nested messages can be absent. Use optional chaining, and keep IDs as strings so large identifiers retain their precision.

## Signing

The default signing provider is Euler Stream, a hosted [TikTok LIVE signing API](https://www.eulerstream.com/). A TikTok login is normally unnecessary for public rooms; provider limits and feature permissions still apply. Supply your provider API key through `signApiKey` or `SIGN_API_KEY` when needed. For production workloads that need an uptime guarantee, the managed [TikTok LIVE WebSocket API](https://www.eulerstream.com/websockets) handles signing, scaling, and protocol changes for you. See [signing](/configuration/signing/) and [troubleshooting](/troubleshooting/).

## Next steps

- [Connection lifecycle](/getting-started/connection/): room resolution, disconnects, and reconnecting.
- [Event catalog](/events/): find an event by its name or what it does.
- [Gift streaks](/guides/gifts/): avoid counting cumulative streak updates repeatedly.
- [Power-Ups](/guides/power-ups/): identify battle cards, senders, and target hosts.
- [Configuration](/configuration/options/): options and their defaults.
- [API reference](/api/): generated from the TypeScript source in this checkout.

These docs describe the modern client on `ts-rewrite`. Use the [migration guide](/getting-started/migration/) when updating code that uses `WebcastPushConnection` or flattened event payloads. The guides and generated API belong to the same checkout, so check the package version when comparing these pages with an installed release.

For the Python implementation, see [TikTokLive](https://github.com/isaackogan/TikTokLive). For the managed Euler Stream service, see [Euler Stream's documentation](https://www.eulerstream.com/docs). Their authentication, names, and response shapes can differ from this Node.js package.
