var cm_loggedUsername;
var cm_loggedUserId;
var cm_loggedUserSocketId;
var cm_friendsList = [];
var cm_groupsList = [];
var cm_channelsList = [];
var cm_connectedUsers = [];

function cm_getAllFriends(successCb, errorCb, alwaysCb){
    $.ajax({
    method : 'get',
    url: "/friends/getAllFriends",
    dataType: 'json'
  }).done((res) => successCb(res)).fail((err) => errorCb(err)).always(() => {
      if(alwaysCb){
          alwaysCb();
      }
  });
}

function cm_getAllConnectedFriendsForUser(userId, successCb, errorCb, alwaysCb){
    $.ajax({
        method : 'post',
        url: "/connections/getAllConnectedFriendsForUser",
        data : {
            userId : userId
        },
        dataType: 'json'
    }).done((res) => successCb(res)).fail((err) => errorCb(err)).always(() => {
        if(alwaysCb){
            alwaysCb();
        }
    });
}

function cm_getAllFriendsWithThierConnectionStatus(userId, successCb, errorCb, alwaysCb){
    var allFriends = [];
    var numberOfConnectedFriends;
    cm_getAllFriends(function(resp) {
        var userFriends = resp.data;
        cm_getAllConnectedFriendsForUser(userId, function(connectedFriendsResponse){
            var connectedFriends = connectedFriendsResponse.data;
            console.log(connectedFriends);
            numberOfConnectedFriends = connectedFriends.length;
            userFriends.forEach(function(friend, index){
                connectedFriends.forEach(function(connectedFriend){
                    if(friend._id.toString() == connectedFriend._id.toString()){
                        connectedFriend.connected = true;
                        allFriends.push(connectedFriend);
                    }
                });

                if(allFriends.length != index + 1){
                    friend.connected = false;
                    allFriends.push(friend);
                }
            });
            successCb({
                success : true,
                data : {
                    friends : allFriends,
                    numberOfConnectedFriends : numberOfConnectedFriends
                }
            });
        }, errorCb, alwaysCb);
    }, errorCb, alwaysCb);
}

function cm_getAllGroups(successCb, errorCb, alwaysCb){
    $.ajax({
    method : 'get',
    url: "/groups/getAllGroups",
    dataType: 'json'
  }).done((res) => successCb(res)).fail((err) => errorCb(err)).always(() => {
      if(alwaysCb){
          alwaysCb();
      }
  });
}

function cm_getAllChannels(successCb, errorCb, alwaysCb){
    $.ajax({
    method : 'get',
    url: "/channels/getAll",
    dataType: 'json'
  }).done((res) => successCb(res)).fail((err) => errorCb(err)).always(() => {
      if(alwaysCb){
          alwaysCb();
      }
  });
}

function cm_getAllChannelByMember(successCb, errorCb, alwaysCb){
    $.ajax({
    method : 'get',
    url: "/channels/getAllByMember",
    dataType: 'json'
  }).done((res) => successCb(res)).fail((err) => errorCb(err)).always(() => {
      if(alwaysCb){
          alwaysCb();
      }
  });
}

function cm_updateChannelsSidebar(channelsList){
    $('#channelsList').empty();
    channelsList.forEach(function(channel){
        var liElement = document.createElement('li');
        var firstSpan = document.createElement('span');
        var channelName = document.createElement('span');
        var newUnreadMessageBadgeSpan = document.createElement('span');

        liElement.className = "list-group-item justify-content-between pointer";
        liElement.id = channel._id;
        liElement.setAttribute('onclick', 'showChatBoxForChannel("' + channel._id + '", "' + channel.name + '")');

        channelName.className = "h5  ml-2";
        channelName.innerText = channel.name;

        newUnreadMessageBadgeSpan.className = "badge badge-pill badge-warning";
        newUnreadMessageBadgeSpan.id = channel.name.split(' ').join('_') + "-nb-unread-msg";

        channelName.appendChild(newUnreadMessageBadgeSpan);
        firstSpan.appendChild(channelName);

        liElement.appendChild(firstSpan);

        $('#channelsList').append(liElement);
    });
}

function cm_updateGroupsSidebar(groupList){
    $('#groupsList').empty();
    groupList.forEach(function(group){
        var liElement = document.createElement('li');
        var firstSpan = document.createElement('span');
        var groupName = document.createElement('span');
        var newUnreadMessageBadgeSpan = document.createElement('span');

        liElement.className = "list-group-item justify-content-between pointer";
        liElement.id = group._id;
        liElement.setAttribute('onclick', 'showChatBoxForGroup("' + group._id + '", "' + group.name + '")');

        groupName.className = "h5  ml-2";
        groupName.innerText = group.name;

        newUnreadMessageBadgeSpan.className = "badge badge-pill badge-warning";
        newUnreadMessageBadgeSpan.id = group.name.split(' ').join('_') + "-nb-unread-msg";

        groupName.appendChild(newUnreadMessageBadgeSpan);
        firstSpan.appendChild(groupName);

        liElement.appendChild(firstSpan);

        $('#groupsList').append(liElement);
    });
}

