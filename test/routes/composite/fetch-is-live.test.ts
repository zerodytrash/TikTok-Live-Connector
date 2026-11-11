import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InvalidResponseCompositeError } from '@/types/errors';
import { createMockEulerClient, createMockWebClient, TEST_UNIQUE_ID } from '../../lib';

const routeMocks = vi.hoisted(() => ({
    fetchRoomInfoFromHtmlRoute: vi.fn(),
    fetchRoomInfoFromApiLiveRoute: vi.fn(),
    fetchRoomIdFromEulerRoute: vi.fn()
}));

vi.mock('@/lib/web/routes', () => routeMocks);

import { fetchIsLiveComposite, IsLiveRouteConfig } from '@/lib/web/routes/composite/fetch-is-live';

const { fetchRoomInfoFromHtmlRoute, fetchRoomInfoFromApiLiveRoute, fetchRoomIdFromEulerRoute } = routeMocks;

const defaultConfig = { ...IsLiveRouteConfig };

describe('fetchIsLiveComposite', () => {
    beforeEach(() => {
        Object.assign(IsLiveRouteConfig, defaultConfig);
    });

    it('returns the html status result before falling back', async () => {
        const webClient = createMockWebClient();
        const apiClient = createMockEulerClient();
        fetchRoomInfoFromHtmlRoute.mockResolvedValue({
            liveRoom: {
                status: 2
            }
        });

        await expect(fetchIsLiveComposite({ webClient, apiClient, uniqueId: TEST_UNIQUE_ID })).resolves.toBe(true);
        expect(fetchRoomInfoFromApiLiveRoute).not.toHaveBeenCalled();
        expect(fetchRoomIdFromEulerRoute).not.toHaveBeenCalled();
    });

    it('falls back to the api route when html fails', async () => {
        const webClient = createMockWebClient();
        const apiClient = createMockEulerClient();
        fetchRoomInfoFromHtmlRoute.mockRejectedValue(new Error('html blocked'));
        fetchRoomInfoFromApiLiveRoute.mockResolvedValue({
            data: {
                liveRoom: {
                    status: 4
                }
            }
        });

        await expect(fetchIsLiveComposite({ webClient, apiClient, uniqueId: TEST_UNIQUE_ID })).resolves.toBe(false);
        expect(fetchRoomIdFromEulerRoute).not.toHaveBeenCalled();
    });

    it('falls back to euler when earlier sources are skipped', async () => {
        const webClient = createMockWebClient();
        const apiClient = createMockEulerClient();
        IsLiveRouteConfig.skipFetchRoomInfoFromHtmlRoute = true;
        IsLiveRouteConfig.skipFetchRoomInfoFromApiLiveRoute = true;
        fetchRoomIdFromEulerRoute.mockResolvedValue({
            code: 200,
            is_live: true
        });

        await expect(fetchIsLiveComposite({ webClient, apiClient, uniqueId: TEST_UNIQUE_ID })).resolves.toBe(true);
        expect(fetchRoomIdFromEulerRoute).toHaveBeenCalledWith({ webClient, apiClient, uniqueId: TEST_UNIQUE_ID });
    });

    it('aggregates failures when every source fails', async () => {
        const webClient = createMockWebClient();
        const apiClient = createMockEulerClient();
        fetchRoomInfoFromHtmlRoute.mockRejectedValue(new Error('html blocked'));
        fetchRoomInfoFromApiLiveRoute.mockRejectedValue(new Error('api blocked'));
        fetchRoomIdFromEulerRoute.mockRejectedValue(new Error('euler blocked'));

        await expect(fetchIsLiveComposite({ webClient, apiClient, uniqueId: TEST_UNIQUE_ID })).rejects.toBeInstanceOf(InvalidResponseCompositeError);
    });

    it('includes every source failure in the composite error message', async () => {
        const webClient = createMockWebClient();
        const apiClient = createMockEulerClient();
        fetchRoomInfoFromHtmlRoute.mockRejectedValue(new Error('html blocked'));
        fetchRoomInfoFromApiLiveRoute.mockRejectedValue(new Error('api blocked'));
        fetchRoomIdFromEulerRoute.mockRejectedValue(new Error('euler blocked'));

        const err = await fetchIsLiveComposite({ webClient, apiClient, uniqueId: TEST_UNIQUE_ID }).catch((e) => e);
        expect(err).toBeInstanceOf(InvalidResponseCompositeError);
        expect(err.message).toContain('html blocked');
        expect(err.message).toContain('api blocked');
        expect(err.message).toContain('euler blocked');
    });

    it.each([401, 402, 403])('explains how to disable the euler fallback on a %i response', async (code) => {
        const webClient = createMockWebClient();
        const apiClient = createMockEulerClient();
        fetchRoomInfoFromHtmlRoute.mockRejectedValue(new Error('html blocked'));
        fetchRoomInfoFromApiLiveRoute.mockRejectedValue(new Error('api blocked'));
        fetchRoomIdFromEulerRoute.mockResolvedValue({
            code,
            ok: false,
            message: 'Plan does not include this route'
        });

        const err = await fetchIsLiveComposite({ webClient, apiClient, uniqueId: TEST_UNIQUE_ID }).catch((e) => e);
        expect(err).toBeInstanceOf(InvalidResponseCompositeError);
        expect(err.message).toContain(`HTTP ${code}`);
        expect(err.message).toContain('Plan does not include this route');
        expect(err.message).toContain('business');
        expect(err.message).toContain('IsLiveRouteConfig.skipFetchRoomIdFromEulerRoute = true');
        expect(err.message).toContain('signApiKey');
    });
});
