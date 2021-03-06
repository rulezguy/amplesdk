/*
 * Ample SDK - JavaScript GUI Framework
 *
 * Copyright (c) 2009 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 * See: http://www.amplesdk.com/ample/licensing/
 *
 */

var cXULElement_spinbuttons	= function(){};
cXULElement_spinbuttons.prototype	= new cXULElement;
cXULElement_spinbuttons.prototype.tabIndex	= 0;

// Default Attributes
cXULElement_spinbuttons.attributes	= {
	"min":		"0",
	"max":		"9",
	"step":		"1",
	"value":	"0"
};

// Public Properties
cXULElement_spinbuttons.prototype.form	= null;

cXULElement_spinbuttons.prototype.$isAccessible	= function()
{
	return !this.getAttribute("disabled");
};

cXULElement_spinbuttons.prototype.$getValue	= function()
{
	return this.$getContainer("input").value;
};

cXULElement_spinbuttons.prototype.$setValue	= function(sValue)
{
	if (isNaN(sValue))
        sValue  = this.attributes["min"] * 1.0;

    if (sValue < this.attributes["min"] * 1.0)
    {
    	if (this.attributes["cyclic"] == "true")
			sValue	= this.attributes["max"];
    	else
			sValue  = this.attributes["min"];
    }
    else
    if (sValue > this.attributes["max"] * 1.0)
    {
    	if (this.attributes["cyclic"] == "true")
			sValue	= this.attributes["min"];
    	else
        	sValue  = this.attributes["max"];
    }

    // Save value
    this.$getContainer("input").value = sValue;
};

// Public Methods
cXULElement_spinbuttons.prototype.setAttribute   = function(sName, sValue)
{
    if (sName == "value")
    {
		this.$setValue(sValue);
    }
    else
    if (sName == "disabled")
    {
    	this.$setPseudoClass("disabled", sValue != '');
        this.$getContainer("input").disabled = sValue != '';
    }
    else
    if (sName == "step")
    {

    }
    else
    if (sName == "min")
    {

    }
    else
    if (sName == "max")
    {

    }

    this.AMLElement.setAttribute.call(this, sName, sValue);
};

cXULElement_spinbuttons.prototype.select	= function()
{
	this.$getContainer("input").select();
};

// Events Handlers
cXULElement_spinbuttons.prototype._onInterval    = function(bDir)
{
    var sValue  = this.$getValue();
    this.$setValue(bDir ? sValue * 1.0 + this.attributes["step"] * 1.0 : sValue * 1.0 - this.attributes["step"] * 1.0);
    if (this.$getValue() == sValue && this._interval)
        clearInterval(this._interval);
};

cXULElement_spinbuttons.prototype._onChange  = function(oEvent)
{
	var sValue	= this.$getValue();
	if (sValue == "" || isNaN(sValue))
		this.$setValue(this.attributes["min"]);
//    this.attributes["value"]	= this.$getValue();

    // Fire Event
    var oEvent  = this.ownerDocument.createEvent("Events");
    oEvent.initEvent("change", true, false);
    this.dispatchEvent(oEvent);
};

cXULElement_spinbuttons._onDocumentMouseUp = function(oEvent)
{
	var oElement	= cXULElement_spinbuttons._element;

	// detach element
	delete cXULElement_spinbuttons._element;
	oElement.ownerDocument.removeEventListener("mouseup",	cXULElement_spinbuttons._onDocumentMouseUp,	false);

	// restore visual state
	oElement.$setPseudoClass("active", false, "button-up");
	oElement.$setPseudoClass("active", false, "button-down");

    if (oElement._interval)
        oElement._interval  = clearInterval(oElement._interval);

    if (oElement._oldvalue != oElement.$getValue())
    {
	    // Fire Event
	    var oEvent  = oElement.ownerDocument.createEvent("Events");
	    oEvent.initEvent("change", true, false);
	    oElement.dispatchEvent(oEvent);
    }
};

cXULElement_spinbuttons.prototype._onButtonMouseDown = function(oEvent, bDir)
{
    if (oEvent.button == 2)
        return true;

	cXULElement_spinbuttons._element	= this;
	this.ownerDocument.addEventListener("mouseup",		cXULElement_spinbuttons._onDocumentMouseUp,	false);

    // save current value in order to compare on key up
    this._oldvalue  = this.$getValue();
//    this.$setValue(bDir ? this._oldvalue * 1.0 + this.attributes["step"] * 1.0 : this._oldvalue * 1.0 - this.attributes["step"] * 1.0);

    var oSelf	= this;
    this._interval  = setInterval(function() {
    	oSelf._onInterval(bDir);
    }, 100);

    return false;
};

