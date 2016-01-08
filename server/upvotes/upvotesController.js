var Q = require('q');

var Upvote = require('../db/configdb.js').Upvotes;
var Links = require('../links/linksController.js');
var Users = require('../db/configdb.js').Users;

exports = module.exports = {

  findUpvote: Q.nbind(Upvote.findOne, Upvote),
  
  findUpvotes: Q.nbind(Upvote.find, Upvote),

  storeUpvote: Q.nbind(Upvote.create, Upvote),

  // Promise version of Mongoose's 'Model.findOne()' method.
  findUser: Q.nbind(Users.findOne, Users),

  // Promise version of Mongoose's 'Model.create()' method.
  createUser: Q.nbind(Users.create, Users),

  // Check vote limit status.
  verifyVotesLeft: function(req, res){
    return exports.findUser({username: req.username})
      .then(function(foundUser){
        if(foundUser){
          var limitDate = [foundUser.lastSeen, foundUser.lastSeen];
          limitDate[0] = new Date(limitDate[0]).getMonth();
          limitDate[1] = new Date(limitDate[1]).getDate();
          var votesLeft = foundUser.votesLeft;
          var tempDate = new Date();
          currDate = [tempDate.getMonth(tempDate), tempDate.getDate(tempDate)];

          if(limitDate[0] !== currDate[0] || limitDate[1] !== currDate[1]){
            console.log('resetting votesLeft');
            foundUser.votesLeft = 19;
            foundUser.save();
            // exports.createUser
            return true;
          }

          if(votesLeft > 0){
            foundUser.votesLeft --;
            console.log('votes left: ', foundUser.votesLeft);
            foundUser.save();
            // exports.createUser(foundUser);
            return true;
          }else{
            console.log('no more votes left');
            // res.status(403).send();
            return false;
          }
        }else{
          // res.status(403).send();
          return false;
        }
      })

  },

  // Upvote a link in the database.
  newUpvote: function(req, res, next) {
    // console.log('req for newUpvote', req);
    var link_id = req.body.link_id || req.params.link_id;
    var user_id = req.body.user_id || req.user._id;

    // Client needs to send both a link_id and user_id.
    if ( ! link_id ) {
      res.status(400);
      next(new Error('Did not receive link_id'))
    } else if ( ! user_id ) {
      res.status(400);
      next(new Error('Did not receive user_id'))
    }

    
      // Search the upvotes collection
      //   to see whether the user has already upvoted this link.
       
        exports.findUpvote({
          link_id: link_id,
          user_id: user_id
        })
        .then(function (upvote) { 
          var alreadyUpvoted = (
            upvote && 
            upvote.user_id && 
            upvote.user_id === user_id
          );
          if (alreadyUpvoted) {
            // If the user has already upvoted this link,
            //   change nothing in the database
            //   and instead return the current data from the database.
            console.log('user %s has already upvoted %s', user_id, link_id);
            res.json(upvote);
            throw new Error('Stop promise chain');
          } else {
            return exports.verifyVotesLeft({username: req.body.username})
          }
        })
        .then(function(success){
          if(success){
            // Otherwise, connect this user with this link
            //   in the upvotes collection
            //   and continue down the promise chain.
            return exports.storeUpvote({
              user_id: user_id,
              link_id: link_id
            });  
          }else{
            res.status(403).send();
            throw new Error('Stop promise chain');
          }
        })          
        .then(function(upvote) {
          if (upvote){ 
            // Find this link in the links collection.
            return Links.findLink({ _id: link_id })
          }else{
            res.status(403).send();
          }
        })
        .then(function(link) {
          console.log('link', link);
          if ( ! link ) {
            // This should never run, since the client should only be sending
            //   link_id's which the server has sent previously.
            // But in case it does, tell the client that the link_id is invalid.
            var err = 'Link ' + link_id + ' does not exist';
            res.status(400);
            res.json({ error: err});
            console.log(err);
            throw new Error(err);
          } else {
            // If the link exists, increase its upvote count by one,
            //   and continue down the promise chain.
            link.upvotes++;
            // Add the user id to upvotedBy
            var upvotedBy = JSON.parse(link.upvotedBy);
            upvotedBy[user_id] = user_id;
            link.upvotedBy = JSON.stringify(upvotedBy);
            return Q.nfcall(link.save, link);
          }
        })
        .then(function(link) {
          // Send the updated link info to the client.
          res.json(link);
        })
        .fail(function (err) {
          // Do nothing if the error was thrown to stop the promise chain.
          if (err.message !== 'Stop promise chain') {
            next(err);
          }
        });
  },

  // Give a vote back to a user.
  returnVote: function(req){
    exports.findUser({username: req.username})
      .then(function(foundUser){
        if(foundUser){
          foundUser.votesLeft ++;
          foundUser.save();
        }else{
          console.log('Could not return a vote to user')
        }
      });
  },

  // Undo upvote a link in the database.
  undoUpvote: function(req, res, next) {
    // console.log('req for newUpvote', req);
    var link_id = req.body.link_id || req.params.link_id;
    var user_id = req.body.user_id || req.user._id;

    // Client needs to send both a link_id and user_id.
    if ( ! link_id ) {
      res.status(400);
      next(new Error('Did not receive link_id'))
    } else if ( ! user_id ) {
      res.status(400);
      next(new Error('Did not receive user_id'))
    }

    
      // Search the upvotes collection
      //   to see whether the user has upvoted this link.
       
        exports.findUpvote({
          link_id: link_id,
          user_id: user_id
        })
        .then(function (upvote) { 
          var alreadyUpvoted = (
            upvote && 
            upvote.user_id && 
            upvote.user_id === user_id
          );
          if (!alreadyUpvoted) {
            // If the user has already upvoted this link,
            //   change nothing in the database
            //   and instead return the current data from the database.
            console.log('user %s has not upvoted %s', user_id, link_id);
            res.json(upvote);
            throw new Error('Stop promise chain');
          } else {
             // Otherwise, remove upvote from user
            //   and continue down the promise chain.
            upvote.remove();
            return true;
          }
        })
        .then(function(undoUpvote) {
          if (undoUpvote){ 
            // Find this link in the links collection.
            return Links.findLink({ _id: link_id })
          }else{
            res.status(403).send();
          }
        })
        .then(function(link) {
          if ( ! link ) {
            // This should never run, since the client should only be sending
            //   link_id's which the server has sent previously.
            // But in case it does, tell the client that the link_id is invalid.
            var err = 'Link ' + link_id + ' does not exist';
            res.status(400);
            res.json({ error: err});
            console.log(err);
            throw new Error(err);
          } else {
            // Return a vote back to the user.
            exports.returnVote({username: req.body.username});

            // If the link exists, decrease its upvote count by one,
            //   and continue down the promise chain.
            link.upvotes--;

            // Remove the user's id from upvotedBy
            var upvotedBy = JSON.parse(link.upvotedBy);
            delete upvotedBy[user_id];
            link.upvotedBy = JSON.stringify(upvotedBy);
            return Q.nfcall(link.save, link);
          }
        })
        .then(function(link) {
          // Send the updated link info to the client.
          res.json(link);
        })
        .fail(function (err) {
          // Do nothing if the error was thrown to stop the promise chain.
          if (err.message !== 'Stop promise chain') {
            next(err);
          }
        });
  } 
}
