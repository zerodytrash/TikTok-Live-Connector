import * as tikTokSchema from '@/types/tiktok/webcast';
import { MessageFns, ProtoMessageFetchResult, WebcastPushFrame } from '@/types/tiktok/webcast';
import {
    DecodedWebcastPushFrame,
    IWebcastDeserializeConfig,
    WebcastEventMessage,
    WebcastMessage
} from '@/types/client';
import * as zlib from 'node:zlib';
import * as util from 'node:util';
import { InvalidSchemaNameError, InvalidUniqueIdError } from '@/types/errors';
import { DevicePreset } from '@/lib/config';

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

export function deserializeMessage<T extends keyof WebcastMessage>(
    protoName: T,
    binaryMessage: Buffer
): WebcastMessage[T] {

    const messageFn: MessageFns<WebcastMessage[T]> | undefined = tikTokSchema[protoName as string];
    if (!messageFn) throw new InvalidSchemaNameError(`Invalid schema name: ${protoName}`);
    const deserializedMessage: WebcastMessage[T] = messageFn.decode(binaryMessage);

    // Handle ProtoMessageFetchResult nested messages
    if (protoName === 'ProtoMessageFetchResult') {
        for (const message of (deserializedMessage as ProtoMessageFetchResult).messages || []) {
            if (WebcastDeserializeConfig.skipMessageTypes.includes(message.type as keyof WebcastEventMessage)) {
                continue;
            }

            if (!webcastEvents.includes(message.type as keyof WebcastMessage)) {
                continue;
            }

            message.decodedData = {
                type: message.type as keyof WebcastEventMessage,
                data: deserializeMessage(message.type as keyof WebcastEventMessage, Buffer.from(message.payload))
            } as any;

        }
    }

    return deserializedMessage;
}


export async function deserializeWebSocketMessage(binaryMessage: Uint8Array): Promise<DecodedWebcastPushFrame> {
    // Websocket messages are in a container which contains additional data
    // Message type 'msg' represents a normal WebcastResponse
    const rawWebcastWebSocketMessage = WebcastPushFrame.decode(binaryMessage);
    let protoMessageFetchResult: ProtoMessageFetchResult | undefined = undefined;

    if (rawWebcastWebSocketMessage.type === 'msg') {
        let binary: Uint8Array = rawWebcastWebSocketMessage.binary;

        // Decompress binary (if gzip compressed)
        // https://www.rfc-editor.org/rfc/rfc1950.html
        if (binary && binary.length > 2 && binary[0] === 0x1f && binary[1] === 0x8b && binary[2] === 0x08) {
            rawWebcastWebSocketMessage.binary = await unzip(binary);
        }

        protoMessageFetchResult = deserializeMessage('ProtoMessageFetchResult', Buffer.from(rawWebcastWebSocketMessage.binary));
    }

    const decodedContainer: DecodedWebcastPushFrame = rawWebcastWebSocketMessage;
    decodedContainer.protoMessageFetchResult = protoMessageFetchResult;
    return decodedContainer;

}

export function validateAndNormalizeUniqueId(uniqueId: string) {
    if (typeof uniqueId !== 'string') {
        throw new InvalidUniqueIdError('Missing or invalid value for \'uniqueId\'. Please provide the username from TikTok URL.');
    }

    // Support full URI
    uniqueId = uniqueId.replace('https://www.tiktok.com/', '');
    uniqueId = uniqueId.replace('/live', '');
    uniqueId = uniqueId.replace('@', '');
    uniqueId = uniqueId.trim();
    return uniqueId;
}


export function userAgentToDevicePreset(userAgent: string): DevicePreset {
    const firstSlash = userAgent.indexOf('/');
    const browserName = userAgent.substring(0, firstSlash);
    const browserVersion = userAgent.substring(firstSlash + 1);

    return {
        user_agent: userAgent,
        browser_name: browserName,
        browser_version: browserVersion,
        browser_platform: userAgent.includes('Macintosh') ? 'MacIntel' : 'Win32',
        os: userAgent.includes('Macintosh') ? 'mac' : 'windows'
    };
}

export function generateDeviceId() {
    let digits = '';
    for (let i = 0; i < 19; i++) {
        digits += Math.floor(Math.random() * 10);
    }
    return digits;
}
