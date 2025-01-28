export class InitialFetchError extends ConnectError {
    constructor(message: any, retryAfter: any);
    retryAfter: any;
}
export class AlreadyConnectingError extends ConnectError {
}
export class AlreadyConnectedError extends ConnectError {
}
export class UserOfflineError extends ConnectError {
}
export class InvalidUniqueIdError extends Error {
}
export class NoWSUpgradeError extends ConnectError {
}
export class InvalidSessionIdError extends Error {
}
export class InvalidResponseError extends Error {
    constructor(message: any, requestErr?: any);
    requestErr: any;
}
export class ExtractRoomIdError extends Error {
}
export class SignatureError extends InvalidResponseError {
}
declare class ConnectError extends Error {
    constructor(message: any);
}
export {};
//# sourceMappingURL=tiktokErrors.d.ts.map