var passport = require('passport');
var userService = require('../services/userService');

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    userService.getUserById(id, (err, user) => {
        done(err, user);
    });
});