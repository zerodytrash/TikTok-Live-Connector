import WebcastHttpClient from '@/lib/web/lib/http-client';
import { FetchRoomInfoRoute, SendRoomChatFromEulerRoute } from '@/lib/web/routes';
import { FetchRoomInfoFromHtmlRoute } from '@/lib/web/routes/fetch-room-info-html';
import { FetchSignedWebSocketFromEulerRoute } from '@/lib/web/routes/fetch-signed-websocket-euler';
import { FetchRoomIdFromEulerRoute } from '@/lib/web/routes/fetch-room-id-euler';
import { FetchRoomInfoFromEulerRoute } from '@/lib/web/routes/fetch-room-info-euler';
import { FetchRoomInfoFromApiLiveRoute } from '@/lib/web/routes/fetch-room-info-api-live';

// Export all types and classes
export * from './routes';
export * from './lib';

// Export a wrapper that brings it all together
export class TikTokWebClient extends WebcastHttpClient {

    // TikTok-based routes
    public readonly fetchRoomInfo: FetchRoomInfoRoute;
    public readonly fetchRoomInfoFromApiLive: FetchRoomInfoFromApiLiveRoute;
    public readonly fetchRoomInfoFromHtml: FetchRoomInfoFromHtmlRoute;

    // Euler-based routes
    public readonly fetchSignedWebSocketFromEuler: FetchSignedWebSocketFromEulerRoute;
    public readonly fetchRoomIdFromEuler: FetchRoomIdFromEulerRoute;
    public readonly fetchRoomInfoFromEuler: FetchRoomInfoFromEulerRoute;
    public readonly sendRoomChatFromEuler: SendRoomChatFromEulerRoute;

    constructor(...params: ConstructorParameters<typeof WebcastHttpClient>) {
        super(...params);

        this.fetchRoomInfo = new FetchRoomInfoRoute(this);
        this.fetchRoomInfoFromHtml = new FetchRoomInfoFromHtmlRoute(this);
        this.fetchRoomInfoFromApiLive = new FetchRoomInfoFromApiLiveRoute(this);

        this.fetchSignedWebSocketFromEuler = new FetchSignedWebSocketFromEulerRoute(this);
        this.fetchRoomIdFromEuler = new FetchRoomIdFromEulerRoute(this);
        this.fetchRoomInfoFromEuler = new FetchRoomInfoFromEulerRoute(this);
        this.sendRoomChatFromEuler = new SendRoomChatFromEulerRoute(this);
    }

}


