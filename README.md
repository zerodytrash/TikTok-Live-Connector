# TikTok-Livestream-Chat-Connector
A Node.js module to retrieve and decode livestream chat data from [TikTok LIVE](https://www.tiktok.com/live) by connecting to TikTok's internal WebCast push service. The module includes a wrapper that connects to the WebCast service using the username (`uniqueId`). This allows you to connect to your own live chat as well as the live chat of other streamers. No credentials are required. Besides chat messages, other events such as members joining and gifts can be monitored.

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
tiktokChatConnection.on('chat', data => {
    console.log(`${data.uniqueId} (userId:${data.userId}) writes: ${data.comment}`);
})

```

## Params and options

To create a new WebcastPushConnection object the following parameters are required.

`WebcastPushConnection(uniqueId, [options])`

| Param Name | Required | Description |
| ---------- | -------- | ----------- |
| uniqueId   | Yes | The unique username of the broadcaster. You can find this name in the URL.<br>Example: `https://www.tiktok.com/@officialgeilegisela/live` => `officialgeilegisela` |
| options  | No | Here you can set the following connection properties:<br><br>`processInitialData` (default: `true`) <br> Define if you want to process the initital data which includes messages of the last minutes.<br><br>`enableWebsocketUpgrade` (default: `true`) <br> Define if you want to use a WebSocket connection instead of request polling if TikTok offers it. <br><br>`requestPollingIntervalMs` (default: `1000`) <br> Request polling interval if WebSocket is not used.  |

Example:
```javascript
let tiktokChatConnection = new WebcastPushConnection(tiktokUsername, {
    processInitialData: false,
    enableWebsocketUpgrade: true,
    requestPollingIntervalMs: 5000
});
```
