"use strict";

/**
 * This ugly function brings the nested protobuf objects to a flat level
 * In addition, attributes in "Long" format are converted to strings (e.g. UserIds)
 * This makes it easier to handle the data later, since some libraries have problems to serialize this protobuf specific data.
 */
function simplifyObject(webcastObject) {
  if (webcastObject.questionDetails) {
    Object.assign(webcastObject, webcastObject.questionDetails);
    delete webcastObject.questionDetails;
  }

  if (webcastObject.user) {
    Object.assign(webcastObject, getUserAttributes(webcastObject.user));
    delete webcastObject.user;
  }

  if (webcastObject.event) {
    Object.assign(webcastObject, getEventAttributes(webcastObject.event));
    delete webcastObject.event;
  }

  if (webcastObject.eventDetails) {
    Object.assign(webcastObject, webcastObject.eventDetails);
    delete webcastObject.eventDetails;
  }

  if (webcastObject.topViewers) {
    webcastObject.topViewers = getTopViewerAttributes(webcastObject.topViewers);
  }

  if (webcastObject.battleUsers) {
    let battleUsers = [];
    webcastObject.battleUsers.forEach(user => {
      var _user$battleGroup;

      if (user !== null && user !== void 0 && (_user$battleGroup = user.battleGroup) !== null && _user$battleGroup !== void 0 && _user$battleGroup.user) {
        battleUsers.push(getUserAttributes(user.battleGroup.user));
      }
    });
    webcastObject.battleUsers = battleUsers;
  }

  if (webcastObject.battleItems) {
    webcastObject.battleArmies = [];
    webcastObject.battleItems.forEach(battleItem => {
      battleItem.battleGroups.forEach(battleGroup => {
        let group = {
          hostUserId: battleItem.hostUserId.toString(),
          points: parseInt(battleGroup.points),
          participants: []
        };
        battleGroup.users.forEach(user => {
          group.participants.push(getUserAttributes(user));
        });
        webcastObject.battleArmies.push(group);
      });
    });
    delete webcastObject.battleItems;
  }

  if (webcastObject.giftId) {
    var _webcastObject$giftDe;

    // Convert to boolean
    webcastObject.repeatEnd = !!webcastObject.repeatEnd; // Add previously used JSON structure (for compatibility reasons)
    // Can be removed soon

    webcastObject.gift = {
      gift_id: webcastObject.giftId,
      repeat_count: webcastObject.repeatCount,
      repeat_end: webcastObject.repeatEnd ? 1 : 0,
      gift_type: (_webcastObject$giftDe = webcastObject.giftDetails) === null || _webcastObject$giftDe === void 0 ? void 0 : _webcastObject$giftDe.giftType
    };

    if (webcastObject.giftDetails) {
      Object.assign(webcastObject, webcastObject.giftDetails);
      delete webcastObject.giftDetails;
    }

    if (webcastObject.giftImage) {
      Object.assign(webcastObject, webcastObject.giftImage);
      delete webcastObject.giftImage;
    }

    if (webcastObject.giftExtra) {
      Object.assign(webcastObject, webcastObject.giftExtra);
      delete webcastObject.giftExtra;

      if (webcastObject.receiverUserId) {
        webcastObject.receiverUserId = webcastObject.receiverUserId.toString();
      }

      if (webcastObject.timestamp) {
        webcastObject.timestamp = parseInt(webcastObject.timestamp);
      }
    }

    if (webcastObject.groupId) {
      webcastObject.groupId = webcastObject.groupId.toString();
    }

    if (typeof webcastObject.monitorExtra === 'string' && webcastObject.monitorExtra.indexOf('{') === 0) {
      try {
        webcastObject.monitorExtra = JSON.parse(webcastObject.monitorExtra);
      } catch (err) {}
    }
  }

  if (webcastObject.emote) {
    var _webcastObject$emote, _webcastObject$emote2, _webcastObject$emote3;

    webcastObject.emoteId = (_webcastObject$emote = webcastObject.emote) === null || _webcastObject$emote === void 0 ? void 0 : _webcastObject$emote.emoteId;
    webcastObject.emoteImageUrl = (_webcastObject$emote2 = webcastObject.emote) === null || _webcastObject$emote2 === void 0 ? void 0 : (_webcastObject$emote3 = _webcastObject$emote2.image) === null || _webcastObject$emote3 === void 0 ? void 0 : _webcastObject$emote3.imageUrl;
    delete webcastObject.emote;
  }

  if (webcastObject.emotes) {
    webcastObject.emotes = webcastObject.emotes.map(x => {
      var _x$emote, _x$emote2, _x$emote2$image;

      return {
        emoteId: (_x$emote = x.emote) === null || _x$emote === void 0 ? void 0 : _x$emote.emoteId,
        emoteImageUrl: (_x$emote2 = x.emote) === null || _x$emote2 === void 0 ? void 0 : (_x$emote2$image = _x$emote2.image) === null || _x$emote2$image === void 0 ? void 0 : _x$emote2$image.imageUrl,
        placeInComment: x.placeInComment
      };
    });
  }

  if (webcastObject.treasureBoxUser) {
    var _webcastObject$treasu, _webcastObject$treasu2, _webcastObject$treasu3, _webcastObject$treasu4;

    // holy crap
    Object.assign(webcastObject, getUserAttributes(((_webcastObject$treasu = webcastObject.treasureBoxUser) === null || _webcastObject$treasu === void 0 ? void 0 : (_webcastObject$treasu2 = _webcastObject$treasu.user2) === null || _webcastObject$treasu2 === void 0 ? void 0 : (_webcastObject$treasu3 = _webcastObject$treasu2.user3[0]) === null || _webcastObject$treasu3 === void 0 ? void 0 : (_webcastObject$treasu4 = _webcastObject$treasu3.user4) === null || _webcastObject$treasu4 === void 0 ? void 0 : _webcastObject$treasu4.user) || {}));
    delete webcastObject.treasureBoxUser;
  }

  if (webcastObject.treasureBoxData) {
    Object.assign(webcastObject, webcastObject.treasureBoxData);
    delete webcastObject.treasureBoxData;
    webcastObject.timestamp = parseInt(webcastObject.timestamp);
  }

  return Object.assign({}, webcastObject);
}

