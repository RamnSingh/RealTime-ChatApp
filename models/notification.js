var mongoose = require('mongoose');


var notificationSchema = mongoose.Schema({
    sendById : {
        type : mongoose.Schema.Types.ObjectId
    },
    body : {
        type : String
    },
    sendOn : {
        type : Date
    },
    sentTo : {
        type : Array
    },
    readBy : {
        type : Array
    }
});

var Notification = mongoose.model('Notification', notificationSchema);

Notification.send = (notification, cb) => {
    Notification.create(notification, cb);
}

Notification.read = (notificationId, userId, cb) => {
    Notification.update({
        _id : notificationId
    }, {
        $push : {
            readBy : userId
        }
    }, cb);
}

Notification.where = (queryBuilderObj, cb) => {
    Notification.aggregate(queryBuilderObj, cb);
}
module.exports = Notification;