function getRoomIdFromMainPageHtml(mainPageHtml) {
    let matchMeta = mainPageHtml.match(/room_id=([0-9]*)/);
    if (matchMeta && matchMeta[1]) return matchMeta[1];

    let matchJson = mainPageHtml.match(/"roomId":"([0-9]*)"/);
    if (matchJson && matchJson[1]) return matchJson[1];

    let userExists = mainPageHtml.includes('"uniqueId"');

    throw new Error(`Failed to extract room_id from page source. ${userExists ? 'User might be offline.' : 'User not found'}.`);
}

function validateAndNormalizeUniqueId(uniqueId) {
    if (typeof uniqueId !== 'string') {
        throw new Error("Missing or invalid value for 'uniqueId'. Please provide the username from TikTok URL.");
    }

    // Support full URI
    uniqueId = uniqueId.replace('https://www.tiktok.com/', '');
    uniqueId = uniqueId.replace('/live', '');
    uniqueId = uniqueId.replace('@', '');
    uniqueId = uniqueId.trim();

    return uniqueId;
}

module.exports = {
    getRoomIdFromMainPageHtml,
    validateAndNormalizeUniqueId
}