'use strict';

//var assert = require('assert');
//var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');

var blanket = require('blanket');

var helpers = require('../helpers/helpers.js');

describe('helpers', function() {

    it('getImageArray should return a correct image array', function() {

        var filepath = path.join(__dirname, '../testserver/public/index.html');
        var html = fs.readFileSync(filepath);

        var array = helpers.getImageArray(html);

        expect(array.length).toEqual(9);

    });

    it('buildDataUri should replace the image urls with dataUris', function() {

        var filepath = path.join(__dirname, '../testserver/public/index.html');
        var scope = {};
        scope.html = fs.readFileSync(filepath);

        var array = helpers.getImageArray(scope.html);

        var result = helpers.buildDataUri(array, scope);

        var $ = cheerio.load(result);
        expect($('img').length).toEqual(9);

        $('img').each(function() {
            var url = $(this).attr('src');
            expect(url).toContain('data:image/jpeg;base64,');
            //expect(url).not.toContain('undefined');
        });

    });

    it('getHTTP should return a proper response', function() {

        link = {};
        link.url = 'http://localhost:3000/img/image7.jpg';

        testLink = {};
        testLink.url = 'http://localhost:3000/img/image7.jpg';

        var filepath = path.join(__dirname, '../testserver/public/img/image7.jpg');
        var img = fs.readFileSync(filepath);
        testLink.data = new Buffer(img, 'binary').toString('base64');

        return helpers.getHTTP(link).then(function (data) {

            expect(link.url).toEqual(testLink.url);
            expect(link.data.length).toEqual(testLink.data.length);
            console.log("Ran Test.");
        });

    });

});
