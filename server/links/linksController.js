var Q = require('q');
var _ = require('underscore');

var util = require('./linksUtil.js');
var Links = require('../db/configdb.js').Links;
var Users = require('../db/configdb.js').Users;
var Alchemy = require('alchemy-api');
var APIkey = require('./links-Alchemy-APIkey.js').APIkey;
var alchemy = new Alchemy(APIkey);

exports = module.exports = {

  findLink: Q.nbind(Links.findOne, Links),
  findUser: Q.nbind(Users.findOne, Users),
  findLinks: Q.nbind(Links.find, Links),
  createLink: Q.nbind(Links.create, Links),
  updateLink: Q.nbind(Links.update, Links),
  getConcepts: Q.nbind(alchemy.concepts, alchemy),

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
    exports.getAllLinksByDay(req, res, next);
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

    exports.findLinks({ date: {"$gte": start, "$lt": end} })
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
        //console.log('Links for 3 days before %s:\n', end, data);
        res.json(data);
      })
      .fail(function (err) {
        next(err);
      });
  },

  // Send all [user submitted] links in the database to the client.
  // Sort them by day, with each day containing an array of the links
  //   which were submitted on that day.
  getAllLinksByDay: function(req, res, next) {
    var targetDate = req.body.date || new Date();
    // Clone the date to prevent modifying the original date.
    targetDate = new Date( targetDate.getTime() );
    // Set it to midnight.
    targetDate.setHours(0, 0, 0, 0);

    exports.findLinks({})
      .then(function (links) {
        // Make an array-like hash table.
        var linksByDay = {};

        // Split the links up by day created.
        links.forEach(function(link) {
          // Clone the date to prevent modifying the original date.
          var linkDate = new Date( link.date.getTime() );
          // Set it to midnight.
          linkDate.setHours(0, 0, 0, 0);

          // Get the time difference from the initial date,
          //   which will serve as an index for the linksByDay hash table.
          var dayDifference = linkDate - targetDate;

          // If this link is the first one found for its day,
          //   initialize the bucket for that day
          //   in the linksByDay hash table.
          if ( ! linksByDay[dayDifference] ) {
            linksByDay[dayDifference] = {
              date: linkDate,
              links: []
            }
          }

          linksByDay[dayDifference].links.push(link);
        })

        // Declare the object to send in the response.
        var data = {
          links: []
        }
        // Turn the 'linksByDay' hash table into an array.
        // Place the array in the response object as 'data.links'.
        _.each(linksByDay, function(obj) {
          data.links.push(obj);
        })

        data.links.sort(function(a, b) {
          return b.date - a.date;
        })

        // Example:
        //   data === {
        //     links: [
        //       {
        //         date: <todayAtMidnight>,
        //         links: <linksForToday>
        //       },
        //       {
        //         date: <yesterdayAtMidnight>,
        //         links: <linksForYesterday>
        //       }...
        //     ],
        //   };
        
        res.json(data);
      })
      .fail(function (err) {
        next(err);
      });
  },

  // Insert a new link into the database.
  // Receive the 'url', 'user_id', and 'user_name' from the client.
  newLink: function (req, res, next) {
    var url = req.body.url;
    var user_id = req.body.user_id;
    var user_name = req.body.username; //actually fullname, not "username"

    if ( ! util.isValidUrl(url) ) {
      return next(new Error('Not a valid url'));
    }

    exports.findLink({url: url})
      .then(function (match) {
        if (match) {
          console.log('Link already exists in database:\n', match);
          res.json(match);
          // Stop the promise chain (go to '.fail()')
          throw new Error('Stop promise chain');
        } else {
          return util.isSafeUrl(url);
        }
      })
      .then(function (isSafe) {
        if ( ! isSafe ) {
          res.status(403).send({error: 'Malicious site'})
          throw new Error('Stop promise chain');
        } else {
          return util.getMetaData(url);
        }
      })
      .then(function (data){
        //It occurred to me after writing this that 
        //it should probably go in linksUtil.js.
        //Too late now.
        return exports.getConcepts(url,{maxRetrieve:8}).then(function(response){
          var tags = response.concepts.map(function(tag){
            return tag.text;
          });
          data.tags = tags;
          return data;
        }).catch(function(err){
        console.log('alchemy error');
        console.log(err);
        });
      })
      .then(function (data) {
        return exports.createLink({
          url: url,
          visits: 0,
          title: data.title,
          description: data.description,
          tags: data.tags,
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
  delLink : function(req,res){
    //delete a link
    exports.findLink({_id:req.params.link_id}).then(function(link){
      //link id to delete specified in the url.
      exports.findUser({username:req.user.username}).then(function(user){
        //wouldn't it be nice if the username was stored in the link object?
        //It's not, so we have to look up the logged-in user's id.
        if (link.userid.toString() === user._id.toString()){
          link.remove(function(){
            res.status(200).send();
            //successful deletion.
          });
        } else{
          res.status(401).send();
          //link belongs to a different user
        }
      }).catch(function(){
        res.status(500).send();
        //user who is doing the deleting not found in DB
      })
    }).catch(function(){
      res.status(404).send();
      //link not found
    });
  }
};
