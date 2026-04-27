import { CookieSessionBundle } from '@/types';
import { WebcastWebConfigDefaults } from '@/lib/web/defaults';
import { AbstractWebcastCookieJar } from '@/types/web';


/**
 * Custom cookie jar for got
 *
 * Exposes `beforeRequest` / `afterResponse` hooks that the HTTP client wires into `got.extend(...)`,
 * mirroring the axios interceptor model from before the migration.
 *
 * https://github.com/zerodytrash/TikTok-Livestream-Chat-Connector/issues/18
 */
export default class WebcastCookieJar implements AbstractWebcastCookieJar {

    /**
     * The internal cookie store, a simple key-value object. The keys are cookie names, the values are cookie values.
     */
    public readonly store: Record<string, string>;

    /**
     * Constructor
     *
     * @param webConfig The current web config for the HTTP client
     */
    constructor(
        public readonly webConfig: WebcastWebConfigDefaults
    ) {

        // Initialize the store based on default Cookie header
        this.store = WebcastCookieJar.parseCookies(webConfig.DEFAULT_HTTP_CLIENT_HEADERS.Cookie);
    }

    /**
     * Set the session ID and tt-target-idc
     *
     * @param session The session bundle containing the session ID and tt-target-idc
     */
    public async setSessionBundle(session: CookieSessionBundle): Promise<void> {

        if (session.type !== 'cookie') {
            throw new TypeError('Invalid session bundle type. Expected \'cookie\'.');
        }

        // Update session values
        this.webConfig.SESSION_COOKIE_NAMES.forEach((cookie) => this.store[cookie] = session.value.sessionId);
        this.store[this.webConfig.TARGET_IDC_COOKIE_NAME] = session.value.ttTargetIdc;
    }

    /**
     * Get the session bundle containing the session ID and tt-target-idc
     *
     */
    public async getSessionBundle(): Promise<CookieSessionBundle | null> {
        let ttTargetIdc: string | null = this.store[this.webConfig.TARGET_IDC_COOKIE_NAME] || null;
        let sessionId: string | null = null;

        // Extract sessionid from the multiple possible cookie names
        for (const cookieName of this.webConfig.SESSION_COOKIE_NAMES) {
            if (this.store[cookieName]) {
                sessionId = this.store[cookieName];
                break;
            }
        }

        // Only return a session bundle if we have both tt-target-idc and a sessionid
        if (ttTargetIdc && sessionId) {
            return {
                type: 'cookie',
                value: {
                    ttTargetIdc,
                    sessionId
                }
            };
        }

        return null;
    }

    /**
     * Process a single set-cookie header
     *
     * @param setCookieHeader The set-cookie header
     */
    public async processSetCookieHeader(setCookieHeader: unknown): Promise<void> {

        if (typeof setCookieHeader === 'string') {
            const nameValuePart = setCookieHeader.split(';')[0];
            const parts = nameValuePart.split('=');
            const cookieName = parts.shift();
            const cookieValue = parts.join('=');

            if (typeof cookieName === 'string' && cookieName !== '') {
                this.store[decodeURIComponent(cookieName)] = decodeURIComponent(cookieValue);
            }
        }

    }

    /**
     * We ignore the URL parameter because TikTok's cookies are not scoped by path or domain - any cookie we set should be sent with every request to TikTok regardless of URL
     *
     * @param __url Ignored
     */
    async getCookieString(__url: string = ''): Promise<string> {
        return WebcastCookieJar.serializeCookieObject(this.store);
    }

    /**
     * Set cookie string - we ignore the URL parameter for the same reason as in getCookieString
     * @param rawCookie The raw cookie string from the set-cookie header
     * @param __url The URL the cookie is associated with (ignored)
     */
    async setCookie(rawCookie: string, __url: string = ''): Promise<void> {
        if (!rawCookie) return;
        await this.processSetCookieHeader(rawCookie);
    }

    /**
     * Serialize a cookie object into a cookie header string. For example, { sessionid: 'abc', tt-target-idc: 'def' } becomes 'sessionid=abc; tt-target-idc=def'
     *
     * @param cookies The cookie object to serialize
     */
    private static serializeCookieObject(cookies: Record<string, string>): string {
        return Object.entries(cookies)
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join('; ');
    }


    /**
     * Serialize a CookieSessionBundle into a Record of cookie name to cookie value, based on the provided web config. This is used to set the initial cookies in the cookie jar when creating a new session.
     *
     * @param config The web config containing the cookie names to use for the session ID and tt-target-idc
     * @param session The session bundle containing the session ID and tt-target-idc to serialize
     *
     */
    public static serializeCookieSessionBundle(config: WebcastWebConfigDefaults, session: CookieSessionBundle): string {
        const cookies: Record<string, string> = {};

        // Set session ID cookies
        config.SESSION_COOKIE_NAMES.forEach((cookieName) => {
            cookies[cookieName] = session.value.sessionId;
        });

        // Set tt-target-idc cookie
        cookies[config.TARGET_IDC_COOKIE_NAME] = session.value.ttTargetIdc;

        // Serialize into a cookie header string
        return WebcastCookieJar.serializeCookieObject(cookies);
    }

    /**
     * Parse a cookie header string into a Record of cookie name to cookie value. For example, 'sessionid=abc; tt-target-idc=def' becomes { sessionid: 'abc', tt-target-idc: 'def' }
     *
     * @param str
     */
    private static parseCookies(str: string): Record<string, string> {
        const cookies: Record<string, string> = {};
        if (!str) return cookies;

        str.split('; ').forEach((v) => {
            if (!v) return;
            const parts = String(v).split('=');
            const cookieName = decodeURIComponent(parts.shift() || '');
            cookies[cookieName] = parts.join('=');
        });

        return cookies;
    }


}





