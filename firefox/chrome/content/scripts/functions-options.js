var foxrunnerOptions = {

    openFile : function(aText, aPreference) {

	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			  .getService(Components.interfaces.nsIPrefService)
			  .getBranch("extensions.foxrunner.");

	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"]
		.createInstance(nsIFilePicker);
	fp.init(window, aText, nsIFilePicker.modeOpen);
	var rv = fp.show();
	if (rv == nsIFilePicker.returnOK) {
	    var file = fp.file;
	    this.prefs.setCharPref(aPreference, file.path);
	}
    }
};