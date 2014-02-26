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

 
 
cidLib = {
	fSupportedAuths : [
		{
			fName : "basicHttp",
			fAuth : function(pCidManager) {return null;}
		},
		{
			fName : "digestHttp",
			fAuth : function(pCidManager) {return null;}
		},
		{
			fName : "noAuthentication",
			fAuth : function(pCidManager){return null;}
		}
		],
	/**
	 * Liste les protocole de transport par ordre de préférence. fName = nom du
	 * tag à chercher dans le manifeste fTransport = nom de l'objet qui prend en
	 * charge le protocole de transport
	 * 
	 * Ne peut pas être null API à fournir une méthode init une méthode
	 * abortUpload appelée lors d'un cancel en plein envoie une méthode
	 * upload qui prend un fAuth en arg
	 * 
	 * A le second écran du wizard à sa dispo pour y faire ce qu'il veut. Pour
	 * aider dans l'implémentation, tout objet fTransport se voit attacher un
	 * fCidManager pointant vers cidManager (et donc, vers fWindow).
	 */
	fSupportedTransports : [
		{				
			fName : "webTransport",
			fTransport : function(pId, pCidManager) {return {"id" : pId, "transport" : new cidLib.webTransport(pCidManager)}}
		}],
		
	fPrefMetas : {},
	
	
	
	 /**
		 * build url from a valid absolute or relative url. pUrl = /etc =>
		 * pUrlBase should be an host return http://pUrlbase+pUrl pUrl =
		 * https?://... return pUrl pUrl = .etc => rebuild from a baseUrl
		 * 
		 */
	buildHttpUrl : function(pUrlBase, pUrl){
		var vUrlCheck = /^https?:\/\/.*/;
		var vUrl;
		if (vUrlCheck.test(pUrl)) vUrl = pUrl;
		else {
			if (pUrl.charAt(0) == '/'){
				if(vUrlCheck.test(pUrlBase)){
					var vUrlBaseArray = pUrlBase.split("/");	
					vUrl = vUrlBaseArray[0]+"//"+vUrlBaseArray[2] + pUrl
				}else
					vUrl = "http://" + pUrlBase + pUrl;
			}
			else if(pUrl.charAt(0) == '.') {
				vUrl = "http://";
				for (var i = 2; i < pUrlBase.length - 1; i++) vUrl += pUrlBase[i] + "/";
				vUrl += pUrl;
			}
			else vUrl = "http//" + pUrl;
		}
		return vUrl;
	},
	/**
	 * Méthode de gestion des status HTTP
	 * 
	 * @param {}
	 *            pStatus
	 * @return {String}
	 */
	messageError : function(pStatus){
		switch(pStatus){
			case 401 : return "Incorrect login or password.";
			case 403 : return "You do not have the permission to process this step.";
			case 500 : return "The server encountered an internal error. Unable to complete the process";
			default  : return "An error occurred in the transaction with the server (error "+pStatus+")";
		}
		
		
	},
	/**
	 * Recherche un fils nommé label. Choisi la bonne langue. Si aucun label,
	 * retourne l'attribute name, localName si pas de name.
	 */
	getLabel : function(pNode){
		var vLangs = new Array();
		var vValues = new Array();
		for(var i = 0 ; i < pNode.childNodes.length ; i++){
			if(pNode.childNodes[i].localName == "label"){
				vLangs.push(pNode.childNodes[i].getAttribute("xml:lang"))
				for(var j = 0 ; j < pNode.childNodes[i].childNodes.length ; j++){
					if(pNode.childNodes[i].childNodes[j].nodeType == 3){
						vValues.push(pNode.childNodes[i].childNodes[j].nodeValue)
					}
				}
			}
		}
		// TODO choix langue
		for(var i = 0 ; i < vLangs.length  ; i++){
			if(vLangs[i] == "fr"){
				return vValues[i];
			}
		}
		if(pNode.hasAttribute("name")) return pNode.getAttribute("name");
		return pNode.localName;
	},
	/**
	 * retourne le tableau des valeurs filles du noeud passé en param.
	 * 
	 * @param {}
	 *            pNode
	 * @return {}
	 */
	getValues : function(pNode){
		var vValues = new Array();
		if(pNode.localName == "meta"){
			for(var i = 0 ; i < pNode.childNodes.length ; i++){
				if(pNode.childNodes[i].localName == "value"){
					for(var j = 0 ; j < pNode.childNodes[i].childNodes.length ; j++){
						if(pNode.childNodes[i].childNodes[j].nodeType == 3){
							vValues.push(pNode.childNodes[i].childNodes[j].nodeValue);
						}
					}
				}
			}
		}
		else if(pNode.localName == "restriction"){
			if(pNode.hasAttribute("value")) vValues.push(pNode.getAttribute("value"));
		}
		return vValues;
	},
	/**
	 * Retourne un tableau des noms placés en attribut pArg du noeud pNode.
	 */
	getProps : function(pNode, pArg){
		if(!pNode.hasAttribute(pArg)) return new Array();
		return pNode.getAttribute(pArg).split(" ");
	}
	
};


/**
 * webTransport est la classe de gestion de la couche de transport spécifiée par CID.
 * Elle gère :
 *  - Un checkAuth par HTTP
 *  - L'initialisation d'un interaction web
 *   -Une upload par HTTP
 */

cidLib.webTransport = function(pCidManager){
	this.fExchange = null;
	this.fUpload = null;
	this.fInteract = null;
	
	this.fUploaded = false;
	
	this.fCidManager = pCidManager;
}

/**
 * Méthode déclanchant la livraison du contenu
 * @param {Process[step]} pStep, L'étape courrante. Contient le noeud xml, une liste de méta nécessaire 
 * et une liste de méta à récupérer. 
 * @param {} pAuth, l'objet gérant l'authentification
 * @return {Boolean}
 */
