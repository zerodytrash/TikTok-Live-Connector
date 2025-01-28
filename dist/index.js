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
} = require('node:events');

const TikTokHttpClient = require('./lib/tiktokHttpClient.js');

const WebcastWebsocket = require('./lib/webcastWebsocket.js');

const {
  getRoomIdFromMainPageHtml,
  validateAndNormalizeUniqueId,
  addUniqueId,
  removeUniqueId
} = require('./lib/tiktokUtils.js');

const {
  simplifyObject
} = require('./lib/webcastDataConverter.js');

const {
  deserializeMessage,
  deserializeWebsocketMessage
} = require('./lib/webcastProtobuf.js');

const Config = require('./lib/webcastConfig.js');

const {
  AlreadyConnectingError,
  AlreadyConnectedError,
  UserOfflineError,
  NoWSUpgradeError,
  InvalidSessionIdError,
  InvalidResponseError,
  ExtractRoomIdError,
  InitialFetchError
} = require('./lib/tiktokErrors');

const ControlEvents = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
  RAWDATA: 'rawData',
  DECODEDDATA: 'decodedData',
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
  EMOTE: 'emote',
  ENVELOPE: 'envelope',
  SUBSCRIBE: 'subscribe'
};
const CustomEvents = {
  FOLLOW: 'follow',
  SHARE: 'share'
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
   * @param {boolean} [options[].enableRequestPolling=true] Use request polling if no WebSocket upgrade is offered. If `false` an exception will be thrown if TikTok does not offer a WebSocket upgrade.
   * @param {number} [options[].requestPollingIntervalMs=1000] Request polling interval if WebSocket is not used
   * @param {string} [options[].sessionId=null] The session ID from the "sessionid" cookie is required if you want to send automated messages in the chat.
   * @param {object} [options[].clientParams={}] Custom client params for Webcast API
   * @param {object} [options[].requestHeaders={}] Custom request headers for axios
   * @param {object} [options[].websocketHeaders={}] Custom request headers for websocket.client
   * @param {object} [options[].requestOptions={}] Custom request options for axios. Here you can specify an `httpsAgent` to use a proxy and a `timeout` value for example.
   * @param {object} [options[].websocketOptions={}] Custom request options for websocket.client. Here you can specify an `agent` to use a proxy and a `timeout` value for example.
   * @param {object} [options[].signProviderOptions={}] Custom request options for the TikTok signing server. Here you can specify a `host`, `params`, and `headers`.
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

    _classPrivateFieldSet(this, _httpClient, new TikTokHttpClient(_classPrivateFieldGet(this, _options).requestHeaders, _classPrivateFieldGet(this, _options).requestOptions, _classPrivateFieldGet(this, _options).signProviderOptions, _classPrivateFieldGet(this, _options).sessionId));

    _classPrivateFieldSet(this, _clientParams, { ...Config.DEFAULT_CLIENT_PARAMS,
      ..._classPrivateFieldGet(this, _options).clientParams
    });

    _classPrivateMethodGet(this, _setUnconnected, _setUnconnected2).call(this);
  }

  /**
   * Connects to the current live stream room
   * @param {string} [roomId] If you want to connect to a specific roomId. Otherwise the current roomId will be retrieved.
   * @returns {Promise} Promise that will be resolved when the connection is established.
   */
  async connect(roomId = null) {
    if (_classPrivateFieldGet(this, _isConnecting)) {
      throw new AlreadyConnectingError('Already connecting!');
    }

    if (_classPrivateFieldGet(this, _isConnected)) {
      throw new AlreadyConnectedError('Already connected!');
    }

    _classPrivateFieldSet(this, _isConnecting, true); // add streamerId to uu


    addUniqueId(_classPrivateFieldGet(this, _uniqueStreamerId));

    try {
      // roomId already specified?
      if (roomId) {
        _classPrivateFieldSet(this, _roomId, roomId);

        _classPrivateFieldGet(this, _clientParams).room_id = roomId;
      } else {
        await _classPrivateMethodGet(this, _retrieveRoomId, _retrieveRoomId2).call(this);
      } // Fetch room info if option enabled


      if (_classPrivateFieldGet(this, _options).fetchRoomInfoOnConnect) {
        await _classPrivateMethodGet(this, _fetchRoomInfo, _fetchRoomInfo2).call(this); // Prevent connections to finished rooms

        if (_classPrivateFieldGet(this, _roomInfo).status === 4) {
          throw new UserOfflineError('LIVE has ended');
        }
      } // Fetch all available gift info if option enabled


      if (_classPrivateFieldGet(this, _options).enableExtendedGiftInfo) {
        await _classPrivateMethodGet(this, _fetchAvailableGifts, _fetchAvailableGifts2).call(this);
      }

      try {
        await _classPrivateMethodGet(this, _fetchRoomData, _fetchRoomData2).call(this, true);
      } catch (ex) {
        var _jsonError;

        let jsonError;
        let retryAfter;

        try {
          var _ex$response$headers;

          jsonError = JSON.parse(ex.response.data.toString());
          retryAfter = (_ex$response$headers = ex.response.headers) !== null && _ex$response$headers !== void 0 && _ex$response$headers['retry-after'] ? parseInt(ex.response.headers['retry-after']) : null;
        } catch (parseErr) {
          throw ex;
        }

        if (!jsonError) throw ex;
        const errorMessage = ((_jsonError = jsonError) === null || _jsonError === void 0 ? void 0 : _jsonError.error) || 'Failed to retrieve the initial room data.';
        throw new InitialFetchError(errorMessage, retryAfter);
      } // Sometimes no upgrade to WebSocket is offered by TikTok
      // In that case we use request polling (if enabled and possible)


      if (!_classPrivateFieldGet(this, _isWsUpgradeDone)) {
        if (!_classPrivateFieldGet(this, _options).enableRequestPolling) {
          throw new NoWSUpgradeError('TikTok does not offer a websocket upgrade and request polling is disabled (`enableRequestPolling` option).');
        }

        if (!_classPrivateFieldGet(this, _options).sessionId) {
          // We cannot use request polling if the user has no sessionid defined.
          // The reason for this is that TikTok needs a valid signature if the user is not logged in.
          // Signing a request every second would generate too much traffic to the signing server.
          // If a sessionid is present a signature is not required.
          throw new NoWSUpgradeError('TikTok does not offer a websocket upgrade. Please provide a valid `sessionId` to use request polling instead.');
        }

        _classPrivateMethodGet(this, _startFetchRoomPolling, _startFetchRoomPolling2).call(this);
      }

      _classPrivateFieldSet(this, _isConnected, true);

      let state = this.getState();
      this.emit(ControlEvents.CONNECTED, state);
      return state;
    } catch (err) {
      _classPrivateMethodGet(this, _handleError, _handleError2).call(this, err, 'Error while connecting'); // remove streamerId from uu on connect fail


      removeUniqueId(_classPrivateFieldGet(this, _uniqueStreamerId));
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


      _classPrivateMethodGet(this, _setUnconnected, _setUnconnected2).call(this); // remove streamerId from uu


      removeUniqueId(_classPrivateFieldGet(this, _uniqueStreamerId));
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
      throw new InvalidSessionIdError('Missing SessionId. Please provide your current SessionId to use this feature.');
    }

    try {
      // Retrieve current room_id if not connected
      if (!_classPrivateFieldGet(this, _isConnected)) {
        await _classPrivateMethodGet(this, _retrieveRoomId, _retrieveRoomId2).call(this);
      } // Add the session cookie to the CookieJar


      _classPrivateFieldGet(this, _httpClient).setSessionId(_classPrivateFieldGet(this, _options).sessionId); // Submit the chat request


      let requestParams = { ..._classPrivateFieldGet(this, _clientParams),
        content: text
      };
      let response = await _classPrivateFieldGet(this, _httpClient).postFormDataToWebcastApi('room/chat/', requestParams, null); // Success?

      if ((response === null || response === void 0 ? void 0 : response.status_code) === 0) {
        return response.data;
      } // Handle errors


      switch (response === null || response === void 0 ? void 0 : response.status_code) {
        case 20003:
          throw new InvalidSessionIdError('Your SessionId has expired. Please provide a new one.');

        default:
          throw new InvalidResponseError(`TikTok responded with status code ${response === null || response === void 0 ? void 0 : response.status_code}: ${response === null || response === void 0 ? void 0 : (_response$data = response.data) === null || _response$data === void 0 ? void 0 : _response$data.message}`, response);
      }
    } catch (err) {
      throw new InvalidResponseError(`Failed to send chat message. ${err.message}`, err);
    }
  }
  /**
   * Decodes and processes a binary webcast data package that you have received via the `rawData` event (for debugging purposes only)
   * @param {string} messageType
   * @param {Buffer} messageBuffer
   */


  async decodeProtobufMessage(messageType, messageBuffer) {
    switch (messageType) {
      case 'WebcastResponse':
        {
          let decodedWebcastResponse = deserializeMessage(messageType, messageBuffer);

          _classPrivateMethodGet(this, _processWebcastResponse, _processWebcastResponse2).call(this, decodedWebcastResponse);

          break;
        }

      case 'WebcastWebsocketMessage':
        {
          let decodedWebcastWebsocketMessage = await deserializeWebsocketMessage(messageBuffer);

          if (typeof decodedWebcastWebsocketMessage.webcastResponse === 'object') {
            _classPrivateMethodGet(this, _processWebcastResponse, _processWebcastResponse2).call(this, decodedWebcastWebsocketMessage.webcastResponse);
          }

          break;
        }

      default:
        {
          let webcastMessage = deserializeMessage(messageType, messageBuffer);

          _classPrivateMethodGet(this, _processWebcastResponse, _processWebcastResponse2).call(this, {
            messages: [{
              decodedData: webcastMessage,
              type: messageType
            }]
          });
        }
    }
  }

}

