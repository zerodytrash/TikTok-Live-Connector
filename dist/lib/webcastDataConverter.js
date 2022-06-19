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

  if (webcastObject.user1 && webcastObject.user1.user2) {
    Object.assign(webcastObject, getUserAttributes(webcastObject.user1.user2.user3[0].user4.user));
    delete webcastObject.user1;
  }

  if (webcastObject.box) {
    Object.assign(webcastObject, webcastObject.box);
    delete webcastObject.box;
  }

  if (webcastObject.user) {
    Object.assign(webcastObject, getUserAttributes(webcastObject.user));
    delete webcastObject.user;
  }

  if (webcastObject.user) {
    Object.assign(webcastObject, getUserAttributes(webcastObject.user));
    delete webcastObject.user;
  }

  if (webcastObject.event) {
    Object.assign(webcastObject, webcastObject.event);
    delete webcastObject.event;
  }

  if (webcastObject.eventDetails) {
    Object.assign(webcastObject, webcastObject.eventDetails);
    delete webcastObject.eventDetails;
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
  }

  return Object.assign({}, webcastObject);
}

function getUserAttributes(webcastUser) {
  var _webcastUser$profileP, _webcastUser$extraAtt;

  return {
    userId: webcastUser.userId.toString(),
    uniqueId: webcastUser.uniqueId !== '' ? webcastUser.uniqueId : undefined,
    nickname: webcastUser.nickname !== '' ? webcastUser.nickname : undefined,
    profilePictureUrl: (_webcastUser$profileP = webcastUser.profilePicture) === null || _webcastUser$profileP === void 0 ? void 0 : _webcastUser$profileP.urls[2],
    followRole: (_webcastUser$extraAtt = webcastUser.extraAttributes) === null || _webcastUser$extraAtt === void 0 ? void 0 : _webcastUser$extraAtt.followRole,
    userBadges: mapBadges(webcastUser.badge)
  };
}

function mapBadges(badge) {
  if (!badge || !Array.isArray(badge.badges)) return [];
  let badges = [];
  badge.badges.forEach(badge => {
    badges.push(Object.assign({}, badge));
  });
  return badges;
}

module.exports = {
  simplifyObject
};