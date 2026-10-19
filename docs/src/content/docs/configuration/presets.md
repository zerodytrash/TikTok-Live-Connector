---
title: Presets and protocol defaults
description: Device identity, location, screen presets, and configuration merging.
sidebar:
  order: 5
---

`getRandomPresets()` returns `{ device, location, screen }`. Each connection uses these to resolve HTTP and WebSocket parameters. By default, the device helper selects the preset at `Devices[6]`, the location is Germany with English language settings and `Europe/Berlin`, and the screen is 1920 × 1080. The `RANDOMIZE_TIKTOK_*` variables opt into random selection.

## Supply a complete preset

```ts
import { getRandomPresets, TikTokLiveConnection } from 'tiktok-live-connector';

const presets = getRandomPresets();
const connection = new TikTokLiveConnection('creator_username', {
    clientPresets: {
        ...presets,
        screen: { screen_width: 1920, screen_height: 1080 },
    },
});
```

`DevicePreset`, `LocationPreset`, `ScreenPreset`, `GetWebConfigParams`, and `GetWebSocketConfigParams` describe the shapes in the API reference. `Devices`, `Locations`, `Screens`, and `UserAgents` expose the available collections. `userAgentToDevicePreset()` derives a basic device preset from a User-Agent string; it does not parse a full browser identity database.

## Override protocol fields

The config builders clone the defaults. `getWebConfig()` fills HTTP language, device, region, screen, timezone, and User-Agent values, and generates a device ID. `getWebSocketConfigDefaults()` fills the socket values.

`WebcastWebConfigDefaults` and `WebSocketConfigDefaults` contain template values. Resolve them with the builders before replacing a nested object:

```ts
import { getRandomPresets, getWebConfig, TikTokLiveConnection } from 'tiktok-live-connector';

const clientPresets = getRandomPresets();
const webConfig = getWebConfig(clientPresets);
const connection = new TikTokLiveConnection('creator_username', {
    clientPresets,
    webConfigOverrides: {
        DEFAULT_HTTP_CLIENT_PARAMS: {
            ...webConfig.DEFAULT_HTTP_CLIENT_PARAMS,
            app_language: 'en',
        },
    },
});
```

Transport `headers` and HTTP `searchParams` are merged separately by the clients. Protocol overrides are shallow replacements. Connection-specific room IDs, cursors, and socket parameters are subsequently supplied by the connection process.

Change protocol values only when you understand the required TikTok request shape. A valid TypeScript object does not establish that TikTok accepts an arbitrary device, location, or combination of fields.
