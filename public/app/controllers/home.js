angular.module('eureka.home', [])

.controller('HomeController', ['$scope', '$http', '$window', '$location', 'Data', 'Auth' ,function($scope, $http, $window, $location, Data, Auth) {
	// Checking If User Has Cookie
	if (!Auth.isAuth()) $location.path('/login')

	$scope.modalShow = false;
	$scope.changeModal = function() {
		console.log('changing modal...')
		if ($scope.modalShow === false) {
			$scope.modalShow = true;
		} else {
			$scope.modalShow = false;
		}
	}

	$scope.username = Data.username;

	$scope.getLinks = function () {
		console.log('getting links...');
		$http({
			method: 'GET',
			url: '/api/links'
		}).then(function (res) {
			Data.links = res.data.links;
			$scope.links = res.data.links;
			console.log(res.data);
			return res.data;
		}).catch(function (error) {
			console.log(error);
		})
	}

	$scope.submitLink = function(link) {
		console.log('submitting link...', link)
		var data = {};
		data.url = link;
		data.username = Data.username;
		console.log(data)
		$http({
			method: 'POST',
			url: '/api/links',
			headers: {'Authorization': Data.token },
			data: data
		}).then(function (res) {
			console.log('success...link added')
			return res.data;
		}).catch(function (error) {
			console.log(error);
		})
		$scope.addLink.$setPristine();
		$scope.newLink = "";
		$scope.changeModal();
	}

	$scope.signout = function () { Auth.signout() };

	$scope.searchValue = Data.searchValue;

	$scope.search = function(searchText) {
		Data.searchValue = searchText;
		$location.path('/search')
	}

	// Get Links When Controller Loads
	$scope.getLinks()

	$scope.links = Data.links;

}]);
