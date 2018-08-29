var mongoose = require('mongoose');
var User = require('./user');
var RequestSchema = mongoose.Schema({
    requestedById: {
        type: mongoose.Schema.Types.ObjectId
    },
    requestedToId: {
        type : mongoose.Schema.Types.ObjectId
    },
    requestedOn:{
        type: Date
    },
    acceptedOn: {
        type: Date
    },
    refusedOn: {
        type: Date
    },
    isFriend: {
        type: Boolean
    },
    isPending: {
        type: Boolean
    },
    isBlocked: {
        type : Boolean
    }
});

var Request = mongoose.model('Request', RequestSchema);
var ObjectId = RequestSchema.ObjectId;

Request.where = (queryBuilderObj, cb) => {
    Request.aggregate(queryBuilderObj, cb);
}

Request.send = (request, cb) => {
    request.save(cb);
};

Request.accept = (requestId, requestedById, acceptingUserId, cb) => {
    Request.findById(requestId, (err, request) => {
        if(err){
            cb(err);
        }else{
            if(request){
                if(request.requestedById.toString() == requestedById.toString() && request.requestedToId.toString() == acceptingUserId.toString()){
                    Request.update({
                        _id : requestId
                    },{
                        isPending : false,
                        isFriend : true,
                        acceptedOn : new Date()
                    },{
                        upsert : true
                    }, cb);
                }else{
                    cb('Your request is not valid. Please refresh your page and try again');
                }
            }else{
                cb('The requested request has been deleted or it never existed');
            }
        }
    });
}

Request.delete = (requestId, requestedToId, requestedById, cb) => {
    Request.findById(requestId, (err, request) => {
        if(err){
            cb(err);
        }else{
            if(request){
                if(request.requestedById.toString() == requestedById.toString() && request.requestedToId.toString() == requestedToId.toString()){
                    request.remove(cb);
                }else{
                    cb('Your request is not valid. Please refresh your page and try again');
                }
            }else{
                cb('The requested request has been deleted or it never existed');
            }
        }
    });
}

Request.deleteByUsersIds = (userOneId, userTwoId, cb) => {
    Request.aggregate([{
        $match : {
            $or : [{
                $and : [{
                    requestedById : userOneId
                },{
                    requestedToId : userTwoId
                }]
            },{
                $and : [{
                    requestedById : userOneId
                },{
                    requestedToId : userOneId
                }]
            }]
        }
    }],(err, requests) => {
        if(err){
            cb(err);
        }else{
            var requestsIds = [];
            requests.forEach(request => {
                requestsIds.push(request._id);
            });

            Request.remove({
                _id : {
                    $in : requestsIds
                }
            }, cb);
        }
    });
}

module.exports = Request;