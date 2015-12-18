angular.module('eureka.data', [])

.factory('Data', function ($http, $location, $window) {

	// Enables searchValue to be stored when page changes from 'home' to 'search'
	var searchValue = undefined;

	var lookupDate = function(badDate) {


		var array = res.data.links[prop].date.split('T');
				date = array[0].split('-');
				res.data.links[prop].date = date;

		return date;
	}

	return {
		searchValue: searchValue,
	}

})