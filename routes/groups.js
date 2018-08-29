var express = require('express');
var groupService =  require('../services/groupService');
var Conversation = require('../models/conversation');

var router = express.Router();
var StdResponse = require('../utilities/StdResponse');
// Get Homepage
router.get('/', (req, res) =>{
    res.render('groups/index');
});

router.route('/create').get((req, res) => {
    res.render('groups/create');
}).post((req, res) => {
    groupService.create(req.body.groupName, req.body.groupMembers, req.user._id, (err) => {
        if(err){
            req.flash('error_msg', 'Something went wrong. Please try again');
            res.redirect('/groups/create');
        }else{
            req.flash('success_msg', 'New group has been created successfully');
            res.redirect('/groups');
        }
    });
});

router.route('/manage').get((req, res) => {
    groupService.getAllByMember(req.user._id, (err, groups) => {
             if(err) {
                 console.log(err);
                 res.render('groups/manage', {
                    error_msg : 'Couldn\'t fetch the list of groups'
                });
            }else{
                console.log(groups);
                groups.forEach((group) => {
                    group.isMember = group.membersObjects == undefined ? false : group.membersObjects.find(member => member._id.toString() == req.user._id.toString()) !=  undefined;
                    group.isAdmin = group.isMember == true ? group.admins.find(adminId => adminId.toString() == req.user._id.toString()) != undefined ? true : false : false;
                });
                res.render('groups/manage', {
                    groups : groups
                });
            }
        });
});

router.get('/getAllGroups', (req, res) =>{
    var stdResponse;
    groupService.getAllByMember(req.user._id, (err, groups) => {
        if(err) {
            stdResponse = new StdResponse(false, ['Something went wrong']);
        }else{
            stdResponse = new StdResponse(true, [], groups);
        }
        return res.send(stdResponse.getResponse());
    });
});

router.post('/getAllMembers', (req, res) => {
    var stdResponse;
    groupService.getAllMembers(req.body.groupId, (err, result) => {
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

router.post('/addUserToGroup', (req, res) => {
    groupService.isUserAdmin(req.body.groupId, req.user._id, (err, isUserAdmin) => {
        if(err){
            return res.send(new StdResponse(false, ['Something went wrong']).getResponse());
        }else{
            if(isUserAdmin){
                groupService.addUserToGroup(req.body.groupId, req.body.userId, req.user._id, (err) => {
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
    groupService.leave(req.body.groupId, req.user._id, (err) => {
        if(err) {
            stdResponse = new StdResponse(false, [typeof err == 'string' ? err : 'Something went wrong']);
        }else{
            stdResponse = new StdResponse(true, []);
        }
        return res.send(stdResponse.getResponse());
    });
});

router.post('/removeUserFromGroup', (req, res) => {
    groupService.isUserAdmin(req.body.groupId, req.user._id, (err, isUserAdmin) => {
        if(err){
            return res.send(new StdResponse(false, ['Something went wrong']).getResponse());
        }else{
            if(isUserAdmin){
                groupService.removeUserFromGroup(req.body.groupId, req.body.userId, req.user._id, (err) => {
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
     groupService.isUserAdmin(req.body.groupId, req.user._id, (err, isUserAdmin) => {
        if(err){
            return res.send(new StdResponse(false, ['Something went wrong']).getResponse());
        }else{
            if(isUserAdmin){
                groupService.makeAdmin(req.body.groupId, req.body.userId, req.user._id, (err) => {
                    if(err) {
                        return res.send(new StdResponse(false, [typeof err == 'string' ? err : 'Something went wrong']).getResponse());
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

router.post('/delete', (req, res) => {
     groupService.isUserAdmin(req.body.groupId, req.user._id, (err, isUserAdmin) => {
        if(err){
            return res.send(new StdResponse(false, ['Something went wrong']).getResponse());
        }else{
            if(isUserAdmin){
                groupService.delete(req.body.groupId, req.user._id, (err) => {
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