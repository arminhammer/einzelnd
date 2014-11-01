/**
 * Created by armin on 10/21/14.
 */

'use strict';

var get = require('./modules/get.js');

var program = require('commander');
var fs = require('fs');

program
    .version('0.0.1');

program
    .on('*', function(name) {
        console.log('\''+name+'\' is not a known command. See \'einzelnd --help\':');
        program.outputHelp();
        process.exit(1);
    });

program
    .command('get')
    .version('0.0.1')
    .description('Download a web page as a single-file archive')
    .action(function(url) {
        console.log(url);
        get.getPage(url).then(function(file) {
            console.log('File:');
            //console.log(file.html.toString());
            fs.writeFile(file.filename, file.html);

        });

    });

program
    .parse(process.argv);

if (program.args.length < 1 ) {
    console.log('No command specified. See \'einzelnd --help\':');
    program.outputHelp();
    process.exit(1);
}
