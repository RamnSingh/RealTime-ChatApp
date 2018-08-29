var mongoose = require('mongoose');

var Conversation = require('../models/conversation');
var QueryBuilder = require('../utilities/QueryBuilder');

var mongoHelper = require('../helpers/mongoHelper');

var groupService = {};

groupService.isUserAdmin = (conversationId, userId, cb) => {
    conversationId = mongoHelper.convertToObjectId(conversationId);
    userId = mongoHelper.convertToObjectId(userId);
    Conversation.isUserAdmin(conversationId, userId, cb);
}

groupService.create = (name, members,  createdById, cb) => {
    if(members.constructor == Array){
        for(var i = 0; i < members.length; i++){
            members[i] = mongoHelper.convertToObjectId(members[i]);
        }
    }else{
        members = [mongoHelper.convertToObjectId(members)];
    }
    createdById = mongoHelper.convertToObjectId(createdById);
    members.push(createdById);
    var conversationObj = new Conversation();
    conversationObj.name = name;
    conversationObj.type = 'group';
    conversationObj.members = members;
    conversationObj.allMembers = members;
    conversationObj.createdById = createdById;
    conversationObj.admins = [createdById];
    Conversation.createNew(conversationObj, cb);
}

groupService.getAllByMember = (memberId, cb) => {
    memberId = mongoHelper.convertToObjectId(memberId);
    var queryObj = new QueryBuilder();
    queryObj.setMatch({
        members : {
            $in : [memberId]
        },
        type : 'group'
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
        "members": { "$push": "$members" },
        "membersObjects": { "$push": "$membersObjects" },
        "name" : { $first: '$name' },
        "createdOn" : { $first: '$createdOn' },
        "admins" : { $first: '$admins' },
        "createdBy" : { $first: '$createdBy' },
        "createdById" : { $first: '$createdById' }
    });
    Conversation.where(queryObj.getQueryObject(), cb);
}

groupService.getAllMembers = (groupId, cb) => {
    groupId = mongoHelper.convertToObjectId(groupId);
    var queryObj = new QueryBuilder();
    queryObj.setMatch({
        _id : groupId,
        type : 'group'
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

groupService.addUserToGroup = (groupId, userId, adminId, cb) => {
    groupId = mongoHelper.convertToObjectId(groupId);
    userId = mongoHelper.convertToObjectId(userId);
    adminId = mongoHelper.convertToObjectId(adminId);
    Conversation.addUserToConversation(groupId, userId, adminId, cb);
}

groupService.leave = (groupId, userId, cb) => {
    groupId = mongoHelper.convertToObjectId(groupId);
    userId = mongoHelper.convertToObjectId(userId);
    Conversation.leave(groupId, userId, cb);
}

groupService.removeUserFromGroup = (groupId, userId, adminId, cb) => {
    groupId = mongoHelper.convertToObjectId(groupId);
    userId = mongoHelper.convertToObjectId(userId);
    adminId = mongoHelper.convertToObjectId(adminId);
    Conversation.removeUserFromConversation(groupId, userId, adminId, cb);
}

groupService.makeAdmin = (groupId, userId, adminId, cb) => {
    groupId = mongoHelper.convertToObjectId(groupId);
    userId = mongoHelper.convertToObjectId(userId);
    adminId = mongoHelper.convertToObjectId(adminId);
    Conversation.makeAdmin(groupId, userId, adminId, cb);
}


groupService.delete = (groupId, adminId, cb) => {
    groupId = mongoHelper.convertToObjectId(groupId);
    adminId = mongoHelper.convertToObjectId(adminId);
    Conversation.delete(groupId, adminId, cb);
}

module.exports = groupService;