---
title: Stream control
description: Stream control events, payloads, and dispatch behavior.
---

Stream control is delivered through both its original protocol event and, for selected actions, the derived STREAM_END event.

Each entry below lists the listener alias and payload type. Field lists are selected schema fields, not guarantees that every nested value will be populated. The [protobuf reference](/schema/) contains the full message definitions.

Replace `creator_username` with a live creator. Each example registers its listener before connecting.

## Control message

**Subscribe:** `WebcastEvent.CONTROL_MESSAGE` or `"controlMessage"`

**Payload:** `WebcastControlMessage`

The original WebcastControlMessage. It is emitted before the client processes ended or suspended actions.

Schema fields include `action`, `tips`, `extra`, `perceptionDialog`, `perceptionAudienceText`, `punishInfo`, `floatText`, `floatStyle`.

## Stream end

**Subscribe:** `WebcastEvent.STREAM_END` or `"streamEnd"`

**Payload:** `{ action: ControlAction }`

Derived when the control action is CONTROL_ACTION_STREAM_ENDED or CONTROL_ACTION_STREAM_SUSPENDED. Its payload contains only `action`; the client then calls disconnect().

```ts
import { ControlAction, TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.STREAM_END, (event) => {
    if (event.action === ControlAction.CONTROL_ACTION_STREAM_ENDED) {
        console.log('Stream ended');
    } else if (event.action === ControlAction.CONTROL_ACTION_STREAM_SUSPENDED) {
        console.log('Stream suspended');
    }
});
await connection.connect();
```
