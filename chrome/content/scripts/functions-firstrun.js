var FoxRunnerFirstrun = {

    init: function(){//get current version from extension manager

	try {// Firefox <= 3.6

	    //get current version from extension manager
	    var gExtensionManager = Components.classes["@mozilla.org/extensions/manager;1"]
		.getService(Components.interfaces.nsIExtensionManager);
	    var current = gExtensionManager.getItemForID("foxrunner@lovinglinux.megabyet.net").version;

	    FoxRunnerFirstrun.updateInstall(current);
	}
	catch(e){// Firefox >=4.0

	    //get current version from extension manager
	    Components.utils.import("resource://gre/modules/AddonManager.jsm");
    
	    AddonManager.getAddonByID("foxrunner@lovinglinux.megabyet.net", function(addon) {

		var current = addon.version;
		FoxRunnerFirstrun.updateInstall(current);
	    });
	}
	window.removeEventListener("load",function(){ FoxRunnerFirstrun.init(); },true);
    },

    updateInstall: function(aVersion){//check version and perform updates

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.foxrunner.");

	//access database interface
	var database = Components.classes['@mozilla.org/file/directory_service;1']
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsILocalFile);
	database.append("foxrunner.sqlite");

	var storageService = Components.classes["@mozilla.org/storage/service;1"]
		.getService(Components.interfaces.mozIStorageService);
	var mDBConn = storageService.openDatabase(database);

	//create database tables if not exists
	mDBConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS commands (commandstring TEXT PRIMARY KEY ON CONFLICT IGNORE NOT NULL, visible TEXT DEFAULT 'yes')");
	mDBConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS variables (thevariable TEXT PRIMARY KEY ON CONFLICT IGNORE NOT NULL, visible TEXT DEFAULT 'yes')");
	mDBConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS scripts (scripttitle TEXT PRIMARY KEY ON CONFLICT IGNORE NOT NULL, visible TEXT DEFAULT 'yes', terminaloption TEXT DEFAULT 'yes', variablesoption TEXT DEFAULT 'novariable')");
	mDBConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS blacklist (blacklisted TEXT PRIMARY KEY ON CONFLICT IGNORE NOT NULL, visible TEXT DEFAULT 'yes')");
	mDBConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS whitelist (whitelisted TEXT PRIMARY KEY ON CONFLICT IGNORE NOT NULL, visible TEXT DEFAULT 'yes')");
	mDBConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS commandhistory (commandstring TEXT PRIMARY KEY ON CONFLICT IGNORE NOT NULL, visible TEXT DEFAULT 'yes')");

	//create storage folder if not exists
	var storagefolder = Components.classes["@mozilla.org/file/directory_service;1"]
		    .getService(Components.interfaces.nsIProperties)
		    .get("ProfD", Components.interfaces.nsIFile);
	storagefolder.append("foxrunner");
	if ( !storagefolder.exists() || !storagefolder.isDirectory() ) {
	    storagefolder.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
	}

	//firstrun and update declarations
	var ver = -1, firstrun = true;
	var current = aVersion;

	try{//check for existing preferences
	    ver = this.prefs.getCharPref("version");
	    firstrun = this.prefs.getBoolPref("firstrun");
	}catch(e){
	    //nothing
	}finally{

	    if (firstrun){//actions specific for first installation

		var navbar = document.getElementById("nav-bar");
		var newset = navbar.currentSet + ",foxrunnerbutton-1";
		navbar.currentSet = newset;
		navbar.setAttribute("currentset", newset );
		document.persist("nav-bar", "currentset");

		//set preferences
		this.prefs.setBoolPref("firstrun",false);
		this.prefs.setCharPref("version",current);

		var bashline = "#!/bin/bash";
		var newline = "\n";
		var commandline = "echo \"${1}\" && zenity --info --text \"${1}\"";

		var tempscript = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("ProfD", Components.interfaces.nsIFile);
		tempscript.append("foxrunner");
		tempscript.append("singlevariable-example.sh");
		tempscript.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0777);

		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
			.createInstance(Components.interfaces.nsIFileOutputStream);

		foStream.init(tempscript, 0x02 | 0x10 , 0777, 0);

		var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
			.createInstance(Components.interfaces.nsIConverterOutputStream);
		converter.init(foStream, "UTF-8", 0, 0);
		converter.writeString(bashline);
		converter.writeString(newline);
		converter.writeString(newline);
		converter.writeString(commandline);
		converter.close();

		var commandline = "echo \"${1} - ${2}\" && zenity --info --text \"${1} - ${2}\"";

		var tempscript = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("ProfD", Components.interfaces.nsIFile);
		tempscript.append("foxrunner");
		tempscript.append("multiplevariables-example.sh");
		tempscript.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0777);

		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
			.createInstance(Components.interfaces.nsIFileOutputStream);

		foStream.init(tempscript, 0x02 | 0x10 , 0777, 0);

		var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
			.createInstance(Components.interfaces.nsIConverterOutputStream);
		converter.init(foStream, "UTF-8", 0, 0);
		converter.writeString(bashline);
		converter.writeString(newline);
		converter.writeString(newline);
		converter.writeString(commandline);
		converter.close();

		var commandline = "echo \"Hello World!\" && zenity --info --text \"Hello World!\"";

		var tempscript = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("ProfD", Components.interfaces.nsIFile);
		tempscript.append("foxrunner");
		tempscript.append("novariable-example.sh");
		tempscript.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0777);

		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
			.createInstance(Components.interfaces.nsIFileOutputStream);

		foStream.init(tempscript, 0x02 | 0x10 , 0777, 0);

		var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
			.createInstance(Components.interfaces.nsIConverterOutputStream);
		converter.init(foStream, "UTF-8", 0, 0);
		converter.writeString(bashline);
		converter.writeString(newline);
		converter.writeString(newline);
		converter.writeString(commandline);
		converter.close();

		mDBConn.executeSimpleSQL("INSERT INTO commands VALUES('sudo apt-get update','yes')");
		mDBConn.executeSimpleSQL("INSERT INTO commands VALUES('sudo apt-get upgrade','yes')");

		mDBConn.executeSimpleSQL("INSERT INTO commandhistory VALUES('sudo apt-get update','yes')");
		mDBConn.executeSimpleSQL("INSERT INTO commandhistory VALUES('sudo apt-get upgrade','yes')");

		mDBConn.executeSimpleSQL("INSERT INTO variables VALUES('This is a variable','yes')");
		mDBConn.executeSimpleSQL("INSERT INTO variables VALUES('This is another variable','yes')");

		mDBConn.executeSimpleSQL("INSERT INTO blacklist VALUES('> /dev/sda','yes')");
		mDBConn.executeSimpleSQL("INSERT INTO blacklist VALUES('> /dev/sdb','yes')");
		mDBConn.executeSimpleSQL("INSERT INTO blacklist VALUES('* mkfs *','yes')");
		mDBConn.executeSimpleSQL("INSERT INTO blacklist VALUES('mkfs *','yes')");
		mDBConn.executeSimpleSQL("INSERT INTO blacklist VALUES('* rm *','yes')");
		mDBConn.executeSimpleSQL("INSERT INTO blacklist VALUES('rm *','yes')")
		mDBConn.executeSimpleSQL("INSERT INTO blacklist VALUES(':(){:|:&};:','yes')");

		mDBConn.executeSimpleSQL("INSERT INTO whitelist VALUES('localhost','yes')");
		mDBConn.executeSimpleSQL("INSERT INTO whitelist VALUES('about:blank','yes')");
		mDBConn.executeSimpleSQL("INSERT INTO whitelist VALUES('ubuntuforums.org','yes')");

		mDBConn.executeSimpleSQL("INSERT INTO scripts VALUES('novariable-example.sh','yes','yes','novariable')");
		mDBConn.executeSimpleSQL("INSERT INTO scripts VALUES('singlevariable-example.sh','yes','yes','singlevariable')");
		mDBConn.executeSimpleSQL("INSERT INTO scripts VALUES('multiplevariables-example.sh','yes','yes','multiplevariables')");
	    }

	    if (ver!=current && !firstrun){

		//set preferences
		this.prefs.setCharPref("version",current);
	    }

	    try{
		document.getElementById('commands').builder.rebuild();
		document.getElementById('commandhistory').builder.rebuild();
		document.getElementById('scripts').builder.rebuild();
		document.getElementById('blacklist').builder.rebuild();
		document.getElementById('whitelist').builder.rebuild();
		document.getElementById('variables').builder.rebuild();

		document.getElementById('foxrunner-run-command-selected').builder.rebuild();
		document.getElementById('foxrunner-run-script-selected').builder.rebuild();
		document.getElementById('foxrunner-run-script-selected-single-variable').builder.rebuild();
		document.getElementById('foxrunner-run-command-history-selected').builder.rebuild();
	    }catch(e){
		//do nothing
	    }
	}
    }
};
//window.addEventListener("load",function(){ FoxRunnerFirstrun.init(); },true);
window.addEventListener("load", function(e) { setTimeout("FoxRunnerFirstrun.init()",500); }, false);