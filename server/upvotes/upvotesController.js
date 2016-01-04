var Q = require('q');

var Upvote = require('../db/configdb.js').Upvotes;
var Links = require('../links/linksController.js');

exports = module.exports = {

  findUpvote: Q.nbind(Upvote.findOne, Upvote),
  
  findUpvotes: Q.nbind(Upvote.find, Upvote),

  storeUpvote: Q.nbind(Upvote.create, Upvote),

  // Upvote a link in the database.
  newUpvote: function(req, res, next) {
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
    }).then(function (upvote) { 
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
  }     
}
