<?php

function getZone($map, $type, $x, $y)
{
	foreach($map['rooms'] as $i)
	{
		if ($type == 'doors') // doors might be 'outside' a tile. So let's be a little less strict
		{
			if ($x >= $i['x'] && $x <= ($i['x'] + ($i['w']-1)) &&
		    	    $y >= $i['y'] && $y <= ($i['y'] + ($i['h']-1)))
			{
				return $i['zone'];
			}

		}
		else if ($x > $i['x'] && $x < ($i['x'] + ($i['w']-1)) &&
		    $y > $i['y'] && $y < ($i['y'] + ($i['h']-1)))
		{
			return $i['zone'];
		}
	}
	return -1;
}

function getColor($tileInfo)
{
	$matches = array();
	$str = $tileInfo['file'];
	$r = preg_match('/_(green|blue|red)_[0-3].png$/', $str, $matches);

	if ($r === false || $r == 0)
		return 'white';
	else
		return $matches[1];
}

function getTileInfo($map, $map_element)
{
	$tileInfo = array('file' => 'tiles/' . $map_element['item'] . '/' . $map_element['type'],
			  'w'    => $map_element['dataX'],
			  'h'    => $map_element['dataY']);
	$tmp = explode('-', $map_element['coordsId']);
	$tileInfo['x'] = $tmp[1];
	$tileInfo['y'] = $tmp[2];

	if (!isset($map_element['zone']))
		$tileInfo['zone'] = 0;
	else
		$tileInfo['zone'] = $map_element['zone'];

	
	if ($map_element['item'] != 'rooms')
		$tileInfo['zone'] = getZone($map, $map_element['item'], $tileInfo['x'], $tileInfo['y']);
	if ($map_element['item'] == 'monsters' || $map_element['item'] == 'players')
		$tileInfo['color'] = getColor($tileInfo);

	return $tileInfo;
}

function loadLevel($level_file, $filter_colors)
{
	$level = file_get_contents($level_file);
	if ($level === false)
		throw new Exception("Could not load level: '" . $level_file . "'");

	$jmap = json_decode($level, true);
	$gmap = array('rooms'     => array(),
	             'weapons'   => array(),
		     'objects'   => array(),
		     'monsters'  => array(),
		     'room_misc' => array(),
		     'doors'     => array(),
		     'players'   => array());

	$minX = 0;
	$minY = 0;
	$maxX = 0;
	$maxY = 0;

	
	foreach ($jmap['tiles'] as $k => $i)
	{
		// First iteration only works for rooms
		if ($i['item'] != 'rooms')
			continue;

		$tileInfo = getTileInfo($gmap, $i);
		$gmap[$i['item']][] = $tileInfo;

		$maxX = max($maxX, $tileInfo['x'] + $tileInfo['w']);
		$minX = min($minX, $tileInfo['x']);
		$maxY = max($maxY, $tileInfo['y'] + $tileInfo['h']);
		$minY = min($minY, $tileInfo['y']);

		unset($jmap['tiles'][$k]);
	}

	foreach ($jmap['tiles'] as $k => $i)
	{
		$tileInfo = getTileInfo($gmap, $i);
		$keep_tile = true;

		if (isset($tileInfo['color']))
		{
			$r = preg_match($filter_colors, $tileInfo['color']);
			if ($r == 0)
				$keep_tile = false;
		}
		if ($keep_tile)
			$gmap[$i['item']][] = $tileInfo;

		unset($jmap['tiles'][$k]);
	}

	$map = array('tiles'  => $gmap,
	             'sizes'  => array($minX, $minY, $maxX, $maxY),
		     'scenar' => $jmap['scenarii']);

	return $map;
}

function generateMapImage($level, $file_name, $image_size)
{
	$fd = popen('convert -resize ' . $image_size . ' -background transparent svg:- ' . $file_name, 'w');
	fwrite($fd, '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="' . ($level['sizes'][2]*64) . 'px" height="'. ($level['sizes'][3]*64) .'px">' . "\n");

	$zones = array();
	foreach($level['tiles']['rooms'] as $room)
	{
		if (!isset($zones[$room['zone']]))
			$zones[$room['zone']] = array();

		$zones[$room['zone']][] = $room;
	}

	foreach($zones as $k => $tiles)
	{
		fwrite($fd, "\t" . '<g filter="url(defs.zones.svg#Zone' . $k . ')">' . "\n");
		foreach($tiles as $t)
			fwrite($fd, "\t\t" . '<image x="' . ($t['x']*64) . '" y="' . ($t['y']*64) . '" width="' . ($t['w']*64) . '" height="' . ($t['h']*64) . '" xlink:href="' . $t['file'] . '"/>' . "\n");
		fwrite($fd, "\t</g>\n\n");
	}

	
	$order = array('doors', 'room_misc', 'objects', 'weapons', 'monsters', 'players');
	foreach($order as $o)
	{
		foreach($level['tiles'][$o] as $tile)
		{
			$pos = array($tile['x']*64, $tile['y']*64, $tile['w']*64, $tile['h']*64);

			fwrite($fd, "\t" . '<image x="' . $pos[0] . '" y="' . $pos[1] . '" width="' . $pos[2] . '" height="' . $pos[3] . '" xlink:href="' . $tile['file'] . '"/>' . "\n");
		}
	}

	fwrite($fd, "</svg>\n");
	fclose($fd);
}

