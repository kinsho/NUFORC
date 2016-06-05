/**
 * Application Configuration
 */

// ----------------- CONFIGURATION ---------------------------

var config =
{
	// HTTP Requests
	BASE_URL: 'http://localhost:3000/',

	// Database
	DATABASE_URL: 'mongodb://kinsho:NUFORC@localhost:27017/NUFORC',

	// Environment
	IS_DEV: false,
	IS_PROD: true
};

// ----------------- EXPORT ---------------------------

module.exports = config;