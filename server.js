var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var helpers = require('./server/helpers.js');

module.exports = app = express();

app.set('port', (process.env.PORT || 4000));

// Set up express formatting.
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Redirect requests for local files to the './public' directory.
app.use(express.static(__dirname + '/public'));

// Decode the client's token (if it exists) for all http requests.
app.use(helpers.decodeToken);

// Update the user's last-seen status.
app.use(helpers.lastSeen);


// Initialize routers.
var usersRouter = express.Router();
var linksRouter = express.Router();
var upvotesRouter = express.Router();

// Configure routers.
require('./server/users/usersRoutes.js')(usersRouter);
require('./server/links/linksRoutes.js')(linksRouter);
require('./server/upvotes/upvotesRoutes.js')(upvotesRouter);

// Set up route forwarding.
app.use('/api/users', usersRouter);
app.use('/api/upvote', upvotesRouter);
app.use('/api/links', linksRouter);

// Handle uncaught errors.
app.use(helpers.errorLogger);
app.use(helpers.errorHandler);

// Run the server.
app.listen(app.get('port'), function(){
	console.log('Node app is running on port', app.get('port'));
});
