import WebcastHttpClient from '@/lib/web/lib/http-client';
import EulerStreamApiClient from '@eulerstream/euler-api-sdk';

/**
 * Per-call options forwarded to the Euler Stream SDK (axios-shaped under the hood).
 * Typed loosely so the public surface doesn't pull in axios's declaration files.
 */
export type EulerRouteRequestOptions = Record<string, any>;

/**
 * Makes calls to TikTok directly
 */
export type WebcastHttpRouteArgs<T = {}> = {
    webClient: WebcastHttpClient
} & T

/**
 * Makes calls to Euler Stream's API
 */
export type WebcastHttpEulerRouteArgs<T = {}> = WebcastHttpRouteArgs & {
    apiClient: EulerStreamApiClient,
    options?: EulerRouteRequestOptions
} & T

/**
 * Combines the use of TikTok & Euler Stream APIs
 */
export type WebcastHttpCompositeRouteArgs<T = {}> = WebcastHttpEulerRouteArgs<T>;

export type HttpRoute<P, R> = (args: P) => Promise<R>
export type WrappedHttpRoute<P, R> = (args: P & { routeId: string }) => Promise<R>


