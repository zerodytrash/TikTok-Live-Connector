# TikTok LIVE API for Node.JS (Unofficial)

[TikTok LIVE API](https://www.eulerstream.com/) Client for Node.JS (Unofficial, Unaffiliated with ByteDance Ltd.)

Connect to any [TikTok LIVE](https://www.tiktok.com/live) stream and receive real-time chat messages,
gifts, likes, follows, shares, viewer counts and battles using just a creator's username (`@uniqueId`).
No login, credentials or app registration are required.

TikTokLiveConnector reads TikTok's internal Webcast push service directly, which makes it the foundation for
TikTok chat bots, gift trackers, OBS overlays, donation alerts, moderation tools and livestream analytics.
It works for your own live chat and for any other creator's.

Full guides, event reference and API documentation: <https://ttlc.docs.isaackogan.com/>

Tracked events include [Chat Comments](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#chat), [Members Joining](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#member), [Gifts](https://ttlc.docs.isaackogan.com/events/gifts-and-goals/#gift),
[Viewers](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#room-user), [Follows](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#social), [Shares](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#social), [Questions](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#question-new),
[Likes](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#like), [Super Fans](https://ttlc.docs.isaackogan.com/events/subscriptions-and-fans/#super-fan) and [Battles](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#link-mic-battle).

[![Discord](https://img.shields.io/discord/977648006063091742?logo=discord&label=TikTokLive%20Discord&labelColor=%23171717&color=%231877af)](https://discord.gg/N3KSxzvDX8)
![Connections](https://api.eulerstream.com/analytics/pips?client=ttlive-node)
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
| `options`  | No | Optional connection properties. Defaults are applied when a value is not specified.<br><br>`signApiKey` (default: `undefined`)<br>Euler Stream API key. When provided, it is written to the global `SignConfig.apiKey` before the underlying Euler client is created. Ignored when `eulerApiInstance` is passed.<br><br>`eulerApiInstance` (default: `undefined`)<br>Pre-built `EulerStreamApiClient` to use for all sign-server traffic. Takes precedence over `signApiKey`.<br><br>`session` (default: `undefined`)<br>Authenticated session bundle. Pass `session.cookie` to seed the cookie jar with `sessionid` and `tt-target-idc`, and/or `session.oAuthToken` to send an OAuth token to the sign server. Required when `authenticateWs` or `useMobile` is true. See [Authenticated Connection](#authenticated-connection).<br><br>`authenticateWs` (default: `false`)<br>Forward the session cookies or OAuth token to the sign server so the WebSocket is authenticated. Disabled by default since signing is done by a third-party service; enabling it sends your session credentials to that service.<br><br>`useMobile` (default: `false`)<br>Use the mobile WebSocket flow. Requires `authenticateWs: true` and `session.cookie`; connecting with `useMobile` but without `authenticateWs` throws a `TypeError`.<br><br>`processInitialData` (default: `true`)<br>Decode and emit the message batch returned in the initial sign response (recent chat history etc.).<br><br>`fetchRoomInfoOnConnect` (default: `true`)<br>Fetch room info during connect. If the streamer is not currently live the connect rejects with `UserOfflineError`. The fetched info is stored on `connection.roomInfo` and is also accessible via [`fetchRoomInfo()`](#methods).<br><br>`enableExtendedGiftInfo` (default: `false`)<br>Fetch the room gift list during connect so `WebcastGiftMessage` events carry an `extendedGiftInfo` field with name, cost, and image data.<br><br>`clientPresets` (default: randomized)<br>Pre-built `{ device, screen, location }` presets. Defaults to a freshly randomized set from `getRandomPresets()`.<br><br>`webClientOptions` (default: `{}`)<br>Extra options forwarded to the underlying [`got`](https://github.com/sindresorhus/got) HTTP client (proxy agent, timeout, etc.). Headers and search params from this object are merged with the defaults; transport-only fields are passed through. See [Proxied Connection](#proxied-connection).<br><br>`wsClientOptions` (default: `{}`)<br>Extra options forwarded to the underlying [`ws`](https://github.com/websockets/ws) WebSocket client. See [Proxied Connection](#proxied-connection).<br><br>`webConfigOverrides` (default: `{}`)<br>Partial overrides for the resolved `WebcastWebConfigDefaults` used by the HTTP client. Use this to customize `DEFAULT_HTTP_CLIENT_PARAMS`, `DEFAULT_HTTP_CLIENT_HEADERS`, etc.<br><br>`wsConfigOverrides` (default: `{}`)<br>Partial overrides for the resolved `WebcastWebSocketConfigDefaults` used by the WebSocket client. Use this to customize `DEFAULT_WS_CLIENT_PARAMS` or `DEFAULT_WS_CLIENT_HEADERS`. |

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
- `fetchRoomGiftsFromProvider` (Euler Stream)
- `fetchRoomGiftGalleryFromProvider` (Euler Stream)
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

<a id="control-events-1"></a>

See the [control event reference](https://ttlc.docs.isaackogan.com/events/control/) for arguments and examples.

- <a id="connected"></a>[`ControlEvent.CONNECTED`](https://ttlc.docs.isaackogan.com/events/control/#connected) or `"connected"`
- <a id="disconnected"></a>[`ControlEvent.DISCONNECTED`](https://ttlc.docs.isaackogan.com/events/control/#disconnected) or `"disconnected"`
- <a id="rawdata"></a>[`ControlEvent.RAW_DATA`](https://ttlc.docs.isaackogan.com/events/control/#raw-data) or `"rawData"`
- <a id="decodeddata"></a>[`ControlEvent.DECODED_DATA`](https://ttlc.docs.isaackogan.com/events/control/#decoded-data) or `"decodedData"`
- <a id="websocketconnected"></a>[`ControlEvent.WEBSOCKET_CONNECTED`](https://ttlc.docs.isaackogan.com/events/control/#websocket-connected) or `"websocketConnected"`
- <a id="error"></a>[`ControlEvent.ERROR`](https://ttlc.docs.isaackogan.com/events/control/#error) or `"error"`
- <a id="websocketdata"></a>[`ControlEvent.WEBSOCKET_DATA`](https://ttlc.docs.isaackogan.com/events/control/#websocket-bytes) or `"websocketData"`

### Message Events:

<a id="message-events-1"></a>

See the [message event reference](https://ttlc.docs.isaackogan.com/events/) for payloads and examples.

- <a id="chat"></a>[`WebcastEvent.CHAT`](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#chat) or `"chat"`
- <a id="gift"></a>[`WebcastEvent.GIFT`](https://ttlc.docs.isaackogan.com/events/gifts-and-goals/#gift) or `"gift"`
- <a id="member"></a>[`WebcastEvent.MEMBER`](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#member) or `"member"`
- <a id="like"></a>[`WebcastEvent.LIKE`](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#like) or `"like"`
- <a id="social"></a>[`WebcastEvent.SOCIAL`](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#social) or `"social"`
- <a id="envelope"></a>[`WebcastEvent.ENVELOPE`](https://ttlc.docs.isaackogan.com/events/gifts-and-goals/#envelope) or `"envelope"`
- <a id="questionnew"></a>[`WebcastEvent.QUESTION_NEW`](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#question-new) or `"questionNew"`
- <a id="linkmicbattle"></a>[`WebcastEvent.LINK_MIC_BATTLE`](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#link-mic-battle) or `"linkMicBattle"`
- <a id="linkmicarmies"></a>[`WebcastEvent.LINK_MIC_ARMIES`](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#link-mic-armies) or `"linkMicArmies"`
- <a id="liveintro"></a>[`WebcastEvent.LIVE_INTRO`](https://ttlc.docs.isaackogan.com/events/room-and-display/#live-intro) or `"liveIntro"`
- <a id="superfan"></a>[`WebcastEvent.SUPER_FAN`](https://ttlc.docs.isaackogan.com/events/subscriptions-and-fans/#super-fan) or `"superFan"`
- <a id="superfanjoin"></a>[`WebcastEvent.SUPER_FAN_JOIN`](https://ttlc.docs.isaackogan.com/events/subscriptions-and-fans/#super-fan-join) or `"superFanJoin"`
- <a id="custom-events"></a><a id="follow"></a>[`WebcastEvent.FOLLOW`](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#follow) or `"follow"`
- <a id="share"></a>[`WebcastEvent.SHARE`](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#share) or `"share"`
- <a id="streamend"></a>[`WebcastEvent.STREAM_END`](https://ttlc.docs.isaackogan.com/events/stream-control/#stream-end) or `"streamEnd"`
- <a id="roomuser"></a>[`WebcastEvent.ROOM_USER`](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#room-user) or `"roomUser"`
- <a id="emote"></a>[`WebcastEvent.EMOTE`](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#emote) or `"emote"`
- <a id="goalupdate"></a>[`WebcastEvent.GOAL_UPDATE`](https://ttlc.docs.isaackogan.com/events/gifts-and-goals/#goal-update) or `"goalUpdate"`
- <a id="roommessage"></a>[`WebcastEvent.ROOM_MESSAGE`](https://ttlc.docs.isaackogan.com/events/room-and-display/#room-message) or `"roomMessage"`
- <a id="captionmessage"></a>[`WebcastEvent.CAPTION_MESSAGE`](https://ttlc.docs.isaackogan.com/events/room-and-display/#caption-message) or `"captionMessage"`
- <a id="imdelete"></a>[`WebcastEvent.IM_DELETE`](https://ttlc.docs.isaackogan.com/events/moderation-and-access/#im-delete) or `"imDelete"`
- <a id="inroombanner"></a>[`WebcastEvent.IN_ROOM_BANNER`](https://ttlc.docs.isaackogan.com/events/room-and-display/#in-room-banner) or `"inRoomBanner"`
- <a id="rankupdate"></a>[`WebcastEvent.RANK_UPDATE`](https://ttlc.docs.isaackogan.com/events/rankings/#rank-update) or `"rankUpdate"`
- <a id="pollmessage"></a>[`WebcastEvent.POLL_MESSAGE`](https://ttlc.docs.isaackogan.com/events/room-and-display/#poll-message) or `"pollMessage"`
- <a id="ranktext"></a>[`WebcastEvent.RANK_TEXT`](https://ttlc.docs.isaackogan.com/events/rankings/#rank-text) or `"rankText"`
- <a id="linkmicbattlepunishfinish"></a>[`WebcastEvent.LINK_MIC_BATTLE_PUNISH_FINISH`](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#link-mic-battle-punish-finish) or `"linkMicBattlePunishFinish"`
- <a id="linkmicbattletask"></a>[`WebcastEvent.LINK_MIC_BATTLE_TASK`](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#link-mic-battle-task) or `"linkMicBattleTask"`
- <a id="linkmicfanticketmethod"></a>[`WebcastEvent.LINK_MIC_FAN_TICKET_METHOD`](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#link-mic-fan-ticket-method) or `"linkMicFanTicketMethod"`
- <a id="linkmicmethod"></a>[`WebcastEvent.LINK_MIC_METHOD`](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#link-mic-method) or `"linkMicMethod"`
- <a id="unauthorizedmember"></a>[`WebcastEvent.UNAUTHORIZED_MEMBER`](https://ttlc.docs.isaackogan.com/events/moderation-and-access/#unauthorized-member) or `"unauthorizedMember"`
- <a id="oecliveshopping"></a>[`WebcastEvent.OEC_LIVE_SHOPPING`](https://ttlc.docs.isaackogan.com/events/games-and-commerce/#oec-live-shopping) or `"oecLiveShopping"`
- <a id="msgdetect"></a>[`WebcastEvent.MSG_DETECT`](https://ttlc.docs.isaackogan.com/events/moderation-and-access/#msg-detect) or `"msgDetect"`
- <a id="linkmessage"></a>[`WebcastEvent.LINK_MESSAGE`](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#link-message) or `"linkMessage"`
- <a id="roomverify"></a>[`WebcastEvent.ROOM_VERIFY`](https://ttlc.docs.isaackogan.com/events/moderation-and-access/#room-verify) or `"roomVerify"`
- <a id="linklayer"></a>[`WebcastEvent.LINK_LAYER`](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#link-layer) or `"linkLayer"`
- <a id="roompin"></a>[`WebcastEvent.ROOM_PIN`](https://ttlc.docs.isaackogan.com/events/room-and-display/#room-pin) or `"roomPin"`
- <a id="superfanbox"></a>[`WebcastEvent.SUPER_FAN_BOX`](https://ttlc.docs.isaackogan.com/events/subscriptions-and-fans/#super-fan-box) or `"superFanBox"`
- [`WebcastEvent.ACCESS_CONTROL`](https://ttlc.docs.isaackogan.com/events/moderation-and-access/#access-control) or `"accessControl"`
- [`WebcastEvent.ACCESS_RECALL`](https://ttlc.docs.isaackogan.com/events/moderation-and-access/#access-recall) or `"accessRecall"`
- [`WebcastEvent.BOOST_CARD`](https://ttlc.docs.isaackogan.com/events/gifts-and-goals/#boost-card) or `"boostCard"`
- [`WebcastEvent.BOTTOM_MESSAGE`](https://ttlc.docs.isaackogan.com/events/room-and-display/#bottom-message) or `"bottomMessage"`
- [`WebcastEvent.CAPSULE`](https://ttlc.docs.isaackogan.com/events/room-and-display/#capsule) or `"capsule"`
- [`WebcastEvent.GAME_RANK_NOTIFY`](https://ttlc.docs.isaackogan.com/events/rankings/#game-rank-notify) or `"gameRankNotify"`
- [`WebcastEvent.GIFT_BROADCAST`](https://ttlc.docs.isaackogan.com/events/gifts-and-goals/#gift-broadcast) or `"giftBroadcast"`
- [`WebcastEvent.GIFT_DYNAMIC_RESTRICTION`](https://ttlc.docs.isaackogan.com/events/gifts-and-goals/#gift-dynamic-restriction) or `"giftDynamicRestriction"`
- [`WebcastEvent.GIFT_PANEL_UPDATE`](https://ttlc.docs.isaackogan.com/events/gifts-and-goals/#gift-panel-update) or `"giftPanelUpdate"`
- [`WebcastEvent.GIFT_PROMPT`](https://ttlc.docs.isaackogan.com/events/gifts-and-goals/#gift-prompt) or `"giftPrompt"`
- [`WebcastEvent.GUIDE`](https://ttlc.docs.isaackogan.com/events/room-and-display/#guide) or `"guide"`
- [`WebcastEvent.HOURLY_RANK`](https://ttlc.docs.isaackogan.com/events/rankings/#hourly-rank) or `"hourlyRank"`
- [`WebcastEvent.LINK_MIC_LAYOUT_STATE`](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#link-mic-layout-state) or `"linkMicLayoutState"`
- [`WebcastEvent.LINK_STATE`](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#link-state) or `"linkState"`
- [`WebcastEvent.LIVE_GAME_INTRO`](https://ttlc.docs.isaackogan.com/events/games-and-commerce/#live-game-intro) or `"liveGameIntro"`
- [`WebcastEvent.MARQUEE_ANNOUNCEMENT`](https://ttlc.docs.isaackogan.com/events/room-and-display/#marquee-announcement) or `"marqueeAnnouncement"`
- [`WebcastEvent.NOTICE`](https://ttlc.docs.isaackogan.com/events/room-and-display/#notice) or `"notice"`
- [`WebcastEvent.PARTNERSHIP_DROPS_UPDATE`](https://ttlc.docs.isaackogan.com/events/games-and-commerce/#partnership-drops-update) or `"partnershipDropsUpdate"`
- [`WebcastEvent.PARTNERSHIP_GAME_OFFLINE`](https://ttlc.docs.isaackogan.com/events/games-and-commerce/#partnership-game-offline) or `"partnershipGameOffline"`
- [`WebcastEvent.PARTNERSHIP_PUNISH`](https://ttlc.docs.isaackogan.com/events/games-and-commerce/#partnership-punish) or `"partnershipPunish"`
- [`WebcastEvent.PERCEPTION`](https://ttlc.docs.isaackogan.com/events/moderation-and-access/#perception) or `"perception"`
- [`WebcastEvent.ROOM_NOTIFY`](https://ttlc.docs.isaackogan.com/events/room-and-display/#room-notify) or `"roomNotify"`
- [`WebcastEvent.SPEAKER`](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/#speaker) or `"speaker"`
- [`WebcastEvent.SUB_NOTIFY`](https://ttlc.docs.isaackogan.com/events/subscriptions-and-fans/#sub-notify) or `"subNotify"`
- [`WebcastEvent.SUB_PIN_EVENT`](https://ttlc.docs.isaackogan.com/events/subscriptions-and-fans/#sub-pin-event) or `"subPinEvent"`
- [`WebcastEvent.TOAST`](https://ttlc.docs.isaackogan.com/events/room-and-display/#toast) or `"toast"`
- [`WebcastEvent.VIEWER_PICKS_UPDATE`](https://ttlc.docs.isaackogan.com/events/room-and-display/#viewer-picks-update) or `"viewerPicksUpdate"`

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

## Frequently Asked Questions

### Is there an official TikTok LIVE API?

TikTok does not offer a public official API for reading livestream events. TikTokLiveConnector is an unofficial,
open-source TikTok LIVE API client that reads the same Webcast data available to any viewer of a stream.

### How do I read TikTok live chat messages in Node.js?

Install with `npm i tiktok-live-connector`, create a `TikTokLiveConnection` with the streamer's `@uniqueId`, and
listen for `WebcastEvent.CHAT`. See [Getting Started](#getting-started) above — it takes about ten lines of code.

### Can I track TikTok gifts, likes and viewer counts in real time?

Yes. [`GIFT`](https://ttlc.docs.isaackogan.com/events/gifts-and-goals/#gift) (with streak handling), [`LIKE`](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#like) and [`ROOM_USER`](https://ttlc.docs.isaackogan.com/events/chat-and-audience/#room-user) deliver gifts, likes and
live viewer counts as they happen, alongside follows, shares, subscriptions, questions and battles.

### Does it work without logging in?

Yes. No credentials, cookies or app registration are required to *read* a public livestream. Authentication is only
needed to *send* chat messages, which additionally requires a sign API key — see [Send Messages](#send-messages).

### Is it free?

Yes, the library is free and open source. Connecting requires a signed WebSocket token, provided by
[Euler Stream](https://www.eulerstream.com/) with free community rate limits; an API key raises those limits.

### Is it production-ready?

The library is a reverse-engineering project and TikTok can change the Webcast protocol without notice. For
workloads that need an uptime guarantee, use the managed
[TikTok LIVE WebSocket API](https://www.eulerstream.com/websockets), which handles signing, scaling and protocol
drift for you.

### Is this available in other languages?

Yes — see [Do you prefer other programming languages?](#do-you-prefer-other-programming-languages) for the Python,
Java, Go and C# ports.

## Contributors

* **Zerody** - *Initial Reverse-Engineering and Protobuf-Decoding* - [Zerody](https://github.com/zerodytrash/)
* **Isaac Kogan** - *TypeScript Rewrite, Sign-Server Maintainer* - [isaackogan](https://github.com/isaackogan)
* **sleepylessons** - *Docs & QoL Updates* - [sleepylessons](https://github.com/sleepylessons)

## License

This project is licensed under a modified AGPL License. See the [LICENSE](https://github.com/zerodytrash/TikTok-Live-Connector/blob/ts-rewrite/LICENSE) file for details.
