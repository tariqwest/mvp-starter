var express = require('express');
var bodyParser = require('body-parser');
var db = require('../database-mongo');
var User = db.User;
var Location = db.Location;
var passport = require('passport');
var fbStrategy = require('passport-facebook').Strategy;
var fbConfig = require('./fb.js');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;



var app = express();

passport.use(new fbStrategy({  
    clientID: fbConfig.appId,
    clientSecret: fbConfig.appSecret,
    callbackURL: fbConfig.callbackUrl,
    profileFields: ['id', 'email', 'first_name', 'last_name'],
  },
  function(token, refreshToken, profile, done) {
    process.nextTick(function() {
      User.findOne({ 'fb_id': profile.id }) 
        .then(function(user, err) {
          if (err){
            return done(err);
          }
          if (user) {
            return done(null, user);
          } else {
            var newUser = new User();
            newUser.fb_id = profile.id;
            newUser.fb_token = token;
            newUser.fb_name = profile.name.givenName + ' ' + profile.name.familyName;
            //newUser.fb_email = (profile.emails[0].value || '').toLowerCase();

            newUser.save(function(err) {
              if (err){
                //throw err;
              }
              console.log('** New user created **', newUser);
              return done(null, newUser);
            });
          }
      });
    });
  }));



// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// middleware - required for passport
app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// middleware - other
//app.use(morgan('combined'));
app.use(cookieParser());
app.use((bodyParser).urlencoded({ extended: true }));

// static files for react
app.use('/app', ensureLoggedIn('/login'));

app.use('/app', express.static(__dirname + '/../react-client/dist'));

app.get('/', ensureLoggedIn('/login'), function(req, res){
  res.redirect('/app');
});

app.use('/login', express.static(__dirname + '/login.html'));


app.get('/login/facebook',
  passport.authenticate('facebook'));

app.get('/login/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/users/current', ensureLoggedIn('/login'), function(req, res){
  res.send({
    fb_id: req.session.passport.user.fb_id,
    fb_name: req.session.passport.user.fb_name
  });
});

app.post('/users/:fb_id/locations', ensureLoggedIn('/login'), function(req, res){
  console.log('** Req **', req.body, req.params);
  res.status(200).send(req.body);
});

app.listen(3000, function() {
  console.log('listening on port 3000!');
});

