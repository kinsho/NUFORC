// ----------------- EXTERNAL MODULES --------------------------

var _request = require('request'),
	_Q = require('Q');

// No need to reference this module again after it has been properly instantiated
// Only uncomment this block if you need to debug the scraper
/*
 require('request-debug')(request, function(type, data)
 {
 var util = require('util');

 console.log("TYPE: " + type);
 console.log("HEADERS: " + util.inspect(data.headers));
 });
 */

// ----------------- ENUMS/CONSTANTS --------------------------

// ----------------- PRIVATE VARIABLES --------------------------

var headers =
	{
		'Cache-Control': 'max-age=0',
		'Connection': 'keep-alive',
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:39.0) Gecko/20100101 Firefox/39.0'
	};

// ----------------- I/O FUNCTION TRANSFORMATIONS --------------------------

// ----------------- MODULE DEFINITION --------------------------
module.exports =
{
	/**
	 * Generator-ready function responsible for scraping all the data off a particular page
	 *
	 * @param {String} url - the URL of the page that needs to be scraped
	 *
	 * @returns {Promise} a classical Deferred Promise
	 *
	 * @author kinsho
	 */
	scrape: function (url)
	{
		// Use a promise here instead of the default generator syntax due to the way data is
		// sent back from the request module
		var deferred = _Q.defer();

		// Log the URL
		console.log('Scraping HTML from ' + url);

		_request(
			{
				url: url,
				headers: headers
			}, function(error, response, body)
			{
				// Make sure to return nothing should the page not exist
				deferred.resolve((response.statusCode === 200) ? body : '');
			});

		return deferred.promise;
	},
};