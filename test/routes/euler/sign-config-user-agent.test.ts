import { afterEach, describe, expect, it, vi } from 'vitest';
import { VERSION } from '@/version';

const realVersions = Object.getOwnPropertyDescriptor(process, 'versions')!;

/**
 * The User-Agent is built once when the config module loads, so each case stubs the runtime
 * and then loads a fresh copy of the module.
 */
async function loadSignUserAgent(versions: unknown): Promise<unknown> {
    Object.defineProperty(process, 'versions', { ...realVersions, value: versions });
    vi.resetModules();
    const { SignConfig } = await import('@/lib/web/routes/euler/config');
    return SignConfig.baseOptions?.headers?.['User-Agent'];
}

describe('SignConfig User-Agent', () => {
    afterEach(() => {
        Object.defineProperty(process, 'versions', realVersions);
    });

    it('is unchanged outside Electron', async () => {
        const userAgent = await loadSignUserAgent({ node: '22.11.0' });

        expect(userAgent).toBe(`tiktok-live-connector/${VERSION} ${process.platform}`);
    });

    it('is unchanged when the runtime exposes no process.versions', async () => {
        const userAgent = await loadSignUserAgent(undefined);

        expect(userAgent).toBe(`tiktok-live-connector/${VERSION} ${process.platform}`);
    });

    it('appends the Electron version when running in Electron', async () => {
        const userAgent = await loadSignUserAgent({ node: '22.11.0', electron: '33.2.0' });

        expect(userAgent).toBe(`tiktok-live-connector/${VERSION} ${process.platform} electron/33.2.0`);
    });
});
