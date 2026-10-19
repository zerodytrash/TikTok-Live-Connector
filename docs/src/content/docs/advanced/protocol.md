---
title: Protobuf and decoding
description: Generated message types, decode filters, raw frames, and unknown messages.
---

The connector uses `tiktok-live-proto/v3` and re-exports its types, enums, and codecs from the package root. The [protobuf schema reference](/schema/) is generated from the dependency installed with this checkout. The connector [API reference](/api/) covers its own clients, options, routes, and helpers.

## Decode a message

`deserializeMessage(protoName, buffer)` decodes with the named codec and returns its typed message. An unknown name throws `InvalidSchemaNameError`; a codec failure throws `SchemaDecodeError`.

```ts
import { deserializeMessage, WebcastChatMessage } from 'tiktok-live-connector';

// An empty encoded message is useful for inspecting decoder defaults offline.
const bytes = WebcastChatMessage.encode(WebcastChatMessage.decode(Buffer.alloc(0))).finish();
const event = deserializeMessage('WebcastChatMessage', Buffer.from(bytes));
console.log(event.content, event.user);
```

`deserializeWebSocketMessage(bytes)` decodes a `WebcastPushFrame`. For protobuf payloads it detects a gzip header, decompresses when necessary, and decodes the `ProtoMessageFetchResult` batch.

Each nested `BaseProtoMessage` may gain `decodedData: { type, data }` or `decodeError`. Unknown message names and filtered messages remain in the batch without a decoded payload. The high-level client emits named events only for successfully decoded messages it knows how to dispatch.

## Filter before decoding

`WebcastDeserializeConfig` is global. Its filters use **protobuf message names**, not enum keys or listener strings:

```ts
import { WebcastDeserializeConfig } from 'tiktok-live-connector';

WebcastDeserializeConfig.includeMessageTypes = [
    'WebcastChatMessage',
    'WebcastGiftMessage',
    'WebcastLinkMicBattleItemCard',
];
WebcastDeserializeConfig.showBase64OnDecodeError = false;
```

- `includeMessageTypes: null` enables the `skipMessageTypes` blocklist.
- A non-null include list takes precedence over the skip list.
- An empty include list skips every nested message.
- `showBase64OnDecodeError` defaults to `true` and appends the original payload to codec errors.

Filtering out a message also filters derived events. For example, skipping `WebcastSocialMessage` prevents `FOLLOW` and `SHARE`; skipping `WebcastControlMessage` also removes the high-level `STREAM_END` handling for those messages.

## Inspect frames

Use `ControlEvent.WEBSOCKET_DATA` for socket bytes. `ControlEvent.DECODED_DATA` provides a method name, the **decoded wrapper** `{ type, data }`, and the original nested payload bytes. The declared `RAW_DATA` event is not emitted by the modern dispatcher in this checkout; see [control events](/events/control/).

`createBaseWebcastPushFrame(overrides)` creates a `BinaryWriter`; call `.finish()` to get bytes. The default encoding is `pb`, the payload type is `msg`, and string-encoded numeric fields use `"0"` unless overridden. `generateUniqId()` makes a random decimal identifier for room-entry packets; it is not a durable application ID or cryptographic credential.

## Schema support and verified behavior

`WebcastMessage` describes codec-backed messages. `WebcastEventMessage` narrows the top-level message set. `BasicWebcastEventMessage`, `DecodedData`, `DecodedWebcastPushFrame`, and `WebcastEventMap` describe dispatch and decoded containers.

A field in the schema proves that the codec can represent it. It does not prove every live room emits it, or establish the meaning of an undocumented action number. Preserve unknown values and mark unverified mappings in your application. Keep 64-bit integer strings intact; do not coerce IDs through `Number`.

For a protocol report, retain the message method, package and schema versions, and a minimal decoded example or sanitized binary fixture. Base64 is an encoding, not anonymization: payloads can still contain usernames, IDs, cookies, or other private data.
