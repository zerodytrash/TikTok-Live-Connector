"use strict";

function _classPrivateMethodInitSpec(obj, privateSet) { _checkPrivateRedeclaration(obj, privateSet); privateSet.add(obj); }

function _classPrivateFieldInitSpec(obj, privateMap, value) { _checkPrivateRedeclaration(obj, privateMap); privateMap.set(obj, value); }

function _checkPrivateRedeclaration(obj, privateCollection) { if (privateCollection.has(obj)) { throw new TypeError("Cannot initialize the same private elements twice on an object"); } }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

function _classPrivateFieldSet(receiver, privateMap, value) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "set"); _classApplyDescriptorSet(receiver, descriptor, value); return value; }

function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }

function _classApplyDescriptorSet(receiver, descriptor, value) { if (descriptor.set) { descriptor.set.call(receiver, value); } else { if (!descriptor.writable) { throw new TypeError("attempted to set read only private field"); } descriptor.value = value; } }

function _classPrivateMethodGet(receiver, privateSet, fn) { if (!privateSet.has(receiver)) { throw new TypeError("attempted to get private field on non-instance"); } return fn; }

const {
  EventEmitter
} = require('events');

const TikTokHttpClient = require('./lib/tiktokHttpClient.js');

const WebcastWebsocket = require('./lib/webcastWebsocket.js');

const {
  getRoomIdFromMainPageHtml,
  validateAndNormalizeUniqueId
} = require('./lib/tiktokUtils.js');

const {
  simplifyObject
} = require('./lib/webcastDataConverter.js');

const {
  deserializeMessage
} = require('./lib/webcastProtobuf.js');

const Config = require('./lib/webcastConfig.js');

const ControlEvents = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
  RAWDATA: 'rawData',
  STREAMEND: 'streamEnd',
  WSCONNECTED: 'websocketConnected'
};
const MessageEvents = {
  CHAT: 'chat',
  MEMBER: 'member',
  GIFT: 'gift',
  ROOMUSER: 'roomUser',
  SOCIAL: 'social',
  LIKE: 'like',
  QUESTIONNEW: 'questionNew',
  LINKMICBATTLE: 'linkMicBattle',
  LINKMICARMIES: 'linkMicArmies',
  LIVEINTRO: 'liveIntro',
  TREASUREBOX: 'treasureBox'
};
/**
 * Wrapper class for TikTok's internal Webcast Push Service
 */

var _options = /*#__PURE__*/new WeakMap();

var _uniqueStreamerId = /*#__PURE__*/new WeakMap();

var _roomId = /*#__PURE__*/new WeakMap();

var _roomInfo = /*#__PURE__*/new WeakMap();

var _clientParams = /*#__PURE__*/new WeakMap();

var _httpClient = /*#__PURE__*/new WeakMap();

var _availableGifts = /*#__PURE__*/new WeakMap();

var _websocket = /*#__PURE__*/new WeakMap();

var _isConnecting = /*#__PURE__*/new WeakMap();

var _isConnected = /*#__PURE__*/new WeakMap();

var _isPollingEnabled = /*#__PURE__*/new WeakMap();

var _isWsUpgradeDone = /*#__PURE__*/new WeakMap();

var _setOptions = /*#__PURE__*/new WeakSet();

var _setUnconnected = /*#__PURE__*/new WeakSet();

var _retrieveRoomId = /*#__PURE__*/new WeakSet();

var _fetchRoomInfo = /*#__PURE__*/new WeakSet();

var _fetchAvailableGifts = /*#__PURE__*/new WeakSet();

var _startFetchRoomPolling = /*#__PURE__*/new WeakSet();

var _fetchRoomData = /*#__PURE__*/new WeakSet();

var _tryUpgradeToWebsocket = /*#__PURE__*/new WeakSet();

var _setupWebsocket = /*#__PURE__*/new WeakSet();

var _processWebcastResponse = /*#__PURE__*/new WeakSet();

var _handleError = /*#__PURE__*/new WeakSet();

class WebcastPushConnection extends EventEmitter {
  // Websocket
  // State

