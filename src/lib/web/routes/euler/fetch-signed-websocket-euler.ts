import { TikTokLiveConnectionBundledAuthOptions } from '@/types/client';
import {
    AuthenticatedWebSocketConnectionError,
    ErrorReason,
    PremiumFeatureError,
    SignAPIError,
    SignatureRateLimitError
} from '@/types/errors';
import { deserializeMessage, LIBRARY_IDENTITY } from '@/lib';
import { ProtoMessageFetchResult } from '@/types';
import { SoaxProxyRegion, WebcastFetchPlatform } from '@eulerstream/euler-api-sdk';
import { createRoute } from '@/lib/web/lib/route-wrapper';
import { EulerFetchRoute } from '@/lib/web/routes/routes';
import { WebcastHttpEulerRouteArgs } from '@/types/route';
import type { AxiosResponse } from 'axios';

export type FetchSignedWebSocketFromEulerRouteParams = WebcastHttpEulerRouteArgs<TikTokLiveConnectionBundledAuthOptions & {

    // Room ID to fetch for
    roomId: string;

    // Optional country override
    country?: SoaxProxyRegion;

    // Cursor
    cursor?: string;

}>;

export type FetchSignedWebSocketFromEulerRouteResponse = {
    fetchResult: ProtoMessageFetchResult;
    fetchResultCookieHeader: string;
    fetchResultRoomId?: string;
};

/**
 * Fetches a signed TikTok WebSocket URL from Euler Stream along with the initial `ProtoMessageFetchResult`
 * and any cookies the sign server set.
 *
 * Enforces whitelist validation (via `WHITELIST_AUTHENTICATED_SESSION_ID_HOST`) when authenticated WebSocket
 * connections are requested. Translates sign-server HTTP responses into typed errors
 * (`SignAPIError`, `SignatureRateLimitError`, `PremiumFeatureError`).
 */
export const fetchSignedWebSocketFromEulerRoute = createRoute<FetchSignedWebSocketFromEulerRouteParams, FetchSignedWebSocketFromEulerRouteResponse>(
    EulerFetchRoute.FETCH_SIGNED_WEBSOCKET,
    async (
        {
            routeId,
            roomId,
            apiClient,
            webClient,
            useMobile,
            session,
            authenticateWs,
            country,
            cursor,
            options
        }
    ) => {

        // Validate whitelist
        if (session && authenticateWs) {

            const envHost = process.env.WHITELIST_AUTHENTICATED_SESSION_ID_HOST;
            const expectedHost = apiClient.configuration.basePath ? new URL(apiClient.configuration.basePath).host : undefined;

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

        const xCookieHeader: string | undefined = await webClient
            .cookieJar
            .getCookieString() || undefined;

        if (authenticateWs && !xCookieHeader) {
            throw new AuthenticatedWebSocketConnectionError(
                `authenticate_websocket is true, but no session cookies found.`
            );
        }

        let response: AxiosResponse;
        try {
            response = await apiClient.webcast.fetchWebcastURL(
                LIBRARY_IDENTITY,
                roomId,
                undefined,
                cursor,
                webClient.clientHeaders['User-Agent'],
                true,
                country,
                useMobile ? WebcastFetchPlatform.Mobile : WebcastFetchPlatform.Web,
                undefined,
                authenticateWs ? xCookieHeader : undefined,
                undefined,
                undefined,
                {
                    ...options,

                    // NOTE: NEVER REMOVE THIS BECAUSE FUCKING AXIOS WILL END UP TRYING TO INTERPRET THE RESPONSE
                    // AS UTF-8 DATA AND YOU WILL FUCKING HATE YOUR LIFE
                    responseType: 'arraybuffer'

                }
            );
        } catch (err: any) {
            throw new SignAPIError(ErrorReason.CONNECT_ERROR, undefined, undefined, 'Failed to connect to sign server.', err);
        }

        if (response.status === 429) {
            const data = JSON.parse(Buffer.from(response.data).toString('utf-8')) as any;
            const message = process.env.SIGN_SERVER_MESSAGE_DISABLED ? null : data?.message;
            const label = data?.limit_label ? `(${data.limit_label}) ` : '';
            throw new SignatureRateLimitError(message, `${label}Too many connections started, try again later.`, response.data);
        }

        if (response.status === 402) {
            const data = JSON.parse(Buffer.from(response.data).toString('utf-8')) as any;
            const message = process.env.SIGN_SERVER_MESSAGE_DISABLED ? null : data?.message;
            throw new PremiumFeatureError(message, 'Error fetching the signed TikTok WebSocket');
        }

        const logId: string | undefined = response.headers['x-request-id'];
        const agentId: string | undefined = response.headers['x-agent-id'];

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
                `[${routeId}] Unexpected sign server status ${response.status}. Payload:\n${payload}`
            );
        }

        if (!response.headers['x-set-tt-cookie']) {
            throw new SignAPIError(
                ErrorReason.EMPTY_COOKIES,
                logId,
                agentId,
                `[${routeId}] No cookies received from sign server.`
            );
        }

        return {
            fetchResult: deserializeMessage('ProtoMessageFetchResult', Buffer.from(response.data)),
            fetchResultCookieHeader: response.headers['x-set-tt-cookie'],
            fetchResultRoomId: response.headers['x-room-id']
        };
    }
);
