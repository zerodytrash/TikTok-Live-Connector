---
title: Migration
description: Move from WebcastPushConnection and older connector examples to the modern API.
---

## Use the modern client

Use `TikTokLiveConnection` for new work. The deprecated `WebcastPushConnection` is available from `tiktok-live-connector/legacy` for compatibility, with a limited dispatcher and flattened payloads. Its event behavior differs from the modern client, including Power-Ups. A schema's presence does not mean the legacy adapter emits its named event.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.CHAT, (event) => {
    console.log(event.user?.displayId, event.content);
});
await connection.connect();
```

## Payload changes

| Older flattened examples | Modern protobuf payload |
| --- | --- |
| `data.comment` | `data.content` on chat events. |
| `data.uniqueId` | `data.user?.displayId` on events with a `User`. |
| `data.userId` | `data.user?.id` on events with a `User`. |
| `data.nickname` | `data.user?.nickname`. |
| `data.msgId` or flattened room fields | Usually `data.common?.msgId` and `data.common?.roomId`; consult the event's schema. |
| Flat gift metadata | `data.gift` and optional `data.extendedGiftInfo`. |

The small `BattleUserInfo` nested in Power-Up cards uses `userId`, `displayId`, and `nickName`. It is a different message from the regular event `User`; see [Power-Ups](https://ttlc.docs.isaackogan.com/guides/power-ups/).

## Configuration changes

- Replace `sessionId` and `ttTargetIdc` constructor fields with `session.cookie`, containing `type: 'cookie'` and `value: { sessionId, ttTargetIdc }`.
- Replace `oauthToken` with `session.oAuthToken`, containing `type: 'oAuthToken'` and `value`.
- Replace Axios request options with `webClientOptions` for the Got HTTP client. Query parameters are `searchParams`.
- Use `wsClientOptions` for socket transport options, and `webConfigOverrides` / `wsConfigOverrides` for protocol configuration.
- Replace `signedWebSocketProvider` with `RouteConfig.fetchSignedWebSocketFromProvider`.
- Replace `disableEulerFallbacks` with the specific `RoomIdRouteConfig` and `IsLiveRouteConfig` flags.

## Routes, HTTP clients, and types

Routes are functions accepting one argument object. Use `RouteConfig` or the exported `fetch...Route` functions, passing `webClient` and, for provider routes, `apiClient`. The old route classes and `TikTokWebClient` wrapper are replaced by this interface.

`WebcastHttpClient` uses Got. Its cookie jar exposes `store`, `getSessionBundle()`, and `setSessionBundle()` instead of old direct `sessionId` properties.

`WebcastWebSocketClient` replaces `TikTokWsClient`. Most applications should use `connection.wsClient` rather than instantiate it themselves.

Protobuf v3 types are re-exported from the package root. Do not combine v2 message codecs with v3 payloads. The generated [schema reference](https://ttlc.docs.isaackogan.com/schema/) describes the installed dependency.

## Events and errors

Listen to `SUPER_FAN_JOIN` separately from `SUPER_FAN`. Listen to `FOLLOW` and `SHARE` directly; recognized follow/share messages are routed to those events instead of `SOCIAL`.

`InvalidResponseError` takes a config object containing `routeId`. Composite lookup failures expose individual errors in `config.requestErrs`. [Troubleshooting](https://ttlc.docs.isaackogan.com/troubleshooting/) covers the current error classes and units for retry delays.

The repository's [BREAKING.md](https://github.com/zerodytrash/TikTok-Live-Connector/blob/ts-rewrite/BREAKING.md) contains historical migration notes. Compare older notes with the current generated API when updating an application.
