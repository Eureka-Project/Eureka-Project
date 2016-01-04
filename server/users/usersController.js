var Q = require('q');
var jwt = require('jwt-simple');
var mongoose = require('mongoose');

var Users = require('../db/configdb.js').Users;
var Links = require('../links/linksController.js');
var Upvotes = require('../upvotes/upvotesController.js');

var secrets = require('../secrets/secretsController.js');

exports = module.exports = {

  // Promise version of Mongoose's 'Model.findOne()' method.
  findUser: Q.nbind(Users.findOne, Users),
  
  // Promise version of Mongoose's 'Model.create()' method.
  createUser: Q.nbind(Users.create, Users),

  // Return a unique token based on a user document from the database.
  // When decoded later, it will serve as a conditions object for a
  //   database query.
  genToken: function(user) {
    return jwt.encode({
      _id: user._id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
    }, secrets.today);
  },

  // Check whether the previously decoded token (stored as 'req.user')
  //   is valid by seeing if it matches a document in the database.
  verifyToken: function (req, res, next) {
    if ( ! req.user ) {
      res.status(403).send();
    } else {
      exports.findUser(req.user)
        .then(function(foundUser) {
          if (foundUser) {
            if(req.makeNewToken === true) {
              return res.json({
                username: foundUser.username,
                user_id: foundUser._id,
                token: exports.genToken(foundUser)
              }); 
            }
            next();
          } else {
            res.status(403).send();
          }
        })
        .fail(function(error) {
          next(error);
        });
    }
  },

  // Login a user from a POST request containing a username and a password.
  // If successful, respond with the username and user_id from the database
  //   document as well as an access token.
  login: function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    exports.findUser({ username: username })
      .then(function(user) {
        if ( ! user ) {
          // Bad username
          throw new Error('User does not exist');
        } else if ( ! user.isPassword(password) ) {
          // Bad password
          throw new Error('Incorrect password');
        } else {
          // Success
          res.json({
            username: user.username,
            user_id: user._id,
            token: exports.genToken(user)
          });
        }
      })
      .fail(function(error) {
        next(error);
      });
  },

  // Signup a user from a POST request containing a username, password,
  //   firstname, and lastname.
  // If a database document with the same username already exists,
  //   do not create a new user and respond that the username is taken.
  // Create a new document in the database for the user and then
  //   respond with the username and user_id of the new
  //   document as well as an access token.
  signup: function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;

    // See if another user is already using the requested username.
    exports.findUser({ username: username })
      .then(function(user) {
        if (user) {
          // Found a user with the same username.
          // Abort signup and respond that the username is taken.
          next(new Error('Username already taken. :('));
        } else {
          // Create a new user.
          return exports.createUser({
            username: username,
            password: password,
            firstname: firstname,
            lastname: lastname
          });
        }
      })
      .then(function(user) {
        // Send back the new document's username and ObjectId
        //   as well as a unique token for the document.

        // user example: {
        //   date: Fri Dec 18 2015 19:12:33 GMT-0600 (CST),
        //   _id: 5674af012e5833104b30ef0f,
        //   lastname: 'test2',
        //   firstname: 'test2',
        //   password:
        //     '$2a$10$5kWIkSPNOPvf3fFH8fkxUek9PMAy4saUj5LC2D.pbyD1NO7I7P.X.',
        //   username: 'test2',
        //   __v: 0
        // }

        res.json({
          username: user.username,
          user_id: user._id,
          token: exports.genToken(user)
        });
      })
      .fail(function(error) {
        next(error);
      });
  },

  // Return a promise for a database query.
  // If the 'user_id' in the '/api/users/:user_id' uri
  //   is NOT a Mongoose/Mongodb ObjectId,
  //   assume it is a username and search the database for that username.
  // If the 'user_id' in the uri IS a Mongoose/Mongodb ObjectId,
  //   search the database for an ObjectId which matches it.
  // If the uri does not contain a 'user_id',
  //   use the one in the decoded token.
  findUserFromRequestHeaders: function(req) {
    return exports.findUser(
      ( ! mongoose.Types.ObjectId.isValid(req.params.user_id) )
        ? { username: req.params.user_id }
        : { _id: req.params.user_id || req.user._id }
    );
  },

  // Search the database for the requested user
  //   and return the user's firstname, lastname, username, and ObjectId.
  getUserInfo: function (req, res, next) {
    exports.findUserFromRequestHeaders(req)
      .then(function(user) {
        res.json({
          firstname: user.firstname,
          lastname: user.lastname,
          username: user.username,
          user_id: user._id
        });
      })
      .fail(function(error) {
        next(error);
      });
  },

  // Search the database for the requested user
  //   and return the user's firstname, lastname, username, ObjectId
  //   list of links created, and list of links upvoted.
  //   and return the firstname, lastname, username, and ObjectId of the user
  //   as well as the links created and upvoted by the user.
  getProfileInfo: function (req, res, next) {
    // Declare an object which will store all of the response data.
    var userData = {};

    // Search the users collection in the database
    //   and find the document for the user.
    exports.findUserFromRequestHeaders(req)
      .then(function(user) {
        // Store the firstname, lastname, username, and ObjectId.
        userData = {
          firstname: user.firstname,
          lastname: user.lastname,
          username: user.username,
          user_id: user._id,
        };
        // Search the upvotes collection in the database
        //   and find the ObjectIds of the links which the user has upvoted.
        return Upvotes.findUpvotes({ user_id: userData.user_id });
      })  
      .then(function(upvotes) {
        // Search the links collection in the database
        //   and find the links which match the found ObjectIds.
        return Links.findLinks({
          _id: {
            $in: upvotes.map(function(upvote) {
              return upvote.link_id;
            })
          }
        });
      })
      .then(function(upvotedLinks) {
        // Store the links which the user has upvoted
        //   in the response data object.
        userData.upvotedLinks = upvotedLinks
        // Search the links collection in the database
        //   and find the links which were submitted by the user.
        return Links.findLinks({ userid: userData.user_id });
      })
      .then(function(links) {
        // Store the links which the user has created/submitted
        //   in the response data object.
        userData.submittedLinks = links;
        // Send the response data object to the client.
        res.json(userData);
      })
      .fail(function(error) {
        next(error);
      });
  }

}