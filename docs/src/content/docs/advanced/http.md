---
title: HTTP client and cookies
description: Configure HTTP requests, proxies, and cookies.
---

The connector uses [Got](https://github.com/sindresorhus/got), the `got` npm package, to make HTTP requests to TikTok. Most applications can use the connection methods and `RouteConfig`. `connection.webClient` exposes the underlying `WebcastHttpClient` for lower-level work.

## Request helpers

| Member | Purpose |
| --- | --- |
| `request()` | Send a request with `host`, `path`, `searchParams`, `headers`, `method`, and `signRequest`, plus Got options. |
| `getHtmlFromTikTokWebsite()` | Fetch text from the configured TikTok web host. |
| `getJsonObjectFromTikTokApi()` | Fetch JSON from the TikTok web host. |
| `getJsonObjectFromWebcastApi()` | Fetch JSON under the webcast host's `webcast/` path. |
| `postJsonObjectToWebcastApi()` | POST a JSON body under `webcast/`. |
| `getDeserializedObjectFromWebcastApi()` | Fetch a binary response and decode it with a named protobuf codec. |

`request()` merges per-call headers and query parameters over the client's current `clientHeaders` and `clientParams`. A signed request asks the provider for a signed URL and honors a returned User-Agent. Body, response type, retry, and other remaining options go to Got.

In this checkout, `getBaseUrl()` prefixes non-loopback hosts with `http://` and loopback hosts with `https://`. It does not preserve an arbitrary full URL. This is a current transport limitation: verify the resulting URL and TLS behavior before using authenticated direct HTTP calls. If you need a different transport, replace the relevant route with one you control.

## Transport configuration

`webClientOptions` accepts options for the Got HTTP client. `headers` and `searchParams` are extracted and merged into the live client state. The cookie jar is managed by the connector. `wsClientOptions` uses the separate `ws` options shape.

Configure a Got `agent` object for HTTP/HTTPS proxying and a suitable `agent` for `ws` when proxying socket traffic. An HTTP proxy setting does not automatically configure the WebSocket or the provider SDK. Configure your explicit `eulerApiInstance` separately if provider traffic also needs a proxy.

Use the documentation for your chosen proxy agent to construct it; proxy libraries differ in HTTP, HTTPS, and SOCKS support. Test the three network paths separately: TikTok HTTP, provider requests, and TikTok WebSocket.

The constructor currently drops `webClientOptions.timeout`; see [environment variables](/configuration/environment/) for the supported default timeout in this checkout.

## Cookie jar

The managed cookie jar exposes:

| Member | Behavior |
| --- | --- |
| `store` | Record of cookie name to value. |
| `store[name]` | Read or assign a single cookie value directly. |
| `getCookieString(url?)` | Serialize stored cookies; the URL argument is ignored. |
| `getAnonymousCookieString()` | Serialize stored cookies except configured session-cookie names and the target-IDC cookie. Used for sockets without `authenticateWs`. |
| `setCookie(rawCookie, url?)` | Parse one Set-Cookie-style string; the URL argument is ignored. |
| `processSetCookieHeader(value)` | Process a string header. Non-string inputs are currently ignored. |
| `getSessionBundle()` | Return a cookie-session bundle when both required cookie values exist, otherwise `null`. |
| `setSessionBundle(bundle)` | Populate session and target-IDC cookies. |

The jar deliberately sends its stored cookies together rather than enforcing browser path/domain rules. Keep it scoped to the intended TikTok session. If cookies are returned as an array, the current `processSetCookieHeader()` implementation does not iterate that array.

The class is the default export of its source module, rather than a named package-root constructor. Use the managed `connection.webClient.cookieJar`; avoid importing unexported internal file paths.

## Provider access

`webClient.apiClient` and `connection.apiClient` refer to the same SDK instance. Provider SDK features beyond the connector's route registry are documented by [Euler Stream](https://www.eulerstream.com/docs). A route appearing in that SDK does not imply it is free, authenticated, or supported by the connector's own helpers.
