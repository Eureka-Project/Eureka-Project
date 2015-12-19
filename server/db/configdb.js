
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var Q        = require('q');
mongoose.connect('mongodb://eureka:Eureka@ds033145.mongolab.com:33145/eurekadb');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
	console.log('connection made');
});

var SALT_WORK_FACTOR  = 10;

var userSchema = mongoose.Schema({
	username: String,
	password: String,
	firstname: String,
	lastname: String,
	date: { type: Date, default: Date.now },
});

userSchema.methods.comparePasswords = function(candidatePassword) {
  var defer = Q.defer();
  var savedPassword = this.password;
  bcrypt.compare(candidatePassword, savedPassword, function (err, isMatch) {
    if (err) {
      defer.reject(err);
    } else {
      defer.resolve(isMatch);
    }
  });
  return defer.promise;
};

userSchema.pre('save', function (next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) {
      return next(err);
    }

    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) {
        return next(err);
      }

      // override the cleartext password with the hashed one
      user.password = hash;
      user.salt = salt;
      next();
    });
  });
});



var urlSchema = mongoose.Schema({
	title: { type: String, default: '' },
  url: String,
  description: { type: String, default: '' },
  site_name: { type: String, default: '' },
  image: { type: String, default: '' },
	visits: { type: Number, default: 0 },
  upvotes: { type: Number, default: 0 },
  userid: { type: Number, default: 0 },
	date: { type: Date, default: Date.now }

});

var upVoteSchema = mongoose.Schema({
	user_id: String,
	link_id: String,
	date: { type: Date, default: Date.now }

});

var models = {

	Url: mongoose.model('Url', urlSchema),
	User: mongoose.model('User', userSchema),
	Upvote: mongoose.model('Upvote', upVoteSchema)

};

module.exports = models;

// 'mongodb://<Eureka>:<Eureka1?>@ds033175.mongolab.com:33175/eurekadb'
// 'mongodb://localhost:27017'