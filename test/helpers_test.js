'use strict';

var expect = require('expect.js');
var path = require('path');
var fs = require('fs');

var helpers = require('../modules/helpers.js');

describe('helpers', function() {

    it('getMatches should return a correct array of matching strings', function() {

        var re = /(match)/g;
        var text = 'This is a test text, with a match and another match, and here, another match';
        var matches = helpers.getMatches(text,re);

        expect(matches.length).to.equal(3);

    });

    it('getHTTP should return a proper response', function() {

        var link = 'http://localhost:3000/img/image7.jpg';

        var filepath = path.join(__dirname, '../testserver/public/img/image7.jpg');
        var img = fs.readFileSync(filepath);

        return helpers.getHTTP(link).then(function (response) {

            expect(response.response.statusCode).to.equal(200);
            expect(response.body.length).to.equal(img.length);

        });

    });

    it('getHTTP report the broken link', function() {

        var link = 'http://localhost:3000/img/image756.jpg';

        return helpers.getHTTP(link).then(function (response) {

            expect(response.response.statusCode).to.equal(404);

        });

    });

    it('getHTTP should throw an error', function() {

        var link = 'http://loasdsadcgsaddalhost:31232/';

        return helpers.getHTTP(link)
            .then(function() {

            })
            .catch(function(e) {
                expect(e.toString()).to.equal('Error: getaddrinfo ENOTFOUND');
            });

    });

    it('getFileName should return the right file name', function() {

        var filename = helpers.getFileName('http://localhost:3000/small.html');
        expect(filename).to.equal('small.html');

    });

    it('getFileName should set the filename to index.html if it is not explicit', function() {

        var filename = helpers.getFileName('http://localhost:3000');
        expect(filename).to.equal('index.html');

    });

    it('fixString should return a fixed/escaped script /script tag', function() {

        var fixedString = helpers.fixString('<script></script>');
        expect(fixedString).to.equal('<script><\'+\'/script>');

    });

    it('modifyLinks should return a modified a tag', function() {

        var modifiedString = helpers.modifyLinks('<a href="index.html"></a>');
        expect(modifiedString).to.equal('<a href="#" onclick="einzelndOpenPage(\\\'index.html\\\')"></a>');

    });

});
