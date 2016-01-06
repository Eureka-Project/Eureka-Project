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
// Find the secrets for today and yesterday in the database.
// If either does not exist, create it, and then run this function again.
// Otherwise, reset the exported secrets to the ones found.
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
      console.log(err);
    });
};

// Update the exported secrets every dat at midnight.
function setSecretDaily() {
  var msInOneDay = 86400000;
  var msUntilMidnight = msInOneDay - ( new Date() - dateForToday() );

  // Wait until midnight tomorrow/tonight,
  //   and then run setSecret every 24 hours.
  setTimeout(function() {
    settingSecretDaily = setInterval(setSecret, 86400000);
  }, msUntilMidnight);
}

// Run setSecret on startup.
  module.exports = setSecret();
// Run setSecret every day at midnight.
//setSecretDaily();
// Export the jwt token authentication secrets for today and yesterday. 
