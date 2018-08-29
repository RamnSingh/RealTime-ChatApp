function joinChannel(channelId, channelName){
    var confirmTitle = "Joining channel <b>" + channelName + "</b>";
    var confirmBody = "Are you sure you want to join <b>" + channelName + "</b> ?";
    showConfirmModal(confirmTitle, confirmBody, joinChannelRequest, [channelId, channelName]);
}

function makeUserLeaveTheChannel(channelId, channelName, userId){
    showConfirmModal('Leaving group confirmation', 'Are you sure you want user to leave <b>' + channelName + '</b> channel ?', makeUserLeaveTheChannelRequest, [channelId, channelName, userId]);
}

function leaveChannel(channelId, channelName){
    var confirmTitle = "Leaving channel <b>" + channelName + "</b>";
    var confirmBody = "Are you sure you want to leave <b>" + channelName + "</b> ?";
    showConfirmModal(confirmTitle, confirmBody, leaveChannelRequest, [channelId, channelName]);
}

function makeUserAdminOfTheChannel(channelId, channelName, userId){
    showConfirmModal('Making admin confirmation', 'Are you sure you want user to be admin of <b>' + channelName + '</b> channel ?', makeUserAdminOfTheChannelRequest, [channelId, channelName, userId]);
}

function deleteChannel(channelId, channelName){
    var confirmTitle = "Deleting channel <b>" + channelName + "</b>";
    var confirmBody = "Are you sure you want to delete <b>" + channelName + "</b> ?";
    showConfirmModal(confirmTitle, confirmBody, deleteChannelRequest, [channelId, channelName]);
}

var dialogTitle = "";
var dialogBody = "";
function joinChannelRequest(channelId, channelName){
    $.ajax({
        type: "POST",
        url: "/channels/join",
        data: {
            channelId: channelId
        },
        dataType: 'json'
    }).done(function (resp) {
        if (resp.success) {
            dialogTitle = "Success";
            dialogBody = "You are now member of " + channelName + ".";
            //$("#join-" + channelId).html('Leave').prop('id', 'leave-' + channelId).prop('onclick', "leaveChannel('" + channelId + "', '" + channelName + "')");

            var joinButton = document.getElementById('join-' + channelId);
            joinButton.id = 'leave-' + channelId;
            joinButton.innerText = "Leave";
            joinButton.className = "btn";
            joinButton.setAttribute('onclick', 'leaveChannel("' + channelId + '","' + channelName + '")');
        } else {
            dialogTitle = "Fail";
            dialogBody = "You request has not been sent. Please try again.";
        }
    })
    .fail(function (error) {
        dialogTitle = "Error";
        dialogBody = "Couldn\'t connect to server. Please try again.";
    })
    .always(function () {
        $('#confirm-box').modal('hide');
        showDialogBox(dialogTitle, dialogBody);
    });
}

function makeUserLeaveTheChannelRequest(channelId, channelName, userId){
    $.ajax({
        type: "POST",
        url: "/channels/removeUserFromChannel",
        data: {
            channelId: channelId,
            userId : userId
        },
        dataType: 'json'
    }).done(function (resp) {
        if (resp.success) {
            dialogTitle = "Success";
            dialogBody = "Now, User is no more member of " + channelName + ".";
            $("#" + userId).remove();
        } else {
            dialogTitle = "Fail";
            resp.messages.forEach((message) => {
                dialogBody += message;
            });
        }
    })
    .fail(function (error) {
        dialogTitle = "Error";
        dialogBody = "Couldn\'t connect to server. Please try again.";
    })
    .always(function () {
        $('#confirm-box').modal('hide');
        showDialogBox(dialogTitle, dialogBody);
    });
}

function leaveChannelRequest(channelId, channelName){
    $.ajax({
        type: "POST",
        url: "/channels/leave",
        data: {
            channelId: channelId
        },
        dataType: 'json'
    }).done(function (resp) {
        if (resp.success) {
            dialogTitle = "Success";
            dialogBody = "Now, you are not member of " + channelName + ".";
            $("#" + channelId).remove();
        } else {
            dialogTitle = "Fail";
             resp.messages.forEach((message) => {
                dialogBody += message;
            });
        }
    })
    .fail(function (error) {
        dialogTitle = "Error";
        dialogBody = "Couldn\'t connect to server. Please try again.";
    })
    .always(function () {
        $('#confirm-box').modal('hide');
        showDialogBox(dialogTitle, dialogBody);
    });
}

