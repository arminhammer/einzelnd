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
                //For each image URL, download it, and replace the URL in the page with the dataUri
                .map(function(link) {
                    console.log("Link %s", link);
                    return request.getPS(link)
                        .then(function(imageData) {
                            //console.log("Image Data: " + imageData.toString());
                            buildDataUri(link, imageData, scope);
                        });
                })
                //Then write the file to disk
                .then(function (response) {
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
            linkArray.push(imageURL);

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
    function buildDataUri(link, imgData, scope) {

        var $ = cheerio.load(scope.html.toString());

        console.log("Link: %s", link);
        //console.log("Status code: %s", imgData.statusCode);
        var img = $('img').filter(function() {
            return $(this).attr('src') === link;
        });
        console.log("Tag: " + img);

        var dataString = new Buffer(imgData.toString(), 'binary').toString('base64');
        console.log("Type: " + mime.lookup(link));
        console.log("Size: " + dataString.length);
        console.log("Datastring: " + dataString.substring(0, 100));
        var dataUri = util.format("data:%s;base64,%s", mime.lookup(link), dataString);
        img.attr('src', dataUri);
        //console.log("New Tag: " + img);

        scope.html = $.html();
        return scope.html;

    }

};