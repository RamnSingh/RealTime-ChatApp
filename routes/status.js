var express = require('express');

var User = require('../models/user');
var StdResponse = require('../utilities/StdResponse');

var router = express.Router();

router.post('/update', (req, res) => {
    if(req.user){
        var status = req.body.status;
        var isCustomStatus = req.body.isCustomStatus;
        var userId = req.user._id;

        var stdResponse;
        User.updateStatus(status, isCustomStatus, userId, (err) => {
            if(err){
                stdResponse = new StdResponse(false, ['Couldn\'t add the custom status']);
            }else{
                stdResponse = new StdResponse(true, ['Custom status has been updated']);
            }
            return res.json(stdResponse.getResponse());
        })

    }else{
        res.redirect('/');
    }
});

module.exports = router;