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

/**
 * A lib which contains classes, functions or settings dedicated to CID.
 */
cidLib = {
	/**
	 * The list of supported transport.
	 */
	fSupportedTransports : [ 
		{
			fName : "webTransport", fTransport : function(pId) {return { "id" : pId, "transport" : new cidLib.webTransport() } }
		} ],
	/**
	 * List of all the strings used by the client. It is possible to localize the client by
	 * translating these strings.
	 */
	fMessages : [
/* 00 */	"Incorrect login or password.",
			"You do not have the permission to process this step.",
/* O2 */	"The server encountered an internal error. Unable to complete the process",
			"An error occurred in the transaction with the server",
/* 04 */	"The server was unable to complete the CID process.",
			"The received manifest is not well-formed. Make sure that the URL is correct.",
/* 06 */	"Error during the manifest reception. Make sure that the URL is correct.",
			"The downloaded manifest is not conform to the current version of the CID protocol.",
/* 08 */	"The server implements a CID extension. This client is unable to process it.",
			"The manifest is not conform to the CID protocol.",
/* 10 */	"Unable to execute the cid process. Server paramaters are not supported.",
			"The form is not properly completed. The field ",
/* 12 */	" must be filled.", 
			"The CID process was successfully executed.",
/* 14 */	"Parameter: ",
			"Add a parameter",
/* 16 */	"delete",
			"The recieved manifest is not consistent. Please contact the server administrator.",
/* 18 */	"You must choose a file to upload.",
			"The async upload is not yet implemented in this client. Please, contact your administrator to enable direct upload.",
/* 20 */	"Warning, the selected file seems to be not accepted by this server.",
			"The content type of this file is",
/* 22 */	"The server accepts only",
			"Do you still want to send this file."],

	/**
	 * List of known uris. To be recognized by the client, a meta must be associated 
	 * to one or more uris. Set up a name for the meta and a list of the associated
	 * uris to define a prefmeta.
	 */
	fKnownUris : {
		fileName: ["http://purl.org/dc/elements/1.1/title", "http://schema.org/name" ],
		contentType:["http://schema.org/DataType", "http://purl.org/dc/terms/MediaType", "http://purl.org/dc/terms/format"]
		//metaName:["http://schema.org/metaUri"]
	},
	
	/**
	 * Define a prefered value which will be automatically used by the server
	 */
	fPrefMetas : {
		//metaName:["value"]
	},
	/**
	 * Get a name from the fKnownUris table and an URI
	 * @param {String} pUri
	 * @return {String}
	 */
	getMetaName : function(pUri){
		for(var vMeta in cidLib.fKnownUris) 
			for(var i in cidLib.fKnownUris[vMeta]) 
				if(pUri == cidLib.fKnownUris[vMeta][i])
					return vMeta;
		return "unknown";
	},

	/**
	 * URL object factory.
	 */
	buildHttpUrl : function(pUrlBase, pUrl) {
		if (pUrl.match("^https?://")) return new URL(pUrl);
		if (pUrl.charAt(0) == '/') return new URL(pUrlBase.origin + pUrl);
		return new URL(vUrl.href.match(".+/")[0] + pUrl);
	},

	/**
	 * HTTP error handling
	 * 
	 * @param {Number} pStatus
	 * @return {String}
	 */
	messageError : function(pStatus) {
		switch (pStatus) {
		case 401: return cidLib.fMessages[0];
		case 403: return cidLib.fMessages[1];
		case 500: return cidLib.fMessages[2];
		default: return cidLib.fMessages[3] + " (error " + pStatus + ")";
		}
	},
	/**
	 * Search for a child named label.
	 * if not, return the name attribute
	 * if not return the tag name.
	 * @param {Element} pNode
	 * @return {String}
	 */
	getLabel : function(pNode) {
		var vLangs = new Array();
		var vValues = new Array();
		for (var vChild = pNode.firstElementChild; vChild; vChild = vChild.nextElementSibling) {
			if (vChild.localName == "label") {
				vLangs.push(vChild.getAttribute("xml:lang"));
				vValues.push(vChild.textContent);
			}
		}
		// 1 - english
		// 2 - an already used language
		// 3 - already used language set ?
			//yes => use name attribute or localname
			//no => set fisrt lang as set language
		// 4 - use name attribute or localname
		for (var i = 0; i < vLangs.length; i++) if (vLangs[i].match("^en")) return vValues[i];
		for (var i = 0; i < vLangs.length; i++) if (vLangs[i] == cidManager.fLang) return vValues[i];
		if(cidManager.fLang){
			if (pNode.hasAttribute("name")) return pNode.getAttribute("name");
			else return pNode.localName;
		}
		else if(vLangs.length){
			cidManager.fLang = vLangs[0];
			return vValues[0];
		}
		if (pNode.hasAttribute("name")) return pNode.getAttribute("name");
		return pNode.localName;
	},
	/**
	 * Return the values defined in a meta or restriction.
	 * @param {Element} pNode
	 * @return {Array}
	 */
	getValues : function(pNode) {
		var vValues = new Array();
		switch (pNode.localName) {
		case "meta":
			for (var vChild = pNode.firstElementChild; vChild; vChild = vChild.nextElementSibling)
				if (vChild.localName == "value") vValues.push(vChild.textContent);
			break;
		case "restriction":
			vValues.push(pNode.getAttribute("value"));
			break;
		}
		return vValues;
	},
	/**
	 * Get an array of prop name
	 * @param {Element} pNode
	 * @param {String} pArg, attribute where the props name are stored.
	 * @return {Array}
	 */
	getProps : function(pNode, pArg) {
		if (!pNode.hasAttribute(pArg)) return new Array();
		return pNode.getAttribute(pArg).split(" ");
	},
	/**
	 * fired when the file selection of the client changes
	 */
	fileSelectionChange : function(pEvent) {
		var vNextStep = document.getElementById("uploadNextStep");
		vNextStep.setAttribute("disabled", "true");
		if (document.getElementById("fileForm").files.length) vNextStep.removeAttribute("disabled");
	}

};

/**
 * Web transport class.
 * This object handle the request to the server.
 */
cidLib.webTransport = function() {
	//Force cookies in CORS context (withCredential XMLHTTPRequest attribute)
	this.fCookieAware = null;
	//Desc of the supported features of web exchange
	this.fExchange = null;
	//Desc of the supported features of web upload
	this.fUpload = null;
	//Desc of the supported features of web Interact
	this.fInteract = null;
	//Auth object
	this.fAuth = null;
}