  /**
   * Create a new WebcastPushConnection instance
   * @param {string} uniqueId TikTok username (from URL)
   * @param {object} [options] Connection options
   * @param {boolean} [options[].processInitialData=true] Process the initital data which includes messages of the last minutes
   * @param {boolean} [options[].fetchRoomInfoOnConnect=true] Fetch the room info (room status, streamer info, etc.) on connect (will be returned when calling connect())
   * @param {boolean} [options[].enableExtendedGiftInfo=false] Enable this option to get extended information on 'gift' events like gift name and cost
   * @param {boolean} [options[].enableWebsocketUpgrade=true] Use WebSocket instead of request polling if TikTok offers it
   * @param {number} [options[].requestPollingIntervalMs=1000] Request polling interval if WebSocket is not used
   * @param {string} [options[].sessionId=null] The session ID from the "sessionid" cookie is required if you want to send automated messages in the chat.
   * @param {object} [options[].clientParams={}] Custom client params for Webcast API
   * @param {object} [options[].requestHeaders={}] Custom request headers for axios
   * @param {object} [options[].websocketHeaders={}] Custom request headers for websocket.client
   * @param {object} [options[].requestOptions={}] Custom request options for axios. Here you can specify an `httpsAgent` to use a proxy and a `timeout` value for example.
   * @param {object} [options[].websocketOptions={}] Custom request options for websocket.client. Here you can specify an `agent` to use a proxy and a `timeout` value for example.
   */
  constructor(uniqueId, options) {
    super();

    _classPrivateMethodInitSpec(this, _handleError);

    _classPrivateMethodInitSpec(this, _processWebcastResponse);

    _classPrivateMethodInitSpec(this, _setupWebsocket);

    _classPrivateMethodInitSpec(this, _tryUpgradeToWebsocket);

    _classPrivateMethodInitSpec(this, _fetchRoomData);

    _classPrivateMethodInitSpec(this, _startFetchRoomPolling);

    _classPrivateMethodInitSpec(this, _fetchAvailableGifts);

    _classPrivateMethodInitSpec(this, _fetchRoomInfo);

    _classPrivateMethodInitSpec(this, _retrieveRoomId);

    _classPrivateMethodInitSpec(this, _setUnconnected);

    _classPrivateMethodInitSpec(this, _setOptions);

    _classPrivateFieldInitSpec(this, _options, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _uniqueStreamerId, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _roomId, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _roomInfo, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _clientParams, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _httpClient, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _availableGifts, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _websocket, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _isConnecting, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _isConnected, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _isPollingEnabled, {
      writable: true,
      value: void 0
    });

    _classPrivateFieldInitSpec(this, _isWsUpgradeDone, {
      writable: true,
      value: void 0
    });

    _classPrivateMethodGet(this, _setOptions, _setOptions2).call(this, options || {});

    _classPrivateFieldSet(this, _uniqueStreamerId, validateAndNormalizeUniqueId(uniqueId));

    _classPrivateFieldSet(this, _httpClient, new TikTokHttpClient(_classPrivateFieldGet(this, _options).requestHeaders, _classPrivateFieldGet(this, _options).requestOptions));

    _classPrivateFieldSet(this, _clientParams, { ...Config.DEFAULT_CLIENT_PARAMS,
      ..._classPrivateFieldGet(this, _options).clientParams
    });

    _classPrivateMethodGet(this, _setUnconnected, _setUnconnected2).call(this);
  }

  /**
   * Connects to the current live stream room
   * @returns {Promise} Promise that will be resolved when the connection is established.
   */
  async connect() {
    if (_classPrivateFieldGet(this, _isConnecting)) {
      throw new Error('Already connecting!');
    }

    if (_classPrivateFieldGet(this, _isConnected)) {
      throw new Error('Already connected!');
    }

    _classPrivateFieldSet(this, _isConnecting, true);

    try {
      await _classPrivateMethodGet(this, _retrieveRoomId, _retrieveRoomId2).call(this); // Fetch room info if option enabled

      if (_classPrivateFieldGet(this, _options).fetchRoomInfoOnConnect) {
        await _classPrivateMethodGet(this, _fetchRoomInfo, _fetchRoomInfo2).call(this); // Prevent connections to finished rooms

        if (_classPrivateFieldGet(this, _roomInfo).status === 4) {
          throw new Error('LIVE has ended');
        }
      } // Fetch all available gift info if option enabled


      if (_classPrivateFieldGet(this, _options).enableExtendedGiftInfo) {
        await _classPrivateMethodGet(this, _fetchAvailableGifts, _fetchAvailableGifts2).call(this);
      }

      await _classPrivateMethodGet(this, _fetchRoomData, _fetchRoomData2).call(this, true);

      _classPrivateFieldSet(this, _isConnected, true); // Sometimes no upgrade to websocket is offered by TikTok
      // In that case we use request polling


      if (!_classPrivateFieldGet(this, _isWsUpgradeDone)) {
        _classPrivateMethodGet(this, _startFetchRoomPolling, _startFetchRoomPolling2).call(this);
      }

      let state = this.getState();
      this.emit(ControlEvents.CONNECTED, state);
      return state;
    } catch (err) {
      _classPrivateMethodGet(this, _handleError, _handleError2).call(this, err, 'Error while connecting');

      throw err;
    } finally {
      _classPrivateFieldSet(this, _isConnecting, false);
    }
  }
  /**
   * Disconnects the connection to the live stream
   */


