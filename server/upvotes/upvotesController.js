var db = require('../db/configdb.js');
var Upvote = db.Upvote;
var Links = db.Url;
var Q = require('q');
var request = require('request');

module.exports = {

  newUpvote: function(req, res, next) {
    console.log('here')
    var link_id = req.body.link_id;
    var user_id = req.body.user_id;

    var findLink = Q.nbind(Links.findOne, Links);

    var storeUpvote = Q.nbind(Upvote.create, Upvote); 
    var findUpvote = Q.nbind(Upvote.findOne, Upvote);

    findLink({ _id: link_id })
      .then(function(link) {
        console.log('upvote link:', link);
        var updateLink = Q.nbind(link.save, link);
        link.upvotes = link.upvotes + 1;
        return updateLink();
      })
      .fail(function (error) {
        next(error);
      })
      .then(function() {
        return findUpvote({
          link_id: link_id,
          user_id: user_id
        });
      })
      .fail(function (error) {
        next(error);
      })
      .then(function (match) {
        if (match) {
          res.send(match);
        } else {
          var upvote = {
            user_id: user_id,
            link_id: link_id
          };
          return storeUpvote(upvote)
        }
      })
      .then(function(upvote) {
        console.log(upvote)
        res.json(upvote)
      })
      .fail(function (error) {
        next(error);
      }); 
  }     
}


console.log('sending upvote request');


// request({
//   'uri': 'http://localhost:3000/api/links/upvote',
//   // host: 'localhost',
//   // path: '/api/links/upvote',
//   // port: 3000, 
//   'method': 'POST',
//     'content-type': 'application/json',
//     body: JSON.stringify({
//       'link_id': '567465e8b20053553bc91b2f', 
//       'user_id': '56736861e52eecf55c15f782'
//     })
// }, function(err, response) {
//   console.log('received response', Object.keys(response))
//   console.log('err', err)
// })


var options = {
    host: 'localhost',
    port: 3000,
    path: '/api/links/upvote',
    method: 'POST'
};

request(options, function(err,response,body) {
  // console.log(response);
});

