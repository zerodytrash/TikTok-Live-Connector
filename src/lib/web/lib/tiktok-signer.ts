import { URL } from 'url';
import { PremiumFeatureError, SignatureMissingTokensError } from '@/types/errors';
import EulerStreamApiClient, { ClientConfiguration, SignWebcastUrl200Response } from '@eulerstream/euler-api-sdk';
import { ISignTikTokUrlBodyMethodEnum } from '@eulerstream/euler-api-sdk/dist/sdk/api';
import { SignConfig } from '@/lib';


/**
 * TikTok Signer class
 */
export class EulerSigner extends EulerStreamApiClient {

    constructor(config: Partial<ClientConfiguration> = {}) {
        super({ ...SignConfig, ...config });
    }

    /**
     * Sign a URL using the TikTok signature provider
     *
     * @param url The URL to sign
     * @param method The HTTP method to use (GET, POST, etc.)
     * @param userAgent The user agent to sign with
     * @param sessionId The session ID to use (optional)
     * @param ttTargetIdc The target IDC to use (optional)
     */
    public async webcastSign(
        url: string | URL,
        method: ISignTikTokUrlBodyMethodEnum,
        userAgent: string,
        sessionId?: string,
        ttTargetIdc?: string
    ): Promise<SignWebcastUrl200Response> {
        const mustRemoveParams = ['X-Bogus', 'X-Gnarly', 'msToken'];
        let cleanUrl = typeof url === 'string' ? url : url.toString();

        for (const param of mustRemoveParams) {
            cleanUrl = cleanUrl.replace(new RegExp(`([&?])${param}=[^&]*`, 'g'), '$1');
            cleanUrl = cleanUrl.replace(/[&?]$/, '');
        }

        if (sessionId && !ttTargetIdc) {
            throw new Error(
                'ttTargetIdc must be set when sessionId is provided.'
            );
        }

        // Sign the URL
        const response = await this.webcast.signWebcastUrl(
            {
                url: cleanUrl,
                method: method,
                userAgent: userAgent,
                sessionId: sessionId,
                ttTargetIdc: ttTargetIdc
            }
        );

        if (response.status === 403) {
            throw new PremiumFeatureError(
                'You do not have permission from the signature provider to sign this URL.',
                response.data.message,
                JSON.stringify(response.data)
            );
        }

        if (!response.data || Object.keys(response.data.response.tokens || {}).length < 1) {
            throw new SignatureMissingTokensError(
                'Failed to sign a request due to missing tokens in response!'
            );
        }

        if (response.status !== 200) {
            throw new SignatureMissingTokensError(
                `Failed to sign a request: ${response?.data?.message || 'Unknown error'}`
            );
        }

        return response.data;
    }
}
