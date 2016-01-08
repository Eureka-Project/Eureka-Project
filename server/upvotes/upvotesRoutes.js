var upvotesController = require('./upvotesController.js');
var usersController = require('../users/usersController.js');

module.exports = function (app) {
  app.use(usersController.verifyToken);

  app.post('/', upvotesController.newUpvote);
  app.post('/undo', upvotesController.undoUpvote);
  app.post('/:link_id', upvotesController.newUpvote);
};