  disconnect() {
    if (_classPrivateFieldGet(this, _isConnected)) {
      if (_classPrivateFieldGet(this, _isWsUpgradeDone) && _classPrivateFieldGet(this, _websocket).connection.connected) {
        _classPrivateFieldGet(this, _websocket).connection.close();
      } // Reset state


      _classPrivateMethodGet(this, _setUnconnected, _setUnconnected2).call(this);

      this.emit(ControlEvents.DISCONNECTED);
    }
  }
  /**
   * Get the current connection state including the cached room info and all available gifts (if `enableExtendedGiftInfo` option enabled)
   * @returns {object} current state object
   */


  getState() {
    return {
      isConnected: _classPrivateFieldGet(this, _isConnected),
      upgradedToWebsocket: _classPrivateFieldGet(this, _isWsUpgradeDone),
      roomId: _classPrivateFieldGet(this, _roomId),
      roomInfo: _classPrivateFieldGet(this, _roomInfo),
      availableGifts: _classPrivateFieldGet(this, _availableGifts)
    };
  }
  /**
   * Get the current room info (including streamer info, room status and statistics)
   * @returns {Promise} Promise that will be resolved when the room info has been retrieved from the API
   */


  async getRoomInfo() {
    // Retrieve current room_id if not connected
    if (!_classPrivateFieldGet(this, _isConnected)) {
      await _classPrivateMethodGet(this, _retrieveRoomId, _retrieveRoomId2).call(this);
    }

    await _classPrivateMethodGet(this, _fetchRoomInfo, _fetchRoomInfo2).call(this);
    return _classPrivateFieldGet(this, _roomInfo);
  }
  /**
   * Get a list of all available gifts including gift name, image url, diamont cost and a lot of other information
   * @returns {Promise} Promise that will be resolved when all available gifts has been retrieved from the API
   */


  async getAvailableGifts() {
    await _classPrivateMethodGet(this, _fetchAvailableGifts, _fetchAvailableGifts2).call(this);
    return _classPrivateFieldGet(this, _availableGifts);
  }
  /**
   * Sends a chat message into the current live room using the provided session cookie
   * @param {string} text Message Content
   * @param {string} [sessionId] The "sessionid" cookie value from your TikTok Website if not provided via the constructor options
   * @returns {Promise} Promise that will be resolved when the chat message has been submitted to the API
   */


  async sendMessage(text, sessionId) {
    var _response$data;

    if (sessionId) {
      // Update sessionId
      _classPrivateFieldGet(this, _options).sessionId = sessionId;
    }

    if (!_classPrivateFieldGet(this, _options).sessionId) {
      throw new Error('Missing SessionId. Please provide your current SessionId to use this feature.');
    }

    try {
      // Retrieve current room_id if not connected
      if (!_classPrivateFieldGet(this, _isConnected)) {
        await _classPrivateMethodGet(this, _retrieveRoomId, _retrieveRoomId2).call(this);
      } // Add the session cookie to the CookieJar


      _classPrivateFieldGet(this, _httpClient).cookieJar.setCookie('sessionid', _classPrivateFieldGet(this, _options).sessionId); // Submit the chat request


      let requestParams = { ..._classPrivateFieldGet(this, _clientParams),
        content: text
      };
      let response = await _classPrivateFieldGet(this, _httpClient).postFormDataToWebcastApi('room/chat/', requestParams, null); // Success?

      if ((response === null || response === void 0 ? void 0 : response.status_code) === 0) {
        return response.data;
      } // Handle errors


      switch (response === null || response === void 0 ? void 0 : response.status_code) {
        case 20003:
          throw new Error('Your SessionId has expired. Please provide a new one.');

        default:
          throw new Error(`TikTok responded with status code ${response === null || response === void 0 ? void 0 : response.status_code}: ${response === null || response === void 0 ? void 0 : (_response$data = response.data) === null || _response$data === void 0 ? void 0 : _response$data.message}`);
      }
    } catch (err) {
      throw new Error(`Failed to send chat message. ${err.message}`);
    }
  }
  /**
   * Decodes and processes a binary webcast data package that you have received via the `rawData` event (for debugging purposes only)
   * @param {string} messageType
   * @param {Buffer} messageBuffer
   */


