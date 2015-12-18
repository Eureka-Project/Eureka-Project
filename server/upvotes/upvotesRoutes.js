var upvotesController = require('./upvotesController.js');

module.exports = function (app) {
  // app === userRouter injected from middlware.js

  app.post('/', upvotesController.newUpvote);
};

