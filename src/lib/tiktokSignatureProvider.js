const { EventEmitter } = require('events');
const { getUuc } = require('./tiktokUtils');
const pkg = require('../../package.json');
const axios = require('axios').create({
    timeout: 5000,
    headers: {
        'User-Agent': `${pkg.name}/${pkg.version} ${process.platform}`,
    },
});

let config = {
    enabled: true,
    signProviderHost: 'https://tiktok.eulerstream.com/',
    extraParams: {},
};

let signEvents = new EventEmitter();

function signWebcastRequest(url, headers, cookieJar) {
    return signRequest('webcast/sign_url', url, headers, cookieJar);
}

async function signRequest(providerPath, url, headers, cookieJar) {
    if (!config.enabled) {
        return url;
    }

    let params = {
        url,
        client: 'ttlive-node',
        ...config.extraParams,
    };

    params.uuc = getUuc();

    try {
        let signResponse = await axios.get(config.signProviderHost + providerPath, { params, responseType: 'json' });

        if (signResponse.status !== 200) {
            throw new Error(`Status Code: ${signResponse.status}`);
        }

        if (!signResponse.data?.signedUrl) {
            throw new Error('missing signedUrl property');
        }

        if (headers) {
            headers['User-Agent'] = signResponse.data['User-Agent'];
        }

        if (cookieJar) {
            cookieJar.setCookie('msToken', signResponse.data['msToken']);
        }

        signEvents.emit('signSuccess', {
            originalUrl: url,
            signedUrl: signResponse.data.signedUrl,
            headers,
            cookieJar,
        });

        return signResponse.data.signedUrl;
    } catch (error) {
        signEvents.emit('signError', {
            originalUrl: url,
            headers,
            cookieJar,
            error,
        });

        // If a sessionid is present, the signature is optional => Do not throw an error.
        if (cookieJar.getCookieByName('sessionid')) {
            return url;
        }

        throw new Error(`Failed to sign request: ${error.message}; URL: ${url}`);
    }
}

module.exports = {
    config,
    signEvents,
    signWebcastRequest,
};
