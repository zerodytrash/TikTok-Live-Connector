import { describe, it } from 'vitest';
import { setTimeout as sleep } from 'node:timers/promises';
import { performance } from 'node:perf_hooks';
import { ControlEvent, TikTokLiveConnection } from '@/index';
import { hasEulerApiKey, getRequiredSignApiKey } from '../lib';

const TARGET_USER = 'tv_asahi_news';
const NUM_CONNECTIONS = 5;
const WATCH_DURATION_MS = 120_000;
const SAMPLE_INTERVAL_MS = 5_000;

// Allow setup (connect) + 120s watch + teardown.
const TEST_TIMEOUT_MS = 240_000;

const describeIfEulerConfigured = hasEulerApiKey() ? describe : describe.skip;

type Sample = {
    label: string;
    elapsedMs: number;
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
    arrayBuffers: number;
};

function tryGc(): void {
    const maybeGc = (globalThis as { gc?: () => void }).gc;
    if (typeof maybeGc === 'function') {
        maybeGc();
        maybeGc();
    }
}

function takeSample(label: string, startedAt: number): Sample {
    tryGc();
    const m = process.memoryUsage();
    return {
        label,
        elapsedMs: Math.round(performance.now() - startedAt),
        rss: m.rss,
        heapUsed: m.heapUsed,
        heapTotal: m.heapTotal,
        external: m.external,
        arrayBuffers: m.arrayBuffers
    };
}

function fmtBytes(n: number): string {
    const sign = n < 0 ? '-' : '';
    const v = Math.abs(n);
    if (v >= 1024 * 1024) return `${sign}${(v / 1024 / 1024).toFixed(2)} MiB`;
    if (v >= 1024) return `${sign}${(v / 1024).toFixed(2)} KiB`;
    return `${sign}${v} B`;
}

function fmtMs(n: number): string {
    return `${(n / 1000).toFixed(1)}s`;
}

function linearRegressionSlope(xs: number[], ys: number[]): number {
    const n = xs.length;
    if (n < 2) return 0;
    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = ys.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
        num += (xs[i] - meanX) * (ys[i] - meanY);
        den += (xs[i] - meanX) ** 2;
    }
    return den === 0 ? 0 : num / den;
}

async function connectOne(index: number, apiKey: string): Promise<TikTokLiveConnection> {
    const connection = new TikTokLiveConnection(TARGET_USER, {
        signApiKey: apiKey,
        processInitialData: false,
        fetchRoomInfoOnConnect: false,
        enableExtendedGiftInfo: false
    });

    // Swallow errors so a single failed connection does not abort the suite.
    connection.on(ControlEvent.ERROR, (err) => {
        console.warn(`[conn ${index}] error:`, err?.error?.message ?? err);
    });

    await connection.connect();
    return connection;
}

