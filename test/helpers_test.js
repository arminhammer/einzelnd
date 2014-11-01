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

});
