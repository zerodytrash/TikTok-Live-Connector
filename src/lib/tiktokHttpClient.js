const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const { deserializeMessage } = require('./webcastProtobuf.js');

const Config = require('./webcastConfig.js');

class TikTokHttpClient {
    constructor(customHeaders) {
        this.cookieJar = new CookieJar();
        this.axiosInstance = wrapper(
            axios.create({
                timeout: 10000,
                headers: {
                    ...Config.DEFAULT_REQUEST_HEADERS,
                    ...customHeaders,
                },
                jar: this.cookieJar,
            })
        );
    }

    #get(url, params, responseType) {
        return this.axiosInstance.get(url, { params, responseType });
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
}

module.exports = TikTokHttpClient;
