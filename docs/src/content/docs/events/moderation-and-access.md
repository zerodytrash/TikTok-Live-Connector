---
title: Moderation and access
description: Moderation and access events, payloads, and dispatch behavior.
---

These are received notifications. Subscribing to them does not grant moderation permissions or perform the corresponding action. Verify action values for your intended room and protocol version.

Each entry below lists the listener alias and payload type. Field lists are selected schema fields, not guarantees that every nested value will be populated. The [protobuf reference](/schema/) contains the full message definitions.

Replace `creator_username` with a live creator. Each example registers its listener before connecting.

## Im delete

**Subscribe:** `WebcastEvent.IM_DELETE` or `"imDelete"`

**Payload:** `WebcastImDeleteMessage`

A message-deletion payload. Use its message identifiers to update your application's stored/displayed chat.

Schema fields include `deleteMsgIds`, `deleteUserIds`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.IM_DELETE, (event) => {
    console.log('Deleted message IDs:', event.deleteMsgIds);
    console.log('Deleted user IDs:', event.deleteUserIds);
});
await connection.connect();
```

## Unauthorized member

**Subscribe:** `WebcastEvent.UNAUTHORIZED_MEMBER` or `"unauthorizedMember"`

**Payload:** `WebcastUnauthorizedMemberMessage`

An unauthorized-member payload. The client forwards it without an application-level access decision.

Schema fields include `action`, `nickNamePrefix`, `nickName`, `enterText`, `publicAreaCommon`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.UNAUTHORIZED_MEMBER, (event) => {
    console.log({ action: event.action, nickname: event.nickName, text: event.enterText?.defaultPattern });
});
await connection.connect();
```

## Msg detect

**Subscribe:** `WebcastEvent.MSG_DETECT` or `"msgDetect"`

**Payload:** `WebcastMsgDetectMessage`

A message-detection payload. Its presence alone should not be treated as proof of a moderation outcome.

Schema fields include `dType`, `tCondition`, `tInfo`, `triggerBy`, `fromRegion`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.MSG_DETECT, (event) => {
    console.log({
        detectType: event.dType,
        triggerBy: event.triggerBy,
        websocketDetection: event.tCondition?.uplinkDetectWebsocket,
        apiReceivedAt: event.tInfo?.apiRecvTimeMs,
    });
});
await connection.connect();
```

## Room verify

**Subscribe:** `WebcastEvent.ROOM_VERIFY` or `"roomVerify"`

**Payload:** `WebcastRoomVerifyMessage`

A room verification/control payload containing fields such as `action`, `content`, and `closeRoom`.

Schema fields include `action`, `content`, `noticeType`, `closeRoom`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.ROOM_VERIFY, (event) => {
    console.log({ noticeType: event.noticeType, action: event.action, closeRoom: event.closeRoom, content: event.content });
});
await connection.connect();
```

## Access control

**Subscribe:** `WebcastEvent.ACCESS_CONTROL` or `"accessControl"`

**Payload:** `WebcastAccessControlMessage`

An access-control payload. Interpret its subtype and nested content before deciding whether user action is required.

Schema fields include `captcha`.

## Access recall

**Subscribe:** `WebcastEvent.ACCESS_RECALL` or `"accessRecall"`

**Payload:** `WebcastAccessRecallMessage`

An access-recall payload. The connector does not maintain a permission state machine from these messages.

Schema fields include `status`, `duration`, `endTime`, `scene`, `notice`, `content`, `punishInfo`.

## Perception

**Subscribe:** `WebcastEvent.PERCEPTION` or `"perception"`

**Payload:** `WebcastPerceptionMessage`

A perception/dialog payload. These can carry policy or restriction-related text; preserve the actual type and content.

Schema fields include `dialog`, `punishInfo`, `endTime`, `showViolationWarning`, `toast`, `floatStyle`, `floatText`, `sheet`.
