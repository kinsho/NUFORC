/**
 * @main prodBuildScript
 *
 * The program responsible for generating a build script that will bundle all application-specific client-side scripts
 * (as well as their dependencies) into a small set of minified, production-ready scripts
 */

// ----------------- APP_ROOT_PATH INSTANTIATION --------------------------

global.OwlStakes =
{
	require : require('app-root-path').require
};

// ----------------- EXTERNAL MODULES --------------------------

var _Q = require('q'),
	_fs = require('fs'),
	fileManager = global.OwlStakes.require('utility/fileManager');

// ----------------- ENUM/CONSTANTS --------------------------

var JSPM_PACKAGES_DIR = 'jspm_packages/',
	CLIENT_SCRIPTS_ROOT_DIR = 'client/scripts/',
	PROD_DIR = 'prod/',
	PROD_BUILDER_DIR = 'builder/',
	PLUGINS_DIR = 'client/scripts/plugins/',

	MAIN_FILE_KEYWORD = 'main',
	PROD_BUILD_SCRIPT_NAME = 'prodBuild',
	APP_DESTINATION_SCRIPT_NAME = 'app',

	JAVASCRIPT_EXTENSION = '.js',
	SHELL_SCRIPT_EXTENSION = '.sh',
	MAP_EXTENSION = '.map',

	JSPM_PROGRAM_NAME = 'jspm',
	UGLIFY_JS_PROGRAM_NAME = 'uglifyjs',
	COMPILATION_COMMAND_NAME = 'bundle-sfx',
	REMOVE_COMMAND = 'rm -rf',
	MANGLE_KEYWORD = '--mangle',
	OUTPUT_KEYWORD = '--output';

// ----------------- I/O FUNCTION TRANSFORMATIONS --------------------------

var fsWriteFile = _Q.denodeify(_fs.writeFile);

// ----------------- BUILD SCRIPT GENERATOR --------------------------

_Q.spawn(function* ()
{
	// Fetch all the paths to every single file underneath the client scripts directory
	var allFiles = yield fileManager.fetchAllFilePaths(CLIENT_SCRIPTS_ROOT_DIR),
		appScriptFiles = [],
		buildScript = '',
		destinationFile = PROD_DIR + APP_DESTINATION_SCRIPT_NAME + JAVASCRIPT_EXTENSION,
		filePath,
		i;

	// Only collect files that are application-specific scripts defined either as main entry scripts
	// or plugin scripts
	for (i = allFiles.length - 1; i >= 0; i--)
	{
		filePath = allFiles[i].path;

		if ( (filePath.endsWith(JAVASCRIPT_EXTENSION)) &&
			 (filePath.indexOf(JSPM_PACKAGES_DIR) === -1) &&
			 (filePath.indexOf(MAIN_FILE_KEYWORD) > -1) )
		{
			appScriptFiles.push(filePath);
		}
		else if ( (filePath.endsWith(JAVASCRIPT_EXTENSION)) &&
	   			  (filePath.indexOf(JSPM_PACKAGES_DIR) === -1) &&
				  (filePath.indexOf(PLUGINS_DIR) > -1) )
		{
			appScriptFiles.push(filePath);
		}
	}

	// Start writing out the build script
	buildScript += JSPM_PROGRAM_NAME + ' ' + COMPILATION_COMMAND_NAME;

	// All entry and plugin scripts need to bundled (together with their dependencies) into one file
	for (i = appScriptFiles.length - 1; i >= 0; i--)
	{
		filePath = appScriptFiles[i];

		if (i === appScriptFiles.length - 1)
		{
			buildScript += ' ' + filePath.replace(JAVASCRIPT_EXTENSION, '');
		}
		else
		{
			buildScript += ' + ' + filePath.replace(JAVASCRIPT_EXTENSION, '');
		}
	}

	// Write out the name of the destination scripts that will serve as the main application script in production
	buildScript += ' ' + destinationFile;

	buildScript += '\n';

	// Now write out the command to minify that compact file
	buildScript += UGLIFY_JS_PROGRAM_NAME + ' ' +  destinationFile + ' ' + MANGLE_KEYWORD + ' ' + OUTPUT_KEYWORD + ' ' + destinationFile;

	// Append the command to remove map files that would be generated from the jspm bundler
	buildScript += '\n' + REMOVE_COMMAND + ' ' + PROD_DIR + '*' + MAP_EXTENSION;

	// Write out the build script to an external file so that it can be readily executed via an outside shell script
	yield fsWriteFile(PROD_DIR + PROD_BUILDER_DIR + PROD_BUILD_SCRIPT_NAME + SHELL_SCRIPT_EXTENSION, buildScript);

	console.log("Done writing a new build script!");
});