  decodeProtobufMessage(messageType, messageBuffer) {
    let webcastMessage = deserializeMessage(messageType, messageBuffer);

    _classPrivateMethodGet(this, _processWebcastResponse, _processWebcastResponse2).call(this, {
      messages: [{
        decodedData: webcastMessage,
        type: messageType
      }]
    });
  }

}

function _setOptions2(providedOptions) {
  _classPrivateFieldSet(this, _options, Object.assign({
    // Default
    processInitialData: true,
    fetchRoomInfoOnConnect: true,
    enableExtendedGiftInfo: false,
    enableWebsocketUpgrade: true,
    requestPollingIntervalMs: 1000,
    sessionId: null,
    clientParams: {},
    requestHeaders: {},
    websocketHeaders: {},
    requestOptions: {},
    websocketOptions: {}
  }, providedOptions));
}

function _setUnconnected2() {
  _classPrivateFieldSet(this, _roomInfo, null);

  _classPrivateFieldSet(this, _isConnecting, false);

  _classPrivateFieldSet(this, _isConnected, false);

  _classPrivateFieldSet(this, _isPollingEnabled, false);

  _classPrivateFieldSet(this, _isWsUpgradeDone, false);

  _classPrivateFieldGet(this, _clientParams).cursor = '';
}

async function _retrieveRoomId2() {
  try {
    let mainPageHtml = await _classPrivateFieldGet(this, _httpClient).getMainPage(`@${_classPrivateFieldGet(this, _uniqueStreamerId)}/live`);
    let roomId = getRoomIdFromMainPageHtml(mainPageHtml);

    _classPrivateFieldSet(this, _roomId, roomId);

    _classPrivateFieldGet(this, _clientParams).room_id = roomId;
  } catch (err) {
    throw new Error(`Failed to retrieve room_id from page source. ${err.message}`);
  }
}

async function _fetchRoomInfo2() {
  try {
    let response = await _classPrivateFieldGet(this, _httpClient).getJsonObjectFromWebcastApi('room/info/', _classPrivateFieldGet(this, _clientParams));

    _classPrivateFieldSet(this, _roomInfo, response.data);
  } catch (err) {
    throw new Error(`Failed to fetch room info. ${err.message}`);
  }
}

async function _fetchAvailableGifts2() {
  try {
    let response = await _classPrivateFieldGet(this, _httpClient).getJsonObjectFromWebcastApi('gift/list/', _classPrivateFieldGet(this, _clientParams));

    _classPrivateFieldSet(this, _availableGifts, response.data.gifts);
  } catch (err) {
    throw new Error(`Failed to fetch available gifts. ${err.message}`);
  }
}

async function _startFetchRoomPolling2() {
  _classPrivateFieldSet(this, _isPollingEnabled, true);

  let sleepMs = ms => new Promise(resolve => setTimeout(resolve, ms));

  while (_classPrivateFieldGet(this, _isPollingEnabled)) {
    try {
      await _classPrivateMethodGet(this, _fetchRoomData, _fetchRoomData2).call(this);
    } catch (err) {
      _classPrivateMethodGet(this, _handleError, _handleError2).call(this, err, 'Error while fetching webcast data via request polling');
    }

    await sleepMs(_classPrivateFieldGet(this, _options).requestPollingIntervalMs);
  }
}

async function _fetchRoomData2(isInitial) {
  let webcastResponse = await _classPrivateFieldGet(this, _httpClient).getDeserializedObjectFromWebcastApi('im/fetch/', _classPrivateFieldGet(this, _clientParams), 'WebcastResponse');
  let upgradeToWsOffered = !!webcastResponse.wsUrl && !!webcastResponse.wsParam; // Set cursor param to continue with the next request

  if (webcastResponse.cursor) {
    _classPrivateFieldGet(this, _clientParams).cursor = webcastResponse.cursor;
  } // Upgrade to Websocket offered? => Try upgrade


  if (!_classPrivateFieldGet(this, _isWsUpgradeDone) && _classPrivateFieldGet(this, _options).enableWebsocketUpgrade && upgradeToWsOffered) {
    await _classPrivateMethodGet(this, _tryUpgradeToWebsocket, _tryUpgradeToWebsocket2).call(this, webcastResponse);
  } // Skip processing initial data if option disabled


  if (isInitial && !_classPrivateFieldGet(this, _options).processInitialData) {
    return;
  }

  _classPrivateMethodGet(this, _processWebcastResponse, _processWebcastResponse2).call(this, webcastResponse);
}

