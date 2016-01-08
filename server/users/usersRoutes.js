var usersController = require('./usersController.js');

module.exports = function (app) {

  app.post('/login', usersController.login);
  app.post('/signup', usersController.signup);

  app.use('/signedin', usersController.verifyToken);
  app.use('/:user_id', usersController.verifyToken);
  app.use('/profile/:user_id', usersController.verifyToken);

  app.get('/signedin', usersController.getUserInfo);
  app.get('/:user_id', usersController.getUserInfo);
  app.get('/profile/:user_id', usersController.getProfileInfo);

  app.post('/resetVotes', usersController.resetVotes);
  app.get('/:user_id/delete', usersController.deleteUser);
};
