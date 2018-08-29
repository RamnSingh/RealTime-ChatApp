var fs = require('fs');
var os = require('os');
var path = require('path');
var rootFolder = os.platform() == 'win32' ? 'C:/' : '/';
    var appMainFolder = path.join(rootFolder, 'nodeChatApp');
    var filesFolder = path.join(appMainFolder, 'files');
    var profileImageFolder = path.join(appMainFolder, 'profileImage');

module.exports.profileImageDirectorySetup = () => {

    var appMainFolderExists = fs.existsSync(appMainFolder);

    if(appMainFolderExists == false){
        fs.mkdirSync(appMainFolder);
    }

    var profileImageFolderExists = fs.existsSync(profileImageFolder);

    if(profileImageFolderExists == false){
        fs.mkdirSync(profileImageFolder);
    }
};

module.exports.filesDirectorySetupForUser = (username) => {
    var appMainFolderExists = fs.existsSync(appMainFolder);

    if(appMainFolderExists == false){
        fs.mkdirSync(appMainFolder);
    }

    var filesFolderExists = fs.existsSync(filesFolder);

    if(filesFolderExists == false){
        fs.mkdirSync(filesFolder);
    }

    var userFilesFolder = path.join(filesFolder, username);
    var userFilesFolderExists = fs.existsSync(userFilesFolder);
    if(userFilesFolderExists == false){
        fs.mkdirSync(userFilesFolder);
    }
}

module.exports.getProfileImageFolder = () => {
    return profileImageFolder;
};

module.exports.getfilesUploadFolderForUser = (username) => {
    return path.join(filesFolder, username);
}

module.exports.getBaseFilesFolder = () => {
    return filesFolder;
}