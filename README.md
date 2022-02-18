# TikTok-Livestream-Chat-Connector
A Node.js module to receive and decode livestream events like comments and gifts in realtime from [TikTok LIVE](https://www.tiktok.com/live) by connecting to TikTok's internal WebCast push service. The package includes a wrapper that connects to the WebCast service using just the username (`uniqueId`). This allows you to connect to your own live chat as well as the live chat of other streamers. No credentials are required. Besides [chat comments](#chat), other events such as [members joining](#member), [gifts](#gift), [viewers](#roomuser), [follows](#social), [shares](#social), [questions](#questionnew) and [likes](#like) can be tracked.

**NOTE:** This is not an official API. It's a reverse engineering project.

### Demo: [https://tiktok-chat.herokuapp.com/](https://tiktok-chat.herokuapp.com/)

#### Overview
- [Getting started](#getting-started)
- [Params and options](#params-and-options)
- [Methods](#methods)
- [Events](#events)
- [Contributing](#contributing)

## Getting started

1. Install the module via NPM
```
npm i tiktok-livestream-chat-connector
```

2. Create your first chat connection

```javascript
const { WebcastPushConnection } = require('tiktok-livestream-chat-connector');

// Username of someone who is currently live
let tiktokUsername = "officialgeilegisela";

// Create a new wrapper object and pass the username
let tiktokChatConnection = new WebcastPushConnection(tiktokUsername);

// Connect to the chat (await can be used as well)
tiktokChatConnection.connect().then(state => {
    console.info(`Connected to roomId ${state.roomId}`);
}).catch(err => {
    console.error('Failed to connect', err);
})

// Define the events that you want to handle
// In this case we listen to chat messages (comments)
tiktokChatConnection.on('chat', data => {
    console.log(`${data.uniqueId} (userId:${data.userId}) writes: ${data.comment}`);
})

// And here we receive gifts sent to the streamer
tiktokChatConnection.on('gift', data => {
    console.log(`${data.uniqueId} (userId:${data.userId}) sends ${data.giftId}`);
})

// ...and more events described in the documentation below
```

## Params and options

To create a new `WebcastPushConnection` object the following parameters are required.

`WebcastPushConnection(uniqueId, [options])`

| Param Name | Required | Description |
| ---------- | -------- | ----------- |
| uniqueId   | Yes | The unique username of the broadcaster. You can find this name in the URL.<br>Example: `https://www.tiktok.com/@officialgeilegisela/live` => `officialgeilegisela` |
| options  | No | Here you can set the following optional connection properties. If you do not specify a value, the default value will be used.<br><br>`processInitialData` (default: `true`) <br> Define if you want to process the initital data which includes old messages of the last seconds.<br><br>`fetchRoomInfoOnConnect` (default: `true`) <br> Define if you want to fetch all room information on [`connect()`](#methods). If this option is enabled, the connection to offline rooms will be prevented. If enabled, the connect result contains the room info via the `roomInfo` attribute. You can also manually retrieve the room info (even in an unconnected state) using the [`getRoomInfo()`](#methods) function.<br><br>`enableExtendedGiftInfo` (default: `false`) <br> Define if you want to receive extended information about gifts like gift name, cost and images. This information will be provided at the [gift event](#gift). <br><br>`enableWebsocketUpgrade` (default: `true`) <br> Define if you want to use a WebSocket connection instead of request polling if TikTok offers it. <br><br>`requestPollingIntervalMs` (default: `1000`) <br> Request polling interval if WebSocket is not used.<br><br>`clientParams` (default: `{}`) <br> Custom client params for Webcast API.<br><br>`requestHeaders` (default: `{}`) <br> Custom request headers passed to axios.<br><br>`websocketHeaders` (default: `{}`) <br> Custom websocket headers passed to websocket.client. |

Example Options:
```javascript
let tiktokChatConnection = new WebcastPushConnection(tiktokUsername, {
    processInitialData: false,
    enableExtendedGiftInfo: true,
    enableWebsocketUpgrade: true,
    requestPollingIntervalMs: 2000,
    clientParams: {
        "app_language": "en-US",
        "device_platform": "web"
    },
    requestHeaders: {
        "headerName": "headerValue"
    },
    websocketHeaders: {
        "headerName": "headerValue"
    }
});
```

## Methods
A `WebcastPushConnection` object contains the following methods.

| Method Name | Description |
| ----------- | ----------- |
| connect     | Connects to the live stream chat.<br>Returns a `Promise` which will be resolved when the connection is successfully established. |
| disconnect  | Disconnects the connection. |
| getState    | Gets the current connection state including the cached room info (see below). |
| getRoomInfo | Gets the current room info from TikTok API including streamer info, room status and statistics.<br>Returns a `Promise` which will be resolved when the API request is done.<br>*<b>Note: </b>You can call this function even if you're not connected.* |

## Events

A `WebcastPushConnection` object has the following events which can be handled via `.on(eventName, eventHandler)`

#### Overview
- [`connected`](#connected)
- [`disconnected`](#disconnected)
- [`member`](#member)
- [`chat`](#chat)
- [`gift`](#gift)
- [`roomUser`](#roomuser)
- [`like`](#like)
- [`social`](#social)
- [`questionNew`](#questionnew)
- [`streamEnd`](#streamend)
- [`rawData`](#rawdata)
- [`websocketConnected`](#websocketconnected)
- [`error`](#error)

### `connected`
Triggered when the connection gets successfully established.

```javascript
tiktokChatConnection.on('connected', state => {
    console.log('Hurray! Connected!', state);
})
```

### `disconnected`
Triggered when the connection gets disconnected. In that case you can call `connect()` again to have a reconnect logic. Note that you should wait a little bit before attempting a reconnect to to avoid being rate-limited.

```javascript
tiktokChatConnection.on('disconnected', () => {
    console.log('Disconnected :(');
})
```

### `member`
Triggered every time a new viewer joins the live stream.

```javascript
tiktokChatConnection.on('member', data => {
    console.log(`${data.uniqueId} joins the stream!`);
})
```


Data structure:
```javascript
{
  userId: '6776663624629974021',
  uniqueId: 'zerodytester',
  nickname: 'Zerody One',
  profilePictureUrl: 'https://p16-sign-va.tiktokcdn.com/...'
}
```

### `chat`
Triggered every time a new chat comment arrives.

```javascript
tiktokChatConnection.on('chat', data => {
    console.log(`${data.uniqueId} writes: ${data.comment}`);
})
```

Data structure:
```javascript
{
  comment: 'how are you?',
  userId: '6776663624629974121',
  uniqueId: 'zerodytester',
  nickname: 'Zerody One',
  profilePictureUrl: 'https://p16-sign-va.tiktokcdn.com/...'
}
```

### `gift`
Triggered every time a gift arrives. You will receive additional information via the `extendedGiftInfo` attribute when you enable the [`enableExtendedGiftInfo`](#params-and-options) option. 

> **NOTE:** Users have the capability to send gifts in a streak. This increases the `data.gift.repeat_count` value until the user terminates the streak. During this time new gift events are triggered again and again with an increased `data.gift.repeat_count` value. It should be noted that after the end of the streak, another gift event is triggered, which signals the end of the streak via `data.gift.repeat_end`:`1`. This applies only to gifts with `data.gift.gift_type`:`1`. This means that even if the user sends a `gift_type`:`1` gift only once, you will receive the event twice. Once with `repeat_end`:`0` and once with `repeat_end`:`1`. Therefore, the event should be handled as follows:


```javascript
tiktokChatConnection.on('gift', data => {
    if (data.gift.gift_type === 1 && data.gift.repeat_end === 0) {
        // Streak in progress => show only temporary
        console.log(`${data.uniqueId} is sending gift ${data.giftId} x${data.gift.repeat_count}`);
    } else {
        // Streak ended or non-streakable gift => process the gift with final repeat_count
        console.log(`${data.uniqueId} has sent gift ${data.giftId} x${data.gift.repeat_count}`);
    }
})
```


Data structure:
```javascript
{
  userId: '6776663624629974121',
  uniqueId: 'zerodytester',
  nickname: 'Zerody One',
  profilePictureUrl: 'https://p16-sign-va.tiktokcdn.com/...',
  gift: {
    gift_id: 5729,
    gift_type: 2,
    repeat_count: 1,
    repeat_end: 0,
    to_user_id: 6929592145315251000
  },
  giftId: 5729,
  // Extended info is present if you have enabled the 'enableExtendedGiftInfo' option
  extendedGiftInfo: {
    describe: 'sent Rose',
    diamond_count: 1,
    duration: 1000,
    icon: {
      avg_color: '#A3897C',
      is_animated: false,
      url_list: [
        // Icon URLs...
      ]
    },
    id: 5655,
    image: {
      avg_color: '#FFEBEB',
      is_animated: false,
      url_list: [
        // Image URLs...
      ]
    },
    is_broadcast_gift: false,
    is_displayed_on_panel: true,
    is_effect_befview: false,
    item_type: 1,
    name: 'Rose',
    type: 1
  }
}
```

### `roomUser`
Triggered every time a statistic message arrives. This message currently contains only the viewer count.

```javascript
tiktokChatConnection.on('roomUser', data => {
    console.log(`Viewer Count: ${data.viewerCount}`);
})
```

### `like`
Triggered when a viewer sends likes to the streamer. For streams with many viewers, this event is not always triggered by TikTok.

```javascript
tiktokChatConnection.on('like', data => {
    console.log(`${data.uniqueId} sent ${data.likeCount} likes, total likes: ${data.totalLikeCount}`);
})
```

Data structure:
```javascript
{
  likeCount: 5, // likes given by the user (taps on screen)
  totalLikeCount: 83033, // likes that this stream has received in total
  userId: '6776663624629974121',
  uniqueId: 'zerodytester',
  nickname: 'Zerody One',
  profilePictureUrl: 'https://p16-sign-sg.tiktokcdn.com/...',
  displayType: 'pm_mt_msg_viewer',
  label: '{0:user} sent likes to the host'
}
```

### `social`
Triggered every time someone shares the stream or follows the host.

```javascript
tiktokChatConnection.on('social', data => {
    console.log('social event data:', data);
})
```

Data structure:
```javascript
{
  userId: '6776663624629974121',
  uniqueId: 'zerodytester',
  nickname: 'Zerody One',
  profilePictureUrl: 'https://p16-sign-va.tiktokcdn.com/...',
  displayType: 'pm_main_follow_message_viewer_2', // or 'pm_mt_guidance_share' for sharing
  label: '{0:user} followed the host'
}
```

### `questionNew`
Triggered every time someone asks a new question via the question feature.

```javascript
tiktokChatConnection.on('questionNew', data => {
    console.log(`${data.uniqueId} asks ${data.questionText}`);
})
```

Data structure:
```javascript
{
  questionText: 'Do you know why TikTok has such a complicated API?',
  userId: '6776663624629974121',
  uniqueId: 'zerodytester',
  nickname: 'Zerody One',
  profilePictureUrl: 'https://p16-sign-va.tiktokcdn.com/...'
}
```

### `streamEnd`
Triggered when the live stream gets terminated by the host. Will also trigger the [`disconnected`](#disconnected) event.

```javascript
tiktokChatConnection.on('streamEnd', () => {
    console.log('Stream ended');
})
```

### `rawData`
Triggered every time a protobuf encoded webcast message arrives. You can deserialize the binary object depending on the use case with <a href="https://www.npmjs.com/package/protobufjs">protobufjs</a>.

```javascript
tiktokChatConnection.on('rawData', (messageTypeName, binary) => {
    console.log(messageTypeName, binary);
})
```

### `websocketConnected`
Will be triggered as soon as a websocket connection is established. The websocket client object is passed.

```javascript
tiktokChatConnection.on('websocketConnected', websocketClient => {
    console.log("Websocket:", websocketClient.connection);
})
```

### `error`
General error event. You should handle this.

```javascript
tiktokChatConnection.on('error', err => {
    console.error('Error!', err);
})
```

## Contributing
Your improvements are welcome! Feel free to open an <a href="https://github.com/zerodytrash/TikTok-Livestream-Chat-Connector/issues">issue</a> or <a href="https://github.com/zerodytrash/TikTok-Livestream-Chat-Connector/pulls">pull request</a>.
