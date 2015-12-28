var Q = require('q');
var jwt = require('jwt-simple');

var Users = require('../db/configdb.js').User;
var Links = require('../links/linksController.js');
var Upvotes = require('../upvotes/upvotesController.js');


var secret = 'Festus is the bestest';

exports = module.exports = {

  findUser: Q.nbind(Users.findOne, Users),
  
  createUser: Q.nbind(Users.create, Users),
  
  login: function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    exports.findUser({ username: username })
      .then(function (user) {
        if (!user) {
          next(new Error('User does not exist'));
        } else {
          return user.comparePasswords(password)
            .then(function(foundUser) {
              if (foundUser) {
                var token = jwt.encode(user, secret);
                res.json({
                  username: user.username,
                  user_id: user['_id'],
                  token: token
                });
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

    // check to see if user already exists
    exports.findUser({ username: username })
      .then(function(user) {
        if (user) {
          next(new Error('User already exist!'));
        } else {
          // make a new user if not one
          return exports.createUser({
            username: username,
            password: password,
            firstname: firstname,
            lastname: lastname
          });
        }
      })
      .then(function (user) {
        // create token to send back for auth
        // user example: {
        //   date: Fri Dec 18 2015 19:12:33 GMT-0600 (CST),
        //   _id: 5674af012e5833104b30ef0f,
        //   lastname: 'test2',
        //   firstname: 'test2',
        //   password: '$2a$10$5kWIkSPNOPvf3fFH8fkxUek9PMAy4saUj5LC2D.pbyD1NO7I7P.X.',
        //   username: 'test2',
        //   __v: 0
        // }

        var token = jwt.encode(user, secret);
        res.json({
          username: user.username,
          user_id: user._id,
          token: token
        });
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
      exports.findUser({username: user.username})
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
  },

  getUserInfo: function (req, res, next) {
    var user_id = req.params.user_id;

    exports.findUser({ _id: user_id })
      .then(function (user) {
        res.json({
          firstname: user.firstname,
          lastname: user.lastname,
          username: user.username,
          user_id: user._id
        });
      })
      .fail(function (error) {
        next(error);
      });
  },

  getProfileInfo: function (req, res, next) {
    var user_id = req.params.user_id;

    var userData = {};

    exports.findUser({ _id: user_id })
      .then(function(user) {
        userData = {
          firstname: user.firstname,
          lastname: user.lastname,
          username: user.username,
          user_id: user._id,
        };
        return Upvotes.findUpvotes({ user_id: userData.user_id });
      })  
      .then(function(upvotes) {
        return Links.findLinks({
          _id: {
            $in: upvotes.map(function(upvote) {
              return upvote.link_id;
            })
          }
        });
      })
      .then(function(upvotedLinks) {
        userData.upvotedLinks = upvotedLinks
        return Links.findLinks({ userid: userData.user_id });
      })
      .then(function(links) {
        userData.submittedLinks = links;
        res.json(userData);
      })
      .fail(function(error) {
        next(error);
      });
  }

}