cidLib.webTransport.prototype.upload = function(pStep, pAuth) {
	
	this.fUpload.step = pStep;
	var vUrl = cidLib.buildHttpUrl(this.fCidManager.fManifestHost, pStep.node.getAttribute("url"));
	var vXhr = new XMLHttpRequest();
	var vParams = {
		fUrl : vUrl,
		fCbType : "makeQueryString"
	}
	vUrl = this.processParam(this.fUpload, vParams).fUrl;
	vXhr.open(this.fUpload.method, vUrl);
	if(pAuth) pAuth.makeAuth(vXhr);
	var vReturn = this.makeContentToSend(this.fUpload, vXhr);
	vXhr = vReturn.fXhr;
	vXhr.manager = this.fCidManager;
	var vContentToSend = vReturn.fContentToSend;
	
	vXhr.onuploadprogress = function(evt) {
		window.document.getElementById("uploadMeter").value = evt.loaded/evt.total*100;
	};

	vXhr.onreadystatechange = function(evt) {
		try{
			if (vXhr.readyState == 4) {
				window.document.getElementById("uploadMeter").value = 100;
				if (vXhr.status && (vXhr.status < 200 || vXhr.status>= 300)) {
					var vPar = document.createElement("p").appendChild(document.createTextNode(cidLib.messageError(vXhr.status)));
					document.getElementById("end").appendChild(vPar);
					vXhr.manager.changePanel("end");
				}
				else{
					if(vXhr.response) cidManager.fProcess.transport.getReturnedProperties(pStep.returnMetas, JSON.parse(vXhr.response));
					cidManager.cbExecutedStep(true);
				}
			}
		}catch(e){
			console.log("btnCID::" + e);
		}
		window.document.getElementById("uploadMeter").value = 100;
	}
	
	vXhr.send(vContentToSend);
	return false;
}

/**
 * Méthode gérant l'envoi d'une requête pour vérification des authorisations.
 * 
 * @param {Process[step]}
 *            pStep, L'étape courrante. Contient le noeud xml, une liste de méta
 *            nécessaire et une liste de méta à récupérer.
 * @param {}
 *            pAuth, l'objet gérant l'authentification
 * @return {Boolean}
 */
cidLib.webTransport.prototype.exchange = function(pStep, pAuth){
	this.fExchange.step = pStep;
	var vUrl = cidLib.buildHttpUrl(this.fCidManager.fManifestHost, pStep.node.getAttribute("url"));
	var vXhr = new XMLHttpRequest();
	var vParams = {
		fUrl : vUrl,
		fCbType : "makeQueryString"
	}
	vUrl = this.processParam(this.fExchange, vParams).fUrl;
	vXhr.open(this.fExchange.method, vUrl, false);	
	if(pAuth) pAuth.makeAuth(vXhr);
	var vReturn = this.makeContentToSend(this.fExchange, vXhr);
	vXhr = vReturn.fXhr;
	var vContentToSend = vReturn.fContentToSend;
	
	vXhr.send(vContentToSend);
	if (vXhr.status && (vXhr.status < 200 || vXhr.status>= 300)) {
		window.alert(cidLib.messageError(vXhr.status));
		return false;
	}
	else{
		cidManager.fProcess.transport.getReturnedProperties(pStep.returnMetas, vXhr.response);
		if(this.fCidManager.fAuth) this.fCidManager.fAuth.exchangeCb();
		return true;
	}
}

/**
 * Méthode instanciant une iframe d'interaction.
 * 
 * @param {Process[step]}
 *            pStep, L'étape courrante. Contient le noeud xml, une liste de méta
 *            nécessaire et une liste de méta à récupérer.
 * @param {}
 *            pAuth, l'objet gérant l'authentification
 */
cidLib.webTransport.prototype.interact = function(pStep, pAuth){
	//TODO
	this.fInteract.step = pStep;
	var vUrl = cidLib.buildHttpUrl(this.fCidManager.fManifestHost, pStep.node.getAttribute("url"));
	var vInteractIFrame = document.getElementById("frame");
	vInteractIFrame.addEventListener("load", this.frameLoaded, true);
	
	
	if(this.fInteract.method == "POST"){
		var vDocument = vInteractIFrame.contentWindow.document;
		
		var vForm = vDocument.createElement("form");
		
		vForm.setAttribute("action", vUrl);
		vForm.setAttribute("method", this.fInteract.method);
		vForm.setAttribute("enctype", this.fInteract.body);
		
		var vParams = {
			fForm : vForm,
			fCbType : "feedInteractForm"
		};
		vParams = this.processParam(this.fInteract, vParams);
		vDocument.body.appendChild(vParams.fForm);
		vParams.fForm.submit();
				
		
	}
	else{
		var vParams = {
			fUrl : vUrl,
			fCbType : "makeQueryString",
			fForceQueryString : true
		};
		vParams = this.processParam(this.fInteract, vParams);

		vInteractIFrame.setAttribute("src", vParams.fUrl);
	}
	
	this.fCidManager.changePanel("interact");

	
	return false;
}

cidLib.webTransport.prototype.init = function(pNode){
	this.fNode = pNode;
	
	this.fCookieAware = pNode.getAttribute("needCookies");
	
	var vProperties = pNode.getAttribute("sessionProperties");
	
	this.fSessionProperties = null;
	if(vProperties) this.fSessionProperties = vProperties.split(" ");
	else this.fSessionProperties = new Array();
	
	
	for(var i = 0 ; i < pNode.childNodes.length ; i++){
		if(pNode.childNodes[i].nodeType == 1 && pNode.childNodes[i].namespaceURI == this.fCidManager.fNamespace){
			switch(pNode.childNodes[i].localName){
				case "webExchange" :
					if(!this.fExchange) {
						this.fExchange = this.initMethod(pNode.childNodes[i]);
						this.fExchange.encloseContent = false;
					}
				break;
				
				case "webInteract" :
					if(!this.fInteract){
						this.fInteract = this.initMethod(pNode.childNodes[i]);
						this.fInteract.encloseContent = false;
						//TODO => Pourquoi ??
						for(var i = 0 ; i < this.fInteract.properties.length ; i++)
							if(this.fInteract.properties[i]=="header") this.fInteract.properties.splice(i, 1);
					}
				break;
				
				case "webUpload" :
					if(!this.fUpload){
						this.fUpload = this.initMethod(pNode.childNodes[i]);
						this.fUpload.encloseContent = true;
					}
					
				break;
			}
		}
	}
}

/**
 * Analyse un noeud methode et produit un objet JS décrivant la requête http à
 * produire.
 * 
 * @param {Node}
 *            pMethod
 * @return {"method": *** , "properties", [*,*,*], "content":***}
 */
