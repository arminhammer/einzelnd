/* einzelnd commander component
 * To use add require('../cmds/einzelnd.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

module.exports = function(program) {

	var url = require('url');
	var Promise = require('bluebird');

	var fs = Promise.promisifyAll(require('fs'), { suffix: 'PS' });
	var request = Promise.promisifyAll(require('request'), { suffix: 'PS' });

    var helpers = require('../helpers/helpers.js');

	program
		.command('get')
		.version('0.0.1')
		.description('Download a web page as a single-file archive')
		.action(function(urlArg) {

            var urlObj = url.parse(urlArg);

            // Determine the filename of the url.  If it is not in the path, assume index.html.
            var filename = urlObj.pathname.slice(urlObj.pathname.lastIndexOf('/') + 1);
            if (filename === '') {
                filename = 'index.html';
            }

            console.log(filename);

            // Maintain the state of the file to ultimately be written
            var scope = {
                html: '',
                elements: []
            };

            var processImages = function () {

                return (function() {
                    return scope.images.map(function (image) {
                        console.log('Image URL: Link %s', image.url);
                        return helpers.getHTTP(image);

                    });
                })();

            };

			/**
			 * Start off the chain of events by getting a copy of the web page
			 */
			request.getPS(urlArg)
				// Then get an array of all of the image URLs
				.then(function (data) {

					scope.html = data;
					return helpers.getImageArray(scope);

                })
                // For each image URL, download it, and replace the URL in the page with the dataUri
                .map(function(element) {
                    console.log('Element %s', element.url);
                    return helpers.getHTTP(element);

                })
				// Generate the dataUris and replace the img src urls with them
				.then(function() {

					console.log('Array Length: %d', scope.elements.length);
					return helpers.buildDataUri(scope);

                })
				// Then write the file to disk
				.then(function () {

				    fs.writeFilePS(filename, scope.html);

                })
				// Notify the user
				.then(function () {

                    console.log('Finished writing %s', filename);

                });
		});

};