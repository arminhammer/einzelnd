/**
 * Created by armin on 11/1/14.
 */

'use strict';

var cheerio = require('cheerio');
var BPromise = require('bluebird');
var url = require('url');

var get = require('./get.js');
var helpers = require('./helpers.js');

function generateScript(filename, pages) {

    return new BPromise(function(resolve) {

        console.log('Process anchors');

        var basePage = '<\!DOCTYPE html>\n<html>\n' +
            '<head lang="en">\n' +
            '<meta charset="UTF-8">\n' +
            '<title></title>\n' +
            '<'+'script lang="text/javascript">\n' +
            'var pages = {};\n';

        for (var page in pages) {
            if (pages.hasOwnProperty(page)) {
                //basePage += 'pages[\'' + page + '\'] = \'' + helpers.removeNewLines(pages[page]) + '\';\n';
                var modPage = helpers.modifyLinks(pages[page]);
                basePage += 'pages[\'' + page + '\'] = \'' + helpers.fixString(modPage) + '\';\n';
            }
        }

        basePage += '\nvar einzelndOpenPage = function(subPage) {\n' +
        'console.log("Opening page %s", subPage);\n' +
        'document.getElementById("einzelndDiv").innerHTML = pages[subPage];\n' +
        '};\n';

        basePage += '<'+'/script>\n' +
        '</head>\n' +
         '<body onload="einzelndOpenPage(\'' + filename + '\');">\n' +
         '<div id="einzelndDiv"></div>\n' +
         '</body>\n' +
         '</html>\r\n';

        console.log('FINISHED PAGE:');
        console.log(basePage);

        resolve(basePage);

    });
}


/*
 function getAnchors(baseUrl, filename, html, pages) {

 return new BPromise(function(resolve) {

 console.log('Process anchors');

 var $ = cheerio.load(html);

 var linksArray = [];

 $('a').each(function() {

 if($(this).attr('href')) {

 console.log('Anchor: %s', $(this).attr('href'));
 linksArray.push({ link: $(this).attr('href')});

 }

 });

 if(pages === null) {

 pages = {};

 }

 BPromise.map(linksArray, function(link) {

 console.log('Pages: %s', link.url);

 var thisLink = url.resolve(baseUrl, link.link);
 console.log('thisLink: %s, base link: %s', thisLink, baseUrl);
 //if((baseUrl + '/' + filename) === thisLink) {
 //    return;
 //}
 if(pages[thisLink] === null) {

 return get.getPage(url.resolve(baseUrl, link.link), true, pages)
 .then(function (response) {

 //console.log('Got response %d, length %s',
 // response.response.statusCode, response.body.length);
 console.log('Got response %s ', response.html);

 pages[thisLink] = response.html;

 });
 }
 else {

 console.log('%s is already in the array', thisLink);
 return;

 }
 })
 .then(function() {

 resolve(generateScript($.html(), filename));

 });

 });
 }
 */
/*
 exports.getAnchors = function(baseUrl, filename, html, pages) {

 return getAnchors(baseUrl, filename, html, pages);

 };
 */

function recursiveGetPage(baseUrl, pageUrl, pages) {

    return new BPromise(function(resolve) {

        get.getPage(pageUrl)
            .then(function (file) {

                var $ = cheerio.load(file.html);

                if (!pages) {

                    pages = {};

                }

                pages[file.filename] = file.html;

                var linkArray = [];

                $('a').each(function () {

                    if ($(this).attr('href')) {

                        console.log('Anchor: %s', $(this).attr('href'));
                        if (url.resolve(baseUrl, $(this).attr('href')) !== baseUrl) {

                            linkArray.push(url.resolve(baseUrl, $(this).attr('href')));

                        }

                    }

                });

                console.log('Links');
                console.log(linkArray);

                BPromise.map(linkArray, function(link) {
                    return recursiveGetPage(baseUrl, link, pages)
                        .then(function (subPages) {
                            for (var name in subPages) {
                                if (subPages.hasOwnProperty(name)) {
                                    pages[name] = subPages[name];
                                }
                            }
                            return pages;
                        });
                })
                    .then(function() {

                        resolve(pages);

                    });

            });
    });
}

exports.getAll = function(pageUrl) {

    return new BPromise(function(resolve) {

        //var baseUrl = helpers.getBaseUrl(pageUrl);
        recursiveGetPage(pageUrl, pageUrl)
            .then(function(pages) {

                console.log('Pages');
                console.log(pages);

                var filename = helpers.getFileName(pageUrl);
                generateScript(filename, pages)
                    .then(function(html) {

                        resolve({ filename: filename, html: html });

                    });

            });

    });

};
