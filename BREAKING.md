# Breaking Changes

Covers every API-surface break introduced **after the `2.1.1-beta1` snapshot of 2025-12-12** (commits `eee8383`..`HEAD`). Anything older is unaffected; anything in this window is new.

The headline release is `2.2.0-beta1` / `2.3.0-alpha1`, which lands a near-total rewrite of the connection, web/ws clients, routes layer, configuration, and packaging.

---

## 1. Packaging & build (ESM-only, new exports)

- **The package is now ESM-only** (`"type": "module"` in `package.json`). CommonJS consumers must switch to `import` / dynamic `import()`. The CJS `require('tiktok-live-connector')` path no longer works.
- **`exports` field** replaces the implicit single entry. Two public entry points are exposed; nothing else under `dist/` is importable:
  - `tiktok-live-connector` &rarr; modern `TikTokLiveConnection` API.
  - `tiktok-live-connector/legacy` &rarr; the deprecated `WebcastPushConnection` shim. Previously `WebcastPushConnection` was re-exported from the root entry; now it must be imported from `/legacy`.
- **Build pipeline migrated from `tsc` + `tsc-alias` to `tsdown`** (`tsdown.config.ts`). `dist/` is emitted as ES2022 ESM. Anyone consuming the old CJS `dist/` shape will break.
- **TypeScript bumped from ^4.8.2 to ^5.6.0**, `tsconfig` now targets `ES2022`, `module: ESNext`, `moduleResolution: Bundler`, `strictNullChecks: true`, `allowJs: false`. Downstream type imports may now fail under stricter null checks.
- **Node engine** is unchanged at `>=20`, but Node 18 (which still works in some setups under the old build) is no longer practical due to ESM + got requirements.

## 2. Runtime dependencies

