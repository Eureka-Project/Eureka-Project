var commentsController = require('./commentsController.js');

module.exports = function (app) {
  app.post('/', commentsController.newComment)
    .get('/:link_id', commentsController.getComments)
    //.get('/:comment_id/delete', commentsController.delComment);
};
