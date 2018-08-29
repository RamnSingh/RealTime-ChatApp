var express = require('express');
var User = require('../models/user');
var userService = require('../services/userService');

var router = express.Router();
var StdResponse = require('../utilities/StdResponse');
// Get Homepage
router.get('/', (req, res) =>{
    if(req.user){
        userService.getAllFriendsByUserId(req.user._id, (err, friends) => {
            if(err){
                console.log(err);
                req.flash('error', 'Couldn\'t fetch your friend list. Please try again.');
                res.render('friends/index');
            }else{
                console.log(friends);
                res.render('friends/index', {
                    friends : friends
                });
            }
        });
    }else{
        res.render('index');
    }
});

router.post('/rename', (req, res) => {
    var stdResponse;
    userService.renameFriendName(req.body.friendId, req.body.newUsername, req.user._id, (err) => {
        if(err){
            stdResponse = new StdResponse(false, [typeof err == 'string' ? err : 'Something went wrong']);
        }else{
            stdResponse = new StdResponse(true, []);
        }
        return res.send(stdResponse.getResponse());
    });
});

router.post('/remove', (req, res) => {
    var stdResponse;
    userService.removeFriend(req.body.friendId, req.user._id, (err) => {
        console.log(err);
        if(err){
            console.log(err);
            stdResponse = new StdResponse(false, [typeof err == 'string' ? err : 'Something went wrong']);
        }else{
            stdResponse = new StdResponse(true, []);
        }
        return res.send(stdResponse.getResponse());
    });
});

router.get('/getAllFriends', (req, res) =>{
    userService.getAllFriendsByUserId(req.user._id, (err, friends) => {
        if(err) {
            stdResponse = new StdResponse(false, ['Something went wrong']);
        }else{
            stdResponse = new StdResponse(true, [], friends);
        }
        return res.send(stdResponse.getResponse());
    });
});

module.exports = router;