var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

mongoose.connect('mongodb://localhost/photolater');

var db = mongoose.connection;

db.on('error', function() {
  console.log('mongoose connection error');
});

db.once('open', function() {
  console.log('mongoose connected successfully');
});


// Users
var userSchema = mongoose.Schema({
  fb_id: { type: String, unique: true },
  fb_token: String,
  fb_name: String,
  fb_email: String
});

var User = mongoose.model('User', userSchema);


// Locations
var locationSchema = mongoose.Schema({
  lat: String,
  lng: String,
  owner: String,
  photos: [],
});

var Location = mongoose.model('Location', locationSchema);


// Common methods
var selectAll = function(callback) {
  Item.find({}, function(err, items) {
    if(err) {
      callback(err, null);
    } else {
      callback(null, items);
    }
  });
};


module.exports.User = User;
module.exports.Location = Location;
