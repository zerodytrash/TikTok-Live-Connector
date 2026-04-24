import * as tikTokSchema from '@/types/tiktok-schema';
import { MessageFns, ProtoMessageFetchResult, WebcastPushFrame } from '@/types/tiktok-schema';
import {
    DecodedWebcastPushFrame,
    IWebcastDeserializeConfig,
    WebcastEventMessage,
    WebcastMessage
} from '@/types/client';
import * as zlib from 'node:zlib';
import * as util from 'node:util';
import { InvalidSchemaNameError, InvalidUniqueIdError, SchemaDecodeError } from '@/types/errors';
import { DevicePreset } from '@/lib/config';
import { base64Encode, BinaryWriter } from '@bufbuild/protobuf/wire';

const unzip = util.promisify(zlib.unzip);

function hasProtoName(protoName: string): boolean {
    return !!tikTokSchema[protoName];
}

export const WebcastDeserializeConfig: IWebcastDeserializeConfig = {
    skipMessageTypes: [],
    showBase64OnDecodeError: true
};

export function deserializeMessage<T extends keyof WebcastMessage>(
    protoName: T,
    binaryMessage: Buffer
): WebcastMessage[T] {

    const messageFn: MessageFns<WebcastMessage[T]> | undefined = tikTokSchema[protoName as string];
    if (!messageFn) throw new InvalidSchemaNameError(`Invalid schema name: ${protoName}`);

    let deserializedMessage: WebcastMessage[T];
    try {
        deserializedMessage = messageFn.decode(binaryMessage);
    } catch (ex) {
        let errStr = `Failed to decode message type: ${protoName}: ` + (ex as Error).stack;

        if (WebcastDeserializeConfig.showBase64OnDecodeError) {
            errStr += 'Base64 - Use this to create an issue: ' + base64Encode(new Uint8Array(binaryMessage));
        }

        throw new SchemaDecodeError(errStr);
    }

    // Handle ProtoMessageFetchResult nested messages
    if (protoName === 'ProtoMessageFetchResult') {
        for (const message of (deserializedMessage as ProtoMessageFetchResult).messages || []) {
            if (WebcastDeserializeConfig.skipMessageTypes.includes(message.type as keyof WebcastEventMessage)) {
                continue;
            }

            if (!hasProtoName(message.type)) {
                if (process.env.DEBUG_DESERIALIZE_XD) {
                    console.log('---------------');
                    console.log(message.type, base64Encode(Buffer.from(message.payload)));
                    console.log('---------------');
                }
                continue;
            }

            // Try to decode nested message, if it fails, store error in decodeError
            try {
                message.decodedData = {
                    type: message.type as keyof WebcastEventMessage,
                    data: deserializeMessage(message.type as keyof WebcastEventMessage, Buffer.from(message.payload))
                } as any;
            } catch (ex) {
                message.decodeError = ex;
            }

        }
    }

    return deserializedMessage;
}


export async function deserializeWebSocketMessage(binaryMessage: Uint8Array): Promise<DecodedWebcastPushFrame> {
    // Websocket messages are in a container which contains additional data
    // Message type 'msg' represents a normal WebcastResponse
    const rawWebcastWebSocketMessage = WebcastPushFrame.decode(binaryMessage);
    let protoMessageFetchResult: ProtoMessageFetchResult | undefined = undefined;

    // Decode ANY protobuf-encoded payloads
    if (rawWebcastWebSocketMessage.payloadEncoding === 'pb' && rawWebcastWebSocketMessage.payload) {
        let binary: Uint8Array = rawWebcastWebSocketMessage.payload;

        // Decompress binary (if gzip compressed)
        // https://www.rfc-editor.org/rfc/rfc1950.html
        if (binary && binary.length > 2 && binary[0] === 0x1f && binary[1] === 0x8b && binary[2] === 0x08) {
            rawWebcastWebSocketMessage.payload = await unzip(binary);
        }

        protoMessageFetchResult = deserializeMessage('ProtoMessageFetchResult', Buffer.from(rawWebcastWebSocketMessage.payload));
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

export function createBaseWebcastPushFrame(overrides: Partial<WebcastPushFrame>): BinaryWriter {
    // Basically, we need to set it to "0" so that it DOES NOT send the field(s)
    const undefinedNum: string = '0';

    overrides = Object.fromEntries(
        Object.entries(overrides).filter(([_, value]) => value !== undefined)
    );

    return WebcastPushFrame.encode(
        {
            seqId: undefinedNum,
            logId: undefinedNum,
            payloadEncoding: 'pb',
            payloadType: 'msg',
            payload: new Uint8Array(),
            service: undefinedNum,
            method: undefinedNum,
            headers: {},
            ...overrides
        }
    );

}

export function randomLongString() {
    const bytes = crypto.getRandomValues(new Uint8Array(8));
    bytes[0] &= 0x7F; // clear sign bit → positive
    let val = 0n;
    for (const b of bytes) val = (val << 8n) | BigInt(b);
    if (val === 0n) val = 1n; // minimum 1
    return val.toString();
}
