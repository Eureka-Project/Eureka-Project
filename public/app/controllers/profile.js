angular.module('eureka.profile', [])

.controller('ProfileController', ['$scope', '$http', '$window', '$location', 'Helpers', 'Auth', '$stateParams' ,function($scope, $http, $window, $location, Helpers, Auth, $stateParams) {
	// Checking If User Has Cookie
	if (!Auth.isAuth()) $location.path('/login')

	// Enables user to signout
	$scope.signout = function () { Auth.signout() };

	// For the nav dropdown
	$scope.showNavDropdown = false;
	$scope.showNavDropdownContent = function() {
		$scope.showNavDropdown = $scope.showNavDropdown === false ? true : false;
	}

	// For the add link pop-up modal
	$scope.modalShow = false;
	$scope.changeModal = function() {
		$scope.modalShow = $scope.modalShow === false ? true : false;
	}

	// search function for search bar redirect
	$scope.search = function(searchText) {
		Helpers.searchValue = searchText;
		$location.path('/search')
	}

	// toggle tabs on profile page
	$scope.showSubmittedLinks = true;
	$scope.showUpvotedLinks = false;

	$scope.showUpvotedLinksContent = function() {
		$scope.showSubmittedLinks = false;
		$scope.showUpvotedLinks = true;
	}

	$scope.showSubmittedLinksContent = function() {
		$scope.showSubmittedLinks = true;
		$scope.showUpvotedLinks = false;
	}

	// data being temporarily stored
	$scope.username = JSON.parse($window.localStorage.getItem('eureka')).username;
	$scope.user_id = JSON.parse($window.localStorage.getItem('eureka')).user_id;
	$scope.firstname = undefined; // will be defined once 'getUserInfo' is run
	$scope.lastname = undefined; // will be defined once 'getUserInfo' is run
	$scope.token = JSON.parse($window.localStorage.getItem('eureka')).token;
	$scope.searchValue = Helpers.searchValue; // defined when 'search' is run

	// profile data being temporarily stored
	$scope.profileUsername = undefined; // defined when 'getProfileInfo' is run
	$scope.profileFirstName = undefined; // defined when 'getProfileInfo' is run
	$scope.profileLastName = undefined; // defined when 'getProfileInfo' is run
	$scope.profileSubmittedLinks = undefined; // defined when 'getProfileInfo' is run
	$scope.profileUpvotedLinks = undefined; // defined when 'getProfileInfo' is run


	$scope.getUserInfo = function() {
		console.log('getting user info...');
		$http({
			method: 'GET',
			url: '/api/users/' + $scope.user_id,
		}).then(function (res) {
			$scope.firstname = res.data.firstname;
			$scope.lastname = res.data.lastname;
			return res.data;
		}).catch(function (error) {
			console.log(error);
		})
	}

	$scope.getProfileInfo = function() {
		console.log('getting profile info...');
		$http({
			method: 'GET',
			url: '/api/users/profile/' + $stateParams.userID,
		}).then(function (res) {
			for (var i = 0; i < res.data.submittedLinks.length; i++) {
				var link = res.data.submittedLinks[i];
				link.date = Helpers.lookupDate(link.date);
			}
			for (var x = 0; x < res.data.upvotedLinks.length; x++) {
				var link = res.data.upvotedLinks[x];
				link.date = Helpers.lookupDate(link.date);
			}
			$scope.profileUsername = res.data.username;
			$scope.profileFirstName = res.data.firstname;
			$scope.profileLastName = res.data.lastname;
			$scope.profileSubmittedLinks = res.data.submittedLinks;
			$scope.profileUpvotedLinks = res.data.upvotedLinks;
			console.log(res.data)
			return res.data;
		}).catch(function (error) {
			console.log(error);
		})
	}


	// get user and profile info to display when controller loads
	$scope.getUserInfo();
	$scope.getProfileInfo();


}]);