/**
 * Send upload request
 * @param {Element} pStep, the XML element which describes the step
 */
cidLib.webTransport.prototype.upload = function(pStep) {
	//Handle authentication
	if(this.fAuth && !this.fAuth.processed){
		this.fAuth.processed = "true";
		if(this.fAuth.method == "interact" ) this.interact(this.fAuth);
		else if(this.fAuth.method == "basic") cidManager.changePanel("auth");
		return;
	}
	
	//Upload
	this.fUpload.step = pStep;
	var vUrl = cidLib.buildHttpUrl(cidManager.fManifestURL, pStep.node.getAttribute("url"));
	var vXhr = new XMLHttpRequest();
	if(this.fCookieAware) vXhr.withCredentials = true;
	// Preprocessing of params if the only prop storage possiblity is
	// querystring
	var vParams = { fUrl : vUrl, fCbType : "makeQueryString" }
	vUrl = this.processParam(this.fUpload, vParams).fUrl;
	vXhr.open(this.fUpload.method, vUrl);
	if (this.fAuth && this.fAuth.method == "basic") this.fAuth.makeAuth(vXhr, "xhr");
	var vReturn = this.makeContentToSend(this.fUpload, vXhr);
	vXhr = vReturn.fXhr;
	var vContentToSend = vReturn.fContentToSend;

	vXhr.onuploadprogress = function(evt) {
		document.getElementById("uploadMeter").value = evt.loaded / evt.total * 100;
	};

	vXhr.onreadystatechange = function(evt) {
		try {
			if (vXhr.readyState == 4) {
				document.getElementById("uploadMeter").value = 100;
				if (vXhr.status == 401 && location.host != vUrl.host) cidManager.changePanel("auth")
				else if (vXhr.status && (vXhr.status < 200 || vXhr.status >= 300)) {
					var vPar = document.createElement("p").appendChild(document.createTextNode(cidLib.messageError(vXhr.status)));
					document.getElementById("end").appendChild(vPar);
					cidManager.changePanel("end");
				} else {
					if (vXhr.response) cidManager.fProcess.transport.getReturnedProperties(pStep.returnMetas, JSON.parse(vXhr.response));
					cidManager.cbExecutedStep();
				}
			}
		} catch (e) {
			console.log("uploadcb::" + e);
		}
	}

	vXhr.send(vContentToSend);
}


/**
 * send an exchange request.
 * @param {element} pStep, the XML element which describes the step
 */
cidLib.webTransport.prototype.exchange = function(pStep) {
	//process authentication
	if(this.fAuth && !this.fAuth.processed){
		this.fAuth.processed = "true";
		if(this.fAuth.method == "interact" ) this.interact(this.fAuth);
		else if(this.fAuth.method == "basic") cidManager.changePanel("auth");
		return;
	}
	this.fExchange.step = pStep;
	var vUrl = cidLib.buildHttpUrl(cidManager.fManifestURL, pStep.node.getAttribute("url"));
	var vXhr = new XMLHttpRequest();
	if(this.fCookieAware) vXhr.withCredentials = true;
	// Preprocessing of params if the only prop storage possiblity is
	// querystring
	var vParams = { fUrl : vUrl, fCbType : "makeQueryString" }
	vUrl = this.processParam(this.fExchange, vParams).fUrl;
	vXhr.open(this.fExchange.method, vUrl);
	if (this.fAuth && this.fAuth.method == "basic") this.fAuth.makeAuth(vXhr, "xhr");
	var vReturn = this.makeContentToSend(this.fExchange, vXhr);
	vXhr = vReturn.fXhr;
	var vContentToSend = vReturn.fContentToSend;

	vXhr.onreadystatechange = function(evt) {
		try {
			if (vXhr.readyState == 4) {
				if (vXhr.status == 401 && location.host != vUrl.host) cidManager.changePanel("auth")
				else if (vXhr.status && (vXhr.status < 200 || vXhr.status >= 300)) window.alert(cidLib.messageError(vXhr.status));
				else {
					if (vXhr.response) cidManager.fProcess.transport.getReturnedProperties(pStep.returnMetas, JSON.parse(vXhr.response));
					cidManager.cbExecutedStep();
				}
			}
		} catch (e) {
			console.log("exchangecb::" + e);
		}
	}
	vXhr.send(vContentToSend);
}

/**
 * init an interaction step
 * @param {Element} pStep, the XML element which describes the step
 */
cidLib.webTransport.prototype.interact = function(pStep) {
	//handle authentication
	if(this.fAuth && !this.fAuth.processed){
		this.fAuth.processed = "true";
		if(this.fAuth.method == "interact" ) this.interact(this.fAuth);
		else if(this.fAuth.method == "basic") cidManager.changePanel("auth");
		return;
	}
	
	this.fInteract.step = pStep;
	var vUrl = cidLib.buildHttpUrl(cidManager.fManifestURL, pStep.node.getAttribute("url"));
	var vInteractIFrame = document.getElementById("frame");
	vInteractIFrame.addEventListener("load", this.frameLoaded, true);
	if (this.fInteract.method == "POST") {
		var vDocument = vInteractIFrame.contentWindow.document;
		var vForm = vDocument.createElement("form");
		vForm.setAttribute("action", vUrl);
		vForm.setAttribute("method", this.fInteract.method);
		vForm.setAttribute("enctype", this.fInteract.body);
		var vParams = { fForm : vForm, fCbType : "feedInteractForm" };
		vParams = this.processParam(this.fInteract, vParams);
		vDocument.body.appendChild(vParams.fForm);
		if (this.fAuth && this.fAuth.method == "basic") this.fAuth.makeAuth(vParams.fForm, "form");
		vParams.fForm.submit();
	} else {
		var vParams = { fUrl : vUrl, fCbType : "makeQueryString" };
		vParams = this.processParam(this.fInteract, vParams);
		vInteractIFrame.setAttribute("src", vParams.fUrl);
	}
	cidManager.changePanel("interact");
}

/**
 * Init the webTransport object
 * @param {Element} pNode
 */
