var Q = require('q');
// var request = require('request');
// var og = require('open-graph');
// var og = require('./linksUtil.js');
var util = require('./linksUtil.js');

var Links = require('../db/configdb.js').Url;

Date.prototype.toUTC = function() {
  return new Date(
    this.getUTCFullYear(),
    this.getUTCMonth(),
    this.getUTCDate(),
    this.getUTCHours(),
    this.getUTCMinutes(),
    this.getUTCSeconds()
  );
};

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

  getPreviousThreeDaysLinks: function(req, res, next) {
    var end = req.body.date || new Date();

    // Get the year, month, and day in number format.
    var endYear = end.getFullYear();
    var endMonth = end.getMonth();
    var endDate = end.getDate();

    // Reverse chronological (e.g., today, yesterday, 2 days ago):
    var dayOne = new Date(endYear, endMonth, endDate);
    var dayTwo = new Date(endYear, endMonth, endDate - 1);
    var dayThree = new Date(endYear, endMonth, endDate - 2);

    var start = dayThree;

    var findAll = Q.nbind(Links.find, Links);

    findAll({ date: {"$gte": start, "$lt": end} })
      .then(function (links) {
        // Split the links up by day created.
        var linksDayOne = []; 
        var linksDayTwo = [];
        var linksDayThree = [];

        for(var i = 0; i < links.length; i++) {
          console.log('link id:', links[i]['_id']);
          var day = links[i].date.getDate();
          if(day === endDate) {
            linksDayOne.push(links[i]);
          } else if(day === endDate - 1) {
            linksDayTwo.push(links[i]);
          } else if(day === endDate - 2) {
            linksDayThree.push(links[i]);
          }
        }

        var data = {
          links: [
            {
              date: dayOne,
              links: linksDayOne
            },
            {
              date: dayTwo,
              links: linksDayTwo
            },
            {
              date: dayThree,
              links: linksDayThree
            }
          ],
        };
        console.log(data)
        res.json(data);
      })
      .fail(function (error) {
        next(error);
      });
  },

  // allLinks: function (req, res, next) {
  //   var findAll = Q.nbind(Links.find, Links);

  //   findAll({})
  //     .then(function (links) {
  //       res.json(links);
  //     })
  //     .fail(function (error) {
  //       next(error);
  //     });
  // },

  newLink: function (req, res, next) {
    var url = req.body.url;
    var user_id = req.body.user_id;
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
          return util.getUrlData(url);
        }
      })
      .then(function (data) {
        console.log(data)
        if (data) {
          var newLink = {
            url: url,
            visits: 0,
            title: data.title,
            description: data.description,
            site_name: data.site_name,
            image: (data.image) ? data.image.url : '',
            user_id: user_id,
            upvotes: 0
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

  // getTodaysLinks: function(req, res, next) {
  //   var findAll = Q.nbind(Links.find, Links);
  //   var end = new Date();
  //   var start = new Date(end.getYear(), end.getMonth(), end.getDate());
  //   findAll({date: {"$gte": start, "$lt": end} })
  //     .then(function (links) {
  //       var data = {
  //         links: [{
  //           date: start,
  //           links: links
  //         }],
  //       };
  //       res.json(data);
  //     })
  //     .fail(function (error) {
  //       next(error);
  //     });
  // },

  // getLinksForDate: function(date) {
  //   var findAll = Q.nbind(Links.find, Links);
  //   var end = date;
  //   var start = new Date(end.getYear(), end.getMonth(), end.getDate());
  //   findAll({date: {"$gte": start, "$lt": end} })
  //     .then(function (links) {
  //       var data = {
  //         links: [{
  //           date: start,
  //           links: links
  //         }],
  //       };
  //      return data;
  //     })
  //     .fail(function (error) {
  //       console.log(error);
  //     })
  // },

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
