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
        elementsArray = data;
        revertLocal();
    });	
}

function commitLocal() {
    tilesArray = new Array();
                          
    $('.level-element').each(function() {
    	z = $(this).attr("data-zone");
	if (z == "") {
		z = "0";
	}
        var element = {
            type: $(this).attr("data-type-template"),
            item: $(this).attr("data-item-template"),
            dataX: $(this).attr("data-x"),
            dataY: $(this).attr("data-y"),
	    zone: z,
            coordsId: $(this).parent().attr("id")
        }
        tilesArray.push(element);
    });

    zonesDescription = new Array();
    zonesDescription.push( { id: "briefing",   value: $('#scenarii-zone-briefing-textarea')  .val() } );
    zonesDescription.push( { id: "objectives", value: $('#scenarii-zone-objectives-textarea').val() } );

    $('.scenarii-element').each(function() {
        var dataId = $(this).attr('data-name');
        if (dataId == "objectives" || dataId == "briefing") {
            return;
        }
        zonesDescription.push( { id: dataId, value: $(this).val() } );
    });

    elementsArray = { info: { map: "mapcubus", fileVersion: "0.6" }, tiles: tilesArray, scenarii: zonesDescription };
}

function fetchAttributesFromMenu(item) {
	var tpl = $(".menu-icon[data-type-template='"+item.type+"'][data-item-template='"+item.item+"']");
	item.dataX = tpl.attr("data-x");
	item.dataY = tpl.attr("data-y");
	
	return item;
}

function layerFromType(tpe) {
    var layer = $('img[data-item-template="' + tpe + '"][data-layer]').attr('data-layer');
    if (layer != '') {
        return 'grid-item-zindex-' + layer;
    } else {
        return '';
    }
}

