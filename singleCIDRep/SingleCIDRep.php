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

$vManifest = "http";
if(isset($_SERVER['HTTPS'])) $vManifest .= "s";
$vManifest .= "://".$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'];
$vScriptname=end(explode('/',$_SERVER['PHP_SELF']));
$vUploadPath = str_replace("/".$vScriptname,'',$vManifest);

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
			<cid:basicHttp testUrl=\"".$_SERVER['PHP_SELF']."?cdaction=testAuth\"/>
		</cid:authentication>
		<cid:content>
			<cid:simpleContent mymetype='*/*'/>	
		</cid:content>
		<cid:protocol>
			<cid:singleHttpRequest method='POST'  multipartField='upload' url='".$_SERVER['PHP_SELF']."?cdaction=upload'>
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
					case "testAuth" :
						if ($_SERVER['PHP_AUTH_USER']!= $fUser || $_SERVER['PHP_AUTH_PW'] != $fPassword)
							header('WWW-Authenticate: Basic', false, 401);
						exit;
					break;
					
					case "success" :
						echo "<html><head><title>Success</title><style>";
					printBaseCSSRules();
					echo "</style></head><body><h1>Upload succed</h1><p>Your package was correctly uploaded on this SingleCidRep. Visit <a href='$vUploadPath'>$vUploadPath</a> to consult it.</p></body></html>";
					break;
					
					case "init" :
						echo "<!DOCTYPE html PUBLIC '-//W3C//DTD HTML 4.01 Transitional//EN' 'http://www.w3.org/TR/html4/loose.dtd'>
	<html>
		<head>
			<title>SingleCidRep Settings</title>
			<style>
				.ok{
					background-color:#e5ffd5;
				}
				.error{
					background-color:#f4d7d7;
				}";
				printBaseCSSRules();
				echo "</style>
		</head>
		<body>
			<h1>SingleCIDRep Settings</h1>
			<form method='post' action='?cdaction=init'>
				<script>
					isCorrect = function(){
					if(document.getElementById('user').value != new String() && document.getElementById('password').value == document.getElementById('confirmpassword').value && document.getElementById('password').value != new String())
						document.getElementById('submit').disabled=false;
					else
						document.getElementById('submit').disabled=true;
				}
				</script>
						
				<label for='user' style=' float:left; width:180px'>Login: </label>
				<input id='user' name='user' type='text' onchange=\"isCorrect(); if(this.value!= new String()) this.className='ok'; else this.className='error';\"/>
				<br/>
				<label for='password' style='float:left; width:180px'>Password:</label>
				<input id='password' name='password' type='password' onchange=\"isCorrect();
				/*on init*/
				if(this.className == new String() && document.getElementById('confirmpassword').className == new String()){
					if(this.value!= new String())	this.className='ok';
					else this.className='error';
				}
				else{
					if(this.value != document.getElementById('confirmpassword').value){
						this.className='error';
						document.getElementById('confirmpassword').className = 'error';
					}
					else{
						this.className='ok';
						document.getElementById('confirmpassword').className = 'ok';
					}
				}
				\"/>
				<br/>
				<label for='confirmpassword' style='float:left; width:180px'>Confirm:</label>
				<input id='confirmpassword' name='confirmpassword' type='password' onchange=\"isCorrect(); if(this.value!= new String() && this.value == document.getElementById('password').value){ this.className='ok'; document.getElementById('password').className = 'ok';} else {this.className='error';document.getElementById('password').className = 'error';}\"/>
				<br/>
				<label for='autodezip' style='float:left; width:180px' title='Check this box if you want to automatically dezip sended zipped package (such as Scenari websites and presentations).'>Auto-dezip:</label>
				<input type='checkbox' name='autodezip' id='autodezip' title='Check this box if you want to automatically dezip sended zipped package (such as Scenari websites and presentations).'/>
				<br/>
				<label for='phpUpload' style='float:left; width:180px' title='Leave this box unchecked unless you need to send php files (security hole).'>Authorize php upload:</label>
				<input type='checkbox' name='phpUpload' id='phpUpload' style='float:left;' title='Leave this box unchecked unless you need to send php files (security hole).'/>
				<br/>
				<input type='submit' id='submit' value='Initialize SingleCidRep' disabled='true' />
			</form>
			<p>PHP configuration: maximum upload size ".ini_get("upload_max_filesize").".</br>
			You should define a maximum upload size higher than 10M.</p>
		</body>
	<html/>";
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
				case "init":
					if(!is_writable(".")){
						echo "<html><head><title>Error</title><style>";
						printBaseCSSRules();
						echo "</style></head><body><h1>Permission error</h1><p>SingleCidRep parent folder is not writable by the webserver. Please, change the directory permissions in order to process the installation script.</p></body></html>";
					}
					else{
						try {
							mkdir("SCR-Upload", 0755);
							$vParam = fopen("param.php", "w");
							fwrite($vParam, "<?php\n");
							fwrite($vParam, "\$fUser=\"".$_POST["user"]."\";\n");
							fwrite($vParam, "\$fPassword=\"".$_POST["password"]."\";\n");
					
							if(isset($_POST['autodezip']) && $_POST['autodezip'] == 'on') fwrite($vParam, "\$fAutoDezip=true;\n");
							else fwrite($vParam, "\$fAutoDezip=false;\n");
					
							if(isset($_POST['phpUpload']) && $_POST['phpUpload'] == 'on') fwrite($vParam, "\$fPhpUpload=true;\n");
							else fwrite($vParam, "\$fPhpUpload=false;\n");
					
							fwrite($vParam, "?>");
							fclose($vParam);
							$vIndex = fopen("index.php", "w");
							fwrite($vIndex, "<?php\n");
							fwrite($vIndex, "header('location: SCR-Upload');\n");
							fwrite($vIndex, "?>");
							fclose($vIndex);
							
							echo "<html><head><title>SingleCidRep installation succed</title><style>";
							printBaseCSSRules();
							echo "</style></head><body><h1>Your SingleCIDRep is now ready</h1><p>You should now remove the writing permission of the SingleCidRep parent directory.</p>
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
				
				case "testAuth":
					if ($_SERVER['PHP_AUTH_USER']!= $fUser || $_SERVER['PHP_AUTH_PW'] != $fPassword) {
						header('WWW-Authenticate: Basic', false, 401);
						exit;
					}
				break;
				
				case "upload":
					if ($_SERVER['PHP_AUTH_USER']!= $fUser || $_SERVER['PHP_AUTH_PW'] != $fPassword) {
						header('WWW-Authenticate: Basic', false, 401);
						exit;
					}
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
						$vContentDisposition = $_SERVER["HTTP_CONTENT_DISPOSITION"];
						$vStart = strrpos($vContentDisposition, "filename=\"")+10;
						$vSize = strlen($vContentDisposition) -1 - $vStart;
						$vFilename = substr($vContentDisposition,$vStart , $vSize);
					}
					if(checkPhpUpload($vFilename)){
						echo "Impossible to upload php file.";
						header("HTTP/1.1 403 forbidden");
						exit;
					}
					$vPath = "SCR-Upload/".basename($vFilename);
					echo $vFilename."\n";
					echo $vPath;
						
					if(move_uploaded_file($_FILES["upload"]['tmp_name'],$vPath)){
						if($fAutoDezip) unzip($vPath);
						header("Location:".$_SERVER["PHP_SELF"]."?cdaction=success", false, 201);
						
					}
					else{
						//Assume that if the delivery failed. The content is not conform to the expected type.
						header("HTTP1/1 415 unsupported media type", true, 415);
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
		break;
	}
}

function unzip($pPath){
	$vArr = array();
	$vZip = new ZipArchive();
	$vRes = $vZip->open($pPath);
	// if the $zip_file can be opened
	if($vRes === TRUE) {
		// traverse the index number of the files in archive, store in array the name of the files in archive
		for($i = 0; $i < $vZip->numFiles; $i++) {
			if(checkPhpUpload($vZip->getNameIndex($i))){
				echo "Unable to dezip the archive. The uploaded archive contains php files.";
				header("HTTP/1.1 403 forbidden", true, 403);
			}
			$vArr[] = $vZip->getNameIndex($i);
		}
		$vZip->extractTo("SCR-Upload");
		$vZip->close();
		unlink($pPath);
		return $vArr;
	}
	//else  echo "File correctly uploaded. Failed to dezip $zip_file , code: $vRes";
}

function checkPhpUpload($pName){
	include 'param.php';
	return (!$fPhpUpload  && (substr($pName, -3) === "php"));
}

function printBaseCSSRules(){
	echo "body{
			color: #515151;
			font-family: 'Open Sans', Helvetica, Arial, sans-serif;
			width: 600px;
	}";
}


?>