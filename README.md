# TikTok-Livestream-Chat-Connector
A Node.js module to receive and decode livestream chat events like comments in realtime from [TikTok LIVE](https://www.tiktok.com/live) by connecting to TikTok's internal WebCast push service. The package includes a wrapper that connects to the WebCast service using just the username (`uniqueId`). This allows you to connect to your own live chat as well as the live chat of other streamers. No credentials are required. Besides chat comments, other events such as members joining, gifts, viewers, followers and likes can be tracked.

<b>NOTE:</b> This is not an official API. It's a reverse engineering project. The correctness of the data cannot be guaranteed.

#### Demo: [https://tiktok-chat.herokuapp.com/](https://tiktok-chat.herokuapp.com/)

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
    console.info('Connected!', state);
}).catch(err => {
    console.error('Failed to connect', err);
})

// Define the events that you want to handle
// In this case we listen to chat messages
tiktokChatConnection.on('chat', data => {
    console.log(`${data.uniqueId} (userId:${data.userId}) writes: ${data.comment}`);
})

```

## Params and options

To create a new `WebcastPushConnection` object the following parameters are required.

`WebcastPushConnection(uniqueId, [options])`

| Param Name | Required | Description |
| ---------- | -------- | ----------- |
| uniqueId   | Yes | The unique username of the broadcaster. You can find this name in the URL.<br>Example: `https://www.tiktok.com/@officialgeilegisela/live` => `officialgeilegisela` |
| options  | No | Here you can set the following connection properties:<br><br>`processInitialData` (default: `true`) <br> Define if you want to process the initital data which includes old messages of the last seconds.<br><br>`enableExtendedGiftInfo` (default: `false`) <br> Define if you want to receive extended information about gifts like gift name, cost and images. This information will be provided at the gift event. <br><br>`enableWebsocketUpgrade` (default: `true`) <br> Define if you want to use a WebSocket connection instead of request polling if TikTok offers it. <br><br>`requestPollingIntervalMs` (default: `1000`) <br> Request polling interval if WebSocket is not used.<br><br>`clientParams` (default: `{}`) <br> Custom client params for Webcast API.<br><br>`requestHeaders` (default: `{}`) <br> Custom request headers passed to axios.<br><br>`websocketHeaders` (default: `{}`) <br> Custom websocket headers passed to websocket.client. |

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
| getState    | Gets the current connection state. |

## Events

A `WebcastPushConnection` object has the following events which can be handled via `.on(eventName, eventHandler)`
### `error`
General error event. You should handle this.

```javascript
tiktokChatConnection.on('error', err => {
    console.error('Error!', err);
})
```


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
  userId: '6776663624629974021',
  uniqueId: 'zerodytester',
  nickname: 'Zerody One',
  profilePictureUrl: 'https://p16-sign-va.tiktokcdn.com/...'
}
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

### `gift`
Triggered every time a gift arrives.

```javascript
tiktokChatConnection.on('gift', data => {
    console.log(`${data.uniqueId} sends gift ${data.giftId}`);
})
```


Data structure:
```javascript
{
  userId: '6649054330291912709',
  uniqueId: 'puschi._66',
  nickname: 'puschel_chen66',
  profilePictureUrl: 'https://p16-sign-va.tiktokcdn.com/...',
  gift: {
    gift_id: 5729,
    gift_type: 2,
    repeat_count: 1,
    repeat_end: 0,
    to_user_id: 6929592145315251000,
    // ...
  },
  giftId: 5729
}
```

### `roomUser`
Triggered every time a statistic message arrives. This message currently contains only the viewer count.

```javascript
tiktokChatConnection.on('roomUser', data => {
    console.log(`Viewer Count: ${data.viewerCount}`);
})
```

### `streamEnd`
Triggered when the live stream gets terminated by the host. Will also trigger the `disconnect` event.

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

## Contributing
Your improvements are welcome! Feel free to open an <a href="https://github.com/zerodytrash/TikTok-Livestream-Chat-Connector/issues">issue</a> or <a href="https://github.com/zerodytrash/TikTok-Livestream-Chat-Connector/pulls">pull request</a>.


