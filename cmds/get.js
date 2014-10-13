/* einzelnd commander component
 * To use add require('../cmds/einzelnd.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

module.exports = function(program) {

	var request = require('request');
	var fs = require('fs');
	var os = require('os');
	var url = require('url');

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
			request(urlArg).pipe(fs.createWriteStream(tempLocation));
			console.log("Getting page %s", urlArg);
			fs.createReadStream(tempLocation).pipe(fs.createWriteStream(filename));
			fs.unlink(tempLocation, function() {
				console.log("Deleted %s", tempLocation);
			})

		});
	
};