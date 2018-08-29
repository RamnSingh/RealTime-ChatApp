var receiverName;
var receiverId;
var isGroup = false;

var currentConversation;
var newUnreadMessagesRecord = [];
var destPeerId;
var destPeersIds = [];
var files = [];

$(function(){
    $('#user-messages').hide();
    $('#message-input-box').summernote({
        height: 200,
        minHeight: null,
        maxHeight: null,
        focus: true,
        airMode :false,
        placeholder : 'Enter your message here',
        popover : false,
        callbacks : {
            onImageUpload : function(fileList) {
                uploadImages(fileList[0], function(resp){
                    console.log(resp);
                    if(resp.success){
                        var element = document.createElement('img');
                        element.width = 100;
                        element.src = "/files/download/" + resp.data;
                        $('#message-input-box').summernote('insertNode', element);
                    }else{
                        alert('Couldn\'t upload the file');
                    }
                }, function(err){
                    alert('Couldn\'t upload the file');
                });
            }
        }
    });

    //$('.note-toolbar').append('<button class="btn" id="smileys-box"><i class="fa fa-smile-o"></i></button>');
});



function showChatBoxForUser(userId, username, friendPeerId) {
    destPeerId = friendPeerId;
    getConversationFromDb(userId, function (res) {
        var conversation = res.data;
        currentConversation = conversation;
        console.log(conversation)
        $("#user-messages").slideDown();
        removeActiveClassFromOtherLiElementInSidebar();
        $("#" + userId).addClass('active');
        $("#message-box-header").empty();
        $("#leave-btn").hide();
        $("#message-box-header").append('Send message to ' + username + '&nbsp;&nbsp;<a class="badge badge-primary" href="/user/' + username + '">View profile</a><span class="float-right"><i onclick="audioCall()" class="fa fa-phone fa-2x"></i>&nbsp;&nbsp;<i class="fa fa-video-camera fa-2x" onclick="videoCall()"></i></span>');
        $("#" + username + "-nb-unread-msg").html('');
        appendConversationToMessageBox(conversation);
        scrollToBottomMessageBox();
    }, function (err) {
        console.log(err);
    });
}

function showChatBoxForGroup(groupId, groupName){
    getGroupConversationFromDb(groupId, function (res) {
        var conversation = res.data;
        currentConversation = conversation;
        isGroup = true;
        $("#user-messages").slideDown();
        removeActiveClassFromOtherLiElementInSidebar();
        $("#" + groupId).addClass('active');
        $("#message-box-header").empty();
        $("#leave-btn").hide();
        $("#message-box-header").append('Send message to ' + groupName + '<span class="float-right"><i onclick="audioCall()" class="fa fa-phone fa-2x"></i>&nbsp;&nbsp;<i class="fa fa-video-camera fa-2x" onclick="videoCall()"></i></span>');
        $("#" + groupName + "-nb-unread-msg").html('');
        $("#leave-btn").remove();
        appendConversationToMessageBox(conversation);
        scrollToBottomMessageBox();
        var leaveGroupButton = document.createElement('button');
        leaveGroupButton.id ="leave-btn";
        leaveGroupButton.className = 'btn btn-danger';
        leaveGroupButton.setAttribute('onClick', "leaveGroup('" + groupId + "', '" + cm_loggedUserId + "')");
        leaveGroupButton.innerHTML = 'Leave this group';
        document.getElementById('chat-box-buttons').appendChild(leaveGroupButton);
    });

}

