import axios, { AxiosInstance, AxiosRequestConfig, ResponseType } from 'axios';
import { WebcastMessage, WebcastPushConnectionClientParams } from '@/types';
import SignatureProvider from '@/lib/modules/signature-provider';
import CookieJar from '@/lib/modules/cookie-jar';
import Config from '@/lib/modules/config';
import { deserializeMessage } from '@/lib/modules/protobuf-utilities';

export default class WebcastHttpClient {
    public static signatureProvider = new SignatureProvider();
    protected axiosInstance: AxiosInstance;
    public readonly cookieJar: CookieJar;

    public clientParams: WebcastPushConnectionClientParams = {
        cursor: '',
        internal_ext: '',
        room_id: ''
    };

    constructor(
        customHeaders: Record<string, any>,
        axiosOptions: AxiosRequestConfig,
        sessionId: string,
        public signProviderOptions: any,
        clientParams: WebcastPushConnectionClientParams
    ) {

        this.clientParams = {
            ...Config.DEFAULT_CLIENT_PARAMS,
            ...clientParams
        };

        // Create the axios instance
        this.axiosInstance = axios.create({
            timeout: 10000,
            headers: {
                ...Config.DEFAULT_REQUEST_HEADERS,
                ...customHeaders
            },
            ...(axiosOptions || {})
        });

        // Create the cookie jar
        this.cookieJar = new CookieJar(this.axiosInstance);
        const { Cookie } = customHeaders || {};

        if (Cookie) {
            delete customHeaders['Cookie'];
            Cookie.split('; ').forEach((v: string) => this.cookieJar.processSetCookieHeader(v));
        }

        if (sessionId) {
            this.setSessionId(sessionId);
        }
    }

    protected get(
        url: string,
        responseType?: ResponseType
    ) {
        return this.axiosInstance.get(url, { responseType: responseType });
    }

    protected post(
        url: string,
        params: Record<string, any>,
        data: Record<string, any>,
        responseType: ResponseType
    ) {
        return this.axiosInstance.post(url, data, { params, responseType });
    }

    public setSessionId(sessionId: string) {
        this.cookieJar['sessionid'] = sessionId;
        this.cookieJar['sessionid_ss'] = sessionId;
        this.cookieJar['sid_tt'] = sessionId;
    }

    public async buildUrl(
        host: string,
        path: string,
        params: Record<string, any>,
        signRequest: boolean = false
    ) {
        let fullUrl = `${host}${path}?${new URLSearchParams(params || {})}`;

        if (signRequest) {
            fullUrl = await WebcastHttpClient.signatureProvider.signWebcastRequest(
                fullUrl,
                this.axiosInstance.defaults.headers,
                this.cookieJar,
                this.signProviderOptions
            );
        }

        return fullUrl;
    }

    async getMainPage(
        path: string
    ) {
        let response = await this.get(`${Config.TIKTOK_URL_WEB}${path}`);
        return response.data;
    }

    async getDeserializedObjectFromWebcastApi<T extends keyof WebcastMessage>(
        path: string,
        params: Record<string, any>,
        schemaName: T,
        signRequest: boolean = false
    ) {
        let url = await this.buildUrl(Config.TIKTOK_URL_WEBCAST, path, params, signRequest);
        let response = await this.get(url, 'arraybuffer');
        return deserializeMessage(schemaName, response.data);
    }

    async getJsonObjectFromWebcastApi(
        path: string,
        params: Record<string, any>,
        signRequest: boolean = false
    ) {
        let url = await this.buildUrl(Config.TIKTOK_URL_WEBCAST, path, params, signRequest);
        let response = await this.get(url, 'json');
        return response.data;
    }

    async postFormDataToWebcastApi(
        path: string,
        params: Record<string, any>,
        formData: Record<string, any>
    ) {
        let response = await this.post(`${Config.TIKTOK_URL_WEBCAST}${path}`, params, formData, 'json');
        return response.data;
    }

    async getJsonObjectFromTiktokApi(
        path: string,
        params: Record<string, any>,
        signRequest: boolean = false
    ) {
        let url = await this.buildUrl(Config.TIKTOK_URL_WEB, path, params, signRequest);
        let response = await this.get(url, 'json');
        return response.data;
    }
}

