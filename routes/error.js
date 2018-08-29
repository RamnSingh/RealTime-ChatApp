var express = require('express');

var User = require('../models/user');
var router = express.Router();
var statusCodes = ['403','404'];

router.get('/:statusCode', (req, res) => {
    var statusCode = req.params.statusCode;
    if(statusCodes.indexOf(statusCode) != -1){        
        res.render('error/' + statusCode);
    }else{
        res.render('error/404');
    }
})

module.exports = router;