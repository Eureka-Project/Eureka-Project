var Q = require('q');
var _ = require('underscore');

var Links = require('../db/configdb.js').Links;
var Comments = require('../db/configdb.js').Comments;

exports = module.exports = {

  findComments: Q.nbind(Comments.find, Comments),
  findComment: Q.nbind(Comments.findById, Comments),
  createComment: Q.nbind(Comments.create, Comments),
  findLink: Q.nbind(Links.findOne, Links),

  newComment: function (req, res, next) {
    var text = req.body.text;
    var link_id = req.body.link_id;
    var username = req.user.username;

    exports.findLink({_id:link_id})
      .then(function (link) {
        link.commentCount ++;
        link.save();
        return exports.createComment({
          text: text,
          link_id: link_id,
          username: username,
          date: new Date().getTime()
        });
      })
      .then(function (createdComment) {
        if ( ! createdComment ) {
          // This should never happen.
          // If the database could not create the new Comment,
          //   it is most likely a problem with the mongoose server.
          res.json({});
          console.log('Failed to create comment in the database:', createdComment);
          throw new Error('Failed to create comment in the database');
        } else {
          console.log('Created new comment: \n', createdComment)
          res.json(createdComment);
        }
      })
      .fail(function (err) {
        // Unless the error requests to stop the promise chain,
        //   log the error and continue to the next function
        //   in the chain.
        if (err.message !== 'Stop promise chain') {
          console.log(err);
          next(err);
        }
      });
  },
  getComments: function(req,res,next){
    exports.findComments({link_id:req.params.link_id})
      .then(function(comments){
        res.json(comments)
      }).fail(function(err){
        console.log(err);
        next(err);
      });
  },
  delComment: function(req,res,next){
    exports.findComment(req.params.comment_id)
      .then(function(comment){
        if (req.user.username === comment.username) {
          comment.remove();
          res.status(200).send();
        }
        else res.status(403).send();
      }).catch(function(){
        res.status(404).send()
      });
  }
};
