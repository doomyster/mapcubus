<html><head>
<link href="jquery/css/ui-lightness/jquery-ui-1.10.1.custom.css" rel="stylesheet">
<script src="jquery/jquery-1.9.1.js"></script>
<script src="jquery/jquery-ui-1.10.1.custom.js"></script>
<title>blah</title>
<style type="text/css">
.scr
{
  overflow: scroll;
  table-layout: fixed;
  width: 2048px;
}

.cellule
{
   width:  64px;
   height: 64px;
   position: relative;
   overflow: visible;
   display: inline-block;
   box-sizing:border-box;
  -moz-box-sizing:border-box;
  -webkit-box-sizing:border-box;
  border:1px solid red;
}
.c10x5
{
    position: absolute;
    background-color: transparent;
}
.c10x5::before
{
    content: " ";
    position: absolute;
    width: 768px;
    height: 448px;
    z-index: -1;
    background-image: url(tiles/rooms/10x5_room_0.png);
}
.cap
{
    position: absolute;
    background-color: transparent;
}
.cap::before
{
    content: " ";
    position: absolute;
    width: 192px;
    height: 256px;
    z-index: -1;
    background-image: url(tiles/rooms/cap_0.png);
}

.element_menu {
  color: black;
}

.illustration_menu {
  #max-height : 70px;
}

#navigation {
  float: left;
  position: absolute;
  border: 1px solid black;
  margin-right: 10px;
  z-index: 2500;
}

#contenu {
    float: left;
    padding-left: 350px;
}

.level-element {
    position: relative;
    float:left;
    top: 0px;
    left: 0px;
}

.highlight-yellow
{
background-color:#FFD700;
-moz-border-radius: 5px;
-webkit-border-radius: 5px;
}

<?php 

function genererCheminImage($chemin) {
  return str_replace('/var/www/', 'http://localhost/', $chemin);
}

function genererCheminMiniature($chemin) {
  return str_replace('tiles','icons',str_replace('/var/www/', 'http://localhost/', $chemin));
}

function genererTitreSection($chemin) {
  $parties = explode("/", $chemin);	
  return $parties[count($parties) - 1];
}

class Category
{
	public $name = '';
	public $template = '';
	public $layer = '';
	public $items = array();

	function getFiles() {
		$r = array();
		foreach($this->items as $i) {
			foreach($i->getFiles() as $ii) {
				$r[] = $this->template . '/' . $ii;
			}
			
		}
		return $r;
	}
}

class Item
{
	public $name = '';
	public $template = '';
	public $rotation = '';
	public $types = array();

	function getFiles() {
		$rr = array();

		for ($r=0; $r <= $this->rotation; $r++)
		{
			if (count($this->types) == 0)
				$rr[] = $this->template . "_$r.png";
			else {
				foreach($this->types as $t) {
					$rr[] = $this->template . $t->template . "_$r.png";
				}
			}
		}
		return $rr;
	}
}

class Type
{
	public $name = '';
	public $template = '';
}

function ScanXmlData($data) {
  $xmlstr = file_get_contents($data);
  $a = new SimpleXMLElement($xmlstr);

  $categories = array();
  $counter = 0;
  foreach ($a->children() as $c) {
  	if ($c->getName() == "category") {
		$cat = new Category();

		foreach ($c->attributes() as $k=>$v) {
			if ($k == 'name')
				$cat->name = "$v";
			else if ($k == 'template')
				$cat->template = "$v";
			else if ($k == 'layer')
				$cat->layer = "$v";
		}
		if ($cat->name == '' || $cat->template == '' || $cat->layer == '')
			die("Incomplete category entry; name='$cat->name', template='$cat->template', layer='$cat->layer'.");


		foreach ($c->children() as $i) {
			if ($i->getName() == "item") {
				$item = new Item();

				foreach ($i->attributes() as $k=>$v) {
					if ($k == 'name')
						$item->name = "$v";
					else if ($k == 'template')
						$item->template = "$v";
					else if ($k == 'rotation')
						$item->rotation = "$v";
				}
				if ($item->name == '' || $item->template == '')
					die("Incomplete item entry; name='$item->name', template='$item->template', rotation='$item->rotation'.");
				if ($item->rotation == '')
					$item->rotation = '0';

				foreach ($i->children() as $t) {
					if ($t->getName() == "type") {
						$type = new Type();

						foreach($t->attributes() as $k=>$v) {
							if ($k == 'name')
								$type->name = "$v";
							else if ($k == 'template')
								$type->template = "$v";
						}
						$item->types[] = $type;
					}
				} // End of: iterate item's children
				$cat->items[] = $item;
			} // End of: element is 'item'
		} // End of: iterate catecory's children
		$categories[] = $cat;
	} // End of: element is 'category'
  } // End of: iterate root's children

  $pieces = '';
  foreach ($categories as $blob) {
	$pieces .= '<li><a href="#">' . $blob->name . '</a>';
	$pieces .= '<ul>';

	foreach($blob->items as $i) {
		$imgs = $i->getFiles();

		$pieces .= '<li class="element_menu">';
		foreach ($imgs as $im) {
			$pieces .= '<img class="illustration_menu draggable" data-source="http://localhost/testp/tiles/' . $blob->template . '/' . $im . '" src="http://localhost/testp/icons/' . $blob->template . '/' . $im . '"/>' . $i->name;
		}
		$pieces .= '</li>';
	}

	$pieces .= '</ul>';
  }
  return $pieces;
}