cidLib.webTransport.prototype.init = function(pNode) {
	this.fCookieAware = pNode.getAttribute("needCookies");
	var vProperties = pNode.getAttribute("sessionProperties");
	if (vProperties) this.fSessionProperties = vProperties.split(" ");
	else this.fSessionProperties = new Array();
	
	for (var vChild = pNode.firstElementChild; vChild; vChild = vChild.nextElementSibling) {
		if (vChild.namespaceURI != cidManager.fNamespace) return;
		switch (vChild.localName) {
		case "authentications":
			switch (vChild.firstElementChild.localName){
				case "basicHttp":
					this.fAuth = location.host != cidManager.fManifestURL.host ? new cidLib.basicAuth() : null;
				break;
				
				case "webAuthentication":
					this.fAuth = {
						"method" : "interact",
						"node" : vChild.firstElementChild,
						"needMetas" : new Array(),
						"useMetas" : new Array(),
						"returnMetas" : new Array() 
					}
				break;
				
				//default => fAuth still init to null;
					
			}
			break;
			
		case "webExchange":
			if (!this.fExchange) {
				this.fExchange = this.initMethod(vChild.firstElementChild);
				this.fExchange.encloseContent = false;
			}
			break;

		case "webInteract":
			if (!this.fInteract) {
				this.fInteract = this.initMethod(vChild.firstElementChild);
				this.fInteract.encloseContent = false;
			}
			break;

		case "webUpload":
			if (!this.fUpload) {
				this.fUpload = this.initMethod(vChild.firstElementChild);
				this.fUpload.encloseContent = true;
			}

			break;
		}
	}
}

/**
 * Init the properties of a method
 * @param {Element} pMethod, the XML element which describes the method
 * @return {Object} a js object which contains all the params of the method.
 * This object is then stored in the fExchange, fUpload or fInteract field.
 */
cidLib.webTransport.prototype.initMethod = function(pMethod) {
	var vMethod = pMethod.getAttribute("method");
	var vProperties = pMethod.getAttribute("properties").split(" ");
	var vContent;
	if (vMethod == "PUT" || vMethod == "POST" || vMethod == "GET") {
		vContent = "body";
		for (var i = 0; i < vProperties.length; i++)
			if (vProperties[i] == "post") vProperties.splice(i, 1);
	} else if (vMethod == "POST;application/x-www-form-urlencoded" || vMethod == "POST;multipart/form-data") {
		vContent = vMethod.split(";")[1];
		vMethod = "POST";
	}
	return { "method" : vMethod, "properties" : vProperties, "content" : vContent };
}

/**
 * Feed all the needed or used metas.
 * @param {Object} The method description (fUpload, fInteract or fExchange)
 * @param {Object} pParams, an object which specify the cb type and provides required params (url, form, ...)
 * @return {Object} the enriched pParams object.
 */
cidLib.webTransport.prototype.processParam = function(pContext, pParams) {
	for (var i = 0; i < pContext.step.needMetas.length; i++) {
		var vPropName = pContext.step.needMetas[i];
		var vValues = cidManager.fProperties.getPropArray(vPropName);
		if (vValues.length && !cidManager.userOverloadedPrefMeta(cidManager.getMetaDesc(vPropName))) for (var j = 0; j < vValues.length; j++)
			pParams = this.processParamCB(pContext, pParams, vValues[j].name, vValues[j].value);
		else {
			var vMetaForms = document.getElementsByClassName(vPropName);
			for (var j = 0; j < vMetaForms.length; j++)
				pParams = this.processParamCB(pContext, pParams, vPropName, vMetaForms[j].value);
		}
	}

	for (var i = 0; i < pContext.step.useMetas.length; i++) {
		var vValues = cidManager.fProperties.getPropArray(pContext.step.useMetas[i]);
		for (var j = 0; j < vValues.length; j++)
			pParams = this.processParamCB(pContext, pParams, vValues[j].name, vValues[j].value);
	}

	for (var i = 0; i < this.fSessionProperties.length; i++) {
		var vValues = cidManager.fProperties.getPropArray(this.fSessionProperties[i]);
		for (var j = 0; j < vValues.length; j++)
			pParams = this.processParamCB(pContext, pParams, vValues[j].name, vValues[j].value);
	}

	return pParams;
}

/**
 * Call back of process Param
 * @param {Object} pContext, fInteract, fUpload or fExchange
 * @param {Object} pParams, the params object
 * @param {String} pName, name of the property
 * @param {String} pValue, value of the property
 * @return {Object} the enriched pParams object
 */
cidLib.webTransport.prototype.processParamCB = function(pContext, pParams, pName, pValue) {
	switch (pParams.fCbType) {
	case "makeQueryString":
		return this.addQueryString(pContext, pName, pValue, pParams);
		break;
	case "makeContentToSend":
		return this.addMeta(pContext, pName, pValue, pParams);
		break;
	case "feedInteractForm":
		return this.addMetaToForm(pName, pValue, pParams);
		break;
	}
}

/**
 * Build a valid content to send in the request.
 * @param {object} pContext, context of the request (fInteract, fUpload, fExchange)
 * @param {XMLHttpRequest} pXhr
 * @return {Object} a pParams object
 */
cidLib.webTransport.prototype.makeContentToSend = function(pContext, pXhr) {
	var vContentToSend;
	switch (pContext.content) {
	case "body":
		if (pContext.encloseContent) vContentToSend = cidManager.fFile;
		break;
	case "multipart/form-data":
		vContentToSend = new FormData();
		if (pContext.encloseContent) vContentToSend.append("cidContent", cidManager.fFile);
		break;
	}
	var vParams = { fXhr : pXhr, fContentToSend : vContentToSend, fCbType : "makeContentToSend" }
	vParams = this.processParam(pContext, vParams);
	return vParams;
}

/**
 * Insert a meta into a form
 * @param {String} pName, name of the property
 * @param {String} pValue, value of the property
 * @param {Object} pParams, the form must be in pParams.fForm
 * @return {Object} the enriched pParams object
 */
cidLib.webTransport.prototype.addMetaToForm = function(pName, pValue, pParams) {
	var vInput = pParams.fForm.ownerDocument.createElement("input");
	vInput.setAttribute("type", "hidden");
	vInput.setAttribute("name", pName);
	vInput.setAttribute("value", pValue);
	pParams.fForm.appendChild(vInput);
	return pParams;
}

/**
 * Add a meta into a Params object
 * @param {Object} pContext, the context object (fInteract, fUpload, fExchange)
 * @param {String} pName, name of the property
 * @param {String} pValue, value of the property
 * @param {Object} pParams
 * @return {Object}, the enriched pParams object.
 */
