var page = require('webpage').create();
var pageName = system.args[1]
page.open('/home/aurelien/web/mapcubus/utilities/'+pageName+'.html', function () {
        page.render('/home/aurelien/web/mapcubus/utilities/temp.png');
        phantom.exit();
}); 
