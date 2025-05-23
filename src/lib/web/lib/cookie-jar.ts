import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Config from '@/lib/config';

/**
 * Custom cookie jar for axios
 * Because axios-cookiejar-support does not work as expected when using proxy agents
 * https://github.com/zerodytrash/TikTok-Livestream-Chat-Connector/issues/18
 */
export default class CookieJar {

    /**
     * Constructor
     *
     * @param axiosInstance The axios instance to attach the cookie jar to
     * @param cookies The initial cookies to set
     */
    constructor(
        public readonly axiosInstance: AxiosInstance,
        public readonly cookies: Record<string, string> = Config.DEFAULT_HTTP_CLIENT_COOKIES
    ) {
        // Intercept responses to store cookies
        this.axiosInstance.interceptors.response.use((response) => {
            this.readCookies(response);
            return response;
        });

        // Intercept request to append cookies
        this.axiosInstance.interceptors.request.use((request) => {
            this.appendCookies(request);
            return request;
        });

        // Return a proxy object to allow direct access to cookies
        return new Proxy(
            this,
            {
                get(target: CookieJar, p: string): any {
                    if (p in target) {
                        return target[p];
                    } else {
                        return target.cookies[p];
                    }
                },
                set(target: CookieJar, p: string, value: any): boolean {
                    if (value === null) {
                        // Delete the cookie if the value is null
                        delete target.cookies[p];
                        return true;
                    }

                    if (p in target) {
                        target[p] = value;
                    } else {
                        target.cookies[p] = value;
                    }
                    return true;
                },
                deleteProperty(target: CookieJar, p: string): boolean {
                    delete target.cookies[p];
                    return true;
                }
            }
        );
    }

    /**
     * Set the session ID and tt-target-idc
     *
     * @param sessionId The session ID to set
     * @param ttTargetIdc The tt-target-idc to set
     */
    public setSession(sessionId: string | null, ttTargetIdc: string | null) {

        if (sessionId && !ttTargetIdc) {
            throw new Error('tt-target-idc is required when sessionId is set');
        }

        // (1) Set the sid
        this.cookies['sessionid'] = sessionId;
        this.cookies['sessionid_ss'] = sessionId;
        this.cookies['sid_tt'] = sessionId;
        this.cookies['sid_guard'] = sessionId;

        // (2) Set the IDC, basically, the account region. Must match the account's sid.
        this.cookies['tt-target-idc'] = ttTargetIdc;
    }

    /**
     * Get the tt-target-idc cookie
     */
    public get ttTargetIdc(): string | null {
        return this.cookies['tt-target-idc'] || null;
    }

    /**
     * Get the session ID
     */
    public get sessionId(): string | null {
        return this.cookies['sessionid'] || this.cookies['sessionid_ss'] || this.cookies['sid_tt'] || this.cookies['sid_guard'] || null;
    }

    /**
     * Read cookies from response headers
     * @param response The axios response
     */
    public readCookies(response: AxiosResponse) {
        const setCookieHeaders = response.headers['set-cookie'];
        if (Array.isArray(setCookieHeaders)) {
            // Multiple set-cookie headers
            setCookieHeaders.forEach((setCookieHeader) => this.processSetCookieHeader(setCookieHeader));
        } else if (typeof setCookieHeaders === 'string') {
            // Single set-cookie header
            this.processSetCookieHeader(setCookieHeaders);
        }
    }

    /**
     * Append cookies to request headers
     * @param request The axios request
     */
    public appendCookies(request: AxiosRequestConfig) {
        // We use the capitalized 'Cookie' header, because every browser does that
        if (request.headers['cookie']) {
            request.headers['Cookie'] = request.headers['cookie'];
            delete request.headers['cookie'];
        }

        // Cookies already set by custom headers? => Append
        const headerCookie = request.headers['Cookie'];
        if (typeof headerCookie === 'string') {
            Object.assign(this.cookies, this.parseCookie(headerCookie), this.cookies);
        }

        request.headers['Cookie'] = this.getCookieString();
    }

    /**
     * Parse cookie string
     * @param str The cookie string
     */
    public parseCookie(str: string): Record<string, string> {
        const cookies: Record<string, string> = {};
        if (!str) return cookies;

        str.split('; ').forEach((v) => {
            if (!v) return;
            const parts = String(v).split('=');
            const cookieName = decodeURIComponent(parts.shift());
            cookies[cookieName] = parts.join('=');
        });

        return cookies;
    }

    /**
     * Process a single set-cookie header
     * @param setCookieHeader The set-cookie header
     */
    public processSetCookieHeader(setCookieHeader: string): void {
        const nameValuePart = setCookieHeader.split(';')[0];
        const parts = nameValuePart.split('=');
        const cookieName = parts.shift();
        const cookieValue = parts.join('=');

        if (typeof cookieName === 'string' && cookieName !== '' && typeof cookieValue === 'string') {
            this.cookies[decodeURIComponent(cookieName)] = cookieValue;
        }
    }

    /**
     * Get the cookie string
     */
    public getCookieString(): string {
        let cookieParams = [];

        for (const [cookieName, cookieValue] of Object.entries(this.cookies)) {
            if (!cookieValue) continue;
            cookieParams.push(cookieName + '=' + cookieValue);
        }

        return cookieParams.join('; ');
    }

}

