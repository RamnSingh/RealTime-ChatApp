var express = require('express');
var passport = require('passport');
var localStrategy = require('../passport/localStrategy');
var passwordSessioConfig = require('../passport/passportSessionConfig');

var User = require('../models/user');
passport.use(localStrategy);


var router = express.Router();
router.route('/register').
    get((req, res) => {
        res.render('account/register');
    }).
    post((req, res) => {
        var fullName        = req.body.fullName;
        var username        = req.body.username;
        var email           = req.body.email;
        var password        = req.body.password;
        var confirmPassword = req.body.confirmPassword;

        req.checkBody('fullName', 'Full name is required').notEmpty();
        req.checkBody('username', 'Username is required').notEmpty();
        req.checkBody('email', 'Email is required').notEmpty();
        req.checkBody('email', 'Email is not valid').isEmail();
        req.checkBody('password','Password is required').notEmpty();
        req.checkBody('confirmPassword', 'Confirm password is required').notEmpty();
        req.checkBody('confirmPassword', 'Confirm password doesn\'t match').equals(password);

        var validationErrors = req.validationErrors();

        if(validationErrors){
            res.render('account/register', {
                errors : validationErrors
            });
        }else{
            var user = new User({
                fullName : fullName,
                username : username,
                email : email,
                password : password
            });

            User.register(user, (err, user) => {
                if(err) throw err;
            });
            req.flash('success_msg', 'You are registered and can now login');
            res.redirect('/account/login');
        }
    });

router.route('/login').
    get((req, res) =>{
        res.render('account/login');
    }).post(passport.authenticate('local', {
        successRedirect : '/',
        failureRedirect : '/account/login',
        failureFlash : true
    }), (req, res) => {
        res.redirect('/');
    });

router.route('/resetpwd').
   get((req, res) => {
       if(req.user){
           res.render('account/resetPassword');
       }else{
           req.flash('error', 'You have to be logged in.');
           res.redirect('/account/login');
       }
   }).post((req, res) => {
       if(req.user){
            var currentPassword = req.body.currentPassword;
            var newPassword = req.body.newPassword;
            var confirmNewPassword = req.body.confirmNewPassword;

            if(newPassword == confirmNewPassword){
                User.findById(req.user._id, (err, user) => {
                    if(err){
                        req.flash('error', 'User not found. Please refresh the page or try later');
                    }else{
                        User.comparePassword(currentPassword, user.password, (err, isMatch) => {
                            if(err){
                                req.flash('error', 'Something went wrong. Please try again');
                                res.redirect('/account/resetpwd');
                            }else{
                                if(isMatch){
                                    User.resetPassword(user._id, newPassword, (err, result) => {
                                        if(err){
                                            req.flash('error', 'Couldn\'t update your password. Please try again');
                                            res.redirect('/account/resetpwd');
                                        }else{
                                            req.flash('success_msg', 'Your password has been succesfully updated');
                                            res.redirect('/account/resetpwd');
                                        }
                                    });
                                }else{
                                    req.flash('error', 'Your current password doesn\'t match with stored password. Please try again');
                                    res.redirect('/account/resetpwd');
                                }
                            }
                        });
                    }
                });
            }else{
                req.flash('error', 'Your new password doen\'t match with the Confirm new password');
                res.redirect('/account/resetpwd');
            }
       }else{
           res.redirect('/error/403');
       }

   });

router.get('/logout', (req, res) =>{
    req.logOut();

    req.flash('success_msg', 'You\'ve succesfully logged out');
    res.redirect('/account/login');
});

module.exports = router;