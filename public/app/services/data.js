angular.module('eureka.data', [])

.factory('Data', function ($http, $location, $window) {

	var searchValue = undefined;

	var username = JSON.parse($window.localStorage.getItem('eureka')).username;

	var token = JSON.parse($window.localStorage.getItem('eureka')).token;

	var links = [
	{	date: "December 17th, 2015",
		linksArray: 
		[{ title:"Let’s not let fear defeat our values",upvotes:2,source:"Medium",url:"https://medium.com/@sundar_pichai/let-s-not-let-fear-defeat-our-values-af2e5ca92371#.cfnq2efuy" },
		{ title:"Google’s Angular 2 Framework Hits Beta",upvotes:3,source:"TechCrunch",url:"http://techcrunch.com/2015/12/15/googles-angular-2-framework-hits-beta/" },
		{ title:"‘Star Wars: The Force Awakens’ Delivers the Thrills, With a Touch of Humanity",upvotes:5,source:"NY Times",url:"http://www.nytimes.com/2015/12/18/movies/star-wars-the-force-awakens-review.html?_r=0" }]
	},
	{	date: "December 16th, 2015",
		linksArray:
		[{ title:"Let’s not let fear defeat our values",upvotes:2,source:"Medium",url:"https://medium.com/@sundar_pichai/let-s-not-let-fear-defeat-our-values-af2e5ca92371#.cfnq2efuy" },
		{ title:"Google’s Angular 2 Framework Hits Beta",upvotes:3,source:"TechCrunch",url:"http://techcrunch.com/2015/12/15/googles-angular-2-framework-hits-beta/" },
		{ title:"‘Star Wars: The Force Awakens’ Delivers the Thrills, With a Touch of Humanity",upvotes:5,source:"NY Times",url:"http://www.nytimes.com/2015/12/18/movies/star-wars-the-force-awakens-review.html?_r=0" }]
	}
	];

	return {
		searchValue: searchValue,
		token: token,
		username: username,
		links: links
	}

})