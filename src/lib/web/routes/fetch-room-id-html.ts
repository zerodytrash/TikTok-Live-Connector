import { Route } from '@/types/route';
import { getRoomIdFromMainPageHtml } from '@/lib';

export type FetchRoomIdFromHtmlRouteParams = { uniqueId: string };
export type FetchRoomIdFromHtmlRouteResponse = string;

export class FetchRoomIdFromHtml extends Route<FetchRoomIdFromHtmlRouteParams, FetchRoomIdFromHtmlRouteResponse> {

    async call({ uniqueId }): Promise<string> {
        const html = await this.httpClient.getHtmlFromTikTokWebsite(`@${uniqueId}/live`);
        const extractedRoomId: string = getRoomIdFromMainPageHtml(html);
        this.httpClient.roomId = extractedRoomId;
        return extractedRoomId;
    }

}
