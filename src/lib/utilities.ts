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
import { InvalidSchemaNameError, InvalidUniqueIdError, UserOfflineError } from '@/types/errors';
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
            message.decodedData = deserializeMessage(messageType, Buffer.from(message.binary));
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

export function getRoomIdFromMainPageHtml(
    mainPageHtml: string
): string {
    let idx = 0;
    do {
        // Loop through many "room" excerpts and look for a match
        idx = mainPageHtml.indexOf('roomId', idx + 3);
        const excerpt = mainPageHtml.substring(idx, 50);
        let matchExcerpt = excerpt.match(/roomId":"([0-9]+)"/);
        if (matchExcerpt && matchExcerpt[1]) return matchExcerpt[1];
    } while (idx >= 0);

    let matchMeta = mainPageHtml.match(/room_id=([0-9]*)/);
    if (matchMeta && matchMeta[1]) return matchMeta[1];

    let matchJson = mainPageHtml.match(/"roomId":"([0-9]*)"/);
    if (matchJson && matchJson[1]) return matchJson[1];

    let validResponse = mainPageHtml.includes('"og:url"');
    throw new UserOfflineError(validResponse ? 'User might be offline.' : 'Your IP or country might be blocked by TikTok.');
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
        browser_name: encodeURIComponent(browserName),
        browser_version: encodeURIComponent(browserVersion),
        browser_platform: userAgent.includes('Macintosh') ? 'MacIntel' : 'Win32',
        os: userAgent.includes('Macintosh') ? 'mac' : 'windows'
    };
}
