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
	$pieces .= '<ul class="categorie_menu">';

	foreach($blob->items as $i) {
		$imgs = $i->getFiles();

		$pieces .= '<li class="element_menu">';
		foreach ($imgs as $im) {
		$pieces .= '<span class="feuille_menu"><img class="illustration_menu draggable" data-source="http://localhost/mapcubus/tiles/' . $blob->template . '/' . $im . '" src="http://localhost/mapcubus/icons/' . $blob->template . '/' . $im . '"/>' . $i->name.'</span>';
		}
		$pieces .= '<hr />';
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

#$liste = ScanDirectory('/var/www/mapcubus/sorted');
$liste = ScanXmlData("./data.xml");

function genererGrille()
{
	$grille = "";
	for ($i=0; $i < 32; $i++)
	{
		$grille .= '<div class="ligne">';
		for ($j=0; $j < 32; $j++)
		{
			$grille .= '<div id="c-'.$j.'-'.$i.'"';
			$grille .= ' class="cellule drop-target" >';
			$grille .= "</div>";
		}
		$grille .= "</div>";
	}
	return $grille;
}

$contenu = genererGrille();

ob_start();
include('mapcubus.tpl.html');
$sortie = ob_get_contents();

@ob_end_clean();
echo $sortie;
?>
