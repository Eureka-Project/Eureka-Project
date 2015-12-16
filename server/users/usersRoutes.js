var usersController = require('./usersController.js');


module.exports = function (app) {
  // app === userRouter injected from middlware.js

  app.post('/signin', usersController.signin);
  app.post('/signup', usersController.signup);
  app.get('/signedin', usersController.checkAuth);
};
