
'use strict';

var BPromise = require('bluebird');
var request = require('request');

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

exports.getMatches = function(string, regex) {

    var matches = [];
    var match;

    while (match = regex.exec(string)) {

        matches.push(match[1]);

    }

    return matches;

};

exports.getBaseUrl = function(urlArg) {

    var urlObj = url.parse(urlArg);
    return urlObj.protocol + '//' + urlObj.host;

};

exports.getFileName = function(urlArg) {

    var urlObj = url.parse(urlArg);
    var filename = urlObj.pathname.slice(urlObj.pathname.lastIndexOf('/') + 1);

    if (filename === '') {

        filename = 'index.html';

    }

    return filename;

};

function splitScriptTag(string) {

    var re = /<\/script>/g;
    return string.replace(re, '<\'+\'/script>');

}

function removeNewLines(string) {

    var re = /\r?\n|\r/g;
    return string.replace(re, '');

}

exports.fixString = function(string) {

    string = splitScriptTag(string);
    return removeNewLines(string);

};