function revertLocal() {
    if (typeof(elementsArray.info) != "undefined" && typeof(elementsArray.info.fileVersion) != "undefined") {
        fileVersion = elementsArray.info.fileVersion;
        if (fileVersion == "0.4" || fileVersion == "0.6") {
            clearAllLevelElements();
            
            // Ugly copy/paste from 'else if fileVersion == 0.2' to save tiles.
            // {
	    for (var i = 0; i < elementsArray.tiles.length; i++) {
		currentItem = elementsArray.tiles[i];
		var imgSrc = getImgSrc(currentItem.type, currentItem.item);
		if(currentItem.dataX === undefined || currentItem.datay === undefined) {
			currentItem = fetchAttributesFromMenu(currentItem);
		}
		var img = createLevelElement(currentItem.type, currentItem.item, imgSrc, currentItem.dataX, currentItem.dataY, layerFromType(currentItem.item));
		if(currentItem.zone != undefined) {
			img.attr('data-zone', currentItem.zone);
			console.log(currentItem.zone)
			console.log(img);
		}
		$('#'+currentItem.coordsId).append(img);
		setDraggable(img);
            }
            // }

            // Now load scenarii
            // {
            for (var i = 0; i < elementsArray.scenarii.length; i++) {
                var data = elementsArray.scenarii[i];
                if (data.id == 'objectives') {
                    $('#scenarii-zone-objectives-textarea').val(data.value);
                    $('#scenarii-zone-objectives-preview' ).html(data.value);
                }
                else if (data.id == 'briefing') {
                    $('#scenarii-zone-briefing-textarea').val(data.value);
                    $('#scenarii-zone-briefing-preview' ).html(data.value);
                }
                else {
                    createZoneDescriptionForm($('#mapcubus-scenarii-zones'), 'Zone ' + data.id,  data.id, data.value);
                    currentZoneCounter += 1;
                }
            }
            // }

        }
	else if (fileVersion == "0.2") {
            clearAllLevelElements();
	    for (var i = 0; i < elementsArray.tiles.length; i++) {
		currentItem = elementsArray.tiles[i];
		var imgSrc = getImgSrc(currentItem.type, currentItem.item);
		if(currentItem.dataX === undefined || currentItem.datay === undefined) {
			currentItem = fetchAttributesFromMenu(currentItem);
		}
		var img = createLevelElement(currentItem.type, currentItem.item, imgSrc, currentItem.dataX, currentItem.dataY, layerFromType(currentItem.item));
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
		var img = createLevelElement(currentItem.type, currentItem.item, imgSrc, currentItem.dataX, currentItem.dataY, layerFromType(currentItem.item));
		$('#'+currentItem.coordsId).append(img);
		setDraggable(img);
	    }
    }
}

function fetchMapListFromServer() {
	$.get('server.php?action=getLevelsList', function(data) {
        levels = data;
        $('#levels-load-list').html("");
        $.each(data, function(i, item) {
        		var levelItem = '<li data-level="'+item+'" class="level-load-element ui-widget-content">'+item+'</li>';
        		$('#levels-load-list').append(levelItem);
        });
        $('#levels-load-list').selectable({
   			selected: function(event, ui) {
						selectLevel($(ui.selected).attr("data-level"));   			
   			}
		  });
   });	
}

function selectLevel(level) {
	$('#level-name-load').val(level);
}

function clearAllLevelElements() {
    $('.level-element').remove();
    $('#scenarii-zone-objectives-textarea').val ('');
    $('#scenarii-zone-objectives-preview' ).html('');
    $('#scenarii-zone-briefing-textarea')  .val ('');
    $('#scenarii-zone-briefing-preview')   .html('');
    $('#mapcubus-scenarii-zones').html('');
    currentZoneCounter = 0;
}

function getImgSrc(typeTpl, itemTpl) {
    return "http://localhost/mapcubus/tiles/"+itemTpl+"/"+typeTpl;
}

function createLevelElement(typeTpl, itemTpl, imgSrc, dataX, dataY, layer) {
    return $('<img class="level-element draggable-element '+layer+'" data-x="'+dataX+'" data-y="'+dataY+'" data-type-template="'+typeTpl+'" data-item-template="'+itemTpl+'" data-source="'+imgSrc+'" src="'+imgSrc+'" />');
}

function createSaveForm() {
    $("#save-form").dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: {
            "Save Level": function() {
                commitDistant($('#level-name-save').val());
                $( this ).dialog( "close" );
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        },
        close: function() {}
    });

    $("#button-commit-distant").click(function() {
        $("#save-form").dialog("open");
    });
}

function createLoadForm() {
    $("#load-form").dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: {
            "Load Level": function() {
                revertDistant($('#level-name-load').val());
                $(this).dialog( "close" );
            },
            Cancel: function() {
                $(this).dialog( "close" );
            }
        },
        close: function() {}
    });

    $("#button-revert-distant").click(function() {
        $("#load-form").dialog("open");
        fetchMapListFromServer();
    });	
}

