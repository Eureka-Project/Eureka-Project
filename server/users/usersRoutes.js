var usersController = require('./usersController.js');


module.exports = function (app) {
  app.post('/login', usersController.login);
  app.post('/signup', usersController.signup);
  app.get('/signedin', usersController.checkAuth);
  app.get('/:userID', usersController.getUserID);
  app.get('/profile/:userID', usersController.getProfileInfo);
};
