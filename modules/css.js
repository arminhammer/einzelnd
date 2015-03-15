/**
 * Created by armin on 11/1/14.
 */

'use strict';

var url = require('url');
var BPromise = require('bluebird');
var cheerio = require('cheerio');
var helpers = require('./helpers.js');

/*
Get the contents of a css file, and inline it into the main html file.
 */
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

                    console.log('URL: %s, match: %s', cssUrl, match);
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

/*
    Process all css links on a page, and in-line them
 */
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

/*
exports.inlineCSS = function(cssUrl) {

    return inlineCSS(cssUrl);

};
*/

// TODO: remove @embed url tags after inlining
exports.inlineAllCSS = function(baseUrl, html) {

    return inlineAllCSS(baseUrl, html);

};
