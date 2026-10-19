---
title: Chat and audience
description: Chat and audience events, payloads, and dispatch behavior.
---

Chat, membership, reactions, and social activity. The regular user message has `id`, `displayId`, and `nickname`; these fields remain nested under `user`.

Each entry below lists the listener alias and payload type. Field lists are selected schema fields, not guarantees that every nested value will be populated. The [protobuf reference](/schema/) contains the full message definitions.

Replace `creator_username` with a live creator. Each example registers its listener before connecting.

## Chat

**Subscribe:** `WebcastEvent.CHAT` or `"chat"`

**Payload:** `WebcastChatMessage`

A chat comment. Read `content` for its text; emotes and mentions have their own fields.

Schema fields include `user`, `content`, `visibleToSender`, `backgroundImage`, `fullScreenTextColor`, `backgroundImageV2`, `publicAreaCommon`, `giftImage`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.CHAT, (event) => {
    console.log(`${event.user?.displayId ?? 'unknown'}: ${event.content}`);
});
await connection.connect();
```

## Member

**Subscribe:** `WebcastEvent.MEMBER` or `"member"`

**Payload:** `WebcastMemberMessage`

A member/join notification. A series of join messages is not an exact current viewer count.

Schema fields include `user`, `memberCount`, `operator`, `isSetToAdmin`, `isTopUser`, `rankScore`, `topUserNo`, `enterType`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.MEMBER, (event) => {
    console.log({ username: event.user?.displayId, nickname: event.user?.nickname, memberCount: event.memberCount });
});
await connection.connect();
```

## Room user

**Subscribe:** `WebcastEvent.ROOM_USER` or `"roomUser"`

**Payload:** `WebcastRoomUserSeqMessage`

An audience and contributor snapshot. Read `total`, `totalUser`, `ranks`, and `seats` according to the measurement your application needs.

Schema fields include `ranks`, `total`, `popStr`, `seats`, `popularity`, `totalUser`, `anonymous`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.ROOM_USER, (event) => {
    console.log('Current viewers:', event.total);
    const topContributor = event.ranks[0];
    if (topContributor) {
        console.log('Top contributor:', topContributor.user?.displayId, topContributor.score);
    }
});
await connection.connect();
```

## Like

**Subscribe:** `WebcastEvent.LIKE` or `"like"`

**Payload:** `WebcastLikeMessage`

A like update, with a per-update `count` and a `total`. Likes do not count unique viewers.

Schema fields include `count`, `total`, `color`, `user`, `icon`, `icons`, `specifiedDisplayText`, `effectCnt`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.LIKE, (event) => {
    console.log({ username: event.user?.displayId, count: event.count, total: event.total });
});
await connection.connect();
```

## Social

**Subscribe:** `WebcastEvent.SOCIAL` or `"social"`

**Payload:** `WebcastSocialMessage`

A social message that was not recognized as a follow or share by the modern dispatcher.

Schema fields include `user`, `shareType`, `action`, `shareTarget`, `followCount`, `shareDisplayStyle`, `shareCount`, `publicAreaMessageCommon`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.SOCIAL, (event) => {
    console.log({
        username: event.user?.displayId,
        action: event.action,
        shareType: event.shareType,
        shareTarget: event.shareTarget,
    });
});
await connection.connect();
```

## Follow

**Subscribe:** `WebcastEvent.FOLLOW` or `"follow"`

**Payload:** `WebcastSocialMessage`

A social message whose `common.displayText.key` contains `follow`. The dispatcher emits FOLLOW instead of SOCIAL for that message.

Schema fields include `user`, `shareType`, `action`, `shareTarget`, `followCount`, `shareDisplayStyle`, `shareCount`, `publicAreaMessageCommon`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.FOLLOW, (event) => {
    console.log(`${event.user?.displayId ?? event.user?.nickname ?? 'unknown'} followed`);
});
await connection.connect();
```

## Share

**Subscribe:** `WebcastEvent.SHARE` or `"share"`

**Payload:** `WebcastSocialMessage`

A social message whose `common.displayText.key` contains `share`. The dispatcher emits SHARE instead of SOCIAL for that message.

Schema fields include `user`, `shareType`, `action`, `shareTarget`, `followCount`, `shareDisplayStyle`, `shareCount`, `publicAreaMessageCommon`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.SHARE, (event) => {
    console.log(`${event.user?.displayId ?? event.user?.nickname ?? 'unknown'} shared the stream`);
});
await connection.connect();
```

## Question new

**Subscribe:** `WebcastEvent.QUESTION_NEW` or `"questionNew"`

**Payload:** `WebcastQuestionNewMessage`

A question submitted through TikTok's question feature. It is separate from ordinary chat.

Schema fields include `data`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.QUESTION_NEW, (event) => {
    const question = event.data;
    if (question) console.log(question.user?.displayId, question.content);
});
await connection.connect();
```

## Emote

**Subscribe:** `WebcastEvent.EMOTE` or `"emote"`

**Payload:** `WebcastEmoteChatMessage`

An emote-chat message. Read the `emoteList` entries rather than assuming there is plain chat text.

Schema fields include `user`, `emoteList`, `msgFilter`, `userIdentity`.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.EMOTE, (event) => {
    console.log('Emotes from:', event.user?.displayId);
    for (const emote of event.emoteList) console.log(emote.emoteId);
});
await connection.connect();
```
