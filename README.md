# TikTok-Live-Connector
A Node.js library to receive live stream events such as comments and gifts in realtime from [TikTok LIVE](https://www.tiktok.com/live) by connecting to TikTok's internal WebCast push service. The package includes a wrapper that connects to the WebCast service using just the username (`uniqueId`). This allows you to connect to your own live chat as well as the live chat of other streamers. No credentials are required. Besides [Chat Comments](#chat), other events such as [Members Joining](#member), [Gifts](#gift), [Subscriptions](#subscribe), [Viewers](#roomuser), [Follows](#social), [Shares](#social), [Questions](#questionnew), [Likes](#like) and [Battles](#linkmicbattle) can be tracked. You can also send [automatic messages](#send-chat-messages) into the chat by providing your Session ID.

### Example Project: [https://tiktok-chat-reader.zerody.one/](https://tiktok-chat-reader.zerody.one/)

Do you prefer other programming languages?
- **Python** rewrite: [TikTokLive](https://github.com/isaackogan/TikTokLive) by [@isaackogan](https://github.com/isaackogan)
- **Java** rewrite: [TikTokLiveJava](https://github.com/jwdeveloper/TikTokLiveJava) by [@jwdeveloper](https://github.com/jwdeveloper)
- **C#** rewrite: [TikTokLiveSharp](https://github.com/frankvHoof93/TikTokLiveSharp) by [@frankvHoof93](https://github.com/frankvHoof93)
- **Go** rewrite: [GoTikTokLive](https://github.com/Davincible/gotiktoklive) by [@Davincible](https://github.com/Davincible)

**NOTE:** This is not an official API. It's a reverse engineering project.

**NOTE:** This JavaScript library is intended for use in [Node.js](https://nodejs.org/) environments. If you want to process or display the data in the browser (client-side), you need to transfer the data from the Node.js environment to the browser. A good approach for this is to use [Socket.IO](https://socket.io/) or a different low-latency communication framework. A complete example project can be found here: [TikTok-Chat-Reader](https://github.com/zerodytrash/TikTok-Chat-Reader)

> **UPDATE**:<br>Due to a change on the part of TikTok, versions prior **v1.1.7** are no longer functional. If you are using one of these versions, upgrade to the latest version using the `npm i tiktok-live-connector` command.

#### Overview
- [Getting started](#getting-started)
- [Params and options](#params-and-options)
- [Methods](#methods)
- [Events](#events)
- [Examples](#examples)
- [Contributing](#contributing)

## Getting started

1. Install the package via NPM
```
npm i tiktok-live-connector
```

2. Create your first chat connection

```javascript
const { WebcastPushConnection } = require('tiktok-live-connector');

// Username of someone who is currently live
let tiktokUsername = "officialgeilegisela";

// Create a new wrapper object and pass the username
let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

// Connect to the chat (await can be used as well)
tiktokLiveConnection.connect().then(state => {
    console.info(`Connected to roomId ${state.roomId}`);
}).catch(err => {
    console.error('Failed to connect', err);
})

// Define the events that you want to handle
// In this case we listen to chat messages (comments)
tiktokLiveConnection.on('chat', data => {
    console.log(`${data.uniqueId} (userId:${data.userId}) writes: ${data.comment}`);
})

// And here we receive gifts sent to the streamer
tiktokLiveConnection.on('gift', data => {
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
| options  | No | Here you can set the following optional connection properties. If you do not specify a value, the default value will be used.<br><br>`processInitialData` (default: `true`) <br> Define if you want to process the initital data which includes old messages of the last seconds.<br><br>`fetchRoomInfoOnConnect` (default: `true`) <br> Define if you want to fetch all room information on [`connect()`](#methods). If this option is enabled, the connection to offline rooms will be prevented. If enabled, the connect result contains the room info via the `roomInfo` attribute. You can also manually retrieve the room info (even in an unconnected state) using the [`getRoomInfo()`](#methods) function.<br><br>`enableExtendedGiftInfo` (default: `false`) <br> Define if you want to receive extended information about gifts like gift name, cost and images. This information will be provided at the [gift event](#gift). <br><br>`enableWebsocketUpgrade` (default: `true`) <br> Define if you want to use a WebSocket connection instead of request polling if TikTok offers it. <br><br>`requestPollingIntervalMs` (default: `1000`) <br> Request polling interval if WebSocket is not used.<br><br>`sessionId` (default: `null`) <br> Here you can specify the current Session ID of your TikTok account (**sessionid** cookie value) if you want to send automated chat messages via the [`sendMessage()`](#methods) function. See [Example](#send-chat-messages)<br><br>`clientParams` (default: `{}`) <br> Custom client params for Webcast API.<br><br>`requestHeaders` (default: `{}`) <br> Custom request headers passed to [axios](https://github.com/axios/axios).<br><br>`websocketHeaders` (default: `{}`) <br> Custom websocket headers passed to [websocket.client](https://github.com/theturtle32/WebSocket-Node). <br><br>`requestOptions` (default: `{}`) <br> Custom request options passed to [axios](https://github.com/axios/axios). Here you can specify an `httpsAgent` to use a proxy and a `timeout` value. See [Example](#connect-via-proxy). <br><br>`websocketOptions` (default: `{}`) <br> Custom websocket options passed to [websocket.client](https://github.com/theturtle32/WebSocket-Node). Here you can specify an `agent` to use a proxy and a `timeout` value. See [Example](#connect-via-proxy). <br><br>`signProviderOptions` (default: `{}`) <br> Custom request options for the TikTok signing server. Here you can specify a `host`, `params`, and `headers`. |

Example Options:
```javascript
let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername, {
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
    },
    requestOptions: {
        timeout: 10000
    },
    websocketOptions: {
        timeout: 10000
    },
    signProviderOptions: {
        host: "https://custom-signing-server.com",
        params: {
            "paramName": "paramValue"
        },
        headers: {
            "headerName": "headerValue"
        }
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
| getRoomInfo | Gets the current room info from TikTok API including streamer info, room status and statistics.<br>Returns a `Promise` which will be resolved when the API request is done.<br>*<b>Note: </b>You can call this function even if you're not connected.*<br>[Example](#retrieve-room-info) |
| getAvailableGifts | Gets a list of all available gifts including gift name, image url, diamont cost and a lot of other information.<br>Returns a `Promise` that will be resolved when all available gifts has been retrieved from the API.<br>*<b>Note: </b>You can call this function even if you're not connected.*<br>[Example](#retrieve-available-gifts) |
| sendMessage<br>`(text, [sessionId])` | Sends a chat message into the current live room using the provided session cookie (specified in the [constructor options](#params-and-options) or via the second function parameter).<br>Returns a `Promise` that will be resolved when the chat message has been submitted to the API.<br><br><b>WARNING: Use of this function is at your own risk. Spamming messages can lead to the suspension of your TikTok account. Be careful!</b><br>[Example](#send-chat-messages)|

## Events

A `WebcastPushConnection` object has the following events which can be handled via `.on(eventName, eventHandler)`

Control Events:
- [connected](#connected)
- [disconnected](#disconnected)
- [streamEnd](#streamend)
- [rawData](#rawdata)
- [websocketConnected](#websocketconnected)
- [error](#error)

Message Events:
- [member](#member)
- [chat](#chat)
- [gift](#gift)
- [roomUser](#roomuser)
- [like](#like)
- [social](#social)
- [emote](#emote)
- [envelope](#envelope)
- [questionNew](#questionnew)
- [linkMicBattle](#linkmicbattle)
- [linkMicArmies](#linkmicarmies)
- [liveIntro](#liveintro)
- [subscribe](#subscribe)

Custom Events:
- [follow](#follow)
- [share](#share)

<br><br>

### Control Events

### `connected`
Triggered when the connection is successfully established.

```javascript
tiktokLiveConnection.on('connected', state => {
    console.log('Hurray! Connected!', state);
})
```

<details><summary>⚡ Show Data Structure</summary><p>

```javascript
{
  isConnected: true,
  upgradedToWebsocket: true,
  roomId: '7137682087200557829',        
  roomInfo: {
    AnchorABMap: {},
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
      url_list: [Array],
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
    deprecated3: {},
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
      url_list: [Array],
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
      battle_settings: [Object],
      channel_id: 0,
      followed_count: 0,
      linked_user_list: [],
      multi_live_enum: 1,
      rival_anchor_id: 0,
      show_user_list: []
    },
    linker_map: {},
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
      avatar_large: [Object],
      avatar_medium: [Object],
      avatar_thumb: [Object],
      badge_image_list: [],
      badge_list: [],
      bg_img_url: '',
      bio_description: 'HH📍🇩🇪تابعوني انستغرام\nاذا سقطت سأخذ الجميع معي\n👻Alin_issa22👻'  ,
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
      follow_info: [Object],
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
      own_room: [Object],
      pay_grade: [Object],
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
      user_attr: [Object],
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
    social_interaction: { linkmic_scene_linker: {}, multi_live: [Object] },
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
      user_count_composition: [Object],
      watermelon: 0
    },
    status: 2,
    sticker_list: [],
    stream_id: 2993830046178738000,
    stream_id_str: '2993830046178738249',
    stream_status: 0,
    stream_url: {
      candidate_resolution: [Array],
      complete_push_urls: [],
      default_resolution: 'ORIGION',
      extra: [Object],
      flv_pull_url: [Object],
      flv_pull_url_params: [Object],
      hls_pull_url: 'https://pull-hls-f16-va01.tiktokcdn.com/stage/stream-2993830046178738249_or4/index.m3u8',
      hls_pull_url_map: {},
      hls_pull_url_params: '{"VCodec":"h264"}',
      id: 2993830046178738000,
      id_str: '2993830046178738249',
      live_core_sdk_data: [Object],
      provider: 0,
      push_urls: [],
      resolution_name: [Object],
      rtmp_pull_url: 'https://pull-f5-va01.tiktokcdn.com/stage/stream-2993830046178738249_or4.flv',
      rtmp_pull_url_params: '{"VCodec":"h264"}',
      rtmp_push_url: '',
      rtmp_push_url_params: '',
      stream_control_type: 0
    },
    stream_url_filtered_info: { is_gated_room: false, is_paid_event: false },
    title: 'انا جيت😍 🥰' ,
    top_fans: [ [Object], [Object], [Object] ],
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
  availableGifts: [] // Filled if `enableExtendedGiftInfo` set
}
```
</p></details>

<br>

### `disconnected`
Triggered when the connection gets disconnected. In that case you can call `connect()` again to have a reconnect logic. Note that you should wait a little bit before attempting a reconnect to to avoid being rate-limited.

```javascript
tiktokLiveConnection.on('disconnected', () => {
    console.log('Disconnected :(');
})
```
<br>

### `streamEnd`
Triggered when the live stream gets terminated by the host. Will also trigger the [`disconnected`](#disconnected) event.

```javascript
tiktokLiveConnection.on('streamEnd', (actionId) => {
    if (actionId === 3) {
        console.log('Stream ended by user');
    }
    if (actionId === 4) {
        console.log('Stream ended by platform moderator (ban)');
    }
})
```
<br>

### `rawData`
Triggered every time a protobuf encoded webcast message arrives. You can deserialize the binary object depending on the use case with <a href="https://www.npmjs.com/package/protobufjs">protobufjs</a>.

```javascript
tiktokLiveConnection.on('rawData', (messageTypeName, binary) => {
    console.log(messageTypeName, binary);
})
```
<br>

### `websocketConnected`
Will be triggered as soon as a websocket connection is established. The websocket client object is passed.

```javascript
tiktokLiveConnection.on('websocketConnected', websocketClient => {
    console.log("Websocket:", websocketClient.connection);
})
```
<br>

### `error`
General error event. You should handle this.

```javascript
tiktokLiveConnection.on('error', err => {
    console.error('Error!', err);
})
```
<br>


### Message Events

### `member`
Triggered every time a new viewer joins the live stream.

```javascript
tiktokLiveConnection.on('member', data => {
    console.log(`${data.uniqueId} joins the stream!`);
})
```

<details><summary>⚡ Show Data Structure</summary><p>

```javascript
{
    actionId: 1,
    userId: "6813181309701719620",
    secUid: "<redacted>",
    uniqueId: "zerodytester",
    nickname: "Zerody Tester",
    profilePictureUrl: "https://p16-sign-va.tiktokcdn.com/tos-useast2a-avt...webp",
    followRole: 0, // 0 = none; 1 = follower; 2 = friends
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

<br>

### `chat`
Triggered every time a new chat comment arrives.

```javascript
tiktokLiveConnection.on('chat', data => {
    console.log(`${data.uniqueId} writes: ${data.comment}`);
})
```

<details><summary>⚡ Show Data Structure</summary><p>

```javascript
{
    comment: "How are you?",
    userId: "6813181309701719620",
    secUid: "<redacted>",
    uniqueId: "zerodytester",
    nickname: "Zerody Tester",
    profilePictureUrl: "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0...webp",
    followRole: 0, // 0 = none; 1 = follower; 2 = friends
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
<br>

### `gift`
Triggered every time a gift arrives. You will receive additional information via the `extendedGiftInfo` attribute when you enable the [`enableExtendedGiftInfo`](#params-and-options) option. 

> **NOTE:** Users have the capability to send gifts in a streak. This increases the `repeatCount` value until the user terminates the streak. During this time new gift events are triggered again and again with an increased `repeatCount` value. It should be noted that after the end of the streak, another gift event is triggered, which signals the end of the streak via `repeatEnd`:`true`. This applies only to gifts with `giftType`:`1`. This means that even if the user sends a `giftType`:`1` gift only once, you will receive the event twice. Once with `repeatEnd`:`false` and once with `repeatEnd`:`true`. Therefore, the event should be handled as follows:


```javascript
tiktokLiveConnection.on('gift', data => {
    if (data.giftType === 1 && !data.repeatEnd) {
        // Streak in progress => show only temporary
        console.log(`${data.uniqueId} is sending gift ${data.giftName} x${data.repeatCount}`);
    } else {
        // Streak ended or non-streakable gift => process the gift with final repeat_count
        console.log(`${data.uniqueId} has sent gift ${data.giftName} x${data.repeatCount}`);
    }
})
```


<details><summary>⚡ Show Data Structure</summary><p>

```javascript
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
    followRole: 0, // 0 = none; 1 = follower; 2 = friends
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
<br>

### `roomUser`
Triggered every time a statistic message arrives. This message currently contains the viewer count and a top gifter list.

```javascript
tiktokLiveConnection.on('roomUser', data => {
    console.log(`Viewer Count: ${data.viewerCount}`);
})
```

<details><summary>⚡ Show Data Structure</summary><p>

```javascript
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

<br>

### `like`
Triggered when a viewer sends likes to the streamer. For streams with many viewers, this event is not always triggered by TikTok.

```javascript
tiktokLiveConnection.on('like', data => {
    console.log(`${data.uniqueId} sent ${data.likeCount} likes, total likes: ${data.totalLikeCount}`);
})
```

<details><summary>⚡ Show Data Structure</summary><p>

```javascript
{
    likeCount: 6, // likes given by the user (taps on screen)
    totalLikeCount: 21349, // likes that this stream has received in total (from all users)
    userId: "6813181309701719620",
    secUid: "<redacted>",
    uniqueId: "zerodytester",
    nickname: "Zerody Tester",
    profilePictureUrl: "https://p16-sign.tiktokcdn-us.com/tos-useast5-avt-...webp",
    followRole: 0, // 0 = none; 1 = follower; 2 = friends,
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
<br>

### `social`
Triggered every time someone shares the stream or follows the host.

```javascript
tiktokLiveConnection.on('social', data => {
    console.log('social event data:', data);
})
```

<details><summary>⚡ Show Data Structure</summary><p>

```javascript
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
    displayType: "pm_main_follow_message_viewer_2", // or pm_mt_guidance_share
    label: "{0:user} followed the host"
}
```
</p></details>
<br>

### `emote`
Triggered every time a subscriber sends an emote (sticker).

```javascript
tiktokLiveConnection.on('emote', data => {
    console.log('emote received', data);
})
```

<details><summary>⚡ Show Data Structure</summary><p>

```javascript
{
    userId: "6813181309701719620",
    secUid: "<redacted>",
    uniqueId: "zerodytester",
    nickname: "Zerody Tester",
    profilePictureUrl: "https://p16-sign-sg.tiktokcdn.com/aweme/100x100/to...webp",
    followRole: 0, // 0 = none; 1 = follower; 2 = friends,
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
<br>

### `envelope`
Triggered every time someone sends a treasure chest.

```javascript
tiktokLiveConnection.on('envelope', data => {
    console.log('envelope received', data);
})
```

<details><summary>⚡ Show Data Structure</summary><p>

```javascript
{
    userId: "6813181309701719620",
    secUid: "<redacted>",
    uniqueId: "zerodytester",
    nickname: "Zerody Tester",
    profilePictureUrl: "https://p16-webcast.tiktokcdn.com/img/alisg/webcas...png",
    followRole: 0, // 0 = none; 1 = follower; 2 = friends
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
<br>

### `questionNew`
Triggered every time someone asks a new question via the question feature.

```javascript
tiktokLiveConnection.on('questionNew', data => {
    console.log(`${data.uniqueId} asks ${data.questionText}`);
})
```

<details><summary>⚡ Show Data Structure</summary><p>

```javascript
{
    questionText: "Do you know why TikTok has such a complicated API?",
    userId: "6813181309701719620",
    secUid: "<redacted>",
    uniqueId: "zerodytester",
    nickname: "Zerody Tester",
    profilePictureUrl: "https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0...webp",
    followRole: 0, // 0 = none; 1 = follower; 2 = friends
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
<br>

### `linkMicBattle`
Triggered every time a battle starts.

```javascript
tiktokLiveConnection.on('linkMicBattle', (data) => {
    console.log(`New Battle: ${data.battleUsers[0].uniqueId} VS ${data.battleUsers[1].uniqueId}`);
})
```

<details><summary>⚡ Show Data Structure</summary><p>

```javascript
{
    battleUsers: [
        {
            userId: "6901252963970515973", // Host
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
            userId: "262781145296064512", // Guest
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
<br>

### `linkMicArmies`
Triggered every time a battle participant receives points. Contains the current status of the battle and the army that suported the group.

```javascript
tiktokLiveConnection.on('linkMicArmies', (data) => {
    console.log('linkMicArmies', data);
})
```

<details><summary>⚡ Show Data Structure</summary><p>

```javascript
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
<br>

### `liveIntro`
Triggered when a live intro message appears.

```javascript
tiktokLiveConnection.on('liveIntro', (msg) => {
    console.log(msg);
})
```
<details><summary>⚡ Show Data Structure</summary><p>

```javascript
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

<br>

### `subscribe`
Triggers when a user creates a subscription.

```javascript
tiktokLiveConnection.on('subscribe', (data) => {
    console.log(data.uniqueId, "subscribed!");
})
```

<details><summary>⚡ Show Data Structure</summary><p>

```javascript
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

<br>

### Custom Events
These events are based on message events.
<br>

### `follow`
Triggers when a user follows the streamer. Based on `social` event.

```javascript
tiktokLiveConnection.on('follow', (data) => {
    console.log(data.uniqueId, "followed!");
})
```

<details><summary>⚡ Show Data Structure</summary><p>

```javascript
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

<br>

### `share`
Triggers when a user shares the stream. Based on `social` event.

```javascript
tiktokLiveConnection.on('share', (data) => {
    console.log(data.uniqueId, "shared the stream!");
})
```

<details><summary>⚡ Show Data Structure</summary><p>

```javascript
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

<br>

## Examples
### Retrieve Room Info
````javascript
let tiktokLiveConnection = new WebcastPushConnection('@username');

tiktokLiveConnection.getRoomInfo().then(roomInfo => {
    console.log(roomInfo);
    console.log(`Stream started timestamp: ${roomInfo.create_time}, Streamer bio: ${roomInfo.owner.bio_description}`);
    console.log(`HLS URL: ${roomInfo.stream_url.hls_pull_url}`); // Can be played or recorded with e.g. VLC
}).catch(err => {
    console.error(err);
})
````

### Retrieve Available Gifts
````javascript
let tiktokLiveConnection = new WebcastPushConnection('@username');

tiktokLiveConnection.getAvailableGifts().then(giftList => {
    console.log(giftList);
    giftList.forEach(gift => {
        console.log(`id: ${gift.id}, name: ${gift.name}, cost: ${gift.diamond_count}`)
    });
}).catch(err => {
    console.error(err);
})
````

### Send Chat Messages
> Due to the increased signature requirements by TikTok, sending chat messages is currently not possible.

You can send chat messages via the [`sendMessage()`](#methods) function to automatically respond to chat commands for example. For this you need to provide your Session ID. 

To get the Session ID from your account, open TikTok in your web browser and make sure you are logged in, then press F12 to open the developer tools. Switch to the **Application** tab and select **Cookies** on the left side. Then take the value of the cookie with the name **`sessionid`**.

<b>WARNING: Use of this function is at your own risk. Spamming messages can lead to the suspension of your TikTok account. Be careful!</b>

````javascript
let tiktokLiveConnection = new WebcastPushConnection('@username', {
    sessionId: 'f7fbba3a57e48dd1ecd0b7b72cb27e6f' // Replace this with the Session ID of your TikTok account
});

tiktokLiveConnection.connect().catch(err => console.log(err));

tiktokLiveConnection.on('chat', data => {
    if (data.comment.toLowerCase() === '!dice') {
        let diceResult = Math.ceil(Math.random() * 6);
        tiktokLiveConnection.sendMessage(`@${data.uniqueId} you rolled a ${diceResult}`).catch(err => console.error(err));
    }
})
````

### Connect via Proxy
[proxy-agent](https://www.npmjs.com/package/proxy-agent) supports `http`, `https`, `socks4` and `socks5` proxies:
````
npm i proxy-agent
````
You can specify if you want to use a proxy for https requests, websockets or both:
````javascript
const { WebcastPushConnection } = require('tiktok-live-connector');
const ProxyAgent = require('proxy-agent');

let tiktokLiveConnection = new WebcastPushConnection('@username', {
    requestOptions: {
        httpsAgent: new ProxyAgent('https://username:password@host:port'),
        timeout: 10000 // 10 seconds
    },
    websocketOptions: {
        agent: new ProxyAgent('https://username:password@host:port'),
        timeout: 10000 // 10 seconds
    }
});

// Connect as usual
````


## Contributing
Your improvements are welcome! Feel free to open an <a href="https://github.com/zerodytrash/TikTok-Live-Connector/issues">issue</a> or <a href="https://github.com/zerodytrash/TikTok-Live-Connector/pulls">pull request</a>.