function getUserAttributes(webcastUser) {
  var _webcastUser$userId, _webcastUser$secUid, _webcastUser$profileP, _webcastUser$followIn, _webcastUser$badges, _webcastUser$createTi, _webcastUser$profileP2, _userAttributes$userB, _userAttributes$userB2, _userAttributes$userB3, _userAttributes$userB4, _userAttributes$userB5;

  let userAttributes = {
    userId: (_webcastUser$userId = webcastUser.userId) === null || _webcastUser$userId === void 0 ? void 0 : _webcastUser$userId.toString(),
    secUid: (_webcastUser$secUid = webcastUser.secUid) === null || _webcastUser$secUid === void 0 ? void 0 : _webcastUser$secUid.toString(),
    uniqueId: webcastUser.uniqueId !== '' ? webcastUser.uniqueId : undefined,
    nickname: webcastUser.nickname !== '' ? webcastUser.nickname : undefined,
    profilePictureUrl: getPreferredPictureFormat((_webcastUser$profileP = webcastUser.profilePicture) === null || _webcastUser$profileP === void 0 ? void 0 : _webcastUser$profileP.urls),
    followRole: (_webcastUser$followIn = webcastUser.followInfo) === null || _webcastUser$followIn === void 0 ? void 0 : _webcastUser$followIn.followStatus,
    userBadges: mapBadges(webcastUser.badges),
    userSceneTypes: (_webcastUser$badges = webcastUser.badges) === null || _webcastUser$badges === void 0 ? void 0 : _webcastUser$badges.map(x => (x === null || x === void 0 ? void 0 : x.badgeSceneType) || 0),
    userDetails: {
      createTime: (_webcastUser$createTi = webcastUser.createTime) === null || _webcastUser$createTi === void 0 ? void 0 : _webcastUser$createTi.toString(),
      bioDescription: webcastUser.bioDescription,
      profilePictureUrls: (_webcastUser$profileP2 = webcastUser.profilePicture) === null || _webcastUser$profileP2 === void 0 ? void 0 : _webcastUser$profileP2.urls
    }
  };

  if (webcastUser.followInfo) {
    userAttributes.followInfo = {
      followingCount: webcastUser.followInfo.followingCount,
      followerCount: webcastUser.followInfo.followerCount,
      followStatus: webcastUser.followInfo.followStatus,
      pushStatus: webcastUser.followInfo.pushStatus
    };
  } // badgeSceneType:1 = ADMIN
  // badgeSceneType:4 = SUBSCRIBER
  // badgeSceneType:7 = NEWSUBSCRIBER


  userAttributes.isModerator = userAttributes.userBadges.some(x => x.type && x.type.toLowerCase().includes('moderator') || x.badgeSceneType === 1);
  userAttributes.isNewGifter = userAttributes.userBadges.some(x => x.type && x.type.toLowerCase().includes('live_ng_'));
  userAttributes.isSubscriber = userAttributes.userBadges.some(x => x.url && x.url.toLowerCase().includes('/sub_') || x.badgeSceneType === 4 || x.badgeSceneType === 7);
  userAttributes.topGifterRank = (_userAttributes$userB = (_userAttributes$userB2 = userAttributes.userBadges.find(x => x.url && x.url.includes('/ranklist_top_gifter_'))) === null || _userAttributes$userB2 === void 0 ? void 0 : (_userAttributes$userB3 = _userAttributes$userB2.url.match(/(?<=ranklist_top_gifter_)(\d+)(?=.png)/g)) === null || _userAttributes$userB3 === void 0 ? void 0 : _userAttributes$userB3.map(Number)[0]) !== null && _userAttributes$userB !== void 0 ? _userAttributes$userB : null;
  userAttributes.gifterLevel = ((_userAttributes$userB4 = userAttributes.userBadges.find(x => x.badgeSceneType === 8)) === null || _userAttributes$userB4 === void 0 ? void 0 : _userAttributes$userB4.level) || 0; // BadgeSceneType_UserGrade

  userAttributes.teamMemberLevel = ((_userAttributes$userB5 = userAttributes.userBadges.find(x => x.badgeSceneType === 10)) === null || _userAttributes$userB5 === void 0 ? void 0 : _userAttributes$userB5.level) || 0; // BadgeSceneType_Fans

  return userAttributes;
}