function ScanDirectory($dossier) {
  $elements_dossiers = opendir($dossier);
  $pieces = '';
  while(false !== ($entree = @readdir($elements_dossiers))) {
	if(is_dir($dossier.'/'.$entree)&& $entree != '.' && $entree != '..') {
		  $pieces .= '<li><a href="#">'.genererTitreSection($entree).'</a>';
		  $pieces .= '<ul>';
		  $pieces .= ScanDirectory($dossier.'/'.$entree);
		  $pieces .= '</ul></li>';
	}
	else {
	  if($entree != '.' && $entree != '..') {
		$pieces .= '<li class="element_menu"><img class="illustration_menu draggable" data-source="'+genererCheminImage($dossier.'/'.$entree)+'" src="'.genererCheminMiniature($dossier.'/'.$entree).'" />'.$entree.'</li>';
	  }
	}
    closedir($dossier);
  }
  return $pieces;
}

#$liste = ScanDirectory('/var/www/testp/sorted');
$liste = ScanXmlData("./data.xml");

?>

</style>
<script>
function convertIdToXy(id) {
  var tab = id.split('-');
  return new Array(parseInt(tab[1]), parseInt(tab[2]));
}

function highlightArea(xy, lh) {
  var distX = xy[0]+lh[0];
  var distY = xy[1]+lh[1];
  for(var i = xy[0]; i < distX; i++) {
    for(var j = xy[1]; j < distY; j++) {
      $('#c-'+i+'-'+j).addClass('highlight-yellow');
    }
  }
}

$(function() {
  $(".draggable").draggable(
  {
	  revert: false, 
	  helper: "clone"
  });
	  	
  $(".drop-target").droppable({
     drop: function( event, ui ) {
	  var imgSrc = $(ui.draggable).attr("data-source");
	  var img = $('<img class="level-element draggable-element" src="'+imgSrc+'" />');
	  $(this).html(img);
	   $(".drop-target").removeClass('highlight-yellow');
      },
      over: function(event, ui) {
	  $(".drop-target").removeClass('highlight-yellow');
	  // Récupération des coordonnées de la cellule
	  var xy = convertIdToXy($(this).attr("id"));
	  //TODO: insérer la place en case dans le xml dans les attributs data-x et data-y, la récupérer ici pour alimenter la fonction highlightArea
          // Attention aux rotations
	  //var lh = new Array(3,6);
	  //highlightArea(xy,lh);
	  $(this).addClass('highlight-yellow');
      },
      out: function(event, ui) {
	  $(".drop-target").removeClass('highlight-yellow');
      }
  });

  $(".draggable-element").on("mouseover", function() {
      if(!$(this).hasClass("already-draggable")) {
	$(this).draggable(
	{
	    revert: false,
	});
	$(this).addClass("already-draggable");
      }
  });

  $("#navigation").menu();
});
</script>
</head>


<body>
<div id="navigation">
  <a href="#"> Items </a>	
  <?= $liste; ?>
</div>
<div id="contenu">
<table border="0" cellpadding="0" cellspacing="0" class="scr">
<?
for ($i=0; $i < 32; $i++)
{
	echo '<div class="ligne">';
	for ($j=0; $j < 32; $j++)
	{
		echo '<div id="c-'.$j.'-'.$i.'"';
		//if ($i == 2 && $j == 4)
		//{
			//echo ' class="cellule c10x5 drop-target" >';
		//}
		//else if ($i == 4 && $j == 14)
		//{
			//echo ' class="cellule cap drop-target" >';
		//}
		//else
		//{
			echo ' class="cellule drop-target" >';
		//}
		echo "</div>";
	}
	echo "</div>";
}
?>
</div>
</table>
</body>
</html>
