var mongoose = require('mongoose');


var messageSchema = mongoose.Schema({
    authorId : {
        type : mongoose.Schema.Types.ObjectId
    },
    message : {
        type : String
    },
    read : {
        type : Boolean
    },
    sendOn : {
        type : Date
    },
    conversationId : {
        type : mongoose.Schema.Types.ObjectId
    }
});

var Message = mongoose.model('Message', messageSchema);

Message.where = (queryBuilderObj, cb) => {
    Message.aggregate(queryBuilderObj, cb);
}

Message.sendMessage = (messageObj, cb) => {
    messageObj.sendOn = new Date();
    messageObj.save(cb);
}

Message.getMessages = (conversationId, cb) => {
    Message.find({
        conversationId : conversationId
    }, cb);
};

module.exports = Message;
