var basicHelper = require('../helpers/basicHelper');

module.exports = function () {
    var $project = {};
    var queryObject = [];

    this.setMatch = (match) => {
        queryObject.push({$match : match});
    }

    this.setUnwind = (unwind) => {
        queryObject.push({$unwind : '$' + unwind});
    }

    this.setLimit = (limit) => {
        queryObject.push({$limit : limit});
    }

    this.setLookup = (lookup) => {
        queryObject.push({$lookup : lookup});
    }

    this.setGroup = (group) => {
        queryObject.push({$group : group});
    }

    this.setAddFields = (addFields) => {
        queryObject.push({$addFields : addFields});
    }

    this.setProject = (project) => {
        //$project = project;
        queryObject.push({$project : project});
    }

    this.getQueryObject = () => {

        // if(basicHelper.isEmpty($project) == false){
        //     queryObject.push({
        //         $project : $project
        //     });
        // }

        return queryObject;
    }
};