<?php

switch ($_SERVER['REQUEST_METHOD']) {

  case 'POST':
      $file_content = $_POST['level_content'];
      $file_name =  $_POST['level_name'];
      $success = file_put_contents('maps/'.$file_name.'.json', $file_content);
      echo 'ok';
  break;
  
  case 'GET':
      $file_name = (isset($_GET['level_name']) ? $_GET['level_name'] : 'test');
      $file_content = file_get_contents('maps/'.$file_name.'.json');
      header('Content-Type: application/json');
      echo $file_content;
      exit;
  break;
}
?> 
