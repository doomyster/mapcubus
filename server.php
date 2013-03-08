<?php

switch ($_SERVER['REQUEST_METHOD']) {

  case 'POST':
      $file_content = $_POST['level_content'];
      $file_name =  $_POST['level_name'];
      $success = file_put_contents('maps/'.$file_name.'.json', $file_content);
      echo 'ok';
  break;
  
  case 'GET':
      if(isset($_GET['action']) && $_GET['action'] == 'getLevelsList') {
		if ($handle = opendir('maps')) {
		    $levels = array();
		    while (false !== ($entry = readdir($handle))) {
			if(strpos($entry, '.json') !== false) {
			      $levels[] = str_replace('.json', '', $entry);
			}
		    }
		    closedir($handle);
		}
		header('Content-Type: application/json');
		echo json_encode($levels);
		exit;

      } else if(isset($_GET['action']) && $_GET['action'] == 'exportLevelToPng') {
		$file_name = (isset($_GET['level_name']) ? $_GET['level_name'] : 'temp');
		chdir("utilities");
		header('Content-Type: image/png');
		system("./phantomjs exportpng.js "+$file_name);
		echo file_get_contents('temp.png');
		exit;
      } else {
		$file_name = (isset($_GET['level_name']) ? $_GET['level_name'] : 'test');
		$file_content = file_get_contents('maps/'.$file_name.'.json');
		header('Content-Type: application/json');
		echo $file_content;
		exit; 
      }
  break;
}
?>