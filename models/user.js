var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://127.0.0.1:27017/chatApp');
var db = mongoose.connection;
db.on('error', () =>{
    //console.log("Couldn't connect to database");
    // Redirect to the homepage
});

var UserSchema = mongoose.Schema({
    fullName: {
        type: String
    },
    username: {
        type : String,
        index: true
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    createdOn: {
        type: Date
    },
    status: {
        type: String
    },
    customStatus: {
        type: Array
    },
    dateOfBirth: {
        type: String
    },
    location: {
        type: String
    },
    aboutMe: {
        type: String
    },
    profileImage:{
        type: String
    },
    friends: {
        type : Array
    }
});

var User = mongoose.model('User', UserSchema);


User.register = (userObj, cb) => {
    hashPassword(userObj.password, (err, hash) => {
        userObj.password = hash;
        userObj.createdOn = new Date();
        userObj.status = "Open";
        userObj.save(cb);
    })
};

User.where = (queryBuilderObj, cb) => {
    User.aggregate(queryBuilderObj, cb);
}

User.comparePassword = (password, hash, cb) => {
    bcrypt.compare(password, hash, (err, isMatch) => {
        if(err) throw err;
        return cb(null, isMatch);
    });
};

User.resetPassword = (userId, newPassword, cb) => {
    hashPassword(newPassword, (err, hash) => {
        User.update({
            _id : userId,
        },{
            $set : {
                password : hash
            }
        }, cb);
    });
};

User.updateProfile = (user, cb) => {
    User.update({
            _id : user._id,
        },{
            $set : {
                profileImage : user.profileImage,
                fullName : user.fullName,
                dateOfBirth : user.dateOfBirth,
                location : user.location,
                aboutMe : user.aboutMe
            }
        }, cb);
};

User.addUserToUsersFriendList = (userId, newFriendId, cb) => {
    User.findById(userId, (err, user) => {
        if(err){
            cb(err);
        }else{
            if(user){
                User.findById(newFriendId, (err, friend) => {
                    if(err){
                        cb(err);
                    }else{
                        if(friend){
                            User.update({
                                _id : userId
                            },{
                                $push : {
                                    friends : {
                                        id : newFriendId
                                    }
                                }
                            },{
                                upsert : true
                            },cb);
                        }else{
                            cb('Either your request or your friend account is not valid');
                        }
                    }
                })
            }else{
                cb('Either your request or your account is not valid');
            }
        }
    })
}

User.renameFriendName = (friendId, newUsername, userId, cb) => {
    User.findById(userId, (err, user) => {
        if(err){
            cb(err);
        }else{
            if(user){
                var friendIndex = user.friends.findIndex(friend => friend.id.toString() == friendId.toString()) != undefined ? true : false;
                var e = "friends." + friendIndex + ".customUsername";
                if(friendIndex != -1){
                    User.update({
                        _id : userId,
                        "friends.id" : friendId,
                    },{
                        $set : {
                            "friends.$.customUsername" : newUsername
                        }
                    },{
                        upsert : true
                    },cb);
                }else{
                    cb('Request is not valid. Please try agaan');
                }
            }
        }
    });
}

User.removeFriend = (friendId, userId, cb) => {
    User.findById(userId, (err, user) => {
        if(err){
            cb(err);
        }else{
            if(user){
                var friend = user.friends.find(friend => friend.id.toString() == friendId.toString());

                user.update({
                    $pull : {
                        friends : {
                            $in : [friend]
                        }
                    }
                }, cb);
            }else{
                cb('You\'re request for removing friend is not valid. Please refresh your page and try again.');
            }
        }
    });
}

User.updateStatus = (status, isCustomStatus, userId, cb) => {
    if(isCustomStatus){
        User.update({
            _id : userId
        }, {
            $push : {
                customStatus : status
            },
            $set : {
                status : status
            }
        },{
            upsert : true
        }, cb);
    }else{
        User.update({
        _id : userId
        }, {
            $set : {
                status : status
            }
        },{
            upsert : true
        }, cb);
    }
}

var hashPassword = (password, cb) => {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, cb);
    })
};

module.exports = User;