/**
 * Created by armin on 11/1/14.
 */

'use strict';

var cheerio = require('cheerio');
var url = require('url');
var BPromise = require('bluebird');
var helpers = require('./helpers.js');
var util = require('util');
var mime = require('mime');

/*
Turn images into in-lined data uris
 */
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

exports.processMedia = function(baseUrl, html) {

    return processMedia(baseUrl, html);

};
