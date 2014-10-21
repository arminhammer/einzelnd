/* einzelnd commander component
 * To use add require('../cmds/einzelnd.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

var cheerio = require('cheerio');
var helperPromise = require('bluebird');
//var request = helperPromise.promisifyAll(require('request'), { suffix: 'PS' });
var request = require('request');
var util = require('util');
var mime = require('mime');

/**
 * Get an array of all of the urls in img.src's on the page
 * @param body
 * @returns {Array}
 */
exports.getImageArray = function(scope) {

    var $ = cheerio.load(scope.html.toString());

    console.log('Loading $');

    $('img').each(function () {

        console.log('Returning');

        var img = $(this);
        var imageURL = img.attr('src');
        scope.images.push({ url: imageURL });

    });

    console.log(scope.images);
    return scope;

};

/**
 * Build the dataUri for each image URL, and replace the URL with the dataUri
 *
 * @param link
 * @param imgData
 * @param scope
 * @returns {string}
 *
 */
exports.buildDataUri = function(scope) {

    var $ = cheerio.load(scope.html.toString());

    console.log('Length: %d', scope.images.length);
    for(var i = 0; i < scope.images.length; i++) {
        console.log('Link: %s', scope.images[i].url);

        var dataUri = util.format('data:%s;base64,%s', mime.lookup(scope.images[i].url), scope.images[i].data);

        var img = $('img').filter(function() {
            return $(this).attr('src') === scope.images[i].url;
        });
        img.attr('src', dataUri);
    }

    scope.html = $.html();
    return scope.html;

};

/**
 * Custom promise-wrap around request.get()
 * @param requestParam
 * @returns {Promise}
 */
exports.getHTTP = function(link) {

    console.log('Starting %s', link.url);
    return new helperPromise(function(resolve, reject) {
        request.get({ url: link.url, encoding: null }, function (error, response, imageData) {

            if(error) {
                console.log('Error: ' + error);
                console.log('Response status code ' + response.statusCode);
                reject(error);
            }

            console.log('Status: %d', response.statusCode);
            console.log('Size: %d', imageData.length);
            link.data = new Buffer(imageData, 'binary').toString('base64');

            console.log('Finished %s', link.url);
            console.log('Data URI created: %s', link.data.substring(0,100));
            resolve(link);

        });
    });

};

