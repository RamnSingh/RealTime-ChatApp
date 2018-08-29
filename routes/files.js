var express = require('express');
var path = require('path');
var mime = require('mime');
var fs = require('fs');

var fileHelper = require('../helpers/fileHelper');
var StdResponse = require('../utilities/StdResponse');

var router = express.Router();

router.post('/upload', (req, res) => {
    var stdResponse;
    if(req.files != undefined){
        var file = req.files.file;

        if(file){
            var fileNameArr = file.name.split('.');
            var fileExt = fileNameArr[fileNameArr.length - 1];
            fileName = new Date().valueOf() + "." + fileExt;
            filePath = path.join(fileHelper.getfilesUploadFolderForUser(req.user.username), fileName);
            fileHelper.filesDirectorySetupForUser(req.user.username);
            file.mv(filePath, (err) => {
                if(err){
                    stdResponse = new StdResponse(false, ['Couldn\'t upload the file. Please try again']);
                }else{
                    stdResponse = new StdResponse(true, ['File uploaded successfully.'], fileName);
                }

                return res.send(stdResponse.getResponse());

                
            });
        }else{
            return res.send(new StdResponse(false, ['There were nor file attached to the property \'file\'.']));
        }
    }else{
        return res.send( new StdResponse(false, ['There were nor file attached.']));
    }
});

router.get('/download/:fileName', function(req, res){

  var fileName = req.params.fileName;

  var filePath = path.join(fileHelper.getfilesUploadFolderForUser(req.user.username), fileName);

  filename = path.basename(filePath);
  var mimetype = mime.lookup(filePath);

  res.setHeader('Content-disposition', 'attachment; filename=' + filename);
  res.setHeader('Content-type', mimetype);

  var filestream = fs.createReadStream(filePath);
  filestream.pipe(res);
});

module.exports = router;