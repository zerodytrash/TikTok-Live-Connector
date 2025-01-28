"use strict";

function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

const Config = require('./webcastConfig.js');

const websocket = require('websocket');

const {
  deserializeWebsocketMessage,
  serializeMessage
} = require('./webcastProtobuf.js');

var _handleEvents = /*#__PURE__*/new WeakSet();

var _handleMessage = /*#__PURE__*/new WeakSet();

var _sendPing = /*#__PURE__*/new WeakSet();

var _sendAck = /*#__PURE__*/new WeakSet();

class WebcastWebsocket extends websocket.client {
  constructor(wsUrl, cookieJar, clientParams, wsParams, customHeaders, websocketOptions) {
    super();

    _classPrivateMethodInitSpec(this, _sendAck);

    _classPrivateMethodInitSpec(this, _sendPing);

    _classPrivateMethodInitSpec(this, _handleMessage);

    _classPrivateMethodInitSpec(this, _handleEvents);

    this.pingInterval = null;
    this.connection = null;
    this.wsParams = { ...clientParams,
      ...wsParams
    };
    this.wsUrlWithParams = `${wsUrl}?${new URLSearchParams(this.wsParams)}`;
    this.wsHeaders = {
      Cookie: cookieJar.getCookieString(),
      ...(customHeaders || {})
    };

    _classPrivateMethodGet(this, _handleEvents, _handleEvents2).call(this);

    this.connect(this.wsUrlWithParams, '', Config.TIKTOK_URL_WEB, this.wsHeaders, websocketOptions);
  }

}

function _handleEvents2() {
  this.on('connect', wsConnection => {
    this.connection = wsConnection;
    this.pingInterval = setInterval(() => _classPrivateMethodGet(this, _sendPing, _sendPing2).call(this), 10000);
    wsConnection.on('message', message => {
      if (message.type === 'binary') {
        _classPrivateMethodGet(this, _handleMessage, _handleMessage2).call(this, message);
      }
    });
    wsConnection.on('close', () => {
      clearInterval(this.pingInterval);
    });
  });
}

async function _handleMessage2(message) {
  try {
    let decodedContainer = await deserializeWebsocketMessage(message.binaryData);

    if (decodedContainer.id > 0) {
      _classPrivateMethodGet(this, _sendAck, _sendAck2).call(this, decodedContainer.id);
    } // Emit 'WebcastResponse' from ws message container if decoding success


    if (typeof decodedContainer.webcastResponse === 'object') {
      this.emit('webcastResponse', decodedContainer.webcastResponse);
    }
  } catch (err) {
    this.emit('messageDecodingFailed', err);
  }
}

function _sendPing2() {
  // Send static connection alive ping
  this.connection.sendBytes(Buffer.from('3A026862', 'hex'));
}

function _sendAck2(id) {
  let ackMsg = serializeMessage('WebcastWebsocketAck', {
    type: 'ack',
    id
  });
  this.connection.sendBytes(ackMsg);
}

module.exports = WebcastWebsocket;