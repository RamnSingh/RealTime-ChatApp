var mongoose = require('mongoose');

var Notification = require('../models/notification');
var QueryBuilder = require('../utilities/QueryBuilder');

var mongoHelper = require('../helpers/mongoHelper');

var notificatonService = {};

notificatonService.send = (userId, body, sendTo, cb) => {
    userId = mongoHelper.convertToObjectId(userId);
    var sentTo = [];
    if(typeof sendTo == 'string'){
        sentTo.push(mongoHelper.convertToObjectId(sendTo));
    }else{
        for(var i = 0; i < sendTo.length; i++){
            sentTo.push(mongoHelper.convertToObjectId(sendTo[i]));
        }
    }

    var notificaton = new Notification();
    notificaton.sendById = userId;
    notificaton.sentTo = sentTo;
    notificaton.body = body;

    Notification.send(notificaton, cb);
}

notificatonService.getAll = (userId, cb) => {
    userId = mongoHelper.convertToObjectId(userId);
    var queryBuilder = new QueryBuilder();
    queryBuilder.setMatch({
        'sentTo' : {
            $in : [userId]
        },
        'readBy' : {
            $nin : [userId]
        }
    });

    Notification.where(queryBuilder.getQueryObject(), cb);
}

notificatonService.read = (notificationId, userId, cb) => {
    notificationId = mongoHelper.convertToObjectId(notificationId);
    userId = mongoHelper.convertToObjectId(userId);
    Notification.read(notificationId, userId, cb);
}

module.exports = notificatonService;