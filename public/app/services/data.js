angular.module('eureka.data', [])

.factory('Data', function ($http, $location, $window) {

	// Enables searchValue to be stored when page changes from 'home' to 'search'
	var searchValue = undefined;

	return {
		searchValue: searchValue,
	}

})