import { describe, expect, it } from 'vitest';
import { fetchRoomIdFromEulerRoute } from '@/lib/web/routes/euler/fetch-room-id-euler';
import { createAxiosResponse, createMockEulerClient, createMockWebClient, TEST_ROOM_ID, TEST_UNIQUE_ID } from '../../lib';

describe('fetchRoomIdFromEulerRoute', () => {
    it('delegates to the euler webcast client', async () => {
        const webClient = createMockWebClient();
        const apiClient = createMockEulerClient();
        const responseBody = {
            code: 200,
            ok: true,
            room_id: TEST_ROOM_ID
        };

        apiClient.webcast.retrieveRoomId.mockResolvedValue(createAxiosResponse(responseBody));

        await expect(fetchRoomIdFromEulerRoute({ webClient, apiClient, uniqueId: TEST_UNIQUE_ID })).resolves.toEqual(responseBody);
        expect(apiClient.webcast.retrieveRoomId).toHaveBeenCalledWith(TEST_UNIQUE_ID, undefined);
    });
});
