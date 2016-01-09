var Q = require('q');
var uuid = require('node-uuid');

var Secrets = require('../db/configdb.js').Secrets;



var findSecrets = Q.nbind(Secrets.find, Secrets);
var createSecret = Q.nbind(Secrets.create, Secrets);

// Return a Date object for today's date, set at midnight.
Date.prototype.toMidnight = function() {
  this.setHours(0, 0, 0, 0);
  return this;
}

// Return today's date at midnight.
function dateForToday() {
  return new Date().toMidnight();
};

// Return yesterday's date at midnight.
function dateForYesterday() {
  var date = new Date().toMidnight();
  date.setDate(date.getDate() - 1);
  return date;
};

// Set the exported secrets.
function setSecret() {
  var newSecret = {secret: uuid.v4(),
                   date: null};
  return createSecret(newSecret).then(function(){return findSecrets()})
    .then(function(secrets){
      if (secrets.length > 12){
        for (var i=0;i<secrets.length-12;i++){
          secrets[i].remove();
        }
        secrets = secrets.slice(secrets.length-13);
      }
      return secrets;
    })
    .fail(function(err) {
    });
};

// Run setSecret on startup.
  module.exports = setSecret();
