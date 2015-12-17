angular.module('eureka.home', [])

.controller('HomeController', ['$scope', '$http', '$window', '$location', 'Auth' ,function($scope, $http, $window, $location, Auth) {
	// Checking If User Has Cookie
	if (!Auth.isAuth()) $location.path('/login')

	$scope.cookieData = JSON.parse($window.localStorage.getItem('eureka'));

	$scope.modalShow = false;
	$scope.changeModal = function() {
		console.log('changing modal...')
		if ($scope.modalShow === false) {
			$scope.modalShow = true;
		} else {
			$scope.modalShow = false;
		}
	}

	$scope.username = $scope.cookieData.username;

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
			url: '/api/links'
		}).then(function (res) {
			console.log(res.data);
			return res.data;
		}).catch(function (error) {
			console.log(error);
		})
	}

	$scope.submitLink = function(link) {
		console.log('submitting link...', link)
		var data = {};
		data.url = link;
		data.username = $scope.username;
		console.log(data)
		$http({
			method: 'POST',
			url: '/api/links',
			headers: {'Authorization': $scope.cookieData.token },
			data: data
		}).then(function (res) {
			console.log('success...link added')
			return res.data;
		}).catch(function (error) {
			console.log(error);
		})
		$scope.addLink.$setPristine();
		$scope.newLink = "";
		$scope.changeModal();
	}

	$scope.signout = function () { Auth.signout() };

	$scope.search = function(searchText) {
		$location.path('/search')
	}


	// Get Links When Controller Loads
	$scope.getLinks()

}]);
