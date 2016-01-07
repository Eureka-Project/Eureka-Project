var Q = require('q');

var Upvote = require('../db/configdb.js').Upvotes;
var Links = require('../links/linksController.js');
var Users = require('../users/usersController.js');

exports = module.exports = {

  findUpvote: Q.nbind(Upvote.findOne, Upvote),
  
  findUpvotes: Q.nbind(Upvote.find, Upvote),

  storeUpvote: Q.nbind(Upvote.create, Upvote),

  // Check vote limit status.
  verifyVotesLeft: function(req, res){
    console.log('verifying Votes Left');
    return Users.findUser(req.user)
      .then(function(foundUser){
        console.log('foundUSer', foundUser);
        if(foundUser){
          var LimitDate = [];
          limitDate[0] = foundUser.lastSeen.getMonth();
          limitDate[1] = foundUser.lastSeen.getDate();
          var votesLeft = foundUser.votesLeft;
          var currDate = new Date().getTime();
          currDate = [currDate.getMonth(), currDate.getDate()];

          if(limitDate[0] < currDate[0] || limitDate[1] < currDate[1]){
            console.log('resetting votesLeft');
            votesLeft = 19;
            foundUser.votesLeft = votesLeft;
            foundUser.save();
            return true;
          }else if(votesLeft <= 0){
            console.log('no more votes left');
            res.status(403).send();
            return false;
          }else{
            console.log('subtracting from votesLeft');
            foundUser.votesLeft --;
            foundUser.save();
            return true;
          }
        }else{
          res.status(403).send();
          return false;
        }
      })

  },

  // Upvote a link in the database.
  newUpvote: function(req, res, next) {
    console.log('req for newUpvote', req);
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

    console.log('about to run verifyVotesLeft from newUpvote');
    exports.verifyVotesLeft({user: req.user._id})

      // Search the upvotes collection
      //   to see whether the user has already upvoted this link.
      .then(function(success){
      if (success){  
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
            // Otherwise, connect this user with this link
            //   in the upvotes collection
            //   and continue down the promise chain.
            return exports.storeUpvote({
              user_id: user_id,
              link_id: link_id
            });
          }
        })
        .then(function(upvote) {
          // Find this link in the links collection.
          return Links.findLink({ _id: link_id })
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
            // If the link exists, increase its upvote count by one,
            //   and continue down the promise chain.
            link.upvotes++;
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
      }else{
        res.status(403).send();
      }
    });
  }     
}
