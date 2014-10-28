/* einzelnd commander component
 * To use add require('../cmds/einzelnd.js')(program) to your commander.js based node executable before program.parse
 */
'use strict';

var cheerio = require('cheerio');
var helperPromise = require('bluebird');
//var request = helperPromise.promisifyAll(require('request'), { suffix: 'PS' });
var request = require('request');
var util = require('util');
var mime = require('mime');

/**
 * Get an array of all of the urls in img.src's on the page
 * @param body
 * @returns {Array}
 */
exports.getImageArray = function(scope) {

    var $ = cheerio.load(scope.html.toString());

    console.log('Getting media');

    $('img').each(function() {
        parseHTML($(this), 'src', scope.elements)
    });

    console.log(scope.elements);
    return scope.elements;

};

exports.getInlineResources = function(scope) {

    var $ = cheerio.load(scope.html.toString());

    console.log('Getting inline resources');

    $('link').each(function() {

        if($(this).attr('rel') === 'stylesheet' || $(this).attr('rel') === 'text/css')
        {
            parseHTML($(this), 'href', scope.inline);
        }

    });

    //$('script').each(function() {
    //    parseHTML($(this), 'src', scope.inline)
    //});

    console.log(scope.inline);
    return scope.inline;

};

var parseHTML = function(tag, attr, array) {

    console.log('Adding %s to array', tag);

    var item = tag;
    var itemURL = item.attr(attr);
    if(itemURL) {
        array.push({
            tag: tag[0].name,
            attr: attr,
            url: itemURL
        });
    }
};

var parseInline = function(tag, attr) {

    console.log('Adding %s to array', tag);

    var item = tag;
    return item.attr(attr);

};

var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

/**
 * Build the dataUri for each image URL, and replace the URL with the dataUri
 *
 * @param link
 * @param imgData
 * @param scope
 * @returns {string}
 *
 */
exports.buildDataUri = function(scope) {

    var $ = cheerio.load(scope.html.toString());

    console.log('Length: %d', scope.elements.length);
    for(var i = 0; i < scope.elements.length; i++) {
        console.log('Link: %s, data: %s', scope.elements[i].url);//, scope.elements[i].data.length);

        var dataUri = util.format('data:%s;base64,%s', mime.lookup(scope.elements[i].url), scope.elements[i].data);

        var img = $(scope.elements[i].tag).filter(function() {
            return $(this).attr(scope.elements[i].attr) === scope.elements[i].url;
        });
        img.attr('src', dataUri);
    }

    scope.html = $.html();
    return scope.html;

};

/**
 * Custom promise-wrap around request.get()
 * @param requestParam
 * @returns {Promise}
 */
exports.getHTTP = function(link) {

    console.log('Starting %s', link.url);
    return new helperPromise(function(resolve, reject) {
        request.get({ url: link.url, encoding: null }, function (error, response, imageData) {

            if(error) {
                console.log('Error: ' + error);
                console.log('Response status code ' + response.statusCode);
                reject(error);
            }

            console.log('Status: %d', response.statusCode);
            console.log('Size: %d', imageData.length);
            link.data = new Buffer(imageData, 'binary').toString('base64');

            console.log('Finished %s', link.url);
            console.log('Data URI created: %s', link.data.substring(0,100));
            resolve(link);

        });
    });

};

//NOT FINISHED
/**
 * Custom promise-wrap around request.get() that saves JS and CSS resouces in-line in the html
 * @param requestParam
 * @returns {Promise}
 */
exports.getInlineResourceHTTP = function(inlineResource, scope) {

    console.log('Starting %s', inlineResource.url);
    return new helperPromise(function(resolve, reject) {
        request.get({ url: inlineResource.url, encoding: null }, function (error, response, inlineResourceResponse) {

            if(error) {
                console.log('Error: ' + error);
                console.log('Response status code ' + response.statusCode);
                reject(error);
            }

            console.log('Status: %d', response.statusCode);
            console.log('Size: %d', inlineResourceResponse.length);

            var $ = cheerio.load(scope.html.toString());

            var res = $(inlineResource.tag).filter(function() {
                return $(this).attr(inlineResource.attr) === inlineResource.url;
            });

            console.log("Res: " + res.html());

            res.attr(inlineResource.attr, '');
            res.html(inlineResourceResponse);

            console.log("Res New: " + res.html());


            //inlineResource.data = new Buffer(inlineResourceResponse, 'binary').toString('base64');

            console.log('Finished %s', inlineResource.url);
            //console.log('Data URI created: %s', inlineResource.data.substring(0,100));
            resolve(inlineResource);

        });
    });

};
