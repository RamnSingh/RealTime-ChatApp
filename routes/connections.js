var express = require('express');
var StdResponse = require('../utilities/StdResponse');
//var User = require('../models/user');

var router = express.Router();

// Get Homepage
router.get('/getAllConnectedUsers', (req, res) =>{
    res.send(req.app.locals.connectedUsers);
});

router.post('/getAllConnectedFriendsForUser', (req, res) => {
    var stdResponse;
    var connectedFriendsForUser = [];
    var userId = req.body.userId;
    if(req.app.locals.connectedUsers && userId != undefined){
        req.app.locals.connectedUsers.forEach((connectedUser) => {
            if(connectedUser.friends){
                if(connectedUser.friends.findIndex(friend => friend.id.toString() == userId.toString()) != -1){
                    connectedFriendsForUser.push(connectedUser);
                }
            }
        });
        console.log(connectedFriendsForUser);
        return res.send(new StdResponse(true, [], connectedFriendsForUser).getResponse());
    }else{
        return res.send(new StdResponse(false, []).getResponse());
    }
});

module.exports = router;