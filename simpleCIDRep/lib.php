<?php

function upload($dest, $file) {
	/*
	$fAcceptedExt = array('pdf', 'zip');
	$fUploadedExt = strtolower(  substr(  strrchr($_FILES['icone']['name'], '.')  ,1)  );
	if ($_FILES['file']['error'] > 0){}
	if ( in_array($fUploadedExt,$fAcceptedExt) ) {}
	$name = "file.{$fUploadedExt}";
	$resultat = move_uploaded_file($_FILES['file']['tmp_name'],$name);
	*/
	$path = $dest . basename($file['name']);
	if(move_uploaded_file($file['tmp_name'],$path )){
		return $path;
	}
	else
		return null;
}

function getUploadFs($path){
	echo "{";
	echo "name:\"";
	if(str_split($path)[strlen($path)-1] =='/' )
		$path = substr($path, 0, strlen($path)-1);
	$folder = substr(strrchr($path, '/')  ,1);
	echo $folder."\",";
	echo "content:[";
	$files = scandir($path);
	$first=true;
	foreach($files as $file){
		if(is_file($path."/".$file)){
			if(!$first){
				echo "," ;
			}
			else{$first = false;}
			echo"{name:\"".$file ."\"}";
		}
		else if($file!="." && $file!=".." && is_dir($path."/".$file)){
			if(!$first){
				echo "," ;
			}
			else{$first = false;}
			getUploadFs($path."/".$file);
		}
	}
	echo"]}";
	
}

function unzip($file, $dest){
	$ext = pathinfo($file,  PATHINFO_EXTENSION);
	if($ext == 'gz')
	{
		$execute = "gunzip -".$dest." $file";
		`$execute`;
		unlink($file);
	}
	if($ext == 'zip')
	{
		$execute = "unzip -u $file -d $dest";
		`$execute`;
		unlink($file);
	}

}

function moveTo($path){
	
}	

?>