function cm_updateFriendListSidebar(friendsList){
    $('#friendsList').empty();
    friendsList.forEach(function(friend){
        var liElement = document.createElement('li');
        var firstSpan = document.createElement('span');
        var profileImage = document.createElement('img');
        var usernameSpan = document.createElement('span');
        var newUnreadMessageBadgeSpan = document.createElement('span');
        var secondSpan = document.createElement('span');
        liElement.className = "list-group-item justify-content-between pointer";
        liElement.id = friend._id;
        liElement.setAttribute('onclick', 'showChatBoxForUser("' + friend._id + '", "' + friend.username + '", "' + friend.peerId + '")');

        profileImage.src = friend.profileImage != undefined ? "/profile/image/" + friend.profileImage : "/images/default_profile_image.png";
        profileImage.width = 40;
        profileImage.height = 40;
        usernameSpan.className = "h5  ml-2";
        usernameSpan.innerText = friend.customUsername || friend.username;

        newUnreadMessageBadgeSpan.className = "badge badge-pill badge-warning";
        newUnreadMessageBadgeSpan.id = friend.username.split(' ').join('_') + "-nb-unread-msg";

        usernameSpan.appendChild(newUnreadMessageBadgeSpan);
        firstSpan.appendChild(profileImage);
        firstSpan.appendChild(usernameSpan);

        secondSpan.className = friend.connected == true ? "online-dot" : "offline-dot";
        liElement.appendChild(firstSpan);
        liElement.appendChild(secondSpan);

        $('#friendsList').append(liElement);
    });
}

// Notification

function createNotificationContent(link, html, ){
    var listItem = document.createElement('a');
    listItem.className = "list-group-item animated slideInLeft justify-content-between text-black text-black-hover";
    listItem.innerHTML = html;
    listItem.setAttribute('href', link);
    return listItem;
}

function notificationRead(notificationId){
     $.ajax({
        type: "post",
        url: "/notifications/read",
        data : {
            notificationId : notificationId,
            userId : cm_loggedUserId
        },
        dataType: 'json'
    }).done(function (resp) {
        console.log(resp);
    });
}

$(document).on('sendNotificationDb', function(event, sendBy, notificationBody, sentToArr){
    $.ajax({
        type: "post",
        url: "/notifications/send",
        data : {
            sendBy : sendBy,
            body : notificationBody,
            sentTo : JSON.stringify(sentToArr)
        },
        dataType: 'json'
    }).done(function (resp) {
        var htmlBody = $(notificationBody);
        htmlBody.attr('onclick', 'notificationRead(\'' + resp.data._id + '\')');
        $(document).trigger('sendNotification', [sendBy, resp.data._id, htmlBody[0].outerHTML, sentToArr]);
    });
});

function cm_populateNotificationBox(userId){
    $.ajax({
        type: "post",
        url: "/notifications/getAll",
        data : {
            userId : userId
        },
        dataType: 'json'
    }).done(function (resp) {
        if(resp.data.length != 0){
            $('#notification-icon').append('<i class="badge badge-danger">' + resp.data.length + '</i>')
        }
        addNotifications(resp.data);
    });
}

// Group, Channel, Chat

navigator.getUserMedia = (navigator.getUserMedia || 
                          navigator.webkitGetUserMedia || 
                          navigator.mozGetUserMedia || 
                        navigator.msGetUserMedia);

function cm_getStream(isAudioCall, successCb, errorCb){
    navigator.getUserMedia({audio: true, video: !isAudioCall}, successCb, errorCb);
}

// Modals

var onConfirmMethod;
var onConfirm;

function showDialogBox(dialogTitle, dialogBody) {
    $('#dialog-title').html(dialogTitle);
    $('#dialog-body').html(dialogBody);
    $('#dialog-box').modal('show');
}

function showConfirmModal(confirmTitle, confirmBody, funcOnConfrim, funcArgsArr) {
    onConfirm = onConfirmInit(funcArgsArr);
    $('#confirm-box').on('show.bs.modal', function () {
        $('#confirm-box-title').html(confirmTitle);
        $('#confirm-box-body').html(confirmBody);
        onConfirmMethod = funcOnConfrim;
    });

    $('#confirm-box').modal('show');
}

function onConfirmInit(argsArr) {
    var args = argsArr;
    return function () {
        onConfirmMethod.apply(undefined, args);
    }
}