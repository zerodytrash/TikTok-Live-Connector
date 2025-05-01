import CallableInstance from 'callable-instance';
import { WebcastWebClient } from '@/lib';

export abstract class Route<Args, Response> extends CallableInstance<[Args], Promise<Response>> {

    constructor(
        protected readonly webClient: WebcastWebClient
    ) {
        super('call');
    }

    abstract call(args: Args): Promise<Response>;

}