cidLib.webTransport.prototype.initMethod = function(pMethod){
	var vMethod = pMethod.getAttribute("method");
	var vProperties = pMethod.getAttribute("properties").split(" ");
	var vContent;
	if(vMethod == "PUT" || vMethod == "POST" || vMethod == "GET"){
		vContent  = "body";
		for(var i = 0 ; i < vProperties.length ; i++){
			if (vProperties[i] == "post") vProperties.splice(i, 1);
		}
	}else if(vMethod == "POST;application/x-www-form-urlencoded" || vMethod == "POST;multipart/form-data"){
			vContent = vMethod.split(";")[1];
			vMethod = "POST";
	}
	return {
		"method" : vMethod,
		"properties" : vProperties,
		"content" : vContent
	};
}

cidLib.webTransport.prototype.processParam = function(pContext, pParams){
	for(var i = 0 ; i < pContext.step.needMetas.length ; i++){
		var vPropName = pContext.step.needMetas[i];
		var vValues = this.fCidManager.fProperties.getPropArray(vPropName);
		if(vValues.length && !this.fCidManager.userOverloadedPrefMeta(this.fCidManager.getMetaDesc(vPropName))){
			for(var j = 0 ; j < vValues.length ; j++){
				pParams = this.processParamCB(pContext, pParams, vValues[j].name, vValues[j].value);
			}
		} else {
			var vMetaForms = document.getElementsByClassName(vPropName);
			for(var j = 0 ; j < vMetaForms.length ; j++){
				pParams = this.processParamCB(pContext, pParams, vPropName, vMetaForms[j].value);
			}
		}
	}
	
	for(var i = 0 ; i < pContext.step.useMetas.length ; i++){
		var vValues = this.fCidManager.fProperties.getPropArray(pContext.step.useMetas[i]);
		for(var j = 0 ; j < vValues.length ; j++){
			pParams = this.processParamCB(pContext, pParams, vValues[j].name, vValues[j].value);
		}
	}
	
	for(var i = 0 ; i < this.fSessionProperties.length ; i++){
		var vValues = this.fCidManager.fProperties.getPropArray(this.fSessionProperties[i]);
		for(var j = 0 ; j < vValues.length ; j++){
			pParams = this.processParamCB(pContext, pParams, vValues[j].name, vValues[j].value);
		}
	}
	
	return pParams ;
}

cidLib.webTransport.prototype.processParamCB = function(pContext, pParams, pName, pValue){
	switch(pParams.fCbType){
		case "makeQueryString" :
			return this.addQueryString(pContext, pName, pValue, pParams);
		break;
		
		case "makeContentToSend" :
			return this.addMeta(pContext, pName, pValue, pParams);
		break;
		
		case "feedInteractForm" :
			return this.addMetaToForm(pName, pValue, pParams);
		break;
	}
}

/**
 * Produit le contenu à envoyer dans le corps de la requête. Ajoute également
 * les paramètres nécessaires dans un formulaire ou dans le header.
 * 
 * @param {}
 *            pContext
 * @param {}
 *            pXhr
 * @return {}
 */
cidLib.webTransport.prototype.makeContentToSend = function(pContext, pXhr){
	//TODO Gestion fichier
	var vContentToSend;
	switch(pContext.content){
		case "body" :
			if(pContext.encloseContent) vContentToSend = this.fCidManager.fFile;
		break;
		
		case "multipart/form-data":
			vContentToSend = new FormData();
			if(pContext.encloseContent) vContentToSend.append("cidContent", this.fCidManager.fFile);
		break;
	}
	
	var vParams = {
		fXhr : pXhr,
		fContentToSend : vContentToSend,
		fCbType : "makeContentToSend"
	}
	vParams = this.processParam(pContext, vParams);
	
	return vParams;
}

cidLib.webTransport.prototype.addMetaToForm = function(pName, pValue, pParams){
	var vInput = pParams.fForm.ownerDocument.createElement("input");
	vInput.setAttribute("type", "hidden");
    vInput.setAttribute("name", pName);
    vInput.setAttribute("value", pValue);
    pParams.fForm.appendChild(vInput);
    return pParams;
}

/**
 * Ajoute une méta. param1 = forceQueryString ou formData param2 = url ou xhr
 */
cidLib.webTransport.prototype.addMeta = function(pContext, pName, pValue, pParams){
// Dans ce cas, les props allant nécessairement en querystring sont déjà
// initialisées
	for(var i = 0 ; i < pContext.properties.length ; i++){
		if(pContext.properties[i] == "post") {
			switch(pContext.content){
				case "application/x-www-form-urlencoded" :
					pParams.fContentToSend += encodeURI("&"+pName + "=" + pValue);
				break;
				case "multipart/form-data":
					pParams.fContentToSend.append(pName, pValue);
				break;
			}
			return pParams;
		}
	}
	for(var i = 0 ; i < pContext.properties.length ; i++){
		if(pContext.properties[i] == "header") {
			pParams.fXhr.setRequestHeader(pName, pValue);
			return pParams;
		}
	}
}


cidLib.webTransport.prototype.addQueryString = function(pContext, pName, pValue, pParams){
	var vFoundQueryString = false;
	for(var i = 0 ; i < pContext.properties.length ; i++){
		if((pContext.properties[i] == "post" || pContext.properties[i] == "header") && !pParams.fForceQueryString) return pParams;
		if(pContext.properties[i] == "queryString") vFoundQueryString = true;
	}
	
	if(vFoundQueryString) {
		if(pParams.fUrl.match("[?]") && (pParams.fUrl.charAt(pParams.fUrl.length-1) != "?")) pParams.fUrl+="&"
		else pParams.fUrl +="?";
		pParams.fUrl+=pName+"="+pValue;
	}
	return pParams;
}

cidLib.webTransport.prototype.frameLoaded  = function(pEvent) {
	pEvent.currentTarget.contentWindow.transport = cidManager.fProcess.transport;
	pEvent.currentTarget.contentWindow.addEventListener('cid-interaction-ended', cidManager.fProcess.transport.endInteractEvent, false);
	pEvent.currentTarget.contentWindow.addEventListener('cid-interaction-aborted', cidManager.fProcess.transport.abortInteractEvent, false);
}

cidLib.webTransport.prototype.endInteractEvent = function(pEvent){
	var vTransport = pEvent.target.window.transport;
	for(var i = 0 ; i < vTransport.fInteract.step.returnMetas.length ; i++){
		var vPropName = vTransport.fInteract.step.returnMetas[i]
		vTransport.fCidManager.fProperties.setProp(vPropName, eval("pEvent.detail['"+vPropName+"']"));
	}
	vTransport.fCidManager.nextPanel();
}

