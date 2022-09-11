/**
 * Custom cookie jar for axios
 * Because axios-cookiejar-support does not work as expected when using proxy agents
 * https://github.com/zerodytrash/TikTok-Livestream-Chat-Connector/issues/18
 */

class TikTokCookieJar {
    constructor(axiosInstance) {
        this.axiosInstance = axiosInstance;
        this.cookies = {};

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
    }

    readCookies(response) {
        const setCookieHeaders = response.headers['set-cookie'];

        if (Array.isArray(setCookieHeaders)) {
            // Mutiple set-cookie headers
            setCookieHeaders.forEach((setCookieHeader) => {
                this.processSetCookieHeader(setCookieHeader);
            });
        } else if (typeof setCookieHeaders === 'string') {
            // Single set-cookie header
            this.processSetCookieHeader(setCookieHeaders);
        }
    }

    appendCookies(request) {
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
     * parse cookies string to object
     * @param {string} str  multi-cookie string
     * @returns {Object} parsed cookie object
     */
    parseCookie(str) {
        const cookies = {};

        if (!str) {
            return cookies;
        }

        str.split('; ').forEach((v) => {
            if (!v) {
                return;
            }

            const parts = String(v).split('=');

            const cookieName = decodeURIComponent(parts.shift());
            const cookieValue = parts.join('=');

            cookies[cookieName] = cookieValue;
        });

        return cookies;
    }

    processSetCookieHeader(setCookieHeader) {
        const nameValuePart = setCookieHeader.split(';')[0];
        const parts = nameValuePart.split('=');
        const cookieName = parts.shift();
        const cookieValue = parts.join('=');

        if (typeof cookieName === 'string' && cookieName !== '' && typeof cookieValue === 'string') {
            // this.cookies[decodeURIComponent(cookieName)] = decodeURIComponent(cookieValue);
            this.cookies[decodeURIComponent(cookieName)] = cookieValue;
        }
    }

    getCookieByName(cookieName) {
        return this.cookies[cookieName];
    }

    getCookieString() {
        let cookieString = '';
        for (const cookieName in this.cookies) {
            cookieString += encodeURIComponent(cookieName) + '=' + this.cookies[cookieName] + '; ';
        }

        return cookieString;
    }

    setCookie(name, value) {
        this.cookies[name] = value;
    }
}

module.exports = TikTokCookieJar;
