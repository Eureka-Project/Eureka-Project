var Q = require('q');
var request = require('request');

var Links = require('../db/configdb.js').Url;

var rValidUrl = /^(?!mailto:)(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[0-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))|localhost)(?::\d{2,5})?(?:\/[^\s]*)?$/i;


module.exports = {
  findUrl: function (req, res, next, code) {
    var findLink = Q.nbind(Links.findOne, Links);
    findLink({code: code})
      .then(function (link) {
        if (link) {
          req.navLink = link;
          next();
        } else {
          next(new Error('Link not added yet'));
        }
      })
      .fail(function (error) {
        next(error);
      });
  },

  getTodaysLinks: function(req, res, next) {
    var findAll = Q.nbind(Links.find, Links);
    var end = new Date();
    var start = new Date(end.getYear(), end.getMonth(), end.getDate());
    findAll({date: {"$gte": start, "$lt": end} })
      .then(function (links) {
        res.json(links);
      })
      .fail(function (error) {
        next(error);
      });
  },

  allLinks: function (req, res, next) {
    var findAll = Q.nbind(Links.find, Links);

    findAll({})
      .then(function (links) {
        res.json(links);
      })
      .fail(function (error) {
        next(error);
      });
  },

  newLink: function (req, res, next) {
    console.log(req)
    var url = req.body.url;
    var username = req.body.username;
    console.log(req.body);
    if (!util.isValidUrl(url)) {
      return next(new Error('Not a valid url'));
    }

    var createLink = Q.nbind(Links.create, Links);
    var findLink = Q.nbind(Links.findOne, Links);

    findLink({url: url})
      .then(function (match) {
        if (match) {
          res.send(match);
        } else {
          return  util.getUrlTitle(url);
        }
      })
      .then(function (title) {
        if (title) {
          var newLink = {
            url: url,
            visits: 0,
            base_url: req.headers.origin,
            title: title,
            username: username
          };
          return createLink(newLink);
        }
      })
      .then(function (createdLink) {
        if (createdLink) {
          res.json(createdLink);
        }
      })
      .fail(function (error) {
        next(error);
      });
  },

  navToLink: function (req, res, next) {
    var link = req.navLink;
    link.visits++;
    link.save(function (err, savedLink) {
      if (err) {
        next(err);
      } else {
        res.redirect(savedLink.url);
      }
    });
  }

};

var util = {
  getUrlTitle: function(url) {
    var defer = Q.defer();
    request(url, function(err, res, html) {
      if (err) {
        defer.reject(err);
      } else {
        var tag = /<title>(.*)<\/title>/;
        var match = html.match(tag);
        var title = match ? match[1] : url;
        defer.resolve(title);
      }
    });
    return defer.promise;
  },

  isValidUrl: function(url) {
    return url.match(rValidUrl);
  }


};