cidLib.webTransport.prototype.abortInteractEvent = function(pEvent){
	var vPar = document.createElement("p").appendChild(document.createTextNode("The server was unable to complete the CID process."));
	document.getElementById("end").appendChild(vPar);
	cidManager.changePanel("end");
}

cidLib.webTransport.prototype.getReturnedProperties = function(pProps, pXhrResponse){
	for(var i = 0 ; i < pProps.length ; i++){
		this.fCidManager.fProperties.setProp(pProps[i], eval("pXhrResponse['"+pProps[i]+"'];"));
	}
	for(var i = 0 ; i < this.fSessionProperties.length ; i++){
		this.fCidManager.fProperties.setProp(this.fSessionProperties[i], eval("pXhrResponse['"+this.fSessionProperties[i]+"'];"))
	}
}

/**
 * Queue des properties connues. Chaque entrée est de la forme {"name" :
 * "Nom-Prop", "value" : "valeur-Prop"}
 */
cidLib.PropertiesQueue = function(){
	this.properties = new Array();
}

cidLib.PropertiesQueue.prototype.removeProp = function(pName){
	for(var i = 0 ; i < this.properties.length ; i++)
		if(this.properties[i].name == pName) this.properties.splice(i,1);
}
	
cidLib.PropertiesQueue.prototype.reset = function(){
	this.properties = new Array();
}

cidLib.PropertiesQueue.prototype.setProp = function(pName, pValue){
	this.removeProp(pName);
	this.addProp(pName, pValue);
}

cidLib.PropertiesQueue.prototype.addProp = function(pName, pValue){
	this.properties.push({ "name" : pName, "value" : pValue});
}

cidLib.PropertiesQueue.prototype.contains = function(pName){
	for(var i = 0 ; i < this.properties.length ; i++)
		if(this.properties[i].name == pName) return true;
	return false;
}

cidLib.PropertiesQueue.prototype.getPropArray = function(pName){
	var vReturn = new Array();
	for(var i = 0 ; i < this.properties.length ; i++)
		if(this.properties[i].name == pName) vReturn.push(this.properties[i]);
	return vReturn;
}

cidLib.Process = function(){
	this.steps = new Array();
	/**
	 * next step to process.
	 */
	this.nextStep = 0;
}

/**
 * get the next step to process
 */
cidLib.Process.prototype.getNextStep = function(){
	if(this.nextStep < this.steps.length) return this.steps[this.nextStep];
	return null;
}

cidLib.Process.prototype.stepProcessed = function(){
	this.nextStep++;
}
/**
 * get the required properties for the next step
 */
cidLib.Process.prototype.getneedMetas = function(){
	return this.steps[this.nextStep].needMetas;
}

cidLib.Process.prototype.push = function(pObject){
	this.steps.push(pObject);
}

cidLib.Process.prototype.debug = function(){
	log.info("cid ::: debug process structure");
	log.info(log.listProperties(this));
	for(var i = 0 ; i < this.steps.length ; i++){
		log.info("::::::::::::: STEP ::::::::::::");
		log.info(log.listProperties(this.steps[i]));
	}
}
 


//Gère le déroulé...
 cidManager = {
	fManifestHost:null,
	fNamespace:null,
	/**
	 * Liste des transports supportés
	 */
	fTransports : null,
	
	/**
	 * Objet auth sélectionné
	 */
	fAuth : null,
	/**
	
	 * Liste des properties connues
	 */
	fProperties : new cidLib.PropertiesQueue(),
	
	/**
	 * Process sélectionné
	 */
	fProcess : null,
	
	/**
	 * Liste des metas déjà renseignées par l'utilisateur.
	 */
	fUserOverloadedMeta : new Array(),

	/**
	 * Liste des métas déclarées dans le manifeste.
	 */
	fMetas : new Array(),
	
	/**
	 * Liste des restrictions déclarées
	 */
	fRestriction : new Array()
 }
 
 /**
 * Récupère et analyse le manifeste. Instancie les objets transports, l'objet
 * auth Produit la page de sélection du process ou initie le process si un
 * unique process valide.
 */
cidManager.getManifest = function(){
	try {
		var vXhr = new XMLHttpRequest();
		var vUrl = window.document.getElementById("manifestURL").value
				.match("https?://") ? window.document.getElementById("manifestURL").value : "http://"
				+ window.document.getElementById("manifestURL").value;
					
		this.fManifestHost = vUrl.split("/")[2];		
		vXhr.open("GET", vUrl, false);
		vXhr.send();
		if (vXhr.readyState == 4 ) if(vXhr.responseXML && vXhr.status === 200) {
			this.init(vXhr.responseXML, vUrl);
		}else if(!vXhr.responseXML)
			window.alert("The received manifest is not well-formed. Make sure that the URL is correct.");
		else
			window.alert(cidLib.messageError(vXhr.status));
	} catch (e) {
		console.log("btnCID::" + e);
		window.alert("Error during the manifest reception. Make sure that the URL is correct.");
	}
}


/**
 * init de l'objet à partir du manifeste reçu
 * 
 * @param {}
 *            pManifest
 * @param {}
 *            pUrl
 * @return {Boolean}
 */
cidManager.init = function(pManifest, pUrl){
	
	var vRoot;
	var vRoots = pManifest.childNodes;
	for(var i = 0 ; i < vRoots.length ; i++ ) if(vRoots[i].nodeType == 1) {vRoot = vRoots[i];break;}
	if(vRoot.namespaceURI != "http://www.kelis.fr/cid/v2/core"){
		window.alert("This client does not support this server.");
		return false;
	}
	this.fManifest = pManifest;
	this.fNamespace = vRoot.namespaceURI;
	this.fAcceptedProcesses = new Array();
	
	for(var i = 0 ; i < vRoot.childNodes.length ; i++){
		if(vRoot.childNodes[i].nodeType == 1){
			if(vRoot.childNodes[i].namespaceURI != this.fNamespace) 
			window.alert("This client does not support this server.");
			switch(vRoot.childNodes[i].localName){
				case "process":
					this.fAcceptedProcesses.push(vRoot.childNodes[i]);
				break;
				
				case "transports":
				var vFoundTransport = false;
				this.fTransports = new Array();
				// transport choice
				// For each transport
				for (var j = 0 ; j < cidLib.fSupportedTransports.length ; j++) {
					var vTransports = this.fManifest.getElementsByTagNameNS(this.fNamespace,cidLib.fSupportedTransports[j].fName);
					for(var k = 0 ; k < vTransports.length ; k++){
						this.fTransports.push(cidLib.fSupportedTransports[j].fTransport(vTransports[k].getAttribute("id"), this));
						this.fTransports[this.fTransports.length - 1].transport.init(vTransports[k]);
						vFoundTransport = true;
					}
				}
				break;
				
				case "authentications":
				// For each supported auth
				for (var j = 0 ; j < cidLib.fSupportedAuths.length ; j++) {
					// if this auth is supported by the server
					var vAuthName = cidLib.fSupportedAuths[j].fName;
					var vAuthNodes = vRoot.childNodes[i].getElementsByTagNameNS(this.fNamespace,vAuthName);
					if (vAuthNodes.length > 0) {
						// init Auth
						this.fAuth = cidLib.fSupportedAuths[j].fAuth(this);
						if(this.fAuth) 	this.fAuth.init(vAuthNodes[0]);
						break;
					}
				}
				break;
				
				default:
					window.alert("This client does not support this server.");
					return;
			}
		}
	}
	// Vérifié avant envoi...
	if( !vFoundTransport){
		window.alert("Unable to execute the cid process. Server paramaters are not supported.");
	}
	else
		this.refineAcceptedProcesses(); 
}


