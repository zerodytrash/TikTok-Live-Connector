import axios, { AxiosInstance } from 'axios';
import { URL } from 'url';
import { name, version } from '../../../../package.json';
import { PremiumEndpointError, SignatureMissingTokensError, UnexpectedSignatureError } from '@/types/errors';
import { SignResponse } from '@/types';

/**
 * TikTok Signer class
 */
export default class TikTokSigner {
    public signApiKey?: string;
    public readonly signApiBases: string[];
    public readonly axiosInstance: AxiosInstance;

    constructor(
        signApiKey?: string,
        signApiBase?: string,
        fallbackHosts: string[] = []
    ) {
        this.signApiKey = signApiKey || process.env.SIGN_API_KEY;
        const primaryBase = signApiBase || process.env.SIGN_API_URL!;
        this.signApiBases = [primaryBase, ...fallbackHosts];

        const headers: Record<string, string> = {
            'User-Agent': `TikTokLive.ts/1.0.0`
        };

        if (this.signApiKey) {
            headers['X-Api-Key'] = this.signApiKey;
        }

        this.axiosInstance = axios.create({
            timeout: 5000,
            headers: { 'User-Agent': `${name}/${version} ${process.platform}` }
        });
    }

    /**
     * Sign a URL using the TikTok signature provider
     *
     * @param url The URL to sign
     * @param method The HTTP method to use (GET, POST, etc.)
     */
    public async webcastSign(url: string | URL, method: string): Promise<SignResponse> {
        const mustRemoveParams = ['X-Bogus', 'X-Gnarly', 'msToken'];
        let cleanUrl = typeof url === 'string' ? url : url.toString();

        for (const param of mustRemoveParams) {
            cleanUrl = cleanUrl.replace(new RegExp(`([&?])${param}=[^&]*`, 'g'), '$1');
            cleanUrl = cleanUrl.replace(/[&?]$/, '');
        }

        let lastError: any = null;

        for (const base of this.signApiBases) {
            try {
                const response = await this.axiosInstance.post<SignResponse>(
                    `${base}/webcast/sign_url/`,
                    {
                        url: cleanUrl,
                        method,
                        userAgent: this.axiosInstance.defaults.headers['User-Agent'] || ''
                    }
                );

                const signResponse = response.data;

                if (signResponse.code === 403) {
                    throw new PremiumEndpointError(
                        'You do not have permission from the signature provider to sign this URL.',
                        signResponse.message,
                        response
                    );
                }

                if (!signResponse.response || !signResponse.response.signedUrl.includes('msToken')) {
                    throw new SignatureMissingTokensError(
                        'Failed to sign a request due to missing tokens in response!'
                    );
                }

                return signResponse;
            } catch (error: any) {
                lastError = error;
            }
        }

        if (lastError) {
            if (lastError instanceof PremiumEndpointError || lastError instanceof SignatureMissingTokensError) {
                throw lastError;
            }
            throw new UnexpectedSignatureError(
                `Failed to sign a request: ${lastError.message || lastError}`
            );
        }

        throw new UnexpectedSignatureError('Failed to sign a request: Unknown error');
    }
}
