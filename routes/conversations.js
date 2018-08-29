var express = require('express');
var mongoose = require('mongoose');
var path = require('path');

var fileHelper = require('../helpers/fileHelper');
var StdResponse = require('../utilities/StdResponse');


var conversationService = require('../services/conversationService');

var router = express.Router();


router.post('/getStandardConversation', (req, res) => {
  var userId = req.body.userId;
  var createIfNotExist = req.body.createIfNotExist;
  var stdResponse;
   conversationService.getConversationByUsersIds(req.user._id, userId, createIfNotExist,  (err, conversation) => {
       if(err){
          return res.send(new StdResponse(false, ['Couldn\'t fetch the conversation']));
      }else{
          if(conversation){
              console.log(conversation)
              return res.send(new StdResponse(true, [], conversation).getResponse());
          }else{
              conversationService.create(req.user._id, userId, (err, newConversation) => {
                  if(err){
                      console.log('hello')
                      console.log(err)
                      stdResponse = new StdResponse(false, ['Problem ecounterd, please try again']);
                  }else{
                      console.log('new');
                      console.log(newConversation);
                      stdResponse = new StdResponse(true, [], newConversation);
                  }
                  return res.send(stdResponse.getResponse());
              })
          }
      }
   });
});

router.post('/getConversationById', (req, res) => {
    var conversationId = req.body.conversationId;
    var stdResponse;
    conversationService.getConversationById(conversationId, (err, conversation) => {
        if(err){
            return res.send(new StdResponse(false, ['Couldn\'t fetch the conversation']));
        }else{
            if(conversation){
                return res.send(new StdResponse(true, [], conversation).getResponse());
            }else{
                return res.send(new StdResponse(false, ['Problem ecounterd, please try again']).getResponse());
            }
        }
   });
});

router.post('/sendMessage', (req, res) => {
    var conversationId = req.body.conversationId;
    var message = req.body.message;

    var stdResponse;
    conversationService.sendMessage(conversationId, req.user._id, message, (err, newMessage) => {
        console.log('err');
        console.log(err);
        console.log('res');
        console.log(newMessage)
        if(err){
            stdResponse = new StdResponse(false, ['Couldn\'t send the message']);
        }else{
            stdResponse = new StdResponse(true, ['Message successfully sent'], newMessage);
        }
        return res.send(stdResponse.getResponse());
    });
});

router.post('/getMessages', (req, res) => {
    var conversationId = req.body.conversationId;
    var stdResponse;
    conversationService.getMessages(conversationId, (err, messages) => {
        console.log('err');
        console.log(err);
        console.log('res');
        console.log(messages)
        if(err){
            stdResponse = new StdResponse(false, ['Couldn\'t send the message']);
        }else{
            stdResponse = new StdResponse(true, [''], messages);
        }
        return res.send(stdResponse.getResponse());
    });
});

module.exports = router;
