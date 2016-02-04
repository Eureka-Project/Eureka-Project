angular.module('eureka.authService', [])

.factory('Auth', function ($http, $location, $window) {

	var login = function (user) {
		return $http({
			method: 'POST',
			url: '/api/users/login',
			data: user
		})
		.then(function (res) {
			return res.data;
		});
	};

	var signup = function (user) {
		return $http({
			method: 'POST',
			url: '/api/users/signup',
			data: user
		})
		.then(function (res) {
			return res.data;
		});
	};

	var isAuth = function () {
		return !!$window.localStorage.getItem('eureka');
	};

	var signout = function () {
		$window.localStorage.removeItem('eureka');
		$location.path('/demoLanding');
	};

	// exports
	return {
		login: login,
		signup: signup,
		isAuth: isAuth,
		signout: signout
	};

})