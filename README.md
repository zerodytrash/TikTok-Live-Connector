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

> [!WARNING]
> This JavaScript library is intended for use in [Node.js](https://nodejs.org/) environments. If you want to process or
> display the data in the browser (client-side), you need to transfer the data from the Node.js environment to the
> browser. You can build a WebSocket server, or use the [Euler WebSocket API](https://www.eulerstream.com/docs/sign-server/websockets) to handle this for you.

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

| Param Name | Required | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
|------------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| uniqueId   | Yes      | The unique username of the broadcaster. You can find this name in the URL.<br>Example: `https://www.tiktok.com/@officialgeilegisela/live` => `officialgeilegisela`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| options    | No       | Here you can set the following optional connection properties. If you do not specify a value, the default value will be used.<br><br>`processInitialData` (default: `true`) <br> Define if you want to process the initital data which includes old messages of the last seconds.<br><br>`signApiKey` (default: `null`) Configure a Sign API key. This API key will be used to generate the URL to facilitate connections to the TikTok LIVE WebSocket server. <br><br> `fetchRoomInfoOnConnect` (default: `true`) <br> Define if you want to fetch all room information on [`connect()`](#methods). If this option is enabled, the connection to offline rooms will be prevented. If enabled, the connect result contains the room info via the `roomInfo` attribute. You can also manually retrieve the room info (even in an unconnected state) using the [`getRoomInfo()`](#methods) function.<br><br>`enableExtendedGiftInfo` (default: `false`) <br> Define if you want to receive extended information about gifts like gift name, cost and images. This information will be provided at the [gift event](#gift). <br><br>`requestPollingIntervalMs` (default: `1000`) <br> Request polling interval if WebSocket is not used.<br><br>`sessionId` (default: `null`) <br> Here you can specify the current Session ID of your TikTok account <br><br>`ttTargetIdc` (default: `null`)<br>The tt-target-idc cookie, representing the TikTok datacenter the account is registered in (based on the sign-up region)<br><br> `webClientParams` (default: `{}`) <br> Custom client params for Webcast API.<br><br>`webClientHeaders` (default: `{}`) <br> Custom request headers passed to [axios](https://github.com/axios/axios).<br><br>`websocketHeaders` (default: `{}`) <br> Custom websocket headers passed to [websocket.client](https://github.com/theturtle32/WebSocket-Node). <br><br>`webClientOptions` (default: `{}`) <br> Custom request options passed to [axios](https://github.com/axios/axios). Here you can specify an `httpsAgent` to use a proxy and a `timeout` value. See [Example](#proxied-connection). <br><br>`wsClientParams` (default: `${}`)<br/> WebSocket parameters to be appended to the connection url. <br><br>`wsClientHeaders` (default: {})<br/> Custom WebSocket headers to be sent when connecting. <br><br>`wsClientOptions` (default: `{}`) <br> Custom websocket options passed to [websocket.client](https://github.com/theturtle32/WebSocket-Node). Here you can specify an `agent` to use a proxy and a `timeout` value. See [Example](#proxied-connection). <br/><br/> `authenticateWs` (default: `false`) <br/> By default, WebSocket connections are not authenticated, even when passing a sessionid, for security. This is because 'signing' (generating the URL) for connecting is done by a 3rd-party freeware service. It must be manually enabled, and you assume the risks associated with sending over a session id when you enable it.<br/><br/>`connectWithUniqueId` (default: `false`)<br/>This option allows the 3rd-party service to determine the Room ID _for_ you, rather than retrieving it through scraping. This may be preferable on low-quality IPs, as it bypasses captchas.<br/><br/>`disableEulerFallbacks` (default: false)<br/>This option disables the Euler Stream API "fallback" routes used by default when scraping fails.<br/><br/>`signedWebSocketProvider` (default: `(props: FetchSignedWebSocketParams) => Promise<ProtoMessageFetchResult>`)<br/> The function responsible for signing (generating a valid WebSocket URL) can be swapped out for your own backend, if you do not want to use the free 3rd-party service bundled into the client that generates them. |

#### Example Options

```ts
const tikTokLiveConnection = new TikTokLiveConnection(tiktokUsername, {
    processInitialData: false,
    enableExtendedGiftInfo: true,
    requestPollingIntervalMs: 2000,
    signApiKey: 'your-api-key',
    webClientParams: {
        "app_language": "en-US",
        "device_platform": "web"
    },
    webClientHeaders: {
        "headerName": "headerValue"
    },
    wsClientHeaders: {
        "headerName": "headerValue"
    },
    wsClientParams: {
        "app_language": "en-US",
    },
    webClientOptions: {
        timeout: 10000
    },
    wsClientOptions: {
        timeout: 10000
    }
});
```

## Methods

| Method Name               | Description                                                                                                                                                                                                                                                                                                                               |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| connect(`[roomId]`)       | Connects to the live stream chat.<br>Returns a `Promise` which will be resolved when the connection is successfully established. Optionally, you can provide a Room Id to bypass Room Id scraping.                                                                                                                                        |
| disconnect()              | Disconnects from the stream if connected.                                                                                                                                                                                                                                                                                                 |
| sendMessage(`<content>`)  | Send a message to a TikTok LIVE chat. Simply speciy the message you want to send, and voila! Requires an API key. <br>[Example](#send-messages)                                                                                                                                                                                           |
| fetchRoomId(`[uniqueId]`) | Fetch the Room Id associated with the currently configured `uniqueId`. Optionally, provide a `uniqueId` for a different user to check. Returns a `Promise` which is resolved when the Room Id is fetched.                                                                                                                                 |
| fetchIsLive()             | Fetch whether the user is currently streaming. Returns a `Promise` which resolves when the state is fetched.                                                                                                                                                                                                                              |
| waitUntilLive()           | Returns a blocking promise that resolves when the user goes live.                                                                                                                                                                                                                                                                         |
| fetchRoomInfo()           | Gets the current room info from TikTok API including streamer info, room status and statistics.<br>Returns a `Promise` which will be resolved when the API request is done.<br>*<b>Note: </b>You can call this function even if you're not connected.*<br>[Example](#retrieve-room-info)                                                  |
| fetchAvailableGifts()     | Gets a list of all available gifts including gift name, image url, diamont cost and a lot of other information.<br>Returns a `Promise` that will be resolved when all available gifts has been retrieved from the API.<br>*<b>Note: </b>You can call this function even if you're not connected.*<br>[Example](#retrieve-available-gifts) |

## Properties

| Property Name                             | Description                                                                                                                               |
|-------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| webClient: `TikTokWebClient`              | An API wrapper for TikTok with routes for scraping the TikTok site & internal APIs. This is used to fetch the initial data and room info. |
| wsClient: `TikTokWsClient \| null`        | The WebSocket client object. This manages the lifecycle of the WebSocket connection to TikTok, and is where all events originate from.    |
| options: `TikTokLiveConnectionOptions`    | Options described in [Params and Options](#params-and-options)                                                                            |
| roomInfo: `RoomInfoResponse`              | The room info object. This contains all information about the current room.                                                               |
| availableGifts: `RoomGiftInfo`            | The list of available gifts. This is only filled if `enableExtendedGiftInfo` is set to `true`.                                            |
| isConnecting: `boolean`                   | Indicates whether the connection is currently being established.                                                                          |
| isConnected: `boolean`                    | Indicates whether the connection is currently established.                                                                                |
| webClientParams: `Record<string, string>` | Base URI parameters that are sent with every request of `TikTokWebClient`.<br/>                                                           |
| roomId: `string`                          | The current room id. This is only available after a successful connection.                                                                |
| state: `TikTokLiveConnectionState`        | The current state of the connection. Includes info such as connection status, Room Id, room info, etc.                                    |

## Signing Configuration

It is possible to configure the [3rd-party library](https://github.com/EulerStream/EulerApiSdk) used to generate
WebSocket URLs, a process referred to as 'signing'. An example is provided below:

```ts
// SignConfig is an instance of Partial<ClientConfiguration>
import { SignConfig } from 'tiktok-live-connector';

SignConfig.apiKey = "your api key" // An API key created at https://www.eulerstream.com
SignConfig.basePath = "https://your-custom-sign-server.com" // Optionally, you can even define your own server
SignConfig.baseOptions.headers['X-Custom-Header'] = 'Custom-Header-Value'
```

## Accessing TikTok LIVE Routes

The `TikTokWebClient` object is used to access TikTok's internal API routes. This object is available via
the `webClient` property of the `TikTokLiveConnection` object.

The following routes come bundled with the web client:

- `connection.webClient.fetchRoomInfo`
- `connection.webClient.sendRoomChat`
- `connection.webClient.fetchRoomInfoFromApiLive`
- `connection.webClient.fetchRoomInfoFromHtml`
- `connection.webClient.fetchSignedWebSocketFromEuler`
- `connection.webClient.fetchRoomIdFromEuler`
- `connection.webClient.fetchRoomInfoFromEuler`

### Example Usage:

All routes are callable classes that accepts a singular object with the required parameters, and return a promise
that resolves with the route data. For instance, here is how you can fetch Room Info from the page HTML:

```ts
const connection = new TikTokLiveConnection('officialgeilegisela');

connection.webClient.fetchRoomInfoFromHtml({ uniqueId: uniqueId })
    .then((response: FetchRoomInfoFromHtmlRouteResponse) => {
        console.log('Room Info:', response.data);
    });
```

## Accessing 3rd-Party Routes

The `TikTokWebClient` comes bundled with an instance of `EulerSigner`, a 3rd-party library that provides the WebSocket
connection URL used to
connect to TikTok LIVE.

This is publicly accessible via `connection.webClient.webSigner` and exposes additional 3rd-party routes related to
TikTok LIVE.

### Example 1: Fetching Rate Limits

For example, here's how you can fetch the rate limits for your current API key:

```ts
import { SignConfig } from 'tiktok-live-connector';
import { GetRateLimits } from '@eulerstream/euler-api-sdk';

// Configure an API Key
SignConfig.apiKey = 'your api key'; // An API key created at https://www.eulerstream.com

// Create a connection
const connection = new TikTokLiveConnection();

// Fetch the limits
connection.webClient.webSigner.webcast.getRateLimits()
    .then((response: AxiosResponse<IGetRateLimits>) => {
        console.log('Rate Limits:', response.data);
    });
```

### Example 2: Using JWT Authentication

If you intend to run the TikTok-Live-Connector in a client environment (e.g. a bundled desktop app), you won't want to
give the user your API key. Instead, you can create a JWT for the user to connect to the API.

### Server-Side:

First, generate the JWT and return it to your user:

```ts
import { SignConfig, TikTokWebClient } from './src';

SignConfig.apiKey = 'your_api_key_here';
const connection = new TikTokWebClient();

connection.webSigner.authentication.createJWT(
    122, // Your account ID
    {
        limits: {
            minute: 5,
            day: 5,
            hour: 5
        },
        expireAfter: 60 * 60 * 2 // 2 hours is the max accepted value
    }
).then((res) => {
    console.log('Generated JWT:', res.data.token);
});
```

### Client-Side:

Then, use the JWT to connect to the API in the client-side NodeJS application:

```ts
import { SignConfig } from './config';
import { TikTokLiveConnection } from './client';

SignConfig.baseOptions.headers['x-jwt-key'] = 'generated-jwt-key';
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
- [`WebcastEvent.SUPER_FAN`](#superfan) or `"superFan"`
- [`WebcastEvent.SUPER_FAN_BOX`](#superfanbox) or `"superFanBox"`

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

It is possible to proxy connections. The library [proxy-agent](https://www.npmjs.com/package/proxy-agent)
supports `http`, `https`, `socks4` and `socks5` proxies:

````
npm i proxy-agent
````

You can specify if you want to use a proxy for https requests, websockets or both:

````ts
import { TikTokLiveConnection } from 'tiktok-live-connector';
import ProxyAgent from 'proxy-agent';

const connection = new TikTokLiveConnection('@username', {
    webClientOptions: {
        httpsAgent: new ProxyAgent('https://username:password@host:port'),
        timeout: 10000 // 10 seconds
    },
    wsClientOptions: {
        agent: new ProxyAgent('https://username:password@host:port'),
        timeout: 10000 // 10 seconds
    }
});

// Connect as per usual
````

### Authenticated Connection

You can connect to the TikTok LIVE with a specific account. To do so, log into your browser & into TikTok.
Then, simply extract the `sessionid` and `tt-target-idc` cookies. **Both** are needed to connect.

One is your account's session token (keep this secret!), and the other is the datacenter the account is located in. This
tells TikTok where to look for your session, and is based
on your region (i.e. EU and NA will have different cookies, but all NA users will have the same cookie, such
as `useast1a`).

```ts
import { TikTokLiveConnection } from 'tiktok-live-connector';
import { connection } from 'websocket';

const connection = new TikTokLiveConnection(
    'tv_asahi_news',
    {
        sessionId: '<account_session_id>',
        ttTargetIdc: '<account_target_idc>',
    }
);

// Connect, then send a chat!
connection.connect().then(() => {
    connection.sendMessage('Connected');
    console.log('Connected to TikTok LIVE chat!');
}).catch(err => {
    console.error('Error connecting to TikTok LIVE chat:', err);
});
```

### Send Messages

As of `2.0.2` you can now send messages to TikTok LIVE chats!

```ts
import { TikTokLiveConnection } from 'tiktok-live-connector';
import { connection } from 'websocket';

// Include in options
const connection = new TikTokLiveConnection(
    'tv_asahi_news',
    {
        sessionId: '<account_session_id>',
        ttTargetIdc: '<account_target_idc>'
    }
);

// OR, set it afterwards
connection.webClient.cookieJar.setSession('<account_session_id>', '<account_target_idc>');

// Connect, then send a chat!
connection.connect().then(async () => {
    await connection.sendMessage('Hello world!');
    console.log('Connected to TikTok LIVE chat!');
}).catch(err => {
    console.error('Error connecting to TikTok LIVE chat:', err);
});
```

## Contributors

* **Zerody** - *Initial Reverse-Engineering and Protobuf-Decoding* - [Zerody](https://github.com/zerodytrash/)
* **Isaac Kogan** - *TypeScript Rewrite, Sign-Server Maintainer* - [isaackogan](https://github.com/isaackogan)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
