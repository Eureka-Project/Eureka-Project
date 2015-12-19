angular.module('eureka.profile', [])

.controller('ProfileController', ['$scope', '$http', '$window', '$location', 'Data', 'Auth' ,function($scope, $http, $window, $location, Data, Auth) {
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
	$scope.user_id = JSON.parse($window.localStorage.getItem('eureka')).user_id;
	$scope.token = JSON.parse($window.localStorage.getItem('eureka')).token;
	$scope.searchValue = Data.searchValue; // defined when 'search' is run

	$scope.search = function(searchText) {
		Data.searchValue = searchText;
		$location.path('/search')
	}

}]);
