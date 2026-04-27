import EulerStreamApiClient, { ClientConfiguration } from '@eulerstream/euler-api-sdk';
import { VERSION } from '@/version';

/**
 * Should never be changed, used to identify the library in requests to TikTok's APIs
 */
export const LIBRARY_IDENTITY = 'ttlive-node';

/**
 * Allow caching of the API client
 */
export type SignConfig = Partial<ClientConfiguration> & { cachedInstance?: EulerStreamApiClient };

export const SignConfig: SignConfig = {
    basePath: process.env.SIGN_API_URL || 'https://tiktok.eulerstream.com',
    apiKey: process.env.SIGN_API_KEY,
    baseOptions: {
        headers: { 'User-Agent': `tiktok-live-connector/${VERSION} ${process.platform}` },
        validateStatus: () => true
    },
    cachedInstance: undefined
};

/**
 * Creates (or retrieves from cache) an instance of the Euler Stream API client configured with SignConfig.
 *
 * Should be a global singleton to avoid unnecessary re-instantiations and to allow for dynamic config changes (e.g. API key rotation).
 *
 */
export function createEulerClient(): EulerStreamApiClient {
    const { cachedInstance, ...clientConfig } = { ...SignConfig };

    if (cachedInstance) {
        return cachedInstance;
    }

    SignConfig.cachedInstance = new EulerStreamApiClient(clientConfig);
    return SignConfig.cachedInstance;

}
