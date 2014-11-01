'use strict';

var expect = require('expect.js');

var media = require('../modules/media.js');

describe('media', function() {

    it('processMedia should correctly turn images into dataUris', function() {

        var html = '<html>' +
            '<head><title>' +
            '</title>' +
            '</head>' +
            '<body>' +
            '<img src=img/small.png>' +
            '</body>' +
            '</html>';

        var expectedHTML = '<html>' +
            '<head><title>' +
            '</title>' +
            '</head>' +
            '<body>' +
            '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAIAAAAC64paAAAACXBIWXMAAAsTAAALEwEAmpwYAAA' +
            'AB3RJTUUH3gsBFC0gK+fwAAAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAdSURBVDjLY7yjoMBALmBioACMah7VPKp5' +
            'VDPlmgGsUwFEbA9fjAAAAABJRU5ErkJggg==">' +
            '</body>' +
            '</html>';

        return media.processMedia('http://localhost:3000', html)
            .then(function(resultHTML) {

                return expect(resultHTML).to.equal(expectedHTML);

            });

    });

    it('processMedia should ignore img tags without src attributes', function() {

        var html = '<html>' +
            '<head><title>' +
            '</title>' +
            '</head>' +
            '<body>' +
            '<img>' +
            '</body>' +
            '</html>';

        var expectedHTML = '<html>' +
            '<head><title>' +
            '</title>' +
            '</head>' +
            '<body>' +
            '<img>' +
            '</body>' +
            '</html>';

        return media.processMedia('http://localhost:3000', html)
            .then(function(resultHTML) {

                return expect(resultHTML).to.equal(expectedHTML);

            });

    });

});
