import { describe, expect, it, vi } from 'vitest';
import { ErrorReason, SignatureRateLimitError } from '@/types/errors';
import { fetchSignedWebSocketFromEulerRoute } from '@/lib/web/routes/euler/fetch-signed-websocket-euler';
import { createAxiosResponse, createMockEulerClient, createMockWebClient, TEST_ROOM_ID } from '../../lib';

describe('fetchSignedWebSocketFromEulerRoute', () => {
    it.each([
        {
            description: 'preserves retry and diagnostic headers',
            headers: {
                'retry-after': '30',
                'x-ratelimit-reset': '2000000000',
                'x-log-id': 'test-request-id',
                'x-agent-id': 'test-agent-id'
            },
            expected: {
                retryAfter: 30_000,
                resetTime: 2_000_000_000_000,
                requestId: 'test-request-id',
                agentId: 'test-agent-id'
            }
        },
        {
            description: 'accepts numeric retry headers',
            headers: {
                'retry-after': 30,
                'x-ratelimit-reset': 2_000_000_000
            },
            expected: {
                retryAfter: 30_000,
                resetTime: 2_000_000_000_000,
                requestId: undefined,
                agentId: undefined
            }
        },
        {
            description: 'handles a rate limit without optional headers',
            headers: {},
            expected: {
                retryAfter: 0,
                resetTime: undefined,
                requestId: undefined,
                agentId: undefined
            }
        }
    ])('$description', async ({ headers, expected }) => {
        vi.stubEnv('SIGN_SERVER_MESSAGE_DISABLED', '');
        const webClient = createMockWebClient();
        const apiClient = createMockEulerClient();
        apiClient.rooms.fetchWebcastURL.mockResolvedValue(createAxiosResponse(
            Buffer.from(JSON.stringify({
                message: 'Synthetic signing quota exceeded.',
                limit_label: 'minute'
            })),
            { status: 429, headers }
        ));

        const result = fetchSignedWebSocketFromEulerRoute({
            webClient,
            apiClient,
            roomId: TEST_ROOM_ID
        });

        await expect(result).rejects.toBeInstanceOf(SignatureRateLimitError);
        await expect(result).rejects.toMatchObject({
            reason: ErrorReason.RATE_LIMIT,
            ...expected,
            message: expect.stringContaining('(minute) Too many connections started')
        });
        await expect(result).rejects.toThrow('Synthetic signing quota exceeded.');
        expect(apiClient.rooms.fetchWebcastURL).toHaveBeenCalledTimes(1);
    });
});