function _setOptions2(providedOptions) {
  _classPrivateFieldSet(this, _options, Object.assign({
    // Default
    processInitialData: true,
    fetchRoomInfoOnConnect: true,
    enableExtendedGiftInfo: false,
    enableWebsocketUpgrade: true,
    enableRequestPolling: true,
    requestPollingIntervalMs: 1000,
    sessionId: null,
    clientParams: {},
    requestHeaders: {},
    websocketHeaders: Config.DEFAULT_REQUEST_HEADERS,
    requestOptions: {},
    websocketOptions: {},
    signProviderOptions: {}
  }, providedOptions));
}

function _setUnconnected2() {
  _classPrivateFieldSet(this, _roomInfo, null);

  _classPrivateFieldSet(this, _isConnecting, false);

  _classPrivateFieldSet(this, _isConnected, false);

  _classPrivateFieldSet(this, _isPollingEnabled, false);

  _classPrivateFieldSet(this, _isWsUpgradeDone, false);

  _classPrivateFieldGet(this, _clientParams).cursor = '';
  _classPrivateFieldGet(this, _clientParams).internal_ext = '';
}

async function _retrieveRoomId2() {
  try {
    let mainPageHtml = await _classPrivateFieldGet(this, _httpClient).getMainPage(`@${_classPrivateFieldGet(this, _uniqueStreamerId)}/live`);

    try {
      let roomId = getRoomIdFromMainPageHtml(mainPageHtml);

      _classPrivateFieldSet(this, _roomId, roomId);

      _classPrivateFieldGet(this, _clientParams).room_id = roomId;
    } catch (err) {
      // Use fallback method
      let roomData = await _classPrivateFieldGet(this, _httpClient).getJsonObjectFromTiktokApi('api-live/user/room/', { ..._classPrivateFieldGet(this, _clientParams),
        uniqueId: _classPrivateFieldGet(this, _uniqueStreamerId),
        sourceType: 54
      });
      if (roomData.statusCode) throw new InvalidResponseError(`API Error ${roomData.statusCode} (${roomData.message || 'Unknown Error'})`, undefined);

      _classPrivateFieldSet(this, _roomId, roomData.data.user.roomId);

      _classPrivateFieldGet(this, _clientParams).room_id = roomData.data.user.roomId;
    }
  } catch (err) {
    throw new ExtractRoomIdError(`Failed to retrieve room_id from page source. ${err.message}`);
  }
}

