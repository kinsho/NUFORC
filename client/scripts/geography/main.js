/**
 * @main Geography
 */

// ----------------- EXTERNAL MODULES --------------------------

import axios from 'client/scripts/utility/axios';
import rqc from 'client/scripts/utility/rQueryClient';
import vm from 'client/scripts/geography/viewModel';
import STATES from 'shared/constants/states';

// ----------------- ENUMS/CONSTANTS ---------------------------

var BEGINNING_YEAR_INPUT = 'beginningYearContainer',
	ENDING_YEAR_INPUT = 'endingYearContainer',
	FROM_MONTH_RADIO_ELEMENTS = 'fromMonth',
	TO_MONTH_RADIO_ELEMENTS = 'toMonth',

	DATE_RANGE_SUBMIT_BUTTON = 'dateRangeSubmit',

	COLUMN_HEADER_CLASS = 'columnHeader',
	RAW_DATA_TABLE_ID = 'rawDataTable',
	COLUMN_INDEX_DATA = 'columnIndex',

	GET_MAP_DATA_URL = 'geography/getFilteredMapData';

// ----------------- PRIVATE FUNCTION ---------------------------

	/**
	  * Sorting function for the frequency columns of the data tables
	  */
var _sortFrequencyTableByNumber = function(a, b)
	{
		if (a[1] > b[1])
		{
			return 1;
		}

		if (b[1] > a[1])
		{
			return -1;
		}

		return 0;
	},

	/**
	 * Sorting function for the state columns of the data tables
	 */
	_sortFrequencyTableByState = function(a, b)
	{
		if (STATES[a[0]] > STATES[b[0]])
		{
			return 1;
		}

		if (STATES[b[0]] > STATES[a[0]])
		{
			return -1;
		}

		return 0;
	};

// ----------------- LISTENERS ---------------------------

function incrementBeginningYear()
{
	if (vm.beginningYear < window.NUFORC.endingYear)
	{
		vm.beginningYear += 1;
	}
}

function decrementBeginningYear()
{
	if (vm.beginningYear > window.NUFORC.startingYear)
	{
		vm.beginningYear -= 1;
	}
}

function incrementEndingYear()
{
	if (vm.endingYear < window.NUFORC.endingYear)
	{
		vm.endingYear += 1;
	}
}

function decrementEndingYear()
{
	if (vm.endingYear > window.NUFORC.startingYear)
	{
		vm.endingYear -= 1;
	}
}

function beginningMonthLinker(event)
{
	vm.beginningMonth = event.currentTarget.value;
}

function endingMonthLinker(event)
{
	vm.endingMonth = event.currentTarget.value;
}

/**
 * Function transmits whatever date range the user specified to the server in order to fetch frequency data
 *
 * @param {Event} event - the event that triggered the invocation of this listener. Needed to prevent default propagation
 *
 * @author kinsho
 */
function submitForm(event)
{
	var data;

	// Prevent the browser from doing anything it normally would do when a button is clicked
	event.preventDefault();

	// Set up the data to send over
	data =
	{
		beginningMonth : +vm.beginningMonth,
		endingMonth : +vm.endingMonth,
		beginningYear : vm.beginningYear,
		endingYear : vm.endingYear
	};

	axios.get(GET_MAP_DATA_URL, data).then(function(response)
	{
		vm.incidentData = response.rawData;
		vm.perCapitaData = response.perCapitaData;

		vm.showServerError = false;
		vm.showResultsContainer = !!(response.rawData.length);

		vm.sortIconIncidentTable = 1;
		vm.sortIconPerCapitaTable = 1;
	}, function()
	{
		vm.showServerError = true;
	});
}

/**
 * Function sorts the data tables by any column
 *
 * @param {Event} event - the event that triggered the invocation of this listener
 *
 * @author kinsho
 */
function sortColumn(event)
{
	var element = event.currentTarget,
		tableID = rqc.closestElementByTag(element, 'table').id,
		columnIndex = window.parseInt(element.dataset[COLUMN_INDEX_DATA], 10),
		tableData = ( (tableID === RAW_DATA_TABLE_ID) ? vm.incidentData : vm.perCapitaData );

	// Sort the dataset either by the state column or the frequency column
	if (columnIndex)
	{
		tableData.sort(_sortFrequencyTableByNumber);
	}
	else
	{
		tableData.sort(_sortFrequencyTableByState);
	}

	// Toggle the sorting icon appropriately
	if (tableID === RAW_DATA_TABLE_ID)
	{
		vm.sortIconIncidentTable = columnIndex;
		vm.incidentData = tableData;
	}
	else
	{
		vm.sortIconPerCapitaTable = columnIndex;
		vm.perCapitaData = tableData;
	}
}

// ----------------- LINKER INITIALIZATION -----------------------------

var fromMonthRadioElements = document.getElementsByName(FROM_MONTH_RADIO_ELEMENTS),
	toMonthRadioElements = document.getElementsByName(TO_MONTH_RADIO_ELEMENTS),
	columnHeaderGroups = document.getElementsByClassName(COLUMN_HEADER_CLASS),
	columnHeaders,
	i, j;

// All the month radio buttons must be hooked to a linker function in order to properly capture the value of
// whatever months the user selects
for (i = fromMonthRadioElements.length - 1; i >= 0; i--)
{
	fromMonthRadioElements[i].addEventListener('click', beginningMonthLinker);
	toMonthRadioElements[i].addEventListener('click', endingMonthLinker);
}

// Decrement icon for the beginning year
document.getElementById(BEGINNING_YEAR_INPUT).getElementsByTagName('i')[0].addEventListener('click', decrementBeginningYear);

// Increment icon for the beginning year
document.getElementById(BEGINNING_YEAR_INPUT).getElementsByTagName('i')[1].addEventListener('click', incrementBeginningYear);

// Decrement icon for the ending year
document.getElementById(ENDING_YEAR_INPUT).getElementsByTagName('i')[0].addEventListener('click', decrementEndingYear);

// Increment icon for the ending year
document.getElementById(ENDING_YEAR_INPUT).getElementsByTagName('i')[1].addEventListener('click', incrementEndingYear);

// Date range form submit
document.getElementById(DATE_RANGE_SUBMIT_BUTTON).addEventListener('click', submitForm);

// Each column header should be linked to a sorting function so that users can sort data in a table by that column
for (i = columnHeaderGroups.length - 1; i >= 0; i--)
{
	columnHeaders = columnHeaderGroups[i].getElementsByTagName('th');

	for (j = columnHeaders.length - 1; j >= 0; j--)
	{
		columnHeaders[j].addEventListener('click', sortColumn);
	}
}

// ----------------- DATA INITIALIZATION -----------------------------

vm.beginningYear = window.NUFORC.startingYear;
vm.endingYear = window.NUFORC.endingYear;
vm.beginningMonth = 0;
vm.endingMonth = 0;
vm.showResultsContainer = false;
vm.showServerError = false;
vm.incidentData = [];
vm.perCapitaData = [];
vm.sortIconIncidentTable = 1;
vm.sortIconPerCapitaTable = 1;