cidLib.webTransport.prototype.addMeta = function(pContext, pName, pValue, pParams) {
	for (var i = 0; i < pContext.properties.length; i++) {
		if (pContext.properties[i] == "post") {
			switch (pContext.content) {
			case "application/x-www-form-urlencoded":
				pParams.fContentToSend += "&" + encodeURIComponent(pName) + "=" + encodeURIComponent(pValue);
				break;
			case "multipart/form-data":
				pParams.fContentToSend.append(pName, pValue);
				break;
			}
			return pParams;
		}
	}
	for (var i = 0; i < pContext.properties.length; i++) {
		if (pContext.properties[i] == "header") {
			pParams.fXhr.setRequestHeader(pName, pValue);
			return pParams;
		}
	}
}

/**
 * Add a property into an URL as a query string.
 * @param {Object} pContext, the context object
 * @param {String} pName, the name of the property
 * @param {String} pValue, the value of the property
 * @param {Object} pParams,
 * @return {Object} the enriched pParams object
 */
cidLib.webTransport.prototype.addQueryString = function(pContext, pName, pValue, pParams) {
	var vFoundQueryString = false;
	for (var i = 0; i < pContext.properties.length; i++) {
		if (pContext.properties[i] == "post" || pContext.properties[i] == "header") return pParams;
		if (pContext.properties[i] == "queryString") vFoundQueryString = true;
	}
	if (vFoundQueryString) {
		if (pParams.fUrl.search) pParams.fUrl.search += "&";
		pParams.fUrl.search += encodeURIComponent(pName) + "=" + encodeURIComponent(pValue);
	}
	return pParams;
}

/**
 * called when the frame is loaded.
 * Init the message event listener
 */
cidLib.webTransport.prototype.frameLoaded = function(pEvent) {
	window.addEventListener("message", cidManager.fProcess.transport.eventHandler, false);
}

/**
 * Called by the HTML loaded in the frame.
 * @param {} pEvent
 */
cidLib.webTransport.prototype.eventHandler = function(pEvent) {
	if(pEvent.data.cidInteraction == "ended"){
		
		var vTransport = cidManager.fProcess.transport;
		for (var i = 0; i < vTransport.fInteract.step.returnMetas.length; i++) {
			var vPropName = vTransport.fInteract.step.returnMetas[i];
			cidManager.fProperties.setProp(vPropName, pEvent.data[vPropName]);
		}
		cidManager.nextPanel();
	}
	else if(pEvent.data.cidAuth == "succeeded"){
		cidManager.executeStep();
	}
	else{
		var vPar = document.createElement("p").appendChild(document.createTextNode(cidLib.fMessages[4]));
		document.getElementById("end").appendChild(vPar);
		cidManager.changePanel("end");
	}
}

/**
 * Get the returned properties from the XMLHttpRequest.
 * @param {Array} pProps, the props to get back
 * @param {Object} pXhrResponse, the parsed XHR response
 */
cidLib.webTransport.prototype.getReturnedProperties = function(pProps, pXhrResponse) {
	for (var i = 0; i < pProps.length; i++)
		cidManager.fProperties.setProp(pProps[i], pXhrResponse[pProps[i]]);
	for (var i = 0; i < this.fSessionProperties.length; i++)
		cidManager.fProperties.setProp(this.fSessionProperties[i], pXhrResponse[this.fSessionProperties[i]]);
}

/**
 * Properties queue. 
 * Each entry is stored as following {"name" : "Nom-Prop", "value" : "valeur-Prop"}
 */
cidLib.PropertiesQueue = function() {
	this.properties = new Array();
}
cidLib.PropertiesQueue.prototype.removeProp = function(pName) {
	for (var i = 0; i < this.properties.length; i++)
		if (this.properties[i].name == pName) this.properties.splice(i, 1);
}
cidLib.PropertiesQueue.prototype.reset = function() {
	this.properties = new Array();
}
cidLib.PropertiesQueue.prototype.setProp = function(pName, pValue) {
	this.removeProp(pName);
	this.addProp(pName, pValue);
}
cidLib.PropertiesQueue.prototype.addProp = function(pName, pValue) {
	this.properties.push({ "name" : pName, "value" : pValue });
}
cidLib.PropertiesQueue.prototype.contains = function(pName) {
	for (var i = 0; i < this.properties.length; i++)
		if (this.properties[i].name == pName) return true;
	return false;
}
cidLib.PropertiesQueue.prototype.getPropArray = function(pName) {
	var vReturn = new Array();
	for (var i = 0; i < this.properties.length; i++)
		if (this.properties[i].name == pName) vReturn.push(this.properties[i]);
	return vReturn;
}

/**
 * Process class.
 * A process object is associated with a process defined by the manifest.
 */
cidLib.Process = function() {
	this.steps = new Array();
	this.nextStep = 0;
}

/**
 * get the next step to process
 */
cidLib.Process.prototype.getNextStep = function() {
	if (this.nextStep < this.steps.length) return this.steps[this.nextStep];
	return null;
}

cidLib.Process.prototype.stepProcessed = function() {
	this.nextStep++;
}
/**
 * get the required properties for the next step
 */
cidLib.Process.prototype.getneedMetas = function() {
	return this.steps[this.nextStep].needMetas;
}

cidLib.Process.prototype.push = function(pObject) {
	this.steps.push(pObject);
}

cidLib.Process.prototype.debug = function() {
	log.info("cid ::: debug process structure");
	log.info(log.listProperties(this));
	for (var i = 0; i < this.steps.length; i++) {
		log.info("::::::::::::: STEP ::::::::::::");
		log.info(log.listProperties(this.steps[i]));
	}
}

cidLib.basicAuth = function() {
	this.fUsername = "";
	this.fPassword = "";
	this.method = "basic";
}

cidLib.basicAuth.prototype.makeAuth = function(pParam, pType) {
	if(pType == "xhr") pParam.setRequestHeader('Authorization', "Basic " + btoa(this.fUsername + ":" + this.fPassword));
	if(pType == "form"){
		var vInput = pParams.ownerDocument.createElement("input");
		vInput.setAttribute("type", "hidden");
		vInput.setAttribute("name", "username");
		vInput.setAttribute("value", this.fUsername);
		pParams.appendChild(vInput);
		
		vInput = pParams.ownerDocument.createElement("input");
		vInput.setAttribute("type", "hidden");
		vInput.setAttribute("name", "password");
		vInput.setAttribute("value", this.fPassword);
		pParams.appendChild(vInput);
	}
};

cidLib.basicAuth.prototype.setAuth = function() {
	this.fUsername = document.getElementById("login").value;
	this.fPassword = document.getElementById("password").value;
	cidManager.executeStep();
}

cidLib.basicAuth.prototype.init = function() {}