function showChatBoxForChannel(channelId, channelName){
    getGroupConversationFromDb(channelId, function (res) {

        var conversation = res.data;
        currentConversation = conversation;
        isGroup = true;
        $("#user-messages").slideDown();
        removeActiveClassFromOtherLiElementInSidebar();
        $("#" + channelId).addClass('active');
        $("#message-box-header").empty();
        $("#leave-btn").hide();
        $("#message-box-header").append('Send message to ' + channelName + '<span class="float-right"><i onclick="audioCall()" class="fa fa-phone fa-2x"></i>&nbsp;&nbsp;<i class="fa fa-video-camera fa-2x" onclick="videoCall()"></i></span>');
        $("#" + channelName + "-nb-unread-msg").html('');
        $("#leave-btn").remove();
        appendConversationToMessageBox(conversation);
        scrollToBottomMessageBox();
         var leaveChannelButton = document.createElement('button');
        leaveChannelButton.className = 'btn btn-danger';
        leaveChannelButton.id ="leave-btn";
        leaveChannelButton.setAttribute('onClick', "leaveChannel('" + channelId + "', '" + cm_loggedUserId + "')");
        leaveChannelButton.innerHTML = 'Leave this channel';
        document.getElementById('chat-box-buttons').appendChild(leaveChannelButton);
    });

}

function scrollToBottomMessageBox() {
    document.getElementById("message-box").scrollTop = document.getElementById("message-box").scrollHeight;
}

function removeActiveClassFromOtherLiElementInSidebar() {
    $('#friendsList').children().each(function () {
        $(this).removeClass('active');
        $(this).removeClass('active');
    });
    $('#groupsList').children().each(function () {
        $(this).removeClass('active');
        $(this).removeClass('active');
    });
    $('#channelsList').children().each(function () {
        $(this).removeClass('active');
        $(this).removeClass('active');
    });
}

function getConversationFromDb(userId, successCb, errorCb) {
    $.ajax({
        type: "POST",
        url: "/conversations/getStandardConversation",
        data: {
            userId: userId,
            createIfNotExist : true
        },
        dataType: 'json'
    }).done(function (resp) {
        successCb(resp);
    }).fail(function (err) {
        errorCb(err);
    });
}

function getGroupConversationFromDb(conversationId, successCb, errorCb) {
    $.ajax({
        type: "POST",
        url: "/conversations/getConversationById",
        data: {
            conversationId: conversationId
        },
        dataType: 'json'
    }).done(function (resp) {
        successCb(resp);
    }).fail(function (err) {
        errorCb(err);
    });
}

function getGroupConversationMessages(groupId, successCb, errorCb){
    $.ajax({
        type: "POST",
        url: "/messages/getGroupMessages",
        data: {
            groupId : groupId
        },
        dataType: 'json'
    }).done(function (resp) {
        successCb(resp);
    }).fail(function (err) {
        errorCb(err);
    });
}

function getConversationMessages(conversationId, successCb, errorCb) {
    $.ajax({
        type: "POST",
        url: "/conversations/getMessages",
        data: {
            conversationId: conversationId
        },
        dataType: 'json'
    }).done((resp) => {
        successCb(resp)
    }).fail((err) => errorCb(err));
}

function appendConversationToMessageBox(conversation) {
    if(conversation && conversation.messages){
        $('#message-box').empty();
        conversation.messages.forEach(function (message) {
            document.getElementById('message-box').appendChild(
                getBubbleMessage(message, message.authorId == cm_loggedUserId, conversation.allMembers.find(member => member._id.toString() == message.authorId.toString())));
        });
    }
    $.protip();
}

function getBubbleMessage(message, isEmitter, author) {
    var row = document.createElement('div');
    row.className = "row justify-content-" + (isEmitter == true ? "end" : "start");

    var col = document.createElement('div');
    col.className = "col-4";

    var bubbleMessage = document.createElement('div');
    bubbleMessage.className = "bubble-msg protip";
    bubbleMessage.setAttribute('data-pt-title', 'Sent on : ' + message.sendOn.toLocaleString());
    bubbleMessage.setAttribute('data-pt-position', 'top');
    bubbleMessage.setAttribute('data-pt-animate', 'pulse');
    bubbleMessage.setAttribute('data-pt-scheme', 'blue');
    bubbleMessage.innerHTML = emojify.replace(message.message);
    bubbleMessage.style.background = isEmitter == true ? "#2196F3" : "#E8EAF6";
    bubbleMessage.style.color = isEmitter == true ? "#fff" : "#000";

    col.appendChild(bubbleMessage);

    if(author){
        var authorDiv = document.createElement('div');
        var authorUsernameSpan = document.createElement('span');

        authorDiv.className = isEmitter ? "bubble-msg-emitter" : "bubble-msg-sender";
        if(author.profileImage){
            var authorImage = document.createElement('img');
            authorImage.className = "rounded-circle"
            authorImage.width = 18;
            authorImage.height = 18;
            authorImage.src = "/profile/image/" + author.profileImage;
            authorDiv.appendChild(authorImage);
        }
        authorUsernameSpan.innerText = "  " + author.username;
        authorDiv.appendChild(authorUsernameSpan);
        col.appendChild(authorDiv);
    }
    
    row.appendChild(col);

    return row;
}

