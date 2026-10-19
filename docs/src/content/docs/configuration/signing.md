---
title: Signing and provider clients
description: Configure SignConfig, provider API keys, JWTs, and separate SDK instances.
sidebar:
  order: 2
---

The connector obtains signed WebSocket connection details through `RouteConfig.fetchSignedWebSocketFromProvider`. The default handler calls Euler Stream through `tiktok-live-api-sdk`. HTTP requests that require signing use `fetchWebcastSignatureFromProvider`.

## API key

Set `SIGN_API_KEY` before starting your process, or supply `signApiKey` to the first connection. A provider API key is separate from a TikTok session cookie.

```ts
import { TikTokLiveConnection } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {
    signApiKey: process.env.SIGN_API_KEY,
});
```

## Global configuration and caching

`SignConfig` contains the SDK configuration: `basePath`, `apiKey`, `baseOptions`, and an optional `cachedInstance`. `createEulerClient()` constructs the first SDK client and caches it. Later calls return that instance.

Set global options before constructing any connection. Changing `SignConfig` afterward does not rebuild the cached SDK instance or update existing connections.

```ts
import { SignConfig, TikTokLiveConnection } from 'tiktok-live-connector';

SignConfig.apiKey = process.env.SIGN_API_KEY;
SignConfig.basePath = 'https://api.eulerstream.com';
SignConfig.baseOptions = {
    ...SignConfig.baseOptions,
    headers: {
        ...SignConfig.baseOptions?.headers,
        'X-Application': 'my-live-reader',
    },
};

const connection = new TikTokLiveConnection('creator_username', {});
```

For independent credentials or SDK settings, create a provider SDK instance and pass `eulerApiInstance`. Existing connections retain their original client reference even if you later clear `SignConfig.cachedInstance`.

## JWTs

Euler Stream supports JWT-based access for applications that should not distribute a server API key. Obtain a token through your trusted server and pass it using the SDK's `x-jwt-key` header. Token creation limits and endpoint permissions belong to the provider; consult its current SDK documentation rather than hard-coding plan or expiration assumptions here.

Configure headers before the first client is cached, or use an explicit SDK instance. A JWT does not replace TikTok authentication for routes that act as a user.

## Custom providers

Override `RouteConfig.fetchSignedWebSocketFromProvider` to use a different provider. It must return `fetchResult`, `fetchResultCookieHeader`, and optionally `fetchResultRoomId`, matching `FetchSignedWebSocketFromEulerRouteResponse`.

The decoded initial response must include the cursor and connection information required by `TikTokLiveConnection`. An ordinary JSON response or a URL string alone is insufficient. See [routes](https://ttlc.docs.isaackogan.com/advanced/routes/) for the override pattern.

Signing limits, authentication permissions, and premium routes are enforced by the provider. Handle their errors and retry delays; see [troubleshooting](https://ttlc.docs.isaackogan.com/troubleshooting/).
