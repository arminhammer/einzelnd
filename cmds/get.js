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
				html: ''
			};

			/**
			 * Start off the chain of events by getting a copy of the web page
			 */
			request.getPS(urlArg)
				// Then get an array of all of the image URLs
				.then(function (data) {
					scope.html = data;
					return helpers.getImageArray(scope.html);
				})
				// For each image URL, download it, and replace the URL in the page with the dataUri
				.map(function(link) {
					console.log('Link %s', link.url);
					return helpers.getHTTP(link);

				})
				// Generate the dataUris and replace the img src urls with them
				.then(function(linkArray) {
					console.log('Array Length: %d', linkArray.length);
					return helpers.buildDataUri(linkArray, scope);
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