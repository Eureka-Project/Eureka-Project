var Users = require('../db/configdb.js').User;
var Links = require('../db/configdb.js').Url;
var Upvotes = require('../db/configdb.js').Upvote;
var Q = require('q');
var jwt = require('jwt-simple');

var secret = 'Festus is the bestest';

module.exports = {
  login: function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    var findUser = Q.nbind(Users.findOne, Users);
    findUser({ username: username })
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

    var findOne = Q.nbind(Users.findOne, Users);

    // check to see if user already exists
    findOne({ username: username })
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
          user_id: user['_id'],
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
  },

  userID: function (req, res, next) {
    var userID = req.params.userID;
    console.log('user: ', userID)
    var findOne = Q.nbind(Users.findOne, Users);
    // check to see if user exists
    findOne({ _id: userID })
      .then(function(user) {
        res.json({
          firstname: user.firstname,
          lastname: user.lastname,
          username: user.username,
          user_id: user['_id']
        });
      })
      .fail(function (error) {
        next(error);
      });
  },

  profileInfo: function (req, res, next) {
    var userID = req.params.userID;
    console.log('user: ', userID)
    var findOne = Q.nbind(Users.findOne, Users);
    var findLinks = Q.nbind(Links.find, Links);
    var findUpvotes = Q.nbind(Upvotes.find, Upvotes);
    // check to see if user exists
    findOne({ _id: userID })
      .then(function(user) {
        var userData = {
          firstname: user.firstname,
          lastname: user.lastname,
          username: user.username,
          user_id: user['_id'],
        };
        findUpvotes({ user_id: userData.user_id })
        .then(function(upvotedLinks) {
          var upvotedLinkIDs = [];
          for (var x = 0; x < upvotedLinks.length; x++) {
            upvotedLinkIDs.push(upvotedLinks[x].link_id)
          }
          return upvotedLinkIDs;
        }).then(function(upvotedLinkIDs){
          findLinks({ _id: { $in: upvotedLinkIDs } })
          .then(function (uvLinks) {
            userData.upvotedLinks = uvLinks
            findLinks({ userid: userData.user_id })
            .then(function (links) {
              userData.submittedLinks = links;
              res.json(userData);
            })
            .fail(function (error) {
              next(error);
            });
          })
          .fail(function (error) {
            next(error);
          });
        })
        .fail(function (error) {
          next(error);
        });
      })
      .fail(function (error) {
        next(error);
      });
  }



}