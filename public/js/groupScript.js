/* Create */

function initCreateGroupForm() {
    if (cm_friendsList == undefined || cm_friendsList == null || cm_friendsList.length == 0) {
        cm_getAllFriends(function (res) {
            console.log(cm_friendsList)
            cm_friendsList = res.data;
            populateSelectWithFriendList(cm_friendsList);
        }, function (err) {

        });
    } else {
        populateSelectWithFriendList(cm_friendsList);
    }
}

function populateSelectWithFriendList(friendsList) {
    var groupMembersSelect = document.getElementById('group-members');
    friendsList.forEach(function (friend) {
        var friendOption = document.createElement('option');
        friendOption.text = friend.username;
        friendOption.value = friend._id;
        groupMembersSelect.appendChild(friendOption);
    })
}

/* Manage */
function makeUserJoinTheGroup(groupId, groupName, userId){
    showConfirmModal('Joining group confirmation', 'Are you sure you want user to join <b>' + groupName + '</b> group ?', makeUserJoinTheGroupRequest, [groupId, groupName, userId]);
}

function leaveGroup(groupId, groupName){
    showConfirmModal('Leaving group confirmation', 'Are you sure you want to leave <b>' + groupName + '</b> group ?', leaveGroupRequest, [groupId, groupName]);
}

function makeUserLeaveTheGroup(groupId, groupName, userId){
    showConfirmModal('Leaving group confirmation', 'Are you sure you want user to leave <b>' + groupName + '</b> group ?', makeUserLeaveTheGroupRequest, [groupId, groupName, userId]);
}

function deleteGroup(groupId, groupName){
    showConfirmModal('Deleting group confirmation', 'Are you sure you want to delete <b>' + groupName + '</b> group ?', deleteGroupRequest, [groupId, groupName]);
}

function makeUserAdminOfTheGroup(groupId, groupName, userId){
    showConfirmModal('Making admin confirmation', 'Are you sure you want user to be admin of <b>' + groupName + '</b> group ?', makeUserAdminOfTheGroupRequest, [groupId, groupName, userId]);
}

