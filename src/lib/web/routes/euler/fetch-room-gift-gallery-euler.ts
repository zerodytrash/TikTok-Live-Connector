import { createRoute } from '@/lib/web/lib/route-wrapper';
import { WebcastHttpEulerRouteArgs } from '@/types/route';
import { EulerFetchRoute } from '@/lib/web/routes/routes';
import { WebcastGiftGalleryResponse } from 'tiktok-live-api-sdk';

export type RoomGiftGalleryFromEulerRouteParams = WebcastHttpEulerRouteArgs<{
    uniqueId: string
}>;

export type RoomGiftGalleryFromEulerResponse = WebcastGiftGalleryResponse;

/**
 * Fetches the gift gallery for a TikTok LIVE creator from Euler Stream's premium endpoint. The gallery
 * describes the creator's gift-collection progress, sponsor info, and anchor ranking league. The request
 * is authenticated with the `webClient` session — cookie-based when a cookie string is available,
 * otherwise the OAuth token from the session bundle.
 *
 * @param apiClient The Euler Stream API client to use for the request.
 * @param webClient The HTTP client instance, used as the source of the session cookie / OAuth token.
 * @param uniqueId  The unique identifier (username) of the TikTok creator whose gift gallery is being fetched.
 */
export const fetchRoomGiftGalleryFromEulerRoute = createRoute<RoomGiftGalleryFromEulerRouteParams, RoomGiftGalleryFromEulerResponse>(
    EulerFetchRoute.FETCH_ROOM_GIFT_GALLERY,
    async ({ uniqueId, apiClient, webClient, options }) => {

        const xCookieHeader: string | undefined = await webClient
            .cookieJar
            .getCookieString() || undefined;

        const xOauthToken: string | undefined = xCookieHeader ? undefined : webClient
            .oAuthSessionBundle
            ?.value || undefined;

        const response = await apiClient
            .anchors
            .retrieveWebcastGiftGallery(
                uniqueId,
                xOauthToken,
                xCookieHeader,
                options
            );

        return response.data;
    }
);

