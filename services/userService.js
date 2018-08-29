var mongoose = require('mongoose');

var User = require('../models/user');
var Request = require('../models/request');
var QueryBuilder = require('../utilities/QueryBuilder');

var mongoHelper = require('../helpers/mongoHelper');
var userService = {};

userService.getAllByUsernameKeyword = (usernameKeyword, requestingUserId, cb) => {
    requestingUserId = mongoHelper.convertToObjectId(requestingUserId);
    var queryObj = new QueryBuilder();
    
    queryObj.setMatch({
        username : {
            $regex : new RegExp('^' + usernameKeyword, 'i')
        },
        _id : {$ne : requestingUserId}
    });
    
    queryObj.setLookup({
        from : 'requests',
        localField : '_id',
        foreignField : 'requestedById',
        as : 'sentRequest',
    });
    queryObj.setLookup({
        from : 'requests',
        localField : '_id',
        foreignField : 'requestedToId',
        as : 'recievedRequest',
    });
    queryObj.setProject({
        fullName : 1,
        username : 1,
        email : 1,
        sentRequest : 1,
        recievedRequest : 1,
        profileImage : 1
    });
    User.where(queryObj.getQueryObject(), (err, users) => {
        if(err){
            cb(err);
        }else{
            var usersFormattedArray = [];
            
            for(var userIndex = 0; userIndex < users.length; userIndex++){
                var user  = {
                    _id : users[userIndex]._id,
                    fullName : users[userIndex].fullName,
                    username : users[userIndex].username,
                    email : users[userIndex].email,
                    profileImage : users[userIndex].profileImage
                };

                if(users[userIndex].sentRequest){
                    for(var requestIndex = 0; requestIndex < users[userIndex].sentRequest.length; requestIndex++){
                        if(users[userIndex].sentRequest[requestIndex].requestedToId.toString() == requestingUserId.toString()){
                            if(users[userIndex].sentRequest[requestIndex].isFriend){
                                user.isFriend = users[userIndex].sentRequest[requestIndex].isFriend;
                                break;
                            }
                            user.sentRequest = users[userIndex].sentRequest[requestIndex];
                            break;
                        }
                    }
                }
                
                if(user.isFriend != true && user.sentRequest == undefined && users[userIndex].recievedRequest != undefined){
                    for(var requestIndex = 0; requestIndex < users[userIndex].recievedRequest.length; requestIndex++){
                        if(users[userIndex].recievedRequest[requestIndex].requestedById.toString() == requestingUserId.toString()){
                            if(users[userIndex].recievedRequest[requestIndex].isFriend){
                                user.isFriend = users[userIndex].recievedRequest[requestIndex].isFriend;
                                break;
                            }
                            user.recievedRequest = users[userIndex].recievedRequest[requestIndex];
                            break;
                        }
                    }
                }

                usersFormattedArray.push(user);
            }

            cb(undefined, usersFormattedArray);
        }
    });

}

userService.getUserByUsername = (username, cb) => {
    var queryObj = new QueryBuilder();
    queryObj.setMatch({
        username : username
    });
    User.where(queryObj.getQueryObject(), (err, result) => {
        if(err){
            cb(err);
        }else{
            if(result[0] != undefined){
                cb(undefined, result[0]);
            }else{
                cb('Couldn\'t find any user.');
            }
        }
    });
}

userService.getUserById = (userId, cb) => {
    userId = mongoHelper.convertToObjectId(userId);
    var queryObj = new QueryBuilder();
    queryObj.setMatch({
        _id : userId
    });
    User.where(queryObj.getQueryObject(), (err, result) => {
        if(err){
            cb(err);
        }else{
            if(result[0] != undefined){
                cb(undefined, result[0]);
            }else{
                cb('Couldn\'t find any user.');
            }
        }
    });
}

userService.updateProfile = (user, cb) => {
    User.updateProfile(user, cb);
}

userService.renameFriendName = (friendId, newUsername, userId, cb) => {
    friendId = mongoHelper.convertToObjectId(friendId);
    userId = mongoHelper.convertToObjectId(userId);
    User.renameFriendName(friendId, newUsername, userId, cb);
}

userService.removeFriend = (friendId, userId, cb) => {
    friendId = mongoHelper.convertToObjectId(friendId);
    userId = mongoHelper.convertToObjectId(userId);
    User.removeFriend(friendId, userId, (err) => {
        if(err){
            cb(err);
        }else{
            User.removeFriend(userId, friendId, (err) => {
                if(err){
                    cb(err);
                }else{
                    Request.deleteByUsersIds(userId, friendId, cb);
                }
            });
        }
    });
}

userService.getAllFriendsByUserId = (userId, cb) => {
    userId = mongoHelper.convertToObjectId(userId);
    var queryBuilder = new QueryBuilder();
    queryBuilder.setMatch({
        _id : userId
    });
    queryBuilder.setUnwind('friends');
    queryBuilder.setAddFields({
        customUsername : 'friends.customUsername'
    });
    queryBuilder.setLookup({
        from : 'users',
        localField : 'friends.id',
        foreignField : '_id',
        as : 'friend'
    });
    queryBuilder.setUnwind('friend');
    queryBuilder.setAddFields({
        'friend.customUsername' : '$friends.customUsername'
    });
    queryBuilder.setGroup({
        '_id' : '$_id',
        'friends' : { 
            $push : '$friend'
        }
    });
    queryBuilder.setProject({
        friends : 1,
        _id : 0
    });

    
    //queryBuilder.setUnwind('friend');
    User.where(queryBuilder.getQueryObject(), (err, result) => {
        if(err){
            cb(err);
        }else{
            if(result[0] == undefined || result[0].friends == undefined){
                cb(undefined, []);
            }else{
                cb(undefined, result[0].friends);
            }
        }
    });
}

userService.comparePassword = (password, hash, cb) => {
    User.comparePassword(password, hash, cb);
}

module.exports = userService;