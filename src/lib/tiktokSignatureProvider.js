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
    signProvider: signProvider,
    signProviderHost: 'https://tiktok.isaackogan.com/',
    signProviderPath: 'webcast/sign_url',
    extraParams: {},
};

let signEvents = new EventEmitter();

function signWebcastRequest(url, headers, cookieJar) {
    if (config.enabled) {
        return config.signProvider(url, headers, cookieJar, signEvents);
    } else {
        return url;
    }
}

async function signProvider(url, headers, cookieJar, _signEvents) {
    let params = {
        url,
        client: 'ttlive-node',
        uuc: getUuc(),
        ...config.extraParams,
    };

    try {
        let signResponse = await axios.get(config.signProviderHost + config.signProviderPath, { params, responseType: 'json' });

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

        _signEvents.emit('signSuccess', {
            originalUrl: url,
            signedUrl: signResponse.data.signedUrl,
            headers,
            cookieJar,
        });

        return signResponse.data.signedUrl;
    } catch (error) {
        _signEvents.emit('signError', {
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
