var elementsArray = {};
var currentDropTarget = null;
var currentZoneCounter = 0;

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
    	  //clearAllLevelElements(); Don't to it: it's the job of revertLocal() !!!
        elementsArray = data;
        revertLocal();
    });	
}

function commitLocal() {
    tilesArray = new Array();
                          
    $('.level-element').each(function() {
        var element = {
            type: $(this).attr("data-type-template"),
            item: $(this).attr("data-item-template"),
            dataX: $(this).attr("data-x"),
            dataY: $(this).attr("data-y"),
            coordsId: $(this).parent().attr("id")
        }
        tilesArray.push(element);
    });

    elementsArray = { info: { map: "mapcubus", fileVersion: "0.2" }, tiles: tilesArray };
}

function fetchAttributesFromMenu(item) {
	var tpl = $(".illustration_menu[data-type-template='"+item.type+"'][data-item-template='"+item.item+"']");
	item.dataX = tpl.attr("data-x");
	item.dataY = tpl.attr("data-y");
	
	return item;
}

function revertLocal() {
    // clearAllLevelElements() call moved not to clear all elements unless we know we can load the map

    if (typeof(elementsArray.info) != "undefined" && typeof(elementsArray.info.fileVersion) != "undefined") {
        fileVersion = elementsArray.info.fileVersion;
	if (fileVersion == "0.2") {
            clearAllLevelElements();
	    for (var i = 0; i < elementsArray.tiles.length; i++) {
		currentItem = elementsArray.tiles[i];
		var imgSrc = getImgSrc(currentItem.type, currentItem.item);
		if(currentItem.dataX === undefined || currentItem.datay === undefined) {
			currentItem = fetchAttributesFromMenu(currentItem);
		}
		var img = createLevelElement(currentItem.type, currentItem.item, imgSrc, currentItem.dataX, currentItem.dataY);
		$('#'+currentItem.coordsId).append(img);
		setDraggable(img);
            }
	}
	else {
		//retrocompat.revertLocal(fileVersion, elementsArray);
		alert("File version not supported");
	}
    }
    else {
            clearAllLevelElements();
	    for (var i = 0; i < elementsArray.length; i++) {
		currentItem = elementsArray[i];
		var imgSrc = getImgSrc(currentItem.type, currentItem.item);
		if(currentItem.dataX === undefined || currentItem.datay === undefined) {
			currentItem = fetchAttributesFromMenu(currentItem);
		}
		var img = createLevelElement(currentItem.type, currentItem.item, imgSrc, currentItem.dataX, currentItem.dataY);
		$('#'+currentItem.coordsId).append(img);
		setDraggable(img);
	    }
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

function createLevelElement(typeTpl, itemTpl, imgSrc, dataX, dataY) {
    var img = $('<img class="level-element draggable-element" data-x="'+dataX+'" data-y="'+dataY+'" data-type-template="'+typeTpl+'" data-item-template="'+itemTpl+'" data-source="'+imgSrc+'" src="'+imgSrc+'" />');
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

function createContextMenu() {
	$("#context-menu-options").menu();
	$("#context-menu-options").hide();
	$("#contenu").bind("contextmenu",function(e){
		e.preventDefault();
		$("#context-menu-options").css({
		left:  e.pageX,
		top:   e.pageY
    	});
    	$("#context-menu-options").show();
	});
	$("#delete-tile-link").click(function() {
		deleteTile();
		$("#context-menu-options").hide();
	});
	$(document).click(function(event) {
		if (event.which != 3) {
			if($("#context-menu-options").is(":visible")) {
				$("#context-menu-options").hide();
			}
		}
	});
}

function deleteTile() {
	if(currentDropTarget != null) {
		elementToRemove = currentDropTarget.children(".level-element").last();
		elementToRemove.remove();
	}
}

function setDraggable(levelElement) {
      levelElement.draggable({
		revert: false, 
		helper: function(event) {
			var res = $(this).clone();
			res.attr("src",$(this).attr("data-source").replace('tiles', 'icons'));
			return res;
		},
		scroll: false,
		zIndex: 3200
      });	
}

function createLevelElementFromDraggable(appendTarget, ui) {
      if(ui.draggable.hasClass("level-element")) {
	    var imgSrc = $(ui.draggable).attr("src");
      } else {
	    var imgSrc = $(ui.draggable).attr("data-source");
      }
      var itemTpl = $(ui.draggable).attr("data-item-template");
      var typeTpl = $(ui.draggable).attr("data-type-template");
      var dataX = $(ui.draggable).attr("data-x");
      var dataY = $(ui.draggable).attr("data-y");
      var img = createLevelElement(typeTpl, itemTpl, imgSrc, dataX, dataY);
      appendTarget.append(img);
      setDraggable(img);
      if(ui.draggable.hasClass("level-element")) {
	    ui.draggable.remove();
      }
}

$(document).ready(function() {
    $(".drop-target").mouseover(function() {
		if(currentDropTarget != null) {
		      currentDropTarget.children('.level-element').removeClass("highlight-yellow");
		}
		currentDropTarget = $(this);	
		$(this).children('.level-element').addClass("highlight-yellow");
    });
	
    $(".draggable").draggable({
        revert: false, 
        helper: "clone",
        scroll: false,
        zIndex: 3200
    });

    $(".drop-target").droppable({
        drop: function( event, ui ) {
            removeImgOverlay('#'+$(this).attr("id"));
            createLevelElementFromDraggable($(this), ui);
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

    $("#mapcubus-tabs").tabs();

    $("#accordeon").accordion({
        collapsible: true
    });

    createSaveForm();
    createLoadForm();
    createContextMenu();

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

    $('#mapcubus-scenarii-button-add').click(function() {
        $('#mapcubus-scenarii-zones').append('<div id="mapcubus-scenarii-zone-' + currentZoneCounter + '"><H2>Zone ' + currentZoneCounter + '</H2><textarea rows="10" cols="80"></textarea></div>');
    	currentZoneCounter += 1;
    });
});