function sendMessage() {

    if ($('#message-input-box').summernote('isEmpty')) {
        return;
    }
    var message = {};
    message.message = $('#message-input-box').summernote('code');
    message.sendOn = new Date();
    message.authorId = cm_loggedUserId;
    console.log(currentConversation)
    currentConversation.messages.push(message);
    console.log(currentConversation)
    $("#message-input-box").summernote('code', '');
    document.getElementById('message-box').appendChild(getBubbleMessage(message, true, currentConversation.allMembers.find(member => member._id.toString() == cm_loggedUserId.toString())));
    var authorUsername = cm_loggedUsername;

    saveMessageToDB(currentConversation._id, message.message, function (res) {
    var newlySavedMessage = res.data;
        if(isGroup){
            var peerIds = [];
            var receiversIds = [];
            currentConversation.members.forEach(function(member){
                cm_connectedUsers.forEach(function(connectedUser){
                    if(member._id.toString() == connectedUser._id.toString() && member._id.toString() != cm_loggedUserId.toString()){
                        receiversIds.push(member._id);
                        peerIds.push(connectedUser.peerId);
                    }
                })
            });
            sendGroupMessageToPeer(currentConversation._id, currentConversation.name, authorUsername, receiversIds, message, peerIds);
        }else{
            sendStandardMessageToPeer(currentConversation._id, authorUsername, receiverId, message, destPeerId);
        }
        scrollToBottomMessageBox();
    }, function (err) {
        console.log(err);
    });
}

function  uploadImages(file, successCb, errorCb){
    var data = new FormData();
    data.append('file', file);
    $.ajax({
        type : 'POST',
        url : "/files/upload",
        processData: false,
        contentType: false,
        data : data
    }).done(successCb).fail(errorCb);
}
function saveMessageToDB(conversationId, message, successCb, errorCb) {
    if (conversationId != undefined && message != undefined) {
        var dialogTitle, dialogBody;
        $.ajax({
            type: "POST",
            url: "/conversations/sendMessage",
            data: {
                conversationId: conversationId,
                message: message
            },
            dataType: 'json'
        }).done(function (resp) {
            successCb(resp);
        }).fail(function (err) {
            errorCb(err);
        });

    }

}

function addNewMessage(data) {
    if(currentConversation != undefined && currentConversation._id.toString() == data.conversationId.toString()){
        currentConversation.messages.push(data.message);
        document.getElementById('message-box').appendChild(getBubbleMessage(data.message, false, currentConversation.members.find(member => member._id.toString() == data.message.authorId.toString())));
        scrollToBottomMessageBox();
    }else{
        var unreadMessagesNumberFor = data.isGroup ? data.groupName : data.senderUsername;
        addNewUnreadMessageBadgeToOnSideBar(getNumberOfNewUnreadMessages(unreadMessagesNumberFor.split(' ').join('_')));
    }
}

function getNumberOfNewUnreadMessages(authorOrGroupName) {
    var unreadMessage = newUnreadMessagesRecord.find((unreadMessage) => unreadMessage.for == authorOrGroupName);
    if (unreadMessage) {
        unreadMessage.numberOfUnreadMessage++;
    } else {
        unreadMessage = {
            for: authorOrGroupName,
            numberOfUnreadMessage: 1
        };
        newUnreadMessagesRecord.push(unreadMessage);
    }
    return unreadMessage;
}

function addNewUnreadMessageBadgeToOnSideBar(unreadMessage) {
    $("#" + unreadMessage.for + "-nb-unread-msg").html(unreadMessage.numberOfUnreadMessage);
}


