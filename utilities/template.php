<?php 
function genererNiveau($contenu) {
    $grille = "";
    for ($i=0; $i < 64; $i++) {
        $grille .= '<div class="grid-line">';
        for ($j=0; $j < 64; $j++) {
            $grille .= '<div id="c-'.$j.'-'.$i.'"';
            $grille .= ' class="grid-cell grid-border drop-target" >';
	    if(isset($contenu['c-'.$j.'-'.$i])) {
		foreach($contenu['c-'.$j.'-'.$i] as $level_element) {
		    $grille .= '<img class="level-element draggable" src="http://'.$_SERVER['SERVER_NAME'].'/mapcubus/tiles/' .$level_element['item']. '/' .$level_element['type'].'" />';
		}
	    }
            $grille .= "</div>";
        }
        $grille .= "</div>";
    }
    return $grille;
}

function indexizeArray($array) {
  $indexed = array();
  if(isset($array->tiles)) {
      $array = $array->tiles;
  }
  foreach($array as $key => $element) {
    $element = (array)$element;
    $coordsId = $element['coordsId'];
    if(!isset($indexed[$coordsId])) {
      $indexed[$coordsId] = array();
    }
    $indexed[$coordsId][] = $element;
  }
  return $indexed;
}

$niveau = $_GET['level_name'];
$contenu = json_decode(file_get_contents('../maps/'.$niveau.'.json'));
$contenu = indexizeArray($contenu);
$grille = genererNiveau($contenu);

ob_start();
include('template.tpl.html');
$sortie = ob_get_contents();
@ob_end_clean();
file_put_contents($niveau.'.html', $sortie);
?>