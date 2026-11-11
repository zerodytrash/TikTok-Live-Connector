import { InvalidResponseCompositeError, InvalidResponseError } from '@/types';
import { createRoute } from '@/lib/web/lib/route-wrapper';
import { WebcastHttpCompositeRouteArgs } from '@/types/route';
import {
    fetchRoomIdFromEulerRoute,
    fetchRoomInfoFromApiLiveRoute,
    fetchRoomInfoFromHtmlRoute
} from '@/lib/web/routes';
import { CompositeFetchRoute } from '@/lib/web/routes/routes';
import { EULER_PERMISSION_STATUS_CODES, eulerFallbackPermissionMessage } from '@/lib/web/routes/composite/euler-fallback';
export type FetchRoomIdRouteParams = WebcastHttpCompositeRouteArgs<{
    uniqueId: string,
}>;


export const RoomIdRouteConfig = {
    skipFetchRoomInfoFromHtmlRoute: false,
    skipFetchRoomInfoFromApiLiveRoute: false,
    skipFetchRoomIdFromEulerRoute: false
};

/**
 * Resolves a room ID across multiple sources, falling back progressively:
 *   1. HTML scrape (SIGI_STATE)
 *   2. TikTok API Live endpoint
 *   3. Euler Stream (skipped if `RoomIdRouteConfig.skipFetchRoomIdFromEulerRoute` is true)
 *
 * Errors from each source are accumulated and surfaced via `InvalidResponseCompositeError` if every source fails.
 */
export const fetchRoomIdComposite = createRoute<FetchRoomIdRouteParams, string>(
    CompositeFetchRoute.FETCH_ROOM_ID,

    async (
        {
            routeId,
            uniqueId,
            webClient,
            apiClient
        }
    ) => {

        const errors: Error[] = [];

        // Method 1 (HTML Fallback)
        if (!RoomIdRouteConfig.skipFetchRoomInfoFromHtmlRoute) {
            try {
                const roomInfo = await fetchRoomInfoFromHtmlRoute({ webClient, uniqueId });
                const roomId = roomInfo.user.roomId;
                if (!roomId) throw new InvalidResponseError({ routeId }, 'Failed to extract Room ID from HTML.');
                return roomId;
            } catch (ex) {
                errors.push(ex);
            }
        }

        // Method 2 (API Fallback)
        if (!RoomIdRouteConfig.skipFetchRoomInfoFromApiLiveRoute) {
            try {
                const roomData = await fetchRoomInfoFromApiLiveRoute({ webClient, uniqueId });
                const roomId = roomData?.data?.user?.roomId;
                if (!roomId) throw new InvalidResponseError({ routeId }, 'Failed to extract Room ID from API.');
                return roomId;
            } catch (ex) {
                errors.push(ex);
            }
        }

        // Method 3 (Euler Fallback)
        if (!RoomIdRouteConfig.skipFetchRoomIdFromEulerRoute) {
            try {
                const response = await fetchRoomIdFromEulerRoute({ webClient, apiClient, uniqueId });
                if (EULER_PERMISSION_STATUS_CODES.includes(response.code)) {
                    throw new InvalidResponseError(
                        { routeId },
                        eulerFallbackPermissionMessage({
                            subject: 'the Room ID',
                            configName: 'RoomIdRouteConfig',
                            code: response.code,
                            serverMessage: response.message
                        })
                    );
                }

                if (!response.ok) throw new InvalidResponseError({ routeId }, `Failed to retrieve Room ID from Euler due to an error: ${response.message}`);
                if (!response.room_id) throw new InvalidResponseError({ routeId }, 'Failed to extract Room ID from Euler.');
                return response.room_id;
            } catch (err) {
                errors.push(err);
            }
        }

        throw new InvalidResponseCompositeError(
            {
                routeId,
                requestErrs: errors
            },
            'Failed to retrieve Room ID from all sources.'
        );
    }
);
