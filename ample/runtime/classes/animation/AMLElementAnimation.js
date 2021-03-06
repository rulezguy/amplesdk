/*
 * Ample SDK - JavaScript GUI Framework
 *
 * Copyright (c) 2009 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 * See: http://www.amplesdk.com/ample/licensing/
 *
 */

var nAMLElementAnimation_EFFECT_LINEAR		= 1,	// Constants
	nAMLElementAnimation_EFFECT_ACCELERATE	= 2,
	nAMLElementAnimation_EFFECT_DECELERATE	= 3,

	aAMLElementAnimation_effects	= [];				// Variables

function fAMLElementAnimation_play(oElement, sParams, nDuration, vType, fHandler, sPseudo)
{
	// initialize effect
	var oEffect	= {},
		nEffect	= aAMLElementAnimation_effects.length;
	oEffect._element	= oElement;
	oEffect._container	= oElement.$getContainer(sPseudo);
	oEffect._duration	= nDuration;
	oEffect._callback	= fHandler;
	oEffect._type		= vType;
	oEffect._start		= new cDate;
	oEffect._data		= {};
	oEffect._interval	= fSetInterval(function(){fAMLElementAnimation_process(nEffect)}, 20);

	// read end params from input
	var aParams	= sParams.split(/[,;]/);
	for (var nIndex = 0; nIndex < aParams.length; nIndex++)
		if (aParams[nIndex].match(/([a-z\-]+)\s*\:\s*(auto|-?[a-f0-9\#\.]+)\s*(px|em|pt|%)?/i))
			oEffect._data[fAML_toCssPropertyName(cRegExp.$1)]	= [null, cRegExp.$2, cRegExp.$3];

	// read start params
	var oStyle	= fAML_getComputedStyle(oEffect._container),
		sValue;

	for (var sKey in oEffect._data)
	{
		switch (sKey)
		{
			case "opacity":
				if (oStyle.filter && oStyle.filter.match(/opacity=([0-9\.]+)/i))
					sValue	= cRegExp.$1 / 100;
				else
				if (oStyle.MozOpacity != null)
					sValue	= oStyle.MozOpacity || 1;
				else
				if (oStyle.opacity != null)
					sValue	= oStyle.opacity || 1;
				else
					sValue	= 1;
				oEffect._data[sKey][1]	= fParseFloat(oEffect._data[sKey][1]);
				oEffect._data[sKey][0]	= fParseFloat(sValue);
				break;

			case "color":
			case "backgroundColor":
			case "borderColor":
				// Start value
				sValue	= oStyle[sKey == "borderColor" ? "borderBottomColor" : sKey].replace('#', '');
				if (sValue.match(/[0-9a-f]{6}/i))
					sValue	= [fAMLElementAnimation_fromHex(sValue.substr(0, 2)), fAMLElementAnimation_fromHex(sValue.substr(2, 2)), fAMLElementAnimation_fromHex(sValue.substr(4, 2))];
				else
				if (sValue.match(/rgb\(([0-9]+),\s*([0-9]+),\s*([0-9]+)\)/))
					sValue	= [cRegExp.$1 * 1, cRegExp.$2 * 1, cRegExp.$3 * 1];
				oEffect._data[sKey][0]	= sValue;
				// End value
				sValue	= oEffect._data[sKey][1].replace('#', '');
				if (sValue.match(/[0-9a-f]{6}/i))
					sValue	= [fAMLElementAnimation_fromHex(sValue.substr(0, 2)), fAMLElementAnimation_fromHex(sValue.substr(2, 2)), fAMLElementAnimation_fromHex(sValue.substr(4, 2))];
				oEffect._data[sKey][1]	= sValue;
				break;

			default:
				oEffect._data[sKey][0]	= oStyle[sKey] == "auto" ? 0 : fParseFloat(oStyle[sKey]) || 0;
				oEffect._data[sKey][1]	= oEffect._data[sKey][1] == "auto" ? 0 : fParseFloat(oEffect._data[sKey][1]) || 0;
				oEffect._data[sKey][2]	= oEffect._data[sKey][2] || '';
		}
	}

	// delete running effects on new effect properties for the same element
	for (var nIndex = 0; nIndex < aAMLElementAnimation_effects.length; nIndex++)
		if (aAMLElementAnimation_effects[nIndex] && aAMLElementAnimation_effects[nIndex]._element == oEffect._element)
			for (var sKey in aAMLElementAnimation_effects[nIndex]._data)
				if (oEffect._data[sKey])
					delete aAMLElementAnimation_effects[nIndex]._data[sKey];

	var oEventEffectStart	= new cAMLCustomEvent;
	oEventEffectStart.initCustomEvent("effectstart", false, false, null);
	oEffect._element.dispatchEvent(oEventEffectStart);

	// return effect resource identificator
	return aAMLElementAnimation_effects.push(oEffect);
};

function fAMLElementAnimation_stop(nEffect)
{
	var oEffect	= aAMLElementAnimation_effects[nEffect];
	if (!oEffect)
		return;

	var oStyle	= oEffect._container.style;
	for (var sKey in oEffect._data)
	{
		switch (sKey)
		{
			case "opacity":
				oStyle.MozOpacity	= oEffect._data[sKey][1];
				oStyle.opacity		= oEffect._data[sKey][1];
				if (bTrident)// && nVersion < 8)
					oStyle.filter		= "Alpha" + '(' + "opacity" + '=' + cMath.round(oEffect._data[sKey][1] * 100) + ')';
				break;

			case "color":
			case "backgroundColor":
			case "borderColor":
				oStyle[sKey]	= '#' + fAMLElementAnimation_toHex(oEffect._data[sKey][1][0]) + fAMLElementAnimation_toHex(oEffect._data[sKey][1][1]) + fAMLElementAnimation_toHex(oEffect._data[sKey][1][2]);
				break;

			default:
				oStyle[sKey]	= oEffect._data[sKey][1] + oEffect._data[sKey][2];
		}
	}

	var oEventEffectEnd	= new cAMLCustomEvent;
	oEventEffectEnd.initCustomEvent("effectend", false, false, null);
	oEffect._element.dispatchEvent(oEventEffectEnd);

	// clear effect
	fAMLElementAnimation_clear(nEffect);
};

function fAMLElementAnimation_process(nEffect)
{
	var oEffect	= aAMLElementAnimation_effects[nEffect];
		oEffect._timestamp	= new cDate;

	// clear effect if node was removed
	if (!oAML_all[oEffect._element.uniqueID])
		return fAMLElementAnimation_clear(nEffect);

	// stop effect if the time is up
	if (oEffect._duration <= oEffect._timestamp - oEffect._start) {
		fAMLElementAnimation_stop(nEffect);
		if (oEffect._callback)
			oEffect._callback.call(oEffect._element);
		return;
	}

	// calculate current ratio
	var nRatio	= 0;
	if (oEffect._duration)
	{
		var nRatioRaw	=(oEffect._timestamp - oEffect._start) / oEffect._duration;
		if (oEffect._type instanceof cFunction)
			nRatio	= oEffect._type(nRatioRaw);
		else
		{
			switch (oEffect._type)
			{
				case nAMLElementAnimation_EFFECT_ACCELERATE:
					nRatio	= cMath.pow(nRatioRaw, 2);
					break;

				case nAMLElementAnimation_EFFECT_DECELERATE:
					nRatio	= cMath.pow(nRatioRaw, 1/2);
					break;

				default:
					nRatio	= nRatioRaw;
			}
		}
	}

	//
	var oStyle	= oEffect._container.style,
		sValue;
	for (var sKey in oEffect._data)
	{
		switch (sKey)
		{
			case "opacity":
				sValue	= oEffect._data[sKey][0] + (oEffect._data[sKey][1] - oEffect._data[sKey][0]) * nRatio;
				oStyle.MozOpacity	= sValue;
				oStyle.opacity		= sValue;
				if (bTrident)// && nVersion < 8)
					oStyle.filter		= "Alpha" + '(' + "opacity" + '=' + cMath.round(sValue * 100) + ')';
				break;

			case "color":
			case "backgroundColor":
			case "borderColor":
				oStyle[sKey]		= '#' + fAMLElementAnimation_toHex(oEffect._data[sKey][0][0] + (oEffect._data[sKey][1][0] - oEffect._data[sKey][0][0]) * nRatio) + fAMLElementAnimation_toHex(oEffect._data[sKey][0][1] + (oEffect._data[sKey][1][1] - oEffect._data[sKey][0][1]) * nRatio) + fAMLElementAnimation_toHex(oEffect._data[sKey][0][2] + (oEffect._data[sKey][1][2] - oEffect._data[sKey][0][2]) * nRatio);
				break;

			default:
				sValue	= oEffect._data[sKey][0] + (oEffect._data[sKey][1] - oEffect._data[sKey][0]) * nRatio;
				oStyle[sKey]		= sValue + oEffect._data[sKey][2];
		}
	}
};

function fAMLElementAnimation_clear(nEffect)
{
	var oEffect	= aAMLElementAnimation_effects[nEffect];

	// clear interval
	fClearInterval(oEffect._interval);

	// delete effect
	aAMLElementAnimation_effects[nEffect]	= null;
};

function fAMLElementAnimation_fromHex(sValue)
{
	return fParseInt(sValue, 16);
};

function fAMLElementAnimation_toHex(nValue)
{
	var sValue	= cMath.floor(nValue).toString(16);
    return cArray(3 - sValue.length).join('0') + sValue;
};

// Attaching to impementation
cAMLElement.EFFECT_LINEAR		= nAMLElementAnimation_EFFECT_LINEAR;
cAMLElement.EFFECT_ACCELERATE	= nAMLElementAnimation_EFFECT_ACCELERATE;
cAMLElement.EFFECT_DECELERATE	= nAMLElementAnimation_EFFECT_DECELERATE;

cAMLElement.prototype.$play	= function(sParams, nDuration, vType, fHandler, sPseudo)
{
	// Validate arguments
	fAML_validate(arguments, [
		["params",		cString],
		["duration",	cNumber],
		["type",		cObject, true],
		["handler",		cFunction, true],
		["pseudo",		cString, true]
	], "$play");

	fAMLElementAnimation_play(this, sParams, nDuration, vType, fHandler, sPseudo);
};

cAMLElement.prototype.$stop	= function(nEffect)
{
	// Validate arguments
	fAML_validate(arguments, [
		["effect",		cNumber]
	], "$stop");

	fAMLElementAnimation_stop(nEffect);
};
