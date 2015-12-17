var Home = angular.module('eureka.home', [])

Home.controller('HomeController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {
	// Uncomment out to start checking for Auth Tokens
	var auth = $window.localStorage.getItem('com.eureka');
	if (auth === null) $location.path('/login')

	$scope.modalShow = false;

	$scope.changeModal = function() {
		console.log('changing modal...')
		if ($scope.modalShow === false) {
			$scope.modalShow = true;
		} else {
			$scope.modalShow = false;
		}
	}

	$scope.username = "Tarley Fass";

	$scope.links = [
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

	$scope.getLinks = function () {
		console.log('getting links...');
		$http({
			method: 'GET',
			url: '/api/links/'
		}).then(function (res) {
			console.log(res.data);
			return res.data;
		}).catch(function (error) {
			console.log(error);
		})
	}

	$scope.submitLink = function(link) {
		console.log('submitting link...', link)
		$http({
			method: 'POST',
			url: '/api/links/',
			data: { url: link, username: $scope.username }
		}).then(function (res) {
			console.log('success...link added')
			return res.data;
		}).catch(function (error) {
			console.log(error);
		})
	}

	$scope.signout = function () {
		console.log('signing out bro...')
		localStorage.removeItem('com.eureka');
		$location.path('/login');
	};

}]);



angular.module('eureka.auth', [])

.controller('AuthController', ['$scope', '$http', '$window', '$location', 'Auth', function($scope, $http, $window, $location, Auth) {

	$scope.user = {};
	
	$scope.signup = function () {
		Auth.signup($scope.user)
		.then(function (token) {
			console.log('success...signing in now...');
			$window.localStorage.setItem('com.eureka', token);
			$location.path('/home');
		})
		.catch(function (error) {
		console.error(error);
		});
	}

	$scope.login = function () {
		Auth.login($scope.user)
		.then(function (token) {
			console.log('success...signing in now...');
			$window.localStorage.setItem('com.eureka', token);
			$location.path('/home');
		})
		.catch(function (error) {
		console.error(error);
		});
	}

}]);

