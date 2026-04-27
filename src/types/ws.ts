import { WebSocket } from 'ws';
import { DecodedWebcastPushFrame } from '@/types/client';
import TypedEventEmitter from 'typed-emitter';

export type WebcastWebSocketEventMap = {
    close: () => void;
    messageDecodingFailed: (error: Error) => void;
    protoMessageFetchResult: (response: any) => void;
    webSocketData: (data: Buffer) => void;
    imEnteredRoom: (decodedContainer: DecodedWebcastPushFrame) => void;
};

export type WebcastTypedWebSocket = new (...args: any[]) => WebSocket & TypedEventEmitter<WebcastWebSocketEventMap>;