/**
 * Affine la liste des process supportés. Supprime les éléments non gérés ou
 * non pertinent vis à vis du contenu récupéré. 
 * 	En fonction du nombre d'éléments dans la liste : 
 * 		pas d'éléments => erreur. Pas d'envoi possible 
 * 		1 élément => suite process 
 * 		n éléments => écran de choix du content
 */
cidManager.refineAcceptedProcesses = function(){
	try{
		for(var i = 0 ; i < this.fAcceptedProcesses.length ; i++)
			if(! this.isValidProcess(this.fAcceptedProcesses[i])) this.fAcceptedProcesses.splice(i--, 1);
		
		switch(this.fAcceptedProcesses.length){
			case 0:
				window.alert("Unable to execute the cid process. Server paramaters are not supported.");
				return false;
			break;
			case 1:
				this.initProcess(this.fAcceptedProcesses[0]);
				// this.fProcess.debug();
				return this.executeNextStep();
			break;
			default: // Wizard page de sélection du process
				var vRadioGroup = document.getElementById("processSelRadioGroup");
				while(vRadioGroup.hasChildNodes())vRadioGroup.removeChild(vRadioGroup.firstChild);
				for(var i = 0 ; i < this.fAcceptedProcesses.length ; i++){
					var vRadio = document.createElement("radio");
					if(!i)vRadio.setAttribute("selected", true);
					
					vRadio.setAttribute("label", cidLib.getLabel(this.fAcceptedProcesses[i]));					
					vRadioGroup.appendChild(vRadio);
				}
				this.changePanel("processSelection");
			break;
		}
	}catch(e){
		console.log("btnCID::" + e);
	}
}

/**
 * Vérifie si un process est supporté
 * 
 * Supporté si toutes étapes sont gérées, le transport est supporté, la méta
 * Content-type est compatible
 * 
 * @return boolean
 * 
 */
cidManager.isValidProcess = function(pProcess){
	// check transport
	if(pProcess.hasAttribute("transports")){
		var vFoundTransport = false;
		var vTransportIds = pProcess.getAttribute("transports").split(" ");
		for(var i = 0 ; i < vTransportIds.length ; i++)
			if(this.getTransport(vTransportIds[i])) vFoundTransport = true;
		if(!vFoundTransport) return false;
	}
	else if(!this.getTransport()) return false;
	var vChildren = pProcess.childNodes;
	for(var i = 0 ; i < vChildren.length ; i++){
		if(vChildren[i].nodeType == 1 ) {
			if(vChildren[i].namespaceURI != this.fNamespace) return false;
			if(vChildren[i].localName != "label" && vChildren[i].localName != "doc"
				&& vChildren[i].localName != "meta" && vChildren[i].localName != "restriction" 
				&& vChildren[i].localName != "exchange"
				&& vChildren[i].localName != "interact" 
				&& vChildren[i].localName != "upload")
				return false;
			if(vChildren[i].localName == "meta" || vChildren[i].localName == "restriction"){
				if(vChildren[i].getAttribute("name") == "Content-type"){
					// Vérification du type de contenus envoyé dans un process.
					var vCard = vChildren[i].getAttribute("cardinality");
					if(!vCard || vCard == "1" || vCard == "+"){
						var vPrefValue = this.getPrefMetas(vChildren[i]);
						if(!vPrefValue) return false;
					}
				}
			}
		}
	}
	return true;
}

/**
 * Créé un objet Process à partir du process sélectionné.
 * 
 * @param {}
 *            pProcess
 */
cidManager.initProcess = function(pProcess){
	var vTransport;
	if(pProcess.hasAttribute("transports")){
		var vTransportIds = pProcess.getAttribute("transports").split(" ");
		for(var i = 0 ; i < vTransportIds.length ; i++)
			if(vTransport = this.getTransport(vTransportIds[i]))break;
	} else vTransport = this.getTransport();
	
	this.fProcess = new cidLib.Process();
	this.fProcess.transport = vTransport
	this.fProcess.node = pProcess;
	
	var vChildren = pProcess.childNodes;
	for(var i = 0 ; i < vChildren.length ; i++){
		if(vChildren[i].nodeType == 1 ) {
			if(vChildren[i].localName == "meta") this.fMetas.push(vChildren[i]);
			else if (vChildren[i].localName == "restriction")	this.fRestriction.push(vChildren[i]);
			else if (vChildren[i].localName == "exchange" || vChildren[i].localName == "interact" || vChildren[i].localName ==  "upload"){
				this.fProcess.push({
					"node" : vChildren[i],
					"needMetas" :cidLib.getProps(vChildren[i], "needMetas"),
					"useMetas" :cidLib.getProps(vChildren[i], "useMetas"),
					"returnMetas" :cidLib.getProps(vChildren[i], "returnMetas")
				});
			}
		}
	}
}

/**
 * Gestion du wizard. Clic sur bouton next.
 * 
 * @param {id}
 *            pFrom, id de la page de provenance
 */