function makeUserJoinTheGroupRequest(groupId, groupName, userId){
    $.ajax({
        type: "POST",
        url: "/groups/addUserToGroup",
        data: {
            groupId: groupId,
            userId : userId
        },
        dataType: 'json'
    }).done(function (resp) {
        if (resp.success) {
            dialogTitle = "Success";
            dialogBody = "User is now member of " + groupName + ".";

            var joinButton = document.getElementById('makeJoin-' + groupId + "-" + userId);
            joinButton.id = 'makeLeave-' + groupId + "-" + userId;
            joinButton.innerText = "Remove";
            joinButton.className = "btn btn-warning";
            joinButton.setAttribute('onclick', 'makeUserLeaveTheGroup("' + groupId + '","' + groupName + '", "' + userId + '")');
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

var dialogTitle = "";
var dialogBody = "";
function leaveGroupRequest(groupId, groupName){
    $.ajax({
        type: "POST",
        url: "/groups/leave",
        data: {
            groupId: groupId
        },
        dataType: 'json'
    }).done(function (resp) {
        console.log(resp)
        if (resp.success) {
            dialogTitle = "Success";
            dialogBody = "Now, you are no more member of " + groupName + ".";
            $('#' + groupId).remove();
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

function makeUserLeaveTheGroupRequest(groupId, groupName, userId){
    $.ajax({
        type: "POST",
        url: "/groups/removeUserFromGroup",
        data: {
            groupId: groupId,
            userId : userId
        },
        dataType: 'json'
    }).done(function (resp) {
        if (resp.success) {
            dialogTitle = "Success";
            dialogBody = "Now, User is not member of " + groupName + ".";
            var leaveButton = document.getElementById('makeLeave-' + groupId + "-" + userId);
            leaveButton.id = 'makeJoin-' + groupId + "-" + userId;
            leaveButton.innerText = "Add";
            leaveButton.className = "btn";
            leaveButton.setAttribute('onclick', 'makeUserJoinTheGroup("' + groupId + '","' + groupName + '", "' + userId + '")');
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

function deleteGroupRequest(groupId, groupName){
    $.ajax({
        type: "POST",
        url: "/groups/delete",
        data: {
            groupId: groupId
        },
        dataType: 'json'
    }).done(function (resp) {
        if (resp.success) {
            dialogTitle = "Success";
            dialogBody = "The channel <b>" + groupName + "</b> has been deleted.";
            $('#' + groupId).remove();
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

function makeUserAdminOfTheGroupRequest(groupId, groupName, userId){
     $.ajax({
        type: "POST",
        url: "/groups/makeAdmin",
        data: {
            groupId: groupId,
            userId : userId
        },
        dataType: 'json'
    }).done(function (resp) {
        if (resp.success) {
            dialogTitle = "Success";
            dialogBody = "Now, the user is admin of  <b>" + groupName + "</b> group.";
            $('#makeAdmin-' + groupId+ "-" + userId).prop('class', 'btn btn-primary').prop('disabled', 'disabled').text('Admin');
            $('#makeLeave-' + groupId+ "-" + userId).remove();
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

function manageGroupMembers(groupId, groupName) {
    getAllGroupMembers(groupId, function(membersResult){
        var members = membersResult.data;
        var listGroupElement = document.getElementById('list-manage-members');
        listGroupElement.innerHTML = "";
        cm_getAllFriends(function(friendsResult){
            var friends = friendsResult.data;
            var friendsToRemoveFromFriendList = [];

            // Adding undefined if frin is already a member
            friends.forEach(function(friend, index){
                var isFriendMember = false;
                members.forEach(function(member){
                    if(member._id.toString() == friend._id.toString()){
                        isFriendMember = true;
                    }
                });

                if(isFriendMember == false){
                    members.push(friend);
                }
            });

            members.forEach(member => {
            var listItemElement = document.createElement('li');
            var userLink = document.createElement('a');
            var userImage = document.createElement('img');
            var userIcon = document.createElement('i');
            var usernameSpan = document.createElement('span');
            var buttonGroupDiv = document.createElement('div');
            var addToGroupButton = document.createElement('button');
            var alreadyAdminButton = document.createElement('button');
            var makeAdminOfTheGroupButton = document.createElement('button');
            var removeFromGroupButton = document.createElement('button');

            listItemElement.className = "list-group-item justify-content-between";

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
            addToGroupButton.className = "btn";
            addToGroupButton.id = "makeJoin-" + groupId + "-" + member._id;
            addToGroupButton.innerText = "Add";
            addToGroupButton.setAttribute('onclick', 'makeUserJoinTheGroup("' + groupId + '", "'+ groupName +'", "'+ member._id +'")');
            makeAdminOfTheGroupButton.className = "btn btn-info";
            makeAdminOfTheGroupButton.id = "makeAdmin-" + groupId + "-" + member._id;
            makeAdminOfTheGroupButton.innerText = "Make admin";
            makeAdminOfTheGroupButton.setAttribute('onclick', 'makeUserAdminOfTheGroup("' + groupId + '", "'+ groupName +'", "'+ member._id +'")');
            alreadyAdminButton.className = "btn btn-primary disabled";
            alreadyAdminButton.disabled = true;
            alreadyAdminButton.innerText = "Admin";
            removeFromGroupButton.className = "btn btn-warning";
            removeFromGroupButton.id = "makeLeave-" + groupId + "-" + member._id;
            removeFromGroupButton.innerText = "Remove";
            removeFromGroupButton.setAttribute('onclick', 'makeUserLeaveTheGroup("' + groupId + '", "'+ groupName +'", "'+ member._id +'")');

            if(member.isAdmin == undefined || member.isAdmin == false){
                if(member.isMember){
                    buttonGroupDiv.appendChild(makeAdminOfTheGroupButton);
                    buttonGroupDiv.appendChild(removeFromGroupButton);
                }else{
                    buttonGroupDiv.appendChild(addToGroupButton);
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
    }, function(err){

    }, function(){

    });
}

function getAllGroupMembers(groupId, successFunc, errorFunc, alwaysFunc){
    $.ajax({
        type: "POST",
        url: "/groups/getAllMembers",
        data: {
            groupId: groupId
        },
        dataType: 'json'
    }).done((res) => successFunc(res)).fail(err => errorFunc(err)).always(() => alwaysFunc());
}