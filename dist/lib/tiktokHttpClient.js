"use strict";

function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

const axios = require('axios');

const TikTokCookieJar = require('./tiktokCookieJar');

const {
  deserializeMessage
} = require('./webcastProtobuf.js');

const {
  signWebcastRequest
} = require('./tiktokSignatureProvider');

const Config = require('./webcastConfig.js');

var _get = /*#__PURE__*/new WeakSet();

var _post = /*#__PURE__*/new WeakSet();

var _buildUrl = /*#__PURE__*/new WeakSet();

class TikTokHttpClient {
  constructor(customHeaders, axiosOptions, signProviderOptions, sessionId) {
    _classPrivateMethodInitSpec(this, _buildUrl);

    _classPrivateMethodInitSpec(this, _post);

    _classPrivateMethodInitSpec(this, _get);

    const {
      Cookie
    } = customHeaders || {};

    if (Cookie) {
      delete customHeaders['Cookie'];
    }

    this.axiosInstance = axios.create({
      timeout: 10000,
      headers: { ...Config.DEFAULT_REQUEST_HEADERS,
        ...customHeaders
      },
      ...(axiosOptions || {})
    });
    this.cookieJar = new TikTokCookieJar(this.axiosInstance);

    if (Cookie) {
      Cookie.split('; ').forEach(v => this.cookieJar.processSetCookieHeader(v));
    }

    this.signProviderOptions = signProviderOptions;

    if (sessionId) {
      this.setSessionId(sessionId);
    }
  }

  setSessionId(sessionId) {
    this.cookieJar.setCookie('sessionid', sessionId);
    this.cookieJar.setCookie('sessionid_ss', sessionId);
    this.cookieJar.setCookie('sid_tt', sessionId);
  }

  async getMainPage(path) {
    let response = await _classPrivateMethodGet(this, _get, _get2).call(this, `${Config.TIKTOK_URL_WEB}${path}`);
    return response.data;
  }

  async getDeserializedObjectFromWebcastApi(path, params, schemaName, shouldSign) {
    let url = await _classPrivateMethodGet(this, _buildUrl, _buildUrl2).call(this, Config.TIKTOK_URL_WEBCAST, path, params, shouldSign);
    let response = await _classPrivateMethodGet(this, _get, _get2).call(this, url, 'arraybuffer');
    return deserializeMessage(schemaName, response.data);
  }

  async getJsonObjectFromWebcastApi(path, params, shouldSign) {
    let url = await _classPrivateMethodGet(this, _buildUrl, _buildUrl2).call(this, Config.TIKTOK_URL_WEBCAST, path, params, shouldSign);
    let response = await _classPrivateMethodGet(this, _get, _get2).call(this, url, 'json');
    return response.data;
  }

  async postFormDataToWebcastApi(path, params, formData) {
    let response = await _classPrivateMethodGet(this, _post, _post2).call(this, `${Config.TIKTOK_URL_WEBCAST}${path}`, params, formData, 'json');
    return response.data;
  }

  async getJsonObjectFromTiktokApi(path, params, shouldSign) {
    let url = await _classPrivateMethodGet(this, _buildUrl, _buildUrl2).call(this, Config.TIKTOK_URL_WEB, path, params, shouldSign);
    let response = await _classPrivateMethodGet(this, _get, _get2).call(this, url, 'json');
    return response.data;
  }

}

function _get2(url, responseType) {
  return this.axiosInstance.get(url, {
    responseType
  });
}

function _post2(url, params, data, responseType) {
  return this.axiosInstance.post(url, data, {
    params,
    responseType
  });
}

async function _buildUrl2(host, path, params, sign) {
  let fullUrl = `${host}${path}?${new URLSearchParams(params || {})}`;

  if (sign) {
    fullUrl = await signWebcastRequest(fullUrl, this.axiosInstance.defaults.headers, this.cookieJar, this.signProviderOptions);
  }

  return fullUrl;
}

module.exports = TikTokHttpClient;