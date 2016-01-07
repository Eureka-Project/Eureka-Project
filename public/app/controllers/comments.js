angular.module('eureka.comments', [])

 .controller('CommentsController', ['$scope', '$http', '$window', '$location', 'Helpers', 'Auth', '$stateParams' ,function($scope, $http, $window, $location, Helpers, Auth, $stateParams) { 

 	if(!Auth.isAuth()) $location.path('/comments')



 }])