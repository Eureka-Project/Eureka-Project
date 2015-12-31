var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var helpers = require('./server/helpers.js');

var app = express();

app.set('port', (process.env.PORT || 3000));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

var usersRouter = express.Router();
var linksRouter = express.Router();
var upvotesRouter = express.Router();

// inject our routers into their respective route files
require('./server/users/usersRoutes.js')(usersRouter);
require('./server/links/linksRoutes.js')(linksRouter);
require('./server/upvotes/upvotesRoutes.js')(upvotesRouter);

// authentication middleware used to decode token and made available on the request
app.use(helpers.decodeToken);

app.use('/api/users', usersRouter); // use user router for all user request

app.use('/api/upvote', upvotesRouter);

app.use('/api/links', linksRouter); // user link router for link request


// If the url is not one of the ones above, send an error.
app.use(helpers.errorLogger);
app.use(helpers.errorHandler);

app.listen(app.get('port'), function(){
	console.log('Node app is running on port', app.get('port'));
});

module.exports = app;