describeIfEulerConfigured('connection memory footprint', () => {
    it(
        `measures marginal RSS/heap per connection across ${NUM_CONNECTIONS} concurrent connections to ${TARGET_USER}`,
        { timeout: TEST_TIMEOUT_MS },
        async () => {
            const apiKey = getRequiredSignApiKey();
            const startedAt = performance.now();
            const samples: Sample[] = [];

            // Warm up Node internals so the baseline reflects steady state.
            await sleep(250);
            samples.push(takeSample('baseline', startedAt));

            const connections: TikTokLiveConnection[] = [];

            try {
                for (let i = 0; i < NUM_CONNECTIONS; i++) {
                    const conn = await connectOne(i, apiKey);
                    connections.push(conn);
                    // Let buffers settle before sampling.
                    await sleep(500);
                    samples.push(takeSample(`after-connect-${i + 1}`, startedAt));
                }

                const watchStart = performance.now();
                samples.push(takeSample('watch-start', startedAt));

                let watchSampleIdx = 0;
                while (performance.now() - watchStart < WATCH_DURATION_MS) {
                    await sleep(SAMPLE_INTERVAL_MS);
                    watchSampleIdx += 1;
                    samples.push(takeSample(`watch-${watchSampleIdx}`, startedAt));
                }

                samples.push(takeSample('watch-end', startedAt));
            } finally {
                for (const conn of connections) {
                    try {
                        await conn.disconnect();
                    } catch (err) {
                        console.warn('disconnect error:', err);
                    }
                }
            }

            await sleep(1_000);
            samples.push(takeSample('after-disconnect', startedAt));

            // Drop our refs to the connection objects, then sample again.
            // If after-disconnect retention is just "test holds connections in array",
            // this sample should drop back near baseline. If it doesn't, it's a real leak.
            connections.length = 0;
            await sleep(500);
            samples.push(takeSample('after-release-refs', startedAt));

            // ----- Reporting -----
            const baseline = samples.find((s) => s.label === 'baseline')!;
            const watchStartSample = samples.find((s) => s.label === 'watch-start')!;
            const watchEndSample = samples.find((s) => s.label === 'watch-end')!;
            const afterDisconnect = samples.find((s) => s.label === 'after-disconnect')!;
            const afterReleaseRefs = samples.find((s) => s.label === 'after-release-refs')!;

            const watchSamples = samples.filter((s) => s.label.startsWith('watch-') && s.label !== 'watch-start' && s.label !== 'watch-end');

            const totalDeltaRss = watchEndSample.rss - baseline.rss;
            const totalDeltaHeap = watchEndSample.heapUsed - baseline.heapUsed;

            const marginalRss = totalDeltaRss / NUM_CONNECTIONS;
            const marginalHeap = totalDeltaHeap / NUM_CONNECTIONS;

            // Growth rate during the watch window — a positive slope here is the
            // signature of a leak, while a flat slope means the marginal-per-connection
            // measurement reflects steady-state cost.
            const xs = watchSamples.map((s) => (s.elapsedMs - watchStartSample.elapsedMs) / 1000);
            const heapSlopeBytesPerSec = linearRegressionSlope(xs, watchSamples.map((s) => s.heapUsed));
            const rssSlopeBytesPerSec = linearRegressionSlope(xs, watchSamples.map((s) => s.rss));

            // ----- Print -----
            const header = ['label', 'elapsed', 'rss', 'heapUsed', 'heapTotal', 'external', 'arrayBuffers'];
            const rows = samples.map((s) => [
                s.label,
                fmtMs(s.elapsedMs),
                fmtBytes(s.rss),
                fmtBytes(s.heapUsed),
                fmtBytes(s.heapTotal),
                fmtBytes(s.external),
                fmtBytes(s.arrayBuffers)
            ]);

            const widths = header.map((h, i) =>
                Math.max(h.length, ...rows.map((r) => r[i].length))
            );

            const formatRow = (cells: string[]): string =>
                cells.map((c, i) => c.padEnd(widths[i])).join('  ');

            console.log('\n=== Memory Footprint Samples ===');
            console.log(formatRow(header));
            console.log(formatRow(widths.map((w) => '-'.repeat(w))));
            for (const row of rows) console.log(formatRow(row));

            console.log('\n=== Interpretation ===');
            console.log(`Connections opened          : ${NUM_CONNECTIONS}`);
            console.log(`Watch window                : ${fmtMs(WATCH_DURATION_MS)}`);
            console.log(`Δ RSS (baseline → watch-end) : ${fmtBytes(totalDeltaRss)}`);
            console.log(`Δ Heap (baseline → watch-end): ${fmtBytes(totalDeltaHeap)}`);
            console.log(`Marginal RSS  / connection  : ${fmtBytes(marginalRss)}`);
            console.log(`Marginal Heap / connection  : ${fmtBytes(marginalHeap)}`);
            console.log(`Heap slope during watch     : ${fmtBytes(heapSlopeBytesPerSec)}/s`);
            console.log(`RSS  slope during watch     : ${fmtBytes(rssSlopeBytesPerSec)}/s`);
            console.log(`Δ RSS after disconnect      : ${fmtBytes(afterDisconnect.rss - baseline.rss)} (residual)`);
            console.log(`Δ Heap after disconnect     : ${fmtBytes(afterDisconnect.heapUsed - baseline.heapUsed)} (residual)`);
            console.log(`Δ RSS after releasing refs  : ${fmtBytes(afterReleaseRefs.rss - baseline.rss)} (true residual)`);
            console.log(`Δ Heap after releasing refs : ${fmtBytes(afterReleaseRefs.heapUsed - baseline.heapUsed)} (true residual)`);

            const gcAvailable = typeof (globalThis as { gc?: () => void }).gc === 'function';
            if (!gcAvailable) {
                console.log(
                    '\nNote: run with `node --expose-gc` (e.g. NODE_OPTIONS="--expose-gc" npm run test) for stable readings.'
                );
            }

            // No assertions — this is a profiling test. Failure modes are:
            // crash on connect, timeout, or test runner abort. Numbers are
            // emitted via console for human interpretation.
        }
    );
});