// Class Events Handlers
cXULElement_spinbuttons.handlers	= {
	"keydown":	function(oEvent) {
	    // save current value in order to compare on key up
	    var sValue  = this.$getValue();

	    if (oEvent.keyIdentifier == "Up")
	        this.$setValue(sValue * 1.0 + this.attributes["step"] * 1.0);
	    else
	    if (oEvent.keyIdentifier == "Down")
	        this.$setValue(sValue * 1.0 - this.attributes["step"] * 1.0);

	    if (sValue != this.$getValue())
	    {
		    // Fire Event
		    var oEvent  = this.ownerDocument.createEvent("Events");
		    oEvent.initEvent("change", true, false);
		    this.dispatchEvent(oEvent);
	    }
	},
	"focus":	function(oEvent) {
		this.$getContainer("input").focus();
	},
	"blur":		function(oEvent) {
		this.$getContainer("input").blur();
	}/*,
	"DOMNodeInsertedIntoDocument":	function() {
		for (var oElementTemp = this; oElementTemp; oElementTemp = oElementTemp.parentNode)
			if (oElementTemp instanceof cXHTMLElement_form)
				break;

		if (oElementTemp)
		{
			// Set reference to the form element
			this.form	= oElementTemp;

			// Add to collection of elements
			oElementTemp.elements.$add(this);
	//		oElementTemp.elements[this.attributes["name"]]	= this;
		}
	},
	"DOMNodeRemovedFromDocument":	function() {
		if (this.form)
			this.form.elements.$remove(this);
	}*/
};

// Element Render: open
cXULElement_spinbuttons.prototype.$getTagOpen	= function()
{
    var sHtml   = '<table cellpadding="0" cellspacing="0" border="0" class="xul-spinbuttons' + (this.attributes["disabled"] ? ' xul-spinbuttons_disabled' : '')+ '">';
    sHtml  += '<tbody>';
    sHtml  += '<tr>';
    sHtml  += '<td width="100%"><div style="height:17px"><input type="text" autocomplete="off" style="border:0px solid white;width:100%;" value="' + this.attributes["value"] + '"';
    if (this.attributes["disabled"])
        sHtml  += ' disabled="true"';
    if (this.attributes["name"])
        sHtml  += ' name="' + this.attributes["name"] + '"';
    sHtml  += ' onchange="ample.$instance(this)._onChange(event)" onkeypress="if (event.keyCode == 38 || event.keyCode == 40) return false" class="xul-spinbuttons--input" onselectstart="event.cancelBubble=true;"/></div></td>';
    sHtml  += '<td valign="top">';
    sHtml  += '<div class="xul-spinbuttons--button-up" onmouseover="if (!ample.$instance(this).attributes[\'disabled\']) ample.$instance(this).$setPseudoClass(\'hover\', true, \'button-up\')" onmouseout="if (!ample.$instance(this).attributes[\'disabled\']) ample.$instance(this).$setPseudoClass(\'hover\', false, \'button-up\')" onmousedown="if (!ample.$instance(this).attributes[\'disabled\']) {ample.$instance(this).$setPseudoClass(\'active\', true, \'button-up\'); return ample.$instance(this)._onButtonMouseDown(event, true)}"><br/></div>';
    sHtml  += '<div class="xul-spinbuttons--button-down" onmouseover="if (!ample.$instance(this).attributes[\'disabled\']) ample.$instance(this).$setPseudoClass(\'hover\', true, \'button-down\')" onmouseout="if (!ample.$instance(this).attributes[\'disabled\']) ample.$instance(this).$setPseudoClass(\'hover\', false, \'button-down\')" onmousedown="if (!ample.$instance(this).attributes[\'disabled\']) {ample.$instance(this).$setPseudoClass(\'active\', true, \'button-down\'); return ample.$instance(this)._onButtonMouseDown(event, false)}"><br/></div>';
    sHtml  += '</td>';
    sHtml  += '</tr>';
    sHtml  += '</tbody>';
    sHtml  += '</table>';

    return sHtml;
};

// Register Element with language
oXULNamespace.setElement("spinbuttons", cXULElement_spinbuttons);
