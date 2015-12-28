var linksController = require('./linksController.js');

module.exports = function (app) {
  app.route('/')
    .get(linksController.getPreviousThreeDaysLinks)
    .post(linksController.newLink);

};
