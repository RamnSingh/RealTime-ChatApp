'use strict';

$(function () {
    // MENU
    $('#notification-popover').popover({
        html: true,
        placement: 'bottom',
        template: getTemplateForNotification(),
        content : getContentForNotification()
    });
    initAvailableStatus();
    $("#user-messages").hide();
    $.protip();
});

/* Menu Bar Functions */
var allStatus = ['open', 'busy', 'emergency', 'close'];

function initAvailableStatus() {
    var activeStatus = $('#active-status').text();

    var activeStatusIndex = allStatus.indexOf(activeStatus.toLowerCase());

    if (activeStatusIndex != -1) {
        allStatus.splice(activeStatusIndex, 1);
    }

    updateAvailableStatus(allStatus);
}

function updateStatusOnFrontEnd(capitalizeStatus) {
    var activeStatusToRemove = $('#active-status').text();
    $('#active-status').empty();
    $('#active-status').html(capitalizeStatus);

    var statusToChangeIndex = allStatus.indexOf(capitalizeStatus.toLowerCase());
    if (statusToChangeIndex != -1) {
        allStatus.splice(statusToChangeIndex, 1);
    }
    allStatus.push(activeStatusToRemove.toLowerCase());

    updateAvailableStatus();
}

function updateAvailableStatus() {
    $('#available-status').empty();
    allStatus.forEach((status) => {
        var capitalizeStatus = status[0].toUpperCase() + "" + status.substr(1, status.length - 1);
        var statusHtml = '<span class="list-group-item" style="cursor:pointer" onclick="changeStatus(\'' + capitalizeStatus + '\')">' + capitalizeStatus + '</span>';
        $('#available-status').append(statusHtml);
    });
}

function showCustomStatusModal() {
    $("#change-status-modal").on('show.bs.modal', function () {
        $('#custom-status-input').focus();
    });
    $("#change-status-modal").modal('show');
}

function changeStatus(capitalizeStatus) {
    updateStatus(capitalizeStatus, false, function (success) {
        if (success) {
            updateStatusOnFrontEnd(capitalizeStatus);
        }
    });
}

function addCustomStatus() {
    var customStatus = $('#custom-status-input').val();
    updateStatus(customStatus, true, function (success) {
        if (success) {
            updateStatusOnFrontEnd(customStatus);
        }
    });
}

function updateStatus(status, isCustomStatus, cb) {
    if (status != undefined && status != null && status.toString().trim() != "") {
        var dialogTitle, dialogBody;
        $.ajax({
                type: "POST",
                url: "/status/update",
                data: {
                    status: status,
                    isCustomStatus: isCustomStatus
                },
                dataType: 'json'
            }).done(function (resp) {
                if (resp.success) {
                    dialogTitle = "Success";
                    dialogBody = "You status has been updated to " + status;
                } else {
                    dialogTitle = "Fail";
                    dialogBody = "You status has not been updated to " + status;
                }

                cb(resp.success);
            })
            .fail(function (error) {
                dialogTitle = "Error";
                dialogBody = "Couldn\'t connect to server. Please try again.";
                cb(false);
            })
            .always(function () {
                $("#change-status-modal").modal('hide');
                showDialogBox(dialogTitle, dialogBody);
            });
    }
}

function getContentForNotification() {
    var list = document.createElement('div');
    list.className = 'list-group';
    list.id = "notification-list-group";
    return list;
}

function getTemplateForNotification() {
    var outerMostDiv = document.createElement('div');
    outerMostDiv.className = 'no-padding';

    var popoverDiv = document.createElement('div');
    popoverDiv.className = 'popover no-padding notification-popover-box';
    popoverDiv.setAttribute('role', 'tooltip');

    var popoverArrowDiv = document.createElement('div');
    popoverArrowDiv.className = 'popover-arrow';

    var popoverTitle = document.createElement('h3');
    popoverTitle.className = "popover-title";

    var popoverContent = document.createElement('div');
    popoverContent.className = "popover-content no-padding";

    popoverDiv.appendChild(popoverArrowDiv);
    popoverDiv.appendChild(popoverTitle);
    popoverDiv.appendChild(popoverContent);

    outerMostDiv.appendChild(popoverDiv);

    return outerMostDiv.innerHTML;

}


function addNotifications(notifications){
    $('#notification-popover').popover('show');
    notifications.forEach(function(notification){
        var htmlBody = $(notification.body);
        htmlBody.attr('onclick', 'notificationRead(\'' + notification._id + '\')');
        $('#notification-list-group').append(htmlBody[0].outerHTML);
    });
}