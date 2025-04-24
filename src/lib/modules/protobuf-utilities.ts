import * as tikTokSchema from '@/types/tiktok-schema';
import { MessageFns, WebcastResponse, WebcastWebsocketMessage } from '@/types/tiktok-schema';
import {
    DecodedWebcastWebsocketMessage,
    IWebcastDeserializeConfig,
    WebcastEventMessage,
    WebcastMessage
} from '@/types';
import * as zlib from 'node:zlib';
import * as util from 'node:util';
import { InvalidSchemaNameError } from '@/types/errors';

const unzip = util.promisify(zlib.unzip);
const webcastEvents: (keyof WebcastMessage)[] = Object.keys(tikTokSchema).filter((message) => message.startsWith('Webcast')) as (keyof WebcastMessage)[];

export const WebcastDeserializeConfig: IWebcastDeserializeConfig = {
    skipMessageTypes: []
};

/**
 * Find the messages defined in the TikTok protobuf schema
 */
async function getTikTokSchemaNames(): Promise<string[]> {
    return Object.keys(tikTokSchema);
}

/**
 * Find the Webcast messages defined in the TikTok protobuf schema
 */
async function getWebcastEvents(): Promise<string[]> {
    return (await getTikTokSchemaNames()).filter((message) => message.startsWith('Webcast'));
}

export async function deserializeMessage<T extends keyof WebcastMessage>(
    protoName: T,
    binaryMessage: Buffer
): Promise<WebcastMessage[T]> {
    const messageFn: MessageFns<WebcastMessage[T]> | undefined = tikTokSchema[protoName as string];
    if (!messageFn) throw new InvalidSchemaNameError(`Invalid schema name not found: ${protoName}`);
    const webcastResponse = messageFn.decode(binaryMessage);

    // Handle WebcastResponse nested messages
    if (protoName === 'WebcastResponse') {
        for (const message of ((webcastResponse as WebcastResponse).messages || [])) {
            if (WebcastDeserializeConfig.skipMessageTypes.includes(message.type)) {
                continue;
            }

            if (!webcastEvents.includes(message.type as keyof WebcastMessage)) {
                continue;
            }

            const messageType = message.type as keyof WebcastEventMessage;
            // @ts-ignore
            message.decodedData = await deserializeMessage(messageType, Buffer.from(message.binary));
        }
    }

    return webcastResponse;
}


export async function deserializeWebSocketMessage(binaryMessage: Uint8Array): Promise<DecodedWebcastWebsocketMessage> {
    // Websocket messages are in a container which contains additional data
    // Message type 'msg' represents a normal WebcastResponse
    const rawWebcastWebSocketMessage = WebcastWebsocketMessage.decode(binaryMessage);
    let webcastResponse: any | undefined = undefined;

    if (rawWebcastWebSocketMessage.type === 'msg') {
        let binary: Uint8Array = rawWebcastWebSocketMessage.binary;

        // Decompress binary (if gzip compressed)
        // https://www.rfc-editor.org/rfc/rfc1950.html
        if (binary && binary.length > 2 && binary[0] === 0x1f && binary[1] === 0x8b && binary[2] === 0x08) {
            rawWebcastWebSocketMessage.binary = await unzip(binary);
        }

        webcastResponse = WebcastResponse.decode(rawWebcastWebSocketMessage.binary);
    }

    return {
        ...rawWebcastWebSocketMessage,
        webcastResponse
    };

}
