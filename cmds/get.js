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

			var scope = {
				html: ""
			};

			request.getPS(urlArg)
				.then(function (data) {
					//scope.html = data;
					fs.writeFileSync("scope.html", scope.html);
					return getImageArray(scope.html);
				})
				.map(function(link) {
					console.log("Link %s", link);
					fs.writeFileSync("scope1.html", scope.html);
					return request.getPS(link)
						.then(function(imageData) {
							buildDataUri(link, imageData, scope);
						});
				})
				.then(function(response) {
					console.log("Response: %s, link: %s", response);
				})
				.then(function (response) {
					fs.writeFilePS(filename, scope.html);
				})
				.then(function () {
					console.log("Finished writing %s", filename);
				});
		});

	function getImageArray(body) {

		var $ = cheerio.load(body.toString());

		console.log("Loading $");

		var linkArray = [];

		$('img').each(function (i, elem) {

			console.log("Returning");

			var img = $(this);
			var imageURL = img.attr('src');
			linkArray.push(imageURL);

		});

		console.log(linkArray);
		return linkArray;

	}

	function buildDataUri(link, imgData, scope) {

		var $ = cheerio.load(scope.html.toString());

		console.log("Link: %s", link);
		var img = $('img').attr('src', link);
		console.log("Tag: " + img);


		var dataString = new Buffer(imgData).toString('base64');
		console.log("Type: " + mime.lookup(link));
		console.log("Size: " + dataString.length);
		var dataUri = util.format("data:%s;base64,%s", mime.lookup(link), dataString);
		img.attr('src', dataUri);

		scope.html = $.html();
		return;

	}

};