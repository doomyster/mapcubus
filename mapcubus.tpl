<html>
    <head>
        <link href="jquery/css/ui-lightness/jquery-ui-1.10.1.custom.css" rel="stylesheet">
        <link href="mapcubus.css" rel="stylesheet">
        <script src="jquery/jquery-1.9.1.js"></script>
        <script src="jquery/jquery-ui-1.10.1.custom.js"></script>
        <script src="mapcubus.js"></script>
        <title>Mapcubus</title>
    </head>

    <body>
         <div id="mapcubus-tabs">
            <ul>
                <li><a href="#mapcubus-tab-grid">Map Editor</a></li>
                <li><a href="#mapcubus-tab-scenarii">Scenarii Editor</a></li>
		<li><a href="#mapcubus-tab-exporter">Map Exporter</a></li>
            </ul>
            <div id="mapcubus-tab-grid" class="mapcubus-tab">
                <? include('mapcubus-grid.tpl'); ?>
            </div>

            <div id="mapcubus-tab-scenarii" class="mapcubus-tab">
                <? include('mapcubus-scenarii.tpl'); ?>
            </div>

	    <div id="mapcubus-tab-exporter" class="mapcubus-exporter">
	    	<? include('mapcubus-exporter.tpl'); ?>
	    </div>
        </div>
    </body>
</html>

