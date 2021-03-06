/*
 * Ample SDK - JavaScript GUI Framework
 *
 * Copyright (c) 2009 Sergey Ilinsky
 * Dual licensed under the MIT and GPL licenses.
 * See: http://www.amplesdk.com/ample/licensing/
 *
 */

var cXULElement_menupopup	= function()
{
    // Collections
    this.items  = new AMLNodeList;
};
cXULElement_menupopup.prototype	= new cXULPopupElement;

// Public Properties
cXULElement_menupopup.prototype.selectedItem	= null;

// Attributes Defaults
cXULElement_menupopup.attributes	= {};
cXULElement_menupopup.attributes.hidden	= "true";
cXULElement_menupopup.attributes.width	= "120";

// Public Methods
cXULElement_menupopup.prototype.setAttribute = function(sName, sValue)
{
  	this._setAttribute(sName, sValue);

    this.AMLElement.setAttribute.call(this, sName, sValue);
};

cXULElement_menupopup.prototype.selectItem	= function(oItem)
{
	// Hide previously selected item
	if (this.selectedItem && this.selectedItem != oItem) {
		// hide previous popup
		if (this.selectedItem.menupopup) {
			var oMenuPopupOld	= this.selectedItem.menupopup;
			this._timeOutHide	= setTimeout(function() {
				oMenuPopupOld.hidePopup();
			}, 300);
		}
		// Lowlight previous element
        this.selectedItem.setAttribute("selected", "false");
	}

	//
	if (this._timeOutShow)
		this._timeOutShow	= clearTimeout(this._timeOutShow);

	if (oItem) {
	    // Show new element
		if (oItem.menupopup && oItem.$isAccessible()) {
			var oMenuPopupNew	= oItem.menupopup;
			this._timeOutShow	= setTimeout(function() {
				oMenuPopupNew.showPopup(null, -1, -1, cXULPopupElement.POPUP_TYPE_POPUP);
			}, 300);
		}
		// Highlight new element
		oItem.setAttribute("selected", "true");
	}

	// remember new selected item
	this.selectedItem	= oItem;
};

// Events Handlers
/*
cXULElement_menupopup.prototype._onKeyDown	= function(oEvent)
{
	var nIndex	= this.items.$indexOf(this.selectedItem);
	switch (oEvent.keyCode)
	{
		case 38:	// up
			if (nIndex == 0)
				this.selectItem(this.items[this.items.length - 1]);
			else
				this.selectItem(this.items[nIndex - 1]);
			break;

		case 40:	// down
			if (nIndex == this.items.length - 1)
				this.selectItem(this.items[0]);
			else
				this.selectItem(this.items[nIndex + 1]);
			break;

		case 37:	// left
			if (this.parentNode instanceof cXULElement_menu)
			{
				this.selectItem(null);
				if (this.parentNode.parentNode instanceof cXULElement_menubar || this.parentNode.parentNode instanceof cXULElement_menupopup);
					this.parentNode.parentNode.$getContainer().focus();
			}
			break;

		case 39:	// right
			if (this.selectedItem.menupopup && this.selectedItem.attributes["disabled"] != "true")
			{
				this.selectedItem.menupopup.selectItem(this.selectedItem.menupopup.items[0]);
				this.selectedItem.menupopup.$getContainer().focus();
			}
			break;

		case 13:	// enter
			this.selectedItem._onClick(oEvent);
			break;

		case 27:	// escape
			// TODO
			break;
	}
	// cancel bubbles
	oEvent.cancelBubble	= true;
};
*/

// Class events handlers
cXULElement_menupopup.handlers	= {
	"popuphidden":	function(oEvent) {
		// deselect item that is selected
		if (this.selectedItem)
			this.selectItem(null);
	},
	"DOMNodeInsertedIntoDocument":	function(oEvent) {
		var oParent	= this.parentNode;
		if (oParent instanceof cXULElement_menulist || oParent instanceof cXULElement_menu)
			oParent.menupopup	= this;
	},
	"DOMNodeRemovedFromDocument":	function(oEvent) {
		var oParent	= this.parentNode;
		if (oParent instanceof cXULElement_menulist || oParent instanceof cXULElement_menu)
			oParent.menupopup	= null;
	},
	"DOMActivate":	function(oEvent) {
		if (oEvent.target instanceof cXULElement_menuitem)
	   		this.hidePopup();
		// if document popup is me
	   	if (this.ownerDocument.popupNode == this)
			this.ownerDocument.popupNode	= null;
	}
};

// Element Render: open
cXULElement_menupopup.prototype.$getTagOpen	= function()
{
	return '<div style="position:absolute;' + (this.attributes["hidden"] == "true" ? 'display:none;' : '') + '" class="xul-menupopup">\
				<table cellpadding="0" cellspacing="0" border="0" cols="4">\
					<tbody class="ns-menupopup--gateway">';
};

// Element Render: close
cXULElement_menupopup.prototype.$getTagClose	= function()
{
	return 			'</tbody>\
				</table>\
			</div>';
};

// Register Element with language
oXULNamespace.setElement("menupopup", cXULElement_menupopup);
