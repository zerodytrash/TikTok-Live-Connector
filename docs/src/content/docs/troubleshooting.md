---
title: Troubleshooting
description: Diagnose connection failures, signing errors, missing events, and schema problems.
---

Start with the smallest [Getting Started](/) example, the exact installed package version, the failing operation, and the original exception. Separate TikTok HTTP requests, provider requests, and the final WebSocket connection: succeeding at one does not establish that all three work.

## Connection errors

| Error | Meaning and next check |
| --- | --- |
| `InvalidUniqueIdError` | A non-string username input. Use the supported string forms; normalization does not validate that the account exists. |
| `AlreadyConnectingError` | A second connection attempt is already running. Use one connection loop per instance. |
| `AlreadyConnectedError` | The client is already connected. Disconnect first or use another instance. |
| `UserOfflineError` | The pre-connect room response reported status `4`. Check the creator's live status and room ID. |
| `ConnectTimeoutError` | The socket did not open within `WS_CONNECT_TIMEOUT_MS`. Check the signing result, network, proxy, and socket endpoint before increasing the timeout. |

## HTTP and signing errors

| Error | Meaning and next check |
| --- | --- |
| `InvalidRequestError` | Required route input is missing or invalid, often a room ID. Read `config.routeId`. |
| `InvalidResponseError` | A route rejected an upstream response. Inspect the route ID and any original request error. |
| `InvalidResponseCompositeError` | All enabled lookup sources failed. Inspect every entry in `config.requestErrs`. |
| `SignAPIError` | Signing failure with a `reason`, and sometimes `requestId` / `agentId`. Retain these IDs for a provider support request. |
| `SignatureRateLimitError` | Signing was rate-limited. `retryAfter` is already milliseconds; `resetTime`, if present, is a Unix timestamp in milliseconds. Coordinate retries across all rooms. |
| `SignatureMissingTokensError` | HTTP URL signing returned no usable token bundle or a failing response. It does not by itself establish a particular account-plan requirement. |
| `PremiumFeatureError` | The provider rejected a protected operation. Check credentials and the specific endpoint's current permissions. |
| `AuthenticatedWebSocketConnectionError` | Authenticated signing failed a host-allowlist or cookie check. Review [authentication](/configuration/authentication/). |

`ErrorReason` contains `RATE_LIMIT`, `CONNECT_ERROR`, `EMPTY_PAYLOAD`, `SIGN_NOT_200`, `EMPTY_COOKIES`, `PREMIUM_FEATURE`, and `AUTHENTICATED_WS`. These classify signing errors; they do not all refer to the same HTTP stage. `TikTokLiveError` is the base class for signing errors; other exported errors also extend standard `Error` hierarchies.

## “Unexpected server response: 200”

The WebSocket handshake expects an HTTP upgrade, normally status 101. Receiving 200 means that request returned an ordinary HTTP response instead. It does not mean the socket successfully connected.

Record which host returned it, the installed package version, the stage that failed, and whether it happens without a proxy. Check that the room is live and the signed socket details are current. Upstream endpoint changes, an unsuitable response, or a proxy can require different fixes; do not assume every occurrence has the same cause or proves a provider outage.

Do not post signed URLs, cookies, API keys, or unredacted response bodies in a public report.

## Connected, but no expected events

1. Register listeners before `connect()` and confirm whether you want `processInitialData` enabled.
2. Use the modern client. The deprecated adapter has a smaller named-event dispatcher.
3. Check the event's actual payload and discriminator. Power-Up awards and uses share one event; recognized follows/shares use their derived events.
4. Check global `WebcastDeserializeConfig` filters. They operate on protobuf method names and also suppress derived events.
5. Inspect WEBSOCKET_DATA for incoming frames and DECODED_DATA for successfully decoded nested messages. The modern dispatcher does not currently emit RAW_DATA.
6. Confirm that the room actually produces the feature. A schema definition is not a promise of delivery in every room or region.

## Decode errors

`InvalidSchemaNameError` identifies an unavailable codec. `SchemaDecodeError` identifies a failure in a known codec. A nested decode failure is stored as `decodeError` on its message; a container-level failure goes through the socket's `messageDecodingFailed` path.

The high-level client skips messages without `decodedData`. A nested decode error therefore does not necessarily become a high-level ERROR notification. Capture the decoded batch through the low-level socket when diagnosing that case.

## Common configuration surprises

- `SignConfig` is cached on first provider-client creation. A later API-key assignment does not update existing clients.
- `webClientOptions.timeout` is currently dropped; use the documented environment setting or a direct per-request override.
- Authenticated sockets require `authenticateWs: true`, a cookie session, and provider host allowlisting. Mobile mode does not enable that flag automatically.
- `fetchAvailableGifts()` returns data but does not populate the high-level gift cache by itself.
- Overriding a base registry handler does not replace imported source calls inside the composite lookup functions.

These describe the checked-in code. Recheck the implementation when comparing a newer release.

## Report a reproducible issue

Include package and Node.js versions, the relevant options with secrets removed, a minimal example, the exact exception and route ID, and whether the failure occurs on HTTP, signing, socket upgrade, or message decoding. For payload issues, provide a sanitized fixture with the method and schema version. File reports on the project's [GitHub issues](https://github.com/zerodytrash/TikTok-Live-Connector/issues).
