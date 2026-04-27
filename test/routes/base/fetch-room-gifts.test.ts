import { describe, expect, it } from 'vitest';
import { InvalidRequestError } from '@/types/errors';
import { fetchRoomGiftsRoute } from '@/lib/web/routes/base/fetch-room-gifts';
import { createMockWebClient, TEST_ROOM_ID } from '../../lib';

describe('fetchRoomGiftsRoute', () => {
    it('returns the room gifts for an explicit room id', async () => {
        const webClient = createMockWebClient();
        const gifts = [{ gift_id: 'rose' }];
        webClient.getJsonObjectFromWebcastApi.mockResolvedValue({
            data: {
                gifts
            }
        });

        await expect(fetchRoomGiftsRoute({ webClient, roomId: TEST_ROOM_ID })).resolves.toEqual(gifts);
        expect(webClient.getJsonObjectFromWebcastApi).toHaveBeenCalledWith(
            'gift/list/',
            {
                ...webClient.clientParams,
                room_id: TEST_ROOM_ID
            },
            false
        );
    });

    it('falls back to the room id stored on the web client', async () => {
        const webClient = createMockWebClient({ roomId: TEST_ROOM_ID });
        webClient.getJsonObjectFromWebcastApi.mockResolvedValue({
            data: {
                gifts: []
            }
        });

        await expect(fetchRoomGiftsRoute({ webClient })).resolves.toEqual([]);
    });

    it('rejects when no room id is available', async () => {
        const webClient = createMockWebClient();

        await expect(fetchRoomGiftsRoute({ webClient })).rejects.toBeInstanceOf(InvalidRequestError);
    });
});
