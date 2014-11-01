
'use strict';

var BPromise = require('bluebird');
var request = require('request');

/**
 * Custom promise-wrap around request.get()
 * @param requestParam
 * @returns {Promise}
 */
exports.getHTTP = function(url) {

    //console.log('Starting %s', url.url);
    return new BPromise(function(resolve, reject) {
        request.get({ url: url, encoding: null }, function (error, response, body) {

            if(error) {
                console.log('Error: ' + error);
                console.log('Response status code ' + response.statusCode);
                reject(error);
            }

            console.log('Status: %d', response.statusCode);
            console.log('Size: %d', body.length);
            resolve({ response: response, body: body});

        });
    });

};

exports.getMatches = function(string, regex, index) {
    index || (index = 1); // default to the first capturing group
    var matches = [];
    var match;
    while (match = regex.exec(string)) {
        matches.push(match[index]);
    }
    return matches;
};
