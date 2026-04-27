import { FetchRoomInfoFromApiRouteResponse } from '@/lib/web/routes/base/fetch-room-info-api-live';
import { InvalidResponseError } from '@/types';
import { createRoute } from '@/lib/web/lib/route-wrapper';
import { BaseFetchRoute } from '@/lib/web/routes/routes';
import { WebcastHttpRouteArgs } from '@/types/route';


/**
 * Mutable configuration for `fetchRoomInfoFromHtmlRoute`. Override `extractionPattern`
 * if TikTok ever changes the markup wrapping the SIGI_STATE JSON blob.
 */
export const RoomInfoFromHtmlRouteConfig = {
    extractionPattern: /<script id="SIGI_STATE" type="application\/json">(.*?)<\/script>/
};

export type FetchRoomInfoFromHtmlRouteParams = WebcastHttpRouteArgs<{ uniqueId: string }>;

export type FetchRoomInfoFromHtmlRouteResponse = Record<string, any> & {
    liveRoomUserInfo?: FetchRoomInfoFromApiRouteResponse['data']
};


/**
 * Fetches room information by scraping the HTML content of the TikTok user's live page.
 * This route is used as a fallback method to retrieve room information when API endpoints are unavailable or blocked. It extracts the SIGI_STATE JSON data embedded in the HTML, which contains various details about the live room and user information.
 *
 * @param webClient The HTTP client instance to use for making the request to the TikTok website.
 * @param uniqueId The unique identifier (username) of the TikTok user whose room information is being fetched.
 */
export const fetchRoomInfoFromHtmlRoute = createRoute<FetchRoomInfoFromHtmlRouteParams, FetchRoomInfoFromHtmlRouteResponse>(
    BaseFetchRoute.FETCH_ROOM_INFO_HTML,
    async ({ webClient, uniqueId, routeId }) => {

        // Grab the HTML content of the user's live page
        const html = await webClient.getHtmlFromTikTokWebsite(`@${uniqueId}/live`);

        const match = html.match(RoomInfoFromHtmlRouteConfig.extractionPattern);
        if (!match || match.length < 2) {
            throw new InvalidResponseError({ routeId }, 'Failed to extract the SIGI_STATE HTML tag, you might be blocked by TikTok.');
        }

        let sigiState: any;
        try {
            sigiState = JSON.parse(match[1]);
        } catch (e) {
            throw new InvalidResponseError({ routeId }, 'Failed to parse SIGI_STATE into JSON. Are you captcha-blocked by TikTok?');
        }

        const liveRoom = sigiState?.LiveRoom?.liveRoomUserInfo;

        if (!liveRoom) {
            throw new InvalidResponseError({ routeId }, 'Failed to extract the LiveRoom object from SIGI_STATE.');
        }

        return liveRoom;
    }
);

