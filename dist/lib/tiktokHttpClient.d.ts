export = TikTokHttpClient;
declare class TikTokHttpClient {
    constructor(customHeaders: any, axiosOptions: any, signProviderOptions: any, sessionId: any);
    axiosInstance: any;
    cookieJar: TikTokCookieJar;
    signProviderOptions: any;
    setSessionId(sessionId: any): void;
    getMainPage(path: any): Promise<any>;
    getDeserializedObjectFromWebcastApi(path: any, params: any, schemaName: any, shouldSign: any): Promise<any>;
    getJsonObjectFromWebcastApi(path: any, params: any, shouldSign: any): Promise<any>;
    postFormDataToWebcastApi(path: any, params: any, formData: any): Promise<any>;
    getJsonObjectFromTiktokApi(path: any, params: any, shouldSign: any): Promise<any>;
    #private;
}
import TikTokCookieJar = require("./tiktokCookieJar");
//# sourceMappingURL=tiktokHttpClient.d.ts.map