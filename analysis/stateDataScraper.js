// ----------------- APP_ROOT_PATH INSTANTIATION --------------------------

global.NUFORC =
{
	require : require('app-root-path').require
};

// ----------------- EXTERNAL MODULES --------------------------

var _Q = require('Q'),
	scraper = global.NUFORC.require('analysis/baseScraper'),
	mongo = global.NUFORC.require('DAO/utility/databaseDriver');

// ----------------- ENUMS/CONSTANTS --------------------------

var DATABASE_COLLECTION_NAME = 'censusData',

	STATE_CODES_TEXT_FILE_LINK = 'http://www2.census.gov/geo/docs/reference/state.txt',
	CENSUS_STATE_DATA_API_URL = 'http://api.census.gov/data/2010/sf1?get=P0010001&for=state:{{censusCode}}&key=a655ecb599ec75b97278ea02420fb534c1a39547',
	CENSUS_CODE_PLACEHOLDER_LABEL = '{{censusCode}}';

// ----------------- PRIVATE VARIABLES --------------------------

// ----------------- SCRAPER LOGIC --------------------------

_Q.spawn(function* ()
{
	var regionCodesTxt, censusData,
		lines, line,
		regions = [],
		i;

	// Scrape the text file containing all the state codes
	regionCodesTxt = yield scraper.scrape(STATE_CODES_TEXT_FILE_LINK);

	// Go through the text file and store all the relevant data for each region in the United States
	lines = regionCodesTxt.split('\n');
	for (i = 1; i < lines.length; i++)
	{
		// Do not execute any of the loop logic for empty lines
		if ( !(lines[i]) ) { continue; }

		line = lines[i].split('|');

		// Call the census API to fetch population data for the region currently in context
		censusData = yield scraper.scrape(CENSUS_STATE_DATA_API_URL.replace(CENSUS_CODE_PLACEHOLDER_LABEL, line[0]));

		regions.push(mongo.formInsertSingleQuery(
			{
				region: line[2],
				postalCode: line[1],
				censusCode: line[0],
				// For certain regions, population data may be unavailable
				population: censusData ? parseInt(JSON.parse(censusData)[1][0], 10) : ''
			}));
	}

	// Prep the database for data insertion
	yield mongo.initialize();

	// Dump all the old stats (for the season being scraped) from the database
	yield mongo.bulkWrite(DATABASE_COLLECTION_NAME, true, mongo.formDeleteManyQuery({}));

	// Push all the stats into the database
	regions.unshift(DATABASE_COLLECTION_NAME, true);
	yield mongo.bulkWrite.apply(mongo, regions);

	// Close the database
	yield mongo.closeDatabase();

});