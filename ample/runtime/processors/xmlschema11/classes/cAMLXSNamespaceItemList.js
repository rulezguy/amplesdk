/*
 * Ample SDK - JavaScript GUI Framework
 *
 * Copyright (c) 2009 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 * See: http://www.amplesdk.com/ample/licensing/
 *
 */

var cAMLXSNamespaceItemList	= function() {

};

cAMLXSNamespaceItemList.prototype.length	= 0;

cAMLXSNamespaceItemList.prototype.item	= function(nIndex) {
	// Validate arguments
	fAML_validate(arguments, [
		["index",	cNumber]
	], "item");

	return nIndex < this.length ? this[nIndex] : null;
};

cAMLXSNamespaceItemList.prototype.$add	= function(oValue) {
	this[this.length++]	= oValue;
};
