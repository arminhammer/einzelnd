/**
 * Created by armin on 11/1/14.
 */

var cheerio = require('cheerio');
var BPromise = require('bluebird');

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

        $('a').each(function() {

            if($(this).attr('href')) {

                console.log('Anchor: %s', $(this).attr('href'));

            }

        });

        resolve(generateScript($.html(), filename));

    });
}

exports.getAnchors = function(baseUrl, filename, html) {

    return getAnchors(baseUrl, filename, html);

}
