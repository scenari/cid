/*
 * LICENCE[[ Version: MPL 1.1/GPL 2.0/LGPL 2.1/CeCILL 2.O
 * 
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
 * the specific language governing rights and limitations under the License.
 * 
 * The Original Code is kelis.fr code.
 * 
 * The Initial Developer of the Original Code is sylvain.spinelli@kelis.fr
 * 
 * Portions created by the Initial Developer are Copyright (C) 2011 the Initial
 * Developer. All Rights Reserved.
 * 
 * Contributor(s): thibaut.arribe@kelis.fr
 * 
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"), or
 * the CeCILL Licence Version 2.0 (http://www.cecill.info/licences.en.html), in
 * which case the provisions of the GPL, the LGPL or the CeCILL are applicable
 * instead of those above. If you wish to allow use of your version of this file
 * only under the terms of either the GPL or the LGPL, and not to allow others
 * to use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under the
 * terms of any one of the MPL, the GPL, the LGPL or the CeCILL. ]]LICENCE
 */

var cidLib = {
	//Auths
	
	basicHttpAuth : function(){
		this.fName = "basicHttp";
		
		this.init = function(pNode){
			document.getElementById("auth").style.display = "";
			if(pNode.hasAttribute("testUrl")){
				this.fTestUrl = pNode.getAttribute("testUrl");
				this.checkAuth = function(pMethod){
					var vXhr = clientCID.getHttpRequest();
					vXhr.open(pMethod, this.fTestUrl, false);
					vXhr.send();
					if(vXhr.readyState === 4 && vXhr.status === 200) return true;
					else return false;
				}
				this.fTestUrl = pNode.getAttribute("testUrl");
			}
		};
		
		
		this.makeAuth = function(pXhr){
			pXhr.setRequestHeader('Authorization', "Basic " + btoa(document.getElementById("user").value+":"+document.getElementById("password").value), false);
		};
	},

	//Protocols
	singleHttpRequest : function(pNegociation){
		this.fXhr = clientCID.getHttpRequest();
		this.fToSend ;
		this.fNegociation = pNegociation;
		this.fUrl = null;
		this.fMethod = null;
		this.fFileField = null;
		this.fTypeField = null;
		this.fDisposistionField = null;
		this.fNode = null;
	}


}


cidLib.singleHttpRequest.prototype.init = function(pNode){
	if(pNode)
		this.fNode = pNode;

	//Init protocol
	var vUrlCheck = /^http:\/\/.*/;
	this.fUrl = this.fNode.getAttribute("url");
	if(!vUrlCheck.test(this.fUrl)){
		if(this.fUrl.charAt(0)=='/')
			this.fUrl = "http://"+document.fManifestHost + this.fUrl;
		else
			this.fUrl = "http//"+this.fUrl;
	}
			
	this.fXhr.onuploadprogress = function(evt){
		var vPercentComplete = (evt.loaded/ evt.total)*100;
		if(vPercentComplete != 100 && document.getElementById("progress").style.display == "none"){
			document.getElementById("progress").style.display ="";
			document.getElementById("progressLabel").style.display ="";
		}
		
	    document.getElementById("progress").setAttribute( "value", vPercentComplete );
	    
	}
	
	this.fXhr.onload = function(){
	    	document.getElementById("progress").style.display="none";
	    	document.getElementById("progressLabel").style.display="none";
	}
	for (var i = 0; i < this.fNode.childNodes.length; i++) {
		if (this.fNode.childNodes[i].nodeType == 1 && this.fNode.childNodes[i].namespaceURI == "http://www.kelis.fr/cid/v1/core"
				&& (this.fNode.childNodes[i].localName == "post" || this.fNode.childNodes[i].localName == "put")) {
			this.fMethod = this.fNode.childNodes[i].localName;
			if (this.fMethod == "post") {
				this.fFileField = this.fNode.childNodes[i].getAttribute("multipartFileField");
				this.fTypeField = this.fNode.childNodes[i].getAttribute("multipartTypeField");
				this.fDisposistionField = this.fNode.childNodes[i].getAttribute("multipartDispositionField");
			}
		}
	}
		
	this.fXhr.open(this.fMethod, this.fUrl);
	
	document.getElementById("pushButton").setAttribute("onClick","clientCID.publish();");	

	
	//Init Nego
	switch(this.fNegociation){
		case "frameweb":
			this.fXhr.onreadystatechange = function(){
				if(this.readyState === 4){
					if(this.status < 200 || this.status >= 300){
						window.alert("Error during package sending "+this.status);
						document.fTransport.init();
					}
					else{
						var vUrlCheck = /^http:\/\/.*/;
						var vUrl = this.getResponseHeader("Location");
						if(!vUrlCheck.test(vUrl)){
							if(vUrl.charAt(0)=='/')
								vUrl = "http://"+document.fTransport.fUrl.split("/")[2] + vUrl;
							else if(vUrl.charAt(0)=='.'){
								vLastUrl = document.fTransport.fUrl.split("/");
								vBaseUrl = "http://";
								for (var i = 2; i < vLastUrl.length -1; i++) {
									vBaseUrl += vLastUrl[i]+"/";
								}
								vUrl = vBaseUrl + vUrl;
							}
								
						}
						var vXhr = clientCID.getHttpRequest();
						vXhr.open("GET", vUrl);
						document.fAuth.makeAuth(vXhr);
						vXhr.onreadystatechange = function(){
							if(this.readyState === 4){
								window.frames[0].document.write(this.response);
								document.getElementById("negociation").style.display = "";
							}
						}
						vXhr.send();
						
						
					}
				}
			};
		break;
	}
	
	document.getElementById("push").style.display="";

	
};