//TODO
cidManager.pageAdvanced = function(pFrom){
	try{
		switch(pFrom){
			case "processSelection" :
				var selIndex = window.document.getElementById("processSelRadioGroup").selectedIndex;
				this.initProcess(this.fAcceptedProcesses.splice(selIndex, 1)[0]);
				this.executeNextStep();
				
			break;
			
			
			case "params" :
				if(this.fMetasInForm){
					for (var i = 0 ; i < this.fMetasInForm.length ; i++){
						var vName = this.fMetasInForm[i].getAttribute("name");
						var vCard = this.fMetasInForm[i].getAttribute("cardinality");
						
						var vValues = new Array();
						var vMetaForms = window.document.getElementsByClassName(vName);
						for(var i = 0 ; i < vMetaForms.length ; i++){
							if(vMetaForms[i].value) vValues.push(vMetaForms[i].value)
						}
						if((vCard==1 || vCard=="+") && !vValues.length){
							window.alert("The form is not properly completed. The field "+vName+ " must be filled.");
							return;
						}
						
						if(vValues.length){
							this.fProperties.removeProp(vName);
							for(var i = 0 ; i < vValues.length ; i++) this.fProperties.addProp(vName, vValues[i]);
							this.fUserOverloadedMeta.push(vName);
						}
					}
				}
				this.executeStep();
			break;
			
			case "interactPage" :
				this.fProcess.stepProcessed();
				var vNextStep = this.fProcess.getNextStep();
				if(vNextStep){
					this.executeNextStep();
				}
				else{
					this.fSuccess = true;
					this.changePanel("end");
					var vPar = document.createElement("p").appendChild(document.createTextNode("the CID process was successfully executed."));
					document.getElementById("end").appendChild(vPar);
				}
			break;
			
			// en cas d'upload réussi et si callback demandé, appel du callback;
			case "end" :
				if(this.fSuccess && this.cb) this.cb(this.fProperties, this.cbParams);
		}
	}catch(e){
		console.log("btnCID::" + e);
	}
}


/**
 * Réinitialise une page de settings pour permettre au user de rentrer des
 * métas.
 * 
 * @param {Array(Node)}
 *            pProps Liste de méta à fournir.
 * @param {String}
 *            pLabel Label du process
 */
cidManager.makeSettingsPage = function(pProps, pLabel){
	try{
		
		var vContainer = document.getElementById("paramsContainer");
		while(vContainer.hasChildNodes()) vContainer.removeChild(vContainer.firstChild);
		
		var vTitle = document.createElement("h2");
		vTitle.appendChild(document.createTextNode("Settings: "+pLabel));
		
		vContainer.appendChild(vTitle);
		
		var vShowContainer = false;
		for(var i = 0 ; i < pProps.length ; i++){
			var vPropName = pProps[i].getAttribute("name");
			var vPref = this.getPrefMetas(pProps[i]);
			if(!vPref || vPref && this.userOverloadedPrefMeta(pProps[i])){
				vShowContainer = true;
				var vCard = pProps[i].getAttribute("cardinality");
				if(!vCard) vCard = "1";
				switch (vCard){
					case "1" :
						var vPar = document.createElement("p");
					
						var vLabel = document.createElement("label");
						vLabel.appendChild(document.createTextNode(cidLib.getLabel(pProps[i]) + ": "));
						vLabel.setAttribute("for", vPropName+"_container");
						vPar.appendChild(vLabel);
						
						vPar.appendChild(this.makeSettingEntry(pProps[i]));
						vContainer.appendChild(vPar);
						
					break;
					case "*" :
						var vFiedSet = document.createElement("fieldset");
						var vLegend = document.createElement("legend");
						
						var vCheckbox = document.createElement("input");
						vCheckbox.id = "checkbox_"+vPropName;
						vCheckbox.setAttribute("type", "checkbox");
						vCheckbox.setAttribute("checked", "checked");
						vCheckbox.setAttribute("onclick", "cidManager.disabledChildren(document.getElementById('"+vPropName+"_entriesContainer'),!this.checked);");
						vLegend.appendChild(vCheckbox);
						
						var vCheckboxLabel = document.createElement("label");
						vCheckboxLabel.appendChild(document.createTextNode(cidLib.getLabel(pProps[i])+": "));
						vCheckboxLabel.setAttribute("for", "checkbox_" + vPropName);
						vLegend.appendChild(vCheckboxLabel);
						
						vFiedSet.appendChild(vLegend);
												
						var vSubDiv = document.createElement("div");
						vSubDiv.id = vPropName+"_entriesContainer";
						
						var vHEntryDiv = document.createElement("div");
						
						var vLabelParam = document.createElement("label");
						vLabelParam.appendChild(document.createTextNode("Parameter: "));
						vLabelParam.setAttribute("for", vPropName+"_container");
						vHEntryDiv.appendChild(vLabelParam);
						
						vHEntryDiv.appendChild(this.makeSettingEntry(pProps[i]));
						
						vSubDiv.appendChild(vHEntryDiv);
						
						var vAddButton = document.createElement("input");
						vAddButton.setAttribute("type", "button");
						vAddButton.setAttribute("value", "Add a parameter");
						vAddButton.setAttribute("onclick", "cidManager.addEntry(this.parentNode, this, '"+vPropName+"');");
						vSubDiv.appendChild(vAddButton);
						
						vFiedSet.appendChild(vSubDiv)
						
						vContainer.appendChild(vFiedSet);
					break;
					case "+" :
					var vFiedSet = document.createElement("fieldset");
						var vLegend = document.createElement("legend");
						
						var vLabel = document.createElement("label");
						vLabel.appendChild(document.createTextNode(cidLib.getLabel(pProps[i])+": "));
						vLegend.appendChild(vLabel);
						
						vFiedSet.appendChild(vLegend);
												
						var vSubDiv = document.createElement("div");
						vSubDiv.id = vPropName+"_container";
						
						var vHEntryDiv = document.createElement("div");
						
						var vLabelParam = document.createElement("label");
						vLabelParam.appendChild(document.createTextNode("Parameter: "));
						vHEntryDiv.appendChild(vLabelParam);
						
						vHEntryDiv.appendChild(this.makeSettingEntry(pProps[i]));
						
						vSubDiv.appendChild(vHEntryDiv);
						
						var vAddButton = document.createElement("input");
						vAddButton.setAttribute("type", "button");
						vAddButton.setAttribute("value", "Add a parameter");
						vAddButton.setAttribute("onclick", "cidManager.addEntry(this.parentNode, this, '"+vPropName+"');");
						vSubDiv.appendChild(vAddButton);
						
						vFiedSet.appendChild(vSubDiv)
						
						vContainer.appendChild(vFiedSet);
					
					break;
					case "?" :					
						var vCheckbox = document.createElement("input");
						vCheckbox.id = "checkbox_"+vPropName;
						vCheckbox.setAttribute("type", "checkbox");
						vCheckbox.setAttribute("checked", "checked");
						vCheckbox.setAttribute("onclick", "cidManager.disabledChildren(document.getElementById('"+vPropName+"_entryContainer'),!this.checked);");
						vContainer.appendChild(vCheckbox);
						
						var vCheckboxLabel = document.createElement("label");
						vCheckboxLabel.appendChild(document.createTextNode(cidLib.getLabel(pProps[i])+": "));
						vCheckboxLabel.setAttribute("for", "checkbox_" + vPropName);
						vContainer.appendChild(vCheckboxLabel);
						
						var vEntryContainer = document.createElement("span");
						vEntryContainer.id = vPropName+"_entryContainer";
						
						vEntryContainer.appendChild(this.makeSettingEntry(pProps[i]));
						
						vContainer.appendChild(vEntryContainer);
					break;
				}
			}
		}
		vContainer.hidden = !vShowContainer;
		this.fMetasInForm = pProps;
	}catch(e){
		console.log("btnCID::" + e);
	}
}

