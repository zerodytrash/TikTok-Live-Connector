import { describe, expect, it } from 'vitest';
import { InvalidRequestError } from '@/types/errors';
import { fetchRoomInfoRoute } from '@/lib/web/routes/base/fetch-room-info';
import { createMockWebClient, TEST_ROOM_ID } from '../../lib';

describe('fetchRoomInfoRoute', () => {
    it('requests room info for an explicit room id', async () => {
        const webClient = createMockWebClient();
        const response = { data: { roomId: TEST_ROOM_ID } };
        webClient.getJsonObjectFromWebcastApi.mockResolvedValue(response);

        await expect(fetchRoomInfoRoute({ webClient, roomId: TEST_ROOM_ID })).resolves.toEqual(response);
        expect(webClient.getJsonObjectFromWebcastApi).toHaveBeenCalledWith(
            'room/info/',
            {
                ...webClient.clientParams,
                room_id: TEST_ROOM_ID
            },
            false
        );
    });

    it('falls back to the room id stored on the web client', async () => {
        const webClient = createMockWebClient({ roomId: TEST_ROOM_ID });
        const response = { data: { roomId: TEST_ROOM_ID } };
        webClient.getJsonObjectFromWebcastApi.mockResolvedValue(response);

        await expect(fetchRoomInfoRoute({ webClient })).resolves.toEqual(response);
    });

    it('rejects when no room id is available', async () => {
        const webClient = createMockWebClient();

        await expect(fetchRoomInfoRoute({ webClient })).rejects.toBeInstanceOf(InvalidRequestError);
    });
});
