/**
 * Created by armin on 11/1/14.
 */

var cheerio = require('cheerio');
var BPromise = require('bluebird');
var url = require('url');

var get = require('./get.js');
var helpers = require('./helpers.js');

function generateScript(html, filename) {

    return new BPromise(function(resolve) {

        console.log('Process anchors');

        var basePage = '<!DOCTYPE html>' +
            '<html>' +
            '<head lang="en">' +
            '<meta charset="UTF-8">' +
            '<title></title>' +
            '</head>' +
            '<body onload="einzelndOpenPage(\'' + filename + '\');">' +
            '<div id="einzelndDiv"></div>' +
            '</body>' +
            '</html>';

        var $ = cheerio.load(basePage);

        /*
         var baseScript = 'function einzelndOpenPage(page) {' +
         'console.log("Opening page %s", page);' +
         'einzelnd(\'#einzelndDiv\').html(page); ' +
         '}' +
         'einzelnd(document).ready(function () {' +
         'console.log("Switching to " + page[\'' + filename + '\']);' +
         'einzelndOpenPage(page[\'' + filename + '\']);' +
         '});';
         */

        resolve($.html());

    });
}

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

        if(pages == null) {

            var pages = {};

        }

        BPromise.map(linksArray, function(link) {

            console.log('Pages: %s', link.url);

            var thisLink = url.resolve(baseUrl, link.link);
            console.log('thisLink: %s, base link: %s', thisLink, baseUrl);
            //if((baseUrl + '/' + filename) === thisLink) {
            //    return;
            //}
            if(pages[thisLink] == null) {

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

exports.getAnchors = function(baseUrl, filename, html, pages) {

    return getAnchors(baseUrl, filename, html, pages);

};

function recursiveGetPage(baseUrl, pageUrl, pages) {

    return new BPromise(function(resolve) {

        if (url.resolve(baseUrl, pageUrl) != baseUrl) {

            get.getPage(pageUrl)
                .then(function (file) {

                    var $ = cheerio.load(file.html);

                    if (pages == null) {

                        var pages = {};

                    }

                    pages[file.filename] = file.html;

                    $('a').each(function () {

                        if ($(this).attr('href')) {

                            console.log('Anchor: %s', $(this).attr('href'));
                            recursiveGetPage(baseUrl, url.resolve(baseUrl, $(this).attr('href')))
                                .then(function(subPages) {
                                    for (var name in subPages) {
                                        if (subPages.hasOwnProperty(name)) {
                                            pages[name] = subPages[name];
                                        }
                                    }


                                });

                        }

                    });

                    resolve(pages);

                });

        }
        else {
            resolve(pages);
        }
    });
}

exports.getAll = function(pageUrl) {

    return new BPromise(function(resolve) {

        var baseUrl = helpers.getBaseUrl(pageUrl);
        recursiveGetPage(baseUrl, pageUrl)
            .then(function(pages) {
                console.log('Pages');
                console.log(pages);
                resolve({ filename: 'recursive.html', html: pages });
            });

    });

};
