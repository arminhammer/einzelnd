/**
 * Created by armin on 10/21/14.
 */

'use strict';

var url = require('url');
var BPromise = require('bluebird');
var helpers = require('./helpers.js');
var css = require('./css');
var scripts = require('./scripttags.js');
var media = require('./media.js');

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

                return scripts.inlineScripts(urlArg, html);

            })
            .then(function(html) {

                return media.processMedia(urlArg, html);

            })
            .then(function(html) {

                resolve({filename: filename, html: html });

            });

    });

}

exports.getPage = function(urlArg) {

    return getPage(urlArg);

};