function getEventAttributes(event) {
  if (event.msgId) event.msgId = event.msgId.toString();
  if (event.createTime) event.createTime = event.createTime.toString();
  return event;
}

function getTopViewerAttributes(topViewers) {
  return topViewers.map(viewer => {
    return {
      user: viewer.user ? getUserAttributes(viewer.user) : null,
      coinCount: viewer.coinCount ? parseInt(viewer.coinCount) : 0
    };
  });
}

function mapBadges(badges) {
  let simplifiedBadges = [];

  if (Array.isArray(badges)) {
    badges.forEach(innerBadges => {
      var _innerBadges$privileg, _innerBadges$privileg2;

      let badgeSceneType = innerBadges.badgeSceneType;

      if (Array.isArray(innerBadges.badges)) {
        innerBadges.badges.forEach(badge => {
          simplifiedBadges.push(Object.assign({
            badgeSceneType
          }, badge));
        });
      }

      if (Array.isArray(innerBadges.imageBadges)) {
        innerBadges.imageBadges.forEach(badge => {
          if (badge && badge.image && badge.image.url) {
            simplifiedBadges.push({
              type: 'image',
              badgeSceneType,
              displayType: badge.displayType,
              url: badge.image.url
            });
          }
        });
      }

      if ((_innerBadges$privileg = innerBadges.privilegeLogExtra) !== null && _innerBadges$privileg !== void 0 && _innerBadges$privileg.level && ((_innerBadges$privileg2 = innerBadges.privilegeLogExtra) === null || _innerBadges$privileg2 === void 0 ? void 0 : _innerBadges$privileg2.level) !== '0') {
        simplifiedBadges.push({
          type: 'privilege',
          privilegeId: innerBadges.privilegeLogExtra.privilegeId,
          level: parseInt(innerBadges.privilegeLogExtra.level),
          badgeSceneType: innerBadges.badgeSceneType
        });
      }
    });
  }

  return simplifiedBadges;
}

function getPreferredPictureFormat(pictureUrls) {
  if (!pictureUrls || !Array.isArray(pictureUrls) || !pictureUrls.length) {
    return null;
  }

  return pictureUrls.find(x => x.includes('100x100') && x.includes('.webp')) || pictureUrls.find(x => x.includes('100x100') && x.includes('.jpeg')) || pictureUrls.find(x => !x.includes('shrink')) || pictureUrls[0];
}

module.exports = {
  simplifyObject
};