cidManager = { 

fManifestURL : null,

fNamespace : null,
/**
 * List of supported transports
 */
fTransports : null,
/**
 * 
 * List of known propertie.
 */
fProperties : new cidLib.PropertiesQueue(),
/**
 * Selected process
 */
fProcess : null,
/**
 * List of meta already overloaded by the user
 */
fUserOverloadedMeta : new Array(),
/**
 * List of meta specified in the manifest.
 */
fMetas : new Array(),
/**
 * list of restrictions
 */
fRestriction : new Array() }

/**
 * get a new manifest.
 */
cidManager.getManifest = function() {
	var vXhr = new XMLHttpRequest();
	this.fManifestURL = new URL(document.getElementById("manifestURL").value.match("^https?://") ? 
		document.getElementById("manifestURL").value : "http://" + document.getElementById("manifestURL").value);

	vXhr.open("GET", this.fManifestURL);

	vXhr.onreadystatechange = function(evt) {
		try {
			if (vXhr.readyState == 4) {
			    if (vXhr.responseXML && vXhr.status === 200) cidManager.init(vXhr.responseXML);
				else if (!vXhr.responseXML) window.alert(cidLib.fMessages[5]);
				else window.alert(cidLib.messageError(vXhr.status));
			}
		} catch (e) {
			console.log("getManifest::" + e);
			window.alert(cidLib.fMessages[6]);
		}
	}
	vXhr.send();
}

/**
 * Init a new manifest.
 * @param {document} pManifest, the manifest
 */
cidManager.init = function(pManifest) {
	var vRoot = pManifest.firstElementChild;
	if (vRoot.namespaceURI != "http://www.cid-protocol.org/schema/v1/core") {
		window.alert(cidLib.fMessages[7]);
		return false;
	}
	this.fManifest = pManifest;
	this.fNamespace = vRoot.namespaceURI;
	this.fAcceptedProcesses = new Array();

	for (var vChild = vRoot.firstElementChild; vChild != null; vChild = vChild.nextElementSibling) {
		if (vChild.namespaceURI != this.fNamespace) window.alert(cidLib.fMessages[8]);
		switch (vChild.localName) {
		case "process":
			this.fAcceptedProcesses.push(vChild);
			break;
		case "transports":
			var vFoundTransport = false;
			this.fTransports = new Array();
			for (var j = 0; j < cidLib.fSupportedTransports.length; j++) {
				var vTransports = this.fManifest.getElementsByTagNameNS(this.fNamespace,cidLib.fSupportedTransports[j].fName);
				for (var k = 0; k < vTransports.length; k++) {
					this.fTransports.push(cidLib.fSupportedTransports[j].fTransport(vTransports[k].getAttribute("id")));
					this.fTransports[this.fTransports.length - 1].transport.init(vTransports[k]);
					vFoundTransport = true;
				}
			}
			break;

		default:
			window.alert(cidLib.fMessages[9]);
			return;
		}
	}
	if (!vFoundTransport) window.alert(cidLib.fMessages[10]);
	else this.refineAcceptedProcesses();
}

/**
 * Erase the invalid processes.
 */
cidManager.refineAcceptedProcesses = function() {
	try {
		for (var i = 0; i < this.fAcceptedProcesses.length; i++)
			if (!this.isValidProcess(this.fAcceptedProcesses[i])) this.fAcceptedProcesses.splice(i--, 1);

		switch (this.fAcceptedProcesses.length) {
		case 0:
			window.alert(cidLib.fMessages[10]);
			return false;
			break;
		case 1:
			this.initProcess(this.fAcceptedProcesses[0]);
			return this.executeNextStep();
			break;
		default:
			var vRadioGroup = document.getElementById("processSelRadioGroup");
			while (vRadioGroup.hasChildNodes()) vRadioGroup.removeChild(vRadioGroup.firstChild);
			for (var i = 0; i < this.fAcceptedProcesses.length; i++) {
				var vRadio = document.createElement("radio");
				if (!i) vRadio.setAttribute("selected", true);
				vRadio.setAttribute("label", cidLib.getLabel(this.fAcceptedProcesses[i]));
				vRadioGroup.appendChild(vRadio);
			}
			this.changePanel("processSelection");
			break;
		}
	} catch (e) {
		console.log("RefineAcceptedProcess::" + e);
	}
}

/**
 * Method which check the validity of a process.
 * @param {Element} pProcess
 * @return {Boolean}
 */
cidManager.isValidProcess = function(pProcess) {
	if (pProcess.hasAttribute("transports")) {
		var vFoundTransport = false;
		var vTransportIds = pProcess.getAttribute("transports").split(" ");
		for (var i = 0; i < vTransportIds.length; i++) {
			var vTransport = this.getTransport(vTransportIds[i]);
			if (vTransport)
			// no support of AsyncUpload.
			if (pProcess.getElementsByTagNameNS(this.fNamespace, "upload").length && vTransport.fUpload == null) {
				window.alert(cidLib.fMessages[19]);
				return false;
			} else
			/* end */vFoundTransport = true;
		}
		if (!vFoundTransport) return false;
	} else if (!this.getTransport()) return false;
	// no support of async upload
	var vFoundTransport = false;
	for (var i = 0; i < this.fTransports.length; i++) {
		if (pProcess.getElementsByTagNameNS(this.fNamespace, "upload").length == 0
				|| this.fTransports[i].transport.fUpload) var vFoundTransport = true;
	}
	if (!vFoundTransport) {
		window.alert(cidLib.fMessages[19]);
		return false;
	}
	// end
	return true;
}

/**
 * Init the process from the XML node
 * @param {Element} pProcess
 */
cidManager.initProcess = function(pProcess) {
	var vTransport;
	if (pProcess.hasAttribute("transports")) {
		var vTransportIds = pProcess.getAttribute("transports").split(" ");
		for (var i = 0; i < vTransportIds.length; i++)
			if (vTransport = this.getTransport(vTransportIds[i])) break;
	} else vTransport = this.getTransport();

	this.fProcess = new cidLib.Process();
	this.fProcess.transport = vTransport
	this.fProcess.node = pProcess;

	for (var vChild = pProcess.firstElementChild; vChild; vChild = vChild.nextElementSibling) {
		if (vChild.localName == "meta") this.fMetas.push(vChild);
		else if (vChild.localName == "restriction") this.fRestriction.push(vChild);
		else if (vChild.localName == "exchange" || vChild.localName == "interact" || vChild.localName == "upload") 
			this.fProcess.push({
					"node" : vChild, "needMetas" : cidLib.getProps(vChild, "needMetas"),
					"useMetas" : cidLib.getProps(vChild, "useMetas"),
					"returnMetas" : cidLib.getProps(vChild, "returnMetas") 
			});
	}
}

