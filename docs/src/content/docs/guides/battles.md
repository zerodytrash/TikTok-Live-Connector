---
title: Battles and cohosting
description: Read battle state, score updates, team fields, and Power-Ups.
---

Battle and cohost messages describe different parts of a session. Group your application state by `battleId` when present, retain room and channel context, and keep IDs as strings.

## Battle state and scores

`LINK_MIC_BATTLE` carries `WebcastLinkMicBattle`. It includes an `action`, `battleSettings`, participant information in `anchorsInfo`, team fields, and result structures. It is a battle state/action message; do not assume every arrival starts a new battle.

`LINK_MIC_ARMIES` carries `WebcastLinkMicArmies`. Its `armies` map, `teamArmies`, `battleSettings`, `triggerReason`, and score-related fields describe a score update. The map keys and team layout should be interpreted with the corresponding participant data, not hard-coded as the connected host and a single opponent.

```ts
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';

const connection = new TikTokLiveConnection('creator_username', {});
connection.on(WebcastEvent.LINK_MIC_BATTLE, (event) => {
    console.log(event.battleId, event.action, event.anchorsInfo, event.teamMember);
});
connection.on(WebcastEvent.LINK_MIC_ARMIES, (event) => {
    console.log(event.battleId, event.armies, event.teamArmies);
});
await connection.connect();
```

Do not add every score snapshot as though it were a new gift. A battle score can be affected by multipliers or other rules, and a score total is not a monetary total.

## Related messages

- `LINK_MIC_BATTLE_ITEM_CARD`: Power-Up use, awards, and notices. See [Power-Ups](https://ttlc.docs.isaackogan.com/guides/power-ups/).
- `LINK_MIC_BATTLE_TASK`: battle task payloads.
- `LINK_MIC_BATTLE_PUNISH_FINISH`: punishment-phase completion, with its battle and channel context.
- `LINK_MIC_FAN_TICKET_METHOD`: fan-ticket room notices.
- `LINK_MIC_METHOD`, `LINK_MESSAGE`, `LINK_LAYER`, `LINK_STATE`, and `LINK_MIC_LAYOUT_STATE`: cohosting protocol state and layout messages.

The [battle and cohost event reference](https://ttlc.docs.isaackogan.com/events/battles-and-cohosting/) lists the payload types. Several are protocol-level messages with variant-specific nested content. The connector does not combine them into a normalized cohost graph.

## Handling incomplete data

Keep the original IDs and message subtype while developing mappings. A missing field does not establish a zero score, an absent participant, or a different team. Clear or archive your state when the applicable battle action indicates a transition; avoid reusing a previous battle's participants just because the same hosts remain connected.
