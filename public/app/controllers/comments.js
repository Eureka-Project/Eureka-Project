angular.module('eureka.comments', [])

 .controller('CommentsController', ['$scope', '$http', '$window', '$location', 'Helpers', 'Auth', '$stateParams' ,function($scope, $http, $window, $location, Helpers, Auth, $stateParams) { 

 	
 	if (!Auth.isAuth()) $location.path('/login')

 	$scope.comments = undefined;

 	$scope.link = {};
	$scope.link.url = $window.localStorage.getItem("CommentUrl");
	$scope.link.image = $window.localStorage.getItem("CommentImage");
	$scope.link.title = $window.localStorage.getItem("CommentTitle");
	$scope.link.description = $window.localStorage.getItem("CommentDescription");
	$scope.link.site_name = $window.localStorage.getItem("CommentSiteName");
	$scope.link.username = $window.localStorage.getItem("CommentLinkUsername");
	$scope.link.ID = $window.localStorage.getItem("CommentId");


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

//Get the comments on the link
	$scope.getLinkComments = function() {
		console.log("looking for link comments")
		var id = $window.localStorage.getItem("CommentId");
		console.log("id", id)
		$http({
			method: 'GET', 
			url: '/api/comments/'+ id ,
		}).then(function (res) {
			console.log("succes heres the data", res);
			$scope.comments = res.data
		}).catch(function (err) {
			console.log("comments", err)
		})
	}


 $scope.postComment = function(comment) {
		var data = {};
		data.text = comment;
		data.link_id = $scope.link.ID;
		$http({
			method: 'POST',
			url: '/api/comments',
			data: data
		}).then(function (res) {
			console.log('comment posted');
			$scope.getLinkComments()
			return res;
		}).catch(function (error) {
			console.log(error);
		})
	}





	





	// get user and profile info to display when controller loads
	$scope.getUserInfo();
	$scope.getLinkComments();
	

 }])