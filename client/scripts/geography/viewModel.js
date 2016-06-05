/**
 * The view model for the geography page
 */

// ----------------- EXTERNAL MODULES --------------------------

import MONTHS from 'shared/constants/months';
import STATES from 'shared/constants/states';

// ----------------- ENUM/CONSTANTS -----------------------------

var BEGINNING_YEAR_INPUT = 'beginningYearSelector',
	ENDING_YEAR_INPUT = 'endingYearSelector',
	BEGINNING_MONTH_INPUT = 'beginningMonthSelector',
	ENDING_MONTH_INPUT = 'endingMonthSelector',

	SELECTED_DATES_CONTAINER = 'selectedDates',
	SELECTED_DATE_CLASS = 'selectedDate',

	DATE_RANGE_SUBMIT_BUTTON = 'dateRangeSubmit',
	DATE_RANGE_HINT = 'dateRangeHint',
	SUBMIT_BUTTON_DISABLED_TOOLTIP_MESSAGE = 'You need to enter valid dates to search data!',
	SERVER_ERROR_CONTAINER = 'serverError',
	DATA_LOADER = 'baseLoaderOverlay',

	RESULTS_CONTAINER = 'resultsContainer',
	RAW_DATA_TABLE = 'rawDataTable',
	PER_CAPITA_TABLE = 'perCapitaTable',
	SORTING_ICON_CLASS = 'fa-chevron-circle-down',
	MAP_DIAGRAM_CONTAINER = 'mapDiagramContainer',

	VISIBILITY_CLASS = 'show',
	ROW_ODD_CLASS = 'tableRowOdd',

	MOBILE_MAP_DIRECTIONS = 'Tap on a state and you will see UFO incidence data about that state in this box here.',
	MOBILE_MAP_DIRECTIONS_CONTAINER = 'mobileStateDataContainer';

// ----------------- PRIVATE FUNCTIONS -----------------------------

/**
 * Function responsible for updating the current time range selected on the view
 *
 * @author kinsho
 */
function _updateSelectedDates()
{
	var dates = document.getElementById(SELECTED_DATES_CONTAINER).getElementsByClassName(SELECTED_DATE_CLASS);

	dates[0].innerHTML = MONTHS[viewModel.beginningMonth] + ' ' + viewModel.beginningYear;
	dates[1].innerHTML = MONTHS[viewModel.endingMonth] + ' ' + viewModel.endingYear;
}

/**
 * Function checks to see if the range of dates selected by the user are valid. If not, the submit button on the form
 * should be disabled.
 *
 * @author kinsho
 */
function _checkFormValidity()
{
	var disabled = (new Date(viewModel.beginningYear, viewModel.beginningMonth) > new Date(viewModel.endingYear, viewModel.endingMonth));

	document.getElementById(DATE_RANGE_SUBMIT_BUTTON).disabled = disabled;

	// Only populate the tooltip attribute so that a message pops up only when the button is disabled
	document.getElementById(DATE_RANGE_HINT).dataset.hint = (disabled ? SUBMIT_BUTTON_DISABLED_TOOLTIP_MESSAGE : '');
}

/**
 * Function responsible for toggling the visibility of the passed element depending on the passed flag
 *
 * @param {String} - the ID of the element that will either need to be made visible or hidden
 * @param {showFlag} - a boolean indicating whether the element should be visible
 *
 * @author kinsho
 */
function _showElement(elementID, showFlag)
{
	if (showFlag)
	{
		document.getElementById(elementID).classList.add(VISIBILITY_CLASS);
	}
	else
	{
		document.getElementById(elementID).classList.remove(VISIBILITY_CLASS);
	}
}

/**
 * Function that can populate both of the results tables with datasets from the server
 *
 * @param {String} elementID - the ID of the table to populate
 * @param {Array<Array>} dataset - the data to use to populate the tables
 *
 * @author kinsho
 */
function _populateTable(elementID, dataset)
{
	var tableBody = document.getElementById(elementID).getElementsByTagName('tbody')[0],
		dataRow,
		stateDataCell,
		frequencyDataCell,
		oddRowFlag = false, // Flag used to manage the coloring of alternating rows
		i;

	// First, remove all rows from the table body
	while (tableBody.firstChild)
	{
		tableBody.removeChild(tableBody.firstChild);
	}

	// Now for each item in the dataset, attach a new row to the target table with the data inside that item
	for (i = 0; i < dataset.length; i++)
	{
		dataRow = document.createElement('tr');
		stateDataCell = document.createElement('td');
		frequencyDataCell = document.createElement('td');

		// For now, we are only listing data for the U.S. states. Territories and Canadian provinces will be included later
		if (STATES[dataset[i][0]])
		{
			// The item is an array with two pieces of data
			// The first index houses the state abbreviation while the second index houses the statistic in context
			stateDataCell.innerHTML = STATES[dataset[i][0]];
			frequencyDataCell.innerHTML = dataset[i][1];

			// Append the class needed to color in odd rows for readability purposes
			if (oddRowFlag)
			{
				dataRow.classList.add(ROW_ODD_CLASS);
				oddRowFlag = false;
			}
			else
			{
				oddRowFlag = true;
			}

			dataRow.appendChild(stateDataCell);
			dataRow.appendChild(frequencyDataCell);
			tableBody.appendChild(dataRow);
		}
	}
}

/**
 * Function responsible for toggling the visibility of the sorting icon on the column headers of any table
 *
 * @param {String} tableID - the ID of the table for which to adjust the visibility of the sort icon
 * @param {Number} columnIndex - the index of the column by which to sort the table
 *
 * @author kinsho
 */
