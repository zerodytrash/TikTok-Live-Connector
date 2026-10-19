# TikTok LIVE API for Node.JS (Unofficial)

[TikTok LIVE API](https://www.eulerstream.com/) Client for Node.JS (Unofficial, Unaffiliated with ByteDance Ltd.)

Connect to any [TikTok LIVE](https://www.tiktok.com/live) stream and receive real-time chat messages,
gifts, likes, follows, shares, viewer counts and battles using just a creator's username (`@uniqueId`).
No login, credentials or app registration are required.

TikTokLiveConnector reads TikTok's internal Webcast push service directly, which makes it the foundation for
TikTok chat bots, gift trackers, OBS overlays, donation alerts, moderation tools and livestream analytics.
It works for your own live chat and for any other creator's.

Tracked events include chat, members joining, gifts, viewers, follows, shares, questions, likes,
super fans and battles. See the [event catalog](docs/src/content/docs/events/index.md) for the full list.

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

## Getting Started

Use Node.js 20 or newer. The package is ESM; use an `.mjs` file or set `"type": "module"` in your application.

```sh
npm install tiktok-live-connector
```

```ts
import { ControlEvent, TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username');

connection.on(ControlEvent.ERROR, ({ info, exception }) => console.error(info, exception));
connection.on(WebcastEvent.CHAT, (event) => {
    console.log(`${event.user?.displayId ?? 'unknown'}: ${event.content}`);
});
connection.on(WebcastEvent.GIFT, (event) => {
    console.log(`${event.user?.displayId ?? 'unknown'} sent gift ${event.giftId}`);
});

try {
    const state = await connection.connect();
    console.log(`Connected to room ${state.roomId}`);
} catch (error) {
    console.error('Could not connect', error);
}
```

Replace `creator_username` with a creator who is live. Register listeners before connecting so they also receive the initial message batch. Modern payloads retain their protobuf structure: chat text is `content`, and regular user fields include `user.id`, `user.displayId` and `user.nickname`.

## Documentation

The documentation site uses Starlight and TypeDoc. It includes usage guides, all modern-client events, and generated API and protobuf reference pages. See [docs/README.md](docs/README.md) for setup and build instructions.

| Topic | Documentation |
| --- | --- |
| Installation and connection lifecycle | [Quickstart](docs/src/content/docs/getting-started/quickstart.md), [connection](docs/src/content/docs/getting-started/connection.md) |
| Constructor options and authentication | [Options](docs/src/content/docs/configuration/options.md), [authentication](docs/src/content/docs/configuration/authentication.md), [signing](docs/src/content/docs/configuration/signing.md) |
| Events and payload types | [Event catalog](docs/src/content/docs/events/index.md), [control events](docs/src/content/docs/events/control.md) |
| Gifts, battles and Power-Ups | [Gifts](docs/src/content/docs/guides/gifts.md), [battles](docs/src/content/docs/guides/battles.md), [Power-Ups](docs/src/content/docs/guides/power-ups.md) |
| Room information and sending chat | [Room data](docs/src/content/docs/guides/room-data.md), [send chat](docs/src/content/docs/guides/send-chat.md) |
| Routes, transports and protobuf decoding | [Routes](docs/src/content/docs/advanced/routes.md), [HTTP](docs/src/content/docs/advanced/http.md), [WebSocket](docs/src/content/docs/advanced/websocket.md), [decoding](docs/src/content/docs/advanced/protocol.md) |
| Updating older applications | [Migration](docs/src/content/docs/getting-started/migration.md) |
| Connection and signing errors | [Troubleshooting](docs/src/content/docs/troubleshooting.md) |

To preview the complete site from this checkout, install the library dependencies and the docs dependencies, then start the site. The docs tooling requires Node.js 22.22 or newer.

```sh
pnpm install --frozen-lockfile
pnpm --dir docs install --frozen-lockfile
pnpm --dir docs dev
```

Use `pnpm --dir docs build` to validate examples, generate the reference pages and search index, and check internal links.

## Examples

The guides include examples for [gift streak handling](docs/src/content/docs/guides/gifts.md), [Power-Up attribution](docs/src/content/docs/guides/power-ups.md), [waiting until a creator is live](docs/src/content/docs/getting-started/connection.md), [route overrides](docs/src/content/docs/advanced/routes.md), and [forwarding events to an overlay](docs/src/content/docs/guides/backend.md).

For a chat-reader application, see [TikTok-Chat-Reader](https://github.com/zerodytrash/TikTok-Chat-Reader).

## Contributors

* **Zerody** - *Initial Reverse-Engineering and Protobuf-Decoding* - [Zerody](https://github.com/zerodytrash/)
* **Isaac Kogan** - *TypeScript Rewrite, Sign-Server Maintainer* - [isaackogan](https://github.com/isaackogan)

## License

This project is licensed under a modified AGPL License. See the [LICENSE](LICENSE) file for details.
