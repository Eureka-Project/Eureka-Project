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
	$scope.votesLeft = undefined;

	$scope.upvote = function(linkID) {
		console.log('submitting upvote by', $scope.user_id)
		console.log('linkID: ', linkID)
		var data = {};
		data.user_id = $scope.user_id;
		data.username = $scope.username;
		data.link_id = linkID;
		$http({
			method: 'POST',
			url: '/api/upvote',
			data: data
		}).then(function (res) {
			console.log('success...upvoted')
			// console.log('body: ', res.data)
			// $scope.getLinks();
			return res.data;
		}).catch(function (error) {
			console.log(error);
		})
	}

	$scope.undoUpvote = function(linkID) {
		console.log('submitting undo by', $scope.user_id)
		console.log('linkID: ', linkID)
		var data = {};
		data.user_id = $scope.user_id;
		data.username = $scope.username;
		data.link_id = linkID;
		$http({
			method: 'POST',
			url: '/api/upvote/undo',
			data: data
		}).then(function (res) {
			console.log('success...undone')
			// console.log('body: ', res.data)
			// $scope.getLinks();
			return res.data;
		}).catch(function (error) {
			console.log(error);
		})
	}

	$scope.resetVotes = function(){
		console.log('resetting from client')
		var data = {};
		data.user_id = $scope.user_id;
		data.username = $scope.username;
		console.log('data for reset', data)
		$http({
			method: 'POST',
			url: '/api/users/resetVotes',
			data: data
		}).then(function(res){
			if(res){
				console.log('vote limit was reset')
			}
		})
	}

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

	$scope.submitLink = function(link) {
		console.log('submitting link...', link)
		var data = {};
		data.url = link;
		data.username = $scope.firstname + ' ' + $scope.lastname;
		data.user_id = $scope.user_id;
		console.log(data)
		$http({
			method: 'POST',
			url: '/api/links',
			data: data
		}).then(function (res) {
			console.log('success...link added')
			$scope.getProfileInfo();
			return res.data;
		}).catch(function (error) {
			console.log(error);
		})
		$scope.addLink.$setPristine();
		$scope.newLink = "";
		$scope.changeModal();
	}

	$scope.getProfileInfo = function() {
		console.log('getting profile info...');
		// Check if vote limit needs to be reset
		$scope.resetVotes();

		$http({
			method: 'GET',
			url: '/api/users/profile/' + $stateParams.userID,
		}).then(function (res) {
			for (var i = 0; i < res.data.submittedLinks.length; i++) {
				var link = res.data.submittedLinks[i];
				link.date = Helpers.lookupDate(link.date);
				var upvotedBy = JSON.parse(link.upvotedBy);
				if(upvotedBy[$scope.user_id]){
					link.undo = true;
					console.log('FOUND USER ID IN UPVOTEDBY', link.undo)
				}else{
					link.undo = false;
				}
				link.showUndo = false;
				link.displayUpvoted = function(link){
					link = this;
					link.undo = true;
					link.upvotes++;
					$scope.votesLeft--;
				};
				link.showUnvoted = function(){
					link = this;
					link.undo = false;
					link.upvotes--;
					$scope.votesLeft++;
				};
			}
			for (var x = 0; x < res.data.upvotedLinks.length; x++) {
				var link = res.data.upvotedLinks[x];
				link.date = Helpers.lookupDate(link.date);
				var upvotedBy = JSON.parse(link.upvotedBy);
				if(upvotedBy[$scope.user_id]){
					link.undo = true;
					console.log('FOUND USER ID IN UPVOTEDBY', link.undo)
				}else{
					link.undo = false;
				}
				link.showUndo = false;
				link.displayUpvoted = function(link){
					link = this;
					link.undo = true;
					link.upvotes++;
					$scope.votesLeft--;
				};
				link.showUnvoted = function(){
					link = this;
					link.undo = false;
					link.upvotes--;
					$scope.votesLeft++;
				};
			}
			$scope.profileUsername = res.data.username;
			$scope.profileFirstName = res.data.firstname;
			$scope.profileLastName = res.data.lastname;
			$scope.profileSubmittedLinks = res.data.submittedLinks;
			$scope.profileUpvotedLinks = res.data.upvotedLinks;
			console.log('progileUpvotedLinks', $scope.profileUpvotedLinks)
			return res.data;
		}).catch(function (error) {
			console.log(error);
		})
	}


	// get user and profile info to display when controller loads
	$scope.getUserInfo();
	$scope.getProfileInfo();


}]);