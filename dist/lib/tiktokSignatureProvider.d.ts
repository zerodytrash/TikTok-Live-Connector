export namespace config {
    const enabled: boolean;
    const signProviderHost: string;
    const signProviderFallbackHosts: string[];
    const extraParams: {};
}
export let signEvents: EventEmitter;
export function signWebcastRequest(url: any, headers: any, cookieJar: any, signProviderOptions: any): Promise<any>;
import { EventEmitter } from "events";
//# sourceMappingURL=tiktokSignatureProvider.d.ts.map