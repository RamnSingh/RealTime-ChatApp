var dialogTitle = "";
var dialogBody = "";

function showRenameFriendModal(friendId, username) {
    var confirmTitle = 'Renaming ' + username;
    var confirmBody = '<div class="form-group"><label for="renameInput">Enter a new name for ' + username + '</label><input type="text" class="form-control" id="renameInput" /></div>';
    $("#confirm-modal-button").text('Confirm');
    $("#dismiss-modal-button").text('Cancel');
    showConfirmModal(confirmTitle, confirmBody, renameFriendRequest, [friendId, username]);
}

function renameFriendRequest(friendId, username) {
    if (friendId != undefined) {
        var newUsername = $("#renameInput").val();
        $("#renameInput").val('');
        if(newUsername){
             $.ajax({
                type: "POST",
                url: "/friends/rename",
                data: {
                    friendId: friendId,
                    newUsername : newUsername
                },
                dataType: 'json'
            }).done(function (resp) {
                if (resp.success) {
                    dialogTitle = "Success";
                    dialogBody = "Username has been renamed. You can see it when you are on chat page.";
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
    }
}

function showRemoveFriendModal(friendId, username) {
    selectedUserId = friendId;
    selectedUsername = username;
    var confirmTitle = "Removal confirmation";
    var confirmBody = "<p>Are you sure you want to remove <b>" + username + "</b> from your friend list ?</p>";

    showConfirmModal(confirmTitle, confirmBody, removeFriendRequest, [friendId, username]);
}

function removeFriendRequest(friendId, username) {
    if (friendId != undefined) {
        $.ajax({
            type: "POST",
            url: "/friends/remove",
            data: {
                friendId: friendId
            },
            dataType: 'json'
        }).done(function (resp) {
            if (resp.success) {
                dialogTitle = "Success";
                dialogBody = username + " has been removed from your friend list as well you from her/his friendlist.";
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
}


function showBlockFriendModal(requestId, username, blockById) {
    var confirmTitle = "Blocking confirmation";
    var confirmBody = "<p>Are you sure you want to block <b>" + username + "</b> ?</p>";

    showConfirmModal(confirmTitle, confirmBody, blockFriend, [requestId, blockById, username]);
}

function showUnblockUserModal(requestId, username, unblockById) {
    var confirmTitle = "Unblocking confirmation";
    var confirmBody = "<p>Are you sure you want to unblock <b>" + username + "</b> ?</p>";

    showConfirmModal(confirmTitle, confirmBody, unblockFriend, [requestId, unblockById, username]);
}

function blockFriend(requestId, blockById, username) {
    if (requestId != undefined && blockById != undefined) {
        var dialogTitle, dialogBody;
        $.ajax({
                type: "POST",
                url: "/request/block",
                data: {
                    requestId: requestId,
                    blockById: blockById
                },
                dataType: 'json'
            }).done(function (resp) {
                if (resp.success) {
                    dialogTitle = "Success";
                    dialogBody = "You have successfully blocked <b>" + username + "</b>.";
                    $("#already-friend-" + username).hide();
                    $("#block-request-" + username).html('Blocked').prop('disabled', 'disabled');
                } else {
                    dialogTitle = "Fail";
                    dialogBody = "Couldn't accomplish the operation. Please try again.";
                }
            })
            .fail(function (error) {
                dialogTitle = "Error";
                dialogBody = "Couldn\'t connect to server. Please try again.";
                $("#already-friend-" + username).html('Blocked').prop('disabled', 'disabled');
                $("#block-request-" + username).
                prop('id', 'unblock-request-' + username).
                prop('onclick', 'showUnblockUserModal(\'' + requestId + '\',\'' + username + '\',\'' + blockById + '\')').
                html('Unblock user');
            })
            .always(function () {
                $('#confirm-box').modal('hide');
                showDialogBox(dialogTitle, dialogBody);
            });

    }
}

function unblockFriend(requestId, blockById, username) {
    $.ajax({
        type: "get",
        url: "/user/logout",
        dataType: 'json'
    }).done(function (resp) {
        window.url = "/";
    });
}
