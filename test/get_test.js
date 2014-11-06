'use strict';

var expect = require('expect.js');

var get = require('../modules/get.js');

describe('get', function() {

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

});