- **HTTP transport: axios &rarr; [`got`](https://github.com/sindresorhus/got) `^15`.** All HTTP types (`AxiosRequestConfig`, `AxiosInstance`, `AxiosResponse`, interceptors) are gone from the public API. Custom request options now use got's `OptionsInit` shape (and the project's narrower `WebcastGotHttpConfig`).
- **Protobuf schema externalised: `tiktok-live-proto`.** All message types previously exported from `@/types/tiktok-schema` (~41k lines deleted) now live in the [`tiktok-live-proto`](https://www.npmjs.com/package/tiktok-live-proto) package and are re-exported from `tiktok-live-proto/v2`. Module-augmentation consumers must update `declare module '@/types/tiktok-schema'` to `declare module 'tiktok-live-proto/v2'`.
- **Removed runtime dependencies:** `axios`, `callable-instance`, `protobufjs`, `https-proxy-agent`. `axios` is still kept as a `devDependency` for tests only; `callable-instance` was the base for the old class-style routes.
- **Added runtime dependencies:** `got@^15`, `tiktok-live-proto@0.1.1`. (`hpagent` was added for proxying, then removed in favour of consumer-supplied agents — supply your own proxy agent via `webClientOptions.agent` / `wsClientOptions.agent`.)
- **`@eulerstream/euler-api-sdk` bumped from `0.1.7` to `0.3.0`** — its API surface (notably `SignTikTokUrlBodyMethodEnum`, `SignWebcastUrl200Response`) has shifted; consumers that imported from `@eulerstream/euler-api-sdk/dist/sdk/api` should now import from the package root.

## 3. Public module layout

- **`src/lib/index.ts` re-exports collapsed.** Previous: `client`, `utilities`, `web`, `ws`, `_legacy`, `config`. Now only: `client`, `ws/lib/proto-utils`, `ws/lib/ws-client`. Deep imports via `tiktok-live-connector/lib/...` were never supported, but anything that pulled `WebcastConfig`, `Config`, `EulerSigner`, `TikTokWebClient`, `WebcastPushConnection`, etc. from the package root no longer resolves.
- **`src/types/index.ts`** drops `./route` and `./tiktok-schema` exports; instead re-exports `tiktok-live-proto/v2`. The `Route` abstract class and `tiktok-schema` symbols are no longer in the barrel.
- **`src/lib/_legacy/` is gone.** `WebcastPushConnection` and `simplifyObject` moved to `src/lib/client/legacy/`. The class still exists, but you import it via `tiktok-live-connector/legacy`, not via the root barrel.
- **`src/lib/client.ts` is gone.** `TikTokLiveConnection` lives at `src/lib/client/index.ts`.
- **`src/lib/config.ts` is gone.** Its contents are split into `src/lib/web/defaults.ts`, `src/lib/web/config.ts`, `src/lib/web/lib/device-presets.ts`, `src/lib/ws/defaults.ts`, `src/lib/ws/config.ts`. The `Config` default export and the `WebcastConfig` interface are removed.
- **`src/lib/utilities.ts` is gone.** Proto helpers moved to `src/lib/ws/lib/proto-utils.ts`; `randomLongString` is gone (see §10); device-preset helpers moved to `src/lib/web/lib/device-presets.ts`.
- **`src/lib/web/index.ts` is empty.** The `TikTokWebClient` wrapper class is removed (see §5).
- **`src/lib/web/lib/tiktok-signer.ts` is removed.** The `EulerSigner` standalone class is gone; signing now goes through `RouteConfig.fetchWebcastSignatureFromProvider`.
- **`src/lib/web/routes/` reorganised** from a flat folder into `base/`, `euler/`, `composite/` subfolders (see §6). The flat module paths (`@/lib/web/routes/fetch-room-info`, etc.) no longer exist.
- **`src/types/general.ts` removed** along with its `WebSocketStatusCode` enum.
- **`src/types/web.ts` and `src/types/ws.ts` are new.**

## 4. `TikTokLiveConnection` constructor & options

The constructor signature `(uniqueId, options)` is unchanged, but the **shape of `options` is fundamentally different**.

### Authentication: `sessionId` / `ttTargetIdc` / `oauthToken` &rarr; `session` bundle

**Before:**
```ts
new TikTokLiveConnection(uniqueId, {
    sessionId: '...',
    ttTargetIdc: 'useast1a',
    oauthToken: '...'
});
```

**After:**
```ts
new TikTokLiveConnection(uniqueId, {
    session: {
        cookie:     { type: 'cookie',     value: { sessionId: '...', ttTargetIdc: 'useast1a' } },
        oAuthToken: { type: 'oAuthToken', value: '...' },
    },
});
```

Notes:
- `CookieSessionBundle` and `OAuthTokenSessionBundle` are discriminated unions tagged with `type`. The discriminator on the OAuth bundle is **`'oAuthToken'`** (capital A) — earlier in this development cycle it was briefly `'oauthToken'`; if you wrote against an interim version, update the tag.
- `useMobile: true` now requires `session.cookie` and `authenticateWs: true` at the type level.
- `authenticateWs: true` (without mobile) also requires `session.cookie`.

### Removed connection options

| Removed | Replacement |
| --- | --- |
| `enableRequestPolling`, `requestPollingIntervalMs` | Polling fallback dropped entirely; the connection is WebSocket-only. |
| `connectWithUniqueId` | `connect()` always uses `uniqueId` to resolve a `roomId` if one is not supplied/cached; there is no separate flag. |
| `disableEulerFallbacks` | Replace with per-route toggles on `IsLiveRouteConfig` / by overriding handlers on `RouteConfig` (see §6). |
| `signedWebSocketProvider` | Replace by overriding `RouteConfig.fetchSignedWebSocketFromProvider` globally (or via your own `eulerApiInstance`). |
| `webClientHeaders`, `webClientParams` | Folded into `webClientOptions.headers` / `webClientOptions.searchParams`, or globally via `webConfigOverrides.DEFAULT_HTTP_CLIENT_HEADERS` / `.DEFAULT_HTTP_CLIENT_PARAMS`. |
| `wsClientHeaders`, `wsClientParams` | Folded into `wsClientOptions.headers` and `wsConfigOverrides.DEFAULT_WS_CLIENT_PARAMS`. |
| `webClientOptions: AxiosRequestConfig` | Now `webClientOptions: WebcastGotHttpConfig` (got's `OptionsInit` minus `url` / `prefixUrl` / `searchParams` / `cookieJar`). Axios-shaped options will not type-check or behave correctly. |
| `wsClientOptions: ClientOptions` | Same `ws.ClientOptions` type, but the surrounding wiring changed (see §5). |

### New connection options

- `clientPresets?: GetWebConfigParams` — supply fixed `device`/`screen`/`location` presets. If omitted, random presets are picked per connection (was hard-coded inside the old `Config` module).
- `webConfigOverrides?: Partial<WebcastWebConfigDefaults>` — patch the static web defaults (host, default headers/params, cookie names, IDC name).
- `wsConfigOverrides?: Partial<WebcastWebSocketConfigDefaults>` — patch the static ws defaults (host, params, headers, ping interval, version-code suffix).
- `eulerApiInstance?: EulerStreamApiClient` — inject a pre-built Euler SDK client; if omitted, one is created from `signApiKey` (or `SIGN_API_KEY` env).

### Connection state shape

`TikTokLiveConnectionState` gains an `isConnecting: boolean` field. Anything destructuring or asserting on the previous 4-field shape (`isConnected`, `roomId`, `roomInfo`, `availableGifts`) needs to be updated.

### Connection accessors / internals

- `apiClient` getter (returns the underlying `EulerStreamApiClient`) is new; `webClient.webSigner` is gone.
- `webClient` getter still returns a `WebcastHttpClient`, but it is the rewritten got-based one, not the axios wrapper (see §5).
- `wsClient` getter now returns `WebcastWebSocketClient | null` (renamed from `TikTokWsClient`).
- The `state.isConnecting` property is observable while a `connect()` call is in flight.
- The `clientParams` getter still proxies to `webClient.clientParams`, but that object is now read-only at the top level and merged per-call (see §5).

## 5. HTTP & WebSocket clients

### `WebcastHttpClient` (rewritten)

- Constructor signature changed:
  - Was `new WebcastHttpClient(config: WebcastHttpClientConfig, webSigner?: EulerSigner)`.
  - Now `new WebcastHttpClient(webcastWebConfig: WebcastWebConfigDefaults, eulerApiInstance?: EulerStreamApiClient, gotHttpConfig?: WebcastGotHttpConfig)`.
- The `WebcastHttpClientConfig` type is removed. Its `customHeaders`/`axiosOptions`/`clientParams`/`signApiKey`/`oauthToken` fields no longer exist.
- `axiosInstance` field is removed; `_gotInstance` is the new transport (and is `protected`).
- `webSigner` field is removed. URL signing flows through `RouteConfig.fetchWebcastSignatureFromProvider`.
- `clientParams` is now a `readonly` object filled from `webcastWebConfig.DEFAULT_HTTP_CLIENT_PARAMS`. Mutating it after the fact is no longer the supported way to add params; pass them per-call via `request({ searchParams })`, or override `webConfigOverrides`.
- `clientHeaders` is new (was implicit on `axiosInstance.defaults.headers`).
- `oAuthSessionBundle` is new (a typed `OAuthTokenSessionBundle | null` slot).
- `request({ params })` &rarr; `request({ searchParams })`. The argument shape (`WebcastHttpClientRequestParams`) is now `Omit<OptionsInit, 'url' | 'prefixUrl' | 'searchParams' | 'cookieJar' | 'headers'> & { host, path, headers?, searchParams?, signRequest, ... }`. Axios-style `params` will silently fail.

### Cookie jar (renamed and rewritten)

- `CookieJar` &rarr; **`WebcastCookieJar`** (default export from `src/lib/web/lib/cookie-jar.ts`). Implements `AbstractWebcastCookieJar` (extends got's `PromiseCookieJar`).
- Constructor: `new WebcastCookieJar(webConfig: WebcastWebConfigDefaults)` (was `new CookieJar(axiosInstance, cookies?)`).
- The internal `cookies` record is renamed `store`. The Proxy that exposed cookies as direct properties of the jar is gone — read/write via `store[name]` or `getCookie/setCookie`.
- Direct getters/setters removed: `sessionId`, `ttTargetIdc`, `setSession(sessionId, ttTargetIdc)`, `buildSessionCookieHeader(...)`. Replaced by:
  - `await jar.getSessionBundle(): Promise<CookieSessionBundle | null>`
  - `await jar.setSessionBundle(session: CookieSessionBundle): Promise<void>`
  - `WebcastCookieJar.serializeCookieSessionBundle(webConfig, bundle)` (static helper)
- `processSetCookieHeader` is now `async` and takes `unknown` (got passes header arrays).
- `readCookies` / `appendCookies` (axios interceptor methods) are gone; the integration is via got's `cookieJar` option, set automatically by `WebcastHttpClient`.

### `TikTokWsClient` &rarr; `WebcastWebSocketClient`

- Class renamed and **moved off of the manual constructor pattern onto a provider factory.**
  - Old: `new TikTokWsClient(wsUrl, cookieJar, webSocketParams, webSocketHeaders, webSocketOptions, pingIntervalMs)`.
  - New: produced by `createWebSocketProvider(webcastWebSocketConfig, wsClientOptions?)`, which returns `(dynamicParams: WebSocketDynamicParams) => WebcastWebSocketClient`. Direct construction is `new WebcastWebSocketClient(mergedConfig, wsClientOptions?)`.
  - `WebSocketDynamicParams` = `{ roomId, baseUrl, wsParams, wsHeaders }`. Anyone instantiating the WS client directly must provide these.
- The standalone `pingIntervalMs` constructor argument is gone — it's now `webcastWebSocketConfig.DEFAULT_WS_PING_INTERVAL`.
- The cookie jar is no longer passed to the WS client; the connection serialises cookies from the cookie jar into `wsHeaders.Cookie` before constructing the client.
- Heartbeat now uses the running `seqId` instead of a constant `'1'` for `sendPacketSeqId`. Mock servers / sniffers that pinned to `'1'` will see new values.
- Heartbeat / ACK frames now also fire when `protoMessageFetchResult?.internalExt` is missing they are skipped (with a `console.error` warning suppressible via `DISABLE_ACK_LOG_WARNING=1`). Previously this would crash with a `TypeError`. Behaviour change for anyone catching that error.
- The typed `EventMap` was inlined in the file; it now lives in `src/types/ws.ts` as `WebcastWebSocketEventMap` / `WebcastTypedWebSocket`.

### `TikTokWebClient` (removed)

The `TikTokWebClient` wrapper class (which exposed `fetchRoomInfo` / `fetchRoomIdFromEuler` / `sendRoomChatFromEuler` / etc. as instance fields) is **deleted**. Use the route functions or the `RouteConfig` registry instead (§6), passing a `webClient: WebcastHttpClient` and (for Euler routes) `apiClient: EulerStreamApiClient`.

## 6. Routes

The flat `Route` class hierarchy is replaced with a function-based architecture and a runtime-overridable global registry.

### Class &rarr; function

- `abstract class Route<Args, Response> extends CallableInstance<...>` is **removed.**
- All `FetchXxxRoute` classes (`FetchRoomInfoRoute`, `FetchRoomInfoFromHtmlRoute`, `FetchRoomInfoFromApiLiveRoute`, `FetchSignedWebSocketFromEulerRoute`, `FetchRoomIdFromEulerRoute`, `FetchRoomInfoFromEulerRoute`, `SendRoomChatFromEulerRoute`) are **removed.**
- Each route is now a plain async function created by the `createRoute(routeId, handler)` wrapper from `@/lib/web/lib/route-wrapper`. They take an args object and return a Promise.

  Old:
  ```ts
  const route = new FetchRoomInfoFromEulerRoute(webClient);
  const info = await route({ roomId });
  ```
  New:
  ```ts
  import { fetchRoomInfoFromEulerRoute } from 'tiktok-live-connector';
  const info = await fetchRoomInfoFromEulerRoute({ webClient, apiClient, roomId });
  ```

### Folder reorg

The `src/lib/web/routes/*.ts` flat layout is gone. Routes now live under:

| Group | Path | Members |
| --- | --- | --- |
| `base/` | `src/lib/web/routes/base/` | `fetchRoomInfoRoute`, `fetchRoomInfoFromHtmlRoute`, `fetchRoomInfoFromApiLiveRoute`, `fetchRoomGiftsRoute` |
| `euler/` | `src/lib/web/routes/euler/` | `fetchRoomIdFromEulerRoute`, `fetchRoomInfoFromEulerRoute`, `fetchSignedWebSocketFromEulerRoute`, `sendRoomChatFromEulerRoute`, `fetchWebcastSignatureFromEulerRoute` *(new)* |
| `composite/` | `src/lib/web/routes/composite/` | `fetchRoomIdComposite`, `fetchIsLiveComposite` |

Imports from the old paths (`@/lib/web/routes/fetch-room-info`, etc.) no longer resolve.

### `RouteConfig` registry

A new global mutable registry lives at `src/lib/web/config.ts`:

```ts
import { RouteConfig } from 'tiktok-live-connector';

RouteConfig.fetchRoomInfo = async ({ webClient, roomId }) => { /* override */ };
RouteConfig.fetchSignedWebSocketFromProvider = async (params) => { /* swap Euler for your own */ };
```

`TikTokLiveConnection` and `WebcastHttpClient` now read all overridable handlers from this registry. The `signedWebSocketProvider` connection option (§4) is replaced by overriding `RouteConfig.fetchSignedWebSocketFromProvider` globally.

### Other route changes

- `RoomGiftsResponse` is a new dedicated type for the room-gifts response; `RoomGiftInfo` is still re-exported but is `any`.
- `IsLiveRouteConfig` (boolean toggles for skipping each fallback method) is exported from `src/lib/web/routes/composite/fetch-is-live.ts` and replaces the old `disableEulerFallbacks` connection option.
- New per-route ID enums in `src/lib/web/routes/routes.ts` (`BaseFetchRoute`, `EulerFetchRoute`, `CompositeFetchRoute`) used as the `routeId` thread for error context.

## 7. Errors

`src/types/errors.ts` was rewritten:

| Removed | Notes |
| --- | --- |
| `FetchIsLiveError` | Replaced by `InvalidResponseCompositeError`. |
| `MissingRoomIdError` | No replacement; absent room IDs now surface as `InvalidResponseError` from the composite room-id route. |
| `FetchSignedWebSocketIdentityParameterError` | No replacement. |

| Changed | Notes |
| --- | --- |
| `InvalidResponseError` | Constructor was `(message: string, requestErr?: Error)`. Now `(config: { routeId: string, requestErr?: Error }, ...args: string[])`. The first argument is a config object, not a string. The `name` field is no longer manually set. |
| `SignAPIError` | Varargs accept `string \| Error \| undefined`; `Error` values are unwrapped to `.message` when assembling the rendered string. |

| Added | Notes |
| --- | --- |
| `InvalidRequestError` | `(config: { routeId }, ...args: string[])`. |
| `InvalidResponseCompositeError` | `(config: { routeId, requestErrs?: Error[] }, ...args: string[])`. Aggregates per-source errors from composite fallback flows. |
| `ConnectTimeoutError extends ConnectError` | Thrown when the websocket fails to open within `WS_CONNECT_TIMEOUT_MS` (default `20000`). |

## 8. Events

- **`WebcastEvent.SUPER_FAN_BOX = 'superFanBox'`** added (commit `b609a02`, `2026-02-28`). `ClientEventMap` gained the matching `EventHandler<WebcastEnvelopeMessage>` entry. The duplicate `SUPER_FAN` entry that used to live in the map was removed (no behaviour change, but the prior duplicate is gone if you grepped for it).
- **`WebcastEvent.SUPER_FAN_JOIN = 'superFanJoin'`** added (commit `35501c7`, `2026-04-22`). Distinguishes "an existing super fan joined the live" (`SUPER_FAN_JOIN`) from "someone became a super fan" (`SUPER_FAN`). Listeners that were treating every `ttlive_superfan*` barrage as `SUPER_FAN` will now receive only the "became super fan" subset; the "joined" subset routes to `SUPER_FAN_JOIN` and should be subscribed to separately.
- The `[WebcastEvent.SUPER_FAN]` handler payload is unchanged (`WebcastBarrageMessage`).
- `[ControlEvent.WEBSOCKET_CONNECTED]` payload type renamed `TikTokWsClient` &rarr; `WebcastWebSocketClient` (same shape, new name).
- `WebcastTypedClient` (`new () => TypedEventEmitter<ClientEventMap>`) is now exported from `src/types/events.ts`.

## 9. Configuration

The monolithic `Config` default export is gone; configuration is now domain-scoped and value-keyed.

| Old | New |
| --- | --- |
| `Config.TIKTOK_HOST_WEB`, `Config.TIKTOK_HOST_WEBCAST`, `Config.TIKTOK_HTTP_ORIGIN`, `Config.DEFAULT_HTTP_CLIENT_*` | `WebcastWebConfigDefaults` (object) in `src/lib/web/defaults.ts` |
| `Config.DEFAULT_WS_CLIENT_*` | `WebSocketConfigDefaults` (object) and the `WebcastWebSocketConfigDefaults` type in `src/lib/ws/defaults.ts` |
| Implicit static defaults | `getWebConfig({ device, screen, location })` returns a freshly-cloned config with templated values resolved |
| Implicit static defaults | `getWebSocketConfigDefaults({ device, screen, location })` for the WS counterpart |
| Implicit static random selection | `getRandomPresets()` returns `{ device, screen, location }`; expose them on the connection via `clientPresets` if you want to lock them. |
| `Config.DEFAULT_HTTP_CLIENT_COOKIES` | Removed; default cookies are seeded from `WebcastWebConfigDefaults.DEFAULT_HTTP_CLIENT_HEADERS.Cookie` and parsed into the cookie-jar `store`. |
| `WebcastConfig` interface | Removed. Use `typeof WebcastWebConfigDefaults` (exported as a type alias). |
| `EulerSigner` class | Removed. Use `RouteConfig.fetchWebcastSignatureFromProvider` or `createEulerClient()` from `src/lib/web/routes/euler/config.ts`. |
| `SignConfig` (process-wide config from the SDK) | Still global, but now imported from `@eulerstream/euler-api-sdk` via `src/lib/web/routes/euler/config.ts`. The connection writes `SignConfig.apiKey = options.signApiKey` if a key is supplied. |

New config-related public types in `src/types/web.ts`: `LocationPreset`, `DevicePreset`, `ScreenPreset`, `GetWebConfigParams`, `GetWebSocketConfigParams`, `WebSocketDynamicParams`, `AbstractWebcastCookieJar`, `WebcastGotHttpConfig`.

## 10. Utilities & misc

- `randomLongString()` &rarr; **`generateUniqId()`** (moved to `src/lib/ws/lib/ws-utils.ts`). Same algorithm; renamed for clarity. Imports of `randomLongString` from `@/lib/utilities` will fail.
- `generateDeviceId()` and `userAgentToDevicePreset()` moved from `@/lib/utilities` to `@/lib/web/lib/device-presets.ts`.
- `validateAndNormalizeUniqueId(uniqueId)` now takes `unknown` and returns `string` (was loosely typed); throws `InvalidUniqueIdError` for non-strings.
- `createBaseWebcastPushFrame` now defaults the payload to `Buffer.from([])` instead of `new Uint8Array()` (matches got/ws expectations on Node).
- The `EulerSigner` re-export from `@/lib` is gone (see §9).

## 11. Legacy `WebcastPushConnection`

Still ships, but with significant churn:

- **Import path moved.** Was importable from `tiktok-live-connector`; now only via `tiktok-live-connector/legacy`.
- **Constructor signature changed transitively** — it inherits from the new `TikTokLiveConnection`, so the session-bundle changes from §4 apply equally here.
- The class is typed against a stricter `WebcastPushConnectionBase` cast; the old `(...args: any[])` escape hatch is gone. Subclassers that relied on the loose cast must adopt the `(uniqueId, options)` signature.
- `WebcastControlMessage.action` is now guarded against `undefined` before the `[3, 4].includes(action)` check; the `action == null` case used to throw, now it's a no-op.
- The fire-and-forget `this.disconnect()` on stream-end is now `void this.disconnect().catch(() => {})` — unhandled rejections from a stream-end disconnect no longer surface.
- `WebcastEvent.SUPER_FAN_JOIN` is also routed inside the legacy flow (via `resolveLegacySuperFanBarrageEvent`), so legacy listeners for `SUPER_FAN` will likewise see only the "became super fan" subset (see §8).

## 12. Environment variables

| Var | Effect | Status |
| --- | --- | --- |
| `TIKTOK_CLIENT_TIMEOUT` | Per-request got timeout (ms). Default `10000`. | Same name, now applied to got's `timeout.request` instead of axios's `timeout`. |
| `WS_CONNECT_TIMEOUT_MS` | New. Connect timeout in ms (default `20000`) before `ConnectTimeoutError` is thrown. | New. |
| `DISABLE_ACK_LOG_WARNING` | New. Suppresses the `console.error` warning when an ACK frame is skipped due to a missing `internalExt`. | New. |
| `SIGN_API_KEY` | Picked up by the Euler SDK if `signApiKey` isn't passed. | Unchanged. |

---

## Quick migration checklist

1. Rewrite `require('tiktok-live-connector')` as `import { TikTokLiveConnection } from 'tiktok-live-connector'`. If you used `WebcastPushConnection`, switch to `import { WebcastPushConnection } from 'tiktok-live-connector/legacy'`.
2. Replace `sessionId` / `ttTargetIdc` / `oauthToken` constructor options with the `session: { cookie, oAuthToken }` bundle shape (note the capital `A` in `oAuthToken`).
3. Replace `webClientHeaders` / `webClientParams` / `wsClientHeaders` / `wsClientParams` with `webClientOptions` / `wsClientOptions` (got-shaped) or `webConfigOverrides` / `wsConfigOverrides`.
4. Replace `signedWebSocketProvider` with a `RouteConfig.fetchSignedWebSocketFromProvider` override.
5. Replace any `new FetchXxxRoute(...)` and `new TikTokWebClient(...)` usage with the new functional routes (`fetchXxxRoute({ webClient, apiClient, ... })` or `RouteConfig.xxx(...)`).
6. Replace any `axios`-shaped request options with `got`-shaped equivalents.
7. Update protobuf imports from `@/types/tiktok-schema` (or the package barrel) to `tiktok-live-proto/v2`. Update `declare module` augmentations accordingly.
8. Update direct cookie-jar access (`jar.sessionId`, `jar.setSession(...)`) to `jar.getSessionBundle()` / `jar.setSessionBundle(...)`.
9. Update `InvalidResponseError` constructor calls to pass `{ routeId }` as the first argument instead of a string message.
10. Subscribe to `WebcastEvent.SUPER_FAN_JOIN` if you previously relied on `SUPER_FAN` covering the "joined" sub-case.
11. Consume `state.isConnecting` if you destructure `TikTokLiveConnectionState`.
12. Bump TS to 5.x and ensure your tsconfig is ESM-friendly (`module: ESNext` / `moduleResolution: Bundler` or `NodeNext`).
