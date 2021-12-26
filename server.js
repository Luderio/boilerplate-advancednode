'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection.js');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session');
const passport = require('passport');
const routes = require('./routes');
const auth = require('./auth.js');


const app = express();
app.set('view engine', 'pug');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')(session);
const URI = process.env.MONGO_URI;
const store = new MongoStore({url: URI});

fccTesting(app); // For fCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
  key: 'express.sid',
  store: store
}));

app.use(passport.initialize());
app.use(passport.session());

//Initialized Memory Store for Socket.io
io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  key: 'express.sid',
  secret: process.env.SESSION_SECRET,
  store: store,
  success: onAuthorizeSuccess,
  fail: onAuthorizeFail
})
);


myDB(async (client) => {
  //this line creates a database called 'database' and creates a table called users.
  const myDataBase = await client.db('database').collection('users'); 

  routes(app, myDataBase);
  auth(app, myDataBase);

  let currentUsers = 0;

  //Socket.io connection listener.
  io.on('connection', (socket) => {
    ++currentUsers;//incrementer for the counter.
    io.emit('user count', currentUsers);
    console.log('A user has connected');
    console.log('user ' + socket.request.user.username + ' connected');

    //event listener for the users who disconnects.
    socket.on('disconnect', () => {
      console.log("the user has disconnected.");
      --currentUsers;
      io.emit('user count', currentUsers);
    });
  });

}).catch((e) => {
  app.route('/').get((req, res) => {
    res.render(process.cwd() + '/views/pug', { title: e, message: 'Unable to login' });
  });
});

function onAuthorizeSuccess(data, accept) {
  console.log('successful connection to socket.io');

  accept(null, true);
}

function onAuthorizeSuccess(data, message, error, accept) {
  if (error) throw new Error(message);
  console.log('failed connection to socket.io: ', message);
  accept(null, false)
}

// app.listen out here...
http.listen(process.env.PORT || 3000, () => {
  console.log('Listening on port ' + process.env.PORT);
});