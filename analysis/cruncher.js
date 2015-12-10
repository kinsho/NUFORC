// ----------------- APP_ROOT_PATH INSTANTIATION --------------------------

global.NUFORC =
{
	require : require('app-root-path').require
};

// ----------------- EXTERNAL MODULES --------------------------

var _Q = require('Q'),
	cruncher = global.NUFORC.require('analysis/locationFrequencyCruncher');

// ----------------- PRIVATE VARIABLES --------------------------

var startDate = new Date(2015, 0),
	endDate = new Date(2015, 11);

// ----------------- LOGIC --------------------------

_Q.spawn(function* ()
{
	var frequencyData = yield cruncher.calculateFrequencyWithinRange(startDate, endDate),
		ratioData = yield cruncher.calculatePerCapitaFrequencyWithinRange(startDate, endDate),
		i;

	console.log('---------- RAW INCIDENTS STATS ----------');
	for (i = frequencyData.length - 1; i >= 0; i--)
	{
		console.log(frequencyData[i][0] + ' ----> ' + frequencyData[i][1]);
	}

	console.log('----------  STATE PER-CAPITA INCIDENT RATIOS ---------- ');
	for (i = ratioData.length - 1; i >= 0; i--)
	{
		console.log(ratioData[i][0] + ' ----> ' + ratioData[i][1]);
	}

});