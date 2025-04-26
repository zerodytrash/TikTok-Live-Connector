import { Route } from '@/types/route';
import { InvalidResponseError } from '@/types/errors';

export type FetchRoomIdFromApiRouteParams = { uniqueId: string };
export type FetchRoomIdFromApiRouteResponse = string;

export class FetchRoomIdFromApi extends Route<FetchRoomIdFromApiRouteParams, FetchRoomIdFromApiRouteResponse> {

    async call({ uniqueId }): Promise<string> {

        // Fetch object from TikTok API
        const roomData: Record<string, any> = await this.httpClient.getJsonObjectFromTikTokApi('api-live/user/room/', {
            ...this.httpClient.clientParams,
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

        // Set & return the value
        this.httpClient.roomId = roomData.data.user.roomId;
        return this.httpClient.roomId;
    }

}
