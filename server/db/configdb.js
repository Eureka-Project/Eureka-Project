var mongoose = require('mongoose');
var db = mongoose.connection;

var userSchema = mongoose.Schema({
	username: String,
	password: String,
	firstname: String,
	lastname: String

});

var linksSchema = mongoose.Schema({
	title: String,
	baseurl: String,
	visits: Number

});



mongoose.connect('mongodb://localhost:27017');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
	console.log('connection made');
});
