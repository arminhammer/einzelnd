/**
 * Created by armin on 10/21/14.
 */

'use strict';

var cheerio = require('cheerio');
var url = require('url');
var BPromise = require('bluebird');
var helpers = require('./helpers.js');
var util = require('util');
var mime = require('mime');
var css = require('./css');

// TODO: remove <script src=> tags after inlining
function inlineScripts(baseUrl, html) {

    return new BPromise(function(resolve) {

        var $ = cheerio.load(html);
        var linkArray = [];

        $('script').each(function() {

            if($(this).attr('src')) {

                console.log('Found %s', $(this));
                var link = url.resolve(baseUrl, $(this).attr('src'));
                console.log('Link is %s', link);
                linkArray.push(link);

            }

        });

        console.log('Script array: %s', linkArray);

        var scriptString = '';

        BPromise.map(linkArray, function(link) {

            console.log('Script: %s', link);

            return helpers.getHTTP(link)
                .then(function(scriptData) {

                    console.log('scriptData: %s', scriptData.body);
                    return scriptString += scriptData.body;

                });
        })
            .then(function() {

                console.log('scriptString:');
                console.log(scriptString);
                $('head').append('<script>\n' + scriptString + '</script>\n');
                resolve($.html());

            });

    });
}

function processMedia(baseUrl, html) {

    return new BPromise(function(resolve) {

        var $ = cheerio.load(html);
        var linkArray = [];

        $('img').each(function() {

            if($(this).attr('src')) {

                console.log('Found %s', $(this));
                var link = url.resolve(baseUrl, $(this).attr('src'));
                console.log('Link is %s', link);
                linkArray.push(link);

            }

        });

        console.log('Image array: %s', linkArray);

        BPromise.map(linkArray, function(link) {

            console.log('Image: %s', link);

            return helpers.getHTTP(link)
                .then(function(response) {

                    var stringData = new Buffer(response.body, 'binary').toString('base64');
                    var dataUri = util.format('data:%s;base64,%s', mime.lookup(link), stringData);

                    console.log('Looking for img tag');

                    var img = $('img').filter(function() {

                        return url.resolve(baseUrl, $(this).attr('src')) === link;
                    });

                    //var img = $('img').attr('src', link);
                    console.log('img is %s', img);
                    img.attr('src', dataUri);

                    console.log('imageData: %s', response.body.length);

                });
        })
            .then(function() {

                resolve($.html());

            });

    });
}

function getPage(urlArg) {

    console.log('getPage: Starting %s', urlArg);

    return new BPromise(function(resolve) {

        var urlObj = url.parse(urlArg);
        var baseUrl = urlObj.protocol + '//' + urlObj.host;
        console.log('Base URL: ' + baseUrl);

        // Determine the filename of the url.  If it is not in the path, assume index.html.
        var filename = urlObj.pathname.slice(urlObj.pathname.lastIndexOf('/') + 1);

        if (filename === '') {

            filename = 'index.html';

        }

        console.log(filename);

        helpers.getHTTP(urlArg)
            .then(function(response) {

                return css.inlineAllCSS(urlArg, response.body);

            })
            .then(function(html) {

                return inlineScripts(urlArg, html);

            })
            .then(function(html) {

                return processMedia(urlArg, html);

            })
            .then(function(html) {

                resolve({filename: filename, html: html });

            });

    });

}

exports.getPage = function(urlArg) {

    return getPage(urlArg);

};
