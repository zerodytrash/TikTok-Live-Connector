import { Route } from '@/types/route';
import { IWebcastRoomInfoRouteResponse } from '@eulerstream/euler-api-sdk';
import { AxiosRequestConfig } from 'axios';

export type FetchRoomInfoFromEulerRouteParams = { uniqueId: string, options?: AxiosRequestConfig };

export class FetchRoomInfoFromEulerRoute extends Route<FetchRoomInfoFromEulerRouteParams, IWebcastRoomInfoRouteResponse> {

    async call({ uniqueId, options }): Promise<IWebcastRoomInfoRouteResponse> {
        const fetchResponse = await this.webClient.webSigner.webcast.retrieveRoomInfo(uniqueId, options);
        return fetchResponse.data;
    }

}
