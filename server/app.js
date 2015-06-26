// Dependencies
var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var passport     = require('passport');
var session      = require('express-session');

// Routes
var routes       = require('./../routes/index');
var users        = require('./../routes/user');
var dashboard    = require('./../routes/dashboard');
var Student        = require('../app/models/student');
var Instructor        = require('../app/models/instructor');
var auth         = require('./../routes/auth');
var student         = require('./../routes/student');
var api         = require('./../routes/api');

// Authentication
var LocalStrategy = require('passport-local').Strategy;

var app = express();

app.use(favicon(__dirname + '/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/doc', express.static('doc'));
// Initiate passport and passport session
app.use(passport.initialize());
app.use(passport.session());

// Express-session settings
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

// Routing
app.use('/', routes);
app.use('/api', api);
// app.use('/checkauth', routes);
app.use('/api/user', users);
app.use('/auth', auth);

// Passport will serialize and deserialize user instances to and from the session.
// Not using these right now, maybe later?
passport.serializeUser(function(user, done) {
  console.log('Serializing User!!!' + user);
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  console.log('Deserializing User!!!' + user);
  done(null, obj);
});


// Local Auth
passport.use('local',new LocalStrategy(
  function(username, password, done) {
    new Student({ username: username })
      .fetch()
      .then(function(user) {
        if (!user) {
          // check for user in instructor
          new Instructor({ username: username })
            .fetch()
            .then(function(user) {
            if (!user) {
              return done(null, false, { message: 'Incorrect username.' });
            }
            if (user.comparePassword(password,function(x){
              if (x === true){
                return done(null, user);
              } else {
                return done(null, false, { message: 'Incorrect password.' });
              }
            })){}
          });
        } else {
          // user is a student
          if (user.comparePassword(password,function(x){
            if (x === true){
              return done(null, user);
            } else {
              return done(null, false, { message: 'Incorrect password.' });
            }
          })){}
        }
    });

  }));

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {

    res.status(err.status || 500);
    console.log('Error:',err.message);
    // res.end(err.message);
    res.redirect('/auth/login');
  });
}
else {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err.message);
    res.end(err.message);
  });
}


module.exports = app;






