---
title: Quickstart
description: Install the connector and receive comments and gifts.
---

## Install

Use Node.js 20 or newer. The package is ESM; use an `.mjs` file, or set `"type": "module"` in your application's `package.json`.

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

The default signing provider is Euler Stream. A TikTok login is normally unnecessary for public rooms; provider limits and feature permissions still apply. Supply your provider API key through `signApiKey` or `SIGN_API_KEY` when needed. See [signing](https://ttlc.docs.isaackogan.com/configuration/signing/) and [troubleshooting](https://ttlc.docs.isaackogan.com/troubleshooting/).

## Next steps

- [Connection lifecycle](https://ttlc.docs.isaackogan.com/getting-started/connection/): room resolution, disconnects, and reconnecting.
- [Events](https://ttlc.docs.isaackogan.com/events/): the complete list of subscriptions.
- [Gift streaks](https://ttlc.docs.isaackogan.com/guides/gifts/): avoid counting cumulative streak updates repeatedly.
- [Configuration](https://ttlc.docs.isaackogan.com/configuration/options/): options and their defaults.