cidManager.makeSettingEntry = function(pProp){
	var vPropName = pProp.getAttribute("name");
	
	var vComponent;
	var vValues = cidLib.getValues(pProp);

	if(vValues.length){	
		vComponent = document.createElement("select");
		vComponent.className = vPropName;
		vComponent.id = vPropName+"_container";
		
		for(var i = 0 ; i < vValues.length ; i++){
			var vOption = document.createElement("option");
			vOption.appendChild(document.createTextNode(vValues[i]));
			vOption.setAttribute("value", vValues[i]);
			vComponent.appendChild(vOption);
		}
	}
	else{
		vComponent = document.createElement("input");
		vComponent.setAttribute("type", "text");
		vComponent.id = vPropName+"_container";
		vComponent.className = vPropName;
	}
	var vPref = this.getPrefMetas(pProp);
	if(vPref) vComponent.setAttribute("value", vPref);
	return vComponent;
}

/**
 * Interne à la page XUL de settings
 * 
 * @param {}
 *            pParent
 * @param {}
 *            pBefore
 * @param {}
 *            pMetaName
 */
cidManager.addEntry = function(pParent, pBefore, pMetaName){
	var vHEntryDiv = document.createElement("div");
	
	var vLabelParam = document.createElement("label");
	vLabelParam.appendChild(document.createTextNode("Parameter: "));
	vHEntryDiv.appendChild(vLabelParam);
	
	vHEntryDiv.appendChild(this.makeSettingEntry(this.getMetaDesc(pMetaName)));
	
	var vDeleteButton = document.createElement("input");
	vDeleteButton.setAttribute("type", "button");
	vDeleteButton.setAttribute("value", "delete");
	vDeleteButton.setAttribute("onclick", "this.parentNode.parentNode.removeChild(this.parentNode);");
	
	vHEntryDiv.appendChild(vDeleteButton);
	
	pParent.insertBefore(vHEntryDiv, pBefore);
}
	
/**
 * Interne à la page XUL de settings
 * 
 * @param {}
 *            pParent
 * @param {}
 *            pValue
 */
cidManager.disabledChildren = function(pParent, pValue){
	var vInputs = pParent.getElementsByTagName("input");
	var vSelects = pParent.getElementsByTagName("select");
	
	for(var i = 0 ; i < vInputs.length ; i++	) 
		if(pValue) vInputs[i].setAttribute("disabled", pValue);
		else vInputs[i].removeAttribute("disabled");
	for(var i = 0 ; i < vSelects.length ; i++	)
		if(pValue) vSelects[i].setAttribute("disabled", pValue);
		else vSelects[i].removeAttribute("disabled");
}

/**
 * Retourne une méta de préférence parmi les values renseignée (ou la première
 * pref si pas de values). Va d'abord chercher dans les prefs du modèle. Puis,
 * si échec dans les prefs de cid.
 * 
 * @param {Node}
 *            pNode noeud Méta.
 * @return {String} la valeure de pref. Null si pas trouvé.
 */
cidManager.getPrefMetas = function(pNode){
	var vName = pNode.getAttribute("name");
	var vValues = cidLib.getValues(pNode);
	eval("var vCidPref = cidLib.fPrefMetas['"+vName+"'];");
	
	if(vValues.length == 0){
		if(vCidPref) return vCidPref.values[0];
		if(vName == "Content-type" && this.fFile) return this.fFile.type;
		if(vName == "File-name" && this.fFile) return this.fFile.name;
	}
	else{
		if(vCidPref)
			for (var i = 0 ; i < vCidPref.values.length ; i++)
				for  (var j = 0 ; j < vValues.length ; j++)
					if(vCidPref.values[i] == vValues[j]) return vCidPref.values[i];
		if(vName == "Content-type")
			for  (var j = 0 ; j < vValues.length ; j++)
				if(this.fFile && this.fFile.type == vValues[j]) return  this.fFile.type;
				
		if(vName == "File-name")
			for  (var j = 0 ; j < vValues.length ; j++)
				if(this.fFile && this.fFile.name == vValues[j]) return this.fFile.type;
	}
	return null;		
}

/**
 * Cherche si une méta, avec une valeure de préférence, doit/peut être
 * surchargée dans un formulaire par le user.
 * 
 * @param {Node}
 *            pNode noeud Méta
 * @return {Boolean} true si surcharge. false sinon.
 */
cidManager.userOverloadedPrefMeta = function(pNode){
	if(!pNode) return false;
	var vName = pNode.getAttribute("name");
	for (var i = 0 ; i < this.fUserOverloadedMeta.length ; i++)
		if(this.fUserOverloadedMeta[i] == vName) return false;

	eval("var vCidPref = cidLib.fPrefMetas['"+vName+"'];");
	if(vCidPref && vCidPref.showInForm)return true;
	if(vName == "Content-type")return false;
	if(vName == "File-name")return true;
}

/**
 * Gestion du wizard. Activation/désactivation du bouton next.
 * 
 * @param {}
 *            pAdvance
 * @param {}
 *            pRewind
 */

// TODO
cidManager.abortUpload = function(){
	this.fTransport.abortUpload();
	return true
}

/**
 * Retourne un objet transport parmi la liste.
 * 
 * @param {id}
 *            pId
 * @return Si pas d'id retourne le premier transport. Sinon, retourne le
 *         transport avec l'id pId. Si pas de transport valide, retourne null.
 */
