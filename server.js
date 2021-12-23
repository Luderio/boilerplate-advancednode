'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const app = express();

//view engine - Lesson 1: Set up a Template Engine
app.set('view engine', 'pug');

fccTesting(app); // For fCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lesson 3: Set up Passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

//Query search for a Mongo DB Id
const ObjectID = require('mongodb').ObjectID;

myDB(async (client) => {
  const myDataBase = await client.db('database').collection('users');

  //Template Engine - Lesson 2: Use a Template Engine's Powers
  app.route('/').get((req, res) => {
    res.render(process.cwd() + '/views/pug', 
    {
      title: 'Connected to the Database',
      message: 'Please login'
    });
  });

  //Lesson4: Serialization of a User Object
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  passport.deserializeUser((id, done) => {
    myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
      done(null, doc);
    });
  });
  
}).catch((e) => {
  app.route('/').get((req, res) => {
    res.render(process.cwd() + '/views/pug/index.pug', { title: e, message: 'Unable to login' });
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Listening on port ' + process.env.PORT);
});