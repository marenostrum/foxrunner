var foxrunnerAgreement = {

    openFile : function(aText, aPreference) {//open file picker

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			  .getService(Components.interfaces.nsIPrefService)
			  .getBranch("extensions.foxrunner.");

	//open file picker
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"]
		.createInstance(nsIFilePicker);
	fp.init(window, aText, nsIFilePicker.modeOpen);
	var rv = fp.show();
	if (rv == nsIFilePicker.returnOK) {
	    var file = fp.file;
	    //set preference file path
	    this.prefs.setCharPref(aPreference, file.path);
	    document.getElementById(aPreference).value = file.path;
	}
    }
};