var Q = require('q');
var uuid = require('node-uuid');

var Secrets = require('../db/configdb.js').Secrets;

exports = module.exports = {
  secret: ''
}

var findSecret = Q.nbind(Secrets.findOne, Secrets);
var createSecret = Q.nbind(Secrets.create, Secrets);

function dateForToday() {
  return new Date(new Date().setHours(0, 0, 0, 0));
};

function setSecret() {
  var today = dateForToday();

  findSecret({ date: today })
    .then(function(secretForToday) {
      if ( secretForToday ) {
        exports.secret = secretForToday.secret;
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
