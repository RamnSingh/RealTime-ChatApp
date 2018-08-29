var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/chatApp');
var db = mongoose.connection;
db.on('error', () =>{
    //console.log("Couldn't connect to database");
    // Redirect to the homepage
});

var conversationSchema = mongoose.Schema({
    members : {
      type : Array
    },
    allMembers : {
      type : Array
    },
    type : {
        type : String
    },
    createdOn : {
        type : Date
    },
    admins : {
      type : Array
    },
    name : {
      type : String
    },
    createdById : {
      type : mongoose.Schema.Types.ObjectId
    },
    description : {
      type : String
    }
});

var Conversation = mongoose.model('Conversation', conversationSchema);

Conversation.createNew = (conversationObj,  cb) => {
  conversationObj.createdOn = new Date();
  conversationObj.save(cb);

}

Conversation.where = (queryBuilderObj, cb) => {
  Conversation.aggregate(queryBuilderObj, cb);
}

Conversation.join = (conversationId, users, cb) => {
  Conversation.findById(conversationId, (err, con) => {
    if(err){
      cb('The conversation id is not valid');
    }else{
      if(con){
        if((users.constructor == Array) == false){
          users = [users];
        }
        Conversation.update(
          {
             _id: conversationId
          }, 
          {
            $push: {
                members: { $each : users }
            },
            $addToSet : {
              allMembers  : {
                $each : users
              }
            }
          }, cb
        );
      }else{
        cb('The conversation id is not valid');
      }
    }
  })
}

Conversation.addUserToConversation = (conversationId, userId, adminId, cb) => {
  Conversation.isUserAdmin(conversationId, adminId, (err, isUserAdmin) => {
    Conversation.isUserAdmin(conversationId, adminId, (err, isUserAdmin) => {
     if(err){
       cb(err);
     }else{
       if(isUserAdmin){
        Conversation.join(conversationId, userId, cb);
       }else{
         cb('You\re not administrator of the group');
       }
     }
  });
  });
}

Conversation.leave = (conversationId, userId, cb) => {
  Conversation.findById(conversationId, (err, con) => {
    if(err){
      cb('The conversation id is not valid');
    }else{
      if(con){
        if(con.admins.length == 1 && con.admins.find(adminId => adminId.toString() == userId.toString()) != undefined){
          cb('You\'re the only administrator of this group. Whether you can make someone admin of the group then leave the group or just delete the group');
        }else{
          Conversation.update(
            {
              _id: conversationId
            }, 
            {
              $pull: {
                  members: { $in: [userId] },
                  admins: { $in: [userId] }
              }
            }, cb
          );
        }
      }else{
        cb('The conversation id is not valid');
      }
    }
  })
}

Conversation.removeUserFromConversation = (conversationId, userId, adminId, cb) => {
  Conversation.isUserAdmin(conversationId, adminId, (err, isUserAdmin) => {
     if(err){
       cb(err);
     }else{
       if(isUserAdmin){
        Conversation.leave(conversationId, userId, cb);
       }else{
         cb('You\re not administrator of the group');
       }
     }
  });
}

Conversation.delete = (conversationId, adminId, cb) => {
  Conversation.isUserAdmin(conversationId, adminId, (err, isUserAdmin) => {
     if(err){
       cb(err);
     }else{
       if(isUserAdmin){
         Conversation.findById(conversationId, (err, conversation) => {
          if(err){
            return cb(err);
          }else{
            conversation.remove(cb);
          }
        })
       }else{
         cb('You\re not administrator of the group');
       }
     }
  });
}

Conversation.makeAdmin = (conversationId, userId, adminId, cb) => {
  Conversation.isUserAdmin(conversationId, adminId, (err, isUserAdmin) => {
    if(err){
      console.log(err);
      cb(err);
    }else{
      if(isUserAdmin){
        Conversation.findById(conversationId, (err, con) => {
      if(err){
        cb('The conversation id is not valid');
      }else{
        if(con){
          if(con.members.find(memberId => memberId.toString() == userId.toString()) != undefined){
            Conversation.update(
              {
                _id: conversationId
              }, 
              {
                $push: {
                    admins: userId
                }
              }, cb
            );
          }else{
            cb('The user is not member of the group');
          }
          }else{
            cb('The conversation id is not valid');
          }
        }
      })
    }else{
      cb('You\'re administrator of the group');
      }
    }
  });
}

Conversation.isUserAdmin = (conversationId, userId, cb) => {
  Conversation.findById(conversationId, (err, conversation) => {
    if(err){
      cb(err);
    }else{
      cb(undefined, conversation.admins.find((admin) => admin.toString() == userId.toString()) != undefined ? true : false);
      
    }
  });
}

module.exports = Conversation;
