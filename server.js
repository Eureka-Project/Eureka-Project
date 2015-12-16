var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var mongoose = require('mongoose');

var helpers = require('./server/helpers.js');

var app = express();

// Change this url later.
mongoose.connect('mongodb://localhost/eureka');

app.set('port', (process.env.PORT || 3000));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

var userRouter = express.Router();
var linkRouter = express.Router();

// inject our routers into their respective route files
require('../users/userRoutes.js')(userRouter);
// require('../links/linkRoutes.js')(linkRouter);

app.use('/api/users', userRouter); // use user router for all user request

// authentication middleware used to decode token and made available on the request
//app.use('/api/links', helpers.decode);
// app.use('/api/links', linkRouter); // user link router for link request

// If the url is not one of the ones above, send an error.
app.use(helpers.errorLogger);
app.use(helpers.errorHandler);

app.listen(app.get('port'), function(){
	console.log('Node app is running on port', app.get('port'));
});

module.exports = app;