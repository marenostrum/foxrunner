var foxrunnerSidebar = {

    openAgreement: function () {

	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.foxrunner.");

	var strbundle = document.getElementById("foxrunnerstrings");
	var params = {inn:{userinput:""}, out:null};
	window.openDialog("chrome://foxrunner/content/agreement.xul", "",
	    "chrome, dialog, modal, resizable=yes", params).focus();

	if (params.out){

	    var result = params.out.userinput;

	    if (result == "yes" || result == "Yes" || result == "YES") {

		this.prefs.setCharPref("agreement", "yes");

	    }
	}
    },

    sidebarOnLoad:function() {

	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.foxrunner.");

	var sidebarwidth = this.prefs.getCharPref("sidebarwidth");

	window.top.document.getElementById("sidebar-box").width=sidebarwidth;

	//set tree status to inactive
	foxrunnerSidebar.resetTrees("commands");
	foxrunnerSidebar.resetTrees("commandhistory");
	foxrunnerSidebar.resetTrees("scripts");
	foxrunnerSidebar.resetTrees("variables");
	foxrunnerSidebar.resetTrees("blacklist");
	foxrunnerSidebar.resetTrees("whitelist");
    },

    blacklistedAlert: function () {

	var strbundle = document.getElementById("foxrunnerstrings");
	var message = strbundle.getString("blacklisted");
	var messagetitle = strbundle.getString("foxrunneralert");
	var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
		.getService(Components.interfaces.nsIPromptService);
	prompts.alert(window, messagetitle, message);

    },

    rebuildTrees: function (aTree) {

	if (aTree == "all"){//foxrunnerSidebar.rebuildTrees('all');

	    document.getElementById('commands').builder.rebuild();
	    document.getElementById('commandhistory').builder.rebuild();
	    document.getElementById('scripts').builder.rebuild();
	    document.getElementById('blacklist').builder.rebuild();
	    document.getElementById('whitelist').builder.rebuild();
	    document.getElementById('variables').builder.rebuild();

	    window.top.document.getElementById('foxrunner-run-command-selected').builder.rebuild();
	    window.top.document.getElementById('foxrunner-run-command-history-selected').builder.rebuild();

	    window.top.document.getElementById('foxrunner-run-script-selected').builder.rebuild();
	    window.top.document.getElementById('foxrunner-run-script-selected-single-variable').builder.rebuild();
	}

	if (aTree == "commands"){//foxrunnerSidebar.rebuildTrees('commands');

	    document.getElementById('commands').builder.rebuild();
	    window.top.document.getElementById('foxrunner-run-command-selected').builder.rebuild();
	}

	if (aTree == "commandhistory"){//foxrunnerSidebar.rebuildTrees('commandhistory');

	    document.getElementById('commandhistory').builder.rebuild();
	    window.top.document.getElementById('foxrunner-run-command-history-selected').builder.rebuild();
	}

	if (aTree == "scripts"){//foxrunnerSidebar.rebuildTrees('scripts');

	    document.getElementById('scripts').builder.rebuild();
	    window.top.document.getElementById('foxrunner-run-script-selected').builder.rebuild();
	    window.top.document.getElementById('foxrunner-run-script-selected-single-variable').builder.rebuild();
	}

	if (aTree == "blacklist"){//foxrunnerSidebar.rebuildTrees('blacklist');


	    document.getElementById('blacklist').builder.rebuild();
	}

	if (aTree == "whitelist"){//foxrunnerSidebar.rebuildTrees('whitelist');

	    document.getElementById('whitelist').builder.rebuild();
	}

	if (aTree == "variables"){//foxrunnerSidebar.rebuildTrees('variables');

	    document.getElementById('variables').builder.rebuild();
	}
    },

    resetTrees: function(aMedia) {

	try{
	    //declare tree
	    var tree = document.getElementById(aMedia);
	    //deselect tree items
	    tree.view.selection.clearSelection();
	}catch(e){
	    //do nothing
	}
    },

    addEntry: function (aTree) {

	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.foxrunner.");

	var agreement = this.prefs.getCharPref("agreement");

	if (agreement !== "yes") {

	    foxrunnerSidebar.openAgreement();
	}

	var agreement = this.prefs.getCharPref("agreement");
	var blacklist = this.prefs.getBoolPref("blacklist");
	var whitelist = this.prefs.getBoolPref("whitelist");
	var confirmlocal = this.prefs.getBoolPref("confirmlocal");
	var confirmweb = this.prefs.getBoolPref("confirmweb");
	var termcom = this.prefs.getCharPref("termcom");

	var database = Components.classes['@mozilla.org/file/directory_service;1']
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsILocalFile);
	database.append("foxrunner.sqlite");

	var storageService = Components.classes["@mozilla.org/storage/service;1"]
		.getService(Components.interfaces.mozIStorageService);
	var mDBConn = storageService.openDatabase(database);

	if (agreement == "yes"){

	    if (aTree == "blacklist"){

		var strbundle = document.getElementById("foxrunnerstrings");
		var params = {inn:{keyword:""}, out:null};
		window.openDialog("chrome://foxrunner/content/add-blacklist.xul", "",
		    "chrome, dialog, modal, resizable=yes", params).focus();

		if (params.out && !params.out.keyword == "") {

		    var newkeyword = params.out.keyword;

		    var statement = mDBConn.createStatement("INSERT INTO blacklist (blacklisted) VALUES (:newkeyword_value)");
		    statement.params.newkeyword_value = newkeyword;
		    statement.executeStep();
		    statement.reset();

		    foxrunnerSidebar.rebuildTrees('blacklist');
		}
	    }

	    if (aTree == "commands"){

		var strbundle = document.getElementById("foxrunnerstrings");
		var params = {inn:{command:""}, out:null};
		window.openDialog("chrome://foxrunner/content/add-command.xul", "",
		    "chrome, dialog, modal, resizable=yes", params).focus();

		if (params.out && !params.out.command == "") {

		    var newcommand = params.out.command;

		    var blocked = false;

		    if (blacklist == true){

			var statement = mDBConn.createStatement("SELECT * FROM blacklist");
			mDBConn.beginTransaction();
			while (statement.executeStep()) {

			    let blacklisted = statement.row.blacklisted;
			    blacklisted = blacklisted.replace(/\*/g,".*");
			    blacklisted = blacklisted.replace(/\.\.\*/g,".*");
			    if (newcommand.match(blacklisted)) {
				var blocked = true;
			    }
			}
			mDBConn.commitTransaction();
			statement.reset();
		    }

		    if (blocked !== true) {

			var statement = mDBConn.createStatement("INSERT INTO commands (commandstring) VALUES (:newcommand_value)");
			statement.params.newcommand_value = newcommand;
			statement.executeStep();
			statement.reset();

			foxrunnerSidebar.rebuildTrees('commands');
		    }
		    else {

			foxrunnerSidebar.blacklistedAlert();
		    }
		}
	    }

	    if (aTree == "commandhistory"){

		try{
		    var tree = document.getElementById("commandhistory");
		    var indexrowid = 0;
		    var rowid = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(indexrowid));
		}catch(e){
		    //do nothing
		}finally{

		    if(rowid){

			var statement = mDBConn.createStatement("SELECT * FROM commandhistory WHERE rowid= :rowid_value");
			statement.params.rowid_value = rowid;

			mDBConn.beginTransaction();
			while (statement.executeStep()) {
			    let commandstring = statement.row.commandstring;
			    var newcommand = commandstring;
			}
			mDBConn.commitTransaction();
			statement.reset();

			var blocked = false;

			if (blacklist == true){

			    var statement = mDBConn.createStatement("SELECT * FROM blacklist");
			    mDBConn.beginTransaction();
			    while (statement.executeStep()) {

				let blacklisted = statement.row.blacklisted;
				blacklisted = blacklisted.replace(/\*/g,".*");
				blacklisted = blacklisted.replace(/\.\.\*/g,".*");
				if (newcommand.match(blacklisted)) {
				    var blocked = true;
				}
			    }
			    mDBConn.commitTransaction();
			    statement.reset();
			}

			if (blocked !== true) {

			    var statement = mDBConn.createStatement("INSERT INTO commands (commandstring) VALUES (:newcommand_value)");
			    statement.params.newcommand_value = newcommand;
			    statement.executeStep();
			    statement.reset();

			    foxrunnerSidebar.rebuildTrees('commands');

			}
			else {

			    foxrunnerSidebar.blacklistedAlert();
			}
		    }
		}
	    }

	    if (aTree == "scripts"){

		var strbundle = document.getElementById("foxrunnerstrings");
		var params = {inn:{newscripttitle:""}, out:null};
		window.openDialog("chrome://foxrunner/content/add-script.xul", "",
		    "chrome, dialog, modal, resizable=yes", params).focus();

		if (params.out && !params.out.newscripttitle == "") {

		    var newfilename = params.out.newscripttitle;

		    var statement = mDBConn.createStatement("SELECT * FROM scripts WHERE scripttitle= :scripttitle_value");
		    statement.params.scripttitle_value = newfilename;

		    mDBConn.beginTransaction();
		    while (statement.executeStep()) {
			let scripttitle = statement.row.scripttitle;
			var existingfilename = scripttitle;
		    }
		    mDBConn.commitTransaction();
		    statement.reset();

		    if ( newfilename == existingfilename ) {

			var strbundle = document.getElementById("foxrunnerstrings");
			var message = strbundle.getString("scriptexists");
			var messagetitle = strbundle.getString("foxrunneralert");
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
			prompts.alert(window, messagetitle, message);

			foxrunnerSidebar.addEntry("scripts");

		    }
		    else {

			var strbundle = document.getElementById("foxrunnerstrings");
			var scriptcontent = strbundle.getString("scripttemplate");
			var params = {inn:{newscriptcontent:scriptcontent,newterminaloption:"yes",newvariablesoption:"novariable"}, out:null};
			window.openDialog("chrome://foxrunner/content/script-options.xul", "",
			    "chrome, dialog, modal, resizable=yes", params).focus();

			if (params.out) {

			    var scriptcontent = params.out.newscriptcontent;
			    var useterminal = params.out.newterminaloption;
			    var usevariables = params.out.newvariablesoption;

			    var destfile = Components.classes["@mozilla.org/file/directory_service;1"]
				    .getService(Components.interfaces.nsIProperties)
				    .get("ProfD", Components.interfaces.nsIFile);
			    destfile.append("foxrunner");
			    destfile.append(newfilename);
			    if (destfile.exists()) {
				  destfile.remove(false);
			    }
			    destfile.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0777);

			    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
				    .createInstance(Components.interfaces.nsIFileOutputStream);

			    foStream.init(destfile, 0x02 | 0x08 | 0x20, 0777, 0);

			    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
				    .createInstance(Components.interfaces.nsIConverterOutputStream);
			    converter.init(foStream, "UTF-8", 0, 0);
			    converter.writeString(scriptcontent);
			    converter.close();

			    var statement = mDBConn.createStatement("INSERT INTO scripts (scripttitle,terminaloption,variablesoption) VALUES (:scripttitle_value,:terminaloption_value,:variablesoption_value)");
			    statement.params.scripttitle_value = newfilename;
			    statement.params.terminaloption_value = useterminal;
			    statement.params.variablesoption_value = usevariables;
			    statement.executeStep();
			    statement.reset();

			    foxrunnerSidebar.rebuildTrees('scripts');
			}
		    }
		}
	    }

	    if (aTree == "variables"){

		var strbundle = document.getElementById("foxrunnerstrings");
		var params = {inn:{variable:""}, out:null};
		window.openDialog("chrome://foxrunner/content/add-variable.xul", "",
		    "chrome, dialog, modal, resizable=yes", params).focus();

		if (params.out && !params.out.variable == "") {

		    var newvariable = params.out.variable;

		    var blocked = false;

		    if (blacklist == true){

			var statement = mDBConn.createStatement("SELECT * FROM blacklist");
			mDBConn.beginTransaction();
			while (statement.executeStep()) {

			    let blacklisted = statement.row.blacklisted;
			    blacklisted = blacklisted.replace(/\*/g,".*");
			    blacklisted = blacklisted.replace(/\.\.\*/g,".*");
			    if (newvariable.match(blacklisted)) {
				var blocked = true;
			    }
			}
			mDBConn.commitTransaction();
			statement.reset();
		    }

		    if (blocked !== true) {

			var statement = mDBConn.createStatement("INSERT INTO variables (thevariable) VALUES (:newvariable_value)");
			statement.params.newvariable_value = newvariable;
			statement.executeStep();
			statement.reset();

			foxrunnerSidebar.rebuildTrees('variables');
		    }

		    if (blocked == true) {

			foxrunnerSidebar.blacklistedAlert();
		    }
		}
	    }

	    if (aTree == "whitelist"){

		var strbundle = document.getElementById("foxrunnerstrings");
		var params = {inn:{keyword:""}, out:null};
		window.openDialog("chrome://foxrunner/content/add-whitelist.xul", "",
		    "chrome, dialog, modal, resizable=yes", params).focus();

		if (params.out && !params.out.keyword == "") {

		    var newkeyword = params.out.keyword;

		    var statement = mDBConn.createStatement("INSERT INTO whitelist (whitelisted) VALUES (:newkeyword_value)");
		    statement.params.newkeyword_value = newkeyword;
		    statement.executeStep();
		    statement.reset();

		    foxrunnerSidebar.rebuildTrees('whitelist');
		}
	    }

	    if (aTree == "scriptimport"){

		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"]
			.createInstance(nsIFilePicker);
		fp.init(window, "Select", nsIFilePicker.modeOpen);
		var rv = fp.show();
		if (rv == nsIFilePicker.returnOK) {
		    var file = fp.file;
		    var sourcefile = Components.classes["@mozilla.org/file/local;1"]
			    .createInstance(Components.interfaces.nsILocalFile);
		    sourcefile.initWithPath(file.path);

		    var newfilename = file.path.replace(/.*\//g, "");

		    var statement = mDBConn.createStatement("SELECT * FROM scripts WHERE scripttitle= :scripttitle_value");
		    statement.params.scripttitle_value = newfilename;

		    mDBConn.beginTransaction();
		    while (statement.executeStep()) {
			let scripttitle = statement.row.scripttitle;
			var existingfilename = scripttitle;
		    }
		    mDBConn.commitTransaction();
		    statement.reset();

		    if ( newfilename == existingfilename ) {

			var strbundle = document.getElementById("foxrunnerstrings");
			var message = strbundle.getString("scriptexists");
			var messagetitle = strbundle.getString("foxrunneralert");
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
			prompts.alert(window, messagetitle, message);

		    }
		    else {

			if ( sourcefile.exists() ) {

			    var scriptcontent = "";
			    var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
				    .createInstance(Components.interfaces.nsIFileInputStream);
			    var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
				    .createInstance(Components.interfaces.nsIConverterInputStream);
			    fstream.init(sourcefile, -1, 0, 0);
			    cstream.init(fstream, "UTF-8", 0, 0);
			    let (str = {}) {
			      cstream.readString(-1, str);
			      scriptcontent = str.value;
			    }
			    cstream.close();

			    var strbundle = document.getElementById("foxrunnerstrings");
			    var params = {inn:{newscriptcontent:scriptcontent,newterminaloption:"yes",newvariablesoption:"novariable"}, out:null};
			    window.openDialog("chrome://foxrunner/content/script-options.xul", "",
				"chrome, dialog, modal, resizable=yes", params).focus();

			    if (params.out) {

				var scriptcontent = params.out.newscriptcontent;
				var useterminal = params.out.newterminaloption;
				var usevariables = params.out.newvariablesoption;

				var destfile = Components.classes['@mozilla.org/file/directory_service;1']
					.getService(Components.interfaces.nsIProperties)
					.get("ProfD", Components.interfaces.nsILocalFile);
				destfile.append("foxrunner");
				destfile.append(newfilename);
				if (destfile.exists()) {
				    destfile.remove(false);
				}
				destfile.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0777);

				var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
					.createInstance(Components.interfaces.nsIFileOutputStream);

				foStream.init(destfile, 0x02 | 0x08 | 0x20, 0777, 0);

				var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
					.createInstance(Components.interfaces.nsIConverterOutputStream);
				converter.init(foStream, "UTF-8", 0, 0);
				converter.writeString(scriptcontent);
				converter.close();

				var statement = mDBConn.createStatement("INSERT INTO scripts (scripttitle,terminaloption,variablesoption) VALUES (:scripttitle_value,:terminaloption_value,:variablesoption_value)");
				statement.params.scripttitle_value = newfilename;
				statement.params.terminaloption_value = useterminal;
				statement.params.variablesoption_value = usevariables;
				statement.executeStep();
				statement.reset();

				foxrunnerSidebar.rebuildTrees('scripts');
			    }
			}
		    }
		}
	    }
	}
    },

    deleteEntry: function (aTree,aType) {

	var database = Components.classes['@mozilla.org/file/directory_service;1']
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsILocalFile);
	database.append("foxrunner.sqlite");

	var storageService = Components.classes["@mozilla.org/storage/service;1"]
		.getService(Components.interfaces.mozIStorageService);
	var mDBConn = storageService.openDatabase(database);

	if (aType == "single"){

	    try{
		var tree = document.getElementById(aTree);
		var indexrowid = 0;
		var rowid = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(indexrowid));
	    }catch(e){
		//do nothing 
	    }finally{

		if(rowid){
		    var strbundle = document.getElementById("foxrunnerstrings");
		    var message = strbundle.getString("deleteconfirm");
		    var messagetitle = strbundle.getString("foxrunneralert");
		    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			    .getService(Components.interfaces.nsIPromptService);
		    var result = prompts.confirm(window, messagetitle, message);
		}
	    }
	}

	if (aType == "all"){

	    var strbundle = document.getElementById("foxrunnerstrings");
	    var message = strbundle.getString("clearhistoryconfirm");
	    var messagetitle = strbundle.getString("foxrunneralert");
	    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
		    .getService(Components.interfaces.nsIPromptService);
	    var result = prompts.confirm(window, messagetitle, message);
	}

	if (result == true){

	    if (aTree == "blacklist" && aType === "single"){

		var statement = mDBConn.createStatement("DELETE FROM blacklist WHERE rowid= :rowid_value");
		statement.params.rowid_value = rowid;
		statement.executeStep();
		statement.reset();

		foxrunnerSidebar.rebuildTrees('blacklist');
	    }

	    if (aTree == "commands" && aType === "single"){

		var statement = mDBConn.createStatement("DELETE FROM commands WHERE rowid= :rowid_value");
		statement.params.rowid_value = rowid;
		statement.executeStep();
		statement.reset();

		foxrunnerSidebar.rebuildTrees('commands');
	    }

	    if (aTree == "commandhistory" && aType === "single"){

		var statement = mDBConn.createStatement("DELETE FROM commandhistory WHERE rowid= :rowid_value");
		statement.params.rowid_value = rowid;
		statement.executeStep();
		statement.reset();

		foxrunnerSidebar.rebuildTrees('commandhistory');
	    }

	    if (aTree == "commandhistory" && aType === "all"){

		var statement = mDBConn.createStatement("DELETE FROM commandhistory");
		statement.executeStep();
		statement.reset();

		foxrunnerSidebar.rebuildTrees('commandhistory');
	    }

	    if (aTree == "scripts" && aType === "single"){

		var statement = mDBConn.createStatement("SELECT * FROM scripts WHERE rowid= :rowid_value");
		statement.params.rowid_value = rowid;

		mDBConn.beginTransaction();
		while (statement.executeStep()) {
		    let scripttitle = statement.row.scripttitle;
		    var scriptfilename = scripttitle;
		}
		mDBConn.commitTransaction();
		statement.reset();

		var scriptfile = Components.classes['@mozilla.org/file/directory_service;1']
			.getService(Components.interfaces.nsIProperties)
			.get("ProfD", Components.interfaces.nsILocalFile);
		scriptfile.append("foxrunner");
		scriptfile.append(scriptfilename);
		if (scriptfile.exists() && !scriptfile.isDirectory()) {
		    scriptfile.remove(false);
		}

		var statement = mDBConn.createStatement("DELETE FROM scripts WHERE rowid= :rowid_value");
		statement.params.rowid_value = rowid;
		statement.executeStep();
		statement.reset();

		foxrunnerSidebar.rebuildTrees('scripts');
	    }

	    if (aTree == "variables" && aType === "single"){

		var statement = mDBConn.createStatement("DELETE FROM variables WHERE rowid= :rowid_value");
		statement.params.rowid_value = rowid;
		statement.executeStep();
		statement.reset();

		foxrunnerSidebar.rebuildTrees('variables');
	    }

	    if (aTree == "whitelist" && aType === "single"){

		var statement = mDBConn.createStatement("SELECT * FROM whitelist WHERE rowid= :rowid_value");
		statement.params.rowid_value = rowid;

		mDBConn.beginTransaction();
		while (statement.executeStep()) {
		    let whitelisted = statement.row.whitelisted;
		    var whitelist = whitelisted;
		}
		mDBConn.commitTransaction();
		statement.reset();

		if (whitelist !== "localhost"){

		    var statement = mDBConn.createStatement("DELETE FROM whitelist WHERE rowid= :rowid_value");
		    statement.params.rowid_value = rowid;
		    statement.executeStep();
		    statement.reset();
		    foxrunnerSidebar.rebuildTrees('whitelist');
		}
	    }
	}
    },

    manageScript: function (aFunction) {

	try{
	    var tree = document.getElementById("scripts");
	    var indexrowid = 0;
	    var rowid = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(indexrowid));
	}catch(e){
	    //do nothing
	}finally{

	    if(rowid){

		this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.foxrunner.");

		var database = Components.classes['@mozilla.org/file/directory_service;1']
			.getService(Components.interfaces.nsIProperties)
			.get("ProfD", Components.interfaces.nsILocalFile);
		database.append("foxrunner.sqlite");

		var storageService = Components.classes["@mozilla.org/storage/service;1"]
			.getService(Components.interfaces.mozIStorageService);
		var mDBConn = storageService.openDatabase(database);

		var statement = mDBConn.createStatement("SELECT * FROM scripts WHERE rowid= :rowid_value");
		statement.params.rowid_value = rowid;

		mDBConn.beginTransaction();
		while (statement.executeStep()) {
		    let scripttitle = statement.row.scripttitle;
		    let terminaloption = statement.row.terminaloption;
		    let variablesoption = statement.row.variablesoption;
		    var scriptfilename = scripttitle;
		    var useterminal = terminaloption;
		    var usevariables = variablesoption;
		}
		mDBConn.commitTransaction();
		statement.reset();

		var sourcefile = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("ProfD", Components.interfaces.nsIFile);
		sourcefile.append("foxrunner");
		sourcefile.append(scriptfilename);

		if (aFunction == "edit"){

		    var scriptcontent = "";
		    var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
			    .createInstance(Components.interfaces.nsIFileInputStream);
		    var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
			    .createInstance(Components.interfaces.nsIConverterInputStream);
		    fstream.init(sourcefile, -1, 0, 0);
		    cstream.init(fstream, "UTF-8", 0, 0);
		    let (str = {}) {
		      cstream.readString(-1, str);
		      scriptcontent = str.value;
		    }
		    cstream.close();

		    var strbundle = document.getElementById("foxrunnerstrings");
		    var params = {inn:{newscriptcontent:scriptcontent,newterminaloption:useterminal,newvariablesoption:usevariables}, out:null};
		    window.openDialog("chrome://foxrunner/content/script-options.xul", "",
			"chrome, dialog, modal, resizable=yes", params).focus();

		    if (params.out) {

			var scriptcontent = params.out.newscriptcontent;
			var useterminal = params.out.newterminaloption;
			var usevariables = params.out.newvariablesoption;

			var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
				.createInstance(Components.interfaces.nsIFileOutputStream);

			foStream.init(sourcefile, 0x02 | 0x08 | 0x20, 0777, 0);

			var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
				.createInstance(Components.interfaces.nsIConverterOutputStream);
			converter.init(foStream, "UTF-8", 0, 0);
			converter.writeString(scriptcontent);
			converter.close();

			var statement = mDBConn.createStatement("UPDATE scripts SET terminaloption= :terminaloption_value WHERE rowid= :rowid_value");
			statement.params.rowid_value = rowid;
			statement.params.terminaloption_value = useterminal;
			statement.executeStep();
			statement.reset();

			var statement = mDBConn.createStatement("UPDATE scripts SET variablesoption= :variablesoption_value WHERE rowid= :rowid_value");
			statement.params.rowid_value = rowid;
			statement.params.variablesoption_value = usevariables;
			statement.executeStep();
			statement.reset();

			foxrunnerSidebar.rebuildTrees('scripts');
		    }
		}

		if (aFunction == "export"){

		    var dest = Components.classes['@mozilla.org/file/directory_service;1']
			    .getService(Components.interfaces.nsIProperties)
			    .get("Desk", Components.interfaces.nsILocalFile);

		    if (sourcefile.exists()) {

			sourcefile.copyTo(dest,scriptfilename);

			var strbundle = document.getElementById("foxrunnerstrings");
			var message = strbundle.getString("scriptexported");
			var messagetitle = strbundle.getString("foxrunnermessage");
			var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
			    .getService(Components.interfaces.nsIAlertsService);
			alertsService.showAlertNotification("chrome://foxrunner/content/images/run_large.png",
			messagetitle, message,
			false, "", null);
		    }
		}
	    }
	}
    },

    runIt: function (aTree) {

	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.foxrunner.");

	var strbundle = document.getElementById("foxrunnerstrings");
	var donemessage = strbundle.getString("done");

	var agreement = this.prefs.getCharPref("agreement");
	var confirmlocal = this.prefs.getBoolPref("confirmlocal");
	var savehistory = this.prefs.getBoolPref("savehistory");
	var firstline = "#!/bin/bash";
	var newline = "\n\n";
	var endline = "echo '"+donemessage+"' && read";
	var sudoline = "sudo -k";

	var database = Components.classes['@mozilla.org/file/directory_service;1']
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsILocalFile);
	database.append("foxrunner.sqlite");

	var storageService = Components.classes["@mozilla.org/storage/service;1"]
		.getService(Components.interfaces.mozIStorageService);
	var mDBConn = storageService.openDatabase(database);

	var tempscript = Components.classes["@mozilla.org/file/directory_service;1"]
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsIFile);
	tempscript.append("extensions");
	tempscript.append("foxrunner@lovinglinux.megabyet.net");
	tempscript.append("chrome");
	tempscript.append("content");
	tempscript.append("tmp");
	tempscript.append("foxrunner.sh");
	if (tempscript.exists()) {
	    tempscript.remove(false);
	}
	tempscript.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0777);

	if (agreement !== "yes") {

	    foxrunnerSidebar.openAgreement();
	}

	var agreement = this.prefs.getCharPref("agreement");
	var blacklist = this.prefs.getBoolPref("blacklist");
	var whitelist = this.prefs.getBoolPref("whitelist");
	var confirmlocal = this.prefs.getBoolPref("confirmlocal");
	var confirmweb = this.prefs.getBoolPref("confirmweb");
	var termcom = this.prefs.getCharPref("termcom");
	var keepterminal = this.prefs.getBoolPref("keepterminal");
	var killsudo = this.prefs.getBoolPref("killsudo");

	var terminal = Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile);
	terminal.initWithPath(termcom);

	try{
	    var tree = document.getElementById(aTree);
	    var indexrowid = 0;
	    var rowid = tree.view.getCellText(tree.currentIndex, tree.columns.getColumnAt(indexrowid));
	}catch(e){

	}finally{

	    if(rowid){

		if (aTree == "commands"){

		    var statement = mDBConn.createStatement("SELECT * FROM commands WHERE rowid= :rowid_value");
		    statement.params.rowid_value = rowid;

		    mDBConn.beginTransaction();
		    while (statement.executeStep()) {
			let commandstring = statement.row.commandstring;
			var command = commandstring;
		    }
		    mDBConn.commitTransaction();
		    statement.reset();
		}

		if (aTree == "commandhistory"){

		    var statement = mDBConn.createStatement("SELECT * FROM commandhistory WHERE rowid= :rowid_value");
		    statement.params.rowid_value = rowid;

		    mDBConn.beginTransaction();
		    while (statement.executeStep()) {
			let commandstring = statement.row.commandstring;
			var command = commandstring;
		    }
		    mDBConn.commitTransaction();
		    statement.reset();
		}

		if (aTree == "scripts"){

		    var statement = mDBConn.createStatement("SELECT * FROM scripts WHERE rowid= :rowid_value");
		    statement.params.rowid_value = rowid;

		    mDBConn.beginTransaction();
		    while (statement.executeStep()) {
			let scripttitle = statement.row.scripttitle;
			let terminaloption = statement.row.terminaloption;
			let variablesoption = statement.row.variablesoption;
			var scriptname = scripttitle;
			var useterminal = terminaloption;
			var usevariables = variablesoption;
			var command = "";
		    }
		    mDBConn.commitTransaction();
		    statement.reset();

		    var sourcefile = Components.classes['@mozilla.org/file/directory_service;1']
			    .getService(Components.interfaces.nsIProperties)
			    .get("ProfD", Components.interfaces.nsILocalFile);
		    sourcefile.append("foxrunner");
		    sourcefile.append(scriptname);
		}

		var blocked = false;

		if (blacklist == true){

		    var statement = mDBConn.createStatement("SELECT * FROM blacklist");
		    mDBConn.beginTransaction();
		    while (statement.executeStep()) {

			let blacklisted = statement.row.blacklisted;
			blacklisted = blacklisted.replace(/\*/g,".*");
			blacklisted = blacklisted.replace(/\.\.\*/g,".*");

			if (command.match(blacklisted)) {
			    var blocked = true;
			}
		    }
		    mDBConn.commitTransaction();
		    statement.reset();
		}

		if (agreement == "yes" && terminal.exists() && tempscript.exists()) {

		    //commands code
		    if ((aTree == "commands" && blocked !== true) || (aTree == "commandhistory" && blocked !== true)){

			var thirdline = command;

			if (confirmlocal == true){

			    var strbundle = document.getElementById("foxrunnerstrings");
			    var params = {inn:{userinput:command,terminaloption:"yes"}, out:null};
			    window.openDialog("chrome://foxrunner/content/prompt-command.xul", "",
				"chrome, dialog, modal, resizable=yes", params).focus();

			    if (params.out && !params.out.userinput == ""){

				var command = params.out.userinput;
				var useterminal = params.out.terminaloption;
				var thirdline = command;

				if (blacklist == true){

				    var statement = mDBConn.createStatement("SELECT * FROM blacklist");
				    mDBConn.beginTransaction();
				    while (statement.executeStep()) {

					let blacklisted = statement.row.blacklisted;
					blacklisted = blacklisted.replace(/\*/g,".*");
					blacklisted = blacklisted.replace(/\.\.\*/g,".*");
					if (command.match(blacklisted)) {
					    var blocked = true;
					}
				    }
				    mDBConn.commitTransaction();
				    statement.reset();
				}

				if (blocked !== true) {

				    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
					    .createInstance(Components.interfaces.nsIFileOutputStream);

				    foStream.init(tempscript, 0x02 | 0x10 , 0777, 0);

				    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
					    .createInstance(Components.interfaces.nsIConverterOutputStream);
				    converter.init(foStream, "UTF-8", 0, 0);
				    converter.writeString(firstline);
				    converter.writeString(newline);
				    converter.writeString(thirdline);
				    if (killsudo == true && thirdline.match(/sudo/)){
					converter.writeString(newline);
					converter.writeString(sudoline);
				    }
				    if (useterminal == "yes" && keepterminal == true){
					converter.writeString(newline);
					converter.writeString(endline);
				    }
				    converter.close();

				    if ( useterminal == "yes" ){

					var process = Components.classes['@mozilla.org/process/util;1']
						.createInstance(Components.interfaces.nsIProcess);
					process.init(terminal);
					var arguments = ["-e",tempscript.path];
					process.run(false, arguments, arguments.length);

				    }
				    else {

					var process = Components.classes['@mozilla.org/process/util;1']
						.createInstance(Components.interfaces.nsIProcess);
					process.init(tempscript);
					var arguments = [];
					process.run(false, arguments, arguments.length);
				    }

				    var pbs = Components.classes["@mozilla.org/privatebrowsing;1"]  
						.getService(Components.interfaces.nsIPrivateBrowsingService);  
				    var inPrivateBrowsingMode = pbs.privateBrowsingEnabled;  

				    if (savehistory == true && aTree == "commands" && !inPrivateBrowsingMode){

					var statement = mDBConn.createStatement("INSERT INTO commandhistory (commandstring) VALUES (:commandstring_value)");
					statement.params.commandstring_value = thirdline;
					statement.executeStep();
					statement.reset();

					foxrunnerSidebar.rebuildTrees('commandhistory');
				    }
				}
			    }
			}
			else{

			    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
				    .createInstance(Components.interfaces.nsIFileOutputStream);

			    foStream.init(tempscript, 0x02 | 0x10 , 0777, 0);

			    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
				    .createInstance(Components.interfaces.nsIConverterOutputStream);
			    converter.init(foStream, "UTF-8", 0, 0);
			    converter.writeString(firstline);
			    converter.writeString(newline);
			    converter.writeString(thirdline);
			    if (killsudo == true && thirdline.match(/sudo/)){
				converter.writeString(newline);
				converter.writeString(sudoline);
			    }
			    if (keepterminal == true){
				converter.writeString(newline);
				converter.writeString(endline);
			    }
			    converter.close();

			    var process = Components.classes['@mozilla.org/process/util;1']
				    .createInstance(Components.interfaces.nsIProcess);
			    process.init(terminal);
			    var arguments = ["-e",tempscript.path];
			    process.run(false, arguments, arguments.length);

			    var pbs = Components.classes["@mozilla.org/privatebrowsing;1"]  
					.getService(Components.interfaces.nsIPrivateBrowsingService);  
			    var inPrivateBrowsingMode = pbs.privateBrowsingEnabled;  

			    if (savehistory == true && aTree == "commands" && !inPrivateBrowsingMode){

				var statement = mDBConn.createStatement("INSERT INTO commandhistory (commandstring) VALUES (:commandstring_value)");
				statement.params.commandstring_value = thirdline;
				statement.executeStep();
				statement.reset();

				foxrunnerSidebar.rebuildTrees('commandhistory');
			    }

			}
		    }

		    //script code
		    if (aTree == "scripts" && sourcefile.exists()){

			if (confirmlocal == true){

			    var strbundle = document.getElementById("foxrunnerstrings");
			    var message = strbundle.getFormattedString("confirmscript", [ scriptname ]);
			    var messagetitle = strbundle.getString("foxrunneralert");
			    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				    .getService(Components.interfaces.nsIPromptService);
			    var result = prompts.confirm(window, messagetitle, message);

			    if (result == true){

				if (usevariables == "multiplevariables" || usevariables == "singlevariable"){

				    var scriptcontent = "";
				    var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
					    .createInstance(Components.interfaces.nsIFileInputStream);
				    var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
					    .createInstance(Components.interfaces.nsIConverterInputStream);
				    fstream.init(sourcefile, -1, 0, 0);
				    cstream.init(fstream, "UTF-8", 0, 0);
				    let (str = {}) {
				      cstream.readString(-1, str);
				      scriptcontent = str.value;
				    }
				    cstream.close();

				    var strbundle = document.getElementById("foxrunnerstrings");
				    var params = {inn:{preview:scriptcontent,foxrunner1:"",foxrunner2:"",foxrunner3:"",foxrunner4:"",foxrunner5:"",foxrunner6:"",foxrunner7:"",foxrunner8:"",foxrunner9:"",foxrunner10:""}, out:null};
				    window.openDialog("chrome://foxrunner/content/prompt-variables.xul", "",
					"chrome, dialog, modal, resizable=yes", params).focus();

				    if (params.out) {

					var newvar1 = params.out.foxrunner1;
					var newvar2 = params.out.foxrunner2;
					var newvar3 = params.out.foxrunner3;
					var newvar4 = params.out.foxrunner4;
					var newvar5 = params.out.foxrunner5;
					var newvar6 = params.out.foxrunner6;
					var newvar7 = params.out.foxrunner7;
					var newvar8 = params.out.foxrunner8;
					var newvar9 = params.out.foxrunner9;
					var newvar10 = params.out.foxrunner10;

					var zstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
						.createInstance(Components.interfaces.nsIFileInputStream);
					zstream.init(sourcefile, 0x01, 0444, 0);
					zstream.QueryInterface(Components.interfaces.nsILineInputStream);
					var line = {}, lines = [], hasmore;
					do {
					    hasmore = zstream.readLine(line);
					    lines.push(line.value);
					    var newvalue = line.value;
					    var newvalue = newvalue.replace(/\$\{1\}/g, newvar1);
					    var newvalue = newvalue.replace(/\$\{2\}/g, newvar2);
					    var newvalue = newvalue.replace(/\$\{3\}/g, newvar3);
					    var newvalue = newvalue.replace(/\$\{4\}/g, newvar4);
					    var newvalue = newvalue.replace(/\$\{5\}/g, newvar5);
					    var newvalue = newvalue.replace(/\$\{6\}/g, newvar6);
					    var newvalue = newvalue.replace(/\$\{7\}/g, newvar7);
					    var newvalue = newvalue.replace(/\$\{8\}/g, newvar8);
					    var newvalue = newvalue.replace(/\$\{9\}/g, newvar9);
					    var newvalue = newvalue.replace(/\$\{10\}/g, newvar10);
					    var newline = "\n";
					    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
						    .createInstance(Components.interfaces.nsIFileOutputStream);
					    foStream.init(tempscript, 0x02 | 0x10 , 0777, 0);
					    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
						    .createInstance(Components.interfaces.nsIConverterOutputStream);
					    converter.init(foStream, "UTF-8", 0, 0);
					    converter.writeString(newvalue);
					    converter.writeString(newline);
					    converter.close();
					} while(hasmore);

					var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
						.createInstance(Components.interfaces.nsIFileOutputStream);
					foStream.init(tempscript, 0x02 | 0x10 , 0777, 0);
					var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
						.createInstance(Components.interfaces.nsIConverterOutputStream);
					converter.init(foStream, "UTF-8", 0, 0);
					if (killsudo == true && scriptcontent.match(/sudo/)){
					    converter.writeString(newline);
					    converter.writeString(sudoline);
					}
					if (useterminal == "yes" && keepterminal == true){
					converter.writeString(newline);
					converter.writeString(endline);
					}
					converter.close();

					if ( useterminal == "yes" ){

					    var process = Components.classes['@mozilla.org/process/util;1']
						    .createInstance(Components.interfaces.nsIProcess);
					    process.init(terminal);
					    var arguments = ["-e",tempscript.path];
					    process.run(false, arguments, arguments.length);

					}
					else {

					    var process = Components.classes['@mozilla.org/process/util;1']
						    .createInstance(Components.interfaces.nsIProcess);
					    process.init(tempscript);
					    var arguments = [];
					    process.run(false, arguments, arguments.length);
					}
				    }
				}

				if (usevariables == "novariable"){

				    var zstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
					    .createInstance(Components.interfaces.nsIFileInputStream);
				    zstream.init(sourcefile, 0x01, 0444, 0);
				    zstream.QueryInterface(Components.interfaces.nsILineInputStream);
				    var line = {}, lines = [], hasmore;
				    do {
					hasmore = zstream.readLine(line);
					lines.push(line.value);
					var newvalue = line.value;
					var newline = "\n";
					var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
						.createInstance(Components.interfaces.nsIFileOutputStream);
					foStream.init(tempscript, 0x02 | 0x10 , 0777, 0);
					var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
						.createInstance(Components.interfaces.nsIConverterOutputStream);
					converter.init(foStream, "UTF-8", 0, 0);
					converter.writeString(newvalue);
					converter.writeString(newline);
					converter.close();
				    } while(hasmore);

				    var scriptcontent = "";
				    var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
					    .createInstance(Components.interfaces.nsIFileInputStream);
				    var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
					    .createInstance(Components.interfaces.nsIConverterInputStream);
				    fstream.init(sourcefile, -1, 0, 0);
				    cstream.init(fstream, "UTF-8", 0, 0);
				    let (str = {}) {
				      cstream.readString(-1, str);
				      scriptcontent = str.value;
				    }
				    cstream.close();

				    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
					    .createInstance(Components.interfaces.nsIFileOutputStream);
				    foStream.init(tempscript, 0x02 | 0x10 , 0777, 0);
				    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
					    .createInstance(Components.interfaces.nsIConverterOutputStream);
				    converter.init(foStream, "UTF-8", 0, 0);
				    if (killsudo == true && scriptcontent.match(/sudo/)){
					converter.writeString(newline);
					converter.writeString(sudoline);
				    }
				    if (useterminal == "yes" && keepterminal == true){
				    converter.writeString(newline);
				    converter.writeString(endline);
				    }
				    converter.close();

				    if ( useterminal == "yes" ){

					var process = Components.classes['@mozilla.org/process/util;1']
						.createInstance(Components.interfaces.nsIProcess);
					process.init(terminal);
					var arguments = ["-e",tempscript.path];
					process.run(false, arguments, arguments.length);

				    }
				    else {

					var process = Components.classes['@mozilla.org/process/util;1']
						.createInstance(Components.interfaces.nsIProcess);
					process.init(tempscript);
					var arguments = [];
					process.run(false, arguments, arguments.length);
				    }
				}
			    }
			}
			else{

			    if (usevariables == "multiplevariables" || usevariables == "singlevariable"){

				var scriptcontent = "";
				var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
					.createInstance(Components.interfaces.nsIFileInputStream);
				var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
					.createInstance(Components.interfaces.nsIConverterInputStream);
				fstream.init(sourcefile, -1, 0, 0);
				cstream.init(fstream, "UTF-8", 0, 0);
				let (str = {}) {
				  cstream.readString(-1, str);
				  scriptcontent = str.value;
				}
				cstream.close();

				var strbundle = document.getElementById("foxrunnerstrings");
				var params = {inn:{preview:scriptcontent,foxrunner1:"",foxrunner2:"",foxrunner3:"",foxrunner4:"",foxrunner5:"",foxrunner6:"",foxrunner7:"",foxrunner8:"",foxrunner9:"",foxrunner10:""}, out:null};
				window.openDialog("chrome://foxrunner/content/prompt-variables.xul", "",
				    "chrome, dialog, modal, resizable=yes", params).focus();

				if (params.out) {

				    var newvar1 = params.out.foxrunner1;
				    var newvar2 = params.out.foxrunner2;
				    var newvar3 = params.out.foxrunner3;
				    var newvar4 = params.out.foxrunner4;
				    var newvar5 = params.out.foxrunner5;
				    var newvar6 = params.out.foxrunner6;
				    var newvar7 = params.out.foxrunner7;
				    var newvar8 = params.out.foxrunner8;
				    var newvar9 = params.out.foxrunner9;
				    var newvar10 = params.out.foxrunner10;

				    var zstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
					    .createInstance(Components.interfaces.nsIFileInputStream);
				    zstream.init(sourcefile, 0x01, 0444, 0);
				    zstream.QueryInterface(Components.interfaces.nsILineInputStream);
				    var line = {}, lines = [], hasmore;
				    do {
					hasmore = zstream.readLine(line);
					lines.push(line.value);
					var newvalue = line.value;
					var newvalue = newvalue.replace(/\$\{1\}/g, newvar1);
					var newvalue = newvalue.replace(/\$\{2\}/g, newvar2);
					var newvalue = newvalue.replace(/\$\{3\}/g, newvar3);
					var newvalue = newvalue.replace(/\$\{4\}/g, newvar4);
					var newvalue = newvalue.replace(/\$\{5\}/g, newvar5);
					var newvalue = newvalue.replace(/\$\{6\}/g, newvar6);
					var newvalue = newvalue.replace(/\$\{7\}/g, newvar7);
					var newvalue = newvalue.replace(/\$\{8\}/g, newvar8);
					var newvalue = newvalue.replace(/\$\{9\}/g, newvar9);
					var newvalue = newvalue.replace(/\$\{10\}/g, newvar10);
					var newline = "\n";
					var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
						.createInstance(Components.interfaces.nsIFileOutputStream);
					foStream.init(tempscript, 0x02 | 0x10 , 0777, 0);
					var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
						.createInstance(Components.interfaces.nsIConverterOutputStream);
					converter.init(foStream, "UTF-8", 0, 0);
					converter.writeString(newvalue);
					converter.writeString(newline);
					converter.close();
				    } while(hasmore);

				    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
					    .createInstance(Components.interfaces.nsIFileOutputStream);
				    foStream.init(tempscript, 0x02 | 0x10 , 0777, 0);
				    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
					    .createInstance(Components.interfaces.nsIConverterOutputStream);
				    converter.init(foStream, "UTF-8", 0, 0);
				    if (killsudo == true && scriptcontent.match(/sudo/)){
					converter.writeString(newline);
					converter.writeString(sudoline);
				    }
				    if (useterminal == "yes" && keepterminal == true){
				    converter.writeString(newline);
				    converter.writeString(endline);
				    }
				    converter.close();

				    if ( useterminal == "yes" ){

					var process = Components.classes['@mozilla.org/process/util;1']
						.createInstance(Components.interfaces.nsIProcess);
					process.init(terminal);
					var arguments = ["-e",tempscript.path];
					process.run(false, arguments, arguments.length);

				    }
				    else {

					var process = Components.classes['@mozilla.org/process/util;1']
						.createInstance(Components.interfaces.nsIProcess);
					process.init(tempscript);
					var arguments = [];
					process.run(false, arguments, arguments.length);
				    }
				}
			    }

			    if (usevariables == "novariable"){

				var zstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
					.createInstance(Components.interfaces.nsIFileInputStream);
				zstream.init(sourcefile, 0x01, 0444, 0);
				zstream.QueryInterface(Components.interfaces.nsILineInputStream);
				var line = {}, lines = [], hasmore;
				do {
				    hasmore = zstream.readLine(line);
				    lines.push(line.value);
				    var newvalue = line.value;
				    var newline = "\n";
				    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
					    .createInstance(Components.interfaces.nsIFileOutputStream);
				    foStream.init(tempscript, 0x02 | 0x10 , 0777, 0);
				    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
					    .createInstance(Components.interfaces.nsIConverterOutputStream);
				    converter.init(foStream, "UTF-8", 0, 0);
				    converter.writeString(newvalue);
				    converter.writeString(newline);
				    converter.close();
				} while(hasmore);

				var scriptcontent = "";
				var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
					.createInstance(Components.interfaces.nsIFileInputStream);
				var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
					.createInstance(Components.interfaces.nsIConverterInputStream);
				fstream.init(sourcefile, -1, 0, 0);
				cstream.init(fstream, "UTF-8", 0, 0);
				let (str = {}) {
				  cstream.readString(-1, str);
				  scriptcontent = str.value;
				}
				cstream.close();

				var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
					.createInstance(Components.interfaces.nsIFileOutputStream);
				foStream.init(tempscript, 0x02 | 0x10 , 0777, 0);
				var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
					.createInstance(Components.interfaces.nsIConverterOutputStream);
				converter.init(foStream, "UTF-8", 0, 0);
				if (killsudo == true && scriptcontent.match(/sudo/)){
				    converter.writeString(newline);
				    converter.writeString(sudoline);
				}
				if (useterminal == "yes" && keepterminal == true){
				converter.writeString(newline);
				converter.writeString(endline);
				}
				converter.close();

				if ( useterminal == "yes" ){

				    var process = Components.classes['@mozilla.org/process/util;1']
					    .createInstance(Components.interfaces.nsIProcess);
				    process.init(terminal);
				    var arguments = ["-e",tempscript.path];
				    process.run(false, arguments, arguments.length);

				}
				else {

				    var process = Components.classes['@mozilla.org/process/util;1']
					    .createInstance(Components.interfaces.nsIProcess);
				    process.init(tempscript);
				    var arguments = [];
				    process.run(false, arguments, arguments.length);
				}
			    }

			}
		    }

		    if (blocked == true) {

			foxrunnerSidebar.blacklistedAlert();
		    }
		}
	    }
	}
    },

    searchFilter: function (aTable) {

	//get search string
	var newkeyword = document.getElementById("search"+aTable).value;

	var database = Components.classes['@mozilla.org/file/directory_service;1']
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsILocalFile);
	database.append("foxrunner.sqlite");

	var storageService = Components.classes["@mozilla.org/storage/service;1"]
		.getService(Components.interfaces.mozIStorageService);
	var mDBConn = storageService.openDatabase(database);

	if (aTable == "blacklist"){

	    mDBConn.executeSimpleSQL("UPDATE blacklist SET visible='no' WHERE visible='yes'");

	    var statement = mDBConn.createStatement("SELECT * FROM blacklist WHERE blacklisted LIKE :newkeyword_value");
	    statement.params.newkeyword_value = "%"+newkeyword+"%";
	    mDBConn.beginTransaction();
	    while (statement.executeStep()) {

		let blacklisted = statement.row.blacklisted;

		var statement2 = mDBConn.createStatement("UPDATE blacklist SET visible='yes' WHERE blacklisted= :blacklisted_value");
		statement2.params.blacklisted_value = blacklisted;
		statement2.executeStep();
		statement2.reset();
	    }
	    mDBConn.commitTransaction();
	    statement.reset();
	}

	if (aTable == "commands"){

	    mDBConn.executeSimpleSQL("UPDATE commands SET visible='no' WHERE visible='yes'");

	    var statement = mDBConn.createStatement("SELECT * FROM commands WHERE commandstring LIKE :newkeyword_value");
	    statement.params.newkeyword_value = "%"+newkeyword+"%";
	    mDBConn.beginTransaction();
	    while (statement.executeStep()) {

		let commandstring = statement.row.commandstring;

		var statement2 = mDBConn.createStatement("UPDATE commands SET visible='yes' WHERE commandstring= :commandstring_value");
		statement2.params.commandstring_value = commandstring;
		statement2.executeStep();
		statement2.reset();
	    }
	    mDBConn.commitTransaction();
	    statement.reset();
	}

	if (aTable == "commandhistory"){

	    mDBConn.executeSimpleSQL("UPDATE commandhistory SET visible='no' WHERE visible='yes'");

	    var statement = mDBConn.createStatement("SELECT * FROM commandhistory WHERE commandstring LIKE :newkeyword_value");
	    statement.params.newkeyword_value = "%"+newkeyword+"%";
	    mDBConn.beginTransaction();
	    while (statement.executeStep()) {

		let commandstring = statement.row.commandstring;

		var statement2 = mDBConn.createStatement("UPDATE commandhistory SET visible='yes' WHERE commandstring= :commandstring_value");
		statement2.params.commandstring_value = commandstring;
		statement2.executeStep();
		statement2.reset();
	    }
	    mDBConn.commitTransaction();
	    statement.reset();
	}

	if (aTable == "scripts"){

	    mDBConn.executeSimpleSQL("UPDATE scripts SET visible='no' WHERE visible='yes'");

	    var statement = mDBConn.createStatement("SELECT * FROM scripts WHERE scripttitle LIKE :newkeyword_value");
	    statement.params.newkeyword_value = "%"+newkeyword+"%";
	    mDBConn.beginTransaction();
	    while (statement.executeStep()) {

		let scripttitle = statement.row.scripttitle;

		var statement2 = mDBConn.createStatement("UPDATE scripts SET visible='yes' WHERE scripttitle= :scripttitle_value");
		statement2.params.scripttitle_value = scripttitle;
		statement2.executeStep();
		statement2.reset();
	    }
	    mDBConn.commitTransaction();
	    statement.reset();
	}

	if (aTable == "variables"){

	    mDBConn.executeSimpleSQL("UPDATE variables SET visible='no' WHERE visible='yes'");

	    var statement = mDBConn.createStatement("SELECT * FROM variables WHERE thevariable LIKE :newkeyword_value");
	    statement.params.newkeyword_value = "%"+newkeyword+"%";
	    mDBConn.beginTransaction();
	    while (statement.executeStep()) {

		let thevariable = statement.row.thevariable;

		var statement2 = mDBConn.createStatement("UPDATE variables SET visible='yes' WHERE thevariable= :thevariable_value");
		statement2.params.thevariable_value = thevariable;
		statement2.executeStep();
		statement2.reset();
	    }
	    mDBConn.commitTransaction();
	    statement.reset();
	}

	if (aTable == "whitelist"){

	    mDBConn.executeSimpleSQL("UPDATE whitelist SET visible='no' WHERE visible='yes'");

	    var statement = mDBConn.createStatement("SELECT * FROM whitelist WHERE whitelisted LIKE :newkeyword_value");
	    statement.params.newkeyword_value = "%"+newkeyword+"%";
	    mDBConn.beginTransaction();
	    while (statement.executeStep()) {

		let whitelisted = statement.row.whitelisted;

		var statement2 = mDBConn.createStatement("UPDATE whitelist SET visible='yes' WHERE whitelisted= :whitelisted_value");
		statement2.params.whitelisted_value = whitelisted;
		statement2.executeStep();
		statement2.reset();
	    }
	    mDBConn.commitTransaction();
	    statement.reset();
	}

	foxrunnerSidebar.rebuildTrees(aTable);
    },

    showAll: function (aTable) {

	var database = Components.classes['@mozilla.org/file/directory_service;1']
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsILocalFile);
	database.append("foxrunner.sqlite");

	var storageService = Components.classes["@mozilla.org/storage/service;1"]
		.getService(Components.interfaces.mozIStorageService);
	var mDBConn = storageService.openDatabase(database);

	document.getElementById("search"+aTable).value = "";

	if (aTable == "blacklist"){
	    mDBConn.executeSimpleSQL("UPDATE blacklist SET visible='yes' WHERE visible='no'");
	}

	if (aTable == "commands"){
	    mDBConn.executeSimpleSQL("UPDATE commands SET visible='yes' WHERE visible='no'");
	}

	if (aTable == "commandhistory"){
	    mDBConn.executeSimpleSQL("UPDATE commandhistory SET visible='yes' WHERE visible='no'");
	}

	if (aTable == "scripts"){
	    mDBConn.executeSimpleSQL("UPDATE scripts SET visible='yes' WHERE visible='no'");
	}

	if (aTable == "variables"){
	    mDBConn.executeSimpleSQL("UPDATE variables SET visible='yes' WHERE visible='no'");
	}

	if (aTable == "whitelist"){
	    mDBConn.executeSimpleSQL("UPDATE whitelist SET visible='yes' WHERE visible='no'");
	}

	foxrunnerSidebar.rebuildTrees(aTable);
    }
};
window.addEventListener("load", function(e) { foxrunnerSidebar.sidebarOnLoad(); }, false);