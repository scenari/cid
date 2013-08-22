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
		this.fFd = new FormData();
		this.fNegociation = pNegociation;
		this.fUrl;
		this.fMultipartField;
		this.fMethod;
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
	
	this.fMultipartField = this.fNode.getAttribute("multipartField");
	
	this.fMethod = this.fNode.getAttribute("method");
	
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
	this.fXhr.open(this.fMethod, this.fUrl);
	
	document.getElementById("pushButton").setAttribute("onClick","clientCID.publish();");	

	
	//Init Nego
	switch(this.fNegociation){
		case "frameweb":
			this.fXhr.onreadystatechange = function(){
				if(this.readyState === 4){
					if(this.status < 200 || this.status >= 300){
						window.alert("Error during package sending "+this.status);
						document.fProtocol.init();
					}
					else{
						var vUrlCheck = /^http:\/\/.*/;
						var vUrl = this.getResponseHeader("Location");
						if(!vUrlCheck.test(vUrl)){
							if(vUrl.charAt(0)=='/')
								vUrl = "http://"+document.fProtocol.fUrl.split("/")[2] + vUrl;
							else if(vUrl.charAt(0)=='.'){
								vLastUrl = document.fProtocol.fUrl.split("/");
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
	this.fFd.append(this.fMultipartField, document.getElementById("file").files[0]);
	this.fXhr.send(this.fFd);
}



var clientCID = {	

	fManifest : {},
	
	fNamespace : {},
	
	fSupportedAuths : [{fName : "basicHttp", fAuth : function(){return new cidLib.basicHttpAuth()}}],
	
	fSupportedProtocols : [{fName : "singleHttpRequest", fProtocol : function(){return new cidLib.singleHttpRequest("frameweb");}}],
	
	getManifest : function(){
		var vXhr = clientCID.getHttpRequest();		
		vXhr.onreadystatechange = function() {
			if(vXhr.readyState === 4 ){

				if(vXhr.responseXML && vXhr.status === 200){
					clientCID.fManifest = vXhr.responseXML;
					clientCID.fNamespace = clientCID.fManifest.firstChild.getAttribute("xmlns:cid");
					var vFoundAuth;
					var vFoundProtocol;
					//Auth choice
					//For each supported auth
					for (var i = 0; i < clientCID.fSupportedAuths.length; i++) {
						//if this auth is supported by the server
						var vAuthName = clientCID.fSupportedAuths[i].fName;
						var vAuthNodes = clientCID.fManifest.getElementsByTagNameNS(clientCID.fNamespace,vAuthName);
						if(vAuthNodes.length != 0){
							//init Auth
							document.fAuth = clientCID.fSupportedAuths[i].fAuth();
							document.fAuth.init(vAuthNodes[0]);
							vFoundAuth = true;
							break;
						}
					}
					if(!vFoundAuth){
						window.alert("No auth found : "+document.document.getElementById("manifestURL").value+" is not yet supported by this client.");
						return;
					}
					//Procol choice
					//For each couple protocol/negociation
					for(var i = 0 ; i < clientCID.fSupportedProtocols.length ; i++){
						if(vFoundProtocol) break;
						var vProtocols = clientCID.fManifest.getElementsByTagNameNS(clientCID.fNamespace,clientCID.fSupportedProtocols[i].fName);
						for (var j = 0; j < vProtocols.length; j++) {
							if(vProtocols[j].getElementsByTagNameNS(clientCID.fNamespace,clientCID.fSupportedProtocols[i].fProtocol.fNegociation)){
								document.fProtocol = clientCID.fSupportedProtocols[i].fProtocol();
								document.fProtocol.init(vProtocols[j]);
								vFoundProtocol = true;
								break;
							}
						}
					}
					if(!vFoundProtocol){
						window.alert("No protocol found :"+document.document.getElementById("manifestURL").value+" is not yet supported by this client.");
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
		//if(document.fAuth.checkAuth && document.fAuth.checkAuth(document.fProtocol.fMethod) || !document.fAuth.checkAuth)
			document.fProtocol.publish(document.fAuth);
		//else
		//	window.alert("Authentication error.")
	},
	
	getHttpRequest : function() {
		if (window.XMLHttpRequest
				&& (!window.location.protocol == "file:" || !window.ActiveXObject))
			return new XMLHttpRequest();
		else
			return new ActiveXObject("Microsoft.XMLHTTP");
	}
};