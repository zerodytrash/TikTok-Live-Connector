"use strict";

class ConnectError extends Error {
  constructor(message) {
    super(message);
  }

}

class InvalidUniqueIdError extends Error {}

class InvalidSessionIdError extends Error {}

class ExtractRoomIdError extends Error {}

class InvalidResponseError extends Error {
  constructor(message, requestErr = undefined) {
    super(message);
    this.name = 'InvalidResponseError';
    this.requestErr = requestErr;
  }

}

class SignatureError extends InvalidResponseError {
  constructor(message, requestErr = undefined) {
    super(message, requestErr);
    this.name = 'SignatureError';
  }

}

class InitialFetchError extends ConnectError {
  constructor(message, retryAfter) {
    super(message);
    this.retryAfter = retryAfter;
  }

}

class AlreadyConnectingError extends ConnectError {}

class AlreadyConnectedError extends ConnectError {}

class UserOfflineError extends ConnectError {}

class NoWSUpgradeError extends ConnectError {}

module.exports = {
  InitialFetchError,
  AlreadyConnectingError,
  AlreadyConnectedError,
  UserOfflineError,
  InvalidUniqueIdError,
  NoWSUpgradeError,
  InvalidSessionIdError,
  InvalidResponseError,
  ExtractRoomIdError,
  SignatureError
};