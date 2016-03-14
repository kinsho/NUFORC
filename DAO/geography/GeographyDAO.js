/**
 * @module GeographyDAO
 */

// ----------------- EXTERNAL MODULES --------------------------

var _Q = require('q'),
	mongo = global.OwlStakes.require('DAO/utility/databaseDriver'),
	locationFrequencyCruncher = global.OwlStakes.require('analysis/locationFrequencyCruncher');

// ----------------- ENUMS/CONSTANTS --------------------------

var REGION_FREQUENCY_COLLECTION = 'regionFrequency';

// ----------------- MODULE DEFINITION --------------------------
module.exports =
{
	/**
	 * Function responsible for fetching the range of years in which users will be allowed to search for
	 * geography data
	 *
	 * @returns {Object} - a collection of two properties indicating the range of years in which users will be allowed
	 * 		to search for geography data
	 *
	 * @author kinsho
	 */
	fetchYearRange: _Q.async(function* ()
	{
		var dates = yield mongo.read(REGION_FREQUENCY_COLLECTION, {}, { monthYear : 1 });

		return {
			startingYear : dates[0].monthYear.getFullYear(),
			endingYear : dates[dates.length - 1].monthYear.getFullYear()
		};
	}),

	/**
	 * Function responsible for fetching raw incidence data within the range of dates specified by the parameters
	 *
	 * @param {Date} startDate - the beginning date of the range of time within which to search for incidence data
	 * @param {Date} endDate - the ending date of the range of time within which to search for incidence data
	 *
	 * @returns {Array[Array]} - a complete collection of all incident data within the targeted time range
	 *
	 * @author kinsho
	 */
	fetchRawIncidenceData: _Q.async(function* (startDate, endDate)
	{
		return yield locationFrequencyCruncher.calculateFrequencyWithinRange(startDate, endDate);
	}),

	/**
	 * Function responsible for fetching incidence per capita data within the range of dates specified by the parameters
	 *
	 * @param {Date} startDate - the beginning date of the range of time within which to search for data
	 * @param {Date} endDate - the ending date of the range of time within which to search for data
	 *
	 * @returns {Array[Array]} - a complete collection of all per capita data within the targeted time range
	 *
	 * @author kinsho
	 */
	fetchPerCapitaIncidenceData: _Q.async(function* (startDate, endDate)
	{
		return yield locationFrequencyCruncher.calculatePerCapitaFrequencyWithinRange(startDate, endDate);
	})
};