cidManager.getTransport = function(pId){	
	if(!pId && this.fTransports.length > 0)
		return  this.fTransports[0].transport;

	if(pId)
		for(var i = 0 ; i < this.fTransports.length ; i++)
			if(pId == this.fTransports[i].id) return  this.fTransports[i].transport;

	return null;
}
/**
 * Cette méthode va chercher la prochaine étape. Vérifie que l'ensemble des
 * informations nécessaires sont connues. - oui => Execute la prochaine étape. -
 * non => Instancie une page de settings.
 */
cidManager.executeNextStep = function(){
	var vStep = this.fProcess.getNextStep();
	
	
	for(var i = 0 ; i < vStep.useMetas.length ; i++){
		if(!this.fProperties.contains(vStep.useMetas[i])){
			var vMeta = this.getMetaDesc(vStep.useMetas[i])
			if(vMeta){
				var vValue = this.getPrefMetas(vMeta);
				if(vValue) this.fProperties.addProp(vStep.useMetas[i], vValue);
			}
		}
	}
	
	// Check Needed Meta
	var vMissingProps = new Array();
	for(var i = 0 ; i < vStep.needMetas.length ; i++){
		if(!this.fProperties.contains(vStep.needMetas[i])){
			var vMeta = this.getMetaDesc(vStep.needMetas[i])
			if(vMeta){
				var vValue = this.getPrefMetas(vMeta);
				if(vValue && !this.userOverloadedPrefMeta(vMeta)){
					this.fProperties.addProp(vStep.needMetas[i], vValue);
				}
				else{
					vMissingProps.push(vMeta);
				}
			}
			else{
				window.alert("The recieved manifest is not consistent. Please contact the server administrator.");
				return;
			}
		}
	}
	// If need new metas...
	if(vMissingProps.length){
		this.makeSettingsPage(vMissingProps, cidLib.getLabel(this.fProcess.node));
		if(this.fAuth) this.fAuth.authToDo = false;
		this.changePanel("params");
	}
	else
		this.executeStep();
}
/**
 * Execution de la prochaine étape
 */
cidManager.executeStep = function(){
	if(this.fAuth && this.fAuth.authToDo){
		this.fAuth.authToDo = false;
		return;
	}
	var vStep = this.fProcess.getNextStep();
	//TODO => Système en fonction de la sélection d'un fichier...
	if(vStep.node.localName == "upload" && this.fFile == null){
		cidManager.changePanel("upload");
		return;
	}
	var vSuccess = eval("this.fProcess.transport." + vStep.node.localName + "(vStep, this.fAuth)");
	this.cbExecutedStep(vSuccess);
}


cidManager.cbExecutedStep = function(pSuccess){
	if(pSuccess){	
		//TODO
		this.fProcess.stepProcessed();
		var vNextStep = this.fProcess.getNextStep();
		if(vNextStep){
			this.executeNextStep();
		}
		else{
			this.fSuccess = true;
			this.changePanel("end");
			var vPar = document.createElement("p").appendChild(document.createTextNode("The CID process was correctly executed."));
			document.getElementById("end").appendChild(vPar);
			
		}
	}
}

cidManager.fileSelectionChange = function(){
	var vNextStep = document.getElementById("uploadNextStep");
	vNextStep.setAttribute("disabled", "true");
	if(document.getElementById("fileForm").files.length)
		vNextStep.removeAttribute("disabled");
}

cidManager.getMetaDesc = function(pName){
	for (var i = 0 ; i < this.fMetas.length ; i++){
		if(this.fMetas[i].getAttribute("name") == pName) return this.fMetas[i];
	}
	return null;
}

cidManager.changePanel = function(pTo){
	var vParts = document.getElementById("CIDContainer");
	for(var i = 0 ; i < vParts.children.length ; i++) vParts.children[i].style.display = "none"
	document.getElementById(pTo).style.display = null;
	
	if(pTo == "end" && this.fSuccess && this.cb) this.cb(this.fProperties, this.cbParams);
}

cidManager.nextPanel = function(){
	try{
		var vParts = document.getElementById("CIDContainer");
		var vSelected;
		for(var i = 0 ; i < vParts.children.length ; i++) if(vParts.children[i].style.display != "none") vSelected = vParts.children[i].id;
		switch(vSelected){			
			case "processSelection" :
				var vRadios = document.getElementsByClassName("processSelRadio");
				var vSelIndex;
				for(var i = 0 ; i < vRadios.length ; i++) if(vRadios[i].checked) vSelIndex = j;
				this.initProcess(this.fAcceptedProcesses.splice(selIndex, 1)[0]);
				this.executeNextStep();
			break;
			
			
			case "params" :
				if(this.fMetasInForm){
					for (var i = 0 ; i < this.fMetasInForm.length ; i++){
						var vName = this.fMetasInForm[i].getAttribute("name");
						var vCard = this.fMetasInForm[i].getAttribute("cardinality");
						
						var vValues = new Array();
						var vMetaForms = window.document.getElementsByClassName(vName);
						for(var j = 0 ; j < vMetaForms.length ; j++){
							if(vMetaForms[j].value) vValues.push(vMetaForms[j].value)
						}
						if((vCard==1 || vCard=="+") && !vValues.length){
							window.alert("The form is not properly completed. The field "+vName+ " must be filled.");
							return;
						}
						
						if(vValues.length){
							this.fProperties.removeProp(vName);
							for(var j = 0 ; j < vValues.length ; j++) this.fProperties.addProp(vName, vValues[j]);
							this.fUserOverloadedMeta.push(vName);
						}
					}
				}
				this.executeStep();
			break;
			
			case "upload" :
				var vFileForm = document.getElementById("fileForm");
				if(vFileForm.files.length){
					this.fFile = vFileForm.files[0];
					this.executeNextStep();
				}
				else
					window.alert("You must choose a file to upload.");
			break;
			case "interact" :
				this.fProcess.stepProcessed();
				var vNextStep = this.fProcess.getNextStep();
				if(vNextStep){
					this.executeNextStep();
				}
				else{
					this.fSuccess = true;
					this.changePanel("end");
					var vPar = document.createElement("p").appendChild(document.createTextNode("The CID process was correctly executed."));
					document.getElementById("end").appendChild(vPar);
				}
			break;
		}
		
	}catch(e){
		console.log("btnCID::" + e);
	}
}