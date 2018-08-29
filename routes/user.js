var express = require('express');
var path = require('path');

// var quickthumb = require('quickthumb');
var userService = require('../services/userService');
var fileHelper = require('../helpers/fileHelper');
var StdResponse = require('../utilities/StdResponse');

var router = express.Router();

router.get('/:username', (req, res) => {
    var username = req.params.username;
    if(username != undefined && username != null && username.trim() != ""){
        userService.getUserByUsername(username, (err, user) => {
            if(err){
                res.redirect('/');
            }else{
                if(user){
                    if(req.user._id.toString() == user._id.toString()){
                        user.isCurrentUser = true
                    }
                    res.render('user/index', {
                        profile : user
                    });
                }else{
                    res.redirect('/');
                }
                
            }
        });
    }else{
        res.redirect('/');
    }
});

router.route('/profile/edit/:username').
    get((req, res) => {
        var username = req.params.username;
        if(username != undefined && username != null && username.trim() != ""){
            res.render('user/editProfile');
        }else{
            res.redirect('/');
        }
    }).post((req, res) => {
        var username = req.params.username;
        var profileImage = undefined;
        if(req.files){
            if(req.files.profileImage){
                profileImage = req.files.profileImage;
            }
        }
        var fullName = req.body.fullName;
        var dateOfBirth = req.body.dateOfBirth;
        var location = req.body.location;
        var aboutMe = req.body.aboutMe;
        
        var isProfileImageSaved = false;
        var profileImagePath;
        var profileImageName;


        userService.getUserById(req.user._id, (err, user) => {

            if(err){
                req.flash('error', 'Something went wrong. Please try again.');
                res.redirect('/user/profile/edit/' + username);
            }else{
                user.fullName = fullName;
                user.dateOfBirth = dateOfBirth;
                user.location = location;
                user.aboutMe = aboutMe;

                if(profileImage){
                    var profileImageNameArr = profileImage.name.split('.');
                    var profileImageExt = profileImageNameArr[profileImageNameArr.length - 1];
                    profileImageName = req.user.username + "." + profileImageExt;
                    profileImagePath = path.join(fileHelper.getProfileImageFolder(), profileImageName);
                    fileHelper.profileImageDirectorySetup();
                    profileImage.mv(profileImagePath, (err) => {
                        if(err){
                            req.flash('error', 'Profile image couldn\'t uploaded');
                            res.redirect('/user/profile/edit/' + user.username);
                        }else{
                            user.profileImage = profileImageName;
                            updateProfileInfo(user, req, res);
                        }

                        
                    });
                }else{
                    updateProfileInfo(user, req, res);
                }
            }
            
        });
    });

var updateProfileInfo = (user, req, res) => {
    userService.updateProfile(user, (err, result) => {
        if(err){
            req.flash('error', 'Something went wrong. Please try again.');
            res.redirect('/user/profile/edit/' + user.username);
        }else{
            req.user = result;
            req.flash('success_msg', 'Your profile has been updated');
            res.redirect('/user/profile/edit/' + user.username);
        }
    });
}

module.exports = router;