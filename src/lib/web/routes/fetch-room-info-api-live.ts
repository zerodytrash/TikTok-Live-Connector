import { Route } from '@/types/route';
import { InvalidResponseError } from '@/types/errors';

export type FetchRoomInfoFromApiRouteParams = { uniqueId: string };
export type FetchRoomInfoFromApiRouteResponse = {
    statusCode: number;
    message?: string;
    data?: {
        user?: Record<string, any> & { roomId: string },
        liveRoom?: Record<string, any> & {status: number, roomId: string}
    },
};

export class FetchRoomInfoFromApiLiveRoute extends Route<FetchRoomInfoFromApiRouteParams, FetchRoomInfoFromApiRouteResponse> {

    async call({ uniqueId }): Promise<FetchRoomInfoFromApiRouteResponse> {

        // Fetch object from TikTok API
        const roomData = await this.webClient.getJsonObjectFromTikTokApi<FetchRoomInfoFromApiRouteResponse>('api-live/user/room/', {
            ...this.webClient.clientParams,
            uniqueId: uniqueId,
            sourceType: '54'
        });

        // Check if the response is valid
        if (roomData.statusCode) {
            throw new InvalidResponseError(`API Error ${roomData.statusCode} (${roomData.message || 'Unknown Error'})`, undefined);
        }

        if (!roomData?.data?.user?.roomId) {
            throw new InvalidResponseError(`Invalid response from API: ${JSON.stringify(roomData)}`, undefined);
        }

        return roomData;
    }

}
