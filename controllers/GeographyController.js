/**
 * @module GeographyController
 */

// ----------------- EXTERNAL MODULES --------------------------

var _Q = require('q'),
	controllerHelper = global.OwlStakes.require('controllers/utility/ControllerHelper'),
	templateManager = global.OwlStakes.require('utility/templateManager'),
	DAO = global.OwlStakes.require('DAO/geography/GeographyDAO'),
	months = global.OwlStakes.require('shared/constants/months');

// ----------------- ENUMS/CONSTANTS --------------------------

var GEOGRAPHY_FOLDER = 'geography',

	MAIN_TEMPLATE = 'geography';

// ----------------- MODULE DEFINITION --------------------------
module.exports =
{
	/**
	 * Initializer function
	 *
	 * @author kinsho
	 */
	init: _Q.async(function* ()
	{
		console.log('Loading the geography page...');

		var yearRange = yield DAO.fetchYearRange(),
			hbarsData =
			{
				months: months,
				startingYear: yearRange.startingYear,
				endingYear: yearRange.endingYear
			},
			populatedTemplate = yield templateManager.populateTemplate(hbarsData, GEOGRAPHY_FOLDER, MAIN_TEMPLATE),
			initialData =
			{
				startingYear : yearRange.startingYear,
				endingYear : yearRange.endingYear
			};

		return yield controllerHelper.renderInitialView(populatedTemplate, GEOGRAPHY_FOLDER, initialData);
	}),

	/**
	 * Action function to fetch incidence data within any range of time
	 *
	 * @params {Object} params
	 * 		{
	 * 			beginningYear : Number
	 * 			beginningMonth : Number (0 - 11)
	 * 			endingYear : Number
	 * 			endingMonth : Number (0 - 11)
	 * 		}
	 *
	 * @return {Object}
	 *
	 * @author kinsho
	 */
	getFilteredMapData: _Q.async(function* (params)
	{
		console.log('Invoking the getFilteredMapData function from the GeographyController...');

		var startDate = new Date(params.beginningYear, params.beginningMonth),
			endDate = new Date(params.endingYear, params.endingMonth),
			rawData = yield DAO.fetchRawIncidenceData(startDate, endDate),
			perCapitaData = yield DAO.fetchPerCapitaIncidenceData(startDate, endDate),
			response =
			{
				rawData : rawData,
				perCapitaData : perCapitaData
			};

		return JSON.stringify(response);
	})
};