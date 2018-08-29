var express = require('express');

var User = require('../models/user');
var Request = require('../models/request');
var requestService = require('../services/requestService');

var StdResponse = require('../utilities/StdResponse');
var router = express.Router();

router.get('/', (req, res) => {
    requestService.getAllByUser(req.user._id, (err, result) =>{
        if(err){
            res.render('request/index');
        }else{
            res.render('request/index', {
                requests : result
            });
        }
    });
});

router.post('/send', (req, res) => {
     requestService.send(req.user._id, req.body.requestedToId, (err, response) => {
        if(err) {
                stdResponse = new StdResponse(false, ['Something went wrong']);
        }else{
            stdResponse = new StdResponse(true, ['Request has been sent']);
        }
        return res.send(stdResponse.getResponse());
    });
});

router.post('/accept', (req, res) => {
    requestService.accept(req.body.requestId, req.body.requestedById, req.user._id, (err, response) => {
        console.log(err)
        if(err) {
            stdResponse = new StdResponse(false, [typeof err == 'string' ? err : 'Something went wrong']);
        }else{
            stdResponse = new StdResponse(true, ['You\'ve successfully accepted this request']);
        }
        return res.send(stdResponse.getResponse());
    });
});


router.post('/deny', (req, res) => {
    requestService.deny(req.body.requestId, req.body.requestedById, req.user._id, (err, response) => {
        if(err) {
            stdResponse = new StdResponse(false, [typeof err == 'string' ? err : 'Something went wrong']);
        }else{
            stdResponse = new StdResponse(true, ['Request has been succefully denied']);
        }
        return res.send(stdResponse.getResponse());
    });
});

router.post('/delete', (req, res) => {
     requestService.delete(req.body.requestId, req.body.requestedToId, req.user._id, (err, response) => {
        if(err) {
            stdResponse = new StdResponse(false, [typeof err == 'string' ? err : 'Something went wrong']);
        }else{
            stdResponse = new StdResponse(true, ['You\'re request has been deleted']);
        }
        return res.send(stdResponse.getResponse());
    });
});

module.exports = router;