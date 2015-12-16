var Home = angular.module('eureka.home', [])

Home.controller('HomeController', ['$scope', '$http', function($scope, $http) {

	$scope.links = [
	{ title:"Let’s not let fear defeat our values",source:"Medium",url:"https://medium.com/@sundar_pichai/let-s-not-let-fear-defeat-our-values-af2e5ca92371#.cfnq2efuy" },
	{ title:"Google’s Angular 2 Framework Hits Beta",source:"TechCrunch",url:"http://techcrunch.com/2015/12/15/googles-angular-2-framework-hits-beta/" }
	];

}]);



var Auth = angular.module('eureka.auth', [])

Auth.controller('AuthController', ['$scope', '$http', function($scope, $http, $location, $window) {

	$scope.user = {};

	$scope.signup = function () {
		console.log('user: ', $scope.user)
		$http({
			method: 'POST',
			url: 'api/users/signup',
			data: $scope.user
		}).then(function (res) {
			console.log(res.data);
			return res.data;
		}).catch(function (error) {
			console.log(error);
		})
	}

	$scope.login = function () {
		console.log('user: ', $scope.user)
		$http({
			method: 'POST',
			url: 'api/users/login',
			data: $scope.user
		}).then(function (res) {
			console.log(res.data);
			return res.data;
		}).catch(function (error) {
			console.log(error);
		})
	}

	var isAuth = function () {
		return !!$window.localStorage.getItem('com.eureka');
	};

	$scope.signout = function () {
		console.log('signing out bro...')
		$window.localStorage.removeItem('com.eureka');
		$location.path('/login');
	};

}]);

