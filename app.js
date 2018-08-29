// Requires
var express = require('express');
var socketIo = require('socket.io');
var path = require('path');
var https = require('https');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expHandlebars = require('express-handlebars');
var expValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var passportLocal = require('passport-local');
var fileUpload = require('express-fileupload');
var fileHelper = require('./helpers/fileHelper');
var peer = require('peer');
var cors = require('cors');

var connectedUser;




var options = {
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'key.pem'), 'utf8'),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pem'), 'utf8')
};


fileHelper.profileImageDirectorySetup();
var ExpressPeerServer = peer.ExpressPeerServer;
var plStrategy = passportLocal.Strategy;


var index = require('./routes/index');
var account = require('./routes/account');
var chat = require('./routes/chat');
var search = require('./routes/search');
var requests = require('./routes/requests');
var user = require('./routes/user');
var error = require('./routes/error');
var status = require('./routes/status');
var friends = require('./routes/friends');
var conversations = require('./routes/conversations');
var groups = require('./routes/groups');
var channels = require('./routes/channels');
var User = require('./models/user');
var connections = require('./routes/connections');
var files = require('./routes/files');
var notifications = require('./routes/notification');

// Init chatApp
var app = express();

// View settings
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');
app.engine('handlebars', expHandlebars({
    defaultLayout : 'layout'
}));
app.enable('view cache');

// Middlewares
//app.use(cors({origin: 'https://127.0.0.1:3000'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended : false
}));
app.use(cookieParser());
app.use(fileUpload());
// Static Folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join('node_modules/jquery/dist')));
app.use('/js', express.static(path.join('node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join('node_modules/socket.io-client/dist')));
app.use('/js', express.static(path.join('node_modules/bootstrap/src/js')));
app.use('/js', express.static(path.join('node_modules/emoji-js/lib')));
app.use('/js', express.static(path.join('node_modules/protip')));
app.use('/css', express.static(path.join('node_modules/bootstrap/dist/css')));
app.use('/css', express.static(path.join('node_modules/protip')));
app.use(express.static(path.join('node_modules/tether/dist')));

//app.use('/profile/image', quickThumb.static('/profile/image'));
// Express session Configuration
app.use(session({
    secret : 'itsverysecretpleasechangeitwithmoresecretcodethatyouhave',
    saveUninitialized : true,
    resave : true
}));

// Passport Init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  },
  customValidators: {
      isSameText : (param, text) => {
          return param.toString() === text.toString();
      }
  }
}));

// Connect flash
app.use(flash());



// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    // For passport message because it sets to error not to error_msg
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});


/*app.all('/', function (req, res, next) {
  console.log('Accessing the secret section ...')
  next() // pass control to the next handler
});*/
app.use('/', index);
app.use('/error', error);
app.use('/account', account);
app.use('/connections', connections);
app.use((req, res, next) => {
    if(req.user){
        connectedUser = req.user;
        next();
    }else{
        res.redirect('/account/login');
    }
})
app.use('/profile/image',express.static( fileHelper.getProfileImageFolder()));
app.use('/chat', chat);
app.use('/search', search);
app.use('/requests', requests);
app.use('/user', user);
app.use('/status', status);
app.use('/friends', friends);
app.use('/conversations', conversations);
app.use('/groups', groups);
app.use('/channels', channels);
app.use('/files', files);
app.use('/notifications', notifications);
// Setting port
app.set('port', process.env.PORT || 3000);


var server = https.createServer(options, app);
server.listen(app.get('port'));
var io = socketIo.listen(server);

peerServer = ExpressPeerServer(server,{
    debug: true,
    allow_discovery: true
});
app.use('/peerjs', peerServer);

app.locals.connectedUsers = [];

peerServer.on('connection', function(id) {
    connectedUser.peerId = id;
    app.locals.connectedUsers.push(connectedUser);
    io.emit('updatedConnectedFriendsList', app.locals.connectedUsers);
});
peerServer.on('disconnect', function(id) {
    var peerIndex = app.locals.connectedUsers.findIndex(connUser =>connUser.peerId.toString() == id.toString());
    app.locals.connectedUsers.splice(peerIndex, 1);
    io.emit('updatedConnectedFriendsList', app.locals.connectedUsers);
});


io.on('connection', (socket) => {
    socket.on('dismissCall', (peerIds) => {
        if(peerIds != undefined && peerIds != null){
            var userIds = [];
            app.locals.connectedUsers.forEach((connectedUser) => {
                if(typeof peerIds == 'string'){
                    if(peerIds == connectedUser.peerId){
                        userIds.push(connectedUser._id);
                    }
                }else{
                    if(peerIds.find(peerId => peerId == connectedUser.peerId)){
                        userIds.push(connectedUser._id);
                    }
                }
            })
            
            if(userIds.length > 0){
                io.emit('dismissedCall', userIds);
            }
        }
    });

    socket.on('rejectCall', (peerId) => {
        if(peerId != undefined){
            var user = app.locals.connectedUsers.find(connectedUser => connectedUser.peerId == peerId);
            if(user){
                io.emit('rejectedCall', user._id);
            }
        }
    });

    socket.on('acceptCall', (peerId) => {
        if(peerId != undefined){
            var user = app.locals.connectedUsers.find(connectedUser => connectedUser.peerId == peerId);
            if(user){
                io.emit('acceptedCall', user._id);
            }
        }
    });

    socket.on('sendNotification', (data) => {
        if(data != undefined && data.sentBy != undefined && data.notificationBody != undefined && data.sentTo != undefined && data.notificationId != undefined){
            var sentTo = typeof data.sentTo == 'string' ? [data.sentTo] : data.sentTo;
            io.emit('onNotification', {
                sentBy : data.sentBy,
                notificationBody : data.notificationBody.toString(),
                recievers : data.sentTo
            })
        }
    })
});