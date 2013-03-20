<?php

switch ($_SERVER['REQUEST_METHOD']) {

  case 'POST':
      $file_content = $_POST['level_content'];
      $file_name =  $_POST['level_name'];
      $success = file_put_contents('maps/'.$file_name.'.json', $file_content);
      if ($success === false) {
          echo '<div id="result">fail</div>';
      }
      else {
          echo '<div id="result">ok</div>';
      }
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

      } else if(isset($_GET['action']) && $_GET['action'] == 'exportLevel') {
		$file_name = (isset($_GET['level_name']) ? $_GET['level_name'] : 'temp');
		$format = (isset($_GET['format']) ? $_GET['format'] : 'png');
		chdir("utilities");
		include('template.php');
		if($format == "png") {
		      system("./phantomjs exportpng.js ".$file_name);
		      $exported_file = $file_name.'.png';
		} else {
		      $exported_file = $file_name.'.html';
		}
  
		if(isset($_GET['deliver_method']) && $_GET['deliver_method'] == "download") {
		      header('Content-Description: File Transfer');
		      header('Content-Type: application/octet-stream');
		      header('Content-Disposition: attachment; filename='.basename($exported_file));
		      header('Content-Transfer-Encoding: binary');
		      header('Expires: 0');
		      header('Cache-Control: must-revalidate');
		      header('Pragma: public');
		      header('Content-Length: ' . filesize($exported_file));
		      ob_clean();
		      flush();
		      readfile($exported_file);
		      exit;
		} else {
		      if($format == 'png') { 
			  header('Content-type: image/png'); 
			  readfile($exported_file);   
		      } else {
			  header('Content-type: text/html'); 
			  readfile($exported_file);
		      }
	      }
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
