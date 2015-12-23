angular.module('eureka.profile', [])

.controller('ProfileController', ['$scope', '$http', '$window', '$location', 'Data', 'Auth', '$stateParams' ,function($scope, $http, $window, $location, Data, Auth, $stateParams) {
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

	// search function for search bar redirect
	$scope.search = function(searchText) {
		Data.searchValue = searchText;
		$location.path('/search')
	}

	// data being temporarily stored
	$scope.username = JSON.parse($window.localStorage.getItem('eureka')).username;
	$scope.user_id = JSON.parse($window.localStorage.getItem('eureka')).user_id;
	$scope.token = JSON.parse($window.localStorage.getItem('eureka')).token;
	$scope.searchValue = Data.searchValue; // defined when 'search' is run

	// profile data being temporarily stored
	$scope.profileUsername = undefined; // defined when 'getProfileInfo' is run
	$scope.profileFirstName = undefined; // defined when 'getProfileInfo' is run
	$scope.profileLastName = undefined; // defined when 'getProfileInfo' is run
	$scope.profileSubmittedLinks = undefined; // defined when 'getProfileInfo' is run


	$scope.getProfileInfo = function() {
		console.log('getting profile info...');
		$http({
			method: 'GET',
			url: '/api/users/profile/' + $stateParams.userID,
		}).then(function (res) {
			$scope.profileUsername = res.data.username;
			$scope.profileFirstName = res.data.firstname;
			$scope.profileLastName = res.data.lastname;
			$scope.profileSubmittedLinks = res.data.submittedLinks;
			console.log(res.data)
			return res.data;
		}).catch(function (error) {
			console.log(error);
		})
	}


	// get profile info to display when controller loads
	$scope.getProfileInfo();


}]);
