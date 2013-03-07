var elementsArray = new Array();

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

function commitDistant() {
	commitLocal();
	$.post('server.php','level_name=test&'+'level_content='+JSON.stringify(elementsArray), function(data) {
		window.alert("level saved successfully !");
	});	
}

function revertDistant() {
	$.get('server.php', function(data) {
		elementsArray = data;
		revertLocal();
	});	
}

function commitLocal() {
	$('.level-element').each(function() {
	      var element = {
		type: $(this).attr("data-type-template"),
		item: $(this).attr("data-item-template"),
		coordsId: $(this).parent().attr("id")
	      }
	      elementsArray.push(element);
	});
}

function revertLocal() {
	clearAllLevelElements();
	for (var i = 0; i < elementsArray.length; i++) {
	  currentItem = elementsArray[i];
     var imgSrc = getImgSrc(currentItem.type, currentItem.item);
	  var img = createLevelElement(currentItem.type, currentItem.item, imgSrc);
	  $('#'+currentItem.coordsId).append(img);
	  img.draggable(
	  {
		revert: false,
		helper: "original"
      });   
	}
}

function clearAllLevelElements() {
	$('.level-element').remove();
}

function getImgSrc(typeTpl, itemTpl) {
    return "http://localhost/mapcubus/tiles/"+itemTpl+"/"+typeTpl;
}

function createLevelElement(typeTpl, itemTpl, imgSrc) {
	var img = $('<img class="level-element draggable-element" data-type-template="'+typeTpl+'" data-item-template="'+itemTpl+'" data-source="'+imgSrc.replace('tiles','icons')+'" src="'+imgSrc+'" />');
	return img;
}

$(document).ready(function() {
  $(".draggable").draggable(
  {
	  revert: false, 
	  helper: "clone",
	  scroll: false,
	  zIndex: 3200
  });
	  	
  $(".drop-target").droppable({
     drop: function( event, ui ) {
	  var imgSrc = $(ui.draggable).attr("data-source");
	  var itemTpl = $(ui.draggable).attr("data-item-template");
	  var typeTpl = $(ui.draggable).attr("data-type-template");
	  var img = createLevelElement(typeTpl, itemTpl, imgSrc);
	  $(this).append(img);
	  img.draggable(
	  {
		revert: false,
		helper: "original"
          });
	   $(".drop-target").removeClass('highlight-yellow');
      },
      over: function(event, ui) {
	  $(".drop-target").removeClass('highlight-yellow');
	  // Récupération des coordonnées de la cellule
	  var xy = convertIdToXy($(this).attr("id"));
	  //TODO: insérer la place en case dans le xml dans les attributs data-x et data-y, la récupérer ici pour alimenter la fonction highlightArea
     // Attention aux rotations
	  var lh = new Array(parseInt($(ui.draggable).attr("data-x")),parseInt($(ui.draggable).attr("data-y")));
	  highlightArea(xy,lh);
	  $(this).addClass('highlight-yellow');
      },
      out: function(event, ui) {
	  $(".drop-target").removeClass('highlight-yellow');
      }
  });

  $("#accordeon").accordion({
  	collapsible: true
  });
  
  $("#commit-distant").click(function() {
    commitDistant();
  });
  
  $("#revert-distant").click(function() {
    revertDistant();
  });
    
  $("#commit-local").click(function() {
    commitLocal();
  });
  $("#revert-local").click(function() {
    revertLocal();
  });
});
