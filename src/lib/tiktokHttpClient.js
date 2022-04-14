const axios = require('axios');
const TikTokCookieJar = require('./tiktokCookieJar');
const { deserializeMessage } = require('./webcastProtobuf.js');

const Config = require('./webcastConfig.js');

class TikTokHttpClient {
    constructor(customHeaders, axiosOptions) {
        this.axiosInstance = axios.create({
            timeout: 10000,
            headers: {
                ...Config.DEFAULT_REQUEST_HEADERS,
                ...customHeaders,
            },
            ...(axiosOptions || {}),
        });

        this.cookieJar = new TikTokCookieJar(this.axiosInstance);
    }

    #get(url, params, responseType) {
        return this.axiosInstance.get(url, { params, responseType });
    }

    #post(url, params, data, responseType) {
        return this.axiosInstance.post(url, data, { params, responseType });
    }

    async getMainPage(path) {
        let response = await this.#get(`${Config.TIKTOK_URL_WEB}${path}`);
        return response.data;
    }

    async getDeserializedObjectFromWebcastApi(path, params, schemaName) {
        let response = await this.#get(`${Config.TIKTOK_URL_WEBCAST}${path}`, params, 'arraybuffer');
        return deserializeMessage(schemaName, response.data);
    }

    async getJsonObjectFromWebcastApi(path, params) {
        let response = await this.#get(`${Config.TIKTOK_URL_WEBCAST}${path}`, params, 'json');
        return response.data;
    }

    async postFormDataToWebcastApi(path, params, formData) {
        let response = await this.#post(`${Config.TIKTOK_URL_WEBCAST}${path}`, params, formData, 'json');
        return response.data;
    }
}

module.exports = TikTokHttpClient;
