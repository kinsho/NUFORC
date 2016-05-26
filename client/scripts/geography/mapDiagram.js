/**
 * The rendering logic for the map diagram on the geography page
 */

// ----------------- EXTERNAL MODULES --------------------------

import _d3 from 'd3';
import _d3Tip from 'd3-tip';
import _topoJSON from 'topojson';
import STATES from 'shared/constants/states';

// ----------------- ENUM/CONSTANTS -----------------------------

var MAP_DIAGRAM_CONTAINER = 'mapDiagramContainer',
	MOBILE_STATE_DATA_CONTAINER = 'mobileStateDataContainer',
	STATE_CLASS_IDENTIFIER = '.state',
	STATE_BOUNDARY_INTERIOR_CLASS = 'stateBoundaryInterior',
	STATE_TOOLTIP_CLASS = 'd3Tooltip',
	BOUNCE_TOOLTIP_ANIMATION = 'bounceTip',

	CONTAINER_WIDTH = 960,
	CONTAINER_HEIGHT = 500,

	STATES_JSON = 'stateData/topoStates.json',

	LIGHT_COLOR_RANGE =
	{
		RED: 199,
		GREEN: 208,
		BLUE: 196
	},
	DARK_COLOR_RANGE =
	{
		RED: 143,
		GREEN: 162,
		BLUE: 136
	},
	RGB_CSS_VALUE = 'rgb';

// ----------------- PRIVATE PROPERTIES -----------------------------

var _dataset = [], // This module's personal copy of the dataset that it uses to help generate the map
	_statesData = {}; // The geography data that will be used to render a map of the United States through D3


// ----------------- PRIVATE FUNCTIONS -----------------------------

/**
 * Sets the background color for each state rendered in the map diagram. The hue and clarity of color within any
 * given state depends on the per capita frequency of UFO incidents reported from that state
 *
 * @param {D3FeatureCollection} geography - the geography dataset pertaining to any one state
 *
 * @returns {String} - the value to set as the fill color for that particular state
 *
 * @author kinsho
 */
function _setBackgroundColor(geography)
{
	var postalCode = geography.id,
		index = _findIndexInDataset(postalCode),
		indexOffset = ((index * 2) + 1) / 100,
		redDifferential = LIGHT_COLOR_RANGE.RED - DARK_COLOR_RANGE.RED,
		greenDifferential = LIGHT_COLOR_RANGE.GREEN - DARK_COLOR_RANGE.GREEN,
		blueDifferential = LIGHT_COLOR_RANGE.BLUE - DARK_COLOR_RANGE.BLUE,
		redValue, greenValue, blueValue;

	// Use the index to figure out the exact shade that would be appropriate for the passed geography
	redValue = Math.round(indexOffset * redDifferential) + DARK_COLOR_RANGE.RED;
	greenValue = Math.round(indexOffset * greenDifferential) + DARK_COLOR_RANGE.GREEN;
	blueValue = Math.round(indexOffset * blueDifferential) + DARK_COLOR_RANGE.BLUE;

	// Now return the calculated RGB value of the shade
	return (RGB_CSS_VALUE + `(${ redValue }, ${ greenValue }, ${ blueValue })`);
}

/**
 * Finds the index of the element in the dataset that corresponds to the passed postal code
 *
 * @param {String} postalCode - the postal code of the state
 *
 * @returns {Number} - the index within the dataset for the entry that corresponds to that state
 *
 * @author kinsho
 */
function _findIndexInDataset(postalCode)
{
	var i;

	for (i = _dataset.length - 1; i >= 0; i--)
	{
		if (_dataset[i][0] === postalCode)
		{
			return i;
		}
	}

	return -1;
}

/**
 * Appends a hint to each state showing the ratio of incidents to population for that state
 *
 * @param {D3FeatureCollection} geography - the geography dataset pertaining to any one state
 *
 * @returns {String} - the value to set within the hint
 *
 * @author kinsho
 */
function _setTooltipText(geography)
{
	var postalCode = geography.id,
		index = _findIndexInDataset(postalCode),
		ratio = _dataset[index][1];

	return `<div>${ STATES[postalCode] }</div><div>1 incident per ${ ratio } people</div>`;
}

/**
 * Populates the metadata container with data about the ratio of incidents to population for a state whenever
 * a state is clicked upon
 *
 * @param {D3FeatureCollection} geography - the geography dataset pertaining to any one state
 *
 * @returns {String} - the value to set within the metadata container
 *
 * @author kinsho
 */
function _populateMetadataContainer(geography)
{
	document.getElementById(MOBILE_STATE_DATA_CONTAINER).innerHTML = _setTooltipText(geography);
}

// ----------------- RENDERING LOGIC -----------------------------

var mapGenerator =
{
	/**
	 * Function generates a diagram of the United States complete with interactive data points supplied
	 * by the passed dataset
	 *
	 * @param {Array<Array>} perCapitaDataset - the dataset used to help render the interactive portions of the diagram
	 *
	 * @author kinsho
	 */
	generateMap: function(perCapitaDataset)
	{
		var containerWidth = CONTAINER_WIDTH,
			containerHeight = CONTAINER_HEIGHT,
			projection,
			path,
			tip,
			svg;

		// Set a private reference to the dataset inside this module
		_dataset = perCapitaDataset;

		// Test if the dataset is available for use. If not, give up on the rendering of the map.
		if ( !(_statesData) )
		{
			window.setTimeout(this.generateMap, 1000);
			return;
		}
		else if ( Object.keys(_statesData).length === 0)
		{
			return;
		}

		projection = _d3.geo.albersUsa()
			.scale(1000)
			.translate([containerWidth / 2, containerHeight / 2]);

		path = _d3.geo.path()
			.projection(projection);

		tip = _d3Tip()
			.attr('class', STATE_TOOLTIP_CLASS)
			.html(_setTooltipText);

		svg = _d3.select('#' + MAP_DIAGRAM_CONTAINER)
			.append('svg')
			.attr('preserveAspectRatio', 'xMinYMin meet')
			.attr('viewBox', '0 0 ' + containerWidth + ' ' + containerHeight)
			.call(tip);

		// The illustration of the states
		svg.selectAll(STATE_CLASS_IDENTIFIER)
			.data(_topoJSON.feature(_statesData, _statesData.objects.states).features)
			.enter().append('path')
			.attr('d', path)
			.style('fill', _setBackgroundColor)
			// Complex logic below is needed to allow the tooltip to bounce into view
			.on('mouseover', (d) => { tip.attr('class', `${ STATE_TOOLTIP_CLASS } ${ BOUNCE_TOOLTIP_ANIMATION }`).show(d); })
			.on('mouseout', (d) => { tip.attr('class', STATE_TOOLTIP_CLASS).show(d); tip.hide(); })
			.on('click', _populateMetadataContainer);

		// The boundaries between the states
		svg.append('path')
			.datum(_topoJSON.mesh(_statesData, _statesData.objects.states, (a, b) => { return a !== b; }))
			.attr('d', path)
			.attr('class', STATE_BOUNDARY_INTERIOR_CLASS);
	}
};

// ----------------- INITIALIZATION -----------------------------

// Fetch the data used to render a map of the United States
d3.json(STATES_JSON, (error, data) =>
{
	_statesData = data || {};
});

// ----------------- EXPORT -----------------------------

export default mapGenerator;