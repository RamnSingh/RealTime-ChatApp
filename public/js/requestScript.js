var dialogTitle = "";
var dialogBody = "";

function showFriendRequestModal(userId, username) {
    var confirmTitle = 'Confirmation';
    var confirmBody = '<p>Are you sure you want to send friend request with <b>' + username + '</b> ?</p>';
    showConfirmModal(confirmTitle, confirmBody, sendFriendRequest, [userId, username]);
}

function sendFriendRequest(requestedToId, requestedToUsername) {
    // var notificationLink = "/requests/";
    //                 var notificationHtml = "<span><b>" + cm_loggedUsername + "</b> has sent you friend request</span>";
    //                 var notificationBody =  createNotificationContent(notificationLink, notificationHtml);
    //                 $(document).trigger('sendNotification', [cm_loggedUserId, notificationBody.outerHTML, [requestedToId]]);
    //                 return;
    if (requestedToId != undefined) {
        var dialogTitle, dialogBody;
        $.ajax({
                type: "POST",
                url: "/requests/send",
                data: {
                    requestedToId: requestedToId
                },
                dataType: 'json'
            }).done(function (resp) {
                if (resp.success) {
                    dialogTitle = "Success";
                    dialogBody = "You request has been sent";
                    $("#add-request-" + requestedToUsername).html('Request sent').prop('disabled', 'disabled');
                    var notificationLink = "/requests/";
                    var notificationHtml = "<span><b>" + cm_loggedUsername + "</b> has sent you friend request</span>";
                    var notificationBody =  createNotificationContent(notificationLink, notificationHtml);
                    $(document).trigger('sendNotificationDb', [cm_loggedUserId, notificationBody.outerHTML, [requestedToId]]);
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

function showDeleteRequestModal(requestId, requestedToId, requestedToUsername) {
    var confirmTitle = 'Confirmation';
    var confirmBody = '<p>Are you sure you want to delete the friend request for <b>' + requestedToUsername + '</b> ?</p>';
    showConfirmModal(confirmTitle, confirmBody, sendDeleteRequest, [requestId, requestedToId, requestedToUsername]);
}

function sendDeleteRequest(requestId, requestedToId, requestedToUsername) {
    if (requestedToId != undefined) {
        $.ajax({
                type: "POST",
                url: "/requests/delete",
                data: {
                    requestId : requestId,
                    requestedToId: requestedToId
                },
                dataType: 'json'
            }).done(function (resp) {
                if (resp.success) {
                    dialogTitle = "Success";
                    dialogBody = "You request has been succesfully deleted";
                    $("#" + requestId).remove();
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
}

function showFriendRequestDenyModal(requestId, requestedById, username) {
    var confirmTitle = "Denial confirmation";
    var confirmBody = "<p>Are you sure you want to refuse <b>" + username + "\'s</b> friend request?</p>";
    showConfirmModal(confirmTitle, confirmBody, denyFriendRequest, [requestId, requestedById, username]);
}

function denyFriendRequest(requestId, requestedById, username) {
    if (requestedById != undefined) {
        var dialogTitle, dialogBody;
        $.ajax({
                type: "POST",
                url: "/requests/deny",
                data: {
                    requestedById: requestedById,
                    requestId: requestId
                },
                dataType: 'json'
            }).done(function (resp) {
                if (resp.success) {
                    dialogTitle = "Success";
                    dialogBody = "You have successfully removed <b>" + username + "</b> from your friend list.";
                    $("#accept-request-" + username).hide();
                    $("#deny-request-" + username).hide();
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
}

function showFriendRequestAcceptModal(requestId, requestedById, username) {
    var confirmTitle = "Accept confirmation";
    var confirmBody = "<p>Are you sure you want to accept <b>" + username + "\'s</b> friend request?</p>";

    showConfirmModal(confirmTitle, confirmBody, acceptFriendRequest, [requestId, requestedById, username]);
}

function acceptFriendRequest(requestId, requestedById, username) {
    console.log(requestId);
    if (requestedById != undefined) {
        var dialogTitle, dialogBody;
        $.ajax({
                type: "POST",
                url: "/requests/accept",
                data: {
                    requestedById: requestedById,
                    requestId: requestId
                },
                dataType: 'json'
            }).done(function (resp) {
                if (resp.success) {
                    dialogTitle = "Success";
                    dialogBody = "You are now friend with <b>" + username + "</b>.";
                    $("#accept-request-" + username).html('Now friend').prop('disabled', 'disabled');
                    $("#deny-request-" + username).hide();
                     var notificationLink = "/friends/";
                    var notificationHtml = "<span><b>" + cm_loggedUsername + "</b> has accepted your friend request</span>";
                    var notificationBody =  createNotificationContent(notificationLink, notificationHtml);
                    $(document).trigger('sendNotificationDb', [cm_loggedUserId, notificationBody.outerHTML, [requestedById]]);
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
}