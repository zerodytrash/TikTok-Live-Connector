import { InvalidRequestError } from '@/types/errors';
import { createRoute } from '@/lib/web/lib/route-wrapper';
import { WebcastHttpEulerRouteArgs } from '@/types/route';
import { EulerFetchRoute } from '@/lib/web/routes/routes';
import { RoomGiftsResponse, WebcastLanguage } from 'tiktok-live-api-sdk';

export type RoomGiftsFromEulerRouteParams = WebcastHttpEulerRouteArgs<{
    roomId?: string,
    webcastLanguage?: WebcastLanguage
}>;

export type RoomGiftsFromEulerResponse = RoomGiftsResponse;

/**
 * Fetches the list of gifts available in a TikTok LIVE room from Euler Stream's premium endpoint. If
 * `roomId` is not provided, the `roomId` currently set on the `webClient` is used.
 *
 * @param apiClient       The Euler Stream API client to use for the request.
 * @param webClient       The HTTP client instance, used as the source of `roomId` when one is not provided.
 * @param roomId          The ID of the room whose gift list to fetch. Optional if the webClient has a roomId context.
 * @param webcastLanguage Optional language used to localize the returned gift names and descriptions.
 */
export const fetchRoomGiftsFromEulerRoute = createRoute<RoomGiftsFromEulerRouteParams, RoomGiftsFromEulerResponse>(
    EulerFetchRoute.FETCH_ROOM_GIFTS,
    async ({ routeId, apiClient, webClient, webcastLanguage, roomId = webClient.roomId, options }) => {

        if (!roomId) {
            throw new InvalidRequestError({ routeId }, 'Missing roomId. Please provide a roomId to the HTTP client.');
        }

        const response = await apiClient
            .rooms
            .retrieveRoomGifts(
                roomId,
                webcastLanguage,
                options
            );

        return response.data;
    }
);