async function _fetchRoomInfo2() {
  try {
    let response = await _classPrivateFieldGet(this, _httpClient).getJsonObjectFromWebcastApi('room/info/', _classPrivateFieldGet(this, _clientParams));

    _classPrivateFieldSet(this, _roomInfo, response.data);
  } catch (err) {
    throw new InvalidResponseError(`Failed to fetch room info. ${err.message}`, err);
  }
}

async function _fetchAvailableGifts2() {
  try {
    let response = await _classPrivateFieldGet(this, _httpClient).getJsonObjectFromWebcastApi('gift/list/', _classPrivateFieldGet(this, _clientParams));

    _classPrivateFieldSet(this, _availableGifts, response.data.gifts);
  } catch (err) {
    throw new InvalidResponseError(`Failed to fetch available gifts. ${err.message}`, err);
  }
}

async function _startFetchRoomPolling2() {
  _classPrivateFieldSet(this, _isPollingEnabled, true);

  let sleepMs = ms => new Promise(resolve => setTimeout(resolve, ms));

  while (_classPrivateFieldGet(this, _isPollingEnabled)) {
    try {
      await _classPrivateMethodGet(this, _fetchRoomData, _fetchRoomData2).call(this, false);
    } catch (err) {
      _classPrivateMethodGet(this, _handleError, _handleError2).call(this, err, 'Error while fetching webcast data via request polling');
    }

    await sleepMs(_classPrivateFieldGet(this, _options).requestPollingIntervalMs);
  }
}

