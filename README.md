# TikTok-Live-Connector

A Node.js library to receive live stream events such as comments and gifts in realtime
from [TikTok LIVE](https://www.tiktok.com/live) by connecting to TikTok's internal Webcast push service.
This package includes a wrapper that connects to the Webcast service using just the username (`@uniqueId`).
This allows you to connect to your own live chat as well as the live chat of other streamers. No credentials are
required. Besides [Chat Comments](#chat), other events such
as [Members Joining](#member), [Gifts](#gift), [Subscriptions](#subscribe), [Viewers](#roomuser), [Follows](#social), [Shares](#social), [Questions](#questionnew), [Likes](#like)
and [Battles](#linkmicbattle) can be tracked.

[![Discord](https://img.shields.io/discord/977648006063091742?logo=discord&label=TikTokLive%20Discord&labelColor=%23171717&color=%231877af)](https://discord.gg/N3KSxzvDX8)
![Connections](https://tiktok.eulerstream.com/analytics/pips/1?client=ttlive-node)
![Downloads](https://img.shields.io/npm/dw/tiktok-live-connector?style=flat&color=0274b5&alt=1)
![Stars](https://img.shields.io/github/stars/zerodytrash/tiktok-live-connector?style=flat&color=0274b5&alt=1)
![Issues](https://img.shields.io/github/issues/zerodytrash/tiktok-live-connector?style=flat&color=0274b5&alt=1)
![Forks](https://img.shields.io/github/forks/zerodytrash/tiktok-live-connector?style=flat&color=0274b5&alt=1)

> [!NOTE]
> This is not an official API. It is a reverse engineering project. You are responsible for your usage of this library.

> [!TIP]
> An example project is available
> at https://tiktok-chat-reader.zerody.one/ - [View Source](https://github.com/zerodytrash/TikTok-Chat-Reader)

> [!WARNING]
> This JavaScript library is intended for use in [Node.js](https://nodejs.org/) environments. If you want to process or
> display the data in the browser (client-side), you need to transfer the data from the Node.js environment to the
> browser. A good approach for this is to use [Socket.IO](https://socket.io/) or a different low-latency communication
> framework. A complete example project can be found
> here: [TikTok-Chat-Reader](https://github.com/zerodytrash/TikTok-Chat-Reader)

> [!WARNING]
> Due to a change on the part of TikTok, versions prior **v1.1.7** are no longer functional. If you are using one of
> these versions, upgrade to the latest version using the `npm i tiktok-live-connector` command.

### 📌 2.X.X Now Available - Upgrade Now!

We are thrilled to announce that the 2.0.0 release of TikTok Live Connector is now available!
This release converts the package to exclusively typescript-based, also providing complete backwards compatibility for
users.

#### Upgrade Guide

- Install via `npm i tiktok-live-connector@2.0.0`
- Switch `WebcastPushConnection` to `TikTokLiveConnection` (or keep for legacy support)
- Switch Event Names to `WebcastEvent.EVENT_NAME` from `event_name` format
- That's it! You're good to go!
- If you have any issues, please open an issue on GitHub or ask on [Discord](https://discord.gg/2c6kX6g3Pa).

#### Breaking Changes

- `WebcastPushConnection` has been renamed to `TikTokLiveConnection`
- CommonJS support has been removed
- Data fetching functions have been renamed

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
| options    | No       | Here you can set the following optional connection properties. If you do not specify a value, the default value will be used.<br><br>`processInitialData` (default: `true`) <br> Define if you want to process the initital data which includes old messages of the last seconds.<br><br>`signApiKey` (default: `null`) Configure a Sign API key. This API key will be used to generate the URL to facilitate connections to the TikTok LIVE WebSocket server. <br><br> `fetchRoomInfoOnConnect` (default: `true`) <br> Define if you want to fetch all room information on [`connect()`](#methods). If this option is enabled, the connection to offline rooms will be prevented. If enabled, the connect result contains the room info via the `roomInfo` attribute. You can also manually retrieve the room info (even in an unconnected state) using the [`getRoomInfo()`](#methods) function.<br><br>`enableExtendedGiftInfo` (default: `false`) <br> Define if you want to receive extended information about gifts like gift name, cost and images. This information will be provided at the [gift event](#gift). <br><br>`requestPollingIntervalMs` (default: `1000`) <br> Request polling interval if WebSocket is not used.<br><br>`sessionId` (default: `null`) <br> Here you can specify the current Session ID of your TikTok account <br><br>`ttTargetIdc` (default: `null`)<br>The tt-target-idc cookie, representing the TikTok datacenter the account is registered in (based on the sign-up region)<br><br> `webClientParams` (default: `{}`) <br> Custom client params for Webcast API.<br><br>`webClientHeaders` (default: `{}`) <br> Custom request headers passed to [axios](https://github.com/axios/axios).<br><br>`websocketHeaders` (default: `{}`) <br> Custom websocket headers passed to [websocket.client](https://github.com/theturtle32/WebSocket-Node). <br><br>`webClientOptions` (default: `{}`) <br> Custom request options passed to [axios](https://github.com/axios/axios). Here you can specify an `httpsAgent` to use a proxy and a `timeout` value. See [Example](#proxied-connection). <br><br>`wsClientParams` (default: `${}`)<br/> WebSocket parameters to be appended to the connection url. <br><br>`wsClientHeaders` (default: {})<br/> Custom WebSocket headers to be sent when connecting. <br><br>`wsClientOptions` (default: `{}`) <br> Custom websocket options passed to [websocket.client](https://github.com/theturtle32/WebSocket-Node). Here you can specify an `agent` to use a proxy and a `timeout` value. See [Example](#proxied-connection). <br/><br/> `authenticateWs` (default: `false`) <br/> By default, WebSocket connections are not authenticated, even when passing a sessionid, for security. This is because 'signing' (generating the URL) for connecting is done by a 3rd-party freeware service. It must be manually enabled, and you assume the risks associated with sending over a session id when you enable it.<br/><br/>`preferredAgentIds` (default: `[]`)<br/>WebSocket URL generation is done by a 3rd-party service. This option allows you to specify a specific 'agent' on the 3rd-party service to handle the URL generation.<br/><br/>`connectWithUniqueId` (default: `false`)<br/>This option allows the 3rd-party service to determine the Room ID _for_ you, rather than retrieving it through scraping. This may be preferable on low-quality IPs, as it bypasses captchas.<br/><br/>`disableEulerFallbacks` (default: false)<br/>This option disables the Euler Stream API "fallback" routes used by default when scraping fails.<br/><br/>`signedWebSocketProvider` (default: `(props: FetchSignedWebSocketParams) => Promise<ProtoMessageFetchResult>`)<br/> The function responsible for signing (generating a valid WebSocket URL) can be swapped out for your own backend, if you do not want to use the free 3rd-party service bundled into the client that generates them. |

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
import { IGetRateLimits } from '@eulerstream/euler-api-sdk';

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

- [`ControleEvent.CONNECTED`](#connected) or `"connected"`
- [`ControleEvent.DISCONNECTED`](#disconnected) or `"disconnected"`
- [`ControleEvent.STREAM_END`](#streamend) or `"streamEnd"`
- [`ControleEvent.RAW_DATA`](#rawdata) or `"rawData"`
- [`ControleEvent.DECODED_DATA`](#decodeddata) or `"decodedData"`
- [`ControleEvent.WEBSOCKET_CONNECTED`](#websocketconnected) or `"websocketConnected"`
- [`ControleEvent.ERROR`](#error) or `"error"`
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
- [`WebcastEvent.SUBSCRIBE`](#subscribe) or `"subscribe"`
- [`WebcastEvent.FOLLOW`](#follow) or `"follow"`
- [`WebcastEvent.SHARE`](#share) or `"share"`
- [`WebcastEvent.STREAM_END`](#streamend) or `"streamEnd"`
- [`WebcastEvent.ROOM_USER`](#roomuser) or `"roomUser"`
- [`WebcastEvent.EMOTE`](#emote) or `"emote"`
- [`WebcastEvent.FOLLOW`](#follow) or `"follow"`
- [`WebcastEvent.SHARE`](#share) or `"share"`
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

## Control Events

### `connected`

Triggered when the connection is successfully established.

```ts
client.on(
    WebcastEvent.CONNECTED,
    (state: TikTokLiveConnectionState) => console.log('Hurray! Connected!', state)
);
```

### `disconnected`

Triggered when the connection gets disconnected. In that case you can call `connect()` again to have a reconnect logic.
Note that you should wait a little bit before attempting a reconnect to to avoid being rate-limited.

```ts
connection.on(ControlEvent.DISCONNECTED, () => console.log('Disconnected :('));
```

### `streamEnd`

Triggered when the live stream gets terminated by the host. Will also trigger the [`disconnected`](#disconnected) event.

```ts
connection.on(ControlEvent.STREAM_END, ({ action }: { action: ControlAction }) => {
    if (action === ControlAction.CONTROL_ACTION_STREAM_ENDED) {
        console.log('Stream ended by user');
    }
    if (action === ControlAction.CONTROL_ACTION_STREAM_SUSPENDED) {
        console.log('Stream ended by platform moderator (ban)');
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
    console.log('WebSocket Client:', websocketClient.connection);
});
```

### `websocketdata`

Triggered every time a WebSocket message arrives. This is the same as the `rawData` event but the binary object is

> No example is available yet. Create a [pull request](https://github.com/zerodytrash/TikTok-Live-Connector/pulls) to
> add one!

### `error`

General error event. You should handle this.

```ts
connection.on(ControlEvent.ERROR, err => {
    console.error('Error!', err);
});
```

## Message Events

### `member`

Triggered every time a new viewer joins the live stream.

```ts
connection.on(WebcastEvent.MEMBER, (data: WebcastMemberMessage) => {
    console.log(`${data.uniqueId} joins the stream!`);
});
```

### `chat`

Triggered every time a new chat comment arrives.

```ts
connection.on(WebcastEvent.CHAT, (data: WebcastChatMessage) => {
    console.log(`${data.uniqueId} -> ${data.comment}`);
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
connection.on(WebcastEvent.GIFT, (event: WebcastGiftMessage) => {
    if (data.giftType === 1 && !data.repeatEnd) {
        // Streak in progress => show only temporary
        console.log(`${data.uniqueId} is sending gift ${data.giftName} x${data.repeatCount}`);
    } else {
        // Streak ended or non-streakable gift => process the gift with final repeat_count
        console.log(`${data.uniqueId} has sent gift ${data.giftName} x${data.repeatCount}`);
    }
});
```

### `roomUser`

Triggered every time a statistic message arrives. This message currently contains the viewer count and a top gifter
list.

```ts
connection.on(WebcastEvent.ROOM_USER, data => {
    console.log(`Viewer Count: ${data.viewerCount}`);
});
```

### `like`

Triggered when a viewer sends likes to the streamer. For streams with many viewers, this event is not always triggered
by TikTok.

```ts
connection.on(WebcastEvent.LIKE, data => {
    console.log(`${data.uniqueId} sent ${data.likeCount} likes, total likes: ${data.totalLikeCount}`);
});
```

### `social`

Triggered every time someone shares the stream or follows the host.

```ts
connection.on(WebcastEvent.SOCIAL, data => {
    console.log('social event data:', data);
});
```

### `emote`

Triggered every time a subscriber sends an emote (sticker).

```ts
connection.on(WebcastEvent.EMOTE, (data: WebcastEmoteChatMessage) => {
    console.log('emote received', data);
});
```

### `envelope`

Triggered every time someone sends a treasure chest.

```ts
connection.on(WebcastEvent.ENVELOPE, data => {
    console.log('envelope received', data);
});
```

### `questionNew`

Triggered every time someone asks a new question via the question feature.

```ts
connection.on(WebcastEvent.QUESTION_NEW, data => {
    console.log(`${data.uniqueId} asks ${data.questionText}`);
});
```

### `linkMicBattle`

Triggered every time a battle starts.

```ts
connection.on(WebcastEvent.LINK_MIC_BATTLE, (data) => {
    console.log(`New Battle: ${data.battleUsers[0].uniqueId} VS ${data.battleUsers[1].uniqueId}`);
});
```

### `linkMicArmies`

Triggered every time a battle participant receives points. Contains the current status of the battle and the army that
suported the group.

```ts
connection.on(WebcastEvent.LINK_MIC_ARMIES, (data) => {
    console.log('linkMicArmies', data);
});
```

### `liveIntro`

Triggered when a live intro message appears.

```ts
connection.on(WebcastEvent.LIVE_INTRO, (msg) => {
    console.log(msg);
});
```

### `subscribe`

Triggers when a user creates a subscription.

```ts
connection.on(WebcastEvent.SUBSCRIBE, (data) => {
    console.log(data.uniqueId, 'subscribed!');
});
```

### Custom Events

These events are based on message events.

### `follow`

Triggers when a user follows the streamer. Based on `social` event.

```ts
connection.on(WebcastEvent.FOLLOW, (data) => {
    console.log(data.uniqueId, 'followed!');
});
```

### `share`

Triggers when a user shares the stream. Based on `social` event.

```ts
connection.on(WebcastEvent.SHARE, (data) => {
    console.log(data.uniqueId, "shared the stream!");
})
```

### `goalUpdate`

Triggered when a channel goal is updated.

> No example is available yet. Create a [pull request](https://github.com/zerodytrash/TikTok-Live-Connector/pulls) to
> add one!

### `roomMessage`

No information available.

> No example is available yet. Create a [pull request](https://github.com/zerodytrash/TikTok-Live-Connector/pulls) to
> add one!

### `captionMessage`

No information available.

> No example is available yet. Create a [pull request](https://github.com/zerodytrash/TikTok-Live-Connector/pulls) to
> add one!

### `imDelete`

Triggered when a message is deleted in the chat.

> No example is available yet. Create a [pull request](https://github.com/zerodytrash/TikTok-Live-Connector/pulls) to
> add one!

### `inRoomBanner`

Triggered when a banner is shown in the room.

> No example is available yet. Create a [pull request](https://github.com/zerodytrash/TikTok-Live-Connector/pulls) to
> add one!

### `rankUpdate`

Triggered when a ranking update is received.

> No example is available yet. Create a [pull request](https://github.com/zerodytrash/TikTok-Live-Connector/pulls) to
> add one!

### `pollMessage`

Triggered when a poll-related message is sent in the room.

> No example is available yet. Create a [pull request](https://github.com/zerodytrash/TikTok-Live-Connector/pulls) to
> add one!

### `rankText`

Triggered when text related to rankings is displayed.

> No example is available yet. Create a [pull request](https://github.com/zerodytrash/TikTok-Live-Connector/pulls) to
> add one!

### `linkMicBattlePunishFinish`

Triggered when a link mic battle punishment is finished.

> No example is available yet. Create a [pull request](https://github.com/zerodytrash/TikTok-Live-Connector/pulls) to
> add one!

### `linkMicBattleTask`

Triggered when a new task is issued during a link mic battle.

> No example is available yet. Create a [pull request](https://github.com/zerodytrash/TikTok-Live-Connector/pulls) to
> add one!

### `linkMicFanTicketMethod`

Triggered when a fan ticket-related method is invoked during a link mic session.

> No example is available yet. Create a [pull request](https://github.com/zerodytrash/TikTok-Live-Connector/pulls) to
> add one!

### `linkMicMethod`

Triggered when a link mic method is used.

> No example is available yet. Create a [pull request](https://github.com/zerodytrash/TikTok-Live-Connector/pulls) to
> add one!

### `unauthorizedMember`

Triggered when an unauthorized member tries to perform a restricted action.

> No example is available yet. Create a [pull request](https://github.com/zerodytrash/TikTok-Live-Connector/pulls) to
> add one!

### `oecLiveShopping`

Triggered when a live shopping event occurs.

> No example is available yet. Create a [pull request](https://github.com/zerodytrash/TikTok-Live-Connector/pulls) to
> add one!

### `msgDetect`

Triggered when the system detects a message for moderation or other purposes.

> No example is available yet. Create a [pull request](https://github.com/zerodytrash/TikTok-Live-Connector/pulls) to
> add one!

### `linkMessage`

Triggered during a link mic session for various communication purposes.

> No example is available yet. Create a [pull request](https://github.com/zerodytrash/TikTok-Live-Connector/pulls) to
> add one!

### `roomVerify`

Triggered when the system performs room verification.

> No example is available yet. Create a [pull request](https://github.com/zerodytrash/TikTok-Live-Connector/pulls) to
> add one!

### `linkLayer`

Triggered when a new link mic layer is added or updated.

> No example is available yet. Create a [pull request](https://github.com/zerodytrash/TikTok-Live-Connector/pulls) to
> add one!

### `roomPin`

Triggered when a message is pinned in the chat room.

> No example is available yet. Create a [pull request](https://github.com/zerodytrash/TikTok-Live-Connector/pulls) to
> add one!

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
