const { getUuc } = require('./tiktokUtils');

const DEFAULT_SIGN_URL = 'https://tiktok.eulerstream.com/';

function signWebcastRequest(url, headers, cookieJar, signProviderOptions) {
    return signRequest('webcast/fetch', url, headers, cookieJar, signProviderOptions);
}

async function signRequest(providerPath, url, headers, cookieJar, signProviderOptions) {
    const urlParams = new URLSearchParams(url.split('?')[1]);

    const roomId = urlParams.get('room_id');

    let params = {
        room_id: roomId,
        client: 'ttlive-node',
        uuc: getUuc(),
        ...signProviderOptions?.params,
    };

    const host = signProviderOptions?.host || DEFAULT_SIGN_URL;

    const signedUrl = `${host}${providerPath}?${new URLSearchParams(params).toString()}`;

    return signedUrl;
}

module.exports = {
    signWebcastRequest,
};
