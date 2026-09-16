import { describe, expect, it } from 'vitest';
import { TikTokLiveConnection } from '@/lib/client';

describe('TikTokLiveConnection constructor', () => {
    it('can be constructed with only a uniqueId, as documented in the README', () => {
        const connection = new TikTokLiveConnection('tv_asahi_news');

        expect(connection.uniqueId).toBe('tv_asahi_news');
        expect(connection.options).toEqual({
            processInitialData: true,
            fetchRoomInfoOnConnect: true,
            enableExtendedGiftInfo: false,
            authenticateWs: undefined,
            useMobile: undefined
        });
    });
});
