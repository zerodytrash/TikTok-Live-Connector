import { WebcastRoomInfoRouteResponse } from '@eulerstream/euler-api-sdk';
import { createRoute } from '@/lib/web/lib/route-wrapper';
import { WebcastHttpEulerRouteArgs } from '@/types/route';
import { EulerFetchRoute } from '@/lib/web/routes/routes';

export type FetchRoomInfoFromEulerRouteParams = WebcastHttpEulerRouteArgs<{
    uniqueId: string
}>;

/**
 * Fetches full room information (streamer info, stats, status) from Euler Stream's premium endpoint.
 *
 * @param apiClient The Euler Stream API client to use for the request.
 * @param uniqueId  The unique identifier (username) of the TikTok user whose room info is being fetched.
 */
export const fetchRoomInfoFromEulerRoute = createRoute<FetchRoomInfoFromEulerRouteParams, WebcastRoomInfoRouteResponse>(
    EulerFetchRoute.FETCH_ROOM_INFO,
    async ({ apiClient, uniqueId, options }) => {

        const fetchResponse = await apiClient
            .premium
            .retrieveRoomInfo(uniqueId, options);

        return fetchResponse.data;
    }
);
