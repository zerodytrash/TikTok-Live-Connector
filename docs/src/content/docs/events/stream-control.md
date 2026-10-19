---
title: Stream control
description: Stream control events, payloads, and dispatch behavior.
---

Stream control is delivered through both its original protocol event and, for selected actions, the derived STREAM_END event.

Each entry below lists the listener alias and payload type. Field lists are selected schema fields, not guarantees that every nested value will be populated. The [protobuf reference](/schema/) contains the full message definitions.

## Control message

**Subscribe:** `WebcastEvent.CONTROL_MESSAGE` or `"controlMessage"`

**Payload:** `WebcastControlMessage`

The original WebcastControlMessage. It is emitted before the client processes ended or suspended actions.

Schema fields include `action`, `tips`, `extra`, `perceptionDialog`, `perceptionAudienceText`, `punishInfo`, `floatText`, `floatStyle`.

## Stream end

**Subscribe:** `WebcastEvent.STREAM_END` or `"streamEnd"`

**Payload:** `{ action: ControlAction }`

Derived when the control action is CONTROL_ACTION_STREAM_ENDED or CONTROL_ACTION_STREAM_SUSPENDED. Its payload contains only `action`; the client then calls disconnect().
