/**
 * @main axios
 */

// ----------------- EXTERNAL MODULES --------------------------

import _axios from 'axios';
import _promise from 'es6-promise';
import config from 'config/config';

// ----------------- PRIVATE MEMBERS --------------------------

var _axiosConnection; // The actual instance of axios that we will be using to manage HTTP transactions

// ----------------- PRIVATE FUNCTIONS --------------------------

/**
 * A generic handler to hopefully handle all errors generated from the usage of axios
 *
 * @param {String} requestType - the type of HTTP request that necessitated the execution of this function
 * 		in the first place
 * @param {Object} response - an object with specialized properties depending on the nature of the error
 *
 * @author kinsho
 */
function _genericErrorLogger(response)
{
	console.error('ERROR ---> axios.' + response.config.method);
	console.error('Error was generated while trying to connect to ' + response.config.url);
}

// ----------------- MODULE ---------------------------

var axiosModule =
{
	/**
	 * Generic function to leverage when making POST requests from the client
	 *
	 * @param {String} url - the URL towards which to direct the request
	 * @param {Object} payload - a hashmap of data to send over the wire
	 *
	 * @returns {Object} - an object containing either data from an external source or a reason why the request ultimately
	 * 		failed to return meaningful data
	 *
	 * @author kinsho
	 */
	post: function(url, payload)
	{
		_axiosConnection.post(url, payload).then(function(response)
		{
			return response.data;
		}).catch(_genericErrorLogger);
	},

	/**
	 * Generic function to leverage when making GET requests from the client
	 *
	 * @param {String} url - the URL towards which to direct the request
	 * @param {Object} payload - a hashmap of data to send over the wire as query parameters
	 *
	 * @returns {Promise<Object>} - an object containing either data from an external source or a reason why the request
	 * 		ultimately failed to return meaningful data
	 *
	 * @author kinsho
	 */
	get: function(url, params)
	{
		return new Promise(function(resolve, reject)
		{
			_axiosConnection.get(url,
			{
				params : params
			}).then(function(response)
			{
				resolve(response.data);
			}).catch(function(response)
			{
				_genericErrorLogger(response);
				reject('');
			});
		});
	}
};

// ----------------- CONFIGURATION ---------------------------

// Simulate promise functionality should the browser not support the syntax of promises
_promise.polyfill();

// Configure axios by generating a new instance with custom configuration properties
_axiosConnection = _axios.create(
{
//	baseURL : config.BASE_URL,
	timeout : 1000
});

// ----------------- EXPORT ---------------------------

export default axiosModule;