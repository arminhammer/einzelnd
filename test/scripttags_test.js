'use strict';

var expect = require('expect.js');

var scripts = require('../modules/scripttags.js');

describe('scripttags', function() {

    it('inlineScripts should correctly inline a script file', function() {

        var html = '<html>' +
        '<head><title>' +
        '</title>' +
        '<script src="js/script1.js"></script>' +
        '</head>' +
        '<body>' +
        '</body>' +
        '</html>';

        var expectedHTML = '<html>' +
        '<head><title>' +
        '</title>' +
        '<script src="js/script1.js"></script>' +
        '<script>' +
        '\n\nconsole.log(\'Loaded script1!\');' +
        '\n</script>' +
        '\n</head>' +
        '<body>' +
        '</body>' +
        '</html>';

        return scripts.inlineScripts('http://localhost:3000', html)
        .then(function(resultHTML) {

                return expect(resultHTML).to.equal(expectedHTML);

            });

    });

});
