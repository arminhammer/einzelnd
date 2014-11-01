/**
 * Created by armin on 11/1/14.
 */

var cheerio = require('cheerio');
var BPromise = require('bluebird');

function getAnchors(baseUrl, html) {

    return new BPromise(function(resolve) {

        console.log('Process anchors');

        var $ = cheerio.load(html);

        $('a').each(function() {

            if($(this).attr('href')) {

                console.log('Anchor: %s', $(this).attr('href'));

            }

        });

        resolve($.html());

    });
}

exports.getAnchors = function(baseUrl, html) {

    return getAnchors(baseUrl, html);

}