function createContextMenu() {
	$("#context-menu-options").menu();
	$("#context-menu-options").hide();
	$("#grid-wrapper").bind("contextmenu",function(e){
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
	$("#set-zone-0-link").click(function() {
		setZone(0);
		$("#context-menu-options").hide();
	});
	$("#set-zone-1-link").click(function() {
		setZone(1);
		$("#context-menu-options").hide();
	});
	$("#set-zone-2-link").click(function() {
		setZone(2);
		$("#context-menu-options").hide();
	});
	$("#set-zone-3-link").click(function() {
		setZone(3);
		$("#context-menu-options").hide();
	});
	$("#set-zone-4-link").click(function() {
		setZone(4);
		$("#context-menu-options").hide();
	});
	$("#set-zone-5-link").click(function() {
		setZone(5);
		$("#context-menu-options").hide();
	});
	$("#set-zone-6-link").click(function() {
		setZone(6);
		$("#context-menu-options").hide();
	});
	$("#set-zone-7-link").click(function() {
		setZone(7);
		$("#context-menu-options").hide();
	});
	$("#set-zone-8-link").click(function() {
		setZone(8);
		$("#context-menu-options").hide();
	});
	$("#set-zone-9-link").click(function() {
		setZone(9);
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

function setZone(z) {
	elems = currentDropTarget.children(".level-element");
	for (var i = 0; i < elems.length; i++) {

		// For now, only rooms are eligible to zones
		if (elems[i].getAttribute("data-item-template") == "rooms") {
			elems[i].setAttribute("data-zone", z);
		}
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
      var layer = $(ui.draggable).attr("data-layer");
      var img = createLevelElement(typeTpl, itemTpl, imgSrc, dataX, dataY, layerFromType(itemTpl));
      appendTarget.append(img);
      setDraggable(img);
      if(ui.draggable.hasClass("level-element")) {
	    ui.draggable.remove();
      }
}

function createZoneDescriptionForm(parentNode, zoneTitle, zoneCounter, zoneDescription) {
    var prefixId          = 'scenarii-zone-' + zoneCounter;
    var textareaTag       = '<textarea id="' + prefixId + '-textarea" class="scenarii-element" data-name="' + zoneCounter + '" rows="10" cols="80">' + zoneDescription + '</textarea>';
    var  previewTag       = '<div      id="' + prefixId + '-preview"></div>';
    var showPreviewButton = '<button id="'   + prefixId + '-preview-button" data-zone="' + zoneCounter + '">Preview</button>';
    var editButton        = '<button id="'   + prefixId + '-edit-button"    data-zone="' + zoneCounter + '">Edit</button>';
    var title             = '<h1>' + zoneTitle + '</h1>';

    var textareaDiv = '<div id="' + prefixId + '-edit-div">' + textareaTag + showPreviewButton + '</div>';
    var previewDiv  = '<div id="' + prefixId + '-view-div">' +  previewTag + editButton        + '</div>';

    parentNode.append('<div id="' + prefixId + '">' + title + textareaDiv + previewDiv + '</div>');
    $('#' + prefixId + '-view-div').hide();

    $('#' + prefixId + '-preview-button').click(function() {
        var prefixId = 'scenarii-zone-' + $(this).attr('data-zone');
        $('#' + prefixId + '-preview').html( $('#' + prefixId + '-textarea').val() );
        $('#' + prefixId + '-edit-div').hide();
        $('#' + prefixId + '-view-div').show();
    });

    $('#' + prefixId + '-edit-button').click(function() {
        var prefixId = 'scenarii-zone-' + $(this).attr('data-zone');
        $('#' + prefixId + '-edit-div').show();
        $('#' + prefixId + '-view-div').hide();
    });
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

    $("#menu-accordion").accordion({
        collapsible: true
    });

    createSaveForm();
    createLoadForm();
    createContextMenu();

    $("#button-commit-local").click(function() {
        commitLocal();
    });
    $("#button-revert-local").click(function() {
        revertLocal();
    });

    $("#button-all-move-left").click(function() {
        allElementsMove(-1, 0);
    });
    $("#button-all-move-up").click(function() {
        allElementsMove(0, -1);
    });
    $("#button-all-move-down").click(function() {
        allElementsMove(0, 1);
    });
    $("#button-all-move-right").click(function() {
        allElementsMove(1, 0);
    });
    
    $('#show-grid').change(function() {
    	  $(".grid-cell").toggleClass('grid-border');
    });

    $('#mapcubus-scenarii-button-add').click(function() {
    		createZoneDescriptionForm($('#mapcubus-scenarii-zones'), 'Zone ' + currentZoneCounter, currentZoneCounter,'');
    		currentZoneCounter += 1;
    });

    createZoneDescriptionForm($('#scenarii-zone-briefing'),   'Briefing',  'briefing',   '');
    createZoneDescriptionForm($('#scenarii-zone-objectives'), 'Ojectives', 'objectives', '');
});
