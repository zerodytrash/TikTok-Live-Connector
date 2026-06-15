import EulerStreamApiClient from 'tiktok-live-api-sdk';
import { VERSION } from '@/version';

export const SIGN_API_KEY_ENV = 'SIGN_API_KEY';

export function hasEulerApiKey(): boolean {
    return Boolean(process.env[SIGN_API_KEY_ENV]?.trim());
}

export function getRequiredSignApiKey(): string {
    const value = process.env[SIGN_API_KEY_ENV]?.trim();
    if (!value) {
        throw new Error(`Missing required environment variable: ${SIGN_API_KEY_ENV}`);
    }

    return value;
}

export function createLiveEulerClient(): EulerStreamApiClient {
    return new EulerStreamApiClient({
        apiKey: getRequiredSignApiKey(),
        basePath: process.env.SIGN_API_URL || 'https://api.eulerstream.com',
        baseOptions: {
            headers: {
                'User-Agent': `tiktok-live-connector-test/${VERSION} ${process.platform}`
            },
            validateStatus: () => true
        }
    });
}
