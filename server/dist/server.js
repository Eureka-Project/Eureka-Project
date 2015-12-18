var jwt  = require('jwt-simple');

var secret = 'Festus is the bestest';

module.exports = {
  errorLogger: function (error, req, res, next) {
    // log the error then send it to the next middleware in
    // middleware.js

    console.error(error.stack);
    next(error);
  },
  errorHandler: function (error, req, res, next) {
    // send error message to client
    // message for gracefull error handling on app
    res.status(500).send({error: error.message});
  },

  decode: function (req, res, next) {
    var token = req.headers['x-access-token'];
    var user;

    if (!token) {
      return res.status(403).send(); // send forbidden if a token is not provided
    }

    try {
      // decode token and attach user to the request
      // for use inside our controllers
      user = jwt.decode(token, secret);
      req.user = user;
      next();
    } catch(error) {
      return next(error);
    }

  }
};


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
	date: { type: Date, default: Date.now }

});

var upVoteSchema = mongoose.Schema({
	userid: String,
	linkid: String,
	date: { type: Date, default: Date.now }

});

var models = {

	Url: mongoose.model('Url', urlSchema),
	User: mongoose.model('User', userSchema),
	UpVote: mongoose.model('Upvote', upVoteSchema)

};

module.exports = models;

// 'mongodb://<Eureka>:<Eureka1?>@ds033175.mongolab.com:33175/eurekadb'
// 'mongodb://localhost:27017'
var Users = require('../db/configdb.js').User;
var Q = require('q');
var jwt = require('jwt-simple');

var secret = 'Festus is the bestest';

module.exports = {
  login: function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    var findUser = Q.nbind(Users.findOne, Users);
    findUser({username: username})
      .then(function (user) {
        if (!user) {
          next(new Error('User does not exist'));
        } else {
          return user.comparePasswords(password)
            .then(function(foundUser) {
              if (foundUser) {
                var token = jwt.encode(user, secret);
                res.json({username: user.username, token: token});
              } else {
                return next(new Error('No user'));
              }
            });
        }
      })
      .fail(function (error) {
        next(error);
      });
  },

  signup: function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;

    var findOne = Q.nbind(Users.findOne, Users);

    // check to see if user already exists
    findOne({username: username})
      .then(function(user) {
        if (user) {
          next(new Error('User already exist!'));
        } else {
          // make a new user if not one
          var create = Q.nbind(Users.create, Users);
          var newUser = {
            username: username,
            password: password,
            firstname: firstname,
            lastname: lastname
          };
          return create(newUser);
        }
      })
      .then(function (user) {
        // create token to send back for auth
        var token = jwt.encode(user, secret);
        res.json({username: user.username, token: token});
      })
      .fail(function (error) {
        next(error);
      });
  },

  checkAuth: function (req, res, next) {
    // checking to see if the user is authenticated
    // grab the token in the header is any
    // then decode the token, which we end up being the user object
    // check to see if that user exists in the database
    var token = req.headers['x-access-token'];
    if (!token) {
      next(new Error('No token'));
    } else {
      var user = jwt.decode(token, secret);
      var findUser = Q.nbind(Users.findOne, Users);
      findUser({username: user.username})
        .then(function (foundUser) {
          if (foundUser) {
            res.status(200).send();
          } else {
            res.status(401).send();
          }
        })
        .fail(function (error) {
          next(error);
        });
    }
  }
};

var usersController = require('./usersController.js');


module.exports = function (app) {
  // app === userRouter injected from middlware.js

  app.post('/login', usersController.login);
  app.post('/signup', usersController.signup);
  app.get('/signedin', usersController.checkAuth);
};