/**
 * Called by the HTML code in order to execute the next step.
 * @param {String} pFrom
 */
cidManager.pageAdvanced = function(pFrom) {
	try {
		switch (pFrom) {
		case "processSelection":
			var selIndex = document.getElementById("processSelRadioGroup").selectedIndex;
			this.initProcess(this.fAcceptedProcesses.splice(selIndex, 1)[0]);
			this.executeNextStep();
			break;
		case "params":
			if (this.fMetasInForm) {
				for (var i = 0; i < this.fMetasInForm.length; i++) {
					var vName = this.fMetasInForm[i].getAttribute("name");
					var vCard = this.fMetasInForm[i].getAttribute("cardinality");
					var vValues = new Array();
					var vMetaForms = document.getElementsByClassName(vName);
					for (var i = 0; i < vMetaForms.length; i++)
						if (vMetaForms[i].value) vValues.push(vMetaForms[i].value)
					if ((vCard == 1 || vCard == "+") && !vValues.length) {
						window.alert(cidLib.fMessages[11] + vName + cidLib.fMessages[12]);
						return;
					}

					if (vValues.length) {
						this.fProperties.removeProp(vName);
						for (var i = 0; i < vValues.length; i++)
							this.fProperties.addProp(vName, vValues[i]);
						this.fUserOverloadedMeta.push(vName);
					}
				}
			}
			this.executeStep();
			break;

		case "interactPage":
			this.fProcess.stepProcessed();
			if (this.fProcess.getNextStep()) this.executeNextStep();
			else {
				this.fSuccess = true;
				this.changePanel("end");
				var vPar = document.createElement("p").appendChild(document.createTextNode(cidLib.fMessages[13]));
				document.getElementById("end").appendChild(vPar);
			}
			break;
		}
	} catch (e) {
		console.log("pageAdvanced::" + e);
	}
}

/**
 * Build a HTML form to let the user to fill the unkwnown metas
 * @param {Array} pProps
 * @param {String} pLabel
 */
cidManager.makeSettingsPage = function(pProps, pLabel) {
	try {
		var vContainer = document.getElementById("paramsContainer");
		while (vContainer.hasChildNodes())
			vContainer.removeChild(vContainer.firstChild);
		var vTitle = document.createElement("h2");
		vTitle.appendChild(document.createTextNode("Settings: " + pLabel));
		vContainer.appendChild(vTitle);
		var vShowContainer = false;
		for (var i = 0; i < pProps.length; i++) {
			var vPropName = pProps[i].getAttribute("name");
			var vPref = this.getPrefMetas(pProps[i]);
			if (!vPref || vPref && this.userOverloadedPrefMeta(pProps[i])) {
				vShowContainer = true;
				var vCard = pProps[i].getAttribute("cardinality");
				if (!vCard) vCard = "1";
				switch (vCard) {
				case "1":
					var vPar = document.createElement("p");
					var vLabel = document.createElement("label");
					vLabel.appendChild(document.createTextNode(cidLib.getLabel(pProps[i]) + ": "));
					vLabel.setAttribute("for", vPropName + "_container");
					vPar.appendChild(vLabel);
					vPar.appendChild(this.makeSettingEntry(pProps[i]));
					vContainer.appendChild(vPar);
					break;
				case "*":
					var vFiedSet = document.createElement("fieldset");
					var vLegend = document.createElement("legend");
					var vCheckbox = document.createElement("input");
					vCheckbox.id = "checkbox_" + vPropName;
					vCheckbox.setAttribute("type", "checkbox");
					vCheckbox.setAttribute("checked", "checked");
					vCheckbox.setAttribute("onclick", "cidManager.disabledChildren(document.getElementById('"
							+ vPropName + "_entriesContainer'),!this.checked);");
					vLegend.appendChild(vCheckbox);
					var vCheckboxLabel = document.createElement("label");
					vCheckboxLabel.appendChild(document.createTextNode(cidLib.getLabel(pProps[i]) + ": "));
					vCheckboxLabel.setAttribute("for", "checkbox_" + vPropName);
					vLegend.appendChild(vCheckboxLabel);
					vFiedSet.appendChild(vLegend);
					var vSubDiv = document.createElement("div");
					vSubDiv.id = vPropName + "_entriesContainer";
					var vHEntryDiv = document.createElement("div");
					var vLabelParam = document.createElement("label");
					vLabelParam.appendChild(document.createTextNode(cidLib.fMessages[14]));
					vLabelParam.setAttribute("for", vPropName + "_container");
					vHEntryDiv.appendChild(vLabelParam);
					vHEntryDiv.appendChild(this.makeSettingEntry(pProps[i]));
					vSubDiv.appendChild(vHEntryDiv);
					var vAddButton = document.createElement("input");
					vAddButton.setAttribute("type", "button");
					vAddButton.setAttribute("value", cidLib.fMessages[15]);
					vAddButton.setAttribute("onclick", "cidManager.addEntry(this.parentNode, this, '" + vPropName+ "');");
					vSubDiv.appendChild(vAddButton);
					vFiedSet.appendChild(vSubDiv)
					vContainer.appendChild(vFiedSet);
					break;
				case "+":
					var vFiedSet = document.createElement("fieldset");
					var vLegend = document.createElement("legend");
					var vLabel = document.createElement("label");
					vLabel.appendChild(document.createTextNode(cidLib.getLabel(pProps[i]) + ": "));
					vLegend.appendChild(vLabel);
					vFiedSet.appendChild(vLegend);
					var vSubDiv = document.createElement("div");
					vSubDiv.id = vPropName + "_container";
					var vHEntryDiv = document.createElement("div");
					var vLabelParam = document.createElement("label");
					vLabelParam.appendChild(document.createTextNode(cidLib.fMessages[14]));
					vHEntryDiv.appendChild(vLabelParam);
					vHEntryDiv.appendChild(this.makeSettingEntry(pProps[i]));
					vSubDiv.appendChild(vHEntryDiv);
					var vAddButton = document.createElement("input");
					vAddButton.setAttribute("type", "button");
					vAddButton.setAttribute("value", cidLib.fMessages[15]);
					vAddButton.setAttribute("onclick", "cidManager.addEntry(this.parentNode, this, '" + vPropName+ "');");
					vSubDiv.appendChild(vAddButton);
					vFiedSet.appendChild(vSubDiv)
					vContainer.appendChild(vFiedSet);
					break;
				case "?":
					var vCheckbox = document.createElement("input");
					vCheckbox.id = "checkbox_" + vPropName;
					vCheckbox.setAttribute("type", "checkbox");
					vCheckbox.setAttribute("checked", "checked");
					vCheckbox.setAttribute("onclick", "cidManager.disabledChildren(document.getElementById('"+ vPropName + "_entryContainer'),!this.checked);");
					vContainer.appendChild(vCheckbox);
					var vCheckboxLabel = document.createElement("label");
					vCheckboxLabel.appendChild(document.createTextNode(cidLib.getLabel(pProps[i]) + ": "));
					vCheckboxLabel.setAttribute("for", "checkbox_" + vPropName);
					vContainer.appendChild(vCheckboxLabel);
					var vEntryContainer = document.createElement("span");
					vEntryContainer.id = vPropName + "_entryContainer";
					vEntryContainer.appendChild(this.makeSettingEntry(pProps[i]));
					vContainer.appendChild(vEntryContainer);
					break;
				}
			}
		}
		vContainer.hidden = !vShowContainer;
		this.fMetasInForm = pProps;
	} catch (e) {
		console.log("makeSettingsPage::" + e);
	}
}

