import { describe, expect, it } from 'vitest';
import { SignTikTokUrlBodyMethodEnum } from '@eulerstream/euler-api-sdk';
import { fetchWebcastSignatureFromEulerRoute } from '@/lib/web/routes/euler/fetch-webcast-signature-euler';
import { createLiveEulerClient, createMockWebClient, hasEulerApiKey } from '../../lib';

const describeIfEulerConfigured = hasEulerApiKey() ? describe : describe.skip;

describeIfEulerConfigured('fetchWebcastSignatureFromEulerRoute (live)', () => {
    it('signs a webcast url when a real euler api key is available', async () => {
        const webClient = createMockWebClient();
        const apiClient = createLiveEulerClient();

        const response = await fetchWebcastSignatureFromEulerRoute({
            webClient,
            apiClient,
            url: `https://webcast.tiktok.com/webcast/room/info/?aid=1988&room_id=12345`,
            method: SignTikTokUrlBodyMethodEnum.Get,
            userAgent: webClient.clientHeaders['User-Agent']
        });

        expect(response.response?.signedUrl).toBeTruthy();
        expect(Object.keys(response.response?.tokens || {}).length).toBeGreaterThan(0);
    });
});
