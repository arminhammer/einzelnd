/**
 * Created by armin on 10/21/14.
 */


getHelper = require('./helpers/get.js');

var opts = require("nomnom");

opts.command('get')
    .callback(function(url) {
        console.log(url);
        getHelper.getPage(url[1]);
    })
    .help("Download and embed a web page");

opts.option('version', {
    flag: true,
    help: 'print version and exit',
    callback: function() {
        return "version 0.0.1";
    }
});

opts.parse();

if (opts.debug) {

}

