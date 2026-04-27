import { RoomInfo } from '@/types/client';
import { InvalidRequestError } from '@/types/errors';
import { createRoute } from '@/lib/web/lib/route-wrapper';
import { WebcastHttpRouteArgs } from '@/types/route';
import { BaseFetchRoute } from '@/lib/web/routes/routes';

export type RoomInfoRouteParams = WebcastHttpRouteArgs<{ roomId?: string }>;
export type RoomInfoResponse = any;

/**
 * Fetches room information for a given roomId. If roomId is not provided, it will attempt to use the roomId from the webClient context.
 *
 * @param webClient The HTTP client instance to use for the request.
 * @param roomId The ID of the room to fetch information for. Optional if the webClient has a roomId context.
 */
export const fetchRoomInfoRoute = createRoute<RoomInfoRouteParams, RoomInfoResponse>(
    BaseFetchRoute.FETCH_ROOM_INFO,
    async ({ routeId, webClient, roomId = webClient.roomId }) => {

        if (!roomId) {
            throw new InvalidRequestError({ routeId }, 'Missing roomId. Please provide a roomId to the HTTP client.');
        }

        return await webClient.getJsonObjectFromWebcastApi<RoomInfo>(
            'room/info/',
            {
                ...webClient.clientParams,
                room_id: roomId
            },
            false
        );
    }
);

