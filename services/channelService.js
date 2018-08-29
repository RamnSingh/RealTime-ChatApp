var mongoose = require('mongoose');

var Conversation = require('../models/conversation');
var QueryBuilder = require('../utilities/QueryBuilder');

var mongoHelper = require('../helpers/mongoHelper');

var channelService = {};

channelService.isUserAdmin = (conversationId, userId, cb) => {
    conversationId = mongoHelper.convertToObjectId(conversationId);
    userId = mongoHelper.convertToObjectId(userId);
    Conversation.isUserAdmin(conversationId, userId, cb);
}

channelService.create = (name, description,  createdById, cb) => {
    createdById = mongoHelper.convertToObjectId(createdById);
    var conversationObj = new Conversation();
    conversationObj.name = name;
    conversationObj.description = description;
    conversationObj.type = 'channel';
    conversationObj.members = [createdById];
    conversationObj.allMembers = [createdById];
    conversationObj.createdById = createdById;
    conversationObj.admins = [createdById];

    Conversation.createNew(conversationObj, cb);
}

channelService.getAll = (cb) => {
    var queryObj = new QueryBuilder();
    queryObj.setMatch({
        type : 'channel'
    });
    queryObj.setLookup({
        from : 'users',
        localField: 'createdById',
        foreignField: '_id',
        as: 'createdBy'
    });
    queryObj.setAddFields({
        createdOnStr : {
          $dateToString : {
            format : "%d-%m-%Y",
            date : "$createdOn"
          }
        }
    });
    Conversation.where(queryObj.getQueryObject(), cb);
}

channelService.getAllByMember = (memberId, cb) => {
    memberId = mongoHelper.convertToObjectId(memberId);
    var queryObj = new QueryBuilder();
    queryObj.setMatch({
        members : {
            $in : [memberId]
        },
        type : 'channel'
    });
    queryObj.setLookup({
        from : 'users',
        localField: 'createdById',
        foreignField: '_id',
        as: 'createdBy'
    });
    queryObj.setAddFields({
        createdOnStr : {
          $dateToString : {
            format : "%d-%m-%Y",
            date : "$createdOn"
          }
        }
    });
    queryObj.setProject({
        members : 0
    });
    Conversation.where(queryObj.getQueryObject(), cb);
}

channelService.getAllMembers = (channelId, cb) => {
    channelId = mongoHelper.convertToObjectId(channelId);
    var queryObj = new QueryBuilder();
    queryObj.setMatch({
        _id : channelId,
        type : 'channel'
    });
    queryObj.setUnwind('members');
    queryObj.setLookup({
        from : 'users',
        localField: 'members',
        foreignField: '_id',
        as: 'membersObjects'
    });
    queryObj.setUnwind('membersObjects');
    queryObj.setGroup({
        "_id": "$_id",
        "membersObjects": { "$push": "$membersObjects" },
        "admins" : { $first: '$admins' }
    });
    Conversation.where(queryObj.getQueryObject(), (err, result) => {
        if(err){
            return cb(err);
        }else{
            return cb(undefined, result[0]);
        }
    });
}

channelService.join = (channelId, userId, cb) => {
    channelId = mongoHelper.convertToObjectId(channelId);
    userId = mongoHelper.convertToObjectId(userId);
    Conversation.join(channelId, userId, cb);
}

channelService.removeUserFromChannel = (groupId, userId, adminId, cb) => {
    groupId = mongoHelper.convertToObjectId(groupId);
    userId = mongoHelper.convertToObjectId(userId);
    adminId = mongoHelper.convertToObjectId(adminId);
    Conversation.removeUserFromConversation(groupId, userId, adminId, cb);
}

channelService.leave = (channelId, userId, cb) => {
    channelId = mongoHelper.convertToObjectId(channelId);
    userId = mongoHelper.convertToObjectId(userId);
    Conversation.leave(channelId, userId, cb);
}

channelService.makeAdmin = (groupId, userId, adminId, cb) => {
    groupId = mongoHelper.convertToObjectId(groupId);
    userId = mongoHelper.convertToObjectId(userId);
    adminId = mongoHelper.convertToObjectId(adminId);
    Conversation.makeAdmin(groupId, userId, adminId, cb);
}

channelService.delete = (channelId, userId, cb) => {
    channelId = mongoHelper.convertToObjectId(channelId);
    userId = mongoHelper.convertToObjectId(userId);
    Conversation.delete(channelId, userId, cb);
}
module.exports = channelService;