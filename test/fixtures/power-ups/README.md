# Power-Up fixtures

These payloads are synthetic, generated with Python's `TikTokLiveProto==0.2.2` v3 schema.
They contain invented identifiers and users, with distinct sender, wrapper anchor, target, and room IDs.
They verify wire decoding and event dispatch, not real-world cohost attribution.

To regenerate, install `TikTokLiveProto==0.2.2` in a Python 3.10+ virtual environment and run
`python test/fixtures/power-ups/generate.py` from the repository root. Python is only needed for
regeneration; normal tests read the committed JSON.

The fixtures cover nine use variants, guides, awards, effect notices, unknown actions,
missing nested data, large identifiers, and an unknown protobuf field. Special-effect use
contains two affected anchor pairs so tests cannot silently reduce it to one target.
