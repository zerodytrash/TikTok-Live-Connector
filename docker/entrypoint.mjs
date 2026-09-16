/**
 * Container entrypoint for ghcr.io/zerodytrash/tiktok-live-connector.
 *
 * Connects to a TikTok LIVE stream and writes one JSON object per line to
 * stdout for every event the library emits. Diagnostics go to stderr.
 *
 *   docker run --rm -e SIGN_API_KEY=<key> ghcr.io/zerodytrash/tiktok-live-connector <uniqueId>
 *
 * Environment:
 *   TIKTOK_UNIQUE_ID  Username to connect to (alternative to the positional argument)
 *   TIKTOK_EVENTS     Comma-separated list of events to emit (default: all message events)
 *   SIGN_API_KEY      Euler Stream API key, read by the library itself
 *   SIGN_API_URL      Custom sign server base URL, read by the library itself
 *
 * Exit codes: 0 stream ended or signal received, 1 connection error, 2 usage error.
 */
import { ControlEvent, TikTokLiveConnection, VERSION, WebcastEvent } from 'tiktok-live-connector';

const IMAGE = 'ghcr.io/zerodytrash/tiktok-live-connector';

function usage() {
    return [
        `Usage: docker run --rm -e SIGN_API_KEY=<key> ${IMAGE} <uniqueId>`,
        '',
        'Streams TikTok LIVE events for <uniqueId> to stdout, one JSON object per line:',
        '  {"event":"chat","ts":1758000000000,"data":{...}}',
        '',
        'Environment:',
        '  TIKTOK_UNIQUE_ID  Username to connect to (alternative to the argument)',
        '  TIKTOK_EVENTS     Comma-separated events to emit, e.g. chat,gift,like (default: all)',
        '  SIGN_API_KEY      Euler Stream API key (https://www.eulerstream.com)',
        '  SIGN_API_URL      Custom sign server base URL',
        '',
        'Exit codes: 0 stream ended or signal received, 1 connection error, 2 usage error.',
        ''
    ].join('\n');
}

function log(message) {
    process.stderr.write(`[tiktok-live-connector] ${message}\n`);
}

// Protobuf bytes fields decode to Buffer / Uint8Array and int64 fields may be
// bigint; neither is representable in JSON by default. Buffer has its own
// toJSON() that runs before the replacer, so inspect the raw holder value.
function replacer(key, value) {
    const raw = this[key];
    if (raw instanceof Uint8Array) {
        return Buffer.from(raw).toString('base64');
    }
    if (typeof value === 'bigint') {
        return value.toString();
    }
    return value;
}

function emit(event, data) {
    try {
        process.stdout.write(`${JSON.stringify({ event, ts: Date.now(), data }, replacer)}\n`);
    } catch (err) {
        log(`Failed to serialize "${event}" event: ${err?.message ?? err}`);
    }
}

// Accept enum keys (CHAT) or values (chat), case-insensitively.
function resolveEvents(spec) {
    const all = Object.values(WebcastEvent);
    if (!spec?.trim()) {
        return all;
    }

    const byName = new Map();
    for (const [key, value] of Object.entries(WebcastEvent)) {
        byName.set(key.toLowerCase(), value);
        byName.set(value.toLowerCase(), value);
    }

    const chosen = new Set();
    const unknown = [];
    for (const raw of spec.split(',')) {
        const name = raw.trim();
        if (!name) continue;
        const value = byName.get(name.toLowerCase());
        if (value) chosen.add(value); else unknown.push(name);
    }

    if (unknown.length > 0) {
        log(`Unknown event(s) in TIKTOK_EVENTS: ${unknown.join(', ')}`);
        log(`Valid events: ${all.join(', ')}`);
        process.exit(2);
    }

    return [...chosen];
}

const arg = (process.argv[2] ?? '').trim();

if (arg === '--version' || arg === '-v') {
    process.stdout.write(`${VERSION}\n`);
    process.exit(0);
}

if (arg === '--help' || arg === '-h') {
    process.stdout.write(usage());
    process.exit(0);
}

const uniqueId = (arg || process.env.TIKTOK_UNIQUE_ID || '').trim().replace(/^@/, '');

if (!uniqueId) {
    process.stderr.write(usage());
    process.exit(2);
}

if (!process.env.SIGN_API_KEY) {
    log('SIGN_API_KEY is not set; connections may be rate-limited or rejected by the sign server.');
}

const events = resolveEvents(process.env.TIKTOK_EVENTS);
const connection = new TikTokLiveConnection(uniqueId, {});

let shuttingDown = false;
let streamEnded = false;

// A consumer closing the pipe (e.g. `| head`) is a normal way to stop.
process.stdout.on('error', (err) => {
    if (err?.code === 'EPIPE') {
        process.exit(0);
    }
    log(`stdout error: ${err?.message ?? err}`);
    process.exit(1);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
        if (shuttingDown) {
            process.exit(130);
        }
        shuttingDown = true;
        log(`Received ${signal}, disconnecting`);
        connection.disconnect().catch(() => undefined).finally(() => process.exit(0));
    });
}

for (const event of events) {
    connection.on(event, (data) => emit(event, data));
}

connection.on(WebcastEvent.STREAM_END, () => {
    streamEnded = true;
});

connection.on(ControlEvent.CONNECTED, (state) => {
    log(`Connected to @${uniqueId} (roomId ${state.roomId})`);
    emit(ControlEvent.CONNECTED, { uniqueId, roomId: state.roomId });
});

connection.on(ControlEvent.ERROR, ({ info, exception }) => {
    log(`${info ?? 'Error'}${exception?.message ? `: ${exception.message}` : ''}`);
    emit(ControlEvent.ERROR, { info, message: exception?.message ?? String(exception ?? '') });
});

connection.on(ControlEvent.DISCONNECTED, ({ code, reason }) => {
    emit(ControlEvent.DISCONNECTED, { code, reason, streamEnded });
    if (shuttingDown) {
        return;
    }
    if (streamEnded) {
        log('Stream ended');
        process.exit(0);
    }
    log(`Disconnected (code ${code}${reason ? `, ${reason}` : ''})`);
    process.exit(1);
});

log(`tiktok-live-connector ${VERSION}, connecting to @${uniqueId} (${events.length === Object.values(WebcastEvent).length ? 'all events' : events.join(', ')})`);

connection.connect().catch((err) => {
    log(`Failed to connect: ${err?.message ?? err}`);
    process.exit(1);
});
