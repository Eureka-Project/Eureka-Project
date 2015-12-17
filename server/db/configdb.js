var mongoose = require('mongoose');
mongoose.connect('mongodb://<Eureka>:<Eureka1?>@ds033175.mongolab.com:33175/eurekadb' || 'mongodb://localhost:27017');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
	console.log('connection made');
});



var userSchema = mongoose.Schema({
	username: String,
	password: String,
	firstname: String,
	lastname: String,
	date: { type: Date, default: Date.now },


});

var User = mongoose.model('User', userSchema);

var urlSchema = mongoose.Schema({
	title: String,
	baseurl: String,
	visits: Number,
	date: { type: Date, default: Date.now }

});

var Url = mongoose.model('Url', urlSchema);


module.exports = db;

