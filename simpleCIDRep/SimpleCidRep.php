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


if(!file_exists("param.php") && $_GET["cdaction"] != "init"){
	header("Location: ".$_SERVER["PHP_SELF"]."?cdaction=init");
}
else{
	include 'param.php';
	switch ($_SERVER['REQUEST_METHOD']) {
	case 'GET':
		
		if(!isset($_GET["cdaction"])){
			echo "<?xml version='1.0' encoding='UTF-8'?>
			<cid:cid xmlns:cid='http://www.kelis.fr/cid/v1/core'>
				<cid:authentication>
					<cid:basicHttp testURL=\"".$_SERVER['PHP_SELF']."?cdaction=testAuth\"/>
			 	</cid:authentication>
				<cid:content>
					<cid:simpleContent mymetype='*/*'/>
				</cid:content>
				<cid:protocol>
					<cid:singleHttpRequest method='POST' multipartField='upload' url=\"".$_SERVER['PHP_SELF']."?cdaction=upload\">
						<cid:negotiation>
							<cid:frameweb/>
						</cid:negotiation>
					</cid:singleHttpRequest>
				</cid:protocol>
			</cid:cid>";
			header("Content-Type:application/xml");
		}
		
		else{
			switch ($_GET["cdaction"]){
				case "negociationFrame":
					if ((array_key_exists($_SERVER['PHP_AUTH_USER'], $fUsers ) == null || $fUsers[$_SERVER['PHP_AUTH_USER']]!=$_SERVER['PHP_AUTH_PW'])){
					 header('WWW-Authenticate: Basic', false, 401);
					exit;
					} else {
						if(file_exists($fTempFolder.$_GET["uploadedFile"])){						
							echo "<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01 Transitional//EN' 'http://www.w3.org/TR/html4/loose.dtd'>
							<html>
							<head>
							<script>";
							printFileSectorJs();
							echo "fs=";
							getUploadFs($fLocalUploadsFolder);
							echo "</script>
							<style>";
							printBaseCSSRules();
							printFileSelectorCSS();
							echo "</style>
							</head>
							<title>File selector</title>
							<body>";
							echo "<h1>Choose the final file destination</h1>
									<form  enctype='multipart/form-data' action='".$_SERVER['PHP_SELF']."?cdaction=finalizeUpload' method='post'>
									<p>Uploaded file: ".$_GET["uploadedFile"]."</p>
									<input id='uploadedFile' class='hidden' name='uploadedFile'  type='text' value='".$_GET["uploadedFile"]."'/>
									<input id='sendedLocation' name='sendedLocation' class='hidden' type='text'/>
							
										<fieldset>
											<legend>Choix de l'URL d'upload</legend>
											<div id='toolbar'>
												<input type='button'  value='home' alt='home button' class='toolboxCommand' id='home'  onclick='fileSelector.loadContener(new Array());'/>
												<label class='toolboxCommand'>Location: </label>
												<input type='text'  class='toolboxCommand' id='location' disabled='true'  />
												<input type='button' value='new folder' alt='new folder button'  class='toolboxCommand' id='newFolder' onclick='fileSelector.newFolder();'/>
											</div>
											<ul id='fileSelector'/>
										</fieldset>
										<label for='pathInput' id='pathInputLabel'>Final path: </label>
										<span id='path'/>
										<input id='pathInput' this.class='ok' name='pathInput' type='text' value='".$_GET["uploadedFile"]."'onkeyup='fileSelector.updateInputState();' />
										<input id='finalizeUpload' type='submit'  value='send'/></br>";
										$finfo = finfo_open(FILEINFO_MIME_TYPE);
							if(finfo_file($finfo, $fTempFolder.$_GET["uploadedFile"])=="application/zip")
								echo "<label for='autoDezip'>AutoDezip: </label><input type='checkbox' id='autoDezip' name='autoDezip' onclick='fileSelector.checkAutoDezip()'/>
										</form>
										<script>fileSelector.loadContener(new Array());</script>
										</body>
										</html>";
						}
						else{
							echo "<html><head><title>Error</title><style>";
							printBaseCSSRules();
							echo "</style></head><body><h1>Error</h1><p>There is no file named ".$_GET["uploadedFile"]." in tmp directory.</p></body></html>";
						}
					}
				break;
				
				case "init":
					if(!is_writable(".")){
						echo "<html><head><title>Error</title><style>";
						printBaseCSSRules();
						echo "</style></head><body><h1>Permission error</h1><p>SingleCidRep parent folder is not writable by the webserver. Please, change the directory permissions in order to process the installation script.</p></body></html>";
					}
					else{
					echo "<!DOCTYPE html PUBLIC '-//W3C//DTD HTML 4.01 Transitional//EN' 'http://www.w3.org/TR/html4/loose.dtd'>
						<html>
							<head>
								<title>SimpleCidRep Settings</title>
								<style>";
					printInitCSS();
					printBaseCSSRules();
					echo "		</style>
								<script>
										fUsers = 1;
								
										isCorrect = function(){
										var vCorrect = (document.getElementById('uploadDir').value != new String()) && (document.getElementById('tmpDir').value != new String())
										vCorrect = vCorrect && document.getElementById('uploadDir').value != document.getElementById('tmpDir').value;
										var vHTMLUsers = document.getElementById('users');
										for(var i = 1 ; i < vHTMLUsers.children.length ; i++){
											vCorrect = vCorrect && vHTMLUsers.children[i].children[0].children[0].value != new String();
											vCorrect = vCorrect && vHTMLUsers.children[i].children[1].children[0].value != new String();
											vCorrect = vCorrect && vHTMLUsers.children[i].children[1].children[0].value == vHTMLUsers.children[i].children[2].children[0].value;
										}
							
										if(vCorrect)
											document.getElementById('submit').disabled=false;
										else
											document.getElementById('submit').disabled=true;
										}
										checkName = function(pString){return pString.match(/[\w._~&-]+/) && pString.match(/[\w._~&-]+/)[0]=== pString;}
										
										newUser = function(){
										
										var vTdLogin = document.createElement('td');
										var vLogin = document.createElement('input');
										vLogin.setAttribute('name','user['+fUsers+'][login]');
										vLogin.setAttribute('id', 'user'+fUsers+'login');
										vLogin.setAttribute('type','text');
										vLogin.onchange = function(){isCorrect(); if(this.value!= new String()) this.className='ok'; else this.className='error';}
										vTdLogin.appendChild(vLogin);			
							
										var vTdPassword = document.createElement('td');
										var vPassword = document.createElement('input');
										vPassword.setAttribute('name','user['+fUsers+'][password]');
										vPassword.setAttribute('id', 'user'+fUsers+'password');
										vPassword.setAttribute('type','password');
										vPassword.setAttribute('onchange', \"";
										printPasswordCheck("\"+fUsers+\"");
										echo"\");
										vTdPassword.appendChild(vPassword);

										var vTdPasswordConfirm = document.createElement('td');
										var vPasswordConfirm = document.createElement('input');
										vPasswordConfirm.setAttribute('id', 'user'+fUsers+'confirm');
										vPasswordConfirm.setAttribute('type','password');
										vPasswordConfirm.setAttribute('onchange', \"";
										printConfirmCheck("\"+fUsers+\"");
										echo "\");
										vTdPasswordConfirm.appendChild(vPasswordConfirm);
							
										var vTdDelete = document.createElement('td');
										var vDelete = document.createElement('input');
										vDelete.setAttribute('type', 'button');
										vDelete.className='deleteButton';
										vDelete.setAttribute('value', 'delete');
										vDelete.onclick = function(){this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);}
										vTdDelete.appendChild(vDelete);
							
										var vTr = document.createElement('tr');
										vTr.appendChild(vTdLogin);
										vTr.appendChild(vTdPassword);
										vTr.appendChild(vTdPasswordConfirm);
										vTr.appendChild(vTdDelete);
							
										fUsers++;
										
										document.getElementById('users').appendChild(vTr);
										isCorrect();
									}
							
									</script>
							</head>
							<body>
								<h1>SimpleCIDRep Settings</h1>
								<form method='post' action='?cdaction=init'>
									
									<label for='uploadDir' style=' float:left; width:180px'>Upload directory: </label>
									<input id='uploadDir'class='ok' name='uploadDir' type='text' value='uploads' onchange=\"isCorrect(); if(checkName(this.value) && this.value!=document.getElementById('tmpDir').value) this.className='ok'; else this.className='error';\"/>
									<br/>		
									<label for='tmpDir' style=' float:left; width:180px'>Tmp directory: </label>
									<input id='tmpDir' class='ok' name='tmpDir' type='text' value='tmp' onchange=\"isCorrect(); if(checkName(this.value)&& this.value!=document.getElementById('uploadDir').value) this.className='ok'; else this.className='error';\"/>
									<br/>		
									
									<label>Users:</label>
									<table >
									  <tbody id='users'>
									  <tr>
									    <td>Login</td>
									    <td>Password</td>
										<td>Confirm password</td>
									  </tr>
									  <tr>
									    <td>
											<input id='user0login' name='user[0][login]' type='text' onchange=\"isCorrect(); if(this.value!= new String()) this.className='ok'; else this.className='error';\"/>
										</td>
										<td>
											<input id='user0password' name='user[0][password]' type='password' onchange=\"";
											printPasswordCheck(0);
											echo "\"/>
										</td>
										<td>
											<input id='user0confirm' type='password' onchange=\"";
											printConfirmCheck(0);
											echo "\"/>
										</td>
									  </tr>
									</tbody>
									</table>
									<input type='button' id='addUser' value='add user' alt='add user button' onclick='newUser();'/>
									<br/>
									<label for='phpUpload' style='float:left; width:180px' title='Leave this box unchecked unless you need to send php files (security hole).'>Authorize php upload:</label>
									<input type='checkbox' name='phpUpload' id='phpUpload' style='float:left;' title='Leave this box unchecked unless you need to send php files (security hole).'/>
									<br/>
									<input type='submit' id='submit' value='Initialize SimpleCidRep' disabled='true' />
								</form>
							</body>
						<html/>";
					}
				break;
				
				default:
					echo "<html><head><title>Error</title><style>";
					printBaseCSSRules();
					echo "</style></head><body><h1>Error : file not found</h1><p>The cdaction ".$_GET["cdaction"]." is not used.</p></body></html>";
					header("HTTP/1.0 404 Not Found");
				break;
			}
		}
	break;
	case 'POST':
		switch ($_GET["cdaction"]){
			//create new folder in upload space
			case "newFolder":
				echo "hello";
				if(!mkdir($fLocalUploadsFolder.$_POST["newFolderName"], 0755))
					header("HTTP1/1 500 internal server error");
			break;
			
			//upload package
			case "upload":
				if ((array_key_exists($_SERVER['PHP_AUTH_USER'], $fUsers ) == null || $fUsers[$_SERVER['PHP_AUTH_USER']]!=$_SERVER['PHP_AUTH_PW'])){
					header('WWW-Authenticate: Basic', false, 401);
					exit;
				} else {
					if(!is_writable("SCR-Upload")){
						header("HTTP1/1 500 internal server error");
						exit;
					}
					if($_FILES["upload"]["error"]){
						switch ($_FILES["upload"]["error"]){
							case 1:
								echo "The uploaded file exceeds the upload_max_filesize directive in php.ini.";
								header("HTTP1/1 413 request entity too large", false, 413);
								break;
					
							case 2:
								echo "The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form. ";
								header("HTTP1/1 413 request entity too large", false, 413);
								break;
									
							case 3:
								echo "The uploaded file was only partially uploaded.";
								header("HTTP1/1 415 unsupported media type", true, 415);
								break;
					
							case 4:
								echo "No file was uploaded.";
								header("HTTP1/1 415 unsupported media type", true, 415);
								break;
									
							case 6:
								echo "Missing a temporary folder.";
								header("HTTP1/1 500 internal server error");
								break;
									
							case 7:
								echo "Failed to write file to disk.";
								header("HTTP1/1 500 internal server error");
								break;
									
							case 8:
								echo "A PHP extension stopped the file upload. PHP does not provide a way to ascertain which extension caused the file upload to stop; examining the list of loaded extensions with phpinfo() may help.";
								header("HTTP1/1 500 internal server error");
								break;
									
							default:
								echo "unknown error.";
								header("HTTP1/1 418 i'm a teapot", true, 418);
								break;
						}
						exit;
					}
					$vFilename = $_FILES["upload"]['name'];
						
					if($vFilename == "blob"){
						$vCcontentDisposition = $_SERVER["HTTP_CONTENT_DISPOSITION"];
						$vStart = strrpos($vCcontentDisposition, "filename=\"")+10;
						$vSize = strlen($vCcontentDisposition) -1 - $vStart;
						echo substr($vCcontentDisposition,$vStart , $vSize);
						$vFilename = substr($vCcontentDisposition,$vStart , $vSize);
					}
				
					$vPath = $fTempFolder.$vFilename;
					
					if(checkPhpUpload($vFilename)){
						echo "Impossible to upload php file.";
						header("HTTP/1.1 403 forbidden");
						exit;
					}
					
					if(move_uploaded_file($_FILES["upload"]['tmp_name'],$vPath))
						header("Location:".$_SERVER['PHP_SELF']."?cdaction=negociationFrame&uploadedFile=".$vFilename, false, 202);
					else header("HTTP1/1 415 unsupported media type");
				}
			break;
			
			//move/dezip package in upload space
			case "finalizeUpload":
				if(isset($_POST["autoDezip"])){					
					unzip($fTempFolder.$_POST['uploadedFile'], $fLocalUploadsFolder.substr($_POST["sendedLocation"], 1));
					echo "<html><head><title>Success</title><style>";
					printBaseCSSRules();
					echo "</style></head><body><h1>Upload succed</h1><p>Your package was correctly uploaded and dezipped on this SimpleCIDRep. Visit <a href='".$fLocalUploadsFolder.substr($_POST["sendedLocation"], 1)."'>".$fLocalUploadsFolder.substr($_POST["sendedLocation"], 1)."</a> to consult it.</p></body></html>";
									}
				elseif(rename ( $fTempFolder.$_POST['uploadedFile'], $fLocalUploadsFolder.substr($_POST["sendedLocation"], 1).$_POST['pathInput'] )){
					echo "<html><head><title>Success</title><style>";
					printBaseCSSRules();
					echo "</style></head><body><h1>Upload succed</h1><p>Your package was correctly uploaded on this SimpleCIDRep. Visit <a href='".$fLocalUploadsFolder.substr($_POST["sendedLocation"], 1)."'>".$fLocalUploadsFolder.substr($_POST["sendedLocation"], 1)."</a> to consult it.</p></body></html>";
						
				}
				else{
					echo "<html><head><title>Error</title><style>";
					printBaseCSSRules();
					echo "</style></head><body><h1>Upload error</h1><p>Error during the finalization of the upload.</p></body></html>";
				}
			break;
			
			//auth ckecking.
			case "testAuth":
				if ((array_key_exists($_SERVER['PHP_AUTH_USER'], $fUsers ) == null || $fUsers[$_SERVER['PHP_AUTH_USER']]!=$_SERVER['PHP_AUTH_PW'])){
					header('WWW-Authenticate: Basic', false, 401);
					exit;
				}
			break;
			
			case "init":
				if(!is_writable(".")){
					echo "<html><head><title>Error</title><style>";
					printBaseCSSRules();
					echo "</style></head><body><h1>Permission error</h1><p>SimpleCidRep parent folder is not writable by the webserver. Please, change the directory permissions in order to process the installation script.</p></body></html>";
				}
				else{
					try {
						mkdir($_POST["uploadDir"], 0755);
						mkdir($_POST["tmpDir"], 0755);						
						$vParam = fopen("param.php", "w");
						fwrite($vParam, "<?php\n");
						fwrite($vParam, "\$fLocalUploadsFolder=\"".$_POST["uploadDir"]."/\";\n");
						fwrite($vParam, "\$fTempFolder=\"".$_POST["tmpDir"]."/\";\n");
						fwrite($vParam, "\$fUsers = array(");
						$vFirst = true;
						foreach($_POST["user"] as $vUser){
							if($vFirst) $vFirst = false;
							else fwrite($vParam, ",");
							fwrite($vParam, "'".$vUser["login"]."'=>'".$vUser["password"]."'");
						}
						fwrite($vParam, ");\n");
								
						if(isset($_POST['phpUpload']) && $_POST['phpUpload'] == 'on') fwrite($vParam, "\$fPhpUpload=true;\n");
						else fwrite($vParam, "\$fPhpUpload=false;\n");
				
						fwrite($vParam, "?>");
						fclose($vParam);
						$vIndex = fopen("index.php", "w");
						fwrite($vIndex, "<?php\n");
						fwrite($vIndex, "header('location: ".substr($fLocalUploadsFolder, 0,-1)."');\n");
						fwrite($vIndex, "?>");
						fclose($vIndex);
						
						$vManifest = "http";
						if(isset($_SERVER['HTTPS'])) $vManifest .= "s";
						$vManifest .= "://".$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'];
						$vScriptname=end(explode('/',$_SERVER['PHP_SELF']));
						$vUploadPath = str_replace("/".$vScriptname,'',$vManifest);
						
						echo "<html><head><title>SimpleCidRep installation succed</title><style>";
						printBaseCSSRules();
						echo "</style></head><body><h1>Your SimpleCIDRep is now ready</h1><p>You should now remove the writing permission of the SimpleCidRep parent directory.</p>
						<p>Your CID manifest URL is: <a href='$vManifest'>$vManifest</a>.</p>
						<p>Your uploads will be available at: <a href='$vUploadPath'>$vUploadPath</a>.</p></body></html>";
					}
					catch (Exception $pException){
					echo "<html><head><title>Error</title><style>";
					printBaseCSSRules();
					echo "</style></head><body><h1>Error durring the installation process</h1><p>";
						echo "Caught exception: ".$pException->getMessage()."\n";
										echo "</p>";
										header("HTTP1/1 500 internal server error");
					}
				}
			break;
			
			default:
				echo "<html><head><title>Error</title><style>";
					printBaseCSSRules();
					echo "</style></head><body><h1>Error : file not found</h1><p>The cdaction ".$_GET["cdaction"]." is not used.</p></body></html>";
				header("HTTP/1.0 404 Not Found");
			break;
		}
		
		break;
	
	default:
		header("Allow:GET, POST",false, 405);
	}
}

function getUploadFs($pPath){
	echo "{";
	echo "name:\"";
	if($pPath[strlen($pPath)-1] =='/' )
		$pPath = substr($pPath, 0, strlen($pPath)-1);
	$vFolder = substr(strrchr($pPath, '/')  ,1);
	echo $vFolder."\",";
	echo "content:[";
	$vFiles = scandir($pPath);
	$vFirst=true;
	foreach($vFiles as $vFile){
		if(is_file($pPath."/".$vFile)){
			if(!$vFirst){
				echo "," ;
			}
			else{$vFirst = false;}
			echo"{name:\"".$vFile ."\"}";
		}
		else if($vFile!="." && $vFile!=".." && is_dir($pPath."/".$vFile)){
			if(!$vFirst){
				echo "," ;
			}
			else{$vFirst = false;}
			getUploadFs($pPath."/".$vFile);
		}
	}
	echo"]}";

}

function unzip($pZip, $pPath){
	include 'param.php';
		
	$vArr = array();
	$vZip = new ZipArchive();
	$vRes = $vZip->open($pZip);
	// if the $zip_file can be opened
	if($vRes === TRUE) {
		// traverse the index number of the files in archive, store in array the name of the files in archive
		for($i = 0; $i < $vZip->numFiles; $i++) {
			if(checkPhpUpload($vZip->getNameIndex($i))){
				echo "Unable to dezip the archive. The uploaded archive contains php files.";
				header("HTTP/1.1 403 forbidden");
				exit;
			}
			$vArr[] = $vZip->getNameIndex($i);
		}
		$vZip->extractTo($pPath);
		$vZip->close();
		unlink($pZip);
		return $vArr;
	}
	//else  echo "File correctly uploaded. Failed to dezip $zip_file , code: $vRes";
}

function checkPhpUpload($pName){
	include 'param.php';
	return (!$fPhpUpload && (substr($pName, -3) === "php"));
}


function printPasswordCheck($pNumber){
echo "isCorrect();";
echo "/*on init*/";
echo "if(this.className == new String() && document.getElementById('user".$pNumber."confirm').className == new String()){";
echo "if(this.value!= new String())	this.className='ok';";
echo "else this.className='error';";
echo "}else{";
echo "if(this.value != document.getElementById('user".$pNumber."confirm').value){";
echo "this.className='error';";
echo "document.getElementById('user".$pNumber."confirm').className = 'error';";
echo "}else{";
echo "this.className='ok';";
echo "document.getElementById('user".$pNumber."confirm').className = 'ok';";
echo "}}";
	
}

function printConfirmCheck($pNumber){
	echo "isCorrect();";
	echo "if(this.value!= new String() && this.value == document.getElementById('user".$pNumber."password').value){";
	echo "this.className='ok';document.getElementById('user".$pNumber."password').className = 'ok';}";
	echo "else {this.className='error';document.getElementById('user".$pNumber."password').className = 'error';}";
	
}

function printFileSectorJs(){
	echo "
onload = function(){fileSelector.loadContener(new Array());}

fileSelector = {
		fCommands : new Array(),
		
		loadContener : function(pOlderPath){
			
			fileSelector.fCurrentPath = pOlderPath;
		
			fileSelector.unloadContener();
			//get the contener node
			var vContener = document.getElementById('fileSelector');
			//rebuild current Path and build subTable
			var vPath = '/';
			var vCurrent = fs;
			var vSubFolder;
			for(var i =0; i < pOlderPath.length ; i++){
				vSubFolder = true;
				vPath += vCurrent.content[pOlderPath[i]].name+'/';
				vCurrent = vCurrent.content[pOlderPath[i]];
			}
		
			
			document.getElementById('location').value = vPath;
			document.getElementById('sendedLocation').value = vPath;

			document.getElementById('path').firstChild.nodeValue = vPath;
					
			var vFileExplorer = document.getElementById('fileSelector');
			
			if(vSubFolder){
				var vParentFolder = document.createElement('li');
				vParentFolder.className = 'parentFolder';
				var vParentPath = pOlderPath.toString();
				vParentPath = vParentPath.substring(0,vParentPath.lastIndexOf(','));
				vParentFolder.setAttribute('ondblclick', 'fileSelector.loadContener(['+vParentPath+']);');
				
				vParentFolder.appendChild(document.createTextNode('..'));
				vFileExplorer.appendChild(vParentFolder);
			}
			
			for ( var i = 0; i < vCurrent.content.length; i++) {
				var entry = document.createElement('li');
				if(vCurrent.content[i].content){
					entry.className ='folder';
					var pNewPath = pOlderPath.slice(); pNewPath.push(i);
					entry.setAttribute('ondblclick', 'fileSelector.loadContener(['+pNewPath.toString()+']);');
					entry.appendChild(document.createTextNode(vCurrent.content[i].name+'/'));
		
					
				}
				else{
					entry.className = 'file';
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
	
	updateInputState : function(){
		var vInput = document.getElementById('pathInput');
		if(this.checkName(vInput.value)) {
			vInput.className='ok';
			document.getElementById('finalizeUpload').disabled=false;
		}else{
			vInput.className='error';
			document.getElementById('finalizeUpload').disabled=true; 
		}	
	},
	
	checkName : function(pString){
		return pString.match(/[\w._~&-]+/) && pString.match(/[\w._~&-]+/)[0]=== pString;
	},
	
	newFolder : function(){
		var vEntry = document.createElement('li');
		vEntry.className='folder';
		vEntry.id='newFolderEntry';
		
		var vFolderName = document.createElement('input');
		vFolderName.setAttribute('type', 'text');
		vFolderName.setAttribute('id', 'folderName');
		
		var vCancel = document.createElement('input');
		vCancel.setAttribute('type', 'button');
		vCancel.setAttribute('id', 'folderNameCancel');
		vCancel.setAttribute('value', 'Cancel');
		vCancel.setAttribute('onclick', 'fileSelector.cancelNewFolder();');
		
		var vValid = document.createElement('input');
		vValid.setAttribute('type', 'button');
		vValid.setAttribute('id', 'folderNameValid');
		vValid.setAttribute('value', 'Valid');
		vValid.setAttribute('onclick', 'fileSelector.validNewFolder(document.getElementById(\'folderName\').value, document.getElementById(\'sendedLocation\').value);');

		
		vEntry.appendChild(vFolderName);
		vEntry.appendChild(vCancel);
		vEntry.appendChild(vValid);

		document.getElementById('fileSelector').appendChild(vEntry);
			
		document.getElementById('newFolder').disabled=true;
	},
	
	cancelNewFolder : function(){
		var vEntry = document.getElementById('newFolderEntry');
		
		
		vEntry.parentNode.removeChild(vEntry);
		
		document.getElementById('newFolder').disabled=false;
	},
	
	validNewFolder : function(pName, pPath){
		if(!this.checkName(pName))
			alert('Error in the foldername (use only alphadigitals characters or &.~-_)');
		else{
			var vXhr = new XMLHttpRequest();
			var vFd = new FormData();
			vFd.append('newFolderName', pPath+pName);
			vXhr.open('POST', window.location.pathname+'?cdaction=newFolder', false);
			vXhr.send(vFd);
			switch(vXhr.status){
				case 200 :
				vParentFolder = fs;
				var vPath = pPath.substr(1).split('/');
				for (var i = 0; i < vPath.length; i++) {
					for (var j = 0; j < vParentFolder.content.length; j++) {
						if(vParentFolder.content[j].name == vPath[i]){
							vParentFolder = vParentFolder.content[j];
							break;
						}
					}
				}

				var vEntry = document.createElement('li');
				vEntry.className ='folder';
				var vLoadContener = 'fileSelector.loadContener([' + fileSelector.fCurrentPath;
				if(fileSelector.fCurrentPath != '')
					vLoadContener += ',';
				vLoadContener+=vParentFolder.content.length + '])';
				vEntry.setAttribute('ondblclick', vLoadContener);
				vEntry.appendChild(document.createTextNode(pName+'/'));
				this.cancelNewFolder();
				document.getElementById('fileSelector').appendChild(vEntry);

				vParentFolder.content.push({name : pName, content : new Array()});

				break;
				
				default:
					alert('Error during the HTTP request. HTTP status: '+vXhr.status);
				
			}
			
		}
		
	},
	
	checkAutoDezip : function(){
		if (document.getElementById('autoDezip').checked){
			document.getElementById('pathInput').disabled=true;
			document.getElementById('finalizeUpload').disabled=false;
		}
		else{
			document.getElementById('pathInput').disabled=false;
			this.updateInputState();
		}
	}
}
";
}

function printBaseCSSRules(){
	echo "body{
			color: #515151;
			font-family: 'Open Sans', Helvetica, Arial, sans-serif;
			width: 600px;
	}";
}

function printFileSelectorCSS(){
	echo ".hidden{
		display:none;
	}
	#toolbar{
		border-bottom: 2px solid grey;
		padding-bottom:4px;margin-bottom:4px;
	}
	input[type='button']{
		background-color: transparent;
		background-repeat: no-repeat;
		height:24px;
		width:48px;
		border:none;
		color:transparent;
	}
	#home{
		background-image: url(https://raw.github.com/scenari/cid/master/simpleCIDRep/icons/home.png);
	}
	#newFolder{
		background-image: url(https://raw.github.com/scenari/cid/master/simpleCIDRep/icons/newFolder.png);
	}
	#folderNameCancel{
		background-image: url(https://raw.github.com/scenari/cid/master/simpleCIDRep/icons/cancel.png);
	}
	#folderNameValid{
		background-image: url(https://raw.github.com/scenari/cid/master/simpleCIDRep/icons/valid.png);
	}
	fieldset{
		height:300px;
	}
	#location{
		width:386px;
		margin-right:5px;
	}
	#pathInputLabel{
		float:left;
		padding-top: 2px;
	}
	#pathInput{
		margin-left:4px;
		margin-right:4px;
	}
	#finalizeUpload{
		float:right;
	}
	.parentFolder{
		list-style-image:url(https://raw.github.com/scenari/cid/master/simpleCIDRep/icons/parent.png);
	}
	.folder{
		list-style-image:url(https://raw.github.com/scenari/cid/master/simpleCIDRep/icons/folder.png);
	}
	.file{
		list-style-image:url(https://raw.github.com/scenari/cid/master/simpleCIDRep/icons/file.png);
	}";
}
function printInitCSS(){
	echo ".ok{
		background-color:#e5ffd5;
	}
	.error{
		background-color:#f4d7d7;
	}
	#addUser{
		background-color: transparent;
		background-image: url(https://raw.github.com/scenari/cid/master/simpleCIDRep/icons/newUser.png);
		background-repeat: no-repeat;
		height:24px;
		width:46px;
		border:none;
		color:transparent;
		margin-left:4px;
	}
	.deleteButton{
		background-color: transparent;
		background-image: url(https://raw.github.com/scenari/cid/master/simpleCIDRep/icons/cancel.png);
		background-repeat: no-repeat;
		height:24px;
		width:20px;
		border:none;
		color:transparent;
	}";
}
