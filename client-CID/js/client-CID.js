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

var clientCID = {

	fManifest : {},

	getManifest : function() {
		this.initForm();
		var vMethode = "GET" ; var vUrl = document.getElementById("uri").value;
		vXmlhttp = this.getHttpRequest(vMethode, vUrl);
		vXmlhttp.open(vMethode, vUrl);
		vXmlhttp.send();

		// vXmlhttp.withCredentials = true;
		// Response handlers.
		vXmlhttp.onload = function() {
			clientCID.fManifest = vXmlhttp.responseXML;
			clientCID.prepareRequest();
		};

		vXmlhttp.onerror = function() {
			alert('Woops, there was an error making the request.');
		};
	},

	push : function(method, url) {

		var fd = new FormData();
		vXmlhttp = this.getHttpRequest();
		var field = document.getElementById("file");
		fd.append("upload", field.files[0]);

		vXmlhttp.open(method, url);
		vXmlhttp.onload = function(){
			if(urlToLoad)
				document.location.href = urlToLoad;
			else{
				var isHtml = /<\!DOCTYPE HTML(.|\n)+<\/html>$/mi;
				if(isHtml.test(vXmlhttp.response)){
					document.write(vXmlhttp.response);
				}
			}
		}
		vXmlhttp.onreadystatechange = clientCID.triggered;
				
		var authNode = xmlNode.firstChild(xmlNode.firstChild(xmlNode
				.firstChild(clientCID.fManifest)));
		switch (authNode.nodeName) {
			case "cid:basicHttp":
				var auth = this.makebaseAuth(document.getElementById("user").value,
						document.getElementById("password").value);
				vXmlhttp.setRequestHeader('Authorization', auth);
	
				break;
			case "cid:none":
				break;
	
			default:
				window.alert("Erreur dans la description de l'authentification du manifest");
				break;
		}

		vXmlhttp.send(fd);
	},
	

	prepareRequest : function() {
		//Récupération et traitement de la méthode d'envoie
		var vMethod = xmlNode.firstChild(xmlNode.childNodes(xmlNode
				.firstChild(clientCID.fManifest))[2]);
		switch (vMethod.nodeName) {
			case "cid:singleHttpRequest":
				document.getElementById("pushButton").setAttribute("onClick","clientCID.push(\""+
						vMethod.getAttribute("method")+"\",\""+vMethod.getAttribute("url")+"\")");	
				break;
				
			default:
				window.alert("L'envoi décrit dans le manifest n'est pas compatible avec le client.");
				break;
		}
		
		var vAuth = xmlNode.firstChild(xmlNode.firstChild(xmlNode
				.firstChild(clientCID.fManifest)));
		switch (vAuth.nodeName) {

			case "cid:basicHttp":
				document.getElementById("auth").style.display = "";
				document.getElementById("push").style.display = "";
	
				break;
			case "cid:none":
				document.getElementById("push").style.display = "";
	
				break;
	
			default:
				window.alert("Erreur dans la description de l'authentification du manifest");
				break;

		}
		
		var vNego = xmlNode.firstChild(xmlNode.firstChild(vMethod));
		urlToLoad = null;
		switch(vNego.nodeName){	
			case "cid:frameweb":
			break;
			
			default:
			break;
			
		}

	},

	makebaseAuth : function(user, password) {
		var tok = user + ':' + password;
		var hash = Base64.encode(tok);
		return "Basic " + hash;
	},

	getHttpRequest : function() {
		if (window.XMLHttpRequest
				&& (!window.location.protocol == "file:" || !window.ActiveXObject))
			return new XMLHttpRequest();
		else
			return new ActiveXObject("Microsoft.XMLHTTP");
	},

	createCORSRequest : function(method, url) {
		var xhr = new XMLHttpRequest();
		if ("withCredentials" in xhr) {

			// Check if the XMLHttpRequest object has a "withCredentials"
			// property.
			// "withCredentials" only exists on XMLHTTPRequest2 objects.
			xhr.open(method, url, true);

		} else if (typeof XDomainRequest != "undefined") {

			// Otherwise, check if XDomainRequest.
			// XDomainRequest only exists in IE, and is IE's way of making CORS
			// requests.
			xhr = new XDomainRequest();
			xhr.open(method, url);

		} else {

			// Otherwise, CORS is not supported by the browser.
			xhr = null;

		}
		return xhr;
	},
	initForm : function(){
		document.getElementById("auth").style.display = "none";
		document.getElementById("push").style.display = "none";
	}

};

var xmlNode = {
	firstChild : function(pNode) {
		for ( var i = 0; i < pNode.childNodes.length; i++) {
			if (pNode.childNodes[i].nodeType == 1)
				return pNode.childNodes[i];
		}
		return null;
	},
	childNodes : function(pNode) {
		var vChildren = [];
		for ( var i = 0; i < pNode.childNodes.length; i++) {
			if (pNode.childNodes[i].nodeType == 1)
				vChildren.push(pNode.childNodes[i]);
		}
		return vChildren;
	},
	nextSibling : function(pNode) {
		var vActualNodeFound = false;
		for ( var i = 0; i < pNode.parent.childNodes.length; i++) {
			if (pNode.parent.childNodes[i] == pNode)
				vActualNodeFound = true
			if (vActualNodeFound && pNode.parent.childNodes[i].nodeType == 1)
				return pNode.parent.childNodes[i];
		}
		return null
	},
	previsouSibling : function(pNode) {
		var vPreviousSibling = null;
		for ( var i = 0; i < pNode.parent.childNodes.length; i++) {
			if (pNode.parent.childNodes[i] == pNode)
				return vPreviousSibling;

			if (pNode.parent.childNodes[i].nodeType == 1)
				vPreviousSibling = pNode.parent.childNodes[i];
		}
		return null
	}

}