var outgoingCallRingtone = new Audio('/audios/outgoing_call_ringtone.mp3');
outgoingCallRingtone.loop = true;
var incomingCallRingtone = new Audio('/audios/incoming_call_ringtone.mp3');
incomingCallRingtone.loop = true;
var isAudioCall;

function audioCall(){
    isAudioCall = true;
    makeCall(isAudioCall);
}

function videoCall(){
    isAudioCall = false;
    makeCall(isAudioCall);
}

function makeCall(isAudioCall){
    cm_getStream(isAudioCall, function(localStream) {
        $("#outgoing-call-modal").modal({
            backdrop : false,
            keyboard : false,
            show :true
        });
        outgoingCallRingtone.play();

        if(isGroup){
            cm_connectedUsers.forEach(function(connectedUser){
                currentConversation.members.forEach(function(member){
                    if(member._id.toString() == connectedUser._id.toString()){
                        destPeersIds.push(connectedUser.peerId);
                    }
                })
            })
            makeGroupCallToPeer(destPeersIds, localStream, isAudioCall);
        }else{
            makeStandardCallToPeer(destPeerId, localStream, isAudioCall);
            return;
        }

    }, function(err){
        alert('Your browser doesn\"t support ' + (isAudioCall ? 'audio' : 'video') + ' calls');
    }); 
}

//dismissAudioCall
function dismissCall(audioElement){
    $(document).trigger('dismissCall');
    if(isGroup){
        dismissCallWithSockets(destPeersIds);
    }else{
        dismissCallWithSockets(destPeerId);
    }
    hideOutgoingCallModal();
}

function rejectCallBySocket(){
    hideIncomingCallModal()
}

var numberOfPeerRejectedCall = 0;
function rejectedCallBySocket(){
   if(isGroup){
       numberOfPeerRejectedCall++;
       if(numberOfPeerRejectedCall == destPeersIds.length - 1){
           numberOfPeerRejectedCall = 0;
           hideOutgoingCallModal();
           hideCallStreamingModal(isAudioCall);
       }
   }else{
       numberOfPeerRejectedCal = 0;
       hideOutgoingCallModal();
       hideCallStreamingModal(isAudioCall);
   }
}

function rejectCall(){
    $(document).trigger('rejectCall');
    hideIncomingCallModal();
}

function hideIncomingCallModal(){
    $("#incoming-call-modal").modal('hide');
    incomingCallRingtone.pause();
    incomingCallRingtone.currentTime = 0;
}

function hideOutgoingCallModal(){
    $("#outgoing-call-modal").modal('hide');
    outgoingCallRingtone.pause();
    outgoingCallRingtone.currentTime = 0;
}

function showCallStreamingModal(isAudioCall){
    var streamingElementId = isAudioCall ? 'audio-call-streaming-modal' : 'video-call-streaming-modal';
    $('#' + streamingElementId).modal({
        backdrop : false,
        keyboard : false,
        show :true
    });
}
function hideCallStreamingModal(isAudioCall){
    var streamingElementId = isAudioCall ? 'audio-call-streaming-modal' : 'video-call-streaming-modal';
    $('#' + streamingElementId).modal('hide');
}

function acceptCall(){
    $(document).trigger('acceptCall');
    hideIncomingCallModal();
}

function acceptedCallBySocket(){
    hideOutgoingCallModal();
}

function endCall(){
    $(document).trigger('endCall');
}

function muteCall(){
    $(document).trigger('muteCall');
    $('#microphone-action-btn').text('Unmute microphone').attr('onclick', 'unmuteCall()');
}


function unmuteCall(){
    $(document).trigger('unmuteCall');
    $('#microphone-action-btn').text('Mute microphone').attr('onclick', 'muteCall()');
}

function pauseVideoCall(){
    $(document).trigger('pauseVideoCall');
    $('#video-call-action-btn').text('Resume call').attr('onclick', 'resumeVideoCall()');
}


function resumeVideoCall(){
    $(document).trigger('resumeVideoCall');
    $('#video-call-action-btn').text('Pause call').attr('onclick', 'pauseVideoCall()');
}