import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { name, version } from '../../../package.json';
import { IWebcastSignatureProviderConfig } from '../../types';
import { util } from 'protobufjs';
import CookieJar from './cookie-jar';
import { SignatureError } from '../../types/errors';
import EventEmitter = util.EventEmitter;


export const WebcastSignatureProviderConfig: IWebcastSignatureProviderConfig = {
    enabled: true,
    signProviderHost: 'https://tiktok.eulerstream.com/',
    signProviderFallbackHosts: ['https://tiktok-sign.zerody.one/'],
    extraParams: {}
};

export default class SignatureProvider extends EventEmitter {

    public signatureProviderAxiosInstance: AxiosInstance = axios.create({
        timeout: 5000,
        headers: {
            'User-Agent': `${name}/${version} ${process.platform}`
        }
    });

    public async signRequest(
        providerPath: string,
        url: string,
        headers: Record<string, any>,
        cookieJar: CookieJar,
        signProviderOptions: any
    ) {
        if (!WebcastSignatureProviderConfig.enabled) {
            return url;
        }

        let params = {
            url,
            client: 'ttlive-node',
            ...WebcastSignatureProviderConfig.extraParams,
            ...signProviderOptions?.params
        };

        let hostsToTry: string[] = [
            WebcastSignatureProviderConfig.signProviderHost,
            ...WebcastSignatureProviderConfig.signProviderFallbackHosts
        ];

        // Prioritize the custom host if provided
        if (signProviderOptions?.host) {
            // Remove any existing entries of the custom host to avoid duplication
            hostsToTry = hostsToTry.filter((host) => host !== signProviderOptions.host);
            hostsToTry.unshift(signProviderOptions.host);
        }

        let signResponse: AxiosResponse;
        let signError: Error;
        let signHostedUsed: string;

        try {
            for (let signHost of hostsToTry) {
                signHostedUsed = signHost;
                try {
                    signResponse = await this.signatureProviderAxiosInstance.get(signHost + providerPath, {
                        params,
                        headers: signProviderOptions?.headers,
                        responseType: 'json'
                    });
                    if (signResponse.status === 200 && typeof signResponse.data === 'object') {
                        break;
                    }
                } catch (err) {
                    signError = err;
                }
            }

            if (!signResponse) {
                throw new SignatureError(`Failed to sign request: ${signError.message}; URL: ${url}`, signError);
            }

            if (signResponse.status !== 200) {
                throw new SignatureError(`Status Code: ${signResponse.status}`);
            }

            if (!signResponse.data?.signedUrl) {
                throw new SignatureError('missing signedUrl property');
            }

            if (headers) headers['User-Agent'] = signResponse.data['User-Agent'];
            if (cookieJar) cookieJar['msToken'] = signResponse.data['msToken'];

            this.emit('signSuccess', {
                signHostedUsed,
                originalUrl: url,
                signedUrl: signResponse.data.signedUrl,
                headers,
                cookieJar
            });

            return signResponse.data.signedUrl;
        } catch (error) {
            this.emit('signError', {
                signHostedUsed,
                originalUrl: url,
                headers,
                cookieJar,
                error
            });

            // If a sessionid is present, the signature is optional => Do not throw an error.
            if (cookieJar['sessionid']) {
                return url;
            }

            throw new SignatureError(`Failed to sign request: ${error.message}; URL: ${url}`);
        }
    }

    public async signWebcastRequest(
        url: string,
        headers: Record<string, any>,
        cookieJar: CookieJar,
        signProviderOptions: any
    ): Promise<any> {
        return this.signRequest(
            'webcast/sign_url',
            url,
            headers,
            cookieJar,
            signProviderOptions
        );
    }

}


