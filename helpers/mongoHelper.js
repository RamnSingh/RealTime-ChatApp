var mongoose = require('mongoose');
var mongoeHelper = {};

mongoeHelper.convertToObjectId = (id) => {
    return typeof id == 'string' ? mongoose.Types.ObjectId(id) : id;
}

module.exports = mongoeHelper;