import { Route } from '@/types/route';
import { IWebcastRoomIdRouteResponse } from '@eulerstream/euler-api-sdk';
import { AxiosRequestConfig } from 'axios';

export type FetchRoomIdFromEulerRouteParams = { uniqueId: string, options?: AxiosRequestConfig };

export class FetchRoomIdFromEulerRoute extends Route<FetchRoomIdFromEulerRouteParams, IWebcastRoomIdRouteResponse> {

    async call({ uniqueId, options }): Promise<IWebcastRoomIdRouteResponse> {
        const fetchResponse = await this.webClient.webSigner.webcast.retrieveRoomId(uniqueId, options);
        return fetchResponse.data;
    }

}
