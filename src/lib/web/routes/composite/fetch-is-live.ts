import { InvalidResponseCompositeError, InvalidResponseError } from '@/types';
import { createRoute } from '@/lib/web/lib/route-wrapper';
import { WebcastHttpCompositeRouteArgs } from '@/types/route';
import { CompositeFetchRoute } from '@/lib/web/routes/routes';
import { fetchRoomIdFromEulerRoute, fetchRoomInfoFromApiLiveRoute, fetchRoomInfoFromHtmlRoute } from '@/lib/web/routes';


export type FetchIsLiveRouteParams = WebcastHttpCompositeRouteArgs<{
    uniqueId: string,
}>;

export const IsLiveRouteConfig = {
    skipFetchRoomInfoFromHtmlRoute: false,
    skipFetchRoomInfoFromApiLiveRoute: false,
    skipFetchRoomIdFromEulerRoute: false
};

/**
 * Determines whether a user is currently live, falling back progressively:
 *   1. HTML scrape (SIGI_STATE status field)
 *   2. TikTok API Live endpoint (liveRoom.status)
 *   3. Euler Stream (is_live flag — skipped if `disableEulerFallback` is true)
 *
 * Errors from each source are accumulated and surfaced via `FetchIsLiveError` if every source fails.
 */
export const fetchIsLiveComposite = createRoute<FetchIsLiveRouteParams, boolean>(
    CompositeFetchRoute.FETCH_IS_LIVE,
    async (
        {
            routeId,
            uniqueId,
            webClient,
            apiClient
        }
    ) => {

        const errors: Error[] = [];
        const isOnline = (status: number) => status !== 4;

        // Method 1 (HTML)
        if (!IsLiveRouteConfig.skipFetchRoomInfoFromHtmlRoute) {
            try {
                const roomInfo = await fetchRoomInfoFromHtmlRoute({ webClient, uniqueId });
                const htmlStatus = roomInfo?.liveRoom?.status;
                if (htmlStatus === undefined) {
                    throw new InvalidResponseError({ routeId }, 'Failed to extract status from HTML.');
                }
                return isOnline(htmlStatus);
            } catch (ex) {
                errors.push(ex);
            }
        }

        // Method 2 (API)
        if (!IsLiveRouteConfig.skipFetchRoomInfoFromApiLiveRoute) {
            try {
                const roomData = await fetchRoomInfoFromApiLiveRoute({ webClient, uniqueId });
                if (roomData?.data?.liveRoom?.status === undefined) {
                    throw new InvalidResponseError({ routeId }, 'Failed to extract status from API.');
                }
                return isOnline(roomData.data.liveRoom.status);
            } catch (err) {
                errors.push(err);
            }
        }

        // Method 3 (Euler)
        if (!IsLiveRouteConfig.skipFetchRoomIdFromEulerRoute) {
            try {
                const response = await fetchRoomIdFromEulerRoute({ webClient, apiClient, uniqueId });
                if (response.code !== 200) {
                    throw new InvalidResponseError({ routeId }, 'Failed to extract status from Euler.');
                }
                if (response.is_live === undefined) {
                    throw new InvalidResponseError({ routeId }, 'Failed to extract is_live from Euler.');
                }
                return response.is_live;
            } catch (err) {
                errors.push(err);
            }
        }

        // If we reach this point, it means all sources have failed
        throw new InvalidResponseCompositeError(
            {
                routeId,
                requestErrs: errors
            },
            'Failed to retrieve live status from all sources.'
        );
    }
);
