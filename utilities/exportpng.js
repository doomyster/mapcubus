var page = require('webpage').create();
var system = require('system');
if (system.args.length === 1) {
    console.log('Usage: exportpng.js leveltoexport');
    phantom.exit();
}

var pageName = system.args[1];
var url = '/home/aurelien/web/mapcubus/utilities/'+pageName+'_temp.html';
page.open(url, function (status) {
        var png = page.render('/home/aurelien/web/mapcubus/utilities/'+pageName+'.png');
        phantom.exit();
}); 
