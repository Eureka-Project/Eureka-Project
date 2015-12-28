var Q = require('q');

var db = require('../db/configdb.js');
var Links = require('../links/linksController.js');

var Upvote = db.Upvote;

exports = module.exports = {

  findUpvote: Q.nbind(Upvote.findOne, Upvote),

  storeUpvote: Q.nbind(Upvote.create, Upvote),

  newUpvote: function(req, res, next) {
    var link_id = req.body.link_id;
    var user_id = req.body.user_id;

    if ( ! link_id ) {
      next(new Error('Did not receive link_id'))
    } else if ( ! user_id ) {
      next(new Error('Did not receive user_id'))
    }

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
          console.log('user %s has already upvoted %s', user_id, link_id);
          res.json(upvote);
          throw new Error('Stop promise chain');
        } else {
          return exports.storeUpvote({
            user_id: user_id,
            link_id: link_id
          });
        }
      })
      .then(function(upvote) {
        return Links.findLink({ _id: link_id })
      })
      .then(function(link) {
        link.upvotes++;
        return Q.nfcall(link.save, link);
      })
      .then(function(link) {
        res.json(link);
      })
      .fail(function (err) {
        if (err.message !== 'Stop promise chain') {
          next(err);
        }
      });
  }     
}
