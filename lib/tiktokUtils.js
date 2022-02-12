

function getRoomIdFromMainPageHtml(mainPageHtml) {
    try {
        return mainPageHtml.match(/room_id=([0-9]*)/)[1];
    } catch (err) {
        throw new Error("Failed to extract room_id from page source. User might be offline.");
    }
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