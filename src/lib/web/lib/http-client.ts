import axios, { AxiosInstance } from 'axios';
import { deserializeMessage } from '@/lib/utilities';
import CookieJar from '@/lib/web/lib/cookie-jar';
import { WebcastHttpClientConfig, WebcastHttpClientRequestParams, WebcastMessage } from '@/types/client';
import Config from '@/lib/config';
import { ISignTikTokUrlBodyMethodEnum } from '@eulerstream/euler-api-sdk/dist/sdk/api';
import { EulerSigner } from '@/lib';


export default class WebcastHttpClient {

    // HTTP Request Client
    public readonly axiosInstance: AxiosInstance;

    // External Cookie Jar
    public readonly cookieJar: CookieJar;

    // Internal Client Parameter Store
    public clientParams: Record<string, string>;

    constructor(
        public readonly configuration: WebcastHttpClientConfig = {
            customHeaders: {},
            axiosOptions: {},
            clientParams: {},
            authenticateWs: false,
            signApiKey: undefined
        },
        public readonly webSigner: EulerSigner = new EulerSigner({ apiKey: configuration.signApiKey })
    ) {

        this.axiosInstance = axios.create({
            timeout: parseInt(process.env.TIKTOK_CLIENT_TIMEOUT || '10000'),
            headers: { ...Config.DEFAULT_HTTP_CLIENT_HEADERS, ...this.configuration.customHeaders },
            ...this.configuration.axiosOptions
        });

        this.clientParams = {
            ...Config.DEFAULT_HTTP_CLIENT_PARAMS,
            ...this.configuration.clientParams
        };

        // Create the cookie jar
        this.cookieJar = new CookieJar(this.axiosInstance);

        // Process the cookie header
        if (!!this.configuration.customHeaders?.Cookie) {
            const cookieHeader = this.configuration.customHeaders.Cookie;
            delete this.configuration.customHeaders['Cookie'];
            cookieHeader.split('; ').forEach((v: string) => this.cookieJar.processSetCookieHeader(v));
        }

    }

    /**
     * Set the Room ID for the client
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
     * Build the URL for the request
     *
     * @param host The host for the request
     * @param path The path for the request
     * @param params The query parameters for the request
     * @param signRequest Whether to sign the request or not
     * @param method The HTTP method for the request
     * @param headers The headers for the request
     * @param extraOptions Additional axios request options
     * @protected
     */
    public async request(
        {
            host,
            path,
            params,
            signRequest,
            method = 'GET',
            headers,
            ...extraOptions
        }: WebcastHttpClientRequestParams
    ) {

        // Build the initial URL
        let secure = !(host.startsWith('127.0.0.1') || host.startsWith('localhost') || host.startsWith('::1'));
        let url: string = `http${secure ? 's' : ''}://${host}/${path}?${new URLSearchParams(params || {})}`;

        // Sign the request. Assumption is if it doesn't throw, it worked.
        if (signRequest) {
            const signMethod = Object.values(ISignTikTokUrlBodyMethodEnum).includes(method.toUpperCase() as ISignTikTokUrlBodyMethodEnum);
            if (!signMethod) {
                throw new Error(`Invalid method for signing: ${method}. Must be one of ${Object.values(ISignTikTokUrlBodyMethodEnum).join(', ')}`);
            }

            const signResponse = await this.webSigner.webcastSign(
                url,
                method.toUpperCase() as ISignTikTokUrlBodyMethodEnum,
                this.axiosInstance.defaults.headers['User-Agent'] as string,
                this.cookieJar.sessionId,
                this.cookieJar.ttTargetIdc
            );

            url = signResponse.response.signedUrl;

            headers ||= {};
            headers['User-Agent'] = signResponse.response.userAgent;
        }


        // Execute the request
        return this.axiosInstance.request(
            {
                url: url,
                headers: headers ?? undefined,
                method: method,
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
                host: Config.TIKTOK_HOST_WEB,
                path: path,
                responseType: 'text',
                signRequest: false,
                ...options
            }
        );

        return fetchResponse.data;
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
        params: Record<string, any>,
        schemaName: T,
        signRequest: boolean = false,
        options: Partial<WebcastHttpClientRequestParams> = {}
    ) {
        const fetchResponse = await this.request(
            {
                host: Config.TIKTOK_HOST_WEBCAST,
                path: 'webcast/' + path,
                params: params,
                signRequest: signRequest,
                responseType: 'arraybuffer',
                ...options
            }
        );

        return deserializeMessage(schemaName, fetchResponse.data);
    }

    public async postJsonObjectToWebcastApi<T extends Record<string, any>>(
        path: string,
        params: Record<string, string>,
        data: Record<string, any>,
        signRequest: boolean = false,
        options: Partial<WebcastHttpClientRequestParams> = {}
    ): Promise<T> {

        options.headers ||= {};
        options.headers['Content-Type'] = 'application/json; charset=UTF-8';

        const fetchResponse = await this.request(
            {
                host: Config.TIKTOK_HOST_WEBCAST,
                path: 'webcast/' + path,
                data: data,
                params: params,
                responseType: 'json',
                signRequest: signRequest,
                method: 'POST',
                ...options
            }
        );

        return fetchResponse.data;
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

        options.headers = {};

        const fetchResponse = await this.request(
            {
                host: Config.TIKTOK_HOST_WEBCAST,
                path: 'webcast/' + path,
                params: params,
                responseType: 'json',
                signRequest: signRequest,
                headers: {
                    ...options.headers
                },
                ...options
            }
        );

        return fetchResponse.data;
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
                host: Config.TIKTOK_HOST_WEB,
                path: path,
                params: params,
                responseType: 'json',
                signRequest: signRequest,
                ...options
            }
        );

        return fetchResponse.data;
    }

}

