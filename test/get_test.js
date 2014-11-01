'use strict';

var expect = require('expect.js');

var get = require('../modules/get.js');

describe('get', function() {

    it('getPage should return the right file name', function() {

        return get.getPage('http://localhost:3000/small.html')
            .then(function (file) {

                return expect(file.filename).to.equal('small.html');

            });
    });

    it('getPage should set the filename to index.html if it is not explicit', function() {

        return get.getPage('http://localhost:3000')
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

        return get.getPage('http://localhost:3000/small.html')
            .then(function(file) {

                return expect(file.html).to.equal(expectedHTML);


            });

    });

});
