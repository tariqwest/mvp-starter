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
var FB = require('fb');


var app = express();

passport.use(new fbStrategy({  
    clientID: fbConfig.appId,
    clientSecret: fbConfig.appSecret,
    callbackURL: fbConfig.callbackUrl,
    profileFields: ['id', 'email', 'first_name', 'last_name', 'photos', 'albums'],
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
app.use(bodyParser.json())
   .use(bodyParser.urlencoded());
//app.use((bodyParser).urlencoded({ extended: true }));



// static files for react
app.use('/app', ensureLoggedIn('/login'));

app.use('/app', express.static(__dirname + '/../react-client/dist'));

app.get('/', ensureLoggedIn('/login'), function(req, res){
  res.redirect('/app');
});

app.use('/login', express.static(__dirname + '/login.html'));


app.get('/login/facebook',
  passport.authenticate('facebook', { scope: ['user_posts', 'user_photos', 'publish_actions'] }));

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

// Setup FB graph connection
FB.options({
  appId: fbConfig.appId,
  version: 'v2.9',
  appSecret: fbConfig.appSecret,
});

// http://localhost:3000/users/10209160608707639/locations/590765e2b6e78a37424d51d5/publish

app.get('/users/:fb_id/locations/:location/publish', ensureLoggedIn('/login'), function(req, res){
  var photos;
  Location.findOne({_id: req.params.location})
  .then(function(location){
    console.log('** Found location **', location);
    photos = location.photos;
    User.findOne({fb_id: req.params.fb_id})
    .then(function(user){
      console.log('** Found user **', user);
      FB.setAccessToken(user.fb_token);
      FB.api('me/albums', 'post', { name: location._id }, function (fbres) {
        if(!fbres || fbres.error) {
          console.log('FB post error occurred', (fbres.error || 'no error returned'));
          return;
        }
        console.log('Album Id: ' + fbres.id);
        uploadCallback(fbres.id, location);
      })
    })
    .catch(function(err){
      console.log(err);
    });
  });
});


var uploadCallback = function(album_id, location, res){
        var batch = [];
        for(var photo of location.photos){
          var photoUrl = 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '.jpg'

          FB.api('/' + album_id + '/photos', 'post', { url: photoUrl, caption: 'My vacation' }, function (res) {
            if(!res || res.error) {
              console.log(!res ? 'error occurred' : res.error);
              return;
            }
            console.log('Post Id: ' + res.post_id);
          });
        }
        // FB.api('', 'post', {
        //     batch: batch
        // }, function (fbres) {
        //     //var res0;
         
        //     // if(!fbres || fbres.error) {
        //     //     console.log(!fbres ? 'error occurred' : fbres.error);
        //     //     return;
        //     // }
         
        //     // res0 = JSON.parse(fbres[0].body);
         
        //     // if(res0.error) {
        //     //     console.log(res0.error);
        //     // } else {
        //     //     console.log('Post Id: ' + res0.id);
        //     // }

        //     console.log(fbres);
        // })
      };


app.put('/users/:fb_id/locations/:location', ensureLoggedIn('/login'), function(req, res){
  console.log('** Req **', req.body, req.params);
  Location.findOne({_id: req.params.location})
  .then(function(location){
    console.log('** Found location **', location);
    for(var photo of req.body){
      location.photos.push(photo);
    }
    location.save()
    .then(function(location){
      console.log('** Saved photos **', location.photos)
      res.status(200).send(req.body);
    })
    .catch( function(err){
      console.log(err);
    });
  })
  .catch(function(err){
    console.log(err);
  });
});

app.post('/users/:fb_id/locations', ensureLoggedIn('/login'), function(req, res){
  var newLocation = new Location({
    lat: req.body.location.lat, 
    lng: req.body.location.lng,
    owner: req.body.fb_id
  });
  newLocation.save()
  .then(function(location){
    res.status(200).send(location);
  })
  .catch(function(err){
    console.log(err);
  });
});


app.listen(3000, function() {
  console.log('listening on port 3000!');
});

