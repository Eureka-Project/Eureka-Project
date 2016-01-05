var Q = require('q');
var uuid = require('node-uuid');

var Secrets = require('../db/configdb.js').Secrets;

// Export the jwt token authentication secrets for today and yesterday. 
exports = module.exports = {
  today: '',
  yesterday: ''
}

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
  var today = dateForToday();
  var yesterday = dateForYesterday();

  findSecrets({$or: [{ date: today }, {date: yesterday} ]})
    .then(function(secrets) {
      // If today's secret does not exist, create it,
      //   and then run setSecret again.
      if( ! secrets || ! secrets[0] || secrets[0].date.getTime() !== today.getTime() ) {
        createSecret({
          secret: uuid.v4(),
          date: today
        })
          .then(setSecret);
      } else {
      // Otherwise, update today's secret in module.exports.
        exports.today = secrets[0].secret;
        // If yesterday's secret does not exist, create it,
        //   and then run setSecret again.
        if( ! secrets[1] || secrets[1].date.getTime() !== yesterday.getTime() ) {
          createSecret({
            secret: uuid.v4(),
            date: yesterday
          })
            .then(setSecret);
        } else {
      // Otherwise, update yesterday's secret in module.exports.
          exports.yesterday = secrets[1].secret;
        }
      } 
    })
      
      
    .fail(function(err) {
      console.log(err);
    });
}

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
setSecret();
// Run setSecret every day at midnight.
setSecretDaily();
