/**
 * Handshake-Msg Response header tells you the cause (e.g. invalid ttwid = 415)
 *
 * Source:
 *
 *    if (i == 0) {
 *             message = "success";
 *         } else if (i == 404) {
 *             message = "uri not found";
 *         } else if (i == 409) {
 *             message = "fpid not registered";
 *         } else if (i == 410) {
 *             message = "invalid device id";
 *         } else if (i == 411) {
 *             message = "appid not registered";
 *         } else if (i == 412) {
 *             message = "websocket protocol not support";
 *         } else if (i == 413) {
 *             message = "the device already connected";
 *         } else if (i == 414) {
 *             message = "server can't accept more connection,try again later";
 *         } else if (i == 415) {
 *             message = "device was blocked";
 *         } else if (i == 416) {
 *             message = "parameter error";
 *         } else if (i == 417) {
 *             message = "authentication failed";
 *         } else if (i == 510) {
 *             message = "server internal error";
 *         } else if (i == 511) {
 *             message = "server is busy，try again later";
 *         } else if (i == 512) {
 *             message = "server is shutting down";
 *         } else if (i == 513) {
 *             message = "auth server is error";
 *         } else if (i == 514) {
 *             message = "auth return error";
 *         }
 */
enum WebSocketStatusCode {
    SUCCESS = 0,
    URI_NOT_FOUND = 404,
    FPID_NOT_REGISTERED = 409,
    INVALID_DEVICE_ID = 410,
    APPID_NOT_REGISTERED = 411,
    WEBSOCKET_PROTOCOL_NOT_SUPPORTED = 412,
    DEVICE_ALREADY_CONNECTED = 413,
    SERVER_CONNECTION_LIMIT = 414,
    DEVICE_BLOCKED = 415,
    PARAMETER_ERROR = 416,
    AUTHENTICATION_FAILED = 417,
    SERVER_INTERNAL_ERROR = 510,
    SERVER_BUSY = 511,
    SERVER_SHUTTING_DOWN = 512,
    AUTH_SERVER_ERROR = 513,
    AUTH_RETURN_ERROR = 514,
}
