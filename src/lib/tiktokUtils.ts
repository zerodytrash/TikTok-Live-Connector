import { InvalidUniqueIdError, UserOfflineError } from './tiktokErrors';

export function getRoomIdFromMainPageHtml(
    mainPageHtml: string
): string {
    let idx = 0;
    do {
        // Loop through many "room" excerpts and look for a match
        idx = mainPageHtml.indexOf('roomId', idx + 3);
        const excerpt = mainPageHtml.substr(idx, 50);
        let matchExcerpt = excerpt.match(/roomId":"([0-9]+)"/);
        if (matchExcerpt && matchExcerpt[1]) return matchExcerpt[1];
    } while (idx >= 0);

    let matchMeta = mainPageHtml.match(/room_id=([0-9]*)/);
    if (matchMeta && matchMeta[1]) return matchMeta[1];

    let matchJson = mainPageHtml.match(/"roomId":"([0-9]*)"/);
    if (matchJson && matchJson[1]) return matchJson[1];

    let validResponse = mainPageHtml.includes('"og:url"');
    throw new UserOfflineError(validResponse ? 'User might be offline.' : 'Your IP or country might be blocked by TikTok.');
}

export function validateAndNormalizeUniqueId(uniqueId: string) {
    if (typeof uniqueId !== 'string') {
        throw new InvalidUniqueIdError('Missing or invalid value for \'uniqueId\'. Please provide the username from TikTok URL.');
    }

    // Support full URI
    uniqueId = uniqueId.replace('https://www.tiktok.com/', '');
    uniqueId = uniqueId.replace('/live', '');
    uniqueId = uniqueId.replace('@', '');
    uniqueId = uniqueId.trim();
    return uniqueId;
}


