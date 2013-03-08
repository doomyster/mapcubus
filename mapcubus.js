var elementsArray = new Array();

function convertIdToXy(id) {
    var tab = id.split('-');
    return new Array(parseInt(tab[1]), parseInt(tab[2]));
}

function highlightArea(xy, lh, image) {
    var distX = xy[0]+lh[0];
    var distY = xy[1]+lh[1];
    for(var i = xy[0]; i < distX; i++) {
        for(var j = xy[1]; j < distY; j++) {
        	   // color only edges of the area, the loop has to be changed, it is waayyyy to 
        	   // complicated now
        		if(i == xy[0] || i == distX -1 || j == xy[1] || j == distY - 1) {
        			$('#c-'+i+'-'+j).addClass('highlight-yellow');
        		}
        }
    }
    addImgOverlay($('#c-'+xy[0]+'-'+xy[1]), image);
    
}

function addImgOverlay(cellId, imageUrl) {
	$(cellId).append('<img class="img-overlay" src="'+imageUrl+'" />');	
}

function removeImgOverlay(cellId) {
	$(cellId).children('.img-overlay').remove();	
}

function allElementsMove(xdir, ydir) {
    $('.level-element').each(function() {
        var xy_coords = convertIdToXy($(this).parent().attr("id"));
        var x = xy_coords[0];
        var y = xy_coords[1];
        x += xdir;
        y += ydir;

        // Should also test for overflow
        if (x < 0 || y < 0) { 
            $(this).remove();
        }
        else {
            var newid = "c-" + x + "-" + y;
            $('#'+newid).append($(this));
        }
    });
}


function commitDistant(levelName) {
    commitLocal();
    $.post('server.php','level_name='+levelName+'&'+'level_content='+JSON.stringify(elementsArray), function(data) {
           window.alert("level saved successfully !");
    });	
}

function revertDistant(levelName) {
    $.get('server.php?level_name='+levelName, function(data) {
    	  clearAllLevelElements();
        elementsArray = data;
        revertLocal();
    });	
}

function commitLocal() {
    elementsArray = new Array(); // Of course, we need to erase all before filling it again !
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
        img.draggable({
            revert: false,
            helper: "original"
        });   
    }
}

function fetchMapListFromServer() {
	$.get('server.php?action=getLevelsList', function(data) {
        levels = data;
        $('#levels_load_list').html("");
        $.each(data, function(i, item) {
        		var levelItem = '<li data-level="'+item+'" class="level_load_element ui-widget-content">'+item+'</li>';
        		$('#levels_load_list').append(levelItem);
        });
        $('#levels_load_list').selectable({
   			selected: function(event, ui) {
						selectLevel($(ui.selected).attr("data-level"));   			
   			}
		  });
   });	
}

function selectLevel(level) {
	$('#level_name_load').val(level);
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

function createSaveForm() {
    $("#save_form").dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: {
            "Save Level": function() {
                commitDistant($('#level_name_save').val());
                $( this ).dialog( "close" );
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        },
        close: function() {}
    });

    $("#commit-distant").click(function() {
        $("#save_form").dialog("open");
    });
}

function createLoadForm() {
    $("#load_form").dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: {
            "Load Level": function() {
                revertDistant($('#level_name_load').val());
                $(this).dialog( "close" );
            },
            Cancel: function() {
                $(this).dialog( "close" );
            }
        },
        close: function() {}
    });

    $("#revert-distant").click(function() {
        $("#load_form").dialog("open");
        fetchMapListFromServer();
    });	
}

$(document).ready(function() {
    $(".draggable").draggable({
        revert: false, 
        helper: "clone",
        scroll: false,
        zIndex: 3200
    });

    $(".drop-target").droppable({
        drop: function( event, ui ) {
            removeImgOverlay('#'+$(this).attr("id"));
            var imgSrc = $(ui.draggable).attr("data-source");
            var itemTpl = $(ui.draggable).attr("data-item-template");
            var typeTpl = $(ui.draggable).attr("data-type-template");
            var img = createLevelElement(typeTpl, itemTpl, imgSrc);
            $(this).append(img);
            img.draggable({
                revert: false,
                helper: "original"
            });
            $(".drop-target").removeClass('highlight-yellow');
            $(".drop-target").removeClass('highlight-blue');
        },
        over: function(event, ui) {
            $(".drop-target").removeClass('highlight-yellow');
            // Récupération des coordonnées de la cellule
            var xy = convertIdToXy($(this).attr("id"));
            var lh = new Array(parseInt($(ui.draggable).attr("data-x")),parseInt($(ui.draggable).attr("data-y")));
            highlightArea(xy,lh, $(ui.draggable).attr("data-source"));
            $(this).addClass('highlight-yellow');
        },
        out: function(event, ui) {
        		removeImgOverlay('#'+$(this).attr("id"));
            $(".drop-target").removeClass('highlight-yellow');
            $(".drop-target").removeClass('highlight-blue');
        }
    });

    $("#accordeon").accordion({
        collapsible: true
    });

    createSaveForm();
    createLoadForm();

    $("#commit-local").click(function() {
        commitLocal();
    });
    $("#revert-local").click(function() {
        revertLocal();
    });

    $("#all-move-left").click(function() {
        allElementsMove(-1, 0);
    });
    $("#all-move-up").click(function() {
        allElementsMove(0, -1);
    });
    $("#all-move-down").click(function() {
        allElementsMove(0, 1);
    });
    $("#all-move-right").click(function() {
        allElementsMove(1, 0);
    });
    
    $('#show-grid').change(function() {
    	  $(".cellule").toggleClass('grid-border');
    });
});
