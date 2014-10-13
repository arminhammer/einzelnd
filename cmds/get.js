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


			console.log("Temp dir: " + os.tmpdir());
			var tempLocation = os.tmpdir() + "/" + filename + ".part";

			var html = "";

			console.log("Length: " + html.length);
			embedImages(urlArg, html, function() {
				console.log("Length: " + html.length);
			});

			/*
			fs.writeFile(filename, html, function (err) {
				if (err) throw err;
				console.log('It\'s saved!');
			});
			*/

			//.pipe(fs.createWriteStream(tempLocation));


			/*
			 console.log("Getting page %s", urlArg);
			 fs.createReadStream(tempLocation).pipe(fs.createWriteStream(filename));
			 fs.unlink(tempLocation, function() {
			 console.log("Deleted %s", tempLocation);
			 })
			 */

		});


	function embedImages(pageURL, html, callback) {

		(function() {
			request({ uri: pageURL }, function (error, response, body) {

				var $ = cheerio.load(body);

				$('img').each(function (i, elem) {
					var img = $(this);
					var imageURL = img.attr('src');
					console.log(imageURL);


					request({ uri: img.attr('src') }, function (imageError, imageResponse, imageBody) {
						var imageData = new Buffer(imageBody).toString('base64');
						console.log("Type: " + mime.lookup(imageURL));
						console.log("Size: " + imageData.length);
						var dataUri = util.format("data:%s;base64,%s", mime.lookup(imageURL), imageData);
						img.attr('src');
					});

				});

				html = $.html();

			});
		})();

		callback();
	}

};