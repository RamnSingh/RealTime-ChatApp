var express = require('express');
var channelService =  require('../services/channelService');

var router = express.Router();
var StdResponse = require('../utilities/StdResponse');


/**
 * Rendering Channels Homepage
 */
router.get('/', (req, res) =>{
    res.render('channels/index');
});

router.get('/getAll', (req, res) => {
    var stdResponse;
    channelService.getAll((err, channels) => {
        if(err) {
            stdResponse = new StdResponse(false, ['Couldn\'t fetch the list of channels']);
        }else{
            channels.forEach((channel) => {
                channel.isMember = channel.members == undefined ? false : channel.members.find(memberId => memberId.toString() == req.user._id.toString()) !=  undefined;
                channel.isAdmin = channel.isMember == true ? channel.admins.find(adminId => adminId.toString() == req.user._id.toString()) != undefined ? true : false : false;
            });
            stdResponse = new StdResponse(true, [], channels);
        }

        res.send(stdResponse.getResponse());
    });
});

/**
 * Creating a new channel
 */
router.route('/create')
.get((req, res) => {
    res.render('channels/create');
}).post((req, res) => {
    channelService.create(req.body.channelName, req.body.channelDescription, req.user._id, (err) => {
        if(err){
            res.render('channels/create');
        }else{
            req.flash('success_msg', 'New group has been created successfully');
            res.redirect('/channels');
        }
    });
});

router.route('/manage').get((req, res) => {
    channelService.getAll((err, channels) => {
             if(err) {
                 res.render('channels/manage', {
                    error_msg : 'Couldn\'t fetch the list of channels'
                });
            }else{
                channels.forEach((channel) => {
                    channel.isMember = channel.members == undefined ? false : channel.members.find(memberId => memberId.toString() == req.user._id.toString()) !=  undefined;
                    channel.isAdmin = channel.isMember == true ? channel.admins.find(adminId => adminId.toString() == req.user._id.toString()) != undefined ? true : false : false;
                });
                res.render('channels/manage', {
                    channels : channels
                });
            }
        });
});


router.get('/getAllByMember', (req, res) =>{
     var stdResponse;
    channelService.getAllByMember(req.user._id, (err, channels) => {
            if(err) {
                stdResponse = new StdResponse(false, ['Something went wrong']);
        }else{
            stdResponse = new StdResponse(true, [], channels);
        }
        return res.send(stdResponse.getResponse());
    });
});

router.post('/getAllMembers', (req, res) => {
    var stdResponse;
    channelService.getAllMembers(req.body.channelId, (err, result) => {
        if(err){
            stdResponse = new stdResponse(false, ['Something went wrong']);
        }else{
            console.log(result)
            if(result.membersObjects.length == 0){
                stdResponse = new stdResponse(false, ['This group has no member']);
            }else{
                result.membersObjects.forEach((member) => {
                    member.isMember = true;
                    member.isAdmin = result.admins.find(adminId => adminId.toString() == member._id.toString()) != undefined ? true : false;
                });
                stdResponse = new StdResponse(true, [], result.membersObjects);
            }
        }
        return res.send(stdResponse.getResponse());
    });
});

router.post('/join', (req, res) => {
    var stdResponse;
    channelService.join(req.body.channelId, req.user._id, (err) => {
        if(err) {
                stdResponse = new StdResponse(false, ['Something went wrong']);
        }else{
            stdResponse = new StdResponse(true, []);
        }
        return res.send(stdResponse.getResponse());
    });
});

router.post('/removeUserFromChannel', (req, res) => {
    channelService.isUserAdmin(req.body.channelId, req.user._id, (err, isUserAdmin) => {
        if(err){
            return res.send(new StdResponse(false, ['Something went wrong']).getResponse());
        }else{
            if(isUserAdmin){
                channelService.removeUserFromChannel(req.body.channelId, req.body.userId, req.user._id, (err) => {
                    if(err) {
                        return res.send(new StdResponse(false, ['Something went wrong']).getResponse());
                    }else{
                        return res.send(new StdResponse(true, []).getResponse());
                    }
                });
            }else{
                return res.send(new StdResponse(false, ['You\'re not the administrator of the group']).getResponse());
            }
        }
    });
});

router.post('/leave', (req, res) => {
    var stdResponse;
    channelService.leave(req.body.channelId, req.user._id, (err) => {
        if(err) {
            stdResponse = new StdResponse(false, [typeof err == 'string' ? err : 'Something went wrong']);
        }else{
            stdResponse = new StdResponse(true, []);
        }
        return res.send(stdResponse.getResponse());
    });
});

router.post('/delete', (req, res) => {
     channelService.isUserAdmin(req.body.channelId, req.user._id, (err, isUserAdmin) => {
        if(err){
            return res.send(new StdResponse(false, ['Something went wrong']).getResponse());
        }else{
            if(isUserAdmin){
                channelService.delete(req.body.channelId, req.user._id, (err) => {
                    if(err) {
                        return res.send(new StdResponse(false, ['Something went wrong']).getResponse());
                    }else{
                        return res.send(new StdResponse(true, []).getResponse());
                    }
                });
            }else{
                return res.send(new StdResponse(false, ['You\'re not the administrator of the group']).getResponse());
            }
        }
    });
});

router.post('/makeAdmin', (req, res) => {
     channelService.isUserAdmin(req.body.channelId, req.user._id, (err, isUserAdmin) => {
        if(err){
            return res.send(new StdResponse(false, ['Something went wrong']).getResponse());
        }else{
            if(isUserAdmin){
                channelService.makeAdmin(req.body.channelId, req.body.userId, req.user._id, (err) => {
                    console.log(err);
                    if(err) {
                        return res.send(new StdResponse(false, ['Something went wrong']).getResponse());
                    }else{
                        return res.send(new StdResponse(true, []).getResponse());
                    }
                });
            }else{
                return res.send(new StdResponse(false, ['You\'re not the administrator of the group']).getResponse());
            }
        }
    });
});

module.exports = router;