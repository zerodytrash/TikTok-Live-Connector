import { InvalidRequestError } from '@/types/errors';
import { createRoute } from '@/lib/web/lib/route-wrapper';
import { WebcastHttpRouteArgs } from '@/types/route';
import { BaseFetchRoute } from '@/lib/web/routes/routes';

export type RoomGiftsRouteParams = WebcastHttpRouteArgs<{ roomId?: string }>;
export type RoomGiftsResponse = any;

/**
 * Fetches the list of gifts available in a TikTok LIVE room. If `roomId` is not provided, the
 * `roomId` currently set on the `webClient` is used.
 *
 * @param webClient The HTTP client instance to use for the request.
 * @param roomId The ID of the room whose gift list to fetch. Optional if the webClient has a roomId context.
 */
export const fetchRoomGiftsRoute = createRoute<RoomGiftsRouteParams, RoomGiftsResponse>(
    BaseFetchRoute.FETCH_ROOM_GIFTS,
    async ({ routeId, webClient, roomId = webClient.roomId }) => {

        if (!roomId) {
            throw new InvalidRequestError({ routeId }, 'Missing roomId. Please provide a roomId to the HTTP client.');
        }

        const response = await webClient.getJsonObjectFromWebcastApi<RoomGiftsResponse>(
            'gift/list/',
            {
                ...webClient.clientParams,
                room_id: roomId
            },
            false
        );

        return response.data.gifts;
    }
);

