import WebcastHttpClient from '@/lib/web/lib/http-client';
import { FetchRoomInfoRoute } from '@/lib/web/routes';
import { SendRoomChatRoute } from '@/lib/web/routes/send-room-chat';
import { FetchRoomIdFromHtml } from '@/lib/web/routes/fetch-room-id-html';
import { FetchRoomIdFromApi } from '@/lib/web/routes/fetch-room-id-api';

// Export all types and classes
export * from './routes';
export * from './lib';

// Export a wrapper that brings it all together
export class WebcastWebClient extends WebcastHttpClient {

    roomInfo: FetchRoomInfoRoute;
    sendRoomChat: SendRoomChatRoute;
    roomIdFromHtml: FetchRoomIdFromHtml;
    roomIdFromApi: FetchRoomIdFromApi;

    constructor(...params: ConstructorParameters<typeof WebcastHttpClient>) {
        super(...params);
        this.roomInfo = new FetchRoomInfoRoute(this);
        this.sendRoomChat = new SendRoomChatRoute(this);
        this.roomIdFromHtml = new FetchRoomIdFromHtml(this);
        this.roomIdFromApi = new FetchRoomIdFromApi(this);
    }

}


