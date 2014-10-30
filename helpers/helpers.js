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
exports.getMediaArray = function(scope) {

    var $ = cheerio.load(scope.html.toString());

    console.log('Getting media');

    $('img').each(function() {
        parseHTML($(this), 'src', scope.elements)
    });

    var re = /@import\surl\([\"|\']([\w|\/|\.]+)[\"|\']\)/g;
    //var match = [];
    $('style').each(function() {
        console.log("CHECKING %s", $(this));
        var body = $(this).html();
        var match = re.exec(body);
        if(match) {
            console.log("FOUND match %s, length %d, first: %s", match, match.length, match[1]);
            scope.elements.push(
                {
                    tag: 'style',
                    attr: '',
                    url: match[1]
                }
            )
        }
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

    $('script').each(function() {
        parseHTML($(this), 'src', scope.inline)
    });

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

exports.mergeInlineResources = function(scope) {

    var $ = cheerio.load(scope.html.toString());

    console.log('Inline resources: %d', scope.inline.length);
    for(var i = 0; i < scope.inline.length; i++) {

        var resource = $(scope.inline[i].tag).filter(function() {
            return $(this).attr(scope.inline[i].attr) === scope.inline[i].url;
        });
        var parent = resource.parent();
        //console.log('resource is %s, parent is %s', resource, parent);
        if(scope.inline[i].tag == 'link') {
            parent.append('<style>' + scope.inline[i].data + '</style>');
        }
        if(scope.inline[i].tag == 'script') {
            parent.append('<script>' + scope.inline[i].data + '</script>');
        }
        resource.remove();
    }

    scope.html = $.html();
    return scope.html;

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
        console.log('Link: %s, data: %s', scope.elements[i].url);

        var dataUri = util.format('data:%s;base64,%s', mime.lookup(scope.elements[i].url), scope.elements[i].dataUri);

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
exports.getHTTP = function(url) {

    //console.log('Starting %s', url.url);
    return new helperPromise(function(resolve, reject) {
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


/**
 * Custom promise-wrap around request.get()
 * @param requestParam
 * @returns {Promise}
 */
exports.getHTTP1 = function(link) {

    console.log('Starting %s', link.url);
    return new helperPromise(function(resolve, reject) {
        request.get({ url: link.url, encoding: null }, function (error, response, data) {

            if(error) {
                console.log('Error: ' + error);
                console.log('Response status code ' + response.statusCode);
                reject(error);
            }

            console.log('Status: %d', response.statusCode);
            console.log('Size: %d', data.length);
            link.data = data;
            link.dataUri = new Buffer(data, 'binary').toString('base64');
            console.log('Finished %s', link.url);
            console.log('Data URI created: %s', link.dataUri.substring(0,100));
            resolve(link);

        });
    });

};
