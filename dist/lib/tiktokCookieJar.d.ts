export = TikTokCookieJar;
/**
 * Custom cookie jar for axios
 * Because axios-cookiejar-support does not work as expected when using proxy agents
 * https://github.com/zerodytrash/TikTok-Livestream-Chat-Connector/issues/18
 */
declare class TikTokCookieJar {
    constructor(axiosInstance: any);
    axiosInstance: any;
    cookies: {};
    readCookies(response: any): void;
    appendCookies(request: any): void;
    /**
     * parse cookies string to object
     * @param {string} str  multi-cookie string
     * @returns {Object} parsed cookie object
     */
    parseCookie(str: string): any;
    processSetCookieHeader(setCookieHeader: any): void;
    getCookieByName(cookieName: any): any;
    getCookieString(): string;
    setCookie(name: any, value: any): void;
}
//# sourceMappingURL=tiktokCookieJar.d.ts.map