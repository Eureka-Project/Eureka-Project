var Q = require('q');
var jwt = require('jwt-simple');
var mongoose = require('mongoose');

var Users = require('../db/configdb.js').Users;
var Links= require('../db/configdb.js').Links;
var Comments = require('../db/configdb.js').Comments;
var Votes = require('../db/configdb.js').Upvotes;
var Links = require('../links/linksController.js');
var Upvotes = require('../upvotes/upvotesController.js');


var secrets = require('../secrets/secretsController.js');

exports = module.exports = {

  // Promise version of Mongoose's 'Model.findOne()' method.
  findUser: Q.nbind(Users.findOne, Users),
  // Promise version of Mongoose's 'Model.create()' method.
  createUser: Q.nbind(Users.create, Users),
  findLinks: Q.nbind(Links.find, Links),
  findComments: Q.nbind(Comments.find, Comments),
  findUpvotes: Q.nbind(Upvotes.find, Upvotes),


  // Return a unique token based on a user document from the database.
  // When decoded later, it will serve as a conditions object for a
  //   database query.
  genToken: function(user) {
    return secrets.then(function(secrets){
      return (jwt.encode({
        _id: user._id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
      }, secrets[secrets.length-1].secret));
    });
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
              exports.genToken(foundUser).then(function(token){
                res.json({
                  username: foundUser.username,
                  user_id: foundUser._id,
                  token: token
                }); 
              }).fail(function(){
                res.status(403).send();
              });
            };
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
          exports.genToken(user).then(function(token){
            res.json({
              username: user.username,
              user_id: user._id,
              fullname: user.firstname + ' ' + user.lastname,
              token: token
            });
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
          return next(new Error('Username already taken. :('));
        } else {
          // Create a new user.
          var newUser = {
            lastSeen: new Date().getTime(),
            username: username,
            password: password,
            firstname: firstname,
            lastname: lastname
          };
          exports.createUser(newUser).then(function(){
            exports.findUser({username:username}).then(function(newUserRecord){
              exports.genToken(newUserRecord).then(function(token){
                var responseVal = {
                  username: newUserRecord.username,
                  user_id: newUserRecord._id,
                  token: token
                };
                res.json(responseVal);
              });
            });
          });
        }
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
          user_id: user._id,
          votesLeft: user.votesLeft,
          lastSeen: user.lastSeen
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
  },
  deleteUser : function(req,res,next){
    var targetUser = req.params.user_id;
    var targetUserId;
    if (req.user.username === targetUser){
      //get the target user's ID
      exports.findUser({username:targetUser}).then(function(user){
        targetUserId = user._id;
        user.remove();
      }).then(function(){
        exports.findLinks({userid:targetUserId}).then(function(links){
          links.remove();
        })
      }).then(function(){
        exports.findComments({username:targetUser}).then(function(comments){
          comments.remove();
        })
      }).then(function(){
        exports.findUpvotes({user_id:targetUserId}).then(function(upvotes){
          upvotes.remove();
        });
      });
      res.status(200).send();
    } else res.status(401).send();
  }

}