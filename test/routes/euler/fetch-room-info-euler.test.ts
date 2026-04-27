import { describe, expect, it } from 'vitest';
import { fetchRoomInfoFromEulerRoute } from '@/lib/web/routes/euler/fetch-room-info-euler';
import { createAxiosResponse, createMockEulerClient, createMockWebClient, TEST_UNIQUE_ID } from '../../lib';

describe('fetchRoomInfoFromEulerRoute', () => {
    it('delegates to the euler premium client', async () => {
        const webClient = createMockWebClient();
        const apiClient = createMockEulerClient();
        const responseBody = {
            ok: true,
            room_id: '7140000000000000001'
        };

        apiClient.premium.retrieveRoomInfo.mockResolvedValue(createAxiosResponse(responseBody));

        await expect(fetchRoomInfoFromEulerRoute({ webClient, apiClient, uniqueId: TEST_UNIQUE_ID })).resolves.toEqual(responseBody);
        expect(apiClient.premium.retrieveRoomInfo).toHaveBeenCalledWith(TEST_UNIQUE_ID, undefined);
    });
});
