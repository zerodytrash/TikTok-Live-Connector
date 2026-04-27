import got, { Got, Method } from 'got';
import { deserializeMessage } from '@/lib/ws/lib/proto-utils';
import WebcastCookieJar from '@/lib/web/lib/cookie-jar';
import { OAuthTokenSessionBundle, WebcastHttpClientRequestParams, WebcastMessage } from '@/types/client';
import { WebcastWebConfigDefaults } from '@/lib/web/defaults';
import { RouteConfig } from '@/lib/web/config';
import { isIP } from 'node:net';
import EulerStreamApiClient, {
    SignTikTokUrlBodyMethodEnum,
    SignWebcastUrl200Response
} from '@eulerstream/euler-api-sdk';
import { createEulerClient } from '@/lib/web/routes/euler/config';
import { WebcastGotHttpConfig } from '@/types/web';


export default class WebcastHttpClient {

    // Public access state
    public oAuthSessionBundle: OAuthTokenSessionBundle | null = null;

    // HTTP Client Instance, protected to hint that you should be careful when accessing this
    protected readonly _gotInstance: Got;
    protected readonly _eulerApiInstance: EulerStreamApiClient;
    protected readonly _webcastWebConfig: WebcastWebConfigDefaults;

    // Publicly accessible options
    public readonly clientParams: Record<string, string>;
    public readonly clientHeaders: Record<string, string>;
    public readonly cookieJar: WebcastCookieJar;


    /**
     * Instantiate a Webcast HTTP Client
     *
     * @param webcastWebConfig Randomized config for Webcast requests
     * @param eulerApiInstance Rarely needed override for the cached & lazy-loaded API client
     * @param gotHttpConfig Rarely needed override for the Got HTTP library configuration
     */
    constructor(
        webcastWebConfig: WebcastWebConfigDefaults,
        eulerApiInstance?: EulerStreamApiClient,
        gotHttpConfig?: WebcastGotHttpConfig
    ) {

        // Pull anything we manage ourselves out of the got config so it doesn't end up frozen on got's defaults.
        const { headers: userHeaders, searchParams: userSearchParams, timeout, ...gotOptions } = gotHttpConfig || {};

        // Merge headers & params
        const cleanWebcastConfig = structuredClone(webcastWebConfig);
        cleanWebcastConfig.DEFAULT_HTTP_CLIENT_PARAMS = { ...cleanWebcastConfig.DEFAULT_HTTP_CLIENT_PARAMS, ...userSearchParams };
        cleanWebcastConfig.DEFAULT_HTTP_CLIENT_HEADERS = { ...cleanWebcastConfig.DEFAULT_HTTP_CLIENT_HEADERS, ...userHeaders };

        // Assign internally managed objects
        this.clientParams = cleanWebcastConfig.DEFAULT_HTTP_CLIENT_PARAMS;
        this.clientHeaders = cleanWebcastConfig.DEFAULT_HTTP_CLIENT_HEADERS;
        this.cookieJar = new WebcastCookieJar(webcastWebConfig);
        this._eulerApiInstance = eulerApiInstance ?? createEulerClient();
        this._webcastWebConfig = cleanWebcastConfig;

        // Got instance: transport only. NO headers, NO searchParams in the defaults; those live on `this`.
        this._gotInstance = got.extend({

            // Base timeout, can be overridden
            timeout: {
                request: parseInt(process.env.TIKTOK_CLIENT_TIMEOUT || '10000')
            },

            // Generic options
            ...gotOptions,

            // Explicitly set as we handle this within the client itself
            // Must never be overridden
            searchParams: undefined,
            headers: undefined,
            cookieJar: this.cookieJar
        });

    }

    /**
     * Get an instance of the underlying API Client
     */
    public get apiClient(): EulerStreamApiClient {
        return this._eulerApiInstance;
    }

    /**
     * Set the Room ID for the client
     *
     * @param roomId The client's Room ID
     */
    public set roomId(roomId: string) {
        this.clientParams.room_id = roomId;
    }

    /**
     * Get the Room ID for the client
     */
    public get roomId() {
        return (this.clientParams.room_id as string) || '';
    }

    /**
     * Issue an HTTP request, merging the per-call options with the live client state
     * (headers, search params, cookie jar) and optionally routing the URL through the
     * sign server first.
     *
     * @param options.host Host portion of the request URL.
     * @param options.path Path appended to the host.
     * @param options.searchParams Per-call query parameters. Merged on top of `clientParams`; per-call values win on key collision.
     * @param options.signRequest If true, the URL is signed via `RouteConfig.fetchWebcastSignatureFromProvider` and any returned signed URL / User-Agent are honored.
     * @param options.method HTTP method. Defaults to `GET`.
     * @param options.headers Per-call headers. Merged on top of `clientHeaders`; per-call values win on key collision.
     * @param options Any other field is forwarded to `got` as-is (body, responseType, retry, etc.).
     */
    public async request(
        {
            host,
            path,
            searchParams,
            signRequest,
            method = 'GET',
            headers,
            ...extraOptions
        }: WebcastHttpClientRequestParams
    ) {

        // Merge live state from the client into per-call options. Per-call values win on key collision.
        const mergedHeaders: Record<string, string> = { ...this.clientHeaders, ...headers };
        const mergedParams: Record<string, string> = { ...this.clientParams, ...searchParams };

        let url: string = `${this.getBaseUrl(host)}/${path}?${new URLSearchParams(mergedParams)}`;

        // Sign the HTTP Request
        if (signRequest) {
            let signResponse: SignWebcastUrl200Response = await RouteConfig.fetchWebcastSignatureFromProvider(
                {
                    url,
                    method: method.toString().toUpperCase() as SignTikTokUrlBodyMethodEnum,
                    userAgent: mergedHeaders['User-Agent'] as string,
                    webClient: this,
                    apiClient: this._eulerApiInstance
                }
            );

            // Honour the signature
            if (signResponse.response?.signedUrl) {
                url = signResponse.response.signedUrl;
                if (signResponse.response.userAgent) {
                    mergedHeaders['User-Agent'] = signResponse.response.userAgent;
                }
            }

        }

        // Execute the request
        return this._gotInstance(
            url,
            {
                headers: mergedHeaders,
                method: method as Method,
                ...extraOptions
            }
        );

    }

