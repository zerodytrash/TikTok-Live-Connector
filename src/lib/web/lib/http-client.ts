import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { deserializeMessage } from '@/lib/utilities';
import CookieJar from '@/lib/web/lib/cookie-jar';
import { WebcastHttpClientRequestParams, WebcastMessage, WebcastPushConnectionClientParams } from '@/types';
import Config from '@/lib/config';
import TikTokSigner from '@/lib/web/lib/tiktok-signer';

export default class WebcastHttpClient {

    // HTTP Request Client
    protected axiosInstance: AxiosInstance;

    // External Cookie Jar
    public readonly cookieJar: CookieJar;

    // Internal Client Parameter Store
    public clientParams: Record<string, string>;

    constructor(
        customHeaders: Record<string, string>,
        axiosOptions: AxiosRequestConfig,
        clientParams: Record<string, string>,
        public readonly webSigner: TikTokSigner = new TikTokSigner()
    ) {

        this.axiosInstance = axios.create({
            timeout: parseInt(process.env.TIKTOK_CLIENT_TIMEOUT || '10000'),
            headers: { ...Config.DEFAULT_REQUEST_HEADERS, ...customHeaders },
            ...axiosOptions
        });

        this.clientParams = {
            ...Config.DEFAULT_HTTP_CLIENT_PARAMS,
            ...clientParams
        };

        // Create the cookie jar
        this.cookieJar = new CookieJar(this.axiosInstance);

        // Process the cookie header
        if (!!customHeaders?.Cookie) {
            const cookieHeader = customHeaders.Cookie;
            delete customHeaders['Cookie'];
            cookieHeader.split('; ').forEach((v: string) => this.cookieJar.processSetCookieHeader(v));
        }

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
    protected async request(
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
        let url: string = `${host}${path}?${new URLSearchParams(params || {})}`;

        // Sign the request. Assumption is if it doesn't throw, it worked.
        if (signRequest) {
            const signResponse = await this.webSigner.webcastSign(
                url,
                method
            );

            url = signResponse.response.signedUrl;
            headers['User-Agent'] = signResponse.response.userAgent;
        }

        // Execute the request
        return this.axiosInstance.request(
            {
                url: url,
                headers: headers,
                method: method,
                ...extraOptions
            }
        );

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
        return this.clientParams.room_id || '';
    }

    /**
     * Get HTML from TikTok website
     *
     * @param path Path to the HTML page
     */
    public async getHtmlFromTikTokWebsite(
        path: string
    ): Promise<string> {

        const fetchResponse = await this.request(
            {
                host: Config.TIKTOK_URL_WEB,
                path: path,
                responseType: 'text',
                signRequest: false
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
     */
    public async getDeserializedObjectFromWebcastApi<T extends keyof WebcastMessage>(
        path: string,
        params: Record<string, any>,
        schemaName: T,
        signRequest: boolean = false
    ) {
        const fetchResponse = await this.request(
            {
                host: Config.TIKTOK_URL_WEBCAST,
                path: path,
                params: params,
                signRequest: signRequest
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

        const fetchResponse = await this.request(
            {
                host: Config.TIKTOK_URL_WEBCAST,
                path: path,
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

        const fetchResponse = await this.request(
            {
                host: Config.TIKTOK_URL_WEBCAST,
                path: path,
                params: params,
                responseType: 'json',
                signRequest: signRequest,
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
                host: Config.TIKTOK_URL_WEB,
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

