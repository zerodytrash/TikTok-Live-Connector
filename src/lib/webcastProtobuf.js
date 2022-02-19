const protobufjs = require('protobufjs');

let tiktokSchemaPath = require.resolve('../proto/tiktokSchema.proto');
let tiktokSchema = null;

// Load & cache schema
function loadTikTokSchema() {
    if (!tiktokSchema) {
        tiktokSchema = protobufjs.loadSync(tiktokSchemaPath);
    }
}

function serializeMessage(protoName, obj) {
    loadTikTokSchema();
    return tiktokSchema.lookupType(`TikTok.${protoName}`).encode(obj).finish();
}

function deserializeMessage(protoName, binaryMessage) {
    loadTikTokSchema();

    var webcastData = tiktokSchema.lookupType(`TikTok.${protoName}`).decode(binaryMessage);

    if (protoName === 'WebcastResponse' && Array.isArray(webcastData.messages)) {
        // Contains different object structures depending on the type field
        webcastData.messages.forEach((message) => {
            switch (message.type) {
                case 'WebcastControlMessage':
                case 'WebcastRoomUserSeqMessage':
                case 'WebcastChatMessage':
                case 'WebcastMemberMessage':
                case 'WebcastGiftMessage':
                case 'WebcastSocialMessage':
                case 'WebcastLikeMessage':
                case 'WebcastQuestionNewMessage':
                case 'WebcastLinkMicBattle':
                case 'WebcastLinkMicArmies':
                    message.decodedData = tiktokSchema.lookupType(`TikTok.${message.type}`).decode(message.binary);
                    break;
            }
        });
    }

    return webcastData;
}

function deserializeWebsocketMessage(binaryMessage) {
    // Websocket messages are in an container which contains additional data
    // Message type 'msg' represents a normal WebcastResponse
    let decodedWebsocketMessage = deserializeMessage('WebcastWebsocketMessage', binaryMessage);
    if (decodedWebsocketMessage.type === 'msg') {
        decodedWebsocketMessage.webcastResponse = deserializeMessage('WebcastResponse', decodedWebsocketMessage.binary);
    }

    return decodedWebsocketMessage;
}

module.exports = {
    serializeMessage,
    deserializeMessage,
    deserializeWebsocketMessage,
};
