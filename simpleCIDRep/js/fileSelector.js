fs : {}

onload = function(){fileSelector.loadContener(new Array());}


fileSelector = {
		loadContener : function(pOlderPath){
		
			fileSelector.unloadContener();
			//get the contener node
			var vContener = document.getElementById('fileSelector');
			//rebuild current Path and build subTable
			var vPath = new String();
			var vCurrent = fs;
			var vSubFolder;
			for(var i =0; i < pOlderPath.length ; i++){
				vSubFolder = true;
				vPath += vCurrent.content[pOlderPath[i]].name+"/";
				vCurrent = vCurrent.content[pOlderPath[i]];
			}
		
			
			//build current path bar
			var vCurrentPath = document.createElement("div");
			vCurrentPath.appendChild(document.createTextNode(vPath));
			vContener.appendChild(vCurrentPath);
			
			//Feed input content
			document.getElementById("pathInput").value = vPath;
			
			//build File explorer
			var vFileExplorer = document.createElement("div");
			vFileExplorer.id = "fileExplorer";
			
			if(vSubFolder){
				var vParentFolder = document.createElement('div');
				vParentFolder.classname = "parentFolder";
				var vParentPath = pOlderPath.toString();
				vParentPath = vParentPath.substring(0,vParentPath.lastIndexOf(','));
				vParentFolder.setAttribute("ondblclick", 'fileSelector.loadContener(['+vParentPath+']);');
				
				vParentFolder.setAttribute("onclick", 'document.getElementById("pathInput").value=\"'+vPath.substring(0,vPath.substring(0,vPath.lastIndexOf('/')).lastIndexOf('/'))+'/\";');
				vParentFolder.appendChild(document.createTextNode(".."));
				vFileExplorer.appendChild(vParentFolder);
			}
			
			for ( var i = 0; i < vCurrent.content.length; i++) {
				var entry = document.createElement("div");
				if(vCurrent.content[i].content){
					entry.classname ="folder";
					entry.setAttribute("onclick", 'document.getElementById("finalizeUpload").disabled=true; document.getElementById("pathInput").value=\"'+vPath+vCurrent.content[i].name+'/\";');
					var pNewPath = pOlderPath.slice(); pNewPath.push(i);
					entry.setAttribute("ondblclick", 'fileSelector.loadContener(['+pNewPath.toString()+']);');
					entry.appendChild(document.createTextNode(vCurrent.content[i].name+"/"));
		
					
				}
				else{
					entry.classname = "file";
					entry.setAttribute("onclick", 'document.getElementById("finalizeUpload").disabled=false;document.getElementById("pathInput").value=\"'+vPath+vCurrent.content[i].name+'\";');	
					entry.appendChild(document.createTextNode(vCurrent.content[i].name));
		
				}
				vFileExplorer.appendChild(entry);
			}
			vContener.appendChild(vFileExplorer);
		
		
	},
	
	unloadContener : function(){
		var vContener = document.getElementById('fileSelector');
		while(vContener.hasChildNodes()) vContener.removeChild(vContener.firstChild);
	},
	
	updateInputState : function(event){
		var vInput = document.getElementById("pathInput").value;
		if(vInput.lastIndexOf("/")==vInput.length-1){
			document.getElementById("finalizeUpload").disabled=true;
		}
		else
			{
			document.getElementById("finalizeUpload").disabled=false;
		}
	
	}
}



