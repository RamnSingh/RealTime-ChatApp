var express = require('express');
var router = express.Router();

var userService = require('../services/userService');

router.get('/', (req, res) => {        
    var url = require('url');
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var keyword        = req.query.s;

    userService.getAllByUsernameKeyword(keyword, req.user._id, (err, users) => {
        if(err){
            res.render('search/index', {users : users});
        }else{
            console.log(users)
            res.render('search/index', {users : users});
        }
    });
});

module.exports = router;