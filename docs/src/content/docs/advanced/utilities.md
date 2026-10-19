---
title: Public types and utilities
description: Find exported configuration types, helpers, decorators, and runtime identifiers.
---

The [API reference](https://ttlc.docs.isaackogan.com/api/) is generated from the package's public entry point. It includes every connector export that is declared in this repository. Re-exported protobuf definitions have their own [schema reference](https://ttlc.docs.isaackogan.com/schema/).

## Types by purpose

| Purpose | Types |
| --- | --- |
| Connection configuration | `TikTokLiveConnectionOptions`, `TikTokLiveConstructorConnectionOptions`, `TikTokLiveConnectionProviderOptions`, `TikTokLiveConnectionBundledAuthOptions`, `TikTokLiveConnectionMutableOptions`. |
| Session bundles | `CookieSessionBundle`, `OAuthTokenSessionBundle`, `SessionBundle`. |
| State and listeners | `TikTokLiveConnectionState`, `ClientEventMap`, `EventHandler`, `WebcastTypedClient`. |
| Decoding | `WebcastMessage`, `WebcastEventMessage`, `BasicWebcastEventMessage`, `DecodedData`, `DecodedWebcastPushFrame`, `IWebcastDeserializeConfig`. |
| HTTP transport | `WebcastHttpClientRequestParams`, `WebcastGotHttpConfig`, `AbstractWebcastCookieJar`. |
| Presets | `DevicePreset`, `LocationPreset`, `ScreenPreset`, `GetWebConfigParams`, `GetWebSocketConfigParams`. |
| Socket configuration | `WebSocketParams`, `WebSocketDynamicParams`, `WebcastWebSocketConfig`, `WebcastWebSocketConfigDefaults`, `WebcastWebSocketEventMap`, `WebcastTypedWebSocket`. |
| Route arguments and functions | `WebcastHttpRouteArgs`, `WebcastHttpEulerRouteArgs`, `WebcastHttpCompositeRouteArgs`, `HttpRoute`, `WrappedHttpRoute`, `EulerRouteRequestOptions`. |
| Signing | `SignConfig`, `WebcastSignerParams`, `WebcastSignerResponse`, and each route's parameter/response types. |
| Loose response contracts | `RoomInfo`, `RoomGiftInfo`, `RoomInfoResponse`, `RoomGiftsResponse`. Check real response data before consuming fields typed as `any`. |

Some types are mapped types over the schema. A type alias documents compile-time structure; it is not a runtime parser or validation step.

## Helper functions

| Helper | Behavior |
| --- | --- |
| `validateAndNormalizeUniqueId()` | Accepts a string, strips the recognized TikTok URL prefix, `/live`, and `@`, then trims whitespace. Non-string inputs throw `InvalidUniqueIdError`. It does not perform a full username-existence check. |
| `getRandomPresets()` | Returns device, location, and screen presets. The environment controls whether each is randomized. |
| `getRandomDevicePreset()`, `getRandomLocationPreset()`, `getRandomScreenPreset()` | Return their respective preset values. |
| `getWebConfig()`, `getWebSocketConfigDefaults()` | Clone defaults and resolve template fields from supplied presets. |
| `userAgentToDevicePreset()` | Derives the basic browser/device fields from a User-Agent string. |
| `generateDeviceId()` | Builds a random 19-digit decimal string. It is not guaranteed unique or cryptographically secure. |
| `generateUniqId()` | Builds a random decimal room-entry identifier. It is separate from creator usernames and user IDs. |
| `createEulerClient()` | Returns the cached provider SDK instance, creating it from `SignConfig` on first use. |
| `createRoute()` | Wraps an async route handler and injects a route ID. |
| `createWebSocketProvider()` | Builds a socket factory from protocol defaults and transport options. |
| `deserializeMessage()`, `deserializeWebSocketMessage()` | Decode nested message payloads or complete push containers. |
| `createBaseWebcastPushFrame()` | Returns an encoded-frame writer; call `.finish()` for bytes. |
| `HandleError()` | Method decorator that calls the host object's `handleError`, optionally wraps the exception, and rethrows synchronous failures or promise rejections. It is not a retry decorator. |

`ConnectState` names the internal connection states. `VERSION` identifies this build, and `LIBRARY_IDENTITY` identifies the library in provider requests. The default identity should remain intact.

See [presets](https://ttlc.docs.isaackogan.com/configuration/presets/), [routes](https://ttlc.docs.isaackogan.com/advanced/routes/), [WebSocket client](https://ttlc.docs.isaackogan.com/advanced/websocket/), and [decoding](https://ttlc.docs.isaackogan.com/advanced/protocol/) for examples and behavior.