async function _tryUpgradeToWebsocket2(webcastResponse) {
  try {
    // Websocket specific params
    let wsParams = {
      imprp: webcastResponse.wsParam.value
    }; // Wait until ws connected, then stop request polling

    await _classPrivateMethodGet(this, _setupWebsocket, _setupWebsocket2).call(this, webcastResponse.wsUrl, wsParams);

    _classPrivateFieldSet(this, _isWsUpgradeDone, true);

    _classPrivateFieldSet(this, _isPollingEnabled, false);

    this.emit(ControlEvents.WSCONNECTED, _classPrivateFieldGet(this, _websocket));
  } catch (err) {
    _classPrivateMethodGet(this, _handleError, _handleError2).call(this, err, 'Upgrade to websocket failed. Using request polling...');
  }
}

async function _setupWebsocket2(wsUrl, wsParams) {
  return new Promise((resolve, reject) => {
    _classPrivateFieldSet(this, _websocket, new WebcastWebsocket(wsUrl, _classPrivateFieldGet(this, _httpClient).cookieJar, _classPrivateFieldGet(this, _clientParams), wsParams, _classPrivateFieldGet(this, _options).websocketHeaders, _classPrivateFieldGet(this, _options).websocketOptions));

    _classPrivateFieldGet(this, _websocket).on('connect', wsConnection => {
      resolve();
      wsConnection.on('error', err => _classPrivateMethodGet(this, _handleError, _handleError2).call(this, err, 'Websocket Error'));
      wsConnection.on('close', () => {
        this.disconnect();
      });
    });

    _classPrivateFieldGet(this, _websocket).on('connectFailed', err => reject(`Websocket connection failed, ${err}`));

    _classPrivateFieldGet(this, _websocket).on('webcastResponse', msg => _classPrivateMethodGet(this, _processWebcastResponse, _processWebcastResponse2).call(this, msg));

    _classPrivateFieldGet(this, _websocket).on('messageDecodingFailed', err => _classPrivateMethodGet(this, _handleError, _handleError2).call(this, err, 'Websocket message decoding failed'));
  });
}

function _processWebcastResponse2(webcastResponse) {
  // Emit raw (protobuf encoded) data for a use case specific processing
  webcastResponse.messages.forEach(message => {
    this.emit(ControlEvents.RAWDATA, message.type, message.binary);
  }); // Process and emit decoded data depending on the the message type

  webcastResponse.messages.filter(x => x.decodedData).forEach(message => {
    let simplifiedObj = simplifyObject(message.decodedData);

    switch (message.type) {
      case 'WebcastControlMessage':
        if (message.decodedData.action === 3) {
          this.emit(ControlEvents.STREAMEND);
          this.disconnect();
        }

        break;

      case 'WebcastRoomUserSeqMessage':
        this.emit(MessageEvents.ROOMUSER, simplifiedObj);
        break;

      case 'WebcastChatMessage':
        this.emit(MessageEvents.CHAT, simplifiedObj);
        break;

      case 'WebcastMemberMessage':
        this.emit(MessageEvents.MEMBER, simplifiedObj);
        break;

      case 'WebcastGiftMessage':
        // Add extended gift info if option enabled
        if (Array.isArray(_classPrivateFieldGet(this, _availableGifts)) && simplifiedObj.giftId) {
          simplifiedObj.extendedGiftInfo = _classPrivateFieldGet(this, _availableGifts).find(x => x.id === simplifiedObj.giftId);
        }

        this.emit(MessageEvents.GIFT, simplifiedObj);
        break;

      case 'WebcastSocialMessage':
        this.emit(MessageEvents.SOCIAL, simplifiedObj);
        break;

      case 'WebcastLikeMessage':
        this.emit(MessageEvents.LIKE, simplifiedObj);
        break;

      case 'WebcastQuestionNewMessage':
        this.emit(MessageEvents.QUESTIONNEW, simplifiedObj);
        break;

      case 'WebcastLinkMicBattle':
        this.emit(MessageEvents.LINKMICBATTLE, simplifiedObj);
        break;

      case 'WebcastLinkMicArmies':
        this.emit(MessageEvents.LINKMICARMIES, simplifiedObj);
        break;

      case 'WebcastLiveIntroMessage':
        this.emit(MessageEvents.LIVEINTRO, simplifiedObj);
        break;

      case 'WebcastEnvelopeMessage':
        if (simplifiedObj.userId) this.emit(MessageEvents.TREASUREBOX, simplifiedObj);
        break;
    }
  });
}

function _handleError2(exception, info) {
  if (this.listenerCount(ControlEvents.ERROR) > 0) {
    this.emit(ControlEvents.ERROR, {
      info,
      exception
    });
  }
}

module.exports = {
  WebcastPushConnection
};