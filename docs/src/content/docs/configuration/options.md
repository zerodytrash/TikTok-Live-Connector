---
title: Connection options
description: Every TikTokLiveConnection constructor option and its current behavior.
sidebar:
  order: 1
---

Construct a client with `new TikTokLiveConnection(uniqueId, options)`. The options object is optional and defaults to `{}`. Options are applied during construction; changing the original object later does not reconfigure the client.

## Provider and session

| Option | Default | Behavior |
| --- | --- | --- |
| `signApiKey` | `undefined` | Writes a supplied nonempty key to the global `SignConfig.apiKey` before the HTTP client is created. An already cached provider instance is not rebuilt. |
| `eulerApiInstance` | `undefined` | Uses your prebuilt provider SDK client instead of `createEulerClient()`. Its configuration controls provider requests. |
| `session` | `undefined` | Bundle containing a cookie session, an OAuth token, or both. Cookies seed the HTTP cookie jar; OAuth is stored on the HTTP client. |
| `authenticateWs` | Unset | Forwards cookies to the signing provider for web or mobile mode and includes them in the socket headers. Requires a cookie session and provider host allowlisting; see [authentication](/configuration/authentication/). |
| `useMobile` | Unset | Selects mobile signing. Requires `authenticateWs: true` and a cookie session; it does not enable authentication automatically. |

`eulerApiInstance` bypasses the cached client, but passing `signApiKey` still writes the global key. Prefer configuring your explicit SDK instance directly when you need separate accounts or keys.

## Connection behavior

| Option | Default | Behavior |
| --- | --- | --- |
| `processInitialData` | `true` | Emits decoded messages from the initial signing response. Disable if you only want subsequent socket traffic. |
| `fetchRoomInfoOnConnect` | `true` | Fetches room information before signing; a room status of `4` produces `UserOfflineError`. |
| `enableExtendedGiftInfo` | `false` | Fetches a gift list during connection, stores it in `availableGifts`, and attaches matching `extendedGiftInfo` to gifts. A failed gift-list request can fail the connection. |

## Device and transport

| Option | Default | Behavior |
| --- | --- | --- |
| `clientPresets` | `getRandomPresets()` | Sets the `{ device, location, screen }` used to build HTTP and WebSocket defaults. Despite the helper's name, presets are fixed unless the randomization environment flags are enabled. |
| `webClientOptions` | `{}` | Options for the Got HTTP client, including proxy agents, headers, query parameters, and retries. See [HTTP transport](/advanced/http/). |
| `wsClientOptions` | `{}` | `ws` client options, including a proxy agent, custom headers, and `handshakeTimeout`. Dynamic connection headers take precedence over supplied headers. |
| `webConfigOverrides` | `{}` | Shallow replacement of fields in the resolved HTTP protocol configuration. |
| `wsConfigOverrides` | `{}` | Shallow replacement of fields in the resolved WebSocket protocol configuration. |

Nested objects in the config overrides are replaced, not recursively merged. For example, supplying `DEFAULT_HTTP_CLIENT_PARAMS` replaces that entire object. Preserve the existing resolved fields when overriding one protocol parameter; see [presets and defaults](/configuration/presets/).

```ts
import { TikTokLiveConnection } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {
    signApiKey: process.env.SIGN_API_KEY,
    processInitialData: false,
    fetchRoomInfoOnConnect: true,
    enableExtendedGiftInfo: false,
    wsClientOptions: { handshakeTimeout: 20_000 },
});
```

Unknown options from older versions are not substitutes for these settings. Type-check your options object and use the [migration guide](/getting-started/migration/) when updating old code.
