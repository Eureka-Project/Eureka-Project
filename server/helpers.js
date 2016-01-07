var Q    = require('q');
var jwt  = require('jwt-simple');

var secrets = require('./secrets/secretsController.js');
var Users = require('./db/configdb.js').Users;

var decode = function(){
  jwt.decode.apply(this,arguments)
}

exports = module.exports = {

  // Log an uncaught error and then send it to the next route,
  //   which should be 'exports.errorHandler'.
  // (The file requiring this function determines the route order.)
  errorLogger: function (error, req, res, next) {
    console.error(error.stack);
    next(error);
  },
  
  // Send an uncaught error message to the client.
  errorHandler: function (error, req, res, next) {
    res.status(500).send({error: error.message});
  },

  lastSeen: function(req, res, next){
    if (req.user && req.user.username){
      Users.findOne({username: req.user.username}, function(err,user){
        user.lastSeen = new Date().getTime();
        user.save();
      });
    }
    return next();
  },

  // Decode the jwt token and place the extracted data into 'req.user'.
  // Send a 'Forbidden' http response if it cannot be decoded.
  decodeToken: function (req, res, next) {
    var token = req.headers['x-access-token'];
    // Example token:
    // eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1Njg1OWM1NGRkYzUzNGQ3NWNiZThkMmUiLCJ1c2VybmFtZSI6Im1lbWUiLCJmaXJzdG5hbWUiOiJtZW1lIiwibGFzdG5hbWUiOiJtZW1lIn0.DxQxUgTw98PS8XVr2PeAIwRFntfOtkFZ8ZgTLKFDge4
    
    // If the request does not contain a token, set req.user to null
    //   and skip to the next route.
    if( !token ) { 
      req.user = null;
      return next();
    }

    // Try to decode the token.
    secrets.then(function(secrets){
      for (var i=0;i<secrets.length;i++){
        try {
          req.user = jwt.decode(token, secrets[i].secret);
          return next();
        }
        catch(error) {
          if (i===secrets.length-1){
            req.user = null;
            res.status(403).send({error: 'Invalid x-access-token'});
            return next();
          }
        }
      }
    });
  }
};
