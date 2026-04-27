import { describe, expect, it } from 'vitest';
import { InvalidRequestError, InvalidResponseError, PremiumFeatureError } from '@/types/errors';
import { sendRoomChatFromEulerRoute } from '@/lib/web/routes/euler/send-room-chat-euler';
import {
    createAxiosResponse,
    createMockEulerClient,
    createMockWebClient,
    createOAuthTokenSessionBundle,
    TEST_ROOM_ID
} from '../../lib';

describe('sendRoomChatFromEulerRoute', () => {
    it('sends chat with cookie auth when cookies are available', async () => {
        const webClient = createMockWebClient();
        const apiClient = createMockEulerClient();
        webClient.cookieJar.getCookieString.mockResolvedValue('sessionid=abc');
        apiClient.premium.sendRoomChat.mockResolvedValue(createAxiosResponse({
            ok: true
        }));

        await expect(sendRoomChatFromEulerRoute({
            webClient,
            apiClient,
            roomId: TEST_ROOM_ID,
            content: 'hello world'
        })).resolves.toEqual({ ok: true });

        expect(apiClient.premium.sendRoomChat).toHaveBeenCalledWith(
            {
                content: 'hello world',
                targetRoomId: TEST_ROOM_ID,
                sessionId: '',
                ttTargetIdc: ''
            },
            undefined,
            'sessionid=abc',
            undefined
        );
    });

    it('falls back to oauth auth when no cookies are available', async () => {
        const webClient = createMockWebClient({
            oAuthSessionBundle: createOAuthTokenSessionBundle('oauth-123')
        });
        const apiClient = createMockEulerClient();
        apiClient.premium.sendRoomChat.mockResolvedValue(createAxiosResponse({
            ok: true
        }));

        await expect(sendRoomChatFromEulerRoute({
            webClient,
            apiClient,
            roomId: TEST_ROOM_ID,
            content: 'hello world'
        })).resolves.toEqual({ ok: true });

        expect(apiClient.premium.sendRoomChat).toHaveBeenCalledWith(
            expect.any(Object),
            'oauth-123',
            undefined,
            undefined
        );
    });

    it('rejects when no room id can be resolved', async () => {
        const webClient = createMockWebClient();
        const apiClient = createMockEulerClient();

        await expect(sendRoomChatFromEulerRoute({
            webClient,
            apiClient,
            roomId: '',
            content: 'hello world'
        })).rejects.toBeInstanceOf(InvalidRequestError);
    });

    it('translates premium auth failures into a premium feature error', async () => {
        const webClient = createMockWebClient();
        const apiClient = createMockEulerClient();
        apiClient.premium.sendRoomChat.mockResolvedValue(createAxiosResponse(
            {
                message: 'forbidden'
            },
            {
                status: 403
            }
        ));

        await expect(sendRoomChatFromEulerRoute({
            webClient,
            apiClient,
            roomId: TEST_ROOM_ID,
            content: 'hello world'
        })).rejects.toBeInstanceOf(PremiumFeatureError);
    });

    it('rejects on non-200 non-premium failures', async () => {
        const webClient = createMockWebClient();
        const apiClient = createMockEulerClient();
        apiClient.premium.sendRoomChat.mockResolvedValue(createAxiosResponse(
            {
                message: 'server error'
            },
            {
                status: 500
            }
        ));

        await expect(sendRoomChatFromEulerRoute({
            webClient,
            apiClient,
            roomId: TEST_ROOM_ID,
            content: 'hello world'
        })).rejects.toBeInstanceOf(InvalidResponseError);
    });
});
