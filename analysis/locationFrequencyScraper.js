// ----------------- APP_ROOT_PATH INSTANTIATION --------------------------

global.NUFORC =
{
	require : require('app-root-path').require
};

// ----------------- EXTERNAL MODULES --------------------------

var _Q = require('Q'),
	_cheerio = require('cheerio'),
	scraper = global.NUFORC.require('analysis/baseScraper'),
	mongo = global.NUFORC.require('data/databaseDriver'),
	rQuery = global.NUFORC.require('utility/rQuery');

// ----------------- ENUMS/CONSTANTS --------------------------

var DATABASE_COLLECTION_NAME = 'regionFrequency',

	// Note the placeholder in the URL string that allows us to load data from different URLs
	INDEX_URL = 'http://www.nuforc.org/webreports/ndxe::year::month.html',
	YEAR_PLACEHOLDER_LABEL = '::year',
	MONTH_PLACEHOLDER_LABEL = '::month',

	STARTING_YEAR = 2005,
	INTERNATIONAL_KEYWORD = 'INT';

// ----------------- PRIVATE VARIABLES --------------------------

// ----------------- SCRAPER LOGIC --------------------------

_Q.spawn(function* ()
{
	var HTML,
		url,
		$,
		table,
		regionCells, region,
		dataSet = [],
		noMoreData = false,
		regionMap,
		currentYear = STARTING_YEAR,
		j, k;

	// Keep scraping until no more pages can be found
	while ( !(noMoreData) )
	{
		for (j = 1; j <= 12; j++)
		{
			// Construct the URL
			url = INDEX_URL.replace(YEAR_PLACEHOLDER_LABEL, currentYear).replace(MONTH_PLACEHOLDER_LABEL, (j < 10 ? '0' + j : j));

			// Fetch the HTML
			HTML = yield scraper.scrape(url);
			$ = _cheerio.load(HTML);

			// If no more data can be scraped, cease any more scrape-work
			if ( !(HTML) )
			{
				noMoreData = true;
				break;
			}

			// Initialize the state frequency map
			regionMap = {};

			// Isolate the table that contains all the data that needs to be scraped
			table = $('table tbody');

			// Find all the data cells that contain the state/region information
			regionCells = table.find('td:nth-child(3) font');

			for (k = 0; k < regionCells.length; k++)
			{
				// Fetch the region
				// If no region is specified, the incident happened somewhere outside the vicinity of the US/Canada
				region = regionCells.eq(k).text() || INTERNATIONAL_KEYWORD;

				regionMap[region] = regionMap[region] ? regionMap[region] + 1 : 1;
			}

			dataSet.push(mongo.formInsertSingleQuery(
				{
					monthYear: new Date(currentYear, j - 1),
					regionFrequencyMap: rQuery.copyObject(regionMap)
				}));
		}

		// Increment the current year
		currentYear += 1;
	}

	// Prep the database for data insertion
	yield mongo.initialize();

	// Dump all the old stats (for the season being scraped) from the database
	yield mongo.bulkWrite(DATABASE_COLLECTION_NAME, true, mongo.formDeleteManyQuery({}));

	// Push all the stats into the database
	dataSet.unshift(DATABASE_COLLECTION_NAME, true);
	yield mongo.bulkWrite.apply(mongo, dataSet);

	// Close the database
	yield mongo.closeDatabase();

});