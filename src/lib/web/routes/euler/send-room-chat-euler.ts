import { InvalidRequestError, InvalidResponseError, PremiumFeatureError } from '@/types';
import { WebcastRoomChatRouteResponse } from '@eulerstream/euler-api-sdk';
import { createRoute } from '@/lib/web/lib/route-wrapper';
import { WebcastHttpEulerRouteArgs } from '@/types/route';
import { EulerFetchRoute } from '@/lib/web/routes/routes';

export type SendRoomChatFromEulerRouteParams = WebcastHttpEulerRouteArgs<{

    // Room ID of user
    roomId: string;

    // Text content of message
    content: string;

}>;

/**
 * Sends a chat message into a TikTok LIVE room via Euler Stream's premium endpoint. Supports either
 * cookie-based (`sessionId` + `ttTargetIdc`) or OAuth-token session bundles; OAuth takes precedence when present.
 *
 * Throws `PremiumFeatureError` when the sign server returns 401/403, and `InvalidResponseError` for
 * any other non-200 response.
 */
export const sendRoomChatFromEulerRoute = createRoute<SendRoomChatFromEulerRouteParams, WebcastRoomChatRouteResponse>(
    EulerFetchRoute.SEND_ROOM_CHAT,
    async (
        {
            routeId,
            webClient,
            apiClient,
            roomId,
            content,
            options
        }
    ) => {

        roomId ||= webClient.roomId;

        if (!roomId) {
            throw new InvalidRequestError({ routeId }, 'Room ID must be specified in all cases to send a chat to a room');
        }

        const xCookieHeader: string | undefined = await webClient
            .cookieJar
            .getCookieString() || undefined;

        const xOauthToken: string | undefined = xCookieHeader ? undefined : webClient
            .oAuthSessionBundle
            ?.value || undefined;

        const fetchResponse = await apiClient.premium.sendRoomChat(
            {
                content,
                targetRoomId: roomId,
                sessionId: '',
                ttTargetIdc: ''
            },
            xOauthToken,
            xCookieHeader,
            options
        );

        switch (fetchResponse.status) {
            case 401:
            case 403:
                throw new PremiumFeatureError(
                    'Sending chats requires an API key & a paid plan, as it uses cloud managed services.',
                    fetchResponse.data.message || 'Unauthorized',
                    JSON.stringify(fetchResponse.data)
                );
            case 200:
                return fetchResponse.data;
            default:
                throw new InvalidResponseError(
                    { routeId },
                    `Failed to send chat: ${fetchResponse?.data?.message || 'Unknown error'}`
                );
        }
    }
);