/**
 * Build a HTML entry from a property XML element.
 * @param {Element} pProp
 * @return {Element} HTML
 */
cidManager.makeSettingEntry = function(pProp) {
	var vPropName = pProp.getAttribute("name");
	var vComponent;
	var vValues = cidLib.getValues(pProp);
	if (vValues.length) {
		vComponent = document.createElement("select");
		vComponent.className = vPropName;
		vComponent.id = vPropName + "_container";
		for (var i = 0; i < vValues.length; i++) {
			var vOption = document.createElement("option");
			vOption.appendChild(document.createTextNode(vValues[i]));
			vOption.setAttribute("value", vValues[i]);
			vComponent.appendChild(vOption);
		}
	} else {
		vComponent = document.createElement("input");
		vComponent.setAttribute("type", "text");
		vComponent.id = vPropName + "_container";
		vComponent.className = vPropName;
	}
	var vPref = this.getPrefMetas(pProp);
	if (vPref) vComponent.setAttribute("value", vPref);
	return vComponent;
}

/**
 * function called by the generated HTML to let the user to add a new entry.
 * Produce a HTML code inserted in the pParent element, after the pBefore element.
 * @param {Element} pParent Element where the created entry will be inserted
 * @param {Element} pBefore after
 * @param {String} pMetaName
 */
cidManager.addEntry = function(pParent, pBefore, pMetaName) {
	var vHEntryDiv = document.createElement("div");
	var vLabelParam = document.createElement("label");
	vLabelParam.appendChild(document.createTextNode(cidLib.fMessages[14]));
	vHEntryDiv.appendChild(vLabelParam);
	vHEntryDiv.appendChild(this.makeSettingEntry(this.getMetaDesc(pMetaName)));
	var vDeleteButton = document.createElement("input");
	vDeleteButton.setAttribute("type", "button");
	vDeleteButton.setAttribute("value", cidLib.fMessages[16]);
	vDeleteButton.setAttribute("onclick", "this.parentNode.parentNode.removeChild(this.parentNode);");
	vHEntryDiv.appendChild(vDeleteButton);
	pParent.insertBefore(vHEntryDiv, pBefore);
}

/**
 * function used by genrated code.
 * Enable/disable a facultative property
 * @param {} pParent
 * @param {} pValue
 */
cidManager.disabledChildren = function(pParent, pValue) {
	var vInputs = pParent.getElementsByTagName("input");
	var vSelects = pParent.getElementsByTagName("select");
	for (var i = 0; i < vInputs.length; i++)
		if (pValue) vInputs[i].setAttribute("disabled", pValue);
		else vInputs[i].removeAttribute("disabled");
	for (var i = 0; i < vSelects.length; i++)
		if (pValue) vSelects[i].setAttribute("disabled", pValue);
		else vSelects[i].removeAttribute("disabled");
}

/**
 * Get a valid prefs meta in cidLib.fPrefMetas from an URI.
 * @param {Element} pNode
 * @return {String}
 */
cidManager.getPrefMetas = function(pNode) {
	var vType = cidLib.getMetaName(pNode.getAttribute("is"));
	var vValues = cidLib.getValues(pNode);
	var vCidPref = cidLib.fPrefMetas[vType];
	if (vValues.length == 0) {
		if (vCidPref) return vCidPref[0];
		if(this.fFile){
			if(vType == "fileName") return this.fFile.name;
			if(vType == "contentType") return this.fFile.type;
		}
	} else {
		if (vCidPref) for (var i = 0; i < vCidPref.length; i++)
			for (var j = 0; j < vValues.length; j++)
				if (vCidPref[i] == vValues[j]) return vCidPref[i];
		
		if (vType == "ContentType") 
			for (var j = 0; j < vValues.length; j++)
				if (this.fFile && this.fFile.type == vValues[j]) return this.fFile.type;

		if (vType == "fileName") 
			for (var j = 0; j < vValues.length; j++)
				if (this.fFile && this.fFile.name == vValues[j]) return this.fFile.type;
	}
	return null;
}

/**
 * Check if a meta has been overloaded by the user
 * @param {Element} pNode
 * @return {Boolean}
 */
cidManager.userOverloadedPrefMeta = function(pNode) {
	if (!pNode) return false;
	var vType = cidLib.getMetaName(pNode.getAttribute("is"));
	for (var i = 0; i < this.fUserOverloadedMeta.length; i++)
		if (this.fUserOverloadedMeta[i] == pNode.getAttribute("name")) return false;
	
	var vCidPref = cidLib.fPrefMetas[vType];
	if (vCidPref && vCidPref.showInForm) return true;
	if (vType == "contentType") return false;
	if (vType == "fileName") return true;
}

/**
 * Get a transport from the list of defined valid transports.
 * @param {String} pId (optional)
 * @return {Object} a transport object
 */
cidManager.getTransport = function(pId) {
	if (!pId && this.fTransports.length > 0) return this.fTransports[0].transport;
	if (pId) for (var i = 0; i < this.fTransports.length; i++)
		if (pId == this.fTransports[i].id) return this.fTransports[i].transport;

	return null;
}
/**
 * Try to execute the next step.
 * Invocate a settings page if some metas are unknown.
 */
