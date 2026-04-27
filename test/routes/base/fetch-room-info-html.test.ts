import { describe, expect, it } from 'vitest';
import { InvalidResponseError } from '@/types/errors';
import { fetchRoomInfoFromHtmlRoute } from '@/lib/web/routes/base/fetch-room-info-html';
import {
    buildBrokenSigiStateHtml,
    buildSigiStateHtml,
    createMockWebClient,
    LIVE_ROOM_USER_INFO_FIXTURE,
    TEST_UNIQUE_ID
} from '../../lib';

describe('fetchRoomInfoFromHtmlRoute', () => {
    it('extracts live room info from SIGI_STATE html', async () => {
        const webClient = createMockWebClient();
        webClient.getHtmlFromTikTokWebsite.mockResolvedValue(buildSigiStateHtml());

        await expect(fetchRoomInfoFromHtmlRoute({ webClient, uniqueId: TEST_UNIQUE_ID })).resolves.toEqual(LIVE_ROOM_USER_INFO_FIXTURE);
        expect(webClient.getHtmlFromTikTokWebsite).toHaveBeenCalledWith(`@${TEST_UNIQUE_ID}/live`);
    });

    it('rejects when the SIGI_STATE script tag is missing', async () => {
        const webClient = createMockWebClient();
        webClient.getHtmlFromTikTokWebsite.mockResolvedValue('<html></html>');

        await expect(fetchRoomInfoFromHtmlRoute({ webClient, uniqueId: TEST_UNIQUE_ID })).rejects.toBeInstanceOf(InvalidResponseError);
    });

    it('rejects when the SIGI_STATE payload is invalid json', async () => {
        const webClient = createMockWebClient();
        webClient.getHtmlFromTikTokWebsite.mockResolvedValue(buildBrokenSigiStateHtml());

        await expect(fetchRoomInfoFromHtmlRoute({ webClient, uniqueId: TEST_UNIQUE_ID })).rejects.toBeInstanceOf(InvalidResponseError);
    });

    it('rejects when the live room object is missing', async () => {
        const webClient = createMockWebClient();
        webClient.getHtmlFromTikTokWebsite.mockResolvedValue(buildSigiStateHtml(null));

        await expect(fetchRoomInfoFromHtmlRoute({ webClient, uniqueId: TEST_UNIQUE_ID })).rejects.toBeInstanceOf(InvalidResponseError);
    });
});
