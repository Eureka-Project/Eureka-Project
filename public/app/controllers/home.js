angular.module('eureka.home', [])

.controller('HomeController', ['$scope', '$http', '$window', '$location', 'Helpers', 'Auth' ,function($scope, $http, $window, $location, Helpers, Auth, Global) {
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

	// data being temporarily stored
	$scope.username = JSON.parse($window.localStorage.getItem('eureka')).username;
	$scope.user_id = JSON.parse($window.localStorage.getItem('eureka')).user_id;
	$scope.firstname = undefined; // will be defined once 'getUserInfo' is run
	$scope.lastname = undefined; // will be defined once 'getUserInfo' is run
	$scope.token = JSON.parse($window.localStorage.getItem('eureka')).token;
	$scope.links = undefined; // will be defined once 'getLinks' is run
	$scope.allLinks = undefined; // will be defined once 'getLinks' is run
	$scope.searchValue = Helpers.searchValue; // defined when 'search' is run


	$scope.getLinks = function () {
		console.log('getting links...');
		$http({
			method: 'GET',
			url: '/api/links'
		}).then(function (res) {
			console.log('data', res.data)
			for (var prop in res.data.links) {
				var date = Helpers.lookupDate(res.data.links[prop].date);
				res.data.links[prop].date = date;
				for (var i = 0; i < res.data.links[prop].links.length; i++) {
					var link = res.data.links[prop].links[i];
					link.date = date;
				}
			}
			$scope.links = res.data.links;
			var results = [];
			for (var prop in $scope.links) {
				results = results.concat($scope.links[prop].links)
			}
			$scope.allLinks = results;
			// console.log('Links: ', $scope.allLinks)
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
			$scope.getLinks();
			return res.data;
		}).catch(function (error) {
			console.log(error);
		})
		$scope.addLink.$setPristine();
		$scope.newLink = "";
		$scope.changeModal();
	}

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
			$scope.getLinks();
			return res.data;
		}).catch(function (error) {
			console.log(error);
		})
	}

	$scope.search = function(searchText) {
		Helpers.searchValue = searchText;
		$location.path('/search')
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
			if (!$scope.firstname) $location.path('/login')
		})
	}

	$scope.getClickedLinkURL = function(linkUrl, linkImage, linkTitle, linkDescription, linkSiteName, linkUsername, linkIndex, linkID){
		$window.localStorage.setItem("CommentUrl", linkUrl);
		$window.localStorage.setItem("CommentImage", linkImage);
		$window.localStorage.setItem("CommentTitle", linkTitle);
		$window.localStorage.setItem("CommentDescription", linkDescription);
		$window.localStorage.setItem("CommentSiteName", linkSiteName);
		$window.localStorage.setItem("CommentLinkUsername", linkUsername);
		$window.localStorage.setItem("CommentIndex", linkIndex);
		$window.localStorage.setItem("CommentId", linkID);


	}

	$scope.votesLeft = undefined;

	$scope.getVotesLeft = function() {
		$http({
			method:'GET', 
			url:'/api/users/' + $scope.user_id,
		}).then(function (res) {
			console.log("user info", res)
			$scope.votesLeft = res.data.votesLeft;
		}).catch(function (err) {
			console.log(err);
		})
	}


	$scope.getVotesLeft();
	// Get Link Information When Controller Loads
	$scope.getLinks();
	$scope.getUserInfo();

}]);