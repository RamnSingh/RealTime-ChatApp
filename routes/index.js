var express = require('express');
var passport = require('passport');
var User = require('../models/user');
var Request = require('../models/request');

var router = express.Router();

// Get Homepage
router.get('/', (req, res) =>{
    //res.render('homepage');
    if(req.user){
        res.render('homepage');
    }else{
        res.render('index');
    }
});

module.exports = router;