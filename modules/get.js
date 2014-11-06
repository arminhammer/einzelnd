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

/**
 * Download the page from urlArg.  If recursive is true, download all links that share the base url of the urlArg and
 * add it to the file
 * @param urlArg
 * @param recursive
 * @returns {Promise}
 */
function getPage(urlArg) {

    console.log('getPage: Starting %s', urlArg);

    return new BPromise(function(resolve) {

        var urlObj = url.parse(urlArg);
        var baseUrl = urlObj.protocol + '//' + urlObj.host;
        console.log('Base URL: ' + baseUrl);

        var filename = helpers.getFileName(urlArg);

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

                return html;

            })
            .then(function(html) {

                resolve({filename: filename, html: html });

            });

    });

}

exports.getPage = function(urlArg) {

    return getPage(urlArg);

};
