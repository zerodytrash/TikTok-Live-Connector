import { Route } from '@/types/route';
import { FetchRoomInfoFromApiRouteResponse } from '@/lib/web/routes/fetch-room-info-api-live';

export type FetchRoomInfoFromHtmlRouteParams = { uniqueId: string };
export type FetchRoomInfoFromHtmlRouteResponse = Record<string, any> & {
    liveRoomUserInfo?: FetchRoomInfoFromApiRouteResponse['data']
};

const SIGI_PATTERN = /<script id="SIGI_STATE" type="application\/json">(.*?)<\/script>/;


export class FetchRoomInfoFromHtmlRoute extends Route<FetchRoomInfoFromHtmlRouteParams, FetchRoomInfoFromHtmlRouteResponse> {

    async call({ uniqueId }): Promise<FetchRoomInfoFromHtmlRouteResponse> {
        const html = await this.webClient.getHtmlFromTikTokWebsite(`@${uniqueId}/live`);

        const match = html.match(SIGI_PATTERN);
        if (!match || match.length < 2) {
            throw new Error('Failed to extract the SIGI_STATE HTML tag, you might be blocked by TikTok.');
        }

        let sigiState: any;
        try {
            sigiState = JSON.parse(match[1]);
        } catch (e) {
            throw new Error('Failed to parse SIGI_STATE into JSON. Are you captcha-blocked by TikTok?');
        }

        const liveRoom = sigiState?.LiveRoom;
        if (!liveRoom) {
            throw new Error('Failed to extract the LiveRoom object from SIGI_STATE.');
        }

        return liveRoom;
    }

}
