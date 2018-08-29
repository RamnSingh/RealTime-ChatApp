var express = require('express');
var passport = require('passport');
var Notification = require('../models/notification');

var notificationService = require('../services/notificationService');
var StdResponse = require('../utilities/StdResponse');
var router = express.Router();

router.post('/send', (req, res) =>{
    var sendBy = req.body.sendBy;
    var body = req.body.body;
    var sentTo = JSON.parse(req.body.sentTo);
    
    var stdResponse;

    if(sendBy && body && sentTo){
        notificationService.send(sendBy, body, sentTo, (err, notification) => {
            if(err){
                return res.send(new StdResponse(false, ['Something went wrong']).getResponse());
            }else{
                if(notification){
                    return res.send(new StdResponse(true, [], notification).getResponse());
                }else{
                    return res.send(new StdResponse(false, ['Something went wrong']).getResponse());
                }
            }
        });
    }else{
        return res.send(new StdResponse(false, ['Incorrect parameters send']).getResponse());
    }
});

router.post('/read', (req, res) =>{
    var notificationId = req.body.notificationId;
    var userId = req.body.userId;
    
    if(notificationId && userId){
        notificationService.read(notificationId, userId, (err) => {
            if(err){
                return res.send(new StdResponse(false, ['Something went wrong']).getResponse());
            }else{
                return res.send(new StdResponse(true, []).getResponse());
            }
        });
    }else{
        return res.send(new StdResponse(false, ['Incorrect parameters send']).getResponse());
    }
});

router.post('/getAll', (req, res) =>{
    var userId = req.body.userId;
    
    if(userId){
        notificationService.getAll(userId, (err, notifications) => {
            if(err){
                return res.send(new StdResponse(false, ['Something went wrong']).getResponse());
            }else{
                return res.send(new StdResponse(true, [], notifications).getResponse());
            }
        });
    }else{
        return res.send(new StdResponse(false, ['Incorrect parameters send']).getResponse());
    }
});

module.exports = router;