function makeUserAdminOfTheChannelRequest(channelId, channelName, userId){
     $.ajax({
        type: "POST",
        url: "/channels/makeAdmin",
        data: {
            channelId: channelId,
            userId : userId
        },
        dataType: 'json'
    }).done(function (resp) {
        if (resp.success) {
            dialogTitle = "Success";
            dialogBody = "Now, the user is admin of  <b>" + channelName + "</b> channel.";
            $('#makeAdmin-' + channelId+ "-" + userId).prop('class', 'btn btn-primary').prop('disabled', 'disabled').text('Admin');
            $('#makeLeave-' + channelId+ "-" + userId).remove();
        } else {
            dialogTitle = "Fail";
            resp.messages.forEach((message) => {
                dialogBody += message;
            });
        }
    })
    .fail(function (error) {
        dialogTitle = "Error";
        dialogBody = "Couldn\'t connect to server. Please try again.";
    })
    .always(function () {
        $('#confirm-box').modal('hide');
        showDialogBox(dialogTitle, dialogBody);
    });
}

function deleteChannelRequest(channelId, channelName){
    $.ajax({
        type: "POST",
        url: "/channels/delete",
        data: {
            channelId: channelId
        },
        dataType: 'json'
    }).done(function (resp) {
        if (resp.success) {
            dialogTitle = "Success";
            dialogBody = "The channel <b>" + channelName + "</b> has been deleted.";
            $('#' + channelId).remove();
        } else {
            dialogTitle = "Fail";
            resp.messages.forEach((message) => {
                dialogBody += message;
            });
        }
    })
    .fail(function (error) {
        dialogTitle = "Error";
        dialogBody = "Couldn\'t connect to server. Please try again.";
    })
    .always(function () {
        $('#confirm-box').modal('hide');
        showDialogBox(dialogTitle, dialogBody);
    });
}


function manageChannelMembers(channelId, channelName) {
    getAllChannelMembers(channelId, function(membersResult){
        var members = membersResult.data;
        var listGroupElement = document.getElementById('list-manage-members');
        listGroupElement.innerHTML = "";
        members.forEach(member => {
            var listItemElement = document.createElement('li');
            var userLink = document.createElement('a');
            var userImage = document.createElement('img');
            var userIcon = document.createElement('i');
            var usernameSpan = document.createElement('span');
            var buttonGroupDiv = document.createElement('div');
            var alreadyAdminButton = document.createElement('button');
            var makeAdminOfTheGroupButton = document.createElement('button');
            var removeFromGroupButton = document.createElement('button');

            listItemElement.className = "list-group-item justify-content-between";
            listItemElement.id = member._id.toString();
            userLink.href = "/user/" + member.username;
            userLink.className = "text-black text-black-hover";
            if(member.profileImage){
                userImage.src = "/profile/image/" + member.profileImage;
                userImage.width = 22.859;
                userImage.height = 32;
                userLink.appendChild(userImage);
            }else{
                userIcon.className = "fa fa-user fa-2x";
                userLink.appendChild(userIcon);
            }

            usernameSpan.innerText = " " + member.username;
            userLink.appendChild(usernameSpan);

            buttonGroupDiv.className = "btn-group";
            makeAdminOfTheGroupButton.className = "btn btn-info";
            makeAdminOfTheGroupButton.id = "makeAdmin-" + channelId + "-" + member._id;
            makeAdminOfTheGroupButton.innerText = "Make admin";
            makeAdminOfTheGroupButton.setAttribute('onclick', 'makeUserAdminOfTheChannel("' + channelId + '", "'+ channelName +'", "'+ member._id +'")');
            alreadyAdminButton.className = "btn btn-primary disabled";
            alreadyAdminButton.disabled = true;
            alreadyAdminButton.innerText = "Admin";
            removeFromGroupButton.className = "btn btn-warning";
            removeFromGroupButton.id = "makeLeave-" + channelId + "-" + member._id;
            removeFromGroupButton.innerText = "Remove";
            removeFromGroupButton.setAttribute('onclick', 'makeUserLeaveTheChannel("' + channelId + '", "'+ channelName +'", "'+ member._id +'")');

            if(member.isAdmin == undefined || member.isAdmin == false){
                if(member.isMember){
                    buttonGroupDiv.appendChild(makeAdminOfTheGroupButton);
                    buttonGroupDiv.appendChild(removeFromGroupButton);
                }
            }else{
                buttonGroupDiv.appendChild(alreadyAdminButton);
            }

            listItemElement.appendChild(userLink);
            listItemElement.appendChild(buttonGroupDiv);

            listGroupElement.appendChild(listItemElement);

        });      
    }, function(err){

    }, function(){

    });
}

function getAllChannelMembers(channelId, successFunc, errorFunc, alwaysFunc){
    $.ajax({
        type: "POST",
        url: "/channels/getAllMembers",
        data: {
            channelId: channelId
        },
        dataType: 'json'
    }).done((res) => successFunc(res)).fail(err => errorFunc(err)).always(() => alwaysFunc());
}