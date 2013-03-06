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

$(document).ready(function() {
  $(".draggable").draggable(
  {
	  revert: false, 
	  helper: "clone",
	  scroll: false,
	  zIndex: 3200,
	  refreshPositions: true
  });
	  	
  $(".drop-target").droppable({
     drop: function( event, ui ) {
	  var imgSrc = $(ui.draggable).attr("data-source");
	  var img = $('<img class="level-element draggable-element" data-source="'+imgSrc.replace('tiles','icons')+'" src="'+imgSrc+'" />');
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
	  //var lh = new Array(3,6);
	  //highlightArea(xy,lh);
	  $(this).addClass('highlight-yellow');
      },
      out: function(event, ui) {
	  $(".drop-target").removeClass('highlight-yellow');
      }
  });

  $("#navigation").menu();
});
