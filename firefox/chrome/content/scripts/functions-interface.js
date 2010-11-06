var foxrunnerInterface = {

    showHideContextMenus: function () {

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

	var showscripts = false;
	var showcommands = false;
	var showcommandhistory = false;
	var showsinglevariable = false;
	var showwhitelist = true;
	try{
	    var sourceurl = content.window.location.host;
	}catch(e){
	    var sourceurl = "about:blank";
	}
	var showwhitelist = this.prefs.getBoolPref("whitelist");

	var showFoxRunnerRunCommandCustom = document.getElementById("foxrunner-run-command-custom");
	showFoxRunnerRunCommandCustom.hidden = (gContextMenu.isTextSelected);

	//separator  <menuseparator id="foxrunner-run-command-separator"/>
	var showFoxRunnerRunCommandSeparator = document.getElementById("foxrunner-run-command-separator");
	showFoxRunnerRunCommandSeparator.hidden = (gContextMenu.isTextSelected);

	var showFoxRunnerRunCommand = document.getElementById("foxrunner-run-command");
	showFoxRunnerRunCommand.hidden = (gContextMenu.isTextSelected);

	var showFoxRunnerRunScript = document.getElementById("foxrunner-run-script");
	showFoxRunnerRunScript.hidden = (gContextMenu.isTextSelected);
		
	var showFoxRunnerRunCommandHistory = document.getElementById("foxrunner-run-command-history");
	showFoxRunnerRunCommandHistory.hidden = (gContextMenu.isTextSelected);

	//separator <menuseparator id="foxrunner-add-selected-site-separator"/>
	var showFoxRunnerAddSelectedSiteSeparator = document.getElementById("foxrunner-add-selected-site-separator");
	showFoxRunnerAddSelectedSiteSeparator.hidden = (gContextMenu.isTextSelected);

	var showFoxRunnerAddSelectedSite = document.getElementById("foxrunner-add-site");
	showFoxRunnerAddSelectedSite.hidden = (gContextMenu.isTextSelected);
	
	var showFoxRunnerRunSelectedText = document.getElementById("foxrunner-run-selected-text");
	showFoxRunnerRunSelectedText.hidden = !(gContextMenu.isTextSelected);
	
	var showFoxRunnerSendSelectedTextToScript = document.getElementById("foxrunner-run-script-single-variable");
	showFoxRunnerSendSelectedTextToScript.hidden = !(gContextMenu.isTextSelected);

	//separator <menuseparator id="foxrunner-add-selected-separator"/>
	var showFoxRunnerAddSelectedSeparator = document.getElementById("foxrunner-add-selected-separator");
	showFoxRunnerAddSelectedSeparator.hidden = !(gContextMenu.isTextSelected);

	var showFoxRunnerAddSelectedCommand = document.getElementById("foxrunner-add-selected-command");
	showFoxRunnerAddSelectedCommand.hidden = !(gContextMenu.isTextSelected);
	
	var showFoxRunnerAddSelectedVariable = document.getElementById("foxrunner-add-selected-variable");
	showFoxRunnerAddSelectedVariable.hidden = !(gContextMenu.isTextSelected);
	
	var showFoxRunnerAddSelectedScript = document.getElementById("foxrunner-add-selected-script");
	showFoxRunnerAddSelectedScript.hidden = !(gContextMenu.isTextSelected);

	var statement = mDBConn.createStatement("SELECT * FROM commands");
	mDBConn.beginTransaction();
	while (statement.executeStep()) {
	    let commandstring = statement.row.commandstring;
	    if (commandstring.length > 0){
		var showcommands = true;
	    }
	}
	mDBConn.commitTransaction();
	statement.reset();

	var statement = mDBConn.createStatement("SELECT * FROM commandhistory");
	mDBConn.beginTransaction();
	while (statement.executeStep()) {
	    let commandstring = statement.row.commandstring;
	    if (commandstring.length > 0){
		var showcommandhistory = true;
	    }
	}
	mDBConn.commitTransaction();
	statement.reset();

	var statement = mDBConn.createStatement("SELECT * FROM scripts");
	mDBConn.beginTransaction();
	while (statement.executeStep()) {
	    let scripttitle = statement.row.scripttitle;
	    if (scripttitle.length > 0){
		var showscripts = true;
	    }
	}
	mDBConn.commitTransaction();
	statement.reset();

	var statement = mDBConn.createStatement("SELECT * FROM scripts WHERE variablesoption = 'singlevariable'");
	mDBConn.beginTransaction();
	while (statement.executeStep()) {
	    let scripttitle = statement.row.scripttitle;
	    if (scripttitle.length > 0){
		var showsinglevariable = true;
	    }
	}
	mDBConn.commitTransaction();
	statement.reset();

	var statement = mDBConn.createStatement("SELECT * FROM whitelist");
	mDBConn.beginTransaction();
	while (statement.executeStep()) {
	    let whitelisted = statement.row.whitelisted;
	    if (sourceurl.match(whitelisted)) {
		var showwhitelist = false;
	    }
	}
	mDBConn.commitTransaction();
	statement.reset();

	if (showcommands == false){
	    document.getElementById("foxrunner-run-command").hidden = true;
	}

	if (showcommandhistory == false){
	    document.getElementById("foxrunner-run-command-history").hidden = true;
	}

	if (showscripts == false){
	    document.getElementById("foxrunner-run-script").hidden = true;
	}

	if (showsinglevariable == false){
	    document.getElementById("foxrunner-run-script-single-variable").hidden = true;
	}

	if (showcommands == false && showcommandhistory == false && showscripts == false){
	    document.getElementById("foxrunner-run-command-separator").hidden = true;
	}

	if (showwhitelist == false){
	    document.getElementById("foxrunner-add-site").hidden = true;
	    document.getElementById("foxrunner-add-selected-site-separator").hidden = true;
	}
    },

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

    blacklistedAlert: function () {

	var strbundle = document.getElementById("foxrunnerstrings");
	var message = strbundle.getString("blacklisted");
	var messagetitle = strbundle.getString("foxrunneralert");
	var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
		.getService(Components.interfaces.nsIPromptService);
	prompts.alert(window, messagetitle, message);

    },

    rebuildTrees: function (aTree) {

	if (aTree == "all"){//foxrunnerInterface.rebuildTrees('all');

	    document.getElementById('foxrunner-run-command-selected').builder.rebuild();
	    document.getElementById('foxrunner-run-command-history-selected').builder.rebuild();
	    document.getElementById('foxrunner-run-script-selected').builder.rebuild();
	    document.getElementById('foxrunner-run-script-selected-single-variable').builder.rebuild();

	    var sidebarWindow = document.getElementById("sidebar").contentWindow;
	    if (sidebarWindow.location.href == "chrome://foxrunner/content/sidebar.xul") {
		sidebarWindow.document.getElementById('commands').builder.rebuild();
		sidebarWindow.document.getElementById('commandhistory').builder.rebuild();
		sidebarWindow.document.getElementById('scripts').builder.rebuild();
		sidebarWindow.document.getElementById('blacklist').builder.rebuild();
		sidebarWindow.document.getElementById('whitelist').builder.rebuild();
		sidebarWindow.document.getElementById('variables').builder.rebuild();
	    } 
	}

	if (aTree == "commands"){//foxrunnerInterface.rebuildTrees('commands');

	    document.getElementById('foxrunner-run-command-selected').builder.rebuild();

	    var sidebarWindow = document.getElementById("sidebar").contentWindow;
	    if (sidebarWindow.location.href == "chrome://foxrunner/content/sidebar.xul") {
		sidebarWindow.document.getElementById('commands').builder.rebuild();
	    } 
	}

	if (aTree == "commandhistory"){//foxrunnerInterface.rebuildTrees('commandhistory');

	    document.getElementById('foxrunner-run-command-history-selected').builder.rebuild();

	    var sidebarWindow = document.getElementById("sidebar").contentWindow;
	    if (sidebarWindow.location.href == "chrome://foxrunner/content/sidebar.xul") {
		sidebarWindow.document.getElementById('commandhistory').builder.rebuild();
	    } 
	}

	if (aTree == "scripts"){//foxrunnerInterface.rebuildTrees('scripts');

	    document.getElementById('foxrunner-run-script-selected').builder.rebuild();
	    document.getElementById('foxrunner-run-script-selected-single-variable').builder.rebuild();

	    var sidebarWindow = document.getElementById("sidebar").contentWindow;
	    if (sidebarWindow.location.href == "chrome://foxrunner/content/sidebar.xul") {
		sidebarWindow.document.getElementById('scripts').builder.rebuild();
	    } 
	}

	if (aTree == "blacklist"){//foxrunnerInterface.rebuildTrees('blacklist');

	    var sidebarWindow = document.getElementById("sidebar").contentWindow;
	    if (sidebarWindow.location.href == "chrome://foxrunner/content/sidebar.xul") {
		sidebarWindow.document.getElementById('blacklist').builder.rebuild();
	    } 
	}

	if (aTree == "whitelist"){//foxrunnerInterface.rebuildTrees('whitelist');

	    var sidebarWindow = document.getElementById("sidebar").contentWindow;
	    if (sidebarWindow.location.href == "chrome://foxrunner/content/sidebar.xul") {
		sidebarWindow.document.getElementById('whitelist').builder.rebuild();
	    } 
	}

	if (aTree == "variables"){//foxrunnerInterface.rebuildTrees('variables');

	    var sidebarWindow = document.getElementById("sidebar").contentWindow;
	    if (sidebarWindow.location.href == "chrome://foxrunner/content/sidebar.xul") {
		sidebarWindow.document.getElementById('variables').builder.rebuild();
	    } 
	}
    },

    runIt: function (aTree,aText) {

	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.foxrunner.");

	var agreement = this.prefs.getCharPref("agreement");
	try{
	    var sourceurl = content.window.location.host;
	}catch(e){
	    var sourceurl = "about:blank";
	}

	var strbundle = document.getElementById("foxrunnerstrings");
	var donemessage = strbundle.getString("done");

	var confirmweb = this.prefs.getBoolPref("confirmweb");
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

	    foxrunnerInterface.openAgreement();
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

	var blocked = false

	if (aTree == "selectedtext"){

	    var command = content.document.getSelection();

	    if (whitelist == true){

		var blocked = true
		var statement = mDBConn.createStatement("SELECT * FROM whitelist");
		mDBConn.beginTransaction();
		while (statement.executeStep()) {

		    let whitelisted = statement.row.whitelisted;
		    if (sourceurl.match(whitelisted)) {
			var blocked = false;
		    }
		}
		mDBConn.commitTransaction();
		statement.reset();
	    }
	}

	if (aTree == "customcommand"){

	    var command = "";
	}

	if (aTree == "commands"){

	    var command = aText;
	}

	if (aTree == "commandhistory"){

	    var command = aText;
	}

	if (aTree == "scripts"){

	    var scriptname = aText;
	    var command = "";

	    var statement = mDBConn.createStatement("SELECT * FROM scripts WHERE scripttitle= :scripttitle_value");
	    statement.params.scripttitle_value = scriptname;

	    mDBConn.beginTransaction();
	    while (statement.executeStep()) {
		let scripttitle = statement.row.scripttitle;
		let terminaloption = statement.row.terminaloption;
		let variablesoption = statement.row.variablesoption;
		var scriptname = scripttitle;
		var useterminal = terminaloption;
		var usevariables = variablesoption;
	    }
	    mDBConn.commitTransaction();
	    statement.reset();

	    var sourcefile = Components.classes['@mozilla.org/file/directory_service;1']
		    .getService(Components.interfaces.nsIProperties)
		    .get("ProfD", Components.interfaces.nsILocalFile);
	    sourcefile.append("foxrunner");
	    sourcefile.append(scriptname);
	}

	if (aTree == "singlevariable"){

	    var thevariable = content.document.getSelection();
	    var thevariable = thevariable.replace(/"/g, "\\\"");
	    var thevariable = thevariable.replace(/&/g, "&amp;");
	    var thevariable = thevariable.replace(/'/g, "\\\'");
	    var thevariable = thevariable.replace(/</g, "&lt;");
	    var thevariable = thevariable.replace(/>/g, "&gt;");
	    var scriptname = aText;
	    var command = "";

	    var statement = mDBConn.createStatement("SELECT * FROM scripts WHERE scripttitle= :scripttitle_value");
	    statement.params.scripttitle_value = scriptname;

	    mDBConn.beginTransaction();
	    while (statement.executeStep()) {
		let scripttitle = statement.row.scripttitle;
		let terminaloption = statement.row.terminaloption;
		let variablesoption = statement.row.variablesoption;
		var scriptname = scripttitle;
		var useterminal = terminaloption;
		var usevariables = variablesoption;
	    }
	    mDBConn.commitTransaction();
	    statement.reset();

	    var sourcefile = Components.classes['@mozilla.org/file/directory_service;1']
		    .getService(Components.interfaces.nsIProperties)
		    .get("ProfD", Components.interfaces.nsILocalFile);
	    sourcefile.append("foxrunner");
	    sourcefile.append(scriptname);

	    if (whitelist == true){

		var blocked = true
		var statement = mDBConn.createStatement("SELECT * FROM whitelist");
		mDBConn.beginTransaction();
		while (statement.executeStep()) {

		    let whitelisted = statement.row.whitelisted;
		    if (sourceurl.match(whitelisted)) {
			var blocked = false;
		    }
		}
		mDBConn.commitTransaction();
		statement.reset();
	    }

	    if (blacklist == true){

		var statement = mDBConn.createStatement("SELECT * FROM blacklist");
		mDBConn.beginTransaction();
		while (statement.executeStep()) {

		    let blacklisted = statement.row.blacklisted;
		    blacklisted = blacklisted.replace(/\*/g,".*");
		    blacklisted = blacklisted.replace(/\.\.\*/g,".*");
		    if (thevariable.match(blacklisted)) {
			var blocked = true;
		    }
		}
		mDBConn.commitTransaction();
		statement.reset();
	    }
	}

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
				var arguments = ["-e","'"+tempscript.path+"'"];
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

				foxrunnerInterface.rebuildTrees('commandhistory');
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
		    var arguments = ["-e","'"+tempscript.path+"'"];
		    process.run(false, arguments, arguments.length);

		    var pbs = Components.classes["@mozilla.org/privatebrowsing;1"]  
				.getService(Components.interfaces.nsIPrivateBrowsingService);  
		    var inPrivateBrowsingMode = pbs.privateBrowsingEnabled;  

		    if (savehistory == true && aTree == "commands" && !inPrivateBrowsingMode){

			var statement = mDBConn.createStatement("INSERT INTO commandhistory (commandstring) VALUES (:commandstring_value)");
			statement.params.commandstring_value = thirdline;
			statement.executeStep();
			statement.reset();

			foxrunnerInterface.rebuildTrees('commandhistory');
		    }
		}
	    }

	    //custom command code
	    if (aTree == "customcommand" && blocked !== true){

		var thirdline = command;

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
			    var arguments = ["-e","'"+tempscript.path+"'"];
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

			if (savehistory == true && !inPrivateBrowsingMode){

			    var statement = mDBConn.createStatement("INSERT INTO commandhistory (commandstring) VALUES (:commandstring_value)");
			    statement.params.commandstring_value = thirdline;
			    statement.executeStep();
			    statement.reset();

			    foxrunnerInterface.rebuildTrees('commandhistory');
			}
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
				    var arguments = ["-e","'"+tempscript.path+"'"];
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
				var arguments = ["-e","'"+tempscript.path+"'"];
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
				var arguments = ["-e","'"+tempscript.path+"'"];
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
			    var arguments = ["-e","'"+tempscript.path+"'"];
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

	    //web code
	    if (aTree == "selectedtext" && blocked !== true){

		var thirdline = command;

		if (confirmweb == true){

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
				var arguments = ["-e","'"+tempscript.path+"'"];
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

			    if (savehistory == true && !inPrivateBrowsingMode){

				var statement = mDBConn.createStatement("INSERT INTO commandhistory (commandstring) VALUES (:commandstring_value)");
				statement.params.commandstring_value = thirdline;
				statement.executeStep();
				statement.reset();

				foxrunnerInterface.rebuildTrees('commandhistory');
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
		    if (useterminal == "yes" && keepterminal == true){
			converter.writeString(newline);
			converter.writeString(endline);
		    }
		    converter.close();

		    var process = Components.classes['@mozilla.org/process/util;1']
			    .createInstance(Components.interfaces.nsIProcess);
		    process.init(terminal);
		    var arguments = ["-e","'"+tempscript.path+"'"];
		    process.run(false, arguments, arguments.length);

		    var pbs = Components.classes["@mozilla.org/privatebrowsing;1"]  
				.getService(Components.interfaces.nsIPrivateBrowsingService);  
		    var inPrivateBrowsingMode = pbs.privateBrowsingEnabled;  

		    if (savehistory == true && !inPrivateBrowsingMode){

			var statement = mDBConn.createStatement("INSERT INTO commandhistory (commandstring) VALUES (:commandstring_value)");
			statement.params.commandstring_value = thirdline;
			statement.executeStep();
			statement.reset();

			foxrunnerInterface.rebuildTrees('commandhistory');
		    }
		}
	    }

	    //single variable script code
	    if (aTree == "singlevariable" && blocked !== true){

		if (confirmweb == true){

		    var strbundle = document.getElementById("foxrunnerstrings");
		    var message = strbundle.getFormattedString("confirmscript", [ scriptname ]);
		    var messagetitle = strbundle.getString("foxrunneralert");
		    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			    .getService(Components.interfaces.nsIPromptService);
		    var result = prompts.confirm(window, messagetitle, message);

		    if (result == true){

			if (usevariables == "singlevariable"){

			    var zstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
				    .createInstance(Components.interfaces.nsIFileInputStream);
			    zstream.init(sourcefile, 0x01, 0444, 0);
			    zstream.QueryInterface(Components.interfaces.nsILineInputStream);
			    var line = {}, lines = [], hasmore;
			    do {
				hasmore = zstream.readLine(line);
				lines.push(line.value);
				var newvalue = line.value;
				var newvalue = newvalue.replace(/\$\{1\}/g, thevariable);
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
				var arguments = ["-e","'"+tempscript.path+"'"];
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

		    if (usevariables == "singlevariable"){

			var zstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
				.createInstance(Components.interfaces.nsIFileInputStream);
			zstream.init(sourcefile, 0x01, 0444, 0);
			zstream.QueryInterface(Components.interfaces.nsILineInputStream);
			var line = {}, lines = [], hasmore;
			do {
			    hasmore = zstream.readLine(line);
			    lines.push(line.value);
			    var newvalue = line.value;
			    var newvalue = newvalue.replace(/\$\{1\}/g, thevariable);
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
			    var arguments = ["-e","'"+tempscript.path+"'"];
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

		foxrunnerInterface.blacklistedAlert();
	    }
	}
    },

    addSelectedText: function (aType) {

	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.foxrunner.");

	var agreement = this.prefs.getCharPref("agreement");
	var selectedtext = content.document.getSelection();
	try{
	    var sourceurl = content.window.location.host;
	}catch(e){
	    var sourceurl = "about:blank";
	}
	var database = Components.classes['@mozilla.org/file/directory_service;1']
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsILocalFile);
	database.append("foxrunner.sqlite");

	var storageService = Components.classes["@mozilla.org/storage/service;1"]
		.getService(Components.interfaces.mozIStorageService);
	var mDBConn = storageService.openDatabase(database);

	if (agreement !== "yes") {

	    foxrunnerInterface.openAgreement();
	}

	var agreement = this.prefs.getCharPref("agreement");
	var blacklist = this.prefs.getBoolPref("blacklist");
	var whitelist = this.prefs.getBoolPref("whitelist");
	var confirmlocal = this.prefs.getBoolPref("confirmlocal");
	var confirmweb = this.prefs.getBoolPref("confirmweb");
	var termcom = this.prefs.getCharPref("termcom");

	var blocked = false

	if (whitelist == true){

	    var blocked = true
	    var statement = mDBConn.createStatement("SELECT * FROM whitelist");
	    mDBConn.beginTransaction();
	    while (statement.executeStep()) {

		let whitelisted = statement.row.whitelisted;
		if (sourceurl.match(whitelisted)) {
		    var blocked = false;
		}
	    }
	    mDBConn.commitTransaction();
	    statement.reset();
	}

	if (blacklist == true){

	    var statement = mDBConn.createStatement("SELECT * FROM blacklist");
	    mDBConn.beginTransaction();
	    while (statement.executeStep()) {

		let blacklisted = statement.row.blacklisted;
		blacklisted = blacklisted.replace(/\*/g,".*");
		blacklisted = blacklisted.replace(/\.\.\*/g,".*");
		if (selectedtext.match(blacklisted)) {
		    var blocked = true;
		}
	    }
	    mDBConn.commitTransaction();
	    statement.reset();
	}

	if (agreement == "yes" && aType == "site") {

	    var statement = mDBConn.createStatement("SELECT * FROM whitelist");
	    mDBConn.beginTransaction();
	    while (statement.executeStep()) {
		let whitelisted = statement.row.whitelisted;
		if (sourceurl.match(whitelisted)) {
		    var allowed = true;
		}
	    }
	    mDBConn.commitTransaction();
	    statement.reset();

	    if (allowed == true) {

		var strbundle = document.getElementById("foxrunnerstrings");
		var message = strbundle.getString("siteallowedalready");
		var messagetitle = strbundle.getString("foxrunnermessage");
		var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
			.getService(Components.interfaces.nsIAlertsService);
		alertsService.showAlertNotification("chrome://foxrunner/content/images/run_large.png",
		messagetitle, message,
		false, "", null);
	    }
	    else{

		var statement = mDBConn.createStatement("INSERT INTO whitelist (whitelisted) VALUES (:site_value)");
		statement.params.site_value = sourceurl;
		statement.executeStep();
		statement.reset();

		var strbundle = document.getElementById("foxrunnerstrings");
		var message = strbundle.getString("siteallowed");
		var messagetitle = strbundle.getString("foxrunnermessage");
		var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
			.getService(Components.interfaces.nsIAlertsService);
		alertsService.showAlertNotification("chrome://foxrunner/content/images/run_large.png",
		messagetitle, message,
		false, "", null);

		foxrunnerInterface.rebuildTrees('whitelist');
	    }
	}

	if (agreement == "yes" && blocked !== true && aType == "variable") {

	    var statement = mDBConn.createStatement("INSERT INTO variables (thevariable) VALUES (:variable_value)");
	    statement.params.variable_value = selectedtext;
	    statement.executeStep();
	    statement.reset();

	    var strbundle = document.getElementById("foxrunnerstrings");
	    var message = strbundle.getString("variableadded");
	    var messagetitle = strbundle.getString("foxrunnermessage");
	    var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
		    .getService(Components.interfaces.nsIAlertsService);
	    alertsService.showAlertNotification("chrome://foxrunner/content/images/run_large.png",
	    messagetitle, message,
	    false, "", null);

	    foxrunnerInterface.rebuildTrees('variables');
	}

	if (agreement == "yes" && blocked !== true && aType == "command") {

	    var statement = mDBConn.createStatement("INSERT INTO commands (commandstring) VALUES (:commandstring_value)");
	    statement.params.commandstring_value = selectedtext;
	    statement.executeStep();
	    statement.reset();

	    var strbundle = document.getElementById("foxrunnerstrings");
	    var message = strbundle.getString("commandadded");
	    var messagetitle = strbundle.getString("foxrunnermessage");
	    var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
		    .getService(Components.interfaces.nsIAlertsService);
	    alertsService.showAlertNotification("chrome://foxrunner/content/images/run_large.png",
	    messagetitle, message,
	    false, "", null);

	    foxrunnerInterface.rebuildTrees('commands');
	}

	if (agreement == "yes" && blocked !== true && aType == "script") {

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

		}
		else {

		    var selectedtext = selectedtext.replace(/\s.*\#\!\/bin\/bash/, "#!/bin/bash");
		    var selectedtext = selectedtext.replace(/.*\\\n#\!\/bin\/bash/g, "#!/bin/bash");

		    var strbundle = document.getElementById("foxrunnerstrings");
		    var params = {inn:{newscriptcontent:selectedtext,newterminaloption:"yes",newvariablesoption:"novariable"}, out:null};
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

			foxrunnerInterface.rebuildTrees('scripts');
		    }
		}
	    }
	    foxrunnerInterface.rebuildTrees('script');
	}

	if (agreement == "yes" && blocked == true && aType !== "site") {

	    foxrunnerInterface.blacklistedAlert();
	}
    },

    cleanUpTempScripts: function () {

	var script = Components.classes["@mozilla.org/file/directory_service;1"]
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsIFile);
	script.append("extensions");
	script.append("foxrunner@lovinglinux.megabyet.net");
	script.append("chrome");
	script.append("content");
	script.append("tmp");
	script.append("foxrunner.sh");
	if (script.exists()) {
	    script.remove(false);
	}
    },

    cleanUpHistory: function () {

	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.foxrunner.");

	var clearhistory = this.prefs.getBoolPref("clearhistory");

	if (clearhistory == true){

	    var database = Components.classes['@mozilla.org/file/directory_service;1']
		    .getService(Components.interfaces.nsIProperties)
		    .get("ProfD", Components.interfaces.nsILocalFile);
	    database.append("foxrunner.sqlite");

	    var storageService = Components.classes["@mozilla.org/storage/service;1"]
		    .getService(Components.interfaces.mozIStorageService);
	    var mDBConn = storageService.openDatabase(database);

	    var statement = mDBConn.createStatement("DELETE FROM commandhistory");
	    statement.executeStep();
	    statement.reset();
	}
    }
};
window.addEventListener("unload", function(e) { foxrunnerInterface.cleanUpHistory(); }, false);
window.addEventListener("unload", function(e) { foxrunnerInterface.cleanUpTempScripts(); }, false);
