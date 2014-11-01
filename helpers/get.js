/**
 * Created by armin on 10/21/14.
 */

'use strict';

var cheerio = require('cheerio');
var url = require('url');
var BPromise = require('bluebird');
var fs = BPromise.promisifyAll(require('fs'), { suffix: 'PS' });
var request = BPromise.promisifyAll(require('request'), { suffix: 'PS' });
var helpers = require('../helpers/helpers.js');
var util = require('util');
var mime = require('mime');

function inlineCSS(cssUrl) {

    return new BPromise(function(resolve) {

        helpers.getHTTP(cssUrl)
            .then(function(response) {

                console.log('INLINE BODY: %s', response.body.length);
                var re = /@import\surl\([\"|\']([\w|\/|\.]+)[\"|\']\)/g;
                console.log('CHECKING');
                var matches = helpers.getMatches(response.body.toString(), re);
                console.log('Matches: ' + matches);
                var embedCssString = '';

                BPromise.map(matches, function(match) {

                    var embedCssUrl = url.resolve(cssUrl, match);
                    console.log(embedCssUrl);
                    return inlineCSS(embedCssUrl)
                        .then(function(embedBody) {
                            console.log('Embed body: %s', embedBody);
                            embedCssString += embedBody;
                        });

                })
                    .then(function() {

                        var combinedBody = response.body.toString() + embedCssString;
                        resolve(combinedBody);

                    });

            });

    });

}

// TODO: remove @embed url tags after inlining
function inlineAllCSS(baseUrl, html) {

    return new BPromise(function(resolve) {

        var $ = cheerio.load(html);
        var linkArray = [];

        $('link').each(function() {

            console.log('Found %s', $(this));
            var link = url.resolve(baseUrl, $(this).attr('href'));
            console.log('Link is %s', link);
            linkArray.push(link);

        });

        var cssString = '';

        BPromise.map(linkArray, function(link) {

            console.log('LINK: %s', link);

            return inlineCSS(link)
                .then(function(cssData) {

                    console.log('cssData: %s', cssData);
                    return cssString += cssData;

                });
        })
            .then(function() {

                console.log('CSSString:');
                console.log(cssString);
                $('head').append('<style>\n' + cssString + '</style>\n');
                resolve($.html());

            });

    });
}

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

                return inlineAllCSS(urlArg, response.body);

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

exports.getPageOld = function(urlArg) {

    var urlObj = url.parse(urlArg);
    //console.log('base: ' + urlObj.host);

    // Determine the filename of the url.  If it is not in the path, assume index.html.
    var filename = urlObj.pathname.slice(urlObj.pathname.lastIndexOf('/') + 1);
    if (filename === '') {
        filename = 'index.html';
    }

    console.log(filename);

    // Maintain the state of the file to ultimately be written
    var scope = {
        baseUrl: 'http://' + urlObj.host,
        html: '',
        elements: [],
        inline: []
    };

    /**
     * Start off the chain of events by getting a copy of the web page
     */
    request.getPS(urlArg)
        // First get the javascript and css resources, which can be inlined.
        .then(function (data) {

            // First save the request result to the scope.html variable
            scope.html = data;

            return helpers.getInlineResources(scope);

        })
        // For each css or js resource, download it, and replace the URL in the page with the resource
        .map(function(element) {

            console.log('Element %s', element.url);
            return helpers.getHTTP1(element);

        })
        //
        .then(function() {
            return helpers.mergeInlineResources(scope);
        })
        // Then get an array of all of the image URLs
        .then(function () {

            return helpers.getMediaArray(scope);

        })
        // For each image URL, download it, and replace the URL in the page with the dataUri
        .map(function(element) {

            console.log('Element %s', element.url);
            return helpers.getHTTP1(element);

        })
        // Generate the dataUris and replace the img src urls with them
        .then(function() {

            console.log('Array Length: %d', scope.elements.length);
            return helpers.buildDataUri(scope);

        })
        // Then write the file to disk
        .then(function () {

            fs.writeFilePS(filename, scope.html);

        })
        // Notify the user
        .then(function () {
            console.log('Finished writing %s', filename);

        });
};
