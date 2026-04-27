import { InvalidResponseError } from '@/types/errors';
import { createRoute } from '@/lib/web/lib/route-wrapper';
import { WebcastHttpRouteArgs } from '@/types/route';
import { BaseFetchRoute } from '@/lib/web/routes/routes';

export type FetchRoomInfoFromApiRouteParams = WebcastHttpRouteArgs<{
    uniqueId: string
}>;

export type FetchRoomInfoFromApiRouteResponse = {
    statusCode: number;
    message?: string;
    data?: {
        user?: Record<string, any> & { roomId: string },
        liveRoom?: Record<string, any> & { status: number, roomId: string }
    },
};


/**
 * Fetches room information from the TikTok API Live endpoint using the provided uniqueId. This route is used as part of the process to determine if a user is currently live streaming and to retrieve associated room information.
 *
 * @param webClient The HTTP client instance to use for making the API request.
 * @param uniqueId The unique identifier (username) of the TikTok user whose room information is being fetched.
 */
export const fetchRoomInfoFromApiLiveRoute = createRoute<FetchRoomInfoFromApiRouteParams, FetchRoomInfoFromApiRouteResponse>(
    BaseFetchRoute.FETCH_ROOM_INFO_API_LIVE,
    async ({ webClient, uniqueId, routeId }) => {

        const roomData = await webClient.getJsonObjectFromTikTokApi<FetchRoomInfoFromApiRouteResponse>(
            'api-live/user/room/',
            {
                ...webClient.clientParams,
                uniqueId: uniqueId,
                sourceType: '54'
            }
        );

        if (roomData.statusCode) {
            throw new InvalidResponseError({ routeId }, `API Error ${roomData.statusCode} (${roomData.message || 'Unknown Error'})`);
        }

        if (!roomData?.data?.user?.roomId) {
            throw new InvalidResponseError({ routeId }, `Invalid response from API: ${JSON.stringify(roomData)}`);
        }

        return roomData;
    }
);
