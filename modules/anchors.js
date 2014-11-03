/**
 * Created by armin on 11/1/14.
 */

var cheerio = require('cheerio');
var BPromise = require('bluebird');
var get = require('./get.js');
var url = require('url');

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

function getAnchors(baseUrl, filename, html) {

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

        var pages = {};

        BPromise.map(linksArray, function(link) {

            console.log('Pages: %s', link.url);

            var thisLink = url.resolve(baseUrl, link.link);
            console.log('thisLink: %s, base link: %s', thisLink, baseUrl);
            //if((baseUrl + '/' + filename) === thisLink) {
            //    return;
            //}
            if(!pages[thisLink]) {

                return get.getPage(url.resolve(baseUrl, link.link), false)
                    .then(function (response) {

                        //console.log('Got response %d, length %s', response.response.statusCode, response.body.length);
                        console.log('Got response %s', response);
                        pages[thisLink] = response.body;

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

exports.getAnchors = function(baseUrl, filename, html) {

    return getAnchors(baseUrl, filename, html);

}
