# TikTok-Live-Connector

A Node.js library to receive live stream events such as comments and gifts in realtime
from [TikTok LIVE](https://www.tiktok.com/live) by connecting to TikTok's internal Webcast push service.
This package includes a wrapper that connects to the Webcast service using just the username (`@uniqueId`).
This allows you to connect to your own live chat as well as the live chat of other streamers. No credentials are
required. Besides [Chat Comments](#chat), other events such
as [Members Joining](#member), [Gifts](#gift), [Subscriptions](#subscribe), [Viewers](#roomuser), [Follows](#social), [Shares](#social), [Questions](#questionnew), [Likes](#like)
and [Battles](#linkmicbattle) can be tracked.

[![Discord](https://img.shields.io/discord/977648006063091742?logo=discord&label=TikTokLive%20Discord&labelColor=%23171717&color=%231877af)](https://discord.gg/N3KSxzvDX8)
![Connections](https://tiktok.eulerstream.com/analytics/pips?client=ttlive-node)
![Downloads](https://img.shields.io/npm/dw/tiktok-live-connector?style=flat&color=0274b5&alt=1)
![Stars](https://img.shields.io/github/stars/zerodytrash/tiktok-live-connector?style=flat&color=0274b5&alt=1)
![Issues](https://img.shields.io/github/issues/zerodytrash/tiktok-live-connector?style=flat&color=0274b5&alt=1)
![Forks](https://img.shields.io/github/forks/zerodytrash/tiktok-live-connector?style=flat&color=0274b5&alt=1)

> [!NOTE]
> This is <strong>not</strong> a production-ready API. It is a reverse engineering project. Use the [WebSocket API](https://www.eulerstream.com/websockets) for production.

> [!TIP]
> An example project is available
> at https://tiktok-chat-reader.zerody.one/ - [View Source](https://github.com/zerodytrash/TikTok-Chat-Reader)

### Do you prefer other programming languages?

- **Python** rewrite: [TikTokLive](https://github.com/isaackogan/TikTokLive)
  by [@isaackogan](https://github.com/isaackogan) and [@eulerstream](https://github.com/eulerstream/)
- **Java** rewrite: [TikTokLiveJava](https://github.com/jwdeveloper/TikTokLiveJava)
  by [@jwdeveloper](https://github.com/jwdeveloper) and [@kohlerpop1](https://github.com/kohlerpop1)
- **Go** rewrite: [GoTikTokLive](https://github.com/steampoweredtaco/gotiktoklive)
  by [@steampoweredtaco](https://github.com/steampoweredtaco) and [@davincible](https://github.com/davincible)
- **C#** rewrite: [TikTokLiveSharp](https://github.com/frankvHoof93/TikTokLiveSharp)
  by [@frankvHoof93](https://github.com/frankvHoof93)

### Table of Contents

- [Getting Started](#getting-started)
- [Params and Options](#params-and-options)
- [Methods](#methods)
- [Properties](#properties)
- [Events](#events)
- [Examples](#examples)

## Getting Started

1. Install the package via NPM

```bash
npm i tiktok-live-connector
```

2. Create your first TikTok LIVE chat connection

```ts
// Username of someone who is currently live
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const tiktokUsername = 'officialgeilegisela';

// Create a new wrapper object and pass the username
const connection = new TikTokLiveConnection(tiktokUsername);

// Connect to the chat (await can be used as well)
connection.connect().then(state => {
    console.info(`Connected to roomId ${state.roomId}`);
}).catch(err => {
    console.error('Failed to connect', err);
});

// Define the events that you want to handle
// In this case we listen to chat messages (comments)
connection.on(WebcastEvent.CHAT, data => {
    console.log(`${data.user.uniqueId} (userId:${data.user.uniqueId}) writes: ${data.comment}`);
});

// And here we receive gifts sent to the streamer
connection.on(WebcastEvent.GIFT, data => {
    console.log(`${data.user.uniqueId} (userId:${data.user.userId}) sends ${data.giftId}`);
});

// ...and more events described in the documentation below
```

## Params and Options

To create a new `TikTokLiveConnection` object the following parameters can be specified.

`TikTokLiveConnection(uniqueId, [options])`

| Param Name | Required | Description |
|------------|----------|-------------|
| `uniqueId` | Yes | The unique username of the broadcaster. You can find this name in the URL.<br>Example: `https://www.tiktok.com/@officialgeilegisela/live` becomes `officialgeilegisela`. The leading `@` and the full URL form are also accepted. |
| `options`  | No | Optional connection properties. Defaults are applied when a value is not specified.<br><br>`signApiKey` (default: `undefined`)<br>Euler Stream API key. When provided, it is written to the global `SignConfig.apiKey` before the underlying Euler client is created. Ignored when `eulerApiInstance` is passed.<br><br>`eulerApiInstance` (default: `undefined`)<br>Pre-built `EulerStreamApiClient` to use for all sign-server traffic. Takes precedence over `signApiKey`.<br><br>`session` (default: `undefined`)<br>Authenticated session bundle. Pass `session.cookie` to seed the cookie jar with `sessionid` and `tt-target-idc`, and/or `session.oAuthToken` to send an OAuth token to the sign server. Required when `authenticateWs` or `useMobile` is true. See [Authenticated Connection](#authenticated-connection).<br><br>`authenticateWs` (default: `false`)<br>Forward the session cookies or OAuth token to the sign server so the WebSocket is authenticated. Disabled by default since signing is done by a third-party service; enabling it sends your session credentials to that service.<br><br>`useMobile` (default: `false`)<br>Use the mobile WebSocket flow. Implies `authenticateWs: true` and requires `session.cookie`.<br><br>`processInitialData` (default: `true`)<br>Decode and emit the message batch returned in the initial sign response (recent chat history etc.).<br><br>`fetchRoomInfoOnConnect` (default: `true`)<br>Fetch room info during connect. If the streamer is not currently live the connect rejects with `UserOfflineError`. The fetched info is stored on `connection.roomInfo` and is also accessible via [`fetchRoomInfo()`](#methods).<br><br>`enableExtendedGiftInfo` (default: `false`)<br>Fetch the room gift list during connect so `WebcastGiftMessage` events carry an `extendedGiftInfo` field with name, cost, and image data.<br><br>`clientPresets` (default: randomized)<br>Pre-built `{ device, screen, location }` presets. Defaults to a freshly randomized set from `getRandomPresets()`.<br><br>`webClientOptions` (default: `{}`)<br>Extra options forwarded to the underlying [`got`](https://github.com/sindresorhus/got) HTTP client (proxy agent, timeout, etc.). Headers and search params from this object are merged with the defaults; transport-only fields are passed through. See [Proxied Connection](#proxied-connection).<br><br>`wsClientOptions` (default: `{}`)<br>Extra options forwarded to the underlying [`ws`](https://github.com/websockets/ws) WebSocket client. See [Proxied Connection](#proxied-connection).<br><br>`webConfigOverrides` (default: `{}`)<br>Partial overrides for the resolved `WebcastWebConfigDefaults` used by the HTTP client. Use this to customize `DEFAULT_HTTP_CLIENT_PARAMS`, `DEFAULT_HTTP_CLIENT_HEADERS`, etc.<br><br>`wsConfigOverrides` (default: `{}`)<br>Partial overrides for the resolved `WebcastWebSocketConfigDefaults` used by the WebSocket client. Use this to customize `DEFAULT_WS_CLIENT_PARAMS` or `DEFAULT_WS_CLIENT_HEADERS`. |

#### Example Options

```ts
const tikTokLiveConnection = new TikTokLiveConnection(tiktokUsername, {
    signApiKey: 'your-api-key',
    processInitialData: false,
    enableExtendedGiftInfo: true,
    webConfigOverrides: {
        DEFAULT_HTTP_CLIENT_PARAMS: {
            app_language: 'en-US',
            device_platform: 'web_pc'
        },
        DEFAULT_HTTP_CLIENT_HEADERS: {
            'X-Custom-Header': 'value'
        }
    },
    wsConfigOverrides: {
        DEFAULT_WS_CLIENT_PARAMS: {
            app_language: 'en-US'
        },
        DEFAULT_WS_CLIENT_HEADERS: {
            'X-Custom-Header': 'value'
        }
    },
    webClientOptions: {
        timeout: { request: 10000 }
    },
    wsClientOptions: {
        handshakeTimeout: 10000
    }
});
```

## Methods

| Method Name | Description |
|-------------|-------------|
| `connect([roomId])` | Connects to the live stream chat. Returns a `Promise<TikTokLiveConnectionState>` that resolves when the WebSocket is open and the room has been entered. Pass an explicit `roomId` to skip room-id resolution. |
| `disconnect()` | Closes the WebSocket and waits for the `close` event before resolving. Safe to call even when not connected. |
| `sendMessage(content, [roomId])` | Sends a chat message to the connected room (or to `roomId` if provided). Requires `signApiKey` and an authenticated session. See [Send Messages](#send-messages). |
| `fetchRoomId([uniqueId])` | Resolves the room id for the configured username (or for `uniqueId` if provided). Tries HTML scrape, then the TikTok API, then Euler Stream as a fallback. |
| `fetchIsLive([uniqueId])` | Resolves whether the user is currently live. Same fallback chain as `fetchRoomId`. |
| `waitUntilLive([seconds], [abortSignal])` | Polls `fetchIsLive` every `seconds` seconds (minimum 30) until the streamer goes live. Reject via `abortSignal` to cancel. |
| `fetchRoomInfo([roomId])` | Fetches room info from TikTok's webcast API. Caches the result on `connection.roomInfo`. Callable without an active connection. See [Retrieve Room Info](#retrieve-room-info). |
| `fetchAvailableGifts()` | Fetches the room gift list. Caches on `connection.availableGifts`. Callable without an active connection. See [Retrieve Available Gifts](#retrieve-available-gifts). |

## Properties

| Property Name | Description |
|---------------|-------------|
| `webClient: WebcastHttpClient` | The HTTP client used to talk to TikTok's web and webcast APIs. Holds the cookie jar, the merged client params, and the merged client headers. |
| `apiClient: EulerStreamApiClient` | The Euler Stream API client used for sign-server traffic and other premium endpoints. Equivalent to `webClient.apiClient`. |
| `wsClient: WebcastWebSocketClient \| null` | The active WebSocket client. `null` until the connection is established and after disconnect. |
| `options: TikTokLiveConnectionMutableOptions` | The subset of options retained on the instance (`processInitialData`, `fetchRoomInfoOnConnect`, `enableExtendedGiftInfo`, `authenticateWs`, `useMobile`). |
| `roomInfo: RoomInfo \| null` | The room info object cached from the most recent `fetchRoomInfo()` call (or from connect, when `fetchRoomInfoOnConnect` is true). |
| `availableGifts: RoomGiftInfo \| null` | The cached gift list. Populated when `enableExtendedGiftInfo` is `true` or after manually calling `fetchAvailableGifts()`. |
| `isConnecting: boolean` | True while `connect()` is in flight. |
| `isConnected: boolean` | True after a successful connect, until the WebSocket closes. |
| `clientParams: Record<string, string>` | Live URI parameters sent with every `webClient` request. Mutating this changes outgoing query strings. |
| `roomId: string` | The currently bound room id. Empty string until connect resolves or `fetchRoomId()` is called. |
| `state: TikTokLiveConnectionState` | Snapshot containing `isConnected`, `isConnecting`, `roomId`, `roomInfo`, and `availableGifts`. |

## Signing Configuration

WebSocket URL signing is delegated to the [Euler Stream sign server](https://www.eulerstream.com) via the
[`@eulerstream/euler-api-sdk`](https://github.com/EulerStream/EulerApiSdk) package. Configuration is held on the
mutable `SignConfig` singleton.

For most users, passing `signApiKey` to the `TikTokLiveConnection` constructor is enough. It writes the key to
`SignConfig.apiKey` before the underlying Euler client is built.

For advanced cases (custom sign-server URL, extra headers, JWT auth), mutate `SignConfig` directly before
constructing your first connection:

```ts
import { SignConfig } from 'tiktok-live-connector';

SignConfig.apiKey = 'your api key'; // An API key created at https://www.eulerstream.com
SignConfig.basePath = 'https://your-custom-sign-server.com';
SignConfig.baseOptions = SignConfig.baseOptions || {};
SignConfig.baseOptions.headers = {
    ...(SignConfig.baseOptions.headers || {}),
    'X-Custom-Header': 'Custom-Header-Value'
};
```

> [!IMPORTANT]
> `SignConfig` is read once when the underlying Euler client is first instantiated and the result is cached.
> Mutate it before constructing the first `TikTokLiveConnection`, or pass an explicit `eulerApiInstance` to
> bypass the cache.

## Accessing TikTok LIVE Routes

All HTTP route handlers live in the global `RouteConfig` registry and are also exported individually.
Each route is a function that accepts a single options object and returns a `Promise` resolving to the route's
response. The currently registered routes are:

- `fetchRoomInfo` (TikTok webcast API)
- `fetchRoomGifts` (TikTok webcast API)
- `fetchRoomInfoFromApiLive` (TikTok web API)
- `fetchRoomInfoFromHtml` (HTML scrape with SIGI_STATE extraction)
- `fetchRoomIdFromProvider` (Euler Stream)
- `fetchRoomInfoFromProvider` (Euler Stream)
- `fetchSignedWebSocketFromProvider` (Euler Stream)
- `fetchWebcastSignatureFromProvider` (Euler Stream)
- `sendRoomChatFromProvider` (Euler Stream)
- `fetchRoomIdComposite` (HTML, then API, then Euler fallback)
- `fetchIsLiveComposite` (HTML, then API, then Euler fallback)

### Example Usage

Routes need a `webClient` (and an `apiClient` for Euler routes), both of which are exposed on a
`TikTokLiveConnection` instance:

```ts
import { TikTokLiveConnection, RouteConfig } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('officialgeilegisela');

const sigiState = await RouteConfig.fetchRoomInfoFromHtml({
    webClient: connection.webClient,
    uniqueId: 'officialgeilegisela'
});

console.log('SIGI_STATE liveRoom:', sigiState.liveRoom);
```

### Swapping a Route Implementation

You can replace any handler in `RouteConfig` to inject custom behavior (caching, alternate sign provider,
proxying through your own backend, etc.):

```ts
import { RouteConfig } from 'tiktok-live-connector';

const original = RouteConfig.fetchSignedWebSocketFromProvider;
RouteConfig.fetchSignedWebSocketFromProvider = async (args) => {
    console.log('signing for room', args.roomId);
    return original(args);
};
```

## Accessing 3rd-Party (Euler Stream) Routes

The Euler Stream API client is exposed as `connection.apiClient`. It wraps every endpoint published by the
[`@eulerstream/euler-api-sdk`](https://github.com/eulerstream/EulerApiSdk) package, including premium and
analytics endpoints not bundled into `RouteConfig`.

### Example 1: Fetching Rate Limits

```ts
import { TikTokLiveConnection } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('officialgeilegisela', {
    signApiKey: 'your-api-key'
});

const response = await connection.apiClient.webcast.getRateLimits();
console.log('Rate Limits:', response.data);
```

### Example 2: Using JWT Authentication

When running the connector in a client-facing environment (bundled desktop app, browser worker, etc.) you should
not ship your raw API key. Mint a short-lived JWT on your server and hand that to the client instead.

#### Server-Side

```ts
import { SignConfig, createEulerClient } from 'tiktok-live-connector';

SignConfig.apiKey = 'your_server_side_api_key';
const apiClient = createEulerClient();

const res = await apiClient.authentication.createJWT(
    122, // Your account ID
    {
        limits: { minute: 5, hour: 5, day: 5 },
        expireAfter: 60 * 60 * 2 // 2 hours, the maximum accepted value
    }
);

console.log('Generated JWT:', res.data.token);
```

#### Client-Side

```ts
import { SignConfig, TikTokLiveConnection } from 'tiktok-live-connector';

SignConfig.baseOptions = SignConfig.baseOptions || {};
SignConfig.baseOptions.headers = {
    ...(SignConfig.baseOptions.headers || {}),
    'x-jwt-key': 'generated-jwt-key'
};

const connection = new TikTokLiveConnection('tv_asahi_news');
```

## Events

A `TikTokLiveConnection` object has the following events which can be handled with an event listener.

The simplest event handler is a connect event:

```ts
const connection = new TikTokLiveConnection('officialgeilegisela');
connection.on(ControlEvent.CONNECTED, () => console.log("Connected!"));
```

### Control Events:

- [`ControlEvent.CONNECTED`](#connected) or `"connected"`
- [`ControlEvent.DISCONNECTED`](#disconnected) or `"disconnected"`
- [`ControlEvent.RAW_DATA`](#rawdata) or `"rawData"`
- [`ControlEvent.DECODED_DATA`](#decodeddata) or `"decodedData"`
- [`ControlEvent.WEBSOCKET_CONNECTED`](#websocketconnected) or `"websocketConnected"`
- [`ControlEvent.ERROR`](#error) or `"error"`
- [`ControlEvent.WEBSOCKET_DATA`](#websocketdata) or `"websocketData"`

### Message Events:

- [`WebcastEvent.CHAT`](#chat) or `"chat"`
- [`WebcastEvent.GIFT`](#gift) or `"gift"`
- [`WebcastEvent.MEMBER`](#member) or `"member"`
- [`WebcastEvent.LIKE`](#like) or `"like"`
- [`WebcastEvent.SOCIAL`](#social) or `"social"`
- [`WebcastEvent.ENVELOPE`](#envelope) or `"envelope"`
- [`WebcastEvent.QUESTION_NEW`](#questionnew) or `"questionNew"`
- [`WebcastEvent.LINK_MIC_BATTLE`](#linkmicbattle) or `"linkMicBattle"`
- [`WebcastEvent.LINK_MIC_ARMIES`](#linkmicarmies) or `"linkMicArmies"`
- [`WebcastEvent.LIVE_INTRO`](#liveintro) or `"liveIntro"`
- [`WebcastEvent.SUPER_FAN`](#superfan) or `"superFan"`
- [`WebcastEvent.SUPER_FAN_JOIN`](#superfanjoin) or `"superFanJoin"`
- [`WebcastEvent.FOLLOW`](#follow) or `"follow"`
- [`WebcastEvent.SHARE`](#share) or `"share"`
- [`WebcastEvent.STREAM_END`](#streamend) or `"streamEnd"`
- [`WebcastEvent.ROOM_USER`](#roomuser) or `"roomUser"`
- [`WebcastEvent.EMOTE`](#emote) or `"emote"`
- [`WebcastEvent.GOAL_UPDATE`](#goalupdate) or `"goalUpdate"`
- [`WebcastEvent.ROOM_MESSAGE`](#roommessage) or `"roomMessage"`
- [`WebcastEvent.CAPTION_MESSAGE`](#captionmessage) or `"captionMessage"`
- [`WebcastEvent.IM_DELETE`](#imdelete) or `"imDelete"`
- [`WebcastEvent.IN_ROOM_BANNER`](#inroombanner) or `"inRoomBanner"`
- [`WebcastEvent.RANK_UPDATE`](#rankupdate) or `"rankUpdate"`
- [`WebcastEvent.POLL_MESSAGE`](#pollmessage) or `"pollMessage"`
- [`WebcastEvent.RANK_TEXT`](#ranktext) or `"rankText"`
- [`WebcastEvent.LINK_MIC_BATTLE_PUNISH_FINISH`](#linkmicbattlepunishfinish) or `"linkMicBattlePunishFinish"`
- [`WebcastEvent.LINK_MIC_BATTLE_TASK`](#linkmicbattletask) or `"linkMicBattleTask"`
- [`WebcastEvent.LINK_MIC_FAN_TICKET_METHOD`](#linkmicfanticketmethod) or `"linkMicFanTicketMethod"`
- [`WebcastEvent.LINK_MIC_METHOD`](#linkmicmethod) or `"linkMicMethod"`
- [`WebcastEvent.UNAUTHORIZED_MEMBER`](#unauthorizedmember) or `"unauthorizedMember"`
- [`WebcastEvent.OEC_LIVE_SHOPPING`](#oecliveshopping) or `"oecLiveShopping"`
- [`WebcastEvent.MSG_DETECT`](#msgdetect) or `"msgDetect"`
- [`WebcastEvent.LINK_MESSAGE`](#linkmessage) or `"linkMessage"`
- [`WebcastEvent.ROOM_VERIFY`](#roomverify) or `"roomVerify"`
- [`WebcastEvent.LINK_LAYER`](#linklayer) or `"linkLayer"`
- [`WebcastEvent.ROOM_PIN`](#roompin) or `"roomPin"`
- [`WebcastEvent.SUPER_FAN_BOX`](#superfanbox) or `"superFanBox"`
- [`WebcastEvent.ACCESS_CONTROL`](#accesscontrol) or `"accessControl"`
- [`WebcastEvent.ACCESS_RECALL`](#accessrecall) or `"accessRecall"`
- [`WebcastEvent.BOOST_CARD`](#boostcard) or `"boostCard"`
- [`WebcastEvent.BOTTOM_MESSAGE`](#bottommessage) or `"bottomMessage"`
- [`WebcastEvent.CAPSULE`](#capsule) or `"capsule"`
- [`WebcastEvent.GAME_RANK_NOTIFY`](#gameranknotify) or `"gameRankNotify"`
- [`WebcastEvent.GIFT_BROADCAST`](#giftbroadcast) or `"giftBroadcast"`
- [`WebcastEvent.GIFT_DYNAMIC_RESTRICTION`](#giftdynamicrestriction) or `"giftDynamicRestriction"`
- [`WebcastEvent.GIFT_PANEL_UPDATE`](#giftpanelupdate) or `"giftPanelUpdate"`
- [`WebcastEvent.GIFT_PROMPT`](#giftprompt) or `"giftPrompt"`
- [`WebcastEvent.GUIDE`](#guide) or `"guide"`
- [`WebcastEvent.HOURLY_RANK`](#hourlyrank) or `"hourlyRank"`
- [`WebcastEvent.LINK_MIC_LAYOUT_STATE`](#linkmiclayoutstate) or `"linkMicLayoutState"`
- [`WebcastEvent.LINK_STATE`](#linkstate) or `"linkState"`
- [`WebcastEvent.LIVE_GAME_INTRO`](#livegameintro) or `"liveGameIntro"`
- [`WebcastEvent.MARQUEE_ANNOUNCEMENT`](#marqueeannouncement) or `"marqueeAnnouncement"`
- [`WebcastEvent.NOTICE`](#notice) or `"notice"`
- [`WebcastEvent.PARTNERSHIP_DROPS_UPDATE`](#partnershipdropsupdate) or `"partnershipDropsUpdate"`
- [`WebcastEvent.PARTNERSHIP_GAME_OFFLINE`](#partnershipgameoffline) or `"partnershipGameOffline"`
- [`WebcastEvent.PARTNERSHIP_PUNISH`](#partnershippunish) or `"partnershipPunish"`
- [`WebcastEvent.PERCEPTION`](#perception) or `"perception"`
- [`WebcastEvent.ROOM_NOTIFY`](#roomnotify) or `"roomNotify"`
- [`WebcastEvent.SPEAKER`](#speaker) or `"speaker"`
- [`WebcastEvent.SUB_NOTIFY`](#subnotify) or `"subNotify"`
- [`WebcastEvent.SUB_PIN_EVENT`](#subpinevent) or `"subPinEvent"`
- [`WebcastEvent.TOAST`](#toast) or `"toast"`
- [`WebcastEvent.VIEWER_PICKS_UPDATE`](#viewerpicksupdate) or `"viewerPicksUpdate"`

## Control Events

### `connected`

Triggered when the connection is successfully established.

```ts
connection.on(
    ControlEvent.CONNECTED,
    (state: TikTokLiveConnectionState) => {
        console.log(`Hurray! Connected to roomId ${state.roomId}`);
        console.log(`Room info loaded: ${Boolean(state.roomInfo)}`);
    }
);
```

### `disconnected`

Triggered when the connection gets disconnected. In that case you can call `connect()` again to have a reconnect logic.
Note that you should wait a little bit before attempting a reconnect to to avoid being rate-limited.

```ts
connection.on(ControlEvent.DISCONNECTED, ({ code, reason }) => {
    console.log(`Disconnected :(${code})`);
    if (reason) {
        console.log(`Reason: ${reason}`);
    }
});
```

### `rawData`

Triggered every time a protobuf encoded webcast message arrives. You can deserialize the binary object depending on the
use case with <a href="https://www.npmjs.com/package/protobufjs">protobufjs</a>.

```ts
connection.on(ControlEvent.RAW_DATA, (messageTypeName, binary) => {
    console.log(messageTypeName, binary);
});
```

### `decodedData`

Triggered every time a decoded message arrives. This is the same as the `rawData` event but the binary object is already
decoded. You can use this event to handle the protobuf messages without the need of deserializing them yourself.

```ts
connection.on(ControlEvent.DECODED_DATA, (event: string, decodedData: any, binary: Uint8Array) => {
    console.log(event, decodedData);
});
```

### `websocketConnected`

Will be triggered as soon as a WebSocket connection is established. The WebSocket client object is passed.

```ts
connection.on(ControlEvent.WEBSOCKET_CONNECTED, (client: TikTokWsClient) => {
    console.log('WebSocket open:', client.open);
});
```

### `websocketData`

Triggered every time a WebSocket message arrives. This is the same as the `rawData` event but the binary object is

```ts
connection.on(ControlEvent.WEBSOCKET_DATA, (data: Uint8Array) => {
    console.log(`WebSocket bytes: ${data.length}`);
});
```

### `error`

General error event. You should handle this.

```ts
connection.on(ControlEvent.ERROR, ({ info, exception }) => {
    console.error('Error!', info, exception);
});
```

## Message Events

### `member`

Triggered every time a new viewer joins the live stream.

```ts
connection.on(WebcastEvent.MEMBER, (data: WebcastMemberMessage) => {
    const uniqueId = data.user?.uniqueId;
    const nickname = data.user?.nickname;
    if (uniqueId) {
        console.log(`User uniqueId: ${uniqueId}`);
    }
    if (nickname) {
        console.log(`User nickname: ${nickname}`);
    }
    if (uniqueId || nickname) {
        console.log('User joined the stream!');
    }
    console.log(`Viewers: ${data.memberCount}`);
});
```

### `chat`

Triggered every time a new chat comment arrives.

```ts
connection.on(WebcastEvent.CHAT, (data: WebcastChatMessage) => {
    const uniqueId = data.user?.uniqueId;
    const nickname = data.user?.nickname;
    if (uniqueId) {
        console.log(`User uniqueId: ${uniqueId}`);
    }
    if (nickname) {
        console.log(`User nickname: ${nickname}`);
    }
    if (data.comment) {
        console.log(`Comment: ${data.comment}`);
    }
});
```

### `gift`

Triggered every time a gift arrives. You will receive additional information via the `extendedGiftInfo` attribute when
you enable the [`enableExtendedGiftInfo`](#params-and-options) option.

> **NOTE:** Users have the capability to send gifts in a streak. This increases the `repeatCount` value until the user
> terminates the streak. During this time new gift events are triggered again and again with an increased `repeatCount`
> value. It should be noted that after the end of the streak, another gift event is triggered, which signals the end of
> the streak via `repeatEnd`:`true`. This applies only to gifts with `giftType`:`1`. This means that even if the user
> sends a `giftType`:`1` gift only once, you will receive the event twice. Once with `repeatEnd`:`false` and once
> with `repeatEnd`:`true`. Therefore, the event should be handled as follows:

```ts
connection.on(WebcastEvent.GIFT, (data: WebcastGiftMessage) => {
    const giftType = data.giftDetails?.giftType;
    const giftName = data.giftDetails?.giftName;
    const uniqueId = data.user?.uniqueId;
    const nickname = data.user?.nickname;

    if (giftType === 1 && !data.repeatEnd) {
        // Streak in progress => show only temporary
        console.log('Gift streak in progress');
    } else {
        // Streak ended or non-streakable gift => process the gift with final repeat_count
        console.log('Gift streak ended or non-streakable gift');
    }
    if (uniqueId) {
        console.log(`User uniqueId: ${uniqueId}`);
    }
    if (nickname) {
        console.log(`User nickname: ${nickname}`);
    }
    console.log(`GiftId: ${data.giftId}, repeatCount: ${data.repeatCount}`);
    if (giftName) {
        console.log(`Gift name: ${giftName}`);
    }
});
```

### `roomUser`

Triggered every time a statistic message arrives. This message currently contains the viewer count and a top gifter
list.

```ts
connection.on(WebcastEvent.ROOM_USER, data => {
    console.log(`Viewer Count: ${data.viewerCount}`);
    const topGifter = data.ranksList[0];
    if (topGifter?.user) {
        const uniqueId = topGifter.user.uniqueId;
        const nickname = topGifter.user.nickname;
        if (uniqueId) {
            console.log(`Top gifter uniqueId: ${uniqueId} (${topGifter.coinCount})`);
        }
        if (nickname) {
            console.log(`Top gifter nickname: ${nickname} (${topGifter.coinCount})`);
        }
    }
});
```

### `like`

Triggered when a viewer sends likes to the streamer. For streams with many viewers, this event is not always triggered
by TikTok.

```ts
connection.on(WebcastEvent.LIKE, data => {
    const uniqueId = data.user?.uniqueId;
    const nickname = data.user?.nickname;
    if (uniqueId) {
        console.log(`User uniqueId: ${uniqueId}`);
    }
    if (nickname) {
        console.log(`User nickname: ${nickname}`);
    }
    console.log(`Likes: ${data.likeCount}, total likes: ${data.totalLikeCount}`);
});
```

### `social`

Triggered every time someone shares the stream or follows the host.

```ts
connection.on(WebcastEvent.SOCIAL, data => {
    if (data.action) {
        console.log(`Social action: ${data.action}`);
    }
    const uniqueId = data.user?.uniqueId;
    const nickname = data.user?.nickname;
    if (uniqueId) {
        console.log(`User uniqueId: ${uniqueId}`);
    }
    if (nickname) {
        console.log(`User nickname: ${nickname}`);
    }
    if (data.shareType || data.shareTarget) {
        console.log(`Share type: ${data.shareType}, share target: ${data.shareTarget}`);
    }
});
```

### `emote`

Triggered every time a subscriber sends an emote (sticker).

```ts
connection.on(WebcastEvent.EMOTE, (data: WebcastEmoteChatMessage) => {
    const uniqueId = data.user?.uniqueId;
    const nickname = data.user?.nickname;
    if (uniqueId) {
        console.log(`User uniqueId: ${uniqueId}`);
    }
    if (nickname) {
        console.log(`User nickname: ${nickname}`);
    }
    const emoteId = data.emoteList[0]?.emoteId;
    if (emoteId) {
        console.log(`Emote id: ${emoteId}`);
    }
});
```

### `envelope`

Triggered every time someone sends a treasure chest.

```ts
connection.on(WebcastEvent.ENVELOPE, data => {
    const envelope = data.envelopeInfo;
    if (envelope) {
        if (envelope.envelopeId) {
            console.log(`Envelope ${envelope.envelopeId}`);
        }
        if (envelope.sendUserName) {
            console.log(`From: ${envelope.sendUserName}`);
        }
        console.log(`Diamonds: ${envelope.diamondCount}, People: ${envelope.peopleCount}`);
    }
});
```

### `questionNew`

Triggered every time someone asks a new question via the question feature.

```ts
connection.on(WebcastEvent.QUESTION_NEW, data => {
    const question = data.details?.questionText;
    if (question) {
        console.log(`Question: ${question}`);
    }
    const uniqueId = data.details?.user?.uniqueId;
    const nickname = data.details?.user?.nickname;
    if (uniqueId) {
        console.log(`Asked by (uniqueId): ${uniqueId}`);
    }
    if (nickname) {
        console.log(`Asked by (nickname): ${nickname}`);
    }
});
```

### `linkMicBattle`

Triggered every time a battle starts.

```ts
connection.on(WebcastEvent.LINK_MIC_BATTLE, (data) => {
    const participants = Object.values(data.anchorInfo)
        .map(info => info.user?.displayId || info.user?.nickName)
        .filter(Boolean);
    console.log(`New Battle ${data.battleId}`);
    if (participants.length) {
        console.log(`Participants: ${participants.join(' VS ')}`);
    }
});
```

### `linkMicArmies`

Triggered every time a battle participant receives points. Contains the current status of the battle and the army that
suported the group.

```ts
connection.on(WebcastEvent.LINK_MIC_ARMIES, (data) => {
    console.log(`Battle ${data.battleId}: gift ${data.giftId} x${data.giftCount}`);
    console.log(`Total diamonds: ${data.totalDiamondCount}`);
});
```

### `liveIntro`

Triggered when a live intro message appears.

```ts
connection.on(WebcastEvent.LIVE_INTRO, (msg) => {
    const uniqueId = msg.host?.uniqueId;
    const nickname = msg.host?.nickname;
    if (uniqueId) {
        console.log(`Host uniqueId: ${uniqueId}`);
    }
    if (nickname) {
        console.log(`Host nickname: ${nickname}`);
    }
    if (msg.description) {
        console.log(`Description: ${msg.description}`);
    }
});
```

### `streamEnd`

Triggered when the live stream gets terminated by the host. Will also trigger the [`disconnected`](#disconnected) event.

```ts
connection.on(WebcastEvent.STREAM_END, ({ action }: { action: ControlAction }) => {
    if (action === ControlAction.CONTROL_ACTION_STREAM_ENDED) {
        console.log('Stream ended by user');
    }
    if (action === ControlAction.CONTROL_ACTION_STREAM_SUSPENDED) {
        console.log('Stream ended by platform moderator (ban)');
    }
});
```

### `superFan`

Triggers when a user becomes a Super Fan.

```ts
connection.on(WebcastEvent.SUPER_FAN, (data) => {
    if (data.content?.defaultPattern) {
        console.log(data.content.defaultPattern);
    }
    if (data.commonBarrageContent?.defaultPattern) {
        console.log(data.commonBarrageContent.defaultPattern);
    }
});
```

### `superFanJoin`

Triggers when an existing Super Fan joins the live.

```ts
connection.on(WebcastEvent.SUPER_FAN_JOIN, (data) => {
    if (data.content?.defaultPattern) {
        console.log(data.content.defaultPattern);
    }
    if (data.commonBarrageContent?.defaultPattern) {
        console.log(data.commonBarrageContent.defaultPattern);
    }
});
```

### `superFanBox`

Triggers when a user sends a Super Fan Box.

```ts
connection.on(WebcastEvent.SUPER_FAN_BOX, (data) => {
    console.log('A Super Fan Box was sent!', data.envelopeInfo);
});
```

### Custom Events

These events are based on message events.

### `follow`

Triggers when a user follows the streamer. Based on `social` event.

```ts
connection.on(WebcastEvent.FOLLOW, (data) => {
    const uniqueId = data.user?.uniqueId;
    const nickname = data.user?.nickname;
    if (uniqueId) {
        console.log(`${uniqueId} followed!`);
    }
    if (nickname) {
        console.log(`${nickname} followed!`);
    }
});
```

### `share`

Triggers when a user shares the stream. Based on `social` event.

```ts
connection.on(WebcastEvent.SHARE, (data) => {
    const uniqueId = data.user?.uniqueId;
    const nickname = data.user?.nickname;
    if (uniqueId) {
        console.log(`${uniqueId} shared the stream!`);
    }
    if (nickname) {
        console.log(`${nickname} shared the stream!`);
    }
})
```

### `goalUpdate`

Triggered when a channel goal is updated.

```ts
connection.on(WebcastEvent.GOAL_UPDATE, (data: WebcastGoalUpdateMessage) => {
    const goalDescription = data.goal?.description;
    const contributor = data.contributorDisplayId || data.contributorIdStr || data.contributorId;
    if (goalDescription) {
        console.log(`Goal update: ${goalDescription}`);
    }
    if (contributor) {
        console.log(`Contributor: ${contributor}, count: ${data.contributeCount}, score: ${data.contributeScore}`);
    }
});
```

### `roomMessage`

No information available.

```ts
connection.on(WebcastEvent.ROOM_MESSAGE, (data: WebcastRoomMessage) => {
    if (data.content) {
        console.log(`Room message: ${data.content}`);
    }
    if (data.source) {
        console.log(`Source: ${data.source}`);
    }
    console.log(`Scene: ${data.scene}`);
});
```

### `captionMessage`

No information available.

```ts
connection.on(WebcastEvent.CAPTION_MESSAGE, (data: WebcastCaptionMessage) => {
    if (data.content.length) {
        const lines = data.content.map(c => `[${c.lang}] ${c.content}`).join(' ');
        console.log(`Caption (${data.timestampMs}): ${lines}`);
    }
});
```

### `imDelete`

Triggered when a message is deleted in the chat.

```ts
connection.on(WebcastEvent.IM_DELETE, (data: WebcastImDeleteMessage) => {
    if (data.deleteMsgIdsList.length) {
        console.log(`Deleted messages: ${data.deleteMsgIdsList.join(', ')}`);
    }
    if (data.deleteUserIdsList.length) {
        console.log(`Deleted users: ${data.deleteUserIdsList.join(', ')}`);
    }
});
```

### `inRoomBanner`

Triggered when a banner is shown in the room.

```ts
connection.on(WebcastEvent.IN_ROOM_BANNER, (data: WebcastInRoomBannerMessage) => {
    if (data.jsonData) {
        console.log('Banner payload:', data.jsonData);
    }
});
```

### `rankUpdate`

Triggered when a ranking update is received.

```ts
connection.on(WebcastEvent.RANK_UPDATE, (data: WebcastRankUpdateMessage) => {
    console.log(`Rank updates: ${data.updatesList.length}`);
    const firstUpdate = data.updatesList[0];
    if (firstUpdate) {
        console.log(`Rank type: ${firstUpdate.rankType}, owner rank: ${firstUpdate.ownerRank}`);
    }
});
```

### `pollMessage`

Triggered when a poll-related message is sent in the room.

```ts
connection.on(WebcastEvent.POLL_MESSAGE, (data: WebcastPollMessage) => {
    const title = data.pollBasicInfo?.title;
    if (title) {
        console.log(`Poll: ${title}`);
    }
    if (data.pollBasicInfo?.timeRemain) {
        console.log(`Time remaining: ${data.pollBasicInfo.timeRemain}`);
    }
});
```

### `rankText`

Triggered when text related to rankings is displayed.

```ts
connection.on(WebcastEvent.RANK_TEXT, (data: WebcastRankTextMessage) => {
    if (data.ownerIdxBeforeUpdate || data.ownerIdxAfterUpdate) {
        console.log(`Rank change: ${data.ownerIdxBeforeUpdate} -> ${data.ownerIdxAfterUpdate}`);
    }
    if (data.selfGetBadgeMsg?.defaultPattern) {
        console.log(`Self badge text: ${data.selfGetBadgeMsg.defaultPattern}`);
    }
});
```

### `linkMicBattlePunishFinish`

Triggered when a link mic battle punishment is finished.

```ts
connection.on(WebcastEvent.LINK_MIC_BATTLE_PUNISH_FINISH, (data: WebcastLinkMicBattlePunishFinish) => {
    console.log(`Battle punish finished: ${data.battleId}`);
    console.log(`Reason: ${data.reason}, channel: ${data.channelId}`);
});
```

### `linkMicBattleTask`

Triggered when a new task is issued during a link mic battle.

```ts
connection.on(WebcastEvent.LINK_MIC_BATTLE_TASK, (data: WebcastLinkmicBattleTaskMessage) => {
    console.log(`Battle task (${data.battleId}) type: ${data.battleTaskMessageType}`);
    if (data.taskUpdate) {
        console.log(`Progress: ${data.taskUpdate.taskProgress}`);
    }
    if (data.taskSettle) {
        console.log(`Result: ${data.taskSettle.taskResult}`);
    }
});
```

### `linkMicFanTicketMethod`

Triggered when a fan ticket-related method is invoked during a link mic session.

```ts
connection.on(WebcastEvent.LINK_MIC_FAN_TICKET_METHOD, (data: WebcastLinkMicFanTicketMethod) => {
    const notice = data.FanTicketRoomNotice;
    if (notice) {
        console.log(`Total fan tickets: ${notice.TotalLinkMicFanTicket}`);
        console.log(`Users in notice: ${notice.UserFanTicketList.length}`);
    }
});
```

### `linkMicMethod`

Triggered when a link mic method is used.

```ts
connection.on(WebcastEvent.LINK_MIC_METHOD, (data: WebcastLinkMicMethod) => {
    console.log(`LinkMic messageType: ${data.messageType}`);
    if (data.channelId || data.userId || data.toUserId) {
        console.log(`Channel: ${data.channelId}, user: ${data.userId}, toUser: ${data.toUserId}`);
    }
});
```

### `unauthorizedMember`

Triggered when an unauthorized member tries to perform a restricted action.

```ts
connection.on(WebcastEvent.UNAUTHORIZED_MEMBER, (data: WebcastUnauthorizedMemberMessage) => {
    console.log(`Unauthorized member action: ${data.action}`);
    if (data.nickName) {
        console.log(`Nickname: ${data.nickName}`);
    }
    if (data.enterText?.defaultPattern) {
        console.log(`Enter text: ${data.enterText.defaultPattern}`);
    }
});
```

### `oecLiveShopping`

Triggered when a live shopping event occurs.

```ts
connection.on(WebcastEvent.OEC_LIVE_SHOPPING, (data: WebcastOecLiveShoppingMessage) => {
    const shop = data.shopData;
    if (shop) {
        if (shop.title || shop.priceString) {
            console.log(`Product: ${shop.title} (${shop.priceString})`);
        }
        if (shop.shopName || shop.shopUrl) {
            console.log(`Shop: ${shop.shopName}, URL: ${shop.shopUrl}`);
        }
    }
});
```

### `msgDetect`

Triggered when the system detects a message for moderation or other purposes.

```ts
connection.on(WebcastEvent.MSG_DETECT, (data: WebcastMsgDetectMessage) => {
    console.log(`Detect type: ${data.detectType}, triggerBy: ${data.triggerBy}`);
    if (data.triggerCondition?.uplinkDetectWebSocket !== undefined) {
        console.log(`WebSocket detect: ${data.triggerCondition.uplinkDetectWebSocket}`);
    }
    if (data.timeInfo?.apiRecvTimeMs) {
        console.log(`API recv time: ${data.timeInfo.apiRecvTimeMs}`);
    }
});
```

### `linkMessage`

Triggered during a link mic session for various communication purposes.

```ts
connection.on(WebcastEvent.LINK_MESSAGE, (data: WebcastLinkMessage) => {
    console.log(`Link message type: ${data.MessageType}, scene: ${data.Scene}`);
    if (data.InviteContent) {
        console.log(`Invite from ${data.InviteContent.fromUserId}`);
        if (data.InviteContent.actionId) {
            console.log(`Action: ${data.InviteContent.actionId}`);
        }
    }
    if (data.ReplyContent) {
        console.log(`Reply status: ${data.ReplyContent.replyStatus}`);
        if (data.ReplyContent.fromUserId || data.ReplyContent.toUserId) {
            console.log(`From ${data.ReplyContent.fromUserId} to ${data.ReplyContent.toUserId}`);
        }
    }
});
```

### `roomVerify`

Triggered when the system performs room verification.

```ts
connection.on(WebcastEvent.ROOM_VERIFY, (data: RoomVerifyMessage) => {
    console.log(`Room verify: ${data.noticeType}`);
    console.log(`Action: ${data.action}, closeRoom: ${data.closeRoom}`);
    if (data.content) {
        console.log(`Content: ${data.content}`);
    }
});
```

### `linkLayer`

Triggered when a new link mic layer is added or updated.

```ts
connection.on(WebcastEvent.LINK_LAYER, (data: WebcastLinkLayerMessage) => {
    console.log(`LinkLayer type: ${data.messageType}, channel: ${data.channelId}, scene: ${data.scene}`);
    if (data.inviteContent) {
        if (data.inviteContent.inviteeLinkMicId) {
            console.log(`Invite linkMicId: ${data.inviteContent.inviteeLinkMicId}`);
        }
    }
    if (data.createChannelContent) {
        if (data.createChannelContent.ownerLinkMicId) {
            console.log(`Owner linkMicId: ${data.createChannelContent.ownerLinkMicId}`);
        }
    }
});
```

### `roomPin`

Triggered when a message is pinned in the chat room.

```ts
connection.on(WebcastEvent.ROOM_PIN, (data: WebcastRoomPinMessage) => {
    const operatorUniqueId = data.operator?.uniqueId;
    const operatorNickname = data.operator?.nickname;
    if (operatorUniqueId) {
        console.log(`Pinned by (uniqueId): ${operatorUniqueId}`);
    }
    if (operatorNickname) {
        console.log(`Pinned by (nickname): ${operatorNickname}`);
    }
    if (data.method) {
        console.log(`Pin method: ${data.method}`);
    }

    const chatText = data.chatMessage?.comment;
    const giftName = data.giftMessage?.giftDetails?.giftName;
    const socialAction = data.socialMessage?.action;
    const memberUniqueId = data.memberMessage?.user?.uniqueId;
    const memberNickname = data.memberMessage?.user?.nickname;
    const likeCount = data.likeMessage?.likeCount;

    if (chatText) {
        console.log(`Pinned chat: ${chatText}`);
    }
    if (giftName) {
        console.log(`Pinned gift: ${giftName}`);
    }
    if (socialAction) {
        console.log(`Pinned social action: ${socialAction}`);
    }
    if (memberUniqueId) {
        console.log(`Pinned member (uniqueId): ${memberUniqueId}`);
    }
    if (memberNickname) {
        console.log(`Pinned member (nickname): ${memberNickname}`);
    }
    if (typeof likeCount === 'number') {
        console.log(`Pinned like count: ${likeCount}`);
    }
});
```

## Examples

### Retrieve Room Info

````ts
const connection = new TikTokLiveConnection('@username');

connection.fetchRoomInfo().then((roomInfo: RoomInfoResponse) => {
    console.log(roomInfo);
    console.log(`Stream started timestamp: ${roomInfo.create_time}, Streamer bio: ${roomInfo.owner.bio_description}`);
    console.log(`HLS URL: ${roomInfo.stream_url.hls_pull_url}`); // Can be played or recorded with e.g. VLC
}).catch(err => {
    console.error(err);
});
````

### Retrieve Available Gifts

````ts
const connection = new TikTokLiveConnection('@username');

connection.fetchAvailableGifts().then((giftList: RoomGiftInfo) => {
    console.log(giftList);
    giftList.forEach(gift => {
        console.log(`id: ${gift.id}, name: ${gift.name}, cost: ${gift.diamond_count}`)
    });
}).catch(err => {
    console.error(err);
})
````

### Proxied Connection

The HTTP layer uses [`got`](https://github.com/sindresorhus/got) and the WebSocket layer uses
[`ws`](https://github.com/websockets/ws). Both accept a Node `http.Agent`, which makes
[`hpagent`](https://www.npmjs.com/package/hpagent) the recommended proxy integration. `hpagent` is already a
direct dependency of this package, so no extra install is required.

#### HTTP Client (got) via `webClientOptions`

`got` accepts an `agent` map keyed by protocol (`http`, `https`, `http2`). Provide proxy agents for each protocol
the connector talks to:

```ts
import { TikTokLiveConnection } from 'tiktok-live-connector';
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent';

const proxy = 'http://user:pwd@host:8080';

const connection = new TikTokLiveConnection('@username', {
    webClientOptions: {
        agent: {
            http: new HttpProxyAgent({ proxy, keepAlive: true }),
            https: new HttpsProxyAgent({ proxy, keepAlive: true })
        }
    }
});
```

This routes all TikTok web/webcast HTTP traffic (room id, room info, gift list, HTML scrape, sign requests)
through the proxy.

#### WebSocket Client (ws) via `wsClientOptions`

`ws` accepts a single `agent` (a Node `http.Agent`). Since the WebSocket upgrade goes over `wss://`, use the
HTTPS variant:

```ts
import { TikTokLiveConnection } from 'tiktok-live-connector';
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent';

const proxy = 'http://user:pwd@host:8080';

const connection = new TikTokLiveConnection('@username', {
    webClientOptions: {
        agent: {
            http: new HttpProxyAgent({ proxy, keepAlive: true }),
            https: new HttpsProxyAgent({ proxy, keepAlive: true })
        }
    },
    wsClientOptions: {
        agent: new HttpsProxyAgent({ proxy, keepAlive: true })
    }
});

// Connect as usual
await connection.connect();
```

### Authenticated Connection

To connect as a specific TikTok account, log into TikTok in your browser and copy two cookies: `sessionid` and
`tt-target-idc`. Both are required. `sessionid` is your account's session token (keep it secret), and
`tt-target-idc` is the datacenter region your account belongs to (for example `useast1a` for North America).

Pass them via the `session.cookie` bundle. To force the WebSocket itself to authenticate (so the server treats you
as that account in chat), also set `authenticateWs: true`.

```ts
import { TikTokLiveConnection } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection(
    'tv_asahi_news',
    {
        signApiKey: 'your-api-key',
        authenticateWs: true,
        session: {
            cookie: {
                type: 'cookie',
                value: {
                    sessionId: '<account_session_id>',
                    ttTargetIdc: '<account_target_idc>'
                }
            }
        }
    }
);

await connection.connect();
console.log('Connected to TikTok LIVE chat!');
```

You can also set the session after construction by calling `setSessionBundle` on the cookie jar:

```ts
await connection.webClient.cookieJar.setSessionBundle({
    type: 'cookie',
    value: {
        sessionId: '<account_session_id>',
        ttTargetIdc: '<account_target_idc>'
    }
});
```

### Send Messages

`sendMessage` posts a chat message into the currently connected room. It requires a valid Euler Stream API key
(see [Signing Configuration](#signing-configuration)) and an authenticated session bundle (cookies or OAuth token).

```ts
import { TikTokLiveConnection } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection(
    'tv_asahi_news',
    {
        signApiKey: 'your-api-key',
        authenticateWs: true,
        session: {
            cookie: {
                type: 'cookie',
                value: {
                    sessionId: '<account_session_id>',
                    ttTargetIdc: '<account_target_idc>'
                }
            }
        }
    }
);

await connection.connect();
await connection.sendMessage('Hello world!');
console.log('Message sent!');
```

## Contributors

* **Zerody** - *Initial Reverse-Engineering and Protobuf-Decoding* - [Zerody](https://github.com/zerodytrash/)
* **Isaac Kogan** - *TypeScript Rewrite, Sign-Server Maintainer* - [isaackogan](https://github.com/isaackogan)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
