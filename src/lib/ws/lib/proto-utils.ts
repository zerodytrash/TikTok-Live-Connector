import * as tikTokSchema from 'tiktok-live-proto/v3';
import { ProtoMessageFetchResult, WebcastPushFrame } from 'tiktok-live-proto/v3';
import {
    DecodedWebcastPushFrame,
    IWebcastDeserializeConfig,
    WebcastEventMessage,
    WebcastMessage
} from '@/types/client';
import * as zlib from 'node:zlib';
import * as util from 'node:util';
import { InvalidSchemaNameError, InvalidUniqueIdError, SchemaDecodeError } from '@/types/errors';
import { base64Encode, BinaryReader, BinaryWriter } from '@bufbuild/protobuf/wire';

/**
 * Copy the internal MessageFns over for type introspection
 */
interface MessageFns<T> {
    encode(message: T, writer?: BinaryWriter): BinaryWriter;

    decode(input: BinaryReader | Uint8Array, length?: number): T;
}

const unzip = util.promisify(zlib.unzip);

function hasProtoName(protoName: string): boolean {
    return !!tikTokSchema[protoName];
}

export const WebcastDeserializeConfig: IWebcastDeserializeConfig = {
    skipMessageTypes: [],
    includeMessageTypes: null,
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

            // Filter messages based on includeMessageTypes and skipMessageTypes config. includeMessageTypes takes precedence over skipMessageTypes
            if (WebcastDeserializeConfig.includeMessageTypes === null) {
                if (WebcastDeserializeConfig.skipMessageTypes?.includes(message.method as keyof WebcastEventMessage)) {
                    continue;
                }
            } else {
                if (!WebcastDeserializeConfig.includeMessageTypes.includes(message.method as keyof WebcastEventMessage)) {
                    continue;
                }
            }

            if (!hasProtoName(message.method)) {
                if (process.env.DEBUG_DESERIALIZE_XD) {
                    console.log('---------------');
                    console.log(message.method, base64Encode(Buffer.from(message.payload)));
                    console.log('---------------');
                }
                continue;
            }

            // Try to decode nested message, if it fails, store error in decodeError
            try {
                message.decodedData = {
                    type: message.method as keyof WebcastEventMessage,
                    data: deserializeMessage(message.method as keyof WebcastEventMessage, Buffer.from(message.payload))
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

/**
 * Validates and normalizes the uniqueId (username) input for TikTok live room information retrieval.
 * It ensures that the input is a string and extracts the username from various possible formats, such as full URLs or with/without '@' symbol. If the input is invalid, it throws an error with a descriptive message.
 *
 * @param uniqueId Input value representing the unique identifier (username) of a TikTok user. This can be in various formats, such as a plain username, a full TikTok URL, or with an '@' symbol.
 */
export function validateAndNormalizeUniqueId(uniqueId: unknown): string {
    if (typeof uniqueId !== 'string') {
        throw new InvalidUniqueIdError('Missing or invalid value for \'uniqueId\'. Please provide the username from TikTok URL.');
    }

    // Support full URI
    return uniqueId.replace('https://www.tiktok.com/', '')
        .replace('/live', '')
        .replace('@', '')
        .trim();
}


/**
 * Create a base WebcastPushFrame with default values, allowing overrides for specific fields. This is useful for testing or constructing messages without needing to specify every field.
 *
 * @param overrides Overrides to apply to the default WebcastPushFrame. Fields not included in the overrides will be set to default values that typically indicate "not set" (e.g., "0" for numeric fields, empty buffer for payload).
 */
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
            payload: Buffer.from([]),
            service: undefinedNum,
            method: undefinedNum,
            headers: [],
            ...overrides
        }
    );

}

