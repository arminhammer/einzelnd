/* einzelnd commander component
 * To use add require('../cmds/einzelnd.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

module.exports = function(program) {

	var cheerio = require('cheerio');
	var os = require('os');
	var url = require('url');
	var mime = require('mime');
	var util = require('util');
	var http = require('http');
	var Promise = require('bluebird');

	var fs = Promise.promisifyAll(require('fs'), { suffix: "PS" });
	var request = Promise.promisifyAll(require('request'), { suffix: "PS" });

	program
		.command('get')
		.version('0.0.1')
		.description('Download a web page as a single-file archive')
		.action(function(urlArg) {

			var urlObj = url.parse(urlArg);

			// Determine the filename of the url.  If it is not in the path, assume index.html.
			var filename = urlObj.pathname.slice(urlObj.pathname.lastIndexOf('/') + 1);
			if (filename == "") {
				filename = "index.html";
			}

			console.log(filename);

			var html = "";

			request.getPS(urlArg)
				.then(function (data) {
					embedImages(data);
				})
				.then(function (response) {
					fs.writeFilePS(filename, response);
				})
				.then(function () {
					console.log("Finished writing %s", filename);
				});
		});

	function embedImages(body) {

		return (function() {

			var $ = cheerio.load(body.toString());

			console.log("Loading $");


			$('img').each(function (i, elem) {

				console.log("Returning");

				var img = $(this);
				var imageURL = img.attr('src');

				console.log("Requesting");
				request.getPS(img.attr('src'))

					.then(function (imageBody) {

						var imageData = new Buffer(imageBody).toString('base64');
						console.log("Type: " + mime.lookup(imageURL));
						console.log("Size: " + imageData.length);
						var dataUri = util.format("data:%s;base64,%s", mime.lookup(imageURL), imageData);
						img.attr('src', dataUri);
						return dataUri;

					});

				console.log("Requested.");

			});

			console.log("Done embedding.");
			return $.html();

		})();

	}

};