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