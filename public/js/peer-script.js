var peer = new Peer({
    host: '127.0.0.1',
    port: 3000,
    debug: 0,
    secure : true,
    path : '/peerjs',
    config: {'iceServers': [
    { url: 'stun:stun1.l.google.com:19302' },
    { url: 'turn:numb.viagenie.ca',
    credential: 'muazkh', username: 'webrtc@live.com' }
    ]}
});

peer.on('open', function(id) {
    cm_loggedUserId =$('#loggedUserId').val();
    cm_loggedUsername = $('#loggedUsername').val();
    cm_loggedUserSocketId = id;
    console.log(id);
});

// Local
function sendMessageToPeer(destPeerId, messageInformations){ 
    var conn = peer.connect(destPeerId);
    conn.on('open', function() {
        conn.on('data', function(data) {
            addNewMessage(data);
        });
        conn.send(messageInformations);
    });
}

function sendStandardMessageToPeer(conversationId, senderUsername, receiverId, message, destPeerId){
    sendMessageToPeer(destPeerId,{
        senderUsername : senderUsername,
        conversationId : conversationId,
        receiverId : receiverId,
        message : message,
        isGroup : false
    });
}

function sendGroupMessageToPeer(conversationId, groupName, senderUsername, receiversIds, message, peersIds){
  receiversIds.forEach(function(recieverId, index) {
      sendMessageToPeer(peersIds[index],{
        senderUsername : senderUsername,
        conversationId : conversationId,
        receiverId : receiverId,
        message : message,
        isGroup : true,
        groupName : groupName
    });
  });
}



// Remote
peer.on('connection', function(conn) {
    conn.on('data', function(data) {
        addNewMessage(data);
    });
});

var localStream;
var peerStream;
var call;
var isAudioCall;
var localVideoElement;

function makeStandardCallToPeer(peerId, stream, isAudioCallRequest){
    isAudioCall = isAudioCallRequest;
    if(isAudioCallRequest == false){
        localVideoElement = document.getElementById('local-video-call-stream');
        localVideoElement.src = window.URL.createObjectURL(stream);
        localVideoElement.onloadedmetadata = function(e){
        }
    }
    call = peer.call(peerId, stream, {
        metadata : {
            isAudioCall : isAudioCall
        }
    });
    call.on('stream', function(stream) {
        if(isAudioCall == false){
            localVideoElement.play();
        }
        showCallStreamingModal(isAudioCall);
        peerStream = stream;
        onReceiveStream(peerStream)
    });
    $(document).on('endCall', function(){
        numberOfPeers = 0;
        hideCallStreamingModal(isAudioCall);
        rejectCallWithSockets(call.peer);
        localStream = null;
        call.close(stream);
    });
    $(document).on('muteCall', function(){
        stream.getAudioTracks()[0].enabled = false;
    });
    $(document).on('unmuteCall', function(){
        stream.getAudioTracks()[0].enabled = true;
    });
    $(document).on('pauseVideoCall', function(){
        stream.getVideoTracks()[0].enabled = false;
    });
    $(document).on('resumeVideoCall', function(){
        stream.getVideoTracks()[0].enabled = true;
    });
}

function makeGroupCallToPeer(peersIds, stream, isAudioCallRequest){
    peersIds.forEach(function(peerId){
        makeStandardCallToPeer(peerId, stream, isAudioCallRequest);
    });
}

peer.on('call', function(call) {
    onReceiveCall(call, call.metadata.isAudioCall);
});


function onReceiveCall(call, isAudioCall){

    cm_getStream(isAudioCall,
        function(stream){
            $("#incoming-call-modal").modal({
                backdrop : false,
                keyboard : false,
                show :true
            });
            incomingCallRingtone.play();
            peerStream = stream;

            $(document).on('rejectCall endCall dismissCall', function(){
                numberOfPeers = 0;
                rejectCallWithSockets(call.peer);
                hideCallStreamingModal(isAudioCall);
                call.close(stream);
            });

             $(document).on('acceptCall', function(){
                call.answer(stream);
                if(isAudioCall == false){
                    var localVideoElement = document.getElementById('local-video-call-stream');
                    localVideoElement.src = window.URL.createObjectURL(stream);
                    localVideoElement.onloadedmetadata = function(e){
                        localVideoElement.play();
                    }

                }
                $(document).on('muteCall', function(){
                    stream.getAudioTracks()[0].enabled = false;
                });
                $(document).on('unmuteCall', function(){
                    stream.getAudioTracks()[0].enabled = true;
                });
                $(document).on('pauseVideoCall', function(){
                    stream.getVideoTracks()[0].enabled = false;
                });
                $(document).on('resumeVideoCall', function(){
                    stream.getVideoTracks()[0].enabled = true;
                });
                showCallStreamingModal(isAudioCall);
                acceptCallWithSocket(call.peer);
            });

        },
        function(err){
            alert('Your browser doesn\'t support ' + (isAudioCall ? 'audio' : 'video') + ' calls');
        }
    );

    call.on('stream', onReceiveStream);
}
var numberOfPeers = 0;
 function onReceiveStream(stream){
     numberOfPeers++;
     var callElement
     if(numberOfPeers > 1 && isAudioCall == false){
         callElement = document.getElementById('remote-users-streams');
         var videoElement = document.createElement('video');
         videoElement.id = 'remote-user-' + numberOfPeers;
         videoElement.src = window.URL.createObjectURL(stream);
         videoElement.onloadedmetadata = function(e){
            videoElement.play();
         }
         callElement.appendChild(videoElement);

     }else{
         callElement = isAudioCall ? document.getElementById('audio-call-stream') : document.getElementById('remote-video-call-stream');
         callElement.src = window.URL.createObjectURL(stream);
        callElement.onloadedmetadata = function(e){
            callElement.play();
        }
     }
}