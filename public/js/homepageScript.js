$(document).ready(function(){
    $('.container-tight').addClass('animated zoomInUp');
    setTimeout(function(){
        updateHomepage();
    }, 1000);
});

function updateHomepage(){
     updateNumberOfFriendsOnline();
     updateNumberOfGroups();
     updateNumberOfChannels();
}

function updateNumberOfFriendsOnline(){
    cm_getAllConnectedFriendsForUser($("#loggedUserId").val(), function(res){
        $("#number-connected-user").text(res.data.length);
    }, function(err){
        $("#number-connected-user").text(0);
    }, function(){
        $("#number-connected-user").addClass('animated bounce');
    });
}

function updateNumberOfGroups(){
    cm_getAllGroups(function(res){
    $('#number-groups').text(res.data.length);
    }, function(err){
        $("#number-groups").text(0);
    }, function(){
        $("#number-groups").addClass('animated bounce');
    });
}

function updateNumberOfChannels(){
    cm_getAllChannelByMember(function(res){
        $('#number-channels').text(res.data.length);
    },function(err){
        $("#number-channels").text(0);
    }, function(){
        $("#number-channels").addClass('animated bounce');
    });
    cm_getAllChannels(function(res){
     $("#new-channels").empty();
    res.data.forEach(function(channel){
        $("#new-channels").
        append('<a href="#" class="list-group-item list-group-item-action flex-column align-items-start">' +
              '<div class="d-flex w-100 justify-content-between">' +
                '<h5 class="mb-1">' + channel.name + '</h5>' +
                '<small class="text-muted">' + channel.members.length + ' members</small>' +
              '</div>' +
              '<p class="mb-1">' + channel.description + '</p>' +
            '</a>');
    });
    }, function(err){
        //$("#number-channels").text(0);
    }, function(){
        $("#new-channels").addClass('animated bounce');
    });
}