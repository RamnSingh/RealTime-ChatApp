var mongoose = require('mongoose');

var Request = require('../models/request');
var User = require('../models/user');
var QueryBuilder = require('../utilities/QueryBuilder');
var userService = require('../services/userService');
var mongoHelper = require('../helpers/mongoHelper');

var requestService = {};

requestService.getAllByUser = (userId, cb) => {
    userId = mongoHelper.convertToObjectId(userId);
    var queryObj = new QueryBuilder();
    queryObj.setMatch({
        $and : [
            {
                $or : [
                    {'requestedToId' : userId},
                    {'requestedById' : userId}
                ]
            },
            {
                "isFriend" : {
                    '$exists' : false
                }
            }
        ]
    });
    queryObj.setLookup({
        from : 'users',
        localField: 'requestedById',
        foreignField: '_id',
        as: 'requestedBy'
    });
    queryObj.setUnwind('requestedBy');
    queryObj.setLookup({
        from : 'users',
        localField: 'requestedToId',
        foreignField: '_id',
        as: 'requestedTo'
    });
    queryObj.setUnwind('requestedTo');
    Request.where(queryObj.getQueryObject(), (err, requests) => {
        if(err){
            cb(err);
        }else {
            for(var i = 0; i < requests.length; i++){
                if(requests[i].requestedById.toString() == userId.toString()){
                    requests[i].requestedBy = undefined;
                }else{
                    requests[i].requestedTo = undefined;
                }
            }

            cb(undefined, requests);
        }
    });
}

requestService.send = (requestedById, requestedToId, cb) => {
    requestedById = mongoHelper.convertToObjectId(requestedById);
    requestedToId = mongoHelper.convertToObjectId(requestedToId);

    var request = new Request();
    request.requestedById = requestedById;
    request.requestedToId = requestedToId;
    request.requestedOn = new Date();
    request.isPending = true;
    request.isRefused = false;
    Request.send(request, cb);
}

requestService.accept = (requestId, requestedById, acceptingUserId, cb) => {
    requestId = mongoHelper.convertToObjectId(requestId);
    requestedById = mongoHelper.convertToObjectId(requestedById);
    acceptingUserId = mongoHelper.convertToObjectId(acceptingUserId);
    Request.accept(requestId, requestedById, acceptingUserId, (err) => {
        if(err){
            cb(err);
        }else{
            console.log(userService.ok);
            User.addUserToUsersFriendList(requestedById, acceptingUserId, (err) => {
                if(err){
                    cb(err);
                }else{
                    User.addUserToUsersFriendList(acceptingUserId, requestedById, cb);
                }
            });
        }
    });
}

requestService.deny = (requestId, requestedById, deniedById, cb) => {
    requestService.delete(requestId, deniedById, requestedById, cb);
}

requestService.delete = (requestId, requestedToId, requestedById, cb) => {
    requestId = mongoHelper.convertToObjectId(requestId);
    requestedToId = mongoHelper.convertToObjectId(requestedToId);
    requestedById = mongoHelper.convertToObjectId(requestedById);
    Request.delete(requestId, requestedToId, requestedById, cb);
}

module.exports = requestService;