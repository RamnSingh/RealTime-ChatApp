var passportLocal = require('passport-local');
var userService = require('../services/userService');
var localStrategy = new passportLocal.Strategy((username, password, doneCb) => {
    userService.getUserByUsername(username, (err, user) => {
        if(!user){
            return doneCb(null, false, {
                message : 'Unknown user'
            });
        }

        userService.comparePassword(password, user.password, (err, isMatch) => {
            if(!isMatch){
                return doneCb(null, false, {
                message : 'Invalid password'
                });
            }
            return doneCb(null, user);
        });
    });
});

module.exports = localStrategy;
