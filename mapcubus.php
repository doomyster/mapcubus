<?php 

function genererTitreSection($chemin) {
  $parties = explode("/", $chemin);	
  return $parties[count($parties) - 1];
}

class Category {
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

class Item {
    public $name = '';
    public $template = '';
    public $rotation = '';
    public $types = array();

    function getFiles() {
        $rr = array();

        for ($r=0; $r <= $this->rotation; $r++) {
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
    foreach ($categories as $cat) {
        $pieces .= '<h3><a href="#">' . $cat->name . '</a></h3>';
        $pieces .= '<div class="menu-category"><p>';

        foreach($cat->items as $i) {
            $imgs = $i->getFiles();
            $counter = 0;
            foreach ($imgs as $im) {
                $size = getimagesize('http://'.$_SERVER['SERVER_NAME'].'/mapcubus/tiles/'.$cat->template.'/'.$im);
                $pieces .= '<span class="menu-leaf"><img class="menu-icon draggable" data-item-template="'.$cat->template.'" data-type-template="'.$im.'" data-x="'.($size[0]/64).'" data-y="'.($size[1]/64).'"  data-source="http://'.$_SERVER['SERVER_NAME'].'/mapcubus/tiles/' . $cat->template . '/' . $im . '" src="http://'.$_SERVER['SERVER_NAME'].'/mapcubus/icons/' . $cat->template . '/' . $im . '" alt="' . $i->name . '"/></span>';
                if ($counter == 1) {
                    $counter = -1;
                    $pieces .= '<br>';
                }
                $counter++;
            }
            $pieces .= '<hr />';
        }

        $pieces .= '</p></div>';
    }
    return $pieces;
}

$liste = ScanXmlData("./data.xml");

function genererGrille() {
    $grille = "";
    for ($i=0; $i < 64; $i++) {
        $grille .= '<div class="grid-line">';
        for ($j=0; $j < 64; $j++) {
            $grille .= '<div id="c-'.$j.'-'.$i.'"';
            $grille .= ' class="grid-cell grid-border drop-target" >';
            $grille .= "</div>";
        }
        $grille .= "</div>";
    }
    return $grille;
}

$contenu = genererGrille();

ob_start();
include('mapcubus.tpl');
$sortie = ob_get_contents();

@ob_end_clean();
echo $sortie;

?>
