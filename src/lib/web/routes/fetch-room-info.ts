import { Route } from '@/types/route';
import { InvalidResponseError, MissingRoomIdError } from '@/types/errors';
import { RoomInfo } from '@/types/client';

export type RoomInfoRouteParams = { roomId?: string; } | void;
export type RoomInfoResponse = any;

export class FetchRoomInfoRoute extends Route<RoomInfoRouteParams, RoomInfoResponse> {

    async call(params: RoomInfoRouteParams) {
        // Assign Room ID
        const { roomId } = params || this.webClient;


        // Must have a Room ID to fetch
        if (roomId == null) {
            throw new MissingRoomIdError('Missing roomId. Please provide a roomId to the HTTP client.');
        }

        // Fetch room info
        try {
            return await this.webClient.getJsonObjectFromWebcastApi<RoomInfo>(
                'room/info/',
                { ...this.webClient.clientParams, roomId: roomId },
                false
            );
        } catch (err) {
            throw new InvalidResponseError(`Failed to fetch room info. ${err.message}`, err);
        }

    }

}