function _toggleSortingIcon(tableID, columnIndex)
{
	var table = document.getElementById(tableID),
		sortingIcons = table.getElementsByClassName(SORTING_ICON_CLASS),
		i;

	for (i = sortingIcons.length - 1; i >= 0; i--)
	{
		if (i !== columnIndex)
		{
			sortingIcons[i].classList.remove(VISIBILITY_CLASS);
		}
		else
		{
			sortingIcons[i].classList.add(VISIBILITY_CLASS);
		}
	}
}

/**
 * Function responsible for removing all children from an element indicated by the passed ID
 *
 * @param {String} elementID - the ID of the element whose children need to be removed from the DOM tree
 *
 * @author kinsho
 */
function _removeNodeFromDOM(elementID)
{
	var node = document.getElementById(elementID);

	while (node.firstChild)
	{
		node.removeChild(node.firstChild);
	}
}

/**
 * Function responsible for resetting the directions in the mobile tap square underneath the map of the URL_SUFFIX
 *
 * @author kinsho
 */
function _resetMobileMapDirections()
{
	document.getElementById(MOBILE_MAP_DIRECTIONS_CONTAINER).innerHTML = MOBILE_MAP_DIRECTIONS;
}

// ----------------- VIEW MODEL DEFINITION -----------------------------

var viewModel = {};

// Beginning Year
Object.defineProperty(viewModel, 'beginningYear',
{
	configurable: false,
	enumerable: true,

	get: () =>
	{
		return this.__beginningYear;
	},

	set: (value) =>
	{
		this.__beginningYear = value;

		document.getElementById(BEGINNING_YEAR_INPUT).value = value;

		_checkFormValidity();
	}
});

// Ending Year
Object.defineProperty(viewModel, 'endingYear',
{
	configurable: false,
	enumerable: true,

	get: () =>
	{
		return this.__endingYear;
	},

	set: (value) =>
	{
		this.__endingYear = value;

		document.getElementById(ENDING_YEAR_INPUT).value = value;

		_checkFormValidity();
	}
});

// Beginning Month
Object.defineProperty(viewModel, 'beginningMonth',
{
	configurable: false,
	enumerable: true,

	get: () =>
	{
		return this.__beginningMonth;
	},

	set: (value) =>
	{
		this.__beginningMonth = value;

		document.getElementById(BEGINNING_MONTH_INPUT).value = value;

		_checkFormValidity();
	}
});

// Ending Month
Object.defineProperty(viewModel, 'endingMonth',
{
	configurable: false,
	enumerable: true,

	get: () =>
	{
		return this.__endingMonth;
	},

	set: (value) =>
	{
		this.__endingMonth = value;

		document.getElementById(ENDING_MONTH_INPUT).value = value;

		_checkFormValidity();
	}
});

// Loader Visibility Flag
Object.defineProperty(viewModel, 'showLoader',
{
	configurable: false,
	enumerable: true,

	get: () =>
	{
		return this.__showLoader;
	},

	set: (value) =>
	{
		this.__showLoader = value;

		_showElement(DATA_LOADER, value);
	}
});

// Server Error Visibility Flag
Object.defineProperty(viewModel, 'showServerError',
{
	configurable: false,
	enumerable: true,

	get: () =>
	{
		return this.__showServerError;
	},

	set: (value) =>
	{
		this.__showServerError = value;

		_showElement(SERVER_ERROR_CONTAINER, value);
	}
});

// Results Container Visibility Flag
Object.defineProperty(viewModel, 'showResultsContainer',
{
	configurable: false,
	enumerable: true,

	get: () =>
	{
		return this.__showResultsContainer;
	},

	set: (value) =>
	{
		this.__showResultsContainer = value;

		_showElement(RESULTS_CONTAINER, value);

		if (value)
		{
			_updateSelectedDates();
		}
		else
		{
			_removeNodeFromDOM(MAP_DIAGRAM_CONTAINER);
			_resetMobileMapDirections();
		}
	}
});

// Raw Stats dataset
Object.defineProperty(viewModel, 'incidentData',
{
	configurable: false,
	enumerable: true,

	get: () =>
	{
		return this.__incidentData;
	},

	set: (value) =>
	{
		this.__incidentData = value;

		_populateTable(RAW_DATA_TABLE, value);
	}
});

// Per Capita dataset
Object.defineProperty(viewModel, 'perCapitaData',
{
	configurable: false,
	enumerable: true,

	get: () =>
	{
		return this.__perCapitaData;
	},

	set: (value) =>
	{
		this.__perCapitaData = value;

		_populateTable(PER_CAPITA_TABLE, value);
	}
});

// The sort icon for the incident data table
Object.defineProperty(viewModel, 'sortIconIncidentTable',
{
	configurable: false,
	enumerable: true,

	get: () =>
	{
		return this.__sortIconIncidentTable;
	},

	set: (value) =>
	{
		this.__sortIconIncidentTable = value;

		_toggleSortingIcon(RAW_DATA_TABLE, value);
	}
});

// The sort icon for the per capita data table
Object.defineProperty(viewModel, 'sortIconPerCapitaTable',
{
	configurable: false,
	enumerable: true,

	get: () =>
	{
		return this.__sortIconPerCapitaTable;
	},

	set: (value) =>
	{
		this.__sortIconPerCapitaTable = value;

		_toggleSortingIcon(PER_CAPITA_TABLE, value);
	}
});

// ----------------- EXPORT -----------------------------

export default viewModel;