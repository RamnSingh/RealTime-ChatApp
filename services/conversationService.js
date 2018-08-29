var mongoose = require('mongoose');

var Conversation = require('../models/conversation');
var Message = require('../models/message');
var QueryBuilder = require('../utilities/QueryBuilder');

var mongoHelper = require('../helpers/mongoHelper');

var conversationService = {};

conversationService.create = (userOneId, userTwoId, cb) => {
    userOneId = mongoHelper.convertToObjectId(userOneId);
    userTwoId = mongoHelper.convertToObjectId(userTwoId);
    var conversation = new Conversation();
    conversation.members = [userOneId, userTwoId];
    conversation.allMembers = [userOneId, userTwoId];
    Conversation.create(conversation, cb);
}

conversationService.getConversationByUsersIds = (userOneId, userTwoId, createNewIfNotExist, cb) => {
    userOneId = mongoHelper.convertToObjectId(userOneId);
    userTwoId = mongoHelper.convertToObjectId(userTwoId);

    
    var match = {
        'members' : {
            $size : 2,
            $all : [userOneId, userTwoId]
        }
    };
    getConversationBy(getQueryObjectForFinding('members', match), (err, res) => {
        if(err){
            cb(err);
        }else{
            if(res == undefined){
                if(createNewIfNotExist){
                    conversationService.create(userOneId, userTwoId, cb);
                }else{
                    cb(undefined, []);
                }
            }else{
                cb(undefined, res);
            }
        }
    });
}

conversationService.getConversationById = (conversationId, cb) => {
    conversationId = mongoHelper.convertToObjectId(conversationId);
    var match = {
        '_id' : conversationId
    };
    getConversationBy(getQueryObjectForFinding('members', match), cb);
}

conversationService.getMessages = (conversationId, cb) => {
    conversationId = mongoHelper.convertToObjectId(conversationId);

    var queryBuilderObj = new QueryBuilder();
    queryBuilderObj.setMatch({
        conversationId : conversationId
    });

    Message.where(queryBuilderObj.getQueryObject(), cb);
}

conversationService.sendMessage = (conversationId, authorId, message, cb) => {
    conversationId = mongoHelper.convertToObjectId(conversationId);
    authorId = mongoHelper.convertToObjectId(authorId);
    var messageObj = new Message();
    messageObj.conversationId = conversationId;
    messageObj.authorId = authorId;
    messageObj.message = message;
    Message.sendMessage(messageObj, cb);
}

function getConversationBy(queryBuilderObj, cb){
    Conversation.where(queryBuilderObj.getQueryObject(), (err, result) => {
        if(err){
            cb(err);
        }else{
            if(result[0] != undefined){
                cb(undefined, result[0]);
            }else{
                cb(undefined, undefined);
            }
        }
    });
}

function getQueryObjectForFinding (findBy, match){
    var queryBuilderObj = new QueryBuilder();
    
    if(findBy.toLowerCase() == 'members'){
        queryBuilderObj.setMatch(match);
    }else if(findBy.toLowerCase() == 'conversationId'){
        queryBuilderObj.setMatch(match);
    }
    queryBuilderObj.setUnwind('allMembers');
    queryBuilderObj.setLookup({
        from : 'users',
        localField : 'allMembers',
        foreignField : '_id',
        as : 'allMembers'
    });
    queryBuilderObj.setUnwind('allMembers');
    queryBuilderObj.setProject({
        'allMembers.password' : 0
    });
    queryBuilderObj.setGroup({
        '_id' : '$_id',
        'allMembers' : {
            $push : '$allMembers'
        },
        'members' : {
            $first : '$members'
        },
        'name' : {
            $first : '$name'
        }
    });
    queryBuilderObj.setUnwind('members');
    queryBuilderObj.setLookup({
        from : 'users',
        localField : 'members',
        foreignField : '_id',
        as : 'members'
    });
    queryBuilderObj.setUnwind('members');
    queryBuilderObj.setProject({
        'members.password' : 0
    });
    queryBuilderObj.setGroup({
        '_id' : '$_id',
        'allMembers' : {
            $first : '$allMembers'
        },
        'members' : {
            $push : '$members'
        },
        'name' : {
            $first : '$name'
        }
    });
    queryBuilderObj.setLookup({
        from : 'messages',
        localField : '_id',
        foreignField : 'conversationId',
        as : 'messages'
    });

    return queryBuilderObj;
}

module.exports = conversationService;