cidLib.singleHttpRequest.prototype.publish = function(pAuth){
	switch (pAuth.fName){
		case "basicHttp" :
			pAuth.makeAuth(this.fXhr);
			break;
		case "none" :
			break;
	}
	this.fXhr.send(this.fToSend);
}


cidLib.singleHttpRequest.prototype.loadFile = function(pFile){
	var vSimpleContents = clientCID.fManifest.getElementsByTagNameNS(clientCID.fNamespace, "simpleContent");
	var vContentType ;
	for (var i = 0; i < vSimpleContents.length; i++) {
		if(vSimpleContents[i].getAttribute("mimeType") == "*") vContentType = clientCID.makeContentType(vSimpleContents[i]);
		if(vSimpleContents[i].getAttribute("mimeType") == pFile.type ) {clientCID.makeContentType(vSimpleContents[i]); break;}
	}
	

	switch(this.fMethod){
		case "put":
			this.fToSend = pFile;
			this.fXhr.setRequestHeader("Content-Type", vContentType);
			this.fXhr.setRequestHeader("attachment;filename="+pFile.name);
		break;
		
		case "post":
		this.fToSend = new FormData();
			this.fToSend.append(this.fMultipartTypeField, vContentType);
			this.fToSend.append(this.fDisposistionField, "attachment;filename="+pFile.name);
			this.fToSend.append(this.fFileField, pFile);
		break;
	}
}



