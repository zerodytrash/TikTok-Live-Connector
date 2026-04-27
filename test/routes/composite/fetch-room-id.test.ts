import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InvalidResponseCompositeError } from '@/types/errors';
import { createMockEulerClient, createMockWebClient, TEST_ROOM_ID, TEST_UNIQUE_ID } from '../../lib';

const routeMocks = vi.hoisted(() => ({
    fetchRoomInfoFromHtmlRoute: vi.fn(),
    fetchRoomInfoFromApiLiveRoute: vi.fn(),
    fetchRoomIdFromEulerRoute: vi.fn()
}));

vi.mock('@/lib/web/routes', () => routeMocks);

import { fetchRoomIdComposite, RoomIdRouteConfig } from '@/lib/web/routes/composite/fetch-room-id';

const { fetchRoomInfoFromHtmlRoute, fetchRoomInfoFromApiLiveRoute, fetchRoomIdFromEulerRoute } = routeMocks;

const defaultConfig = { ...RoomIdRouteConfig };

describe('fetchRoomIdComposite', () => {
    beforeEach(() => {
        Object.assign(RoomIdRouteConfig, defaultConfig);
    });

    it('returns the room id from the html route first', async () => {
        const webClient = createMockWebClient();
        const apiClient = createMockEulerClient();
        fetchRoomInfoFromHtmlRoute.mockResolvedValue({
            user: {
                roomId: TEST_ROOM_ID
            }
        });

        await expect(fetchRoomIdComposite({ webClient, apiClient, uniqueId: TEST_UNIQUE_ID })).resolves.toBe(TEST_ROOM_ID);
        expect(fetchRoomInfoFromApiLiveRoute).not.toHaveBeenCalled();
        expect(fetchRoomIdFromEulerRoute).not.toHaveBeenCalled();
    });

    it('falls back to the api route when html fails', async () => {
        const webClient = createMockWebClient();
        const apiClient = createMockEulerClient();
        fetchRoomInfoFromHtmlRoute.mockRejectedValue(new Error('html blocked'));
        fetchRoomInfoFromApiLiveRoute.mockResolvedValue({
            data: {
                user: {
                    roomId: TEST_ROOM_ID
                }
            }
        });

        await expect(fetchRoomIdComposite({ webClient, apiClient, uniqueId: TEST_UNIQUE_ID })).resolves.toBe(TEST_ROOM_ID);
        expect(fetchRoomIdFromEulerRoute).not.toHaveBeenCalled();
    });

    it('falls back to euler when earlier sources are skipped', async () => {
        const webClient = createMockWebClient();
        const apiClient = createMockEulerClient();
        RoomIdRouteConfig.skipFetchRoomInfoFromHtmlRoute = true;
        RoomIdRouteConfig.skipFetchRoomInfoFromApiLiveRoute = true;
        fetchRoomIdFromEulerRoute.mockResolvedValue({
            code: 200,
            ok: true,
            room_id: TEST_ROOM_ID
        });

        await expect(fetchRoomIdComposite({ webClient, apiClient, uniqueId: TEST_UNIQUE_ID })).resolves.toBe(TEST_ROOM_ID);
        expect(fetchRoomIdFromEulerRoute).toHaveBeenCalledWith({ webClient, apiClient, uniqueId: TEST_UNIQUE_ID });
    });

    it('aggregates failures when all sources fail', async () => {
        const webClient = createMockWebClient();
        const apiClient = createMockEulerClient();
        fetchRoomInfoFromHtmlRoute.mockRejectedValue(new Error('html blocked'));
        fetchRoomInfoFromApiLiveRoute.mockRejectedValue(new Error('api blocked'));
        fetchRoomIdFromEulerRoute.mockRejectedValue(new Error('euler blocked'));

        await expect(fetchRoomIdComposite({ webClient, apiClient, uniqueId: TEST_UNIQUE_ID })).rejects.toBeInstanceOf(InvalidResponseCompositeError);
    });
});
