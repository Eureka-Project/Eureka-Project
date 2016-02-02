angular.module('eureka.auth', [])

.controller('AuthController', ['$scope', '$http', '$window', '$location', 'Auth', function($scope, $http, $window, $location, Auth) {

	$scope.user = {};

	$scope.loginErr = false;
	$scope.signupErr = false;
	$scope.loginTxt = "";
	$scope.signupTxt = "";

	$scope.signup = function () {
		Auth.signup($scope.user)
		.then(function (data) {
			console.log('success...signing in now...');
			$window.localStorage.setItem('eureka', JSON.stringify(data));
			$scope.signupErr = false;
			$location.path('/home');
		})
		.catch(function (error) {
			$scope.signupErr = true;
			$scope.signupTxt = error.data.error;
			console.error('Message: ', error.data.error);
		});
	}

	$scope.login = function () {
		Auth.login($scope.user)
		.then(function (data) {
			console.log('success...signing in now...');
			$window.localStorage.setItem('eureka', JSON.stringify(data));
			$scope.loginErr = false;
			$location.path('/home');
		})
		.catch(function (error) {
			$window.localStorage.removeItem('com.eureka');
			$scope.loginErr = true;
			$scope.loginTxt = error.data.error;
			console.error('Message: ', error.data.error);
		});
	}

	$scope.demoLogin = function () {
		Auth.login({ username: 'DemoUser', password: '1234'})
		.then(function (data) {
			console.log('success...signing in now...');
			$window.localStorage.setItem('eureka', JSON.stringify(data));
			$scope.loginErr = false;
			$location.path('/home');
		})
		.catch(function (error) {
			$window.localStorage.removeItem('com.eureka');
			$scope.loginErr = true;
			$scope.loginTxt = error.data.error;
			console.error('Message: ', error.data.error);
		});
	}

}]);