var clientCID = {	

	fManifest : {},
	
	fNamespace : {},
	
	fComputedManifests : new Array(),
	
	fSupportedAuths : [{fName : "basicHttp", fAuth : function(){return new cidLib.basicHttpAuth()}}],
	
	fSupportedTransports : [{fName : "singleHttpRequest", fTransport : function(){return new cidLib.singleHttpRequest("frameweb");}}],
	
	getManifest : function(){
		var vXhr = clientCID.getHttpRequest();		
			
		vXhr.onreadystatechange = function() {
			if (vXhr.readyState === 4) {
				if (vXhr.responseXML && vXhr.status === 200) {
					clientCID.fManifest = vXhr.responseXML;
					for (var i = 0; i < clientCID.fManifest.childNodes.length; i++) {
						if(clientCID.fManifest.childNodes[i].nodeType == 1){
							clientCID.fNamespace = clientCID.fManifest.childNodes[i].namespaceURI;
							break;
						}
					}
					var vFoundAuth = false;
					var vFoundTransport = false;
					var vFoundContent = false;

					// Auth choice
					// For each supported auth
					for (var i = 0; i < clientCID.fSupportedAuths.length; i++) {
						// if this auth is supported by the server
						var vAuthName = clientCID.fSupportedAuths[i].fName;
						var vAuthNodes = clientCID.fManifest.getElementsByTagNameNS(clientCID.fNamespace,vAuthName);
						if (vAuthNodes.length > 0) {
							// init Auth
							document.fAuth = clientCID.fSupportedAuths[i].fAuth();
							document.fAuth.init(vAuthNodes[0]);
							vFoundAuth = true;
							break;
						}
					}
					// transport choice
					// For each couple transport/negociation
					for (var i = 0; i < clientCID.fSupportedTransports.length; i++) {
						var vTransports = clientCID.fManifest.getElementsByTagNameNS(clientCID.fNamespace,clientCID.fSupportedTransports[i].fName);
						if(vTransports.length > 0){
							document.fTransport = clientCID.fSupportedTransports[i].fTransport();
							document.fTransport.init(vTransports[0]);
							vFoundTransport = true;
							break;
						}
					}
					// check content compatibility			
					if(clientCID.fManifest.getElementsByTagNameNS(clientCID.fNamespace,"simpleContent").length != 0){
						vFoundContent = true;
					}
					
					
					//	document.fContentType = clientCID.makeContentType(vSelectedContent.fContentNode) ;
					//  if(vFoundContent && vFoundTransport) document.fTransport.setContentType(document.fContentType);


					if(!vFoundAuth || !vFoundContent || !vFoundTransport){
						var vMessage = "Content deployment failed. The repository settings are not supported by this client.";
						var vOtherManifests = clientCID.fManifest.getElementsByTagNameNS(clientCID.fNamespace,"otherManifest");
						var vFoundOtherManifest = false;
						for (var i = 0; i < vOtherManifests.length; i++) {
							vFoundOtherManifest = true;
							for (var j = 0; j < clientCID.fComputedManifests.length; j++) {
								var vOtherManifest = vOtherManifests[i].getAttribute("url");
								if(vOtherManifest == clientCID.fComputedManifests[j]){
									vFoundOtherManifest = false;
								}
							}
							if(vFoundOtherManifest) break;
						}
						//Dans le cas où aucun autre manifeste a été trouvé...
						if(!vFoundOtherManifest){
							document.alert(vMessage);
						}
						else{
							vMessage += "\n";
							vMessage += "An other manifest is suggested by the repository. Do you want to try again with it?";
							if(document.confirm(vMessage)){
								clientCID.getManifest(vOtherManifest);
							}
						}
						return;
					}
				}
				else if(vXhr.status != 200){
					window.alert("Error in the manifest response. Check if the URL is correct and if the resource is online");
				}
				else{
					window.alert("The CID manifest is not well-formed.");
				}
			}
		};
		var vUrl = document.getElementById("uri").value.match("http://") ? document.getElementById("uri").value : "http://" + document.getElementById("uri").value ;
		document.fManifestHost = vUrl.split("/")[2];
		vXhr.open("GET", vUrl);
		vXhr.send();
	},
	
	publish : function(){			
		document.fTransport.loadFile(document.getElementById("file").files[0]);
		document.fTransport.publish(document.fAuth);
	},
	
	makeContentType : function(pNode) {
		if (pNode.hasAttribute("useContentType")) return pNode.getAttribute("useContentType");
		else {
			var vContentType = document.fFileMimeType + ";" + pNode.localName;
			for (var i = 0; i < pNode.attributes.length; i++) {
				vContentType += ";" + pNode.attributes[i].name + "=\"" + pNode.attributes[i].value + "\"";
			}
			return vContentType;
		}
	},
	
	getHttpRequest : function() {
		if (window.XMLHttpRequest
				&& (!window.location.protocol == "file:" || !window.ActiveXObject))
			return new XMLHttpRequest();
		else
			return new ActiveXObject("Microsoft.XMLHTTP");
	}
};