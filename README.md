# TikTok-Live-Connector

A Node.js library to receive live stream events such as comments and gifts in realtime
from [TikTok LIVE](https://www.tiktok.com/live) by connecting to TikTok's internal Webcast push service.
This package includes a wrapper that connects to the Webcast service using just the username (`@uniqueId`).
This allows you to connect to your own live chat as well as the live chat of other streamers. No credentials are
required. Besides [Chat Comments](#chat), other events such
as [Members Joining](#member), [Gifts](#gift), [Subscriptions](#subscribe), [Viewers](#roomuser), [Follows](#social), [Shares](#social), [Questions](#questionnew), [Likes](#like)
and [Battles](#linkmicbattle) can be tracked.

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

### 📌 2.0.0 Now Available - Upgrade Now!

We are thrilled to announce that the 2.0.0 release of TikTok Live Connector is now available!
This release converts the package to exclusively typescript-based, also providing complete backwards compatibility for users.

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
- [Contributing](#contributing)

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

| Param Name | Required | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
|------------|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| uniqueId   | Yes      | The unique username of the broadcaster. You can find this name in the URL.<br>Example: `https://www.tiktok.com/@officialgeilegisela/live` => `officialgeilegisela`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| options    | No       | Here you can set the following optional connection properties. If you do not specify a value, the default value will be used.<br><br>`processInitialData` (default: `true`) <br> Define if you want to process the initital data which includes old messages of the last seconds.<br><br>`signApiKey` (default: `null`) Configure a Sign API key. This API key will be used to generate the URL to facilitate connections to the TikTok LIVE WebSocket server. <br><br> `fetchRoomInfoOnConnect` (default: `true`) <br> Define if you want to fetch all room information on [`connect()`](#methods). If this option is enabled, the connection to offline rooms will be prevented. If enabled, the connect result contains the room info via the `roomInfo` attribute. You can also manually retrieve the room info (even in an unconnected state) using the [`getRoomInfo()`](#methods) function.<br><br>`enableExtendedGiftInfo` (default: `false`) <br> Define if you want to receive extended information about gifts like gift name, cost and images. This information will be provided at the [gift event](#gift). <br><br>`requestPollingIntervalMs` (default: `1000`) <br> Request polling interval if WebSocket is not used.<br><br>`sessionId` (default: `null`) <br> Here you can specify the current Session ID of your TikTok account <br><br>`webClientParams` (default: `{}`) <br> Custom client params for Webcast API.<br><br>`webClientHeaders` (default: `{}`) <br> Custom request headers passed to [axios](https://github.com/axios/axios).<br><br>`websocketHeaders` (default: `{}`) <br> Custom websocket headers passed to [websocket.client](https://github.com/theturtle32/WebSocket-Node). <br><br>`webClientOptions` (default: `{}`) <br> Custom request options passed to [axios](https://github.com/axios/axios). Here you can specify an `httpsAgent` to use a proxy and a `timeout` value. See [Example](#proxied-connection). <br><br>`wsClientParams` (default: `${}`)<br/> WebSocket parameters to be appended to the connection url. <br><br>`wsClientHeaders` (default: {})<br/> Custom WebSocket headers to be sent when connecting. <br><br>`wsClientOptions` (default: `{}`) <br> Custom websocket options passed to [websocket.client](https://github.com/theturtle32/WebSocket-Node). Here you can specify an `agent` to use a proxy and a `timeout` value. See [Example](#proxied-connection). <br/><br/> `authenticateWs` (default: `false`) <br/> By default, WebSocket connections are not authenticated, even when passing a sessionid, for security. This is because 'signing' (generating the URL) for connecting is done by a 3rd-party freeware service. It must be manually enabled, and you assume the risks associated with sending over a session id when you enable it.<br/><br/>`preferredAgentIds` (default: `[]`)<br/>WebSocket URL generation is done by a 3rd-party service. This option allows you to specify a specific 'agent' on the 3rd-party service to handle the URL generation.<br/><br/>`connectWithUniqueId` (default: `false`)<br/>This option allows the 3rd-party service to determine the Room ID _for_ you, rather than retrieving it through scraping. This may be preferable on low-quality IPs, as it bypasses captchas.<br/><br/>`logFetchFallbackErrors` (default: false)<br/>This option logs exceptions to the console when fallbacks are required to resolve a Room Id from a uniqueId.<br/><br/>`signedWebSocketProvider` (default: `(props: FetchSignedWebSocketParams) => Promise<WebcastResponse>`)<br/> The function responsible for signing (generating a valid WebSocket URL) can be swapped out for your own backend, if you do not want to use the free 3rd-party service bundled into the client that generates them. |

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
| sendMessage(`<content>`)  | Send a message to a TikTok LIVE chat. Simply speciy the message you want to send, and voila! Requires an API key. <br>[Example](#send-messages)                                                                                                                                                                                                                         |
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

## Control Events

### `connected`

Triggered when the connection is successfully established.

```ts
client.on(
    WebcastEvent.CONNECTED,
    (state: TikTokLiveConnectionState) => console.log('Hurray! Connected!', state)
);
```

<details><summary>⚡ See Data Structure</summary><p>

```json5
{
    isConnected: true,
    upgradedToWebsocket: true,
    roomId: '7137682087200557829',
    roomInfo: {
        AnchorABMap: {
        },
        admin_user_ids: [],
        anchor_scheduled_time_text: '',
        anchor_share_text: '',
        anchor_tab_type: 7,
        answering_question_content: '',
        app_id: 1233,
        audio_mute: 0,
        auto_cover: 0,
        book_end_time: 0,
        book_time: 0,
        business_live: 0,
        challenge_info: '',
        client_version: 250701,
        comment_has_text_emoji_emote: 0,
        comment_name_mode: 0,
        commerce_info: {
            commerce_permission: 0,
            oec_live_enter_room_init_data: '',
            use_async_load: false
        },
        common_label_list: '',
        content_tag: '',
        cover: {
            avg_color: '',
            height: 0,
            image_type: 0,
            is_animated: false,
            open_web_url: '',
            uri: '720x720/tos-maliva-avt-0068/4e64db7f7c37caf9b2df71df8580a9b0',
            url_list: [
                "<Array>"
            ],
            width: 0
        },
        create_time: 1661871149,
        deco_list: [],
        deprecated10: '',
        deprecated11: '',
        deprecated12: '',
        deprecated13: '',
        deprecated14: 0,
        deprecated15: 0,
        deprecated16: 0,
        deprecated17: [],
        deprecated18: 0,
        deprecated19: '',
        deprecated195: false,
        deprecated2: '',
        deprecated20: 0,
        deprecated21: false,
        deprecated22: 0,
        deprecated23: '',
        deprecated24: 0,
        deprecated26: '',
        deprecated28: '',
        deprecated3: {
        },
        deprecated30: '',
        deprecated31: false,
        deprecated32: '',
        deprecated35: 0,
        deprecated36: 0,
        deprecated39: '',
        deprecated4: 0,
        deprecated41: 0,
        deprecated43: false,
        deprecated44: 0,
        deprecated5: false,
        deprecated6: '',
        deprecated7: 0,
        deprecated8: '',
        deprecated9: '',
        disable_preload_stream: false,
        drawer_tab_position: '',
        effect_info: [],
        existed_commerce_goods: false,
        fansclub_msg_style: 2,
        feed_room_label: {
            avg_color: '#F1FFEB',
            height: 0,
            image_type: 0,
            is_animated: false,
            open_web_url: '',
            uri: 'webcast-sg/2ea90002aca1159b5c67',
            url_list: [
                "<Array>"
            ],
            width: 0
        },
        feed_room_labels: [],
        filter_msg_rules: [],
        finish_reason: 0,
        finish_time: 1661878842,
        finish_url: '',
        finish_url_v2: '',
        follow_msg_style: 2,
        forum_extra_data: '',
        game_tag: [],
        gift_msg_style: 2,
        gift_poll_vote_enabled: false,
        group_source: 0,
        has_commerce_goods: false,
        have_wishlist: false,
        hot_sentence_info: '',
        id: 7137682087200558000,
        id_str: '7137682087200557829',
        indicators: [],
        interaction_question_version: 0,
        introduction: '',
        is_gated_room: false,
        is_replay: false,
        is_show_user_card_switch: false,
        last_ping_time: 1661878842,
        layout: 0,
        like_count: 0,
        link_mic: {
            audience_id_list: [],
            battle_scores: [],
            battle_settings: [
                "<Object>"
            ],
            channel_id: 0,
            followed_count: 0,
            linked_user_list: [],
            multi_live_enum: 1,
            rival_anchor_id: 0,
            show_user_list: []
        },
        linker_map: {
        },
        linkmic_layout: 0,
        live_distribution: [],
        live_id: 12,
        live_reason: '',
        live_room_mode: 0,
        live_sub_only: 0,
        live_type_audio: false,
        live_type_linkmic: false,
        live_type_normal: true,
        live_type_sandbox: false,
        live_type_screenshot: false,
        live_type_social_live: false,
        live_type_third_party: false,
        living_room_attrs: {
            admin_flag: 0,
            rank: 0,
            room_id: 7137682087200558000,
            room_id_str: '7137682087200557829',
            silence_flag: 0
        },
        lottery_finish_time: 0,
        mosaic_status: 0,
        os_type: 1,
        owner: {
            allow_find_by_contacts: false,
            allow_others_download_video: false,
            allow_others_download_when_sharing_video: false,
            allow_share_show_profile: false,
            allow_show_in_gossip: false,
            allow_show_my_action: false,
            allow_strange_comment: false,
            allow_unfollower_comment: false,
            allow_use_linkmic: false,
            avatar_large: [
                "<Object>"
            ],
            avatar_medium: [
                "<Object>"
            ],
            avatar_thumb: [
                "<Object>"
            ],
            badge_image_list: [],
            badge_list: [],
            bg_img_url: '',
            bio_description: 'HH📍🇩🇪تابعوني انستغرام\nاذا سقطت سأخذ الجميع معي\n👻Alin_issa22👻',
            block_status: 0,
            border_list: [],
            comment_restrict: 0,
            commerce_webcast_config_ids: [],
            constellation: '',
            create_time: 0,
            deprecated1: 0,
            deprecated12: 0,
            deprecated13: 0,
            deprecated15: 0,
            deprecated16: false,
            deprecated17: false,
            deprecated18: '',
            deprecated19: false,
            deprecated2: 0,
            deprecated21: 0,
            deprecated28: false,
            deprecated29: '',
            deprecated3: 0,
            deprecated4: 0,
            deprecated5: '',
            deprecated6: 0,
            deprecated7: '',
            deprecated8: 0,
            disable_ichat: 0,
            display_id: 'alin.i7',
            enable_ichat_img: 0,
            exp: 0,
            fan_ticket_count: 0,
            fold_stranger_chat: false,
            follow_info: [
                "<Object>"
            ],
            follow_status: 0,
            ichat_restrict_type: 0,
            id: 6672446849804223000,
            id_str: '6672446849804223493',
            is_follower: false,
            is_following: false,
            link_mic_stats: 0,
            media_badge_image_list: [],
            modify_time: 1661427082,
            need_profile_guide: false,
            new_real_time_icons: [],
            nickname: '🦋ALIN🦋',
            own_room: [
                "<Object>"
            ],
            pay_grade: [
                "<Object>"
            ],
            pay_score: 0,
            pay_scores: 0,
            push_comment_status: false,
            push_digg: false,
            push_follow: false,
            push_friend_action: false,
            push_ichat: false,
            push_status: false,
            push_video_post: false,
            push_video_recommend: false,
            real_time_icons: [],
            sec_uid: 'MS4wLjABAAAAuUKuWAiw0GQO2_zOeyns0YCBRK7ztdoDWAAQ6gPFLBNSdTs-g5BsgScwTD9jWeK_',
            secret: 0,
            share_qrcode_uri: '',
            special_id: '',
            status: 1,
            ticket_count: 0,
            top_fans: [],
            top_vip_no: 0,
            upcoming_event_list: [],
            user_attr: [
                "<Object>"
            ],
            user_role: 0,
            verified: false,
            verified_content: '',
            verified_reason: '',
            with_car_management_permission: false,
            with_commerce_permission: false,
            with_fusion_shop_entry: false
        },
        owner_device_id: 0,
        owner_device_id_str: '',
        owner_user_id: 6672446849804223000,
        owner_user_id_str: '',
        pre_enter_time: 0,
        preview_flow_tag: 0,
        ranklist_audience_type: 0,
        relation_tag: '',
        replay: true,
        room_audit_status: 0,
        room_auth: {
            Banner: 1,
            BroadcastMessage: 0,
            Chat: true,
            ChatL2: false,
            ChatSubOnly: false,
            CommercePermission: 0,
            CustomizablePoll: 0,
            Danmaku: false,
            Digg: true,
            DonationSticker: 2,
            EventPromotion: 0,
            Gift: true,
            GiftAnchorMt: 1,
            GiftPoll: 0,
            GoldenEnvelope: 0,
            GoldenEnvelopeActivity: 0,
            InteractionQuestion: true,
            Landscape: 2,
            LandscapeChat: 0,
            LuckMoney: true,
            Pictionary: 0,
            Poll: 0,
            Promote: false,
            PromoteOther: 0,
            Props: false,
            PublicScreen: 1,
            QuickChat: 0,
            Rank: 0,
            RoomContributor: false,
            Share: true,
            ShareEffect: 0,
            ShoppingRanking: 0,
            UserCard: true,
            UserCount: 0,
            Viewers: false,
            deprecated1: false,
            deprecated2: 0,
            deprecated3: 0,
            deprecated4: 0,
            deprecated5: 0,
            deprecated6: 0,
            deprecated7: 0,
            deprecated8: 0,
            deprecated9: 0,
            transaction_history: 1,
            use_user_pv: false
        },
        room_create_ab_param: '',
        room_layout: 0,
        room_sticker_list: [],
        room_tabs: [],
        room_tag: 0,
        scroll_config: '',
        search_id: 0,
        share_msg_style: 2,
        share_url: 'https://m.tiktok.com/share/live/7137682087200557829/?language=en',
        short_title: '',
        short_touch_items: [],
        social_interaction: {
            linkmic_scene_linker: {
            },
            multi_live: [
                "<Object>"
            ]
        },
        start_time: 0,
        stats: {
            deprecated1: 0,
            deprecated2: '',
            digg_count: 0,
            enter_count: 0,
            fan_ticket: 0,
            follow_count: 686,
            gift_uv_count: 0,
            id: 7137682087200558000,
            id_str: '7137682087200557829',
            like_count: 0,
            replay_fan_ticket: 0,
            replay_viewers: 64076,
            share_count: 0,
            total_user: 104582,
            total_user_desp: '',
            user_count_composition: [
                "<Object>"
            ],
            watermelon: 0
        },
        status: 2,
        sticker_list: [],
        stream_id: 2993830046178738000,
        stream_id_str: '2993830046178738249',
        stream_status: 0,
        stream_url: {
            candidate_resolution: [
                "<Array>"
            ],
            complete_push_urls: [],
            default_resolution: 'ORIGION',
            extra: [
                "<Object>"
            ],
            flv_pull_url: [
                "<Object>"
            ],
            flv_pull_url_params: [
                "<Object>"
            ],
            hls_pull_url: 'https://pull-hls-f16-va01.tiktokcdn.com/stage/stream-2993830046178738249_or4/index.m3u8',
            hls_pull_url_map: {
            },
            hls_pull_url_params: '{"VCodec":"h264"}',
            id: 2993830046178738000,
            id_str: '2993830046178738249',
            live_core_sdk_data: [
                "<Object>"
            ],
            provider: 0,
            push_urls: [],
            resolution_name: [
                "<Object>"
            ],
            rtmp_pull_url: 'https://pull-f5-va01.tiktokcdn.com/stage/stream-2993830046178738249_or4.flv',
            rtmp_pull_url_params: '{"VCodec":"h264"}',
            rtmp_push_url: '',
            rtmp_push_url_params: '',
            stream_control_type: 0
        },
        stream_url_filtered_info: {
            is_gated_room: false,
            is_paid_event: false
        },
        title: 'انا جيت😍 🥰',
        top_fans: [
            [
                "<Object>"
            ],
            [
                "<Object>"
            ],
            [
                "<Object>"
            ]
        ],
        use_filter: false,
        user_count: 1136,
        user_share_text: '',
        video_feed_tag: '',
        webcast_comment_tcs: 0,
        webcast_sdk_version: 0,
        with_draw_something: false,
        with_ktv: false,
        with_linkmic: true
    },
    availableGifts: []
}
```

</p></details>

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

<details><summary>⚡ See Data Structure</summary><p>

```json5
{
    actionId: 1,
    userId: "6813181309701719620",
    secUid: "<redacted>",
    uniqueId: "zerodytester",
    nickname: "Zerody Tester",
    profilePictureUrl: "https://p16-sign-va.tiktokcdn.com/tos-useast2a-avt...webp",
    followRole: 0,
    // 0 = none; 1 = follower; 2 = friends
    userBadges: [
        {
            type: "pm_mt_moderator_im",
            name: "Moderator"
        },
        {
            type: "image",
            displayType: 1,
            url: "https://p19-webcast.tiktokcdn.com/webcast-va/rankl...image"
        },
        {
            type: "image",
            displayType: 1,
            url: "https://p19-webcast.tiktokcdn.com/webcast-va/....~...image"
        }
    ],
    userDetails: {
        createTime: "0",
        bioDescription: "",
        profilePictureUrls: [
            "https://p16-sign-va.tiktokcdn.com/tos-useast2a-avt...webp",
            "https://p16-sign-va.tiktokcdn.com/tos-useast2a-avt...webp",
            "https://p16-sign-va.tiktokcdn.com/tos-useast2a-avt...jpeg"
        ]
    },
    followInfo: {
        followingCount: 2139,
        followerCount: 853,
        followStatus: 0,
        pushStatus: 0
    },
    isModerator: false,
    isNewGifter: false,
    isSubscriber: false,
    topGifterRank: null,
    msgId: "7137750885996120859",
    createTime: "1661887134195",
    displayType: "live_room_enter_toast",
    label: "{0:user} joined"
}
```

</p></details>

### `chat`

Triggered every time a new chat comment arrives.

```ts
connection.on(WebcastEvent.CHAT, (data: WebcastChatMessage) => {
    console.log(`${data.uniqueId} -> ${data.comment}`);
});
```

<details><summary>⚡ See Data Structure</summary><p>

```json5
{
    comment: "How are you?",
    userId: "6813181309701719620",
    secUid: "<redacted>",
    uniqueId: "zerodytester",
    nickname: "Zerody Tester",
    profilePictureUrl: "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0...webp",
    followRole: 0,
    // 0 = none; 1 = follower; 2 = friends
    userBadges: [
        {
            // Moderator badge
            type: "pm_mt_moderator_im",
            name: "Moderator"
        },
        {
            // Top Gifter badge
            type: "image",
            displayType: 1,
            url: "https://p19-webcast.tiktokcdn.com/webcast-va/rankl...image"
        },
        {
            // Subscriber Badge
            type: "image",
            displayType: 1,
            url: "https://p19-webcast.tiktokcdn.com/webcast-va/....~...image"
        }
    ],
    userDetails: {
        createTime: "0",
        bioDescription: "",
        profilePictureUrls: [
            "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0...webp",
            "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0...webp",
            "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0...jpeg"
        ]
    },
    followInfo: {
        followingCount: 10000,
        followerCount: 606,
        followStatus: 0,
        pushStatus: 0
    },
    isModerator: false,
    isNewGifter: false,
    isSubscriber: false,
    topGifterRank: null,
    msgId: "7137750790064065286",
    createTime: "1661887134718"
}
```

</p></details>

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

<details><summary>⚡ See Data Structure</summary><p>

```json5
{
    // Gift Details
    giftId: 5953,
    repeatCount: 1,
    repeatEnd: true,
    groupId: "1661887131074",
    monitorExtra: {
        anchor_id: 7087613897129494000,
        from_idc: "maliva",
        from_user_id: 7044640112358049000,
        gift_id: 5953,
        gift_type: 1,
        log_id: "20220830191849010192055159174B7670",
        msg_id: 7137749190944230000,
        repeat_count: 1,
        repeat_end: 1,
        room_id: 7137728632142843000,
        send_gift_profit_core_start_ms: 0,
        send_gift_send_message_success_ms: 1661887134397,
        to_user_id: 7087613897129494000
    },
    // Sender Details
    userId: "6813181309701719620",
    secUid: "<redacted>",
    uniqueId: "zerodytester",
    nickname: "Zerody Tester",
    profilePictureUrl: "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0...webp",
    followRole: 0,
    // 0 = none; 1 = follower; 2 = friends
    userBadges: [],
    userDetails: {
        createTime: "0",
        bioDescription: "",
        profilePictureUrls: [
            "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0...webp",
            "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0...webp",
            "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0...jpeg"
        ]
    },
    followInfo: {
        followingCount: 360,
        followerCount: 740,
        followStatus: 0,
        pushStatus: 0
    },
    isModerator: false,
    isNewGifter: false,
    isSubscriber: false,
    topGifterRank: null,
    msgId: "7137749190944230150",
    createTime: "1661887134397",
    displayType: "webcast_aweme_gift_send_message",
    label: "{0:user} sent {1:gift} {2:string}",
    gift: {
        gift_id: 5953,
        repeat_count: 1,
        repeat_end: 1,
        gift_type: 1
    },
    describe: "Sent Nevalyashka doll",
    giftType: 1,
    diamondCount: 25,
    giftName: "Nevalyashka doll",
    giftPictureUrl: "https://p19-webcast.tiktokcdn.com/img/maliva/webca...png",
    timestamp: 1661887134397,
    extendedGiftInfo: {
        // This will be filled when you enable the `enableExtendedGiftInfo` option
    },
    // Receiver Details (can also be a guest broadcaster)
    receiverUserId: "7087613897129493510"
}
```

</p></details>

### `roomUser`

Triggered every time a statistic message arrives. This message currently contains the viewer count and a top gifter
list.

```ts
connection.on(WebcastEvent.ROOM_USER, data => {
    console.log(`Viewer Count: ${data.viewerCount}`);
});
```

<details><summary>⚡ See Data Structure</summary><p>

```json5
{
    topViewers: [
        {
            user: {
                userId: "6822565897317303297",
                secUid: "MS4wLjABAAAALIKFhzvmiCws6B6KWfRgWr5MbyGVPXevakvnP8xc7VLkWtcqNeEe9coyRA74KNxm",
                uniqueId: "linmjh",
                nickname: "gì z má ( ^ㆍㅅㆍ^)",
                profilePictureUrl: "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/to...webp",
                followRole: 0,
                userBadges: [],
                userDetails: {
                    createTime: "1588502711",
                    bioDescription: "",
                    profilePictureUrls: [
                        "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/to...webp",
                        "https://p9-sign-sg.tiktokcdn.com/aweme/100x100/tos...webp",
                        "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/to...jpeg"
                    ]
                },
                followInfo: {
                    followingCount: 781,
                    followerCount: 51,
                    followStatus: 0,
                    pushStatus: 0
                },
                isModerator: false,
                isNewGifter: false,
                isSubscriber: false,
                topGifterRank: null
            },
            coinCount: 0
        },
        {
            user: {
                userId: "6828542044454863874",
                secUid: "MS4wLjABAAAAxP4NgzG7uJz1tcB8o3JN8PxHWej20NJWCHP1IG1PZ0OmQLB6SVORRSoX0Ool4dwj",
                uniqueId: "xuanthainguyen0",
                nickname: "Xuan Thai Nguyen",
                profilePictureUrl: "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/ti...webp",
                followRole: 0,
                userBadges: [],
                userDetails: {
                    createTime: "1593865836",
                    bioDescription: "",
                    profilePictureUrls: [
                        "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/ti...webp",
                        "https://p9-sign-sg.tiktokcdn.com/aweme/100x100/tik...webp",
                        "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/ti...jpeg"
                    ]
                },
                followInfo: {
                    followingCount: 6,
                    followerCount: 6,
                    followStatus: 0,
                    pushStatus: 0
                },
                isModerator: false,
                isNewGifter: false,
                isSubscriber: false,
                topGifterRank: null
            },
            coinCount: 0
        },
        {
            user: {
                userId: "7014684709204624385",
                secUid: "MS4wLjABAAAAnVMJ9MXN5HqjnpyEwgEhjv97Pc_ixtG4Iwnnagbrd99WhEATfhZLW6McX-uErTp9",
                uniqueId: "dyip0c3sbo2t",
                nickname: "Huu Trân572",
                profilePictureUrl: "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/ti...webp",
                followRole: 0,
                userBadges: [],
                userDetails: {
                    createTime: "1640318249",
                    bioDescription: "",
                    profilePictureUrls: [
                        "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/ti...webp",
                        "https://p9-sign-sg.tiktokcdn.com/aweme/100x100/tik...webp",
                        "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/ti...jpeg"
                    ]
                },
                followInfo: {
                    followingCount: 35,
                    followerCount: 21,
                    followStatus: 0,
                    pushStatus: 0
                },
                isModerator: false,
                isNewGifter: false,
                isSubscriber: false,
                topGifterRank: null
            },
            coinCount: 0
        },
        {
            user: {
                userId: "7133413217468187675",
                secUid: "MS4wLjABAAAA2u64n6KnroBOMQo4pR9bLv0twyCIy0X-wd7S__WR4d2VObktWAfs_ck08pjD4hIV",
                uniqueId: "uservay64gw9d5",
                nickname: "uservay64gw9d5",
                profilePictureUrl: "https://p16-sign-va.tiktokcdn.com/tos-useast2a-avt...webp",
                followRole: 0,
                userBadges: [],
                userDetails: {
                    createTime: "1660877330",
                    bioDescription: "",
                    profilePictureUrls: [
                        "https://p16-sign-va.tiktokcdn.com/tos-useast2a-avt...webp",
                        "https://p16-sign-va.tiktokcdn.com/tos-useast2a-avt...jpeg"
                    ]
                },
                followInfo: {
                    followingCount: 2,
                    followerCount: 0,
                    followStatus: 0,
                    pushStatus: 0
                },
                isModerator: false,
                isNewGifter: false,
                isSubscriber: false,
                topGifterRank: null
            },
            coinCount: 0
        },
        {
            user: {
                userId: "6800374961430791170",
                secUid: "MS4wLjABAAAAF3tD_kSi9qas_10I5I5YUIBfXKd0KlKvKTKACzfXS1Wwp04e03xJCTswwzCMRgEu",
                uniqueId: "hungtran0293",
                nickname: "Trần Hùng",
                profilePictureUrl: "https://p16-sign-va.tiktokcdn.com/tos-useast2a-avt...webp",
                followRole: 0,
                userBadges: [],
                userDetails: {
                    createTime: "1585370455",
                    bioDescription: "",
                    profilePictureUrls: [
                        "https://p16-sign-va.tiktokcdn.com/tos-useast2a-avt...webp",
                        "https://p16-sign-va.tiktokcdn.com/tos-useast2a-avt...jpeg"
                    ]
                },
                followInfo: {
                    followingCount: 1735,
                    followerCount: 313,
                    followStatus: 0,
                    pushStatus: 0
                },
                isModerator: false,
                isNewGifter: false,
                isSubscriber: false,
                topGifterRank: null
            },
            coinCount: 0
        }
    ],
    viewerCount: 630
}
```

</p></details>

### `like`

Triggered when a viewer sends likes to the streamer. For streams with many viewers, this event is not always triggered
by TikTok.

```ts
connection.on(WebcastEvent.LIKE, data => {
    console.log(`${data.uniqueId} sent ${data.likeCount} likes, total likes: ${data.totalLikeCount}`);
});
```

<details><summary>⚡ See Data Structure</summary><p>

```json5
{
    likeCount: 6,
    // likes given by the user (taps on screen)
    totalLikeCount: 21349,
    // likes that this stream has received in total (from all users)
    userId: "6813181309701719620",
    secUid: "<redacted>",
    uniqueId: "zerodytester",
    nickname: "Zerody Tester",
    profilePictureUrl: "https://p16-sign.tiktokcdn-us.com/tos-useast5-avt-...webp",
    followRole: 0,
    // 0 = none; 1 = follower; 2 = friends,
    userBadges: [
        {
            type: "pm_mt_moderator_im",
            name: "Moderator"
        },
        {
            type: "image",
            displayType: 1,
            url: "https://p19-webcast.tiktokcdn.com/webcast-va/rankl...image"
        },
        {
            type: "image",
            displayType: 1,
            url: "https://p19-webcast.tiktokcdn.com/webcast-va/....~...image"
        }
    ],
    userDetails: {
        createTime: "0",
        bioDescription: "",
        profilePictureUrls: [
            "https://p16-sign.tiktokcdn-us.com/tos-useast5-avt-...webp",
            "https://p16-sign.tiktokcdn-us.com/tos-useast5-avt-...webp",
            "https://p19-sign.tiktokcdn-us.com/tos-useast5-avt-...webp",
            "https://p16-sign.tiktokcdn-us.com/tos-useast5-avt-...jpeg"
        ]
    },
    followInfo: {
        followingCount: 617,
        followerCount: 112,
        followStatus: 1,
        pushStatus: 0
    },
    isModerator: false,
    isNewGifter: false,
    isSubscriber: false,
    topGifterRank: null,
    msgId: "7137750883651619630",
    createTime: "1661887134554",
    displayType: "pm_mt_msg_viewer",
    label: "{0:user} liked the LIVE"
}
```

</p></details>

### `social`

Triggered every time someone shares the stream or follows the host.

```ts
connection.on(WebcastEvent.SOCIAL, data => {
    console.log('social event data:', data);
});
```

<details><summary>⚡ See Data Structure</summary><p>

```json5
{
    userId: "6813181309701719620",
    secUid: "<redacted>",
    uniqueId: "zerodytester",
    nickname: "Zerody Tester",
    profilePictureUrl: "https://p16-sign.tiktokcdn-us.com/tos-useast5-avt-...webp",
    followRole: 1,
    userBadges: [],
    userDetails: {
        createTime: "0",
        bioDescription: "",
        profilePictureUrls: [
            "https://p16-sign.tiktokcdn-us.com/tos-useast5-avt-...webp",
            "https://p16-sign.tiktokcdn-us.com/tos-useast5-avt-...webp",
            "https://p19-sign.tiktokcdn-us.com/tos-useast5-avt-...webp",
            "https://p16-sign.tiktokcdn-us.com/tos-useast5-avt-...jpeg"
        ]
    },
    followInfo: {
        followingCount: 277,
        followerCount: 96,
        followStatus: 1,
        pushStatus: 0
    },
    isModerator: false,
    isNewGifter: false,
    isSubscriber: false,
    topGifterRank: null,
    msgId: "7137750889884076842",
    createTime: "1661887134629",
    displayType: "pm_main_follow_message_viewer_2",
    // or pm_mt_guidance_share
    label: "{0:user} followed the host"
}
```

</p></details>

### `emote`

Triggered every time a subscriber sends an emote (sticker).

```ts
connection.on(WebcastEvent.EMOTE, (data: WebcastEmoteChatMessage) => {
    console.log('emote received', data);
});
```

<details><summary>⚡ See Data Structure</summary><p>

```json5
{
    userId: "6813181309701719620",
    secUid: "<redacted>",
    uniqueId: "zerodytester",
    nickname: "Zerody Tester",
    profilePictureUrl: "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/to...webp",
    followRole: 0,
    // 0 = none; 1 = follower; 2 = friends,
    userBadges: [],
    userDetails: {
        createTime: "0",
        bioDescription: "",
        profilePictureUrls: [
            "https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-00...webp",
            "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/to...webp",
            "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/to...jpeg"
        ]
    },
    followInfo: {
        followingCount: 14,
        followerCount: 6,
        followStatus: 1,
        pushStatus: 0
    },
    isModerator: false,
    isNewGifter: false,
    isSubscriber: true,
    topGifterRank: null,
    emoteId: "7121025198379731714",
    emoteImageUrl: "https://p19-webcast.tiktokcdn.com/webcast-sg/61964...image"
}
```

</p></details>

### `envelope`

Triggered every time someone sends a treasure chest.

```ts
connection.on(WebcastEvent.ENVELOPE, data => {
    console.log('envelope received', data);
});
```

<details><summary>⚡ See Data Structure</summary><p>

```json5
{
    userId: "6813181309701719620",
    secUid: "<redacted>",
    uniqueId: "zerodytester",
    nickname: "Zerody Tester",
    profilePictureUrl: "https://p16-webcast.tiktokcdn.com/img/alisg/webcas...png",
    followRole: 0,
    // 0 = none; 1 = follower; 2 = friends
    userBadges: [],
    userDetails: {
        createTime: "0",
        bioDescription: "",
        profilePictureUrls: [
            "https://p16-webcast.tiktokcdn.com/img/alisg/webcas...png",
            "https://p19-webcast.tiktokcdn.com/img/alisg/webcas...png"
        ]
    },
    followInfo: {
        followingCount: 828,
        followerCount: 1353,
        followStatus: 0,
        pushStatus: 0
    },
    isModerator: false,
    isNewGifter: false,
    isSubscriber: false,
    topGifterRank: null,
    coins: 20,
    canOpen: 20,
    timestamp: 1661887422
}
```

</p></details>

### `questionNew`

Triggered every time someone asks a new question via the question feature.

```ts
connection.on(WebcastEvent.QUESTION_NEW, data => {
    console.log(`${data.uniqueId} asks ${data.questionText}`);
});
```

<details><summary>⚡ See Data Structure</summary><p>

```json5
{
    questionText: "Do you know why TikTok has such a complicated API?",
    userId: "6813181309701719620",
    secUid: "<redacted>",
    uniqueId: "zerodytester",
    nickname: "Zerody Tester",
    profilePictureUrl: "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0...webp",
    followRole: 0,
    // 0 = none; 1 = follower; 2 = friends
    userBadges: [],
    userDetails: {
        createTime: "0",
        bioDescription: "",
        profilePictureUrls: [
            "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0...webp",
            "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0...webp",
            "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0...jpeg"
        ]
    },
    followInfo: {
        followingCount: 982,
        followerCount: 175,
        followStatus: 0,
        pushStatus: 0
    },
    isModerator: false,
    isNewGifter: false,
    isSubscriber: false,
    topGifterRank: null
}
```

</p></details>

### `linkMicBattle`

Triggered every time a battle starts.

```ts
connection.on(WebcastEvent.LINK_MIC_BATTLE, (data) => {
    console.log(`New Battle: ${data.battleUsers[0].uniqueId} VS ${data.battleUsers[1].uniqueId}`);
});
```

<details><summary>⚡ See Data Structure</summary><p>

```json5
{
    battleUsers: [
        {
            userId: "6901252963970515973",
            // Host
            uniqueId: "growsa_fluffynation",
            nickname: "GrowSA_FluffyNation",
            profilePictureUrl: "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0...webp",
            userBadges: [],
            userDetails: {
                profilePictureUrls: [
                    "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0...webp",
                    "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0...jpeg"
                ]
            },
            isModerator: false,
            isNewGifter: false,
            isSubscriber: false,
            topGifterRank: null
        },
        {
            userId: "262781145296064512",
            // Guest
            uniqueId: "real_martinpinkysmith",
            nickname: "Martin Pinky Smith",
            profilePictureUrl: "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/to...webp",
            userBadges: [],
            userDetails: {
                profilePictureUrls: [
                    "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/to...webp",
                    "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/to...jpeg"
                ]
            },
            isModerator: false,
            isNewGifter: false,
            isSubscriber: false,
            topGifterRank: null
        }
    ]
}
```

</p></details>

### `linkMicArmies`

Triggered every time a battle participant receives points. Contains the current status of the battle and the army that
suported the group.

```ts
connection.on(WebcastEvent.LINK_MIC_ARMIES, (data) => {
    console.log('linkMicArmies', data);
});
```

<details><summary>⚡ See Data Structure</summary><p>

```json5
{
    battleStatus: 1,
    battleArmies: [
        {
            hostUserId: "6842213780475085829",
            points: 0,
            participants: []
        },
        {
            hostUserId: "6722878711857579013",
            points: 33,
            participants: [
                {
                    userId: "7122168301669204994",
                    secUid: "",
                    nickname: "🦋",
                    profilePictureUrl: null,
                    userBadges: [],
                    userDetails: {
                        createTime: "0",
                        bioDescription: ""
                    },
                    isModerator: false,
                    isNewGifter: false,
                    isSubscriber: false,
                    topGifterRank: null
                },
                {
                    userId: "7112729060212966406",
                    secUid: "",
                    nickname: "ealkaabi44",
                    profilePictureUrl: null,
                    userBadges: [],
                    userDetails: {
                        createTime: "0",
                        bioDescription: ""
                    },
                    isModerator: false,
                    isNewGifter: false,
                    isSubscriber: false,
                    topGifterRank: null
                },
                {
                    userId: "7006435669158708229",
                    secUid: "",
                    nickname: "worood🦁 🌹🌹🌹🌹",
                    profilePictureUrl: null,
                    userBadges: [],
                    userDetails: {
                        createTime: "0",
                        bioDescription: ""
                    },
                    isModerator: false,
                    isNewGifter: false,
                    isSubscriber: false,
                    topGifterRank: null
                }
            ]
        }
    ]
}
```

</p></details>

### `liveIntro`

Triggered when a live intro message appears.

```ts
connection.on(WebcastEvent.LIVE_INTRO, (msg) => {
    console.log(msg);
});
```

<details><summary>⚡ See Data Structure</summary><p>

```json5
{
    id: "1658723381",
    description: "welcome to my broadcast!",
    userId: "6813181309701719620",
    secUid: "<redacted>",
    uniqueId: "zerodytester",
    nickname: "Zerody Tester",
    profilePictureUrl: "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0...webp",
    followRole: 0,
    userBadges: [
        {
            type: "pm_mt_moderator_im",
            name: "Moderator"
        },
        {
            type: "image",
            displayType: 1,
            url: "https://p19-webcast.tiktokcdn.com/webcast-va/rankl...image"
        },
        {
            type: "image",
            displayType: 1,
            url: "https://p19-webcast.tiktokcdn.com/webcast-va/....~...image"
        }
    ],
    userDetails: {
        createTime: "0",
        bioDescription: "",
        profilePictureUrls: [
            "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0...webp",
            "https://p77-sign-va.tiktokcdn.com/tos-maliva-avt-0...webp",
            "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0...jpeg"
        ]
    },
    followInfo: {
        followingCount: 886,
        followerCount: 57141,
        followStatus: 0,
        pushStatus: 0
    },
    isModerator: false,
    isNewGifter: false,
    isSubscriber: false,
    topGifterRank: null
}
```

</p></details>

### `subscribe`

Triggers when a user creates a subscription.

```ts
connection.on(WebcastEvent.SUBSCRIBE, (data) => {
    console.log(data.uniqueId, 'subscribed!');
});
```

<details><summary>⚡ See Data Structure</summary><p>

```json5
{
    subMonth: 1,
    oldSubscribeStatus: 2,
    subscribingStatus: 1,
    userId: "6813181309701719620",
    secUid: "<redacted>",
    uniqueId: "zerodytester",
    nickname: "Zerody Tester",
    profilePictureUrl: "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/to...webp",
    followRole: 0,
    userBadges: [],
    userDetails: {
        createTime: "0",
        bioDescription: "",
        profilePictureUrls: [
            "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/to...webp",
            "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/to...jpeg"
        ]
    },
    followInfo: {
        followingCount: 23,
        followerCount: 43,
        followStatus: 0,
        pushStatus: 0
    },
    isModerator: false,
    isNewGifter: false,
    isSubscriber: false,
    topGifterRank: null,
    msgId: "7137745705032043266",
    createTime: "1661885986187",
    displayType: "pm_mt_subinfo_user",
    label: "{0:user} just subscribed to the host"
}
```

</p></details>

### Custom Events

These events are based on message events.

### `follow`

Triggers when a user follows the streamer. Based on `social` event.

```ts
connection.on(WebcastEvent.FOLLOW, (data) => {
    console.log(data.uniqueId, 'followed!');
});
```

<details><summary>⚡ See Data Structure</summary><p>

```json5
{
    userId: "6813181309701719620",
    secUid: "<redacted>",
    uniqueId: "zerodytester",
    nickname: "Zerody Tester",
    profilePictureUrl: "https://p16-sign.tiktokcdn-us.com/tos-useast5-avt-...webp",
    followRole: 1,
    userBadges: [
        {
            type: "pm_mt_moderator_im",
            name: "Moderator"
        },
        {
            type: "image",
            displayType: 1,
            url: "https://p19-webcast.tiktokcdn.com/webcast-va/rankl...image"
        },
        {
            type: "image",
            displayType: 1,
            url: "https://p19-webcast.tiktokcdn.com/webcast-va/....~...image"
        }
    ],
    userDetails: {
        createTime: "0",
        bioDescription: "",
        profilePictureUrls: [
            "https://p16-sign.tiktokcdn-us.com/tos-useast5-avt-...webp",
            "https://p16-sign.tiktokcdn-us.com/tos-useast5-avt-...webp",
            "https://p19-sign.tiktokcdn-us.com/tos-useast5-avt-...webp",
            "https://p16-sign.tiktokcdn-us.com/tos-useast5-avt-...jpeg"
        ]
    },
    followInfo: {
        followingCount: 277,
        followerCount: 96,
        followStatus: 1,
        pushStatus: 0
    },
    isModerator: false,
    isNewGifter: false,
    isSubscriber: false,
    topGifterRank: null,
    msgId: "7137750889884076842",
    createTime: "1661887134629",
    displayType: "pm_main_follow_message_viewer_2",
    label: "{0:user} followed the host"
}
```

</p></details>

### `share`

Triggers when a user shares the stream. Based on `social` event.

```ts
connection.on(WebcastEvent.SHARE, (data) => {
    console.log(data.uniqueId, "shared the stream!");
})
```

<details><summary>⚡ See Data Structure</summary><p>

```json5
{
    userId: "6813181309701719620",
    secUid: "<redacted>",
    uniqueId: "zerodytester",
    nickname: "Zerody Tester",
    profilePictureUrl: "https://p16-sign.tiktokcdn-us.com/tos-useast5-avt-...webp",
    followRole: 1,
    userBadges: [
        {
            type: "pm_mt_moderator_im",
            name: "Moderator"
        },
        {
            type: "image",
            displayType: 1,
            url: "https://p19-webcast.tiktokcdn.com/webcast-va/rankl...image"
        },
        {
            type: "image",
            displayType: 1,
            url: "https://p19-webcast.tiktokcdn.com/webcast-va/....~...image"
        }
    ],
    userDetails: {
        createTime: "0",
        bioDescription: "",
        profilePictureUrls: [
            "https://p16-sign.tiktokcdn-us.com/tos-useast5-avt-...webp",
            "https://p16-sign.tiktokcdn-us.com/tos-useast5-avt-...webp",
            "https://p19-sign.tiktokcdn-us.com/tos-useast5-avt-...webp",
            "https://p16-sign.tiktokcdn-us.com/tos-useast5-avt-...jpeg"
        ]
    },
    followInfo: {
        followingCount: 277,
        followerCount: 96,
        followStatus: 1,
        pushStatus: 0
    },
    isModerator: false,
    isNewGifter: false,
    isSubscriber: false,
    topGifterRank: null,
    msgId: "7137750889884076842",
    createTime: "1661887134629",
    displayType: "pm_mt_guidance_share",
    label: "{0:user} shared the live"
}
```

</p></details>

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

### Send Messages

As of `2.0.2` you can now send messages to TikTok LIVE chats!

```ts
import { TikTokLiveConnection } from 'tiktok-live-connector';
import { connection } from 'websocket';

const connection = new TikTokLiveConnection(
    'tv_asahi_news',
    {
        sessionId: '<account_session_id>',
        signApiKey: '<your_sign_api_key>'
    }
);

// Connect, then send a chat!
connection.connect().then(() => {
    connection.sendMessage('Hello world!');
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
