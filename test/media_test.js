'use strict';

var expect = require('expect.js');
var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');

var helpers = require('../modules/media.js');

describe('media', function() {

    var filepath = path.join(__dirname, '../testserver/public/index.html');
    var scope;

    beforeEach(function() {

        scope = {};
        scope.html = fs.readFileSync(filepath);
        scope.elements = [];

    });

    afterEach(function() {

        scope = null;

    });

    /*
    it('getImageArray should return a correct image array', function() {

        helpers.getImageArray(scope);

        expect(scope.elements.length).to.equal(10);

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

    it('getHTTP1 should return a proper response', function() {

        var link = {};
        link.url = 'http://localhost:3000/img/image7.jpg';

        var testLink = {};
        testLink.url = 'http://localhost:3000/img/image7.jpg';

        var filepath = path.join(__dirname, '../testserver/public/img/image7.jpg');
        var img = fs.readFileSync(filepath);
        testLink.data = new Buffer(img, 'binary').toString('base64');

        return helpers.getHTTP1(link).then(function (data) {

            expect(link.url).to.equal(testLink.url);
            expect(link.data.length).to.equal(testLink.data.length);
        });

    });
    */

    /*
    it('getHTTP1 report the broken link', function() {

        var link = {};
        link.url = 'http://localhost:3000/img/image756.jpg';

        return modules.getHTTP1(link).then(function (data) {

            console.log(link.data);
            //expect(link.url).to.equal(testLink.url);
            //expect(link.data.length).to.equal(testLink.data.length);
        });

    });
    */


});