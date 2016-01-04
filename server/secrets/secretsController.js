var Q = require('q');
var uuid = require('node-uuid');

var Secrets = require('../db/configdb.js').Secrets;

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

function dateForToday() {
  return new Date().toMidnight();
};

function dateForYesterday() {
  var date = new Date().toMidnight();
  date.setDate(date.getDate() - 1);
  return date;
};

function setSecret() {
  var today = dateForToday();
  var yesterday = dateForYesterday();

  findSecrets({$or: [{ date: today }, {date: yesterday} ]})
    .then(function(secrets) {
      if( secrets[0].date !== today ) {
        createSecret({
          secret: uuid.v4(),
          date: today
        })
          .then(setSecret);
      }
      else {
        exports.today = secrets[0].secret;
        if( secrets[1].date === yesterday ) {
          exports.yesterday = secrets[1].secret;
        } else {
          createSecret({
            secret: uuid.v4(),
            date: yesterday
          })
            .then(setSecret);
        }
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
