import { URL } from 'url';
import { SignTikTokUrlBodyMethodEnum, SignWebcastUrl200Response } from '@eulerstream/euler-api-sdk';
import { InvalidRequestError, PremiumFeatureError, SignatureMissingTokensError } from '@/types';
import { createRoute } from '@/lib/web/lib/route-wrapper';
import { WebcastHttpEulerRouteArgs } from '@/types/route';
import { EulerFetchRoute } from '@/lib/web/routes/routes';
import { LIBRARY_IDENTITY } from '@/lib/web/routes/euler/config';

// External-facing params type consumed by `WebcastHttpClient.signatureProvider`. Does not include `apiClient`.
export type WebcastSignerParams = {
    url: string | URL,
    method: SignTikTokUrlBodyMethodEnum,
    userAgent: string
};

export type WebcastSignerResponse = SignWebcastUrl200Response;

export type FetchWebcastSignatureFromEulerRouteParams = WebcastHttpEulerRouteArgs<WebcastSignerParams>;

/**
 * Signs an arbitrary TikTok webcast URL through the Euler Stream sign server, returning the
 * signed URL and token bundle the caller needs to make the request.
 *
 * Strips known signature parameters (X-Bogus, X-Gnarly, msToken) from the input URL before signing.
 * If `webClient.cookieJar` already holds a `sessionid` and `tt-target-idc` pair, both are forwarded
 * to the sign server so the resulting signature is bound to that session.
 *
 * @param apiClient The Euler Stream API client used to issue the sign request.
 * @param webClient The HTTP client whose cookie jar provides any optional session bundle.
 * @param url The original TikTok URL (string or `URL`) to sign.
 * @param method HTTP method the signed URL will be used with.
 * @param userAgent User-Agent string the signed request will use.
 * @param options Optional axios request overrides forwarded to the SDK call.
 */
export const fetchWebcastSignatureFromEulerRoute = createRoute<FetchWebcastSignatureFromEulerRouteParams, WebcastSignerResponse>(
    EulerFetchRoute.FETCH_WEBCAST_SIGNATURE,
    async (
        {
            routeId,
            url,
            method,
            userAgent,
            apiClient,
            webClient,
            options
        }
    ) => {

        const session = await webClient.cookieJar.getSessionBundle();

        const sessionId = session?.value.sessionId;
        const ttTargetIdc = session?.value.ttTargetIdc;

        const mustRemoveParams = ['X-Bogus', 'X-Gnarly', 'msToken'];
        let cleanUrl = typeof url === 'string' ? url : url.toString();

        for (const param of mustRemoveParams) {
            cleanUrl = cleanUrl.replace(new RegExp(`([&?])${param}=[^&]*`, 'g'), '$1');
            cleanUrl = cleanUrl.replace(/[&?]$/, '');
        }

        if (sessionId && !ttTargetIdc) {
            throw new InvalidRequestError({ routeId }, 'ttTargetIdc must be set when sessionId is provided.');
        }

        // Sign the URL
        const response = await apiClient.webcast.signWebcastUrl(
            {
                url: cleanUrl,
                method: method,
                userAgent: userAgent,
                sessionId: sessionId,
                ttTargetIdc: ttTargetIdc
            },
            LIBRARY_IDENTITY,
            options
        );

        if (response.status === 403) {
            throw new PremiumFeatureError(
                'You do not have permission from the signature provider to sign this URL.',
                response.data.message || 'Forbidden',
                JSON.stringify(response.data)
            );
        }

        if (response.status !== 200) {
            throw new SignatureMissingTokensError(
                `[${routeId}] Failed to sign a request: ${response?.data?.message || 'Unknown error'}`
            );
        }

        if (!response.data || Object.keys(response.data?.response?.tokens || {}).length < 1) {
            throw new SignatureMissingTokensError(
                `[${routeId}] Failed to sign a request due to missing tokens in response!`
            );
        }

        return response.data;
    }
);
