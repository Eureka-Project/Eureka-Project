var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// Connect to the online mongolab server:
mongoose.connect('mongodb://eureka:Eureka@ds033145.mongolab.com:33145/eurekadb');

// Connect locally:
// mongoose.connect('localhost:27018');
// Terminal command:
// dbpath="server/db/db"; ! [ -d "${dbpath}" ] && mkdir -p "${dbpath}"; mongod --port 27018 --dbpath "${dbpath}" --wiredTigerJournalCompressor snappy --wiredTigerCollectionBlockCompressor snappy --cpu

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

userSchema.methods.isPassword = function(guess) {
  return bcrypt.compareSync(guess, this.password);
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



var linkSchema = mongoose.Schema({
	title: { type: String, default: '' },
  url: String,
  description: { type: String, default: '' },
  site_name: { type: String, default: '' },
  image: { type: String, default: '' },
	visits: { type: Number, default: 0 },
  upvotes: { type: Number, default: 0 },
  userid: { type: String, default: '' },
  username: { type: String, default: '' },
	date: { type: Date, default: Date.now }

});

var upvoteSchema = mongoose.Schema({
	user_id: String,
	link_id: String,
	date: { type: Date, default: Date.now }

});

var secretSchema = mongoose.Schema({
  secret: String,
  date: Date
});

var tokenSchema = mongoose.Schema({
  user_id: String,
  username: String,
  firstname: String,
  lastname: String,
  date: { type: Date, default: Date.now }
});

var models = {

  Links: mongoose.model('Url', linkSchema),
	// Links: mongoose.model('Link', linkSchema),
	Users: mongoose.model('User', userSchema),
	Upvotes: mongoose.model('Upvote', upvoteSchema),
  Secrets: mongoose.model('Secret', secretSchema)
};

module.exports = models;

// 'mongodb://<Eureka>:<Eureka1?>@ds033175.mongolab.com:33175/eurekadb'
// 'mongodb://localhost:27017'