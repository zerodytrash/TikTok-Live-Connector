---
title: HTTP routes and overrides
description: All RouteConfig handlers, exported functions, and fallback controls.
---

Each route is an async function accepting one argument object. Base routes need a `webClient`; provider and composite routes also need an `apiClient`. `WebcastHttpRouteArgs`, `WebcastHttpEulerRouteArgs`, and `WebcastHttpCompositeRouteArgs` describe those shared arguments.

## Route registry

| `RouteConfig` member | Exported function | Inputs beyond the clients | Result |
| --- | --- | --- | --- |
| `fetchRoomInfo` | `fetchRoomInfoRoute` | Optional `roomId` | TikTok room-info response. |
| `fetchRoomGifts` | `fetchRoomGiftsRoute` | Optional `roomId` | The `data.gifts` array from a signed gift-list request. |
| `fetchRoomInfoFromApiLive` | `fetchRoomInfoFromApiLiveRoute` | `uniqueId` | TikTok API-live user/room response. |
| `fetchRoomInfoFromHtml` | `fetchRoomInfoFromHtmlRoute` | `uniqueId` | Parsed `SIGI_STATE`, including `user` and `liveRoom` when available. |
| `fetchRoomGiftsFromProvider` | `fetchRoomGiftsFromEulerRoute` | Optional `roomId`, `webcastLanguage`, `options` | Provider gift response envelope. |
| `fetchRoomGiftGalleryFromProvider` | `fetchRoomGiftGalleryFromEulerRoute` | `uniqueId`, optional `options` | Provider creator gift-gallery response. |
| `fetchRoomIdFromProvider` | `fetchRoomIdFromEulerRoute` | `uniqueId`, optional `options` | Provider room-ID/status response. |
| `fetchRoomInfoFromProvider` | `fetchRoomInfoFromEulerRoute` | `uniqueId`, optional `options` | Provider room-info response. |
| `fetchSignedWebSocketFromProvider` | `fetchSignedWebSocketFromEulerRoute` | `roomId`, session/platform options, optional `cursor`, `country`, `options` | Decoded `fetchResult`, cookie header, and optional replacement room ID. |
| `fetchWebcastSignatureFromProvider` | `fetchWebcastSignatureFromEulerRoute` | `url`, `method`, `userAgent`, optional `options` | Provider signed-URL response. |
| `sendRoomChatFromProvider` | `sendRoomChatFromEulerRoute` | `content`, `roomId`, optional `options` | Provider send-chat response. |
| `fetchRoomIdComposite` | `fetchRoomIdComposite` | `uniqueId` | Room ID string. |
| `fetchIsLiveComposite` | `fetchIsLiveComposite` | `uniqueId` | Live-status boolean. |

The generated [API reference](https://ttlc.docs.isaackogan.com/api/) provides the exact parameter and response types for each function. Provider response envelopes are not interchangeable with the arrays returned by the base TikTok routes.

```ts
import { RouteConfig, TikTokLiveConnection } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
const result = await RouteConfig.fetchRoomInfoFromHtml({
    webClient: connection.webClient,
    uniqueId: connection.uniqueId,
});
console.log(result.liveRoom);
```

## Override a handler

The registry is process-wide. Preserve the original function before replacing it, and restore it after a temporary override or test:

```ts
import { RouteConfig } from 'tiktok-live-connector';

const original = RouteConfig.fetchSignedWebSocketFromProvider;
RouteConfig.fetchSignedWebSocketFromProvider = async (args) => {
    const result = await original(args);
    // Apply application-specific observation or caching here.
    return result;
};
```

The high-level connection uses registry entries for its main operations. However, the two composite lookup functions call their imported source handlers directly in this checkout. Overriding `RouteConfig.fetchRoomInfoFromHtml`, for example, does not change the HTML call inside a composite lookup. Override the composite registry entry itself when you need to replace that behavior.

## Fallback controls

`RoomIdRouteConfig` and `IsLiveRouteConfig` each expose:

- `skipFetchRoomInfoFromHtmlRoute`
- `skipFetchRoomInfoFromApiLiveRoute`
- `skipFetchRoomIdFromEulerRoute`

All default to `false`. Each composite tries its enabled sources in order: HTML, TikTok API-live, then Euler Stream. Live status treats a valid TikTok status other than `4` as online. If all enabled sources fail, the composite throws `InvalidResponseCompositeError` with `config.requestErrs`.

## Route helpers and identifiers

`createRoute(routeId, handler)` adds the route ID to the handler's arguments. It does not add retries, caching, response validation, or error translation on its own. `HttpRoute` and `WrappedHttpRoute` describe the unwrapped and wrapped signatures.

`BaseFetchRoute`, `EulerFetchRoute`, and `CompositeFetchRoute` enumerate route IDs used in errors. `EulerRouteRequestOptions` is the loose request-options shape forwarded by the provider handlers to their SDK calls.