cidManager.executeNextStep = function() {
	var vStep = this.fProcess.getNextStep();
	for (var i = 0; i < vStep.useMetas.length; i++) {
		if (!this.fProperties.contains(vStep.useMetas[i])) {
			var vMeta = this.getMetaDesc(vStep.useMetas[i])
			if (vMeta) {
				var vValue = this.getPrefMetas(vMeta);
				if (vValue) this.fProperties.addProp(vStep.useMetas[i], vValue);
			}
		}
	}
	// Check Needed Meta
	var vMissingProps = new Array();
	for (var i = 0; i < vStep.needMetas.length; i++) {
		if (!this.fProperties.contains(vStep.needMetas[i])) {
			var vMeta = this.getMetaDesc(vStep.needMetas[i])
			if (vMeta) {
				var vValue = this.getPrefMetas(vMeta);
				if (vValue && !this.userOverloadedPrefMeta(vMeta)) this.fProperties.addProp(vStep.needMetas[i], vValue);
				else vMissingProps.push(vMeta);
			} else {
				window.alert(cidLib.fMessages[17]);
				return;
			}
		}
	}
	// If need new metas...
	if (vMissingProps.length) {
		this.makeSettingsPage(vMissingProps, cidLib.getLabel(this.fProcess.node));
		this.changePanel("params");
	} else this.executeStep();
}
/**
 * Execute the next step
 */
cidManager.executeStep = function() {
	var vStep = this.fProcess.getNextStep();
	if (vStep.node.localName == "upload" && this.fFile == null) {
		cidManager.changePanel("upload");
		return;
	}
	eval("this.fProcess.transport." + vStep.node.localName + "(vStep)");
}
/**
 * Callback of a successfully executed step
 */
cidManager.cbExecutedStep = function() {
	this.fProcess.stepProcessed();
	if (this.fProcess.getNextStep()) this.executeNextStep();
	else {
		this.fSuccess = true;
		this.changePanel("end");
		var vPar = document.createElement("p").appendChild(document.createTextNode(cidLib.fMessages[13]));
		document.getElementById("end").appendChild(vPar);
	}
}

/**
 * Get the XML desc of a meta from its name
 * @param {String} pName
 * @return {Element}
 */
cidManager.getMetaDesc = function(pName) {
	for (var i = 0; i < this.fMetas.length; i++)
		if (this.fMetas[i].getAttribute("name") == pName) return this.fMetas[i];
	return null;
}

/**
 * Change the panned displayed by the client
 * @param {String} pTo, the id of the div to display
 */
cidManager.changePanel = function(pTo) {
	var vParts = document.getElementById("CIDContainer");
	for (var i = 0; i < vParts.children.length; i++)
		vParts.children[i].style.display = "none"
	document.getElementById(pTo).style.display = null;
}

/**
 * display the next required panel.
 */
cidManager.nextPanel = function() {
	try {
		var vParts = document.getElementById("CIDContainer");
		var vSelected;
		for (var i = 0; i < vParts.children.length; i++)
			if (vParts.children[i].style.display != "none") vSelected = vParts.children[i].id;
		switch (vSelected) {
		case "processSelection":
			var vRadios = document.getElementsByClassName("processSelRadio");
			var vSelIndex;
			for (var i = 0; i < vRadios.length; i++)
				if (vRadios[i].checked) vSelIndex = j;
			this.initProcess(this.fAcceptedProcesses.splice(selIndex, 1)[0]);
			this.executeNextStep();
			break;

		case "params":
			if (this.fMetasInForm) {
				for (var i = 0; i < this.fMetasInForm.length; i++) {
					var vName = this.fMetasInForm[i].getAttribute("name");
					var vCard = this.fMetasInForm[i].getAttribute("cardinality");
					var vValues = new Array();
					var vMetaForms = document.getElementsByClassName(vName);
					for (var j = 0; j < vMetaForms.length; j++)
						if (vMetaForms[j].value) vValues.push(vMetaForms[j].value)

					if ((vCard == 1 || vCard == "+") && !vValues.length) {
						window.alert(cidLib.fMessages[11] + vName + cidLib.fMessages[12]);
						return;
					}
					if (vValues.length) {
						this.fProperties.removeProp(vName);
						for (var j = 0; j < vValues.length; j++)
							this.fProperties.addProp(vName, vValues[j]);
						this.fUserOverloadedMeta.push(vName);
					}
				}
			}
			this.executeStep();
			break;

		case "upload":
			var vFileForm = document.getElementById("fileForm");
			if (vFileForm.files.length) {
				
				//Content type restriction handling
				var vRestrictions = cidManager.fProcess.node.getElementsByTagNameNS(cidManager.fNamespace, "restriction");
				for(var i = 0 ; i < vRestrictions.length ; i++){
					if(cidLib.getMetaName(vRestrictions[i].getAttribute("is")) == "contentType"){
						if(vRestrictions[i].getAttribute("value") != vFileForm.files[0])
							if(!window.confirm(cidLib.fMessages[20]+" "+cidLib.fMessages[21]+" "+vFileForm.files[0]+". "+cidLib.fMessages[22]+" "+vRestrictions[i]+". "+cidLib.fMessages[23]))
								break;
					}
				}
				
				//Content type restriction on meta definition handling
				var vMetas = cidManager.fProcess.node.getElementsByTagNameNS(cidManager.fNamespace, "meta");
				for(var i = 0 ; i < vMetas.length ; i++){
					if(cidLib.getMetaName(vMetas[i].getAttribute("is")) == "contentType"){
						var vFound = false;
						var vValues = cidLib.getValues(vMetas[i]);
						for(var j in vValues)
							if(vValues[j] == vFileForm.files[0])
								vFound = true;
						
						if(!vFound)
							if(!window.confirm(cidLib.fMessages[20]+" "+cidLib.fMessages[21]+" "+vFileForm.files[0]+". "+cidLib.fMessages[22]+" "+vRestrictions[i]+". "+cidLib.fMessages[23]))
							break;
					}
				}
				
				this.fFile = vFileForm.files[0];
				this.executeNextStep();
			} else window.alert(cidLib.fMessages[18]);
			break;
		case "interact":
			this.fProcess.stepProcessed();
			if (this.fProcess.getNextStep()) this.executeNextStep();
			else {
				this.fSuccess = true;
				this.changePanel("end");
				var vPar = document.createElement("p").appendChild(document.createTextNode(cidLib.fMessages[13]));
				document.getElementById("end").appendChild(vPar);
			}
			break;
		}
	} catch (e) {
		console.log("nextPanel::" + e);
	}
}