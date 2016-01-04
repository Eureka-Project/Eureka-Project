var Q = require('q');
var uuid = require('node-uuid');

var Secrets = require('../db/configdb.js').Secrets;

exports = module.exports = {
  today: ''
}

var findSecret = Q.nbind(Secrets.findOne, Secrets);
var createSecret = Q.nbind(Secrets.create, Secrets);

// Return a Date object for today's date, set at midnight.
Date.prototype.toMidnight = function() {
  this.setHours(0, 0, 0, 0);
  return this;
}

function dateForToday() {
  return new Date().toMidnight();
};

function setSecret() {
  var today = dateForToday();
  console.log('today', today);

  findSecret({ date: today })
    .then(function(secretForToday) {
      if ( secretForToday ) {
        exports.today = secretForToday.secret;
      } else {
        createSecret({
          secret: uuid.v4(),
          date: today
        })
          .then(setSecret);
      }
    })
    .fail(function(err) {
      console.log(err);
    });
}

function setSecretDaily() {
  var msInOneDay = 86400000;
  var msUntilMidnight = msInOneDay - ( new Date() - dateForToday() );
  setTimeout(function() {
    settingSecretDaily = setInterval(setSecret, 86400000);
  }, msUntilMidnight);
}

setSecret();
setSecretDaily();
