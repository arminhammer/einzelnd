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

			// Maintain the state of the file to ultimately be written
			var scope = {
				html: ""
			};

			/**
			 * Start off the chain of events by getting a copy of the web page
			 */
			request.getPS(urlArg)
				// Then get an array of all of the image URLs
				.then(function (data) {
					scope.html = data;
					return getImageArray(scope.html);
				})
				// For each image URL, download it, and replace the URL in the page with the dataUri
				.map(function(link) {
					console.log("Link %s", link.url);
					return getHTTP(link);

				})
				// Generate the dataUris and replace the img src urls with them
				.then(function(linkArray) {
					console.log("Array Length: %d", linkArray.length);
					return buildDataUri(linkArray, scope);
				})
				// Then write the file to disk
				.then(function () {
					fs.writeFilePS(filename, scope.html);
				})
				// Notify the user
				.then(function () {
					console.log("Finished writing %s", filename);
				});
		});

	/**
	 * Get an array of all of the urls in img.src's on the page
	 * @param body
	 * @returns {Array}
	 */
	function getImageArray(body) {

		var $ = cheerio.load(body.toString());

		console.log("Loading $");

		var linkArray = [];

		$('img').each(function (i, elem) {

			console.log("Returning");

			var img = $(this);
			var imageURL = img.attr('src');
			linkArray.push({ url: imageURL });

		});

		console.log(linkArray);
		return linkArray;

	}

	/**
	 * Build the dataUri for each image URL, and replace the URL with the dataUri
	 *
	 * @param link
	 * @param imgData
	 * @param scope
	 * @returns {string}
	 *
	 */
	function buildDataUri(links, scope) {

		var $ = cheerio.load(scope.html.toString());

		console.log("Length: %d", links.length);
		for(var i = 0; i < links.length; i++) {
			console.log("Link: %s", links[i].url);

			var dataUri = util.format("data:%s;base64,%s", mime.lookup(links[i].url), links[i].data);

			var img = $('img').filter(function() {
				return $(this).attr('src') === links[i].url;
			});
			img.attr('src', dataUri);
		}

		scope.html = $.html();
		return scope.html;

	}

	/**
	 * Custom promise-wrap around request.get()
	 * @param requestParam
	 * @returns {Promise}
	 */
	function getHTTP(link) {

		console.log("Starting " + link.url);
		return new Promise(function(resolve, reject) {
			request.get({ url: link.url, encoding: null }, function (error, response, imageData) {

				if(error) {
					reject(error);
				}

				console.log("Status: " + response.statusCode);
				console.log("Size: " + imageData.length);
				link.data = new Buffer(imageData, 'binary').toString('base64');

				console.log("Finished " + link.url);
				console.log("Data URI created: " + link.data.substring(0,100));
				resolve(link);

			});
		});

	}

}