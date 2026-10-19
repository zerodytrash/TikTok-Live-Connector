---
title: Room messages and display
description: Room messages and display events, payloads, and dispatch behavior.
---

These events carry room announcements, captions, prompts, and other presentation data. Most are passed through directly. Decode structured Text messages according to their schema rather than treating every nested field as plain text.

Each entry below lists the listener alias and payload type. Field lists are selected schema fields, not guarantees that every nested value will be populated. The [protobuf reference](/schema/) contains the full message definitions.

Replace `creator_username` with a live creator. Each example registers its listener before connecting.

## Live intro

**Subscribe:** `WebcastEvent.LIVE_INTRO` or `"liveIntro"`

**Payload:** `WebcastLiveIntroMessage`

An introduction message for the livestream. It can arrive during a session rather than only at connection time.

Schema fields include `id`, `auditStatus`, `content`, `user`, `introMode`, `badges`, `contentLanguage`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.LIVE_INTRO, (event) => {
    console.log({ username: event.user?.displayId, nickname: event.user?.nickname, content: event.content });
});
await connection.connect();
```

## Barrage

**Subscribe:** `WebcastEvent.BARRAGE` or `"barrage"`

**Payload:** `WebcastBarrageMessage`

A barrage display message. Recognized super-fan variants also emit a derived super-fan event.

Schema fields include `event`, `msgType`, `icon`, `content`, `duration`, `background`, `rightIcon`, `displayConfig`.

## System

**Subscribe:** `WebcastEvent.SYSTEM` or `"system"`

**Payload:** `WebcastSystemMessage`

A Webcast system message. It is not the connector's own ERROR event.

Schema fields include `message`.

## Room message

**Subscribe:** `WebcastEvent.ROOM_MESSAGE` or `"roomMessage"`

**Payload:** `WebcastRoomMessage`

A room-level message or announcement. Read its payload before choosing how to display it.

Schema fields include `content`, `supprotLandscape`, `source`, `icon`, `scene`, `isWelcome`, `publicAreaCommon`, `showDurationMs`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.ROOM_MESSAGE, (event) => {
    console.log({ content: event.content, source: event.source, scene: event.scene });
});
await connection.connect();
```

## Caption message

**Subscribe:** `WebcastEvent.CAPTION_MESSAGE` or `"captionMessage"`

**Payload:** `WebcastCaptionMessage`

A caption payload. Inspect its timing and caption structure rather than assuming each message is a final transcript segment.

Schema fields include `timestampMs`, `durationMs`, `content`, `sentenceId`, `sequenceId`, `definite`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.CAPTION_MESSAGE, (event) => {
    for (const caption of event.content) {
        console.log(event.timestampMs, caption.lang, caption.content, 'final:', event.definite);
    }
});
await connection.connect();
```

## In room banner

**Subscribe:** `WebcastEvent.IN_ROOM_BANNER` or `"inRoomBanner"`

**Payload:** `WebcastInRoomBannerMessage`

An in-room banner payload. Display content may be structured or reference a resource.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.IN_ROOM_BANNER, (event) => {
    console.log('Banner message metadata:', event.common);
});
await connection.connect();
```

The installed v3 schema exposes only `common` here; older examples reading `jsonData` do not match this payload.

## Poll message

**Subscribe:** `WebcastEvent.POLL_MESSAGE` or `"pollMessage"`

**Payload:** `WebcastPollMessage`

A poll payload. The connector does not maintain poll totals or interpret every poll action for you.

Schema fields include `messageType`, `pollId`, `startContent`, `endContent`, `updateVotesContent`, `pollKind`, `pollBasicInfo`, `templateContent`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.POLL_MESSAGE, (event) => {
    console.log('Poll:', event.pollBasicInfo?.title);
    console.log('Time remaining:', event.pollBasicInfo?.timeRemain);
});
await connection.connect();
```

## Room pin

**Subscribe:** `WebcastEvent.ROOM_PIN` or `"roomPin"`

**Payload:** `WebcastRoomPinMessage`

A room pin action. Inspect its `action`, target message, and display-duration fields.

Schema fields include `chatMessage`, `socialMessage`, `giftMessage`, `memberMessage`, `likeMessage`, `method`, `pinTime`, `operator`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.ROOM_PIN, (event) => {
    console.log('Pinned by:', event.operator?.displayId, event.operator?.nickname);
    console.log('Pin method:', event.method);
    console.log({
        chat: event.chatMessage?.content,
        gift: event.giftMessage?.gift?.name,
        socialAction: event.socialMessage?.action,
        member: event.memberMessage?.user?.displayId,
        likes: event.likeMessage?.count,
    });
});
await connection.connect();
```

## Bottom message

**Subscribe:** `WebcastEvent.BOTTOM_MESSAGE` or `"bottomMessage"`

**Payload:** `WebcastBottomMessage`

A bottom-of-screen message payload. The display location alone does not establish its business meaning.

Schema fields include `content`, `showType`, `textType`, `duration`, `bizType`, `violationUserId`, `punishInfo`, `style`.

## Capsule

**Subscribe:** `WebcastEvent.CAPSULE` or `"capsule"`

**Payload:** `WebcastCapsuleMessage`

A capsule/pill UI payload. Its schema defines the available data; detailed live behavior is not normalized by this client.

Schema fields include `icon`, `desc`, `buttonText`, `schema`, `type`, `scene`, `bizParams`, `subScene`.

## Guide

**Subscribe:** `WebcastEvent.GUIDE` or `"guide"`

**Payload:** `WebcastGuideMessage`

An in-room guide or prompt payload. Do not interpret receiving it as the user completing the guided action.

Schema fields include `guideType`, `giftId`, `description`, `duration`, `displayStyle`, `scene`, `frequencyRule`.

## Marquee announcement

**Subscribe:** `WebcastEvent.MARQUEE_ANNOUNCEMENT` or `"marqueeAnnouncement"`

**Payload:** `WebcastMarqueeAnnouncementMessage`

A marquee announcement payload. Read its structured content and display settings.

Schema fields include `messageScene`, `messageEntity`.

## Notice

**Subscribe:** `WebcastEvent.NOTICE` or `"notice"`

**Payload:** `WebcastNoticeMessage`

A notice payload. Check the applicable subtype and content before mapping it to an application action.

Schema fields include `content`, `noticeType`, `style`, `title`, `violationReason`, `displayText`, `tipsTitle`, `tipsUrl`.

## Room notify

**Subscribe:** `WebcastEvent.ROOM_NOTIFY` or `"roomNotify"`

**Payload:** `WebcastRoomNotifyMessage`

A room notification payload. It is separate from ROOM_MESSAGE and SYSTEM.

Schema fields include `schema`, `notifyType`, `content`, `user`, `extra`, `notifyClass`, `flexSetting`, `source`.

## Toast

**Subscribe:** `WebcastEvent.TOAST` or `"toast"`

**Payload:** `WebcastToastMessage`

A transient toast payload. A toast message is not a durable application event by itself.

Schema fields include `displayDurationMillisecond`, `delayDisplayDurationMillisecond`, `scene`.

## Viewer picks update

**Subscribe:** `WebcastEvent.VIEWER_PICKS_UPDATE` or `"viewerPicksUpdate"`

**Payload:** `WebcastViewerPicksUpdateMessage`

A viewer-picks update payload. No high-level viewer-picks state model is maintained by the connector.

Schema fields include `updateType`, `info`.
