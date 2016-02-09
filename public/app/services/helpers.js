angular.module('eureka.helpers', [])

.factory('Helpers', function ($http, $location, $window) {

	// Enables searchValue to be stored when page changes from 'home' to 'search'
	var searchValue = undefined;

	// Converts dates received from server into readable format
	var lookupDate = function(badDate) {
		var monthObj = {
			'01': "January",
			'02': "February",
			'03': "March",
			'04': "April",
			'05': "May",
			'06': "June",
			'07': "July",
			'08': "August",
			'09': "September",
			'10': "October",
			'11': "November",
			'12': "December"
		};
		var dayObj = {
			'01': 'st',
			'02': 'nd',
			'03': 'rd',
			'21': 'st',
			'22': 'nd',
			'23': 'rd',
			'31': 'st'
		};
		var array = badDate.split('T');
		var date = array[0].split('-');
		var year = date[0];
		var month = monthObj[date[1]];
		var day;
		if(dayObj[date[2]]) {
			var start = (date[2] < 10) ? date[2].slice(1) : date[2]
			day = start + dayObj[date[2]];
		} else {
			var start = (date[2] < 10) ? date[2].slice(1) : date[2]
			day = start + 'th';
		}
		date = month + ' ' + day + ', ' + year
		return date;
	}

	// exports
	return {
		searchValue: searchValue,
		lookupDate: lookupDate
	}

})
