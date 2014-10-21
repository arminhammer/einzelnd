'use strict';

require('blanket');

var expect = require('expect.js');
var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');

var helpers = require('../helpers/helpers.js');

describe('helpers', function() {

    var filepath = path.join(__dirname, '../testserver/public/index.html');
    var scope;

    beforeEach(function() {

        scope = {};
        scope.html = fs.readFileSync(filepath);
        scope.images = [];

    });

    afterEach(function() {

        scope = null;

    });

    it('getImageArray should return a correct image array', function() {

        helpers.getImageArray(scope);

        expect(scope.images.length).to.equal(9);

    });

    it('buildDataUri should replace the image urls with dataUris', function() {

        var array = helpers.getImageArray(scope);

        var result = helpers.buildDataUri(scope);

        var $ = cheerio.load(result);
        expect($('img').length).to.equal(9);

        $('img').each(function() {

            var url = $(this).attr('src');
            expect(url).to.contain('data:image/jpeg;base64,');
            //expect(url).not.toContain('undefined');

        });

    });

    it('getHTTP should return a proper response', function() {

        var link = {};
        link.url = 'http://localhost:3000/img/image7.jpg';

        var testLink = {};
        testLink.url = 'http://localhost:3000/img/image7.jpg';

        var filepath = path.join(__dirname, '../testserver/public/img/image7.jpg');
        var img = fs.readFileSync(filepath);
        testLink.data = new Buffer(img, 'binary').toString('base64');

        return helpers.getHTTP(link).then(function (data) {

            expect(link.url).to.equal(testLink.url);
            expect(link.data.length).to.equal(testLink.data.length);
        });

    });

});
