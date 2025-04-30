import WebcastHttpClient from '@/lib/web/lib/http-client';
import { FetchRoomInfoRoute } from '@/lib/web/routes';
import { SendRoomChatRoute } from '@/lib/web/routes/send-room-chat';
import { FetchRoomIdFromHtml } from '@/lib/web/routes/fetch-room-id-html';
import { FetchRoomIdFromApi } from '@/lib/web/routes/fetch-room-id-api';
import { FetchSignedWebSocketRoute } from '@/lib/web/routes/fetch-signed-websocket';

// Export all types and classes
export * from './routes';
export * from './lib';

// Export a wrapper that brings it all together
export class WebcastWebClient extends WebcastHttpClient {

    fetchRoomInfo: FetchRoomInfoRoute;
    sendRoomChat: SendRoomChatRoute;
    fetchRoomIdFromHtml: FetchRoomIdFromHtml;
    fetchRoomIdFromApi: FetchRoomIdFromApi;
    fetchSignedWebSocket: FetchSignedWebSocketRoute;

    constructor(...params: ConstructorParameters<typeof WebcastHttpClient>) {
        super(...params);
        this.fetchRoomInfo = new FetchRoomInfoRoute(this);
        this.sendRoomChat = new SendRoomChatRoute(this);
        this.fetchRoomIdFromHtml = new FetchRoomIdFromHtml(this);
        this.fetchRoomIdFromApi = new FetchRoomIdFromApi(this);
        this.fetchSignedWebSocket = new FetchSignedWebSocketRoute(this);
    }

}


