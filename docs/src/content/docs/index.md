---
title: TikTok LIVE Connector
description: Read TikTok LIVE events with Node.js and TypeScript.
---

TikTok LIVE Connector receives comments, gifts, likes, follows, viewer counts, battles, and other events from a TikTok livestream. Connect with a creator's username using `TikTokLiveConnection`.

- [Quickstart](/getting-started/quickstart/): install the package and listen for your first events.
- [Event catalog](/events/): find an event by its name or what it does.
- [Power-Ups](/guides/power-ups/): identify battle cards, senders, and target hosts.
- [Configuration](/configuration/options/): connection options and defaults.
- [API reference](/api/): generated from the TypeScript source in this checkout.

These docs describe the modern client on `ts-rewrite`. Use the [migration guide](/getting-started/migration/) when updating code that uses `WebcastPushConnection` or flattened event payloads.

## Before connecting

Use Node.js 20 or newer and run the connector in a Node.js process. It uses Node HTTP and WebSocket libraries; a webpage should receive selected events through your own backend.

Public livestreams do not normally require a TikTok login. Signing uses a third-party provider, Euler Stream by default. Authenticated and mobile connections have additional requirements; see [authentication](/configuration/authentication/).

This is an unofficial reverse-engineering project. TikTok can change its protocol without notice, and a defined event may not be sent in every room or region. See [protocol types](/advanced/protocol/) for how to distinguish schema definitions from verified event behavior.

## Documentation versions

The guides and generated API belong to the same checkout. Check the package version when comparing these pages with an installed release. A dependency update can change message fields even when an event name stays the same.

For the Python implementation, see [TikTokLive](https://github.com/isaackogan/TikTokLive). For the managed Euler Stream service, see [Euler Stream's documentation](https://www.eulerstream.com/docs). Their authentication, names, and response shapes can differ from this Node.js package.
