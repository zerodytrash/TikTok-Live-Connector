import WebcastHttpClient from '@/lib/web/lib/http-client';
import CallableInstance from 'callable-instance';

export abstract class Route<Args, Response> extends CallableInstance<[Args], Promise<Response>> {

    constructor(
        protected readonly httpClient: WebcastHttpClient
    ) {
        super('call');
    }

    abstract call(args: Args): Promise<Response>;

}

