var upvotesController = require('./upvotesController.js');

module.exports = function (app) {
  app.post('/', upvotesController.newUpvote);
  app.post('/:link_id', upvotesController.newUpvote);
};

