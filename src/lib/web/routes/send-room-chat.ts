import { Route } from '@/types/route';
import { InvalidResponseError, MissingRoomIdError } from '@/types/errors';

export type SendRoomChatRouteParams = { content: string, roomId?: string };
export type SendRoomChatRouteResponse = any;

export class SendRoomChatRoute extends Route<SendRoomChatRouteParams, SendRoomChatRouteResponse> {

    async call({ roomId, content }) {

        // Assign Room ID
        roomId ||= this.httpClient.roomId;

        // Must have a Room ID to fetch
        if (roomId == null) {
            throw new MissingRoomIdError('Missing roomId. Please provide a roomId to the HTTP client.');
        }

        // Fetch room info
        try {
            return await this.httpClient.postJsonObjectToWebcastApi(
                '/room/chat/',
                { ...this.httpClient.clientParams, roomId: roomId, content: content },
                undefined
            );
        } catch (err) {
            throw new InvalidResponseError(`Failed to fetch room info. ${err.message}`, err);
        }
    }

}
