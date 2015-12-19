var db = require('../db/configdb.js');
var Upvote = db.Upvote;
var Links = db.Url;
var Q = require('q');
var request = require('request');

module.exports = {

  newUpvote: function(req, res, next) {
    var link_id = req.body.link_id;
    var user_id = req.body.user_id;

    if ( ! link_id ) {
      next(new Error('Did not receive link_id'))
    } else if ( ! user_id ) {
      next(new Error('Did not receive user_id'))
    }
    console.log(link_id);

    var findLink = Q.nbind(Links.findOne, Links);

    var storeUpvote = Q.nbind(Upvote.create, Upvote); 
    var findUpvote = Q.nbind(Upvote.findOne, Upvote);

    findUpvote({
      link_id: link_id,
      user_id: user_id
    }).then(function (upvote) {
        var alreadyUpvoted = (
          upvote && 
          upvote.user_id && 
          upvote.user_id === user_id
        );
        if (alreadyUpvoted) {
          res.json(upvote);
          throw new Error('Already upvoted');
        } else {
          return storeUpvote({
            user_id: user_id,
            link_id: link_id
          });
        }
      })
      .then(function(upvote) {
        return findLink({ _id: link_id })
      })
      .then(function(link) {
        link.upvotes = link.upvotes + 1;
        return Q.nfcall(link.save, link);
      })
      .then(function(link) {
        res.json(link);
      })
      .fail(function (err) {
        if (err.message !== 'Already upvoted') {
          next(err);
        }
      })
  }     
}
