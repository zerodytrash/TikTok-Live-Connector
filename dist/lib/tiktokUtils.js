"use strict";

const {
  UserOfflineError,
  InvalidUniqueIdError
} = require('./tiktokErrors');

let uu = [];

function getRoomIdFromMainPageHtml(mainPageHtml) {
  let idx = 0;

  do {
    // loop thru many "room" excerpts and look for a match
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

function validateAndNormalizeUniqueId(uniqueId) {
  if (typeof uniqueId !== 'string') {
    throw new InvalidUniqueIdError("Missing or invalid value for 'uniqueId'. Please provide the username from TikTok URL.");
  } // Support full URI


  uniqueId = uniqueId.replace('https://www.tiktok.com/', '');
  uniqueId = uniqueId.replace('/live', '');
  uniqueId = uniqueId.replace('@', '');
  uniqueId = uniqueId.trim();
  return uniqueId;
}

function addUniqueId(uniqueId) {
  const existingEntry = uu.find(x => x.uniqueId === uniqueId);

  if (existingEntry) {
    existingEntry.ts = new Date().getTime();
  } else {
    uu.push({
      uniqueId,
      ts: new Date().getTime()
    });
  }
}

function removeUniqueId(uniqueId) {
  uu = uu.filter(x => x.uniqueId !== uniqueId);
}

function getUuc() {
  return uu.filter(x => x.ts > new Date().getTime() - 10 * 60000).length;
}

module.exports = {
  getRoomIdFromMainPageHtml,
  validateAndNormalizeUniqueId,
  getUuc,
  addUniqueId,
  removeUniqueId
};