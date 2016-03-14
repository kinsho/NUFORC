/**
 * @module router
 */

// ----------------- EXTERNAL MODULES --------------------------

var _Q = require('q'),
	fileManager = global.OwlStakes.require('utility/fileManager');

// ----------------- ENUM/CONSTANTS --------------------------

var ROUTE_JSON_DIRECTORY = 'config/',
	ROUTE_JSON_NAME = 'routes',

	CONTROLLERS_DIRECTORY = 'controllers/',
	FOUNDATION_DIRECTORY = 'utility/',
	PAGE_NOT_FOUND_CONTROLLER = '404',
	HOME_CONTROLLER = 'home',
	RESOURCES_CONTROLLER = 'resources',

	INIT_ACTION = 'init',
	CONTROLLER_SUFFIX = 'Controller',

	RESOURCE_EXTENSIONS =
	[
		'.scss',
		'.png',
		'.svg',
		'.js',
		'.ico',
		'.map'
	],

	CONTENT_TYPE_HEADERS =
	{
		'' : 'text/html', // If the URL does not fit any of the other patterns defined above, set an HTML header by default
		'ico' : 'image/vnd.microsoft.icon',
		'scss' : 'text/css',
		'png' : 'image/png',
		'svg' : 'image/svg+xml',
		'js' : 'application/javascript',
		'map' : 'application/javascript'
	};

// ----------------- PRIVATE VARIABLES -----------------------------

var routes; // the cache of all route data, in JSON format

// ----------------- MODULE DEFINITION --------------------------
module.exports =
{
	/**
	 * Function responsible for fetching and caching all routing data into this module
	 *
	 * @author kinsho
	 */
	populateRoutes: _Q.async(function* ()
	{
		if ( !(routes) )
		{
			routes = JSON.parse(yield fileManager.fetchJSON(ROUTE_JSON_DIRECTORY + ROUTE_JSON_NAME));
		}
	}),

	/**
	 * Function responsible for determining whether the URL is asking for a resource, be it an image or a
	 * stylesheet
	 *
	 * @params {String} url - the URL to inspect
	 *
	 * @returns {boolean} - indicates whether the URL is asking for a media or style resource
	 *
	 * @author kinsho
	 */
	isResourceWanted: function (url)
	{
		var i;

		for (i = RESOURCE_EXTENSIONS.length - 1; i >= 0; i--)
		{
			if (url.endsWith(RESOURCE_EXTENSIONS[i]))
			{
				return true;
			}
		}

		return false;
	},

	/**
	 * Function responsible for deducing a filepath (from the server folder) to the controller whose name is passed
	 *
	 * @param {String} controller - the name of the controller for which a relative path will be calculated
	 *
	 * @returns {String} - a relative filepath to the controller that can then be consumed by requireJS to fetch
	 * 		the controller file and actually begin some real server-side processing
	 *
	 * @author kinsho
	 */
	findController: function(controllerName)
	{
		// If a path has not been defined, the server routes to a page marked as the home page
		controllerName = controllerName || HOME_CONTROLLER;

		// If a path has been defined however, the server will route the request to the controller indicated
		// within the URL, provided that a controller can be found that matches the one indicated within the URL.
		return (routes[controllerName] ? CONTROLLERS_DIRECTORY + routes[controllerName] + CONTROLLER_SUFFIX :
			CONTROLLERS_DIRECTORY + routes[PAGE_NOT_FOUND_CONTROLLER] + CONTROLLER_SUFFIX);
	},

	/**
	 * Function responsible for generating a path to the resource controller that will be used to fetch media and
	 * style files
	 *
	 * @returns {String} - a relative filepath to the resource controller that can then be consumed by requireJS
	 * 		to fetch the controller file and ultimately fetch the contents of resource files
	 *
	 * @author kinsho
	 */
	findResourceController: function()
	{
		return CONTROLLERS_DIRECTORY + FOUNDATION_DIRECTORY + routes[RESOURCES_CONTROLLER] + CONTROLLER_SUFFIX;
	},

	/**
	 * Function responsible for defining a full route toward a specific action method within a controller. If an
	 * action method has not been explicitly specified by the request being served, a full route to that controller's
	 * initialization function will be provided instead
	 *
	 * @param {String} [actionMethod] - name of the method to invoke from the target controller
	 *
	 * @returns {String} - the full name of the action method to invoke within the target controller
	 *
	 * @author kinsho
	 */
	findAction: function(actionMethod)
	{
		return (actionMethod || INIT_ACTION);
	},

	/**
	 * Function responsible for determining the content-type header to put in the response before it is sent to
	 * the client
	 *
	 * @params {String} url - the URL to inspect in order to figure out the content-type header
	 *
	 * @returns {String} - the content-type header to place in the HTTP response
	 *
	 * @author kinsho
	 */
	deduceContentType: function(url)
	{
		var keys = Object.keys(CONTENT_TYPE_HEADERS),
			i;

		for (i = keys.length - 1; i >= 0; i--)
		{
			if ( url.endsWith(keys[i]) )
			{
				return CONTENT_TYPE_HEADERS[keys[i]];
			}
		}
	}
};