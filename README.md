Eureka 
======

OVERVIEW:

Eureka curates and ranks all of the most popular online articles daily based on user input. Users can sign up, log in, submit links, search articles by keyword, upvote their favorite articles, and browse other users' articles. Posted articles are only hosted for three days. NOTE: all submitted articles are screened by the Google Safe Browsing API; some links therefore may not post as expected.

This forked version of the original project at [Eureka-Project](https://github.com/Eureka-Project/Eureka-Project) adds a Google Chrome extension for adding links from any other URL with persistent login across devices (installation instructions below), the ability to comment on articles and to delete your own comments, automatic tagging, article list refresh, daily upvote limit, undoing your own upvotes, upvote counter in the navbar dropdown menu, and the ability to delete articles you've added from your profile page.

To install the Chrome extension you must clone down this forked repo, then in Google Chrome's chrome://extensions/ URL you must check "Developer mode". Then click to "Pack extension..." and add the Eureka-Chrome-Ex directory from this repo as the "Extension root directory". Once you've packed the extension and enabled it, it should show up on your browser toolbar with an icon of an exclamation point. You must sign up as a user on the app's hosted URL but thereafter may log in via the Chrome extension. To use the site and its extension on your localhost server, you must be checked out on the master branch. For the Heroku-deployed version, you must be checked out on branch 'salman'.

Eureka utilizes the MEAN stack. This fork was originally hosted on a Raspberry Pi for testing and is now deployed at [https://eureka-share.herokuapp.com](https://eureka-share.herokuapp.com).
