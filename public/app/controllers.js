var Home = angular.module('eureka.home', [])

Home.controller('HomeController', ['$scope', '$http', function($scope, $http) {

}]);



var Auth = angular.module('eureka.auth', [])

Auth.controller('AuthController', ['$scope', '$http', function($scope, $http) {

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

}]);

