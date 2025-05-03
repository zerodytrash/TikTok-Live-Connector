import CallableInstance from 'callable-instance';
import { TikTokWebClient } from '@/lib';

export abstract class Route<Args, Response> extends CallableInstance<[Args], Promise<Response>> {

    constructor(
        protected readonly webClient: TikTokWebClient
    ) {
        super('call');
    }

    abstract call(args: Args): Promise<Response>;

}

