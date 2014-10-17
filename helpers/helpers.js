/* einzelnd commander component
 * To use add require('../cmds/einzelnd.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

var cheerio = require('cheerio');
var Promise = require('bluebird');
//var request = Promise.promisifyAll(require('request'), { suffix: 'PS' });
var request = require('request');
var util = require('util');
var mime = require('mime');

/**
 * Get an array of all of the urls in img.src's on the page
 * @param body
 * @returns {Array}
 */
exports.getImageArray = function(body) {

    var $ = cheerio.load(body.toString());

    console.log('Loading $');

    var linkArray = [];

    $('img').each(function () {

        console.log('Returning');

        var img = $(this);
        var imageURL = img.attr('src');
        linkArray.push({ url: imageURL });

    });

    console.log(linkArray);
    return linkArray;

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
exports.buildDataUri = function(links, scope) {

    var $ = cheerio.load(scope.html.toString());

    console.log('Length: %d', links.length);
    for(var i = 0; i < links.length; i++) {
        console.log('Link: %s', links[i].url);

        var dataUri = util.format('data:%s;base64,%s', mime.lookup(links[i].url), links[i].data);

        var img = $('img').filter(function() {
            return $(this).attr('src') === links[i].url;
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
    return new Promise(function(resolve, reject) {
        request.get({ url: link.url, encoding: null }, function (error, response, imageData) {

            if(error) {
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

