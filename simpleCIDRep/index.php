<?php
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

include 'params.php';
include 'lib.php';

switch ($_SERVER['REQUEST_METHOD']) {
case 'GET':
	
	echo "<?xml version='1.0' encoding='UTF-8'?>
<cid:cid xmlns:cid='http://www.kelis.fr/cid/v1/core'>
	<cid:authentication>
		";
	if($authorizeNoneAuth) echo "<cid:none/>
		";
	if($authorizeBasicHttpAuth)	echo "<cid:basicHttp/>
 		";
	echo "</cid:authentication>
	<cid:content>
		<cid:simpleContent mymetype='*/*'/>
	</cid:content>
	<cid:protocol>
		<cid:singleHttpRequest method='POST' url=\"".$_SERVER['PHP_SELF']."\">
			<cid:negotiation>
				<cid:frameweb/>
			</cid:negotiation>
		</cid:singleHttpRequest>
	</cid:protocol>
</cid:cid>";
	header("Content-Type:application/xml");

	break;
case 'POST':
	if(!isset($_POST["pathInput"])){
		if ($authorizeBasicHttpAuth && (array_key_exists($_SERVER['PHP_AUTH_USER'], $users ) == null || $users[$_SERVER['PHP_AUTH_USER']]!=$_SERVER['PHP_AUTH_PW'])){
				header('WWW-Authenticate: Basic', false, 401);
				exit;	
		} else {
			echo "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01 Transitional//EN' 'http://www.w3.org/TR/html4/loose.dtd'>
			<html>				
			<head>
			<script src='http://".$_SERVER["HTTP_HOST"].str_replace("/index.php", "/", $_SERVER["REQUEST_URI"])."js/fileSelector.js'></script>
			<script>fs=";
			echo getUploadFs($localUploadsFolder);
			echo "</script>
			</head>
			<body>";
			$path = upload($tempFolder, $_FILES["upload"]);
			if($path){
				echo "<form  enctype='multipart/form-data' action='".$_SERVER['PHP_SELF']."' method='post'>
					<p>Fichier upload&eacute; : </p>
					<input id='uploadedFile' name='uploadedFile' style='display:none' type='text' value='".$_FILES['upload']['name']."'/>
						<fieldset>
							<legend>Choix de l'URL d'upload</legend>
							<div id='fileSelector'/>
						</fieldset>
						<input id='pathInput' name='pathInput' type=text value=''/>		
						<input id='finalizeUpload' type='submit' value='send'/>
					</form>
					<script>fileSelector.loadContener(new Array());</script>
				</body>
			</html>";	  
			}
			else
				echo "<p>Erreur lors de l'envoi du fichier</p>";	
		}
	}
	elseif(rename ( $tempFolder.$_POST['uploadedFile'], $localUploadsFolder.$_POST['pathInput'] ))
			header('Location: html/uploaded.html');
	else{
			header('Location: html/error.html');
	}
	
	break;

default:
	header("Allow:GET, POST",false, 405);
}