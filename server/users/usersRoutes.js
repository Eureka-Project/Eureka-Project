var usersController = require('./usersController.js');


module.exports = function (app) {
  app.post('/login', usersController.login);
  app.post('/signup', usersController.signup);
  app.get('/signedin', usersController.checkAuth);
  app.get('/:user_id', usersController.getUserInfo);
  app.get('/profile/:user_id', usersController.getProfileInfo);
};
