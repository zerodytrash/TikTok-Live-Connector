# TikTok-Livestream-Chat-Connector
A Node.js module to receive and decode livestream chat messages and other events in realtime from [TikTok LIVE](https://www.tiktok.com/live) by connecting to TikTok's internal WebCast push service. The module includes a wrapper that connects to the WebCast service using just the username (`uniqueId`). This allows you to connect to your own live chat as well as the live chat of other streamers. No credentials are required. Besides chat messages, other events such as members joining and gifts can be handled.

<b>NOTE:</b> This is not an official API. The correctness of the data cannot be guaranteed.

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

To create a new `WebcastPushConnection` object the following parameters are required.

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

## Methods
A `WebcastPushConnection` object contains the following methods.

| Method Name | Description |
| ----------- | ----------- |
| connect     | Connects to the live stream chat.<br>Returns a `Promise` which will be resolved when the connection is successfully established. |
| disconnect  | Disconnects the connection. |
| getState    | Gets the current connection state. |

## Events

A `WebcastPushConnection` object has the following events which can be handled via `.on(eventName, eventHandler)`
<table>
    <tr>
        <th>Event Name</th>
        <th>Description</th>
    </tr>
    <tr></tr>
    <tr>
        <td>error</td>
        <td>General error event. You should handle this.
        <pre lang="javascript">
tiktokChatConnection.on('error', err => {
    console.error('Error!', err);
})</pre></td>
    </tr>
    <tr></tr>
    <tr>
        <td>connected</td>
        <td>
            Triggered when the connection gets successfully established.
            <pre lang="javascript">
tiktokChatConnection.on('connected', state => {
    console.log('Connected!', state);
})</pre>
        </td>
    </tr>
    <tr></tr>
    <tr>
        <td>disconnected</td>
        <td>Triggered when the connection gets disconnected. In that case you can call connect() again to have a reconnect logic. Note that you should wait a little bit before attempting a reconnect to to avoid being rate-limited.<pre lang="javascript">
tiktokChatConnection.on('disconnected', () => {
    console.log('Disconnected!');
})</pre>
        </td>
    </tr>
    <tr></tr>
    <tr>
        <td>chat</td>
        <td>Every time a new chat message arrives.<pre lang="javascript">
tiktokChatConnection.on('chat', data => {
    console.log(`${data.uniqueId} writes: ${data.comment}`);
})</pre>
        Data structure:
<pre lang="javascript">{
  comment: 'how are you?',
  userId: '6776663624629974021',
  uniqueId: 'zerodytester',
  nickname: 'Zerody One',
  profilePictureUrl: 'https://p16-sign-va.tiktokcdn.com/...'
}</pre></td>
    </tr>
    <tr></tr>
    <tr>
        <td>member</td>
        <td>Triggered every time a new member joins the live stream.<pre lang="javascript">
tiktokChatConnection.on('member', data => {
    console.log(`${data.uniqueId} joins the stream!`);
})</pre>
      Data structure:
<pre lang="javascript">{
  userId: '6776663624629974021',
  uniqueId: 'zerodytester',
  nickname: 'Zerody One',
  profilePictureUrl: 'https://p16-sign-va.tiktokcdn.com/...'
}</pre></td>
    </tr>
    <tr></tr>
    <tr>
        <td>gift</td>
        <td>Triggered every time a gift arrives.<pre lang="javascript">
tiktokChatConnection.on('gift', data => {
    console.log(`${data.uniqueId} sends gift ${data.giftId}`);
})</pre>Data structure:
<pre lang="javascript">{
  userId: '6649054330291912709',
  uniqueId: 'puschi._66',
  nickname: 'puschel_chen66',
  profilePictureUrl: 'https://p16-sign-va.tiktokcdn.com/...',
  gift: {
    anchor_id: 6929592145315251000,
    from_idc: 'maliva',
    from_user_id: 6649054330291913000,
    gift_id: 5729,
    gift_type: 2,
    log_id: '202202042120040101901851301FF58BE2',
    msg_id: 7060967233190710000,
    profitapi_message_dur: 1007,
    repeat_count: 1,
    repeat_end: 0,
    room_id: 7060948785266019000,
    send_gift_profit_api_start_ms: 1644009604617,
    send_gift_profit_core_start_ms: 1644009604749,
    send_gift_req_start_ms: 1644009604530,
    send_gift_send_message_success_ms: 1644009605624,
    send_profitapi_dur: 87,
    to_user_id: 6929592145315251000
  },
  giftId: 5729
}</pre></td>
    </tr>
    <tr></tr>
    <tr>
        <td>streamEnd</td>
        <td>Triggered when the live stream is terminated by the host. Will also trigger the <b>disconnect</b> event.<pre lang="javascript">
tiktokChatConnection.on('streamEnd', () => {
    console.log('Stream ended');
})</pre></td>
    </tr>
    <tr></tr>
    <tr>
        <td>rawData</td>
        <td>Triggered every time a protobuf encoded webcast message arrives. You can deserialize the binary object depending on the use case with <a href="https://www.npmjs.com/package/protobufjs">protobufjs</a>. <pre lang="javascript">
tiktokChatConnection.on('rawData', (messageTypeName, binary) => {
    console.log(messageTypeName, binary);
})</pre></td>
    </tr>
    <tr></tr>
    <tr>
        <td>websocketConnected</td>
        <td>Will be triggered as soon as a websocket connection is established. The websocket client object is passed.<pre lang="javascript">
tiktokChatConnection.on('websocketConnected', websocketClient => {
    console.log("Websocket:", websocketClient.connection);
})</pre></td></td>
    </tr>
</table>

## Contributing
Pull requests are welcome.


