function simplifyObject(webcastObject) {
    if (webcastObject.questionDetails) {
        Object.assign(webcastObject, webcastObject.questionDetails);
        delete webcastObject.questionDetails;
    }

    if (webcastObject.user) {
        Object.assign(webcastObject, getUserAttributes(webcastObject.user));
        delete webcastObject.user;
    }

    if (webcastObject.giftJson) {
        webcastObject.gift = JSON.parse(webcastObject.giftJson);
        webcastObject.giftId = webcastObject.gift.gift_id;
        delete webcastObject.giftJson;
    }

    if (webcastObject.event) {
        Object.assign(webcastObject, webcastObject.event);
        delete webcastObject.event;
    }

    if (webcastObject.eventDetails) {
        Object.assign(webcastObject, webcastObject.eventDetails);
        delete webcastObject.eventDetails;
    }

    if (webcastObject.battleItems) {
        webcastObject.battleArmies = [];
        webcastObject.battleItems.forEach(battleItem => {
            battleItem.battleGroups.forEach(battleGroup => {
                let group = {
                    hostUserId: battleItem.hostUserId.toString(),
                    points: parseInt(battleGroup.points),
                    participants: [],
                }

                battleGroup.users.forEach(user => {
                    group.participants.push(getUserAttributes(user))
                })

                webcastObject.battleArmies.push(group);
            })
        });

        delete webcastObject.battleItems;
    }

    return Object.assign({}, webcastObject);
}

function getUserAttributes(webcastUser) {
    return {
        userId: webcastUser.userId.toString(),
        uniqueId: webcastUser.uniqueId !== '' ? webcastUser.uniqueId : undefined,
        nickname: webcastUser.nickname !== '' ? webcastUser.nickname : undefined,
        profilePictureUrl: webcastUser.profilePicture?.urls[2],
    };
}

module.exports = {
    simplifyObject,
};