async function _fetchRoomData2(isInitial) {
  let webcastResponse = await _classPrivateFieldGet(this, _httpClient).getDeserializedObjectFromWebcastApi('im/fetch/', _classPrivateFieldGet(this, _clientParams), 'WebcastResponse', isInitial);
  let upgradeToWsOffered = !!webcastResponse.wsUrl;

  if (!webcastResponse.cursor) {
    if (isInitial) {
      throw new InvalidResponseError('Missing cursor in initial fetch response.');
    } else {
      _classPrivateMethodGet(this, _handleError, _handleError2).call(this, null, 'Missing cursor in fetch response.');
    }
  } // Set cursor and internal_ext param to continue with the next request


  if (webcastResponse.cursor) _classPrivateFieldGet(this, _clientParams).cursor = webcastResponse.cursor;
  if (webcastResponse.internalExt) _classPrivateFieldGet(this, _clientParams).internal_ext = webcastResponse.internalExt;

  if (isInitial) {
    // Upgrade to Websocket offered? => Try upgrade
    if (_classPrivateFieldGet(this, _options).enableWebsocketUpgrade && upgradeToWsOffered) {
      await _classPrivateMethodGet(this, _tryUpgradeToWebsocket, _tryUpgradeToWebsocket2).call(this, webcastResponse);
    }
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
      compress: 'gzip'
    };

    for (let wsParam of webcastResponse.wsParams) {
      wsParams[wsParam.name] = wsParam.value;
    } // Wait until ws connected, then stop request polling


    await _classPrivateMethodGet(this, _setupWebsocket, _setupWebsocket2).call(this, webcastResponse.wsUrl, wsParams);

    _classPrivateFieldSet(this, _isWsUpgradeDone, true);

    _classPrivateFieldSet(this, _isPollingEnabled, false);

    this.emit(ControlEvents.WSCONNECTED, _classPrivateFieldGet(this, _websocket));
  } catch (err) {
    _classPrivateMethodGet(this, _handleError, _handleError2).call(this, err, 'Upgrade to websocket failed');
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

    _classPrivateFieldGet(this, _websocket).on('messageDecodingFailed', err => _classPrivateMethodGet(this, _handleError, _handleError2).call(this, err, 'Websocket message decoding failed')); // Hard timeout if the WebSocketClient library does not handle connect errors correctly.


    setTimeout(() => reject('Websocket not responding'), 30000);
  });
}

function _processWebcastResponse2(webcastResponse) {
  // Emit raw (protobuf encoded) data for a use case specific processing
  webcastResponse.messages.forEach(message => {
    this.emit(ControlEvents.RAWDATA, message.type, message.binary);
  }); // Process and emit decoded data depending on the the message type

  webcastResponse.messages.filter(x => x.decodedData).forEach(message => {
    var _simplifiedObj$displa, _simplifiedObj$displa2;

    let simplifiedObj = simplifyObject(message.decodedData);
    this.emit(ControlEvents.DECODEDDATA, message.type, simplifiedObj, message.binary);

    switch (message.type) {
      case 'WebcastControlMessage':
        // Known control actions:
        // 3 = Stream terminated by user
        // 4 = Stream terminated by platform moderator (ban)
        const action = message.decodedData.action;

        if ([3, 4].includes(action)) {
          this.emit(ControlEvents.STREAMEND, {
            action
          });
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

        if ((_simplifiedObj$displa = simplifiedObj.displayType) !== null && _simplifiedObj$displa !== void 0 && _simplifiedObj$displa.includes('follow')) {
          this.emit(CustomEvents.FOLLOW, simplifiedObj);
        }

        if ((_simplifiedObj$displa2 = simplifiedObj.displayType) !== null && _simplifiedObj$displa2 !== void 0 && _simplifiedObj$displa2.includes('share')) {
          this.emit(CustomEvents.SHARE, simplifiedObj);
        }

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

      case 'WebcastEmoteChatMessage':
        this.emit(MessageEvents.EMOTE, simplifiedObj);
        break;

      case 'WebcastEnvelopeMessage':
        this.emit(MessageEvents.ENVELOPE, simplifiedObj);
        break;

      case 'WebcastSubNotifyMessage':
        this.emit(MessageEvents.SUBSCRIBE, simplifiedObj);
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
  WebcastPushConnection,
  signatureProvider: require('./lib/tiktokSignatureProvider'),
  webcastProtobuf: require('./lib/webcastProtobuf.js')
};