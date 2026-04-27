import { describe, expect, it } from 'vitest';
import { InvalidResponseError } from '@/types/errors';
import { fetchRoomInfoFromApiLiveRoute } from '@/lib/web/routes/base/fetch-room-info-api-live';
import { API_LIVE_ROOM_INFO_FIXTURE, TEST_UNIQUE_ID, createMockWebClient } from '../../lib';

describe('fetchRoomInfoFromApiLiveRoute', () => {
    it('returns room info when the TikTok API responds successfully', async () => {
        const webClient = createMockWebClient();
        webClient.getJsonObjectFromTikTokApi.mockResolvedValue(API_LIVE_ROOM_INFO_FIXTURE);

        await expect(fetchRoomInfoFromApiLiveRoute({ webClient, uniqueId: TEST_UNIQUE_ID })).resolves.toEqual(API_LIVE_ROOM_INFO_FIXTURE);
        expect(webClient.getJsonObjectFromTikTokApi).toHaveBeenCalledWith(
            'api-live/user/room/',
            {
                ...webClient.clientParams,
                uniqueId: TEST_UNIQUE_ID,
                sourceType: '54'
            }
        );
    });

    it('rejects when the upstream API returns a status code', async () => {
        const webClient = createMockWebClient();
        webClient.getJsonObjectFromTikTokApi.mockResolvedValue({
            statusCode: 1001,
            message: 'rate limited'
        });

        await expect(fetchRoomInfoFromApiLiveRoute({ webClient, uniqueId: TEST_UNIQUE_ID })).rejects.toBeInstanceOf(InvalidResponseError);
    });

    it('rejects when the room id is missing from the response', async () => {
        const webClient = createMockWebClient();
        webClient.getJsonObjectFromTikTokApi.mockResolvedValue({
            statusCode: 0,
            data: {}
        });

        await expect(fetchRoomInfoFromApiLiveRoute({ webClient, uniqueId: TEST_UNIQUE_ID })).rejects.toBeInstanceOf(InvalidResponseError);
    });
});
