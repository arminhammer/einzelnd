
'use strict';

var BPromise = require('bluebird');
var request = require('request');
var cheerio = require('cheerio');

var url = require('url');

/**
 * Custom promise-wrap around request.get()
 * @param requestParam
 * @returns {Promise}
 */
exports.getHTTP = function(url) {

    return new BPromise(function(resolve, reject) {
        request.get({ url: url, encoding: null }, function (error, response, body) {

            if(error) {
                console.log('Error: ' + error);
                reject(error);
            }
            else {
                console.log('Status: %d', response.statusCode);
                console.log('Size: %d', body.length);
                resolve({response: response, body: body});
            }
        });
    });

};

/*
 Regex helper function
 */
exports.getMatches = function(string, regex) {

    var matches = [];
    var match;

    while (match = regex.exec(string)) {

        matches.push(match[1]);

    }

    return matches;

};

/*
Get the file name from a url
 */
exports.getFileName = function(urlArg) {

    var urlObj = url.parse(urlArg);
    var filename = urlObj.pathname.slice(urlObj.pathname.lastIndexOf('/') + 1);

    if (filename === '') {

        filename = 'index.html';

    }

    return filename;

};

/*
Make sure to escape <script> tags in the input file
 */
exports.fixString = function(string) {

    var re = /<\/script>/g;
    string = string.replace(re, '<\'+\'/script>');
    var re2 = /\r?\n|\r/g;

    return string.replace(re2, '');

};

/*
Modify links so that they are accessible in the master output page.
 */
exports.modifyLinks = function(page) {

    var $ = cheerio.load(page, {decodeEntities: false});

    $('a').each(function() {

       var link = $(this).attr('href');
        $(this).attr('href', '#');
        $(this).attr('onclick', 'einzelndOpenPage(\\\'' + link + '\\\')');

    });

    return $.html();

};
