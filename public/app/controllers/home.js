angular.module('eureka.home', [])

.controller('HomeController', ['$scope', '$http', '$window', '$location', 'Data', 'Auth' ,function($scope, $http, $window, $location, Data, Auth) {
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
	$scope.firstname = undefined;
	$scope.lastname = undefined;
	$scope.token = JSON.parse($window.localStorage.getItem('eureka')).token;
	$scope.links = undefined; // will be defined once 'getLinks' is run
	$scope.allLinks = undefined; // will be defined once 'getLinks' is run
	$scope.searchValue = Data.searchValue; // defined when 'search' is run


	$scope.getLinks = function () {
		console.log('getting links...');
		$http({
			method: 'GET',
			url: '/api/links'
		}).then(function (res) {
			for (var prop in res.data.links) {
				var date = Data.lookupDate(res.data.links[prop].date)
				res.data.links[prop].date = date;
			}
			$scope.links = res.data.links;
			var results = [];
			for (var prop in $scope.links) {
				results = results.concat($scope.links[prop].links)
			}
			$scope.allLinks = results;
			return res.data;
		}).catch(function (error) {
			console.log(error);
		})
	}

	$scope.submitLink = function(link) {
		console.log('submitting link...', link)
		var data = {};
		data.url = link;
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
		data.link_id = linkID;
		$http({
			method: 'POST',
			url: '/api/upvote',
			data: data
		}).then(function (res) {
			console.log('success...upvoted')
			console.log('body: ', res.data)
			$scope.getLinks();
			return res.data;
		}).catch(function (error) {
			console.log(error);
		})
	}

	$scope.search = function(searchText) {
		Data.searchValue = searchText;
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
		})
	}

	// Get Link Information When Controller Loads
	$scope.getLinks();
	$scope.getUserInfo();

}]);





