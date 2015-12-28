var Q = require('q');
var util = require('./linksUtil.js');

var Links = require('../db/configdb.js').Url;

var findLink = Q.nbind(Links.findOne, Links);
var findLinks = Q.nbind(Links.find, Links);
var createLink = Q.nbind(Links.create, Links);
var updateLink = Q.nbind(Links.update, Links);

// // Convert a date to UTC time.
// Date.prototype.toUTC = function() {
//   return new Date(
//     this.getUTCFullYear(),
//     this.getUTCMonth(),
//     this.getUTCDate(),
//     this.getUTCHours(),
//     this.getUTCMinutes(),
//     this.getUTCSeconds()
//   );
// };

module.exports = {

  findUrl: function (req, res, next, code) {
    findLink({ code: code })
      .then(function (link) {
        if (link) {
          req.navLink = link;
          next();
        } else {
          next(new Error('Link not added yet'));
        }
      })
      .fail(function (err) {
        next(err);
      });
  },

  // Query the database for all links which were created
  //   between a requested date and two days prior to that date
  //   (e.g., between now and the day before yesterday).
  // If the client does not specify a date,
  //   get the links for the past three days
  //   (today, yesterday, and the day before).
  // Group these links according to the day each was created
  //   by organizing them into three different arrays, one array for each day.
  // Send these arrays back to the client.
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

    findLinks({ date: {"$gte": start, "$lt": end} })
      .then(function (links) {
        // Split the links up by day created.
        var linksDayOne = []; 
        var linksDayTwo = [];
        var linksDayThree = [];

        for (var i = 0; i < links.length; i++) {
          var day = links[i].date.getDate();
          if ( day === endDate ) {
            linksDayOne.push(links[i]);
          } else if ( day === endDate - 1 ) {
            linksDayTwo.push(links[i]);
          } else if ( day === endDate - 2 ) {
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
        console.log('Links for 3 days before %s:\n', end, data);
        res.json(data);
      })
      .fail(function (err) {
        next(err);
      });
  },

  // allLinks: function (req, res, next) {
  //   var findLinks = Q.nbind(Links.find, Links);

  //   findLinks({})
  //     .then(function (links) {
  //       res.json(links);
  //     })
  //     .fail(function (err) {
  //       next(err);
  //     });
  // },

  // Insert a new link into the database.
  // Receive the 'url', 'user_id', and 'user_name' from the client.
  newLink: function (req, res, next) {
    var url = req.body.url;
    var user_id = req.body.user_id;
    var user_name = req.body.username;
    if ( ! util.isValidUrl(url) ) {
      return next(new Error('Not a valid url'));
    }

    findLink({url: url})
      .then(function (match) {
        if (match) {
          console.log('Link already exists in database:\n', match);
          res.json(match);
          // Stop the promise chain (go to '.fail()')
          throw new Error('Stop promise chain');
        } else {
          return util.getMetaData(url);
        }
      })
      .then(function (data) {
        return createLink({
          url: url,
          visits: 0,
          title: data.title,
          description: data.description,
          site_name: data.site_name,
          image: (data.image) ? data.image.url : '',
          username: user_name,
          userid: user_id,
          upvotes: 0
        });
      })
      .then(function (createdLink) {
        if ( ! createdLink ) {
          // This should never happen.
          // If the database could not create the new link,
          //   it is most likely a problem with the mongoose server.
          res.json({});
          console.log('Failed to create link in the database:', createdLink);
          throw new Error('Failed to create link in the database');
        } else {
          console.log('Created new link: \n', createdLink)
          res.json(createdLink);
        }
      })
      .fail(function (err) {
        // Unless the error requests to stop the promise chain,
        //   log the error and continue to the next function
        //   in the chain.
        if (err.message !== 'Stop promise chain') {
          console.log(err);
          next(err);
        }
      });
  },

  // getTodaysLinks: function(req, res, next) {
  //   var findLinks = Q.nbind(Links.find, Links);
  //   var end = new Date();
  //   var start = new Date(end.getYear(), end.getMonth(), end.getDate());
  //   findLinks({date: {"$gte": start, "$lt": end} })
  //     .then(function (links) {
  //       var data = {
  //         links: [{
  //           date: start,
  //           links: links
  //         }],
  //       };
  //       res.json(data);
  //     })
  //     .fail(function (err) {
  //       next(err);
  //     });
  // },

  // getLinksForDate: function(date) {
  //   var findLinks = Q.nbind(Links.find, Links);
  //   var end = date;
  //   var start = new Date(end.getYear(), end.getMonth(), end.getDate());
  //   findLinks({date: {"$gte": start, "$lt": end} })
  //     .then(function (links) {
  //       var data = {
  //         links: [{
  //           date: start,
  //           links: links
  //         }],
  //       };
  //      return data;
  //     })
  //     .fail(function (err) {
  //       console.log(err);
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
