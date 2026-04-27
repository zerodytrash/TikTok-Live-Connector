import { WebcastRoomIdRouteResponse } from '@eulerstream/euler-api-sdk';
import { createRoute } from '@/lib/web/lib/route-wrapper';
import { WebcastHttpEulerRouteArgs } from '@/types/route';
import { EulerFetchRoute } from '@/lib/web/routes/routes';

export type FetchRoomIdFromEulerRouteParams = WebcastHttpEulerRouteArgs<{
    uniqueId: string
}>;

/**
 * Fetches a room ID from Euler Stream using the provided uniqueId.
 *
 * @param apiClient The Euler Stream API client to use for the request.
 * @param uniqueId  The unique identifier (username) of the TikTok user whose room ID is being fetched.
 */
export const fetchRoomIdFromEulerRoute = createRoute<FetchRoomIdFromEulerRouteParams, WebcastRoomIdRouteResponse>(
    EulerFetchRoute.FETCH_ROOM_ID,
    async ({ apiClient, uniqueId, options }) => {

        const fetchResponse = await apiClient
            .webcast
            .retrieveRoomId(uniqueId, options);

        return fetchResponse.data;
    }
);
