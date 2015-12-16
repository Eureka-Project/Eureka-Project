var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mongoose    = require('mongoose');

var app = express();

// Change this url later.
mongoose.connect('mongodb://localhost/eureka');

app.set('port', (process.env.PORT || 3000));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

app.listen(app.get('port'), function(){
	console.log('Node app is running on port', app.get('port'));
});

module.exports = app;