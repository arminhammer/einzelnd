/**
 * Created by armin on 10/21/14.
 */

'use strict';

var cheerio = require('cheerio');
var url = require('url');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'), { suffix: 'PS' });
var request = Promise.promisifyAll(require('request'), { suffix: 'PS' });
var helpers = require('../helpers/helpers.js');


exports.getPage = function(urlArg) {

    return getPage(urlArg);

};

function getPage(urlArg) {

    console.log('getPage: Starting %s', urlArg);

    return new Promise(function(resolve, reject) {

        var urlObj = url.parse(urlArg);

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

        helpers.getHTTP(urlArg)
            .then(function(response) {
                return inlineAllCSS(response.body);
            })
            .then(function(html) {
                resolve(html);
            });

        /*
         getPage('http://localhost:3000/indexBrokenLinks.html').then(function(response) {
         console.log("Response for subrequest is %s", response.response.statusCode);
         helpers.getHTTP(urlArg)
         .then(function(response) {
         resolve(response);
         });

         })
         */

    });

}

function inlineAllCSS(html) {

    return new Promise(function(resolve, reject) {

        var $ = cheerio.load(html);
        $('link').each(function() {
            console.log("Found %s", $(this));
        });
        resolve(html);
    });
}

function inlineCSS(url) {
    return new Promise(function(resolve, reject) {

        helpers.getHTTP(function(response) {
            resolve(response.body);
        });

    });
}

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
