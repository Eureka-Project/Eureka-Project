angular.module('eureka.data', [])

.factory('Data', function ($http, $location, $window) {

	// Enables searchValue to be stored when page changes from 'home' to 'search'
	var searchValue = undefined;

	var lookupDate = function(badDate) {
		var monthObj = {
			1: "January",
			2: "February",
			3: "March",
			4: "April",
			5: "May",
			6: "June",
			7: "July",
			8: "August",
			9: "September",
			10: "October",
			11: "November",
			12: "December"
		};
		var dayObj = {
			1: 'st',
			2: 'nd',
			3: 'rd',
			21: 'st',
			22: 'nd',
			23: 'rd',
			31: 'st'
		};
		var array = badDate.split('T');
		var date = array[0].split('-');
		var year = date[0];
		var month = monthObj[date[1]];
		if(dayObj[date[2]]) {
			var day = date[2]+dayObj(date[2]);
		} else {
			var day = date[2]+'th';
		}
		date = month + ' ' + day + ', ' + year
		return date;
	}

	return {
		searchValue: searchValue,
		lookupDate: lookupDate
	}

})