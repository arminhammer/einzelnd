/* einzelnd commander component
 * To use add require('../cmds/einzelnd.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

module.exports = function(program) {

	var request = require('request');
	var cheerio = require('cheerio');
	var fs = require('fs');
	var os = require('os');
	var url = require('url');
	var mime = require('mime');
	var util = require('util');
	var http = require('http');
	var Promise = require('promise');

	program
		.command('get')
		.version('0.0.1')
		.description('Download a web page as a single-file archive')
		.action(function(urlArg){

			var urlObj = url.parse(urlArg);

			// Determine the filename of the url.  If it is not in the path, assume index.html.
			var filename = urlObj.pathname.slice(urlObj.pathname.lastIndexOf('/')+1);
			if(filename == "") {
				filename = "index.html";
			}

			console.log(filename);

			var html = "";

			requestGet(urlArg)

				.then(function(body) {

					return embedImages(body);

				})

				.then(function(data) {

					writeFile(filename, data)

						.then(function () {

							console.log("Finished writing %s", filename);

						});

				}),

				function (error) {

					console.log("Error caught: %s", error);

				};

		});

	function requestGet(url) {

		return new Promise(function (resolve, reject) {

			request({ url: url }, function (error, response, body) {

				if (error) {

					return reject(error);

				} else if (response.statusCode !== 200) {

					error = new Error("Unexpected status code: " + response.statusCode);
					error.res = response;
					return reject(error);

				}

				resolve(body);

			});
		});
	}

	function writeFile(filename, body) {

		return new Promise(function (resolve, reject) {

			fs.writeFile(filename, body, function (error) {

				if (error) {

					return reject(error);

				}

				resolve();
			});

		});
	}

	function embedImages(body) {

		return new Promise(function (resolve, reject) {

			var $ = cheerio.load(body);

			console.log("Starting image promise");
			getDataURI($, $('img'))
				.then(resolve(body));
			console.log("Ending image promise");
		});

	}

	function getDataURI($, tag) {

		return new Promise(function (resolve, reject) {

			tag.each(function (i, elem) {
				var img = $(this);
				var imageURL = img.attr('src');
				console.log(imageURL);

				var imgDataUri = requestGet(img.attr('src'))
					.then(function (imageBody) {

						var imageData = new Buffer(imageBody).toString('base64');
						console.log("Type: " + mime.lookup(imageURL));
						console.log("Size: " + imageData.length);
						var dataUri = util.format("data:%s;base64,%s", mime.lookup(imageURL), imageData);
						return dataUri;

					},
					function (error) {

						console.log("Error caught: %s", error);
						return reject(error);

					});

				img.attr('src', imgDataUri);

			});

			resolve($.html());

		});

	}

};