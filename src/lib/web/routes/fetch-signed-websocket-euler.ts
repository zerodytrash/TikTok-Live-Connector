import { Route } from '@/types/route';
import { AxiosResponse } from 'axios';
import {
    AuthenticatedWebSocketConnectionError,
    ErrorReason,
    FetchSignedWebSocketIdentityParameterError,
    PremiumFeatureError,
    SignAPIError,
    SignatureRateLimitError
} from '@/types/errors';
import Config from '@/lib/config';
import { deserializeMessage } from '@/lib';
import { WebcastResponse } from '@/types/tiktok-schema';
import { FetchSignedWebSocketParams } from '@/types/client';


export type FetchSignedWebSocketFromEulerRouteParams = FetchSignedWebSocketParams;

export class FetchSignedWebSocketFromEulerRoute extends Route<FetchSignedWebSocketFromEulerRouteParams, WebcastResponse> {

    async call(
        {
            roomId,
            uniqueId,
            preferredAgentIds,
            sessionId
        }: FetchSignedWebSocketFromEulerRouteParams
    ): Promise<WebcastResponse> {

        if (!roomId && !uniqueId) {
            throw new FetchSignedWebSocketIdentityParameterError(
                'Either roomId or uniqueId must be provided.'
            );
        }

        if (roomId && uniqueId) {
            throw new FetchSignedWebSocketIdentityParameterError(
                'Both roomId and uniqueId cannot be provided at the same time.'
            );
        }

        const preferredAgentIdsParam = preferredAgentIds?.join(',') ?? null;
        const resolvedSessionId = sessionId || this.webClient.cookieJar.sessionId;

        if (this.webClient.configuration.authenticateWs && resolvedSessionId) {
            const envHost = process.env.WHITELIST_AUTHENTICATED_SESSION_ID_HOST;
            const expectedHost = new URL(this.webClient.tiktokApi.configuration.basePath).host;

            if (!envHost) {
                throw new AuthenticatedWebSocketConnectionError(
                    `authenticate_websocket is true, but no whitelist host defined. Set the env var WHITELIST_AUTHENTICATED_SESSION_ID_HOST to proceed.`
                );
            }

            if (envHost !== expectedHost) {
                throw new AuthenticatedWebSocketConnectionError(
                    `The env var WHITELIST_AUTHENTICATED_SESSION_ID_HOST "${envHost}" does not match sign server host "${expectedHost}".`
                );
            }

        }

        let response: AxiosResponse<ArrayBuffer>;
        try {
            response = await this.webClient.tiktokApi.webcast.fetchWebcastURL(
                'ttlive-node',
                roomId,
                uniqueId,
                this.webClient.clientParams?.cursor,
                sessionId,
                Config.DEFAULT_REQUEST_HEADERS['User-Agent'],
                preferredAgentIdsParam,
                { responseType: 'arraybuffer' }
            ) as any;
        } catch (err: any) {
            throw new SignAPIError(ErrorReason.CONNECT_ERROR, undefined, undefined, 'Failed to connect to sign server.', null, err);
        }

        if (response.status === 429) {
            // Convert arraybuffer to JSON
            const data = JSON.parse(Buffer.from(response.data).toString('utf-8')) as any;
            const message = process.env.SIGN_SERVER_MESSAGE_DISABLED ? null : data?.message;
            const label = data?.limit_label ? `(${data.limit_label}) ` : '';
            throw new SignatureRateLimitError(message, `${label}Too many connections started, try again later.`, response);
        }

        if (response.status === 402) {
            // Convert arraybuffer to JSON
            const data = JSON.parse(Buffer.from(response.data).toString('utf-8')) as any;
            const message = process.env.SIGN_SERVER_MESSAGE_DISABLED ? null : data?.message;
            throw new PremiumFeatureError(message, 'Error fetching the signed TikTok WebSocket');
        }

        const logId: number | undefined = response.headers['X-Log-Id'] && parseInt(response.headers['X-Log-Id']);
        const agentId: string | undefined = response.headers['X-Agent-ID'];

        if (response.status !== 200) {
            let payload: string;
            try {
                payload = Buffer.from(response.data).toString('utf-8');
            } catch {
                payload = `"${response.statusText}"`;
            }

            throw new SignAPIError(
                ErrorReason.SIGN_NOT_200,
                logId,
                agentId,
                `Unexpected sign server status ${response.status}. Payload:\n${payload}`,
                JSON.stringify(response.data)
            );
        }

        if (!response.headers['x-set-tt-cookie']) {
            throw new SignAPIError(
                ErrorReason.EMPTY_COOKIES,
                logId,
                agentId,
                'No cookies received from sign server.'
            );
        }

        this.webClient.cookieJar.processSetCookieHeader(response.headers['x-set-tt-cookie'] || '');
        this.webClient.roomId = response.headers['x-room-id'] || this.webClient.roomId;
        return deserializeMessage('WebcastResponse', Buffer.from(response.data));
    }

}
