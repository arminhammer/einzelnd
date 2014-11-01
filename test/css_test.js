'use strict';

var expect = require('expect.js');

var css = require('../modules/css.js');

describe('css', function() {

    it('inlineAllCSS should correctly inline a style file', function() {

        var html = '<html>' +
            '<head><title>' +
            '</title>' +
            '<link rel="stylesheet" type="text/css" href="css/style1.css">' +
            '</head>' +
            '<body>' +
            '</body>' +
            '</html>';

        var expectedHTML = '<html>' +
            '<head><title>' +
            '</title>' +
            '<link rel="stylesheet" type="text/css" href="css/style1.css">' +
            '<style>' +
            '\n@import url(\'embed3.css\');\n' +
            '\nh2 {' +
            '\n    color: purple;' +
            '\n    font-size: 15px;' +
            '\n}' +
            '\nh1 {\n    font-style: oblique;\n}' +
            '\n</style>' +
            '\n</head>' +
            '<body>' +
            '</body>' +
            '</html>';

        return css.inlineAllCSS('http://localhost:3000', html)
            .then(function(resultHTML) {

                return expect(resultHTML).to.equal(expectedHTML);

            });

    });

});
