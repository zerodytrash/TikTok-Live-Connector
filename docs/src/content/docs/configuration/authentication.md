---
title: Authentication
description: Cookie sessions, OAuth tokens, mobile signing, and host allowlisting.
sidebar:
  order: 3
---

Reading a public livestream normally requires no TikTok login. Sending chat and other actions performed as a user require an authenticated TikTok session and the appropriate provider permission.

## Cookie sessions

`session.cookie` uses a `CookieSessionBundle`:

```ts
import { TikTokLiveConnection } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {
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
```

Supply real nonempty values before making an authenticated request. These environment variable names are application examples; the connector does not read them automatically.

The constructor seeds the cookie jar from this bundle. `getSessionBundle()` returns a bundle only when both required cookies are present. `setSessionBundle()` updates the jar for later requests. The cookie jar is not a browser cookie database and does not isolate cookies by URL.

## OAuth

The `OAuthTokenSessionBundle` shape is `{ type: 'oAuthToken', value: 'token' }`, passed as `session.oAuthToken`. The capital `A` in `oAuthToken` is part of the property name.

The send-chat and gift-gallery handlers choose cookie authentication whenever the jar has a nonempty cookie string. They use OAuth only when that string is empty. The default headers seed the jar with `tt-target-idc=useast1a`, so merely passing `session.oAuthToken` does not select OAuth for these handlers. Inspect the jar and configure the intended route/session behavior before relying on that fallback.

## Authenticated WebSocket connections

Set `authenticateWs: true` and supply a cookie session to authenticate either a web or mobile connection. The client forwards these options to the signing route, then includes the cookie jar in the final WebSocket headers. Without this flag, the socket uses an anonymous cookie string that excludes the configured session and target-IDC cookies.

Before forwarding authenticated cookies, the default signing route requires `WHITELIST_AUTHENTICATED_SESSION_ID_HOST` to exactly match the configured provider URL's host, including a port if present.

For the default provider, set the variable to `api.eulerstream.com`. The allowlist confirms the destination you intend to trust with the session. Keep credentials on your server and out of logs and source control.

```ts
import { TikTokLiveConnection } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {
    signApiKey: process.env.SIGN_API_KEY,
    authenticateWs: true,
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
```

For mobile signing, also set `useMobile: true`. Mobile mode requires `authenticateWs: true` and a cookie session; setting `useMobile` without `authenticateWs` throws a `TypeError` during connection. Web mode is the default.

## OAuth and socket signing

The default signing route forwards a cookie header, not the stored OAuth token, to `fetchWebcastURL`. The public authenticated-WebSocket option types require a cookie session. Although the connection's runtime guard also accepts a stored OAuth bundle, that does not make OAuth an alternative to cookies for this signing route.

The signing request and final WebSocket handshake are separate stages. Check both when investigating authentication problems.

See the [connection implementation](https://github.com/zerodytrash/TikTok-Live-Connector/blob/ts-rewrite/src/lib/client/index.ts) and [signing handler](https://github.com/zerodytrash/TikTok-Live-Connector/blob/ts-rewrite/src/lib/web/routes/euler/fetch-signed-websocket-euler.ts) when evaluating a newer release.
