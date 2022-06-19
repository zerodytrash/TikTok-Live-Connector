"use strict";

function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

const axios = require('axios');

const TikTokCookieJar = require('./tiktokCookieJar');

const {
  deserializeMessage
} = require('./webcastProtobuf.js');

const Config = require('./webcastConfig.js');

var _get = /*#__PURE__*/new WeakSet();

var _post = /*#__PURE__*/new WeakSet();

class TikTokHttpClient {
  constructor(customHeaders, axiosOptions) {
    _classPrivateMethodInitSpec(this, _post);

    _classPrivateMethodInitSpec(this, _get);

    this.axiosInstance = axios.create({
      timeout: 10000,
      headers: { ...Config.DEFAULT_REQUEST_HEADERS,
        ...customHeaders
      },
      ...(axiosOptions || {})
    });
    this.cookieJar = new TikTokCookieJar(this.axiosInstance);
  }

  async getMainPage(path) {
    let response = await _classPrivateMethodGet(this, _get, _get2).call(this, `${Config.TIKTOK_URL_WEB}${path}`);
    return response.data;
  }

  async getDeserializedObjectFromWebcastApi(path, params, schemaName) {
    let response = await _classPrivateMethodGet(this, _get, _get2).call(this, `${Config.TIKTOK_URL_WEBCAST}${path}`, params, 'arraybuffer');
    return deserializeMessage(schemaName, response.data);
  }

  async getJsonObjectFromWebcastApi(path, params) {
    let response = await _classPrivateMethodGet(this, _get, _get2).call(this, `${Config.TIKTOK_URL_WEBCAST}${path}`, params, 'json');
    return response.data;
  }

  async postFormDataToWebcastApi(path, params, formData) {
    let response = await _classPrivateMethodGet(this, _post, _post2).call(this, `${Config.TIKTOK_URL_WEBCAST}${path}`, params, formData, 'json');
    return response.data;
  }

}

function _get2(url, params, responseType) {
  return this.axiosInstance.get(url, {
    params,
    responseType
  });
}

function _post2(url, params, data, responseType) {
  return this.axiosInstance.post(url, data, {
    params,
    responseType
  });
}

module.exports = TikTokHttpClient;