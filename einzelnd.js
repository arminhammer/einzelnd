/**
 * Created by armin on 10/21/14.
 */

'use strict';

var get = require('./modules/get.js');
var site = require('./modules/site.js');

var program = require('commander');
var fs = require('fs');

program
    .version('0.0.1')
    .option('-a, --all', 'Download every link from the same site')
    .option('--verbose', 'Print out detailed log information');

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
        if(program.all) {

            site.getAll(url).then(function(file) {

                console.log('Writing file %s', file.filename);
                fs.writeFile(file.filename, file.html);

            });

        }
        else {

            get.getPage(url).then(function(file) {

                console.log('Writing file %s', file.filename);
                fs.writeFile(file.filename, file.html);

            });

        }

    });

program
    .parse(process.argv);

if (program.args.length < 1 ) {
    console.log('No command specified. See \'einzelnd --help\':');
    program.outputHelp();
    process.exit(1);
}
