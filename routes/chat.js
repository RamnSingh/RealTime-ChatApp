var express = require('express');
var passport = require('passport');
var User = require('../models/user');

var router = express.Router();

// Get Homepage
router.get('/', (req, res) =>{
    res.render('chat/chat');
});

module.exports = router;