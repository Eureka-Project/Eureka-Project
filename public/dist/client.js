var app = angular.module('eureka', [
  'eureka.data',
  'eureka.authService',
  'eureka.auth',
  'eureka.home',
  'ui.router'
])

app.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
  // For any unmatched url, redirect to /signup
  $urlRouterProvider.otherwise("/login");
  // Routing States
  $stateProvider
    .state('home', {
      url: "/home",
      templateUrl: "app/views/home.html",
      controller: "HomeController"
    })
    .state('search', {
      url: "/search",
      templateUrl: "app/views/search.html",
      controller: "HomeController"
    })
    .state('signup', {
      url: "/signup",
      templateUrl: "app/views/signup.html",
      controller: "AuthController"
    })
    .state('login', {
      url: "/login",
      templateUrl: "app/views/login.html",
      controller: "AuthController"
    })
    $httpProvider.interceptors.push('AttachTokens');
});

app.factory('AttachTokens', function ($window) {
  // this is an $httpInterceptor
  // its job is to stop all out going request
  // then look in local storage and find the user's token
  // then add it to the header so the server can validate the request
  var attach = {
    request: function (object) {
      var jwt = JSON.parse($window.localStorage.getItem('eureka'));
      if (jwt) {
        object.headers['x-access-token'] = jwt.token;
      }
      object.headers['Allow-Control-Allow-Origin'] = '*';
      return object;
    }
  };
  return attach;
})
angular.module('eureka.auth', [])

.controller('AuthController', ['$scope', '$http', '$window', '$location', 'Auth', function($scope, $http, $window, $location, Auth) {

	$scope.user = {};

	$scope.signup = function () {
		Auth.signup($scope.user)
		.then(function (data) {
			console.log('success...signing in now...');
			$window.localStorage.setItem('eureka', JSON.stringify(data));
			$location.path('/home');
		})
		.catch(function (error) {
		console.error(error);
		});
	}

	$scope.login = function () {
		Auth.login($scope.user)
		.then(function (data) {
			console.log('success...signing in now...');
			$window.localStorage.setItem('eureka', JSON.stringify(data));
			$location.path('/home');
		})
		.catch(function (error) {
		console.error(error);
		});
	}

}]);
angular.module('eureka.home', [])

.controller('HomeController', ['$scope', '$http', '$window', '$location', 'Data', 'Auth' ,function($scope, $http, $window, $location, Data, Auth) {
	// Checking If User Has Cookie
	if (!Auth.isAuth()) $location.path('/login')

	// Enables user to signout
	$scope.signout = function () { Auth.signout() };

	// For the add link pop-up modal
	$scope.modalShow = false;
	$scope.changeModal = function() {
		console.log('changing modal...')
		if ($scope.modalShow === false) {
			$scope.modalShow = true;
		} else {
			$scope.modalShow = false;
		}
	}

	// data being temporarily stored
	$scope.username = JSON.parse($window.localStorage.getItem('eureka')).username;
	$scope.token = JSON.parse($window.localStorage.getItem('eureka')).token;
	$scope.links = undefined; // will be defined once 'getLinks' is run
	$scope.allLinks = undefined; // will be defined once 'getLinks' is run
	$scope.searchValue = Data.searchValue; // defined when 'search' is run


	$scope.getLinks = function () {
		console.log('getting links...');
		$http({
			method: 'GET',
			url: '/api/links'
		}).then(function (res) {
			for (var prop in res.data.links) {
				var array = res.data.links[prop].date.split('T');
				date = array[0].split('-');
				res.data.links[prop].date = date;
			}
			$scope.links = res.data.links;
			var results = [];
			for (var prop in $scope.links) {
				results = results.concat($scope.links[prop].links)
			}
			$scope.allLinks = results;
			return res.data;
		}).catch(function (error) {
			console.log(error);
		})
	}

	$scope.submitLink = function(link) {
		console.log('submitting link...', link)
		var data = {};
		data.url = link;
		data.username = Data.username;
		console.log(data)
		$http({
			method: 'POST',
			url: '/api/links',
			headers: {'Authorization': Data.token },
			data: data
		}).then(function (res) {
			console.log('success...link added')
			$scope.getLinks();
			return res.data;
		}).catch(function (error) {
			console.log(error);
		})
		$scope.addLink.$setPristine();
		$scope.newLink = "";
		$scope.changeModal();
	}

	$scope.search = function(searchText) {
		Data.searchValue = searchText;
		$location.path('/search')
	}

	// Get Link Information When Controller Loads
	$scope.getLinks()

}]);






angular.module('eureka.data', [])

.factory('Data', function ($http, $location, $window) {

	// Enables searchValue to be stored when page changes from 'home' to 'search'
	var searchValue = undefined;

	return {
		searchValue: searchValue,
	}

})