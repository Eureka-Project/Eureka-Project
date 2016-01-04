var linksController = require('./linksController.js');
var usersController = require('../users/usersController.js');

module.exports = function (app) {
  app.use(usersController.verifyToken);
  app.route('/')
    // .get(linksController.getPreviousThreeDaysLinks)
    .get(linksController.getAllLinksByDay)
    .post(linksController.newLink);

};
