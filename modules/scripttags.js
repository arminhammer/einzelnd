/**
 * Created by armin on 11/1/14.
 */

'use strict';

var cheerio = require('cheerio');
var url = require('url');
var BPromise = require('bluebird');
var helpers = require('./helpers.js');

/*
Take javascript scripts and in-line them.
 */
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

exports.inlineScripts = function(baseUrl, html) {
    return inlineScripts(baseUrl, html);
};