    /**
     * Get HTML from TikTok website
     *
     * @param path Path to the HTML page
     * @param options Additional request options
     */
    public async getHtmlFromTikTokWebsite(
        path: string,
        options: Partial<WebcastHttpClientRequestParams> = {}
    ): Promise<string> {

        const fetchResponse = await this.request(
            {
                host: this._webcastWebConfig.TIKTOK_HOST_WEB,
                path: path,
                responseType: 'text',
                signRequest: false,
                ...options
            }
        );

        return fetchResponse.body as unknown as string;
    }

    /**
     * Get deserialized object from Webcast API
     *
     * @param path Path to the API endpoint
     * @param params Query parameters to be sent with the request
     * @param schemaName Schema name for deserialization
     * @param signRequest Whether to sign the request or not
     * @param options Additional request options
     */
    public async getDeserializedObjectFromWebcastApi<T extends keyof WebcastMessage>(
        path: string,
        params: Record<string, string>,
        schemaName: T,
        signRequest: boolean = false,
        options: Partial<WebcastHttpClientRequestParams> = {}
    ) {
        const fetchResponse = await this.request(
            {
                host: this._webcastWebConfig.TIKTOK_HOST_WEBCAST,
                path: 'webcast/' + path,
                searchParams: params,
                signRequest: signRequest,
                responseType: 'buffer',
                ...options
            }
        );

        return deserializeMessage(schemaName, fetchResponse.body as unknown as Buffer);
    }

    public async postJsonObjectToWebcastApi<T extends Record<string, any>>(
        path: string,
        params: Record<string, string>,
        data: Record<string, any>,
        signRequest: boolean = false,
        options: Partial<WebcastHttpClientRequestParams> = {}
    ): Promise<T> {

        const fetchResponse = await this.request(
            {
                host: this._webcastWebConfig.TIKTOK_HOST_WEBCAST,
                path: 'webcast/' + path,
                body: JSON.stringify(data),
                searchParams: params,
                responseType: 'json',
                signRequest: signRequest,
                method: 'POST',
                ...options,
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    ...options.headers
                }
            }
        );

        return fetchResponse.body as unknown as T;
    }

    /**
     * Get JSON object from Webcast API
     *
     * @param path Path to the API endpoint
     * @param params Query parameters to be sent with the request
     * @param signRequest Whether to sign the request or not
     * @param options Additional request options
     */
    public async getJsonObjectFromWebcastApi<T extends Record<string, any>>(
        path: string,
        params: Record<string, string>,
        signRequest: boolean = false,
        options: Partial<WebcastHttpClientRequestParams> = {}
    ): Promise<T> {

        const fetchResponse = await this.request(
            {
                host: this._webcastWebConfig.TIKTOK_HOST_WEBCAST,
                path: 'webcast/' + path,
                searchParams: params,
                responseType: 'json',
                signRequest: signRequest,
                ...options
            }
        );

        return fetchResponse.body as unknown as T;
    }

    /**
     * Get JSON object from TikTok API
     *
     * @param path Path to the API endpoint
     * @param params Query parameters to be sent with the request
     * @param signRequest Whether to sign the request or not
     * @param options Additional request options
     */
    public async getJsonObjectFromTikTokApi<T extends Record<string, any>>(
        path: string,
        params: Record<string, string>,
        signRequest: boolean = false,
        options: Partial<WebcastHttpClientRequestParams> = {}
    ): Promise<T> {

        const fetchResponse = await this.request(
            {
                host: this._webcastWebConfig.TIKTOK_HOST_WEB,
                path: path,
                searchParams: params,
                responseType: 'json',
                signRequest: signRequest,
                ...options
            }
        );

        return fetchResponse.body as unknown as T;
    }

    /**
     * Determine if a host is secure
     *
     * @param host The host to check
     * @protected
     */
    protected isSecure(host: string): boolean {
        const { hostname } = new URL(host.includes('://') ? host : `http://${host}`);

        return (
            hostname === 'localhost' ||
            hostname === '[::1]' || // IPv6 loopback
            hostname === '::1' ||
            (isIP(hostname) === 4 && hostname.startsWith('127.')) // IPv4 loopback range
        );
    }

    /**
     * Get the base URL from a host, no trailing slash
     *
     * @param host The host to get a base URL for
     * @protected
     */
    protected getBaseUrl(host: string): string {
        return `http${this.isSecure(host) ? 's' : ''}://${host}`;
    }

}



