import WebcastHttpClient from '@/lib/web/lib/http-client';
import EulerStreamApiClient from '@eulerstream/euler-api-sdk';
import { AxiosRequestConfig } from 'axios';

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
    options?: AxiosRequestConfig
} & T

/**
 * Combines the use of TikTok & Euler Stream APIs
 */
export type WebcastHttpCompositeRouteArgs<T = {}> = WebcastHttpEulerRouteArgs<T>;

export type HttpRoute<P, R> = (args: P) => Promise<R>
export type WrappedHttpRoute<P, R> = (args: P & { routeId: string }) => Promise<R>


