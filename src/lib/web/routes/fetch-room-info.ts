import { Route } from '@/types/route';
import { InvalidResponseError, MissingRoomIdError } from '@/types/errors';
import { AxiosRequestConfig } from 'axios';

export type RoomInfoRouteParams = ({ roomId?: string; } & AxiosRequestConfig) | void;
export type RoomInfoResponse = any;

export class FetchRoomInfoRoute extends Route<RoomInfoRouteParams, RoomInfoResponse> {

    async call({ roomId }) {

        // Assign Room ID
        roomId ||= this.httpClient.roomId;

        // Must have a Room ID to fetch
        if (roomId == null) {
            throw new MissingRoomIdError('Missing roomId. Please provide a roomId to the HTTP client.');
        }

        // Fetch room info
        try {
            return await this.httpClient.getJsonObjectFromWebcastApi(
                'room/info/',
                { ...this.httpClient.clientParams, roomId: roomId },
                false
            );
        } catch (err) {
            throw new InvalidResponseError(`Failed to fetch room info. ${err.message}`, err);
        }

    }

}
