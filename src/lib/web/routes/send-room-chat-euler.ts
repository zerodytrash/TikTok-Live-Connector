import { Route } from '@/types/route';
import { IWebcastRoomChatPayload, IWebcastRoomChatRouteResponse } from '@eulerstream/euler-api-sdk';
import { AxiosRequestConfig } from 'axios';
import { PremiumFeatureError } from '@/types';

export type SendRoomChatFromEulerRouteParams = IWebcastRoomChatPayload & AxiosRequestConfig;

export class SendRoomChatFromEulerRoute extends Route<SendRoomChatFromEulerRouteParams, IWebcastRoomChatRouteResponse> {

    async call({ roomId, content, sessionId, options }): Promise<IWebcastRoomChatRouteResponse> {
        const fetchResponse = await this.webClient.webSigner.webcast.sendRoomChat({
                roomId,
                content,
                sessionId
            },
            options
        );

        switch (fetchResponse.status) {
            case 401:
            case 403:
                throw new PremiumFeatureError(
                    'Sending chats requires an API key & a paid plan, as it uses cloud managed services.',
                    fetchResponse.data.message,
                    JSON.stringify(fetchResponse.data)
                );
            case 200:
                return fetchResponse.data;
            default:
                throw new Error(`Failed to send chat: ${fetchResponse?.data?.message || 'Unknown error'}`);
        }

    }

}
