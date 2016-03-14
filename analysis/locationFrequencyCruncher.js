// ----------------- APP_ROOT_PATH INSTANTIATION --------------------------

global.NUFORC =
{
	require : require('app-root-path').require
};

// ----------------- EXTERNAL MODULES --------------------------

var _Q = require('Q'),
	mongo = global.NUFORC.require('DAO/utility/databaseDriver'),
	rQuery = global.NUFORC.require('utility/rQuery');

// ----------------- ENUMS/CONSTANTS --------------------------

var DATABASE_NUFORC_COLLECTION_NAME = 'regionFrequency',
	DATABASE_CENSUS_COLLECTION_NAME = 'censusData';

// ----------------- PRIVATE VARIABLES --------------------------

// ----------------- CRUNCHER LOGIC --------------------------

module.exports =
{
	/**
	 * Function returns a map detailing the number of incidents in each region across a span of time
	 * specified by the parameters
	 *
	 * @param {Date} startDate - the beginning date that will be used to define the timespan in which to
	 * 		crunch data
	 * @param {Date} endDate - the ending date that will be used to define the timespan in which to crunch data
	 *
	 * @returns {Object} - a map of data noting incidence frequency across all the regions in which NUFORC tracks
	 * 		UFO sightings
	 */
	calculateFrequencyWithinRange: _Q.async(function* (startDate, endDate)
	{
		var data,
			frequencyMap = {},
			frequencyMapEntries,
			regionKeys,
			i, j;

		// Prep the database for data retrieval
		yield mongo.initialize();

		// Pull all relevant stats from the database
		data = yield mongo.read(DATABASE_NUFORC_COLLECTION_NAME,
			{
				monthYear: { $lte: endDate, $gte: startDate }
			});

		for (i = data.length - 1; i >= 0; i--)
		{
			regionKeys = Object.keys(data[i].regionFrequencyMap);

			for (j = regionKeys.length - 1; j >= 0; j--)
			{
				// If the region has not been recorded yet into the aggregate map, create an entry for that region
				if ( !(frequencyMap[regionKeys[j]]) )
				{
					frequencyMap[regionKeys[j]] = 0;
				}

				// Keep the bookkeeping going
				frequencyMap[regionKeys[j]] += data[i].regionFrequencyMap[regionKeys[j]];
			}
		}

		// Now sort the frequency map into an array that can be easily traversed
		frequencyMapEntries = rQuery.findObjectEntries(frequencyMap);
		frequencyMapEntries.sort(function(a, b) { return a[1] - b[1]; });

		return frequencyMapEntries;
	}),

	/**
	 * Function returns a map comprised of incident-to-population ratios for each state across a span of time
	 * specified by the parameters
	 *
	 * @param {Date} startDate - the beginning date that will be used to define the timespan in which to
	 * 		crunch data
	 * @param {Date} endDate - the ending date that will be used to define the timespan in which to crunch data
	 *
	 * @returns {Object} - a map of data that relays all the frequency ratios across all US states in which NUFORC
	 * 		tracks data
	 */
	calculatePerCapitaFrequencyWithinRange: _Q.async(function* (startDate, endDate)
	{
		var censusData,
			populationMap = {},
			frequencyData = yield this.calculateFrequencyWithinRange(startDate, endDate),
			ratioMap = {},
			ratioEntries,
			ratio,
			i;

		// Prep the database for data retrieval
		yield mongo.initialize();

		// Pull all relevant stats from the database
		censusData = yield mongo.read(DATABASE_CENSUS_COLLECTION_NAME, {});

		// Transform the census stats into a format that can be readily used for this method's purposes
		for (i = censusData.length - 1; i >= 0; i--)
		{
			populationMap[censusData[i].postalCode] = censusData[i].population;
		}

		// Calculate the frequency per capita ratio for each state
		for (i = frequencyData.length - 1; i >= 0; i--)
		{
			// Only calculate ratios for states that have population data
			if (populationMap.hasOwnProperty(frequencyData[i][0]))
			{
				ratio = Math.round(populationMap[frequencyData[i][0]] / frequencyData[i][1]);
				ratioMap[frequencyData[i][0]] = ratio;
			}
		}

		// Now sort the collection of ratios into an array that can be easily traversed
		ratioEntries = rQuery.findObjectEntries(ratioMap);
		ratioEntries.sort(function(a, b) { return a[1] - b[1]; });

		return ratioEntries;
	})
};