function generateScenario($level, $level_name, $file_name)
{
	$zones = array();
	$briefing = '';
	$objectives = '';
	foreach($level['scenar'] as $s)
	{
		$value = htmlspecialchars_decode(htmlentities($s['value'], ENT_NOQUOTES, 'UTF-8'), ENT_NOQUOTES);
		if ($s['id'] == 'briefing')
			$briefing = $value;
		else if ($s['id'] == 'objectives')
			$objectives = $value;
		else
			$zones[$s['id']] = $value;
	}

	$fd = fopen($file_name, 'w');
	fwrite($fd, "<!DOCTYPE html>\n\n");

	fwrite($fd, "<html><head>\n");
	fwrite($fd, "\t<title>DooM - " . $level_name . "</title>\n");
	fwrite($fd, "\t<link href=\"style.css\" rel=\"stylesheet\"/>\n");
	fwrite($fd, "</head>\n");
	fwrite($fd, "<body>\n");

	fwrite($fd, '<div class="text" id="briefind">' . "\n");
	fwrite($fd, "<h1>Briefing de mission</h1>\n");
	fwrite($fd, $briefing . "\n");
	fwrite($fd, "</div>\n");

	fwrite($fd, '<div class="text" id="objectives">' . "\n");
	fwrite($fd, "<h1>Objectifs du sc&eacute;nario</h1>\n");
	fwrite($fd, $objectives . "\n");
	fwrite($fd, "</div>\n");

	foreach($zones as $k => $v)
	{
		fwrite($fd, '<div class="text" id="zone_' . $k . '">' . "\n");
		fwrite($fd, 	"<h1>Zone " . $k . "</h1>\n");
		fwrite($fd, 	'<div class="user_input">' . $v . "</div>\n");
		fwrite($fd, '</div>' . "\n");

		fwrite($fd, '<div class="zone_map">' . "\n");
		fwrite($fd, '	<img src="zone_' . $k . '.png" alt="zone_' . $k . '"/>' . "\n");
		fwrite($fd, '</div>' . "\n");
		fwrite($fd, '<div style="clear: both;"></div>' . "\n<hr width=\"75%\">\n\n");
		
	}

	fwrite($fd, "<img src=\"full_map.png\" alt=\"full_map\"/>\n");
	fwrite($fd, "</body></html>\n");

	fclose($fd);
}

function updateSizeAndOffset(&$level)
{
	$minX = 100000;
	$minY = 100000;
	$maxX = 0;
	$maxY = 0;
	foreach($level['tiles']['rooms'] as $tile)
	{
		$maxX = max($maxX, $tile['x'] + $tile['w']);
		$minX = min($minX, $tile['x']);
		$maxY = max($maxY, $tile['y'] + $tile['h']);
		$minY = min($minY, $tile['y']);
	}

	if ($minX == 100000)
		$minX = 0;
	if ($minY == 100000)
		$minY = 0;
	
	$x_offset = $minX;
	$y_offset = $minY;

	foreach($level['tiles'] as &$type)
	{
		foreach($type as &$tile)
		{
			$tile['x'] -= $x_offset;
			$tile['y'] -= $y_offset;
		}
	}

	$minX -= $x_offset;
	$maxX -= $x_offset;
	$minY -= $y_offset;
	$maxY -= $y_offset;

	$level['sizes'] = array($minX, $minY, $maxX, $maxY);
}

function generateZoneMapImages($level, $full_path, $image_size)
{
	$cur_zone = 0;
	$continue = true;
	while($continue)
	{
		$work_level = $level;
		$continue = false;
		foreach($work_level['tiles'] as &$type)
		{
			foreach($type as $k => $tiles)
			{
				if ($tiles['zone'] != $cur_zone)
					unset($type[$k]);
				else
					$continue = true;
			}
		}

		if ($continue)
		{
			updateSizeAndOffset($work_level);
			generateMapImage($work_level, $full_path . '/zone_' . $cur_zone . '.png', $image_size);
		}
		$cur_zone += 1;
	}
}

function main($level_name, $level_file, $filter_colors, $misc_options)
{
	$level = loadLevel($level_file, $filter_colors);
	
	$full_path = "output/" . $level_name;
	if (!file_exists($full_path) and !is_dir($full_path))
		mkdir($full_path, 0777, true);

	generateMapImage($level, $full_path . '/full_map.png', $misc_options['image_size']);
	generateZoneMapImages($level, $full_path, $misc_options['image_size']);
	generateScenario($level, $level_name, $full_path . '/index.html');
	$css = str_replace('__RIGHT_MARGIN__', $misc_options['text_right_margin'], file_get_contents('style.css.tpl'));
	file_put_contents($full_path . '/style.css', $css);
}

$g_level_file = '';
$g_level_name = '';
$g_filter_color = '/^(white|red|green|blue)$/';
$g_misc_options = array('text_right_margin' => '0%', 'image_size' => '100%');

try
{
	if (isset($_GET['level_name']))
	{
		if (file_exists('maps/' . $_GET['level_name'] . '.json'))
		{
			$g_level_name = $_GET['level_name'];
			$g_level_file = 'maps/' . $_GET['level_name'] . '.json';
		}
		else
			throw new Exception("Level '" . $_GET['level_name'] . "' does not exist.");
	}

	if (isset($_GET['colors']))
	{
		$tmp = explode(',', $_GET['colors']);
		$g_filter_color = "/^(white";

		foreach ($tmp as $c)
		{
			if ($c == 'blue')
				$g_filter_color .= '|blue';
			else if ($c == 'red')
				$g_filter_color .= '|red';
			else if ($c == 'green')
				$g_filter_color .= '|green';
			else
				throw new Exception("Incorrect color given: '" . $c . "'.");
		}

		$g_filter_color .= ')$/';
	}
	if (isset($_GET['text_right_margin']))
	{
		if (preg_match('/^[0-9]+(cm|mm|in|p[tcx]|e[mx]|ch|rem|%)$/', $_GET['text_right_margin']) > 0)
			$g_misc_options['text_right_margin'] = $_GET['text_right_margin'];
		else
			throw new Exception("Incorect right text margin given: '" . $_GET['text_right_margin'] . "'.");
	}
	if (isset($_GET['image_size']))
	{
		if (preg_match('/^(100%|[1-9]0%)$/', $_GET['image_size'], $matches) > 0)
			$g_misc_options['image_size'] = $matches[1];
		else
			throw new Exception("Incorect image size given: '" . $_GET['image_size'] . "'.");
	}

	$main_output = '';
	if ($g_level_name != '')
	{
		main($g_level_name, $g_level_file, $g_filter_color, $g_misc_options);
		$main_output = '<a href="output/' . $g_level_name . '">Go to exported map.</a><br>';
	}
}
catch(Exception $e)
{
	$main_output = $e->getMessage();
}

?>

<html><head><title>Mapcubus Map Exporter</title></head>
<body>

<? echo $main_output; ?>

<form method="GET">
<div>
Choose map:
<select name="level_name">
<?
$dir = opendir('maps');
while($file = readdir($dir))
{
	if (preg_match('/[.]json$/', $file) > 0)
		print('<option>' . substr($file, 0, -5) . "</option>\n");
}
closedir($dir);
?>
</select>
</div>

<div>
Filter player colors:
<select name="colors">
<option value="red,green,blue">Tous</option>
<option value="red,green"     >Joueurs rouge et vert</option>
<option value="red,blue"      >Joueurs rouge et bleu</option>
<option value="green,blue"    >Joueurs vert et bleu</option>
<option value="red"           >Joueur rouge</option>
<option value="green"         >Joueur vert</option>
<option value="blue"          >Joueur bleu</option>
</select>
</div>

<div>
R&eacute;duire la taille des images:
<select name="image_size">
<option>100%</option>
<option>90%</option>
<option>80%</option>
<option>70%</option>
<option>60%</option>
<option>50%</option>
<option>40%</option>
<option>30%</option>
<option>20%</option>
<option>10%</option>
</select>
</div>

<div>
Limiter la marge droite du texte:
<input type="text" name="text_right_margin" value="0%">
</div>
<input type="submit" value="Go go go !">
<hr>

<a href="mapcubus.php">Return to editor</a><br>
</form>
</body>
</html>

