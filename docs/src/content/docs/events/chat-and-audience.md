---
title: Chat and audience
description: Chat and audience events, payloads, and dispatch behavior.
---

Chat, membership, reactions, and social activity. The regular user message has `id`, `displayId`, and `nickname`; these fields remain nested under `user`.

Each entry below lists the listener alias and payload type. Field lists are selected schema fields, not guarantees that every nested value will be populated. The [protobuf reference](/schema/) contains the full message definitions.

## Chat

**Subscribe:** `WebcastEvent.CHAT` or `"chat"`

**Payload:** `WebcastChatMessage`

A chat comment. Read `content` for its text; emotes and mentions have their own fields.

Schema fields include `user`, `content`, `visibleToSender`, `backgroundImage`, `fullScreenTextColor`, `backgroundImageV2`, `publicAreaCommon`, `giftImage`.

## Member

**Subscribe:** `WebcastEvent.MEMBER` or `"member"`

**Payload:** `WebcastMemberMessage`

A member/join notification. A series of join messages is not an exact current viewer count.

Schema fields include `user`, `memberCount`, `operator`, `isSetToAdmin`, `isTopUser`, `rankScore`, `topUserNo`, `enterType`.

## Room user

**Subscribe:** `WebcastEvent.ROOM_USER` or `"roomUser"`

**Payload:** `WebcastRoomUserSeqMessage`

An audience and contributor snapshot. Read `total`, `totalUser`, `ranks`, and `seats` according to the measurement your application needs.

Schema fields include `ranks`, `total`, `popStr`, `seats`, `popularity`, `totalUser`, `anonymous`.

## Like

**Subscribe:** `WebcastEvent.LIKE` or `"like"`

**Payload:** `WebcastLikeMessage`

A like update, with a per-update `count` and a `total`. Likes do not count unique viewers.

Schema fields include `count`, `total`, `color`, `user`, `icon`, `icons`, `specifiedDisplayText`, `effectCnt`.

## Social

**Subscribe:** `WebcastEvent.SOCIAL` or `"social"`

**Payload:** `WebcastSocialMessage`

A social message that was not recognized as a follow or share by the modern dispatcher.

Schema fields include `user`, `shareType`, `action`, `shareTarget`, `followCount`, `shareDisplayStyle`, `shareCount`, `publicAreaMessageCommon`.

## Follow

**Subscribe:** `WebcastEvent.FOLLOW` or `"follow"`

**Payload:** `WebcastSocialMessage`

A social message whose `common.displayText.key` contains `follow`. The dispatcher emits FOLLOW instead of SOCIAL for that message.

Schema fields include `user`, `shareType`, `action`, `shareTarget`, `followCount`, `shareDisplayStyle`, `shareCount`, `publicAreaMessageCommon`.

## Share

**Subscribe:** `WebcastEvent.SHARE` or `"share"`

**Payload:** `WebcastSocialMessage`

A social message whose `common.displayText.key` contains `share`. The dispatcher emits SHARE instead of SOCIAL for that message.

Schema fields include `user`, `shareType`, `action`, `shareTarget`, `followCount`, `shareDisplayStyle`, `shareCount`, `publicAreaMessageCommon`.

## Question new

**Subscribe:** `WebcastEvent.QUESTION_NEW` or `"questionNew"`

**Payload:** `WebcastQuestionNewMessage`

A question submitted through TikTok's question feature. It is separate from ordinary chat.

Schema fields include `data`.

## Emote

**Subscribe:** `WebcastEvent.EMOTE` or `"emote"`

**Payload:** `WebcastEmoteChatMessage`

An emote-chat message. Read the `emoteList` entries rather than assuming there is plain chat text.

Schema fields include `user`, `emoteList`, `msgFilter`, `userIdentity`.
