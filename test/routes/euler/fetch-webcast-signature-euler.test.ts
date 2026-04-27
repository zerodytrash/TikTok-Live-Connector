import { describe, expect, it } from 'vitest';
import { SignTikTokUrlBodyMethodEnum } from '@eulerstream/euler-api-sdk';
import { InvalidRequestError, PremiumFeatureError, SignatureMissingTokensError } from '@/types/errors';
import { fetchWebcastSignatureFromEulerRoute } from '@/lib/web/routes/euler/fetch-webcast-signature-euler';
import {
    createAxiosResponse,
    createCookieSessionBundle,
    createMockEulerClient,
    createMockWebClient
} from '../../lib';

describe('fetchWebcastSignatureFromEulerRoute', () => {
    it('signs the url after removing stale signature params', async () => {
        const webClient = createMockWebClient();
        const apiClient = createMockEulerClient();
        webClient.cookieJar.getSessionBundle.mockResolvedValue(createCookieSessionBundle());
        apiClient.webcast.signWebcastUrl.mockResolvedValue(createAxiosResponse({
            response: {
                signedUrl: 'https://signed.example.com',
                tokens: {
                    msToken: 'fresh-token'
                }
            }
        }));

        await expect(fetchWebcastSignatureFromEulerRoute({
            webClient,
            apiClient,
            url: 'https://webcast.tiktok.com/webcast/room/info/?aid=1988&room_id=12345&X-Bogus=bad&X-Gnarly=worse&msToken=stale',
            method: SignTikTokUrlBodyMethodEnum.Get,
            userAgent: 'vitest-agent'
        })).resolves.toMatchObject({
            response: {
                signedUrl: 'https://signed.example.com'
            }
        });

        const [payload, libraryIdentity] = apiClient.webcast.signWebcastUrl.mock.calls[0];
        expect(payload.url).toContain('aid=1988');
        expect(payload.url).toContain('room_id=12345');
        expect(payload.url).not.toContain('X-Bogus');
        expect(payload.url).not.toContain('X-Gnarly');
        expect(payload.url).not.toContain('msToken');
        expect(payload.sessionId).toBe('session-id');
        expect(payload.ttTargetIdc).toBe('useast1a');
        expect(libraryIdentity).toBe('ttlive-node');
    });

    it('rejects when a session id is present without ttTargetIdc', async () => {
        const webClient = createMockWebClient();
        const apiClient = createMockEulerClient();
        webClient.cookieJar.getSessionBundle.mockResolvedValue(createCookieSessionBundle({ ttTargetIdc: '' }));

        await expect(fetchWebcastSignatureFromEulerRoute({
            webClient,
            apiClient,
            url: 'https://webcast.tiktok.com/webcast/room/info/?aid=1988&room_id=12345',
            method: SignTikTokUrlBodyMethodEnum.Get,
            userAgent: 'vitest-agent'
        })).rejects.toBeInstanceOf(InvalidRequestError);
    });

    it('translates a 403 response into a premium feature error', async () => {
        const webClient = createMockWebClient();
        const apiClient = createMockEulerClient();
        apiClient.webcast.signWebcastUrl.mockResolvedValue(createAxiosResponse(
            {
                message: 'forbidden',
                response: {
                    tokens: {
                        msToken: 'fresh-token'
                    }
                }
            },
            {
                status: 403
            }
        ));

        await expect(fetchWebcastSignatureFromEulerRoute({
            webClient,
            apiClient,
            url: 'https://webcast.tiktok.com/webcast/room/info/?aid=1988&room_id=12345',
            method: SignTikTokUrlBodyMethodEnum.Get,
            userAgent: 'vitest-agent'
        })).rejects.toBeInstanceOf(PremiumFeatureError);
    });

    it('rejects when the signer omits tokens', async () => {
        const webClient = createMockWebClient();
        const apiClient = createMockEulerClient();
        apiClient.webcast.signWebcastUrl.mockResolvedValue(createAxiosResponse({
            message: 'missing tokens',
            response: {
                tokens: {}
            }
        }));

        await expect(fetchWebcastSignatureFromEulerRoute({
            webClient,
            apiClient,
            url: 'https://webcast.tiktok.com/webcast/room/info/?aid=1988&room_id=12345',
            method: SignTikTokUrlBodyMethodEnum.Get,
            userAgent: 'vitest-agent'
        })).rejects.toBeInstanceOf(SignatureMissingTokensError);
    });
});
