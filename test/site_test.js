'use strict';

var expect = require('expect.js');

var site = require('../modules/site.js');

describe('get', function() {

    it('generateScript should generate a proper script', function() {

        var filename = 'small.html';
        var pages = {};
        pages['1.html'] = '<html></html>';
        pages['2.html'] = '<html></html>';

        var expectedHTML = '<!DOCTYPE html>\n<html>\n<head lang="en">\n<meta charset="UTF-8">\n<title></title>\n<script lang="text/javascript">\nvar pages = {};\npages[\'1.html\'] = \'<html></html>\';\npages[\'2.html\'] = \'<html></html>\';\n\nvar einzelndOpenPage = function(subPage) {\nconsole.log("Opening page %s", subPage);\ndocument.getElementById("einzelndDiv").innerHTML = pages[subPage];\n};\n</script>\n</head>\n<body onload="einzelndOpenPage(\'small.html\');">\n<div id="einzelndDiv"></div>\n</body>\n</html>\r\n';

        return site.generateScript(filename, pages)
            .then(function (html) {

                return expect(html).to.equal(expectedHTML);

            });
    });

    /*
     it('getPage should set the filename to index.html if it is not explicit', function() {

     return get.getPage('http://localhost:3000', false)
     .then(function (file) {

     return expect(file.filename).to.equal('index.html');

     });
     });

     it('getPage should return an html page', function() {

     var expectedHTML = '<!DOCTYPE html>' +
     '\n<html>' +
     '\n<head lang="en">' +
     '\n    <meta charset="UTF-8">' +
     '\n    <title>' +
     '</title>' +
     '\n<style>\n</style>\n<script>\n</script>\n' +
     '</head>' +
     '\n<body>' +
     '\n\n</body>' +
     '\n</html>\n';

     return get.getPage('http://localhost:3000/small.html', false)
     .then(function(file) {

     return expect(file.html).to.equal(expectedHTML);


     });

     });
     */
});
