//declare observer
const FoxRunnerObserver =
{
    observe: function(subject, topic, prefName)

    {
	//check if preferences changed
	if (topic == "nsPref:changed" && (prefName == "extensions.foxrunner.style"
		      || prefName == "extensions.foxrunner.hidestatusbar"))
	{

	    //access preferences interface
	    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		    .getService(Components.interfaces.nsIPrefService)
		    .getBranch("extensions.foxrunner.");

	    if(prefName == "extensions.foxrunner.hidestatusbar"){//match style preferences change

		//get preference
		var hidebar = this.prefs.getBoolPref("hidestatusbar");

		if(hidebar == true){
		    document.getElementById("foxrunnerstatusbar").hidden = true;
		    document.getElementById("foxrunnerstatusbar2img").hidden = false;
		}
		else{
		    document.getElementById("foxrunnerstatusbar").hidden = false;
		    document.getElementById("foxrunnerstatusbar2img").hidden = true;
		}
	    }

	    if(prefName == "extensions.foxrunner.style"){//match style preferences change

		//get preference
		var style = this.prefs.getCharPref("style");

		//declare css file
		var sourcefile = Components.classes['@mozilla.org/file/directory_service;1']
			.getService(Components.interfaces.nsIProperties)
			.get("ProfD", Components.interfaces.nsILocalFile);
		sourcefile.append("extensions");
		sourcefile.append("foxrunner@lovinglinux.megabyet.net");
		sourcefile.append("chrome");
		sourcefile.append("content");
		sourcefile.append("css");
		sourcefile.append("styles");
		sourcefile.append(style);

		//declare destination css folder
		var destfolder = Components.classes['@mozilla.org/file/directory_service;1']
			.getService(Components.interfaces.nsIProperties)
			.get("ProfD", Components.interfaces.nsILocalFile);
		destfolder.append("extensions");
		destfolder.append("foxrunner@lovinglinux.megabyet.net");
		destfolder.append("chrome");
		destfolder.append("content");
		destfolder.append("css");

		//declare destination css file
		var destfile = Components.classes['@mozilla.org/file/directory_service;1']
			.getService(Components.interfaces.nsIProperties)
			.get("ProfD", Components.interfaces.nsILocalFile);
		destfile.append("extensions");
		destfile.append("foxrunner@lovinglinux.megabyet.net");
		destfile.append("chrome");
		destfile.append("content");
		destfile.append("css");
		destfile.append("sidebar-tree.css");

		if (sourcefile.exists()) {//match if source css file exists

		    if (destfile.exists()) {//match if destination css file exists

			//remove destination file
			destfile.remove(false);
		    }
		    //copy source file to destination folder
		    sourcefile.copyTo(destfolder,"sidebar-tree.css");
		}
	    }
	}
    }
};

var registerFoxRunnerObserver = {//observer registering functions

    registerObserver: function(aEvent) {//register and unregister observers

	//declare observer type
	var FoxRunnerPrefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranchInternal);

	if (aEvent == "register"){//register observers
	    FoxRunnerPrefService.addObserver("extensions.foxrunner.style", FoxRunnerObserver, false);
	    FoxRunnerPrefService.addObserver("extensions.foxrunner.hidestatusbar", FoxRunnerObserver, false);
	}

	if (aEvent == "unregister"){//unregister observers
	     FoxRunnerPrefService.removeObserver("extensions.foxrunner.style", FoxRunnerObserver);
	     FoxRunnerPrefService.removeObserver("extensions.foxrunner.hidestatusbar", FoxRunnerObserver);
	}
    }
};
window.addEventListener("load",function(){ registerFoxRunnerObserver.registerObserver('register'); },false);//launch observer register
window.addEventListener("unload",function(){ registerFoxRunnerObserver.registerObserver('unregister'); },false);//launch observer unregister