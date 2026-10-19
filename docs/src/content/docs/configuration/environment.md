---
title: Environment variables
description: All environment variables read by the connector source.
sidebar:
  order: 4
---

Set these in your process environment before importing or constructing the client. The connector does not automatically load a `.env` file. Node's `--env-file` option or your process manager can load one.

| Variable | Default | Effect |
| --- | --- | --- |
| `SIGN_API_KEY` | Unset | Initializes `SignConfig.apiKey` at module load. |
| `SIGN_API_URL` | `https://api.eulerstream.com` | Initializes `SignConfig.basePath` at module load. |
| `TIKTOK_CLIENT_TIMEOUT` | `10000` | Default HTTP request timeout in milliseconds, parsed when a `WebcastHttpClient` is constructed. See the timeout limitation below. |
| `WS_CONNECT_TIMEOUT_MS` | `20000` | High-level wait for the WebSocket to open, in milliseconds. |
| `WS_DISCONNECT_TIMEOUT_MS` | `2000` | Time before a closing socket is forcefully terminated, in milliseconds. |
| `WHITELIST_AUTHENTICATED_SESSION_ID_HOST` | Unset | Exact allowed signing-provider host for authenticated signing requests. See [authentication](/configuration/authentication/). |
| `SIGN_SERVER_MESSAGE_DISABLED` | Unset | Any nonempty value suppresses the provider's extra message for handled 429 responses. See the 402 formatting limitation below. |
| `DISABLE_ACK_LOG_WARNING` | Unset | Any nonempty value suppresses the warning for an acknowledgement skipped because `internalExt` is missing. |
| `DEBUG_DESERIALIZE_XD` | Unset | Any nonempty value logs unknown message names and their Base64 payloads. These can contain personal data. |
| `RANDOMIZE_TIKTOK_DEVICE` | Disabled | Set to `true` (case-insensitive) to randomize the device preset. |
| `RANDOMIZE_TIKTOK_LOCATION` | Disabled | Set to `true` (case-insensitive) to randomize location. |
| `RANDOMIZE_TIKTOK_SCREEN` | Disabled | Set to `true` (case-insensitive) to randomize screen size. |

For the nonempty-value switches, the string `false` still enables the switch. Unset the variable to disable it. Supply positive integer strings for timeout values.

## HTTP timeout limitation

The current HTTP constructor removes `webClientOptions.timeout` while separating transport options, but does not apply the removed value. Use `TIKTOK_CLIENT_TIMEOUT` for its default request timeout in this checkout, or per-request options on direct HTTP calls. A later release may change this behavior.

## Provider-message suppression

The signing handler also sets the extra message to `null` for a 402 response when `SIGN_SERVER_MESSAGE_DISABLED` is enabled. The current `PremiumFeatureError` formatter expects a string, so that path can raise a formatting error instead of the intended typed error. Leave the switch unset when diagnosing a 402 response.

## Application variables

Names such as `TIKTOK_SESSION_ID` and `TIKTOK_TARGET_IDC` in the examples are values that your application reads and passes into options. They are not additional built-in connector configuration.
