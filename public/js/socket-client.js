var baseUrl = window.location.origin;
var socket = io(baseUrl);


socket.on('connect', () => {
  cm_loggedUserId = $('#loggedUserId').val();
  cm_populateNotificationBox(cm_loggedUserId);
});

socket.on('updatedConnectedFriendsList', function(connectedUsers){
   
   if(window.location.pathname == "/"){
     updateHomepage();
   }else{
      cm_connectedUsers = connectedUsers;
     cm_getAllFriends(function(resp) {
        cm_friendsList = resp.data;        
        cm_friendsList.forEach(function(friend, index){
              connectedUsers.forEach(function(connectedUser){
                  if(friend._id.toString() == connectedUser._id.toString()){
                      friend.connected = true;
                      friend.peerId = connectedUser.peerId;
                  }
              });
          });
        }, null, 
        function(){
          updateGroups();
          updateChannels();
          cm_updateFriendListSidebar(cm_friendsList);
    });
   }
  });

function updateGroups(){
   cm_getAllGroups(function(res) {
      cm_groupsList = res.data;
    }, null, function(){
      $('#number-groups').text(cm_groupsList.length);
      cm_updateGroupsSidebar(cm_groupsList);
      $("#number-groups").addClass('animated bounce');
    });
}

function updateChannels() {
  cm_getAllChannelByMember(function(res) {
    cm_channelsList = res.data;
    console.log(cm_channelsList)
  }, null, function(){
     $('#number-channels').text(cm_channelsList.length);
    $("#number-channels").addClass('animated bounce');
    cm_updateChannelsSidebar(cm_channelsList);
  });
}


function sendMessageToSocket(conversationId, senderUsername, receiverId, message){
  socket.emit('sendMessage', {
    conversationId : conversationId,
    senderUsername : senderUsername,
    receiverId : receiverId,
    message : message
  });
}

function sendGroupMessageToPeer(conversationId, groupName, senderUsername, receiversIds, message){
  socket.emit('sendGroupMessage', {
    conversationId : conversationId,
    groupName : groupName,
    senderUsername : senderUsername,
    receiversIds : receiversIds,
    message : message
  });
}


socket.on('recieveMessage', function(data){
  addNewMessage(data);
});

$('#sendMessage').on('click', () =>{
  var message = $('#message').val().trim();
  if(message != ""){
    socket.emit('newMessage', {username : cm_loggedUsername, message : message});
    $('#message').val('');
  }else{
    alert("Veuillez saisir un  message");
  }
  
});



socket.on('newMessageBroadcast', (data) =>{
  var line = '<div style="text-align:left"><div class="badge badge-info">' + data.username + '</div>';
  line += '<div class="text-black">' + data.message + '</div></div>';
  $('#messageArea').append(line);
})


socket.on('dismissedCall', function(usersIds){
  if(usersIds.find(userId => userId.toString() == cm_loggedUserId.toString())){
        rejectCallBySocket();
    }
});

function socketDisconnect(){
  socket.emit('userDisconnected', cm_loggedUsername);
}

function dismissCallWithSockets(destPeersIds){
  socket.emit('dismissCall', destPeersIds);
}

function rejectCallWithSockets(peerId){
  socket.emit('rejectCall', peerId);
}

function acceptCallWithSocket(peerId){
  socket.emit('acceptCall', peerId);
}

socket.on('acceptedCall', function(userId){
  if(cm_loggedUserId.toString() == userId.toString()){
    acceptedCallBySocket();
  }
})

socket.on('rejectedCall', function(userId){
  if(cm_loggedUserId.toString() == userId.toString()){
    rejectedCallBySocket();
  }
})



// Notification

$(document).on('sendNotification', function(event, sentBy, notificationId, notificationBody, sentTo){
  socket.emit('sendNotification', {
    sentBy : sentBy,
    notificationId : notificationId,
    notificationBody : notificationBody,
    sentTo : sentTo
  });
});

socket.on('onNotification', function(data){
  if(data.recievers.find(userId => userId.toString() == cm_loggedUserId.toString())){
    addNotifications([{
      body : data.notificationBody,
      _id : data.notificationId
    }]);
    var notificationRingtone = new Audio('/audios/notification_sound.mp3');
    notificationRingtone.play();
  }
});