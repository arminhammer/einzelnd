'use strict';

require('blanket');

var assert = require('assert');
var exec = require('child_process').exec;
var path = require('path');

var fs = require('fs');

var einGet = require('../cmds/get.js');

describe('einzelnd get', function() {


    /*
	it('should return a correct image array', function() {

        var filepath = path.join(__dirname, '../testserver/public/index.html');
        var html = fs.readFileSync(filepath);
        var array = einGet.getImageArray(html);
        //var t = 2

        expect(1+1).toEqual(2);

    });

	iit('--help should run without errors', function(done) {
		exec(cmd+'--help', function (error) {
			assert(!error);
			done();
		});
	});

	iit('--version should run without errors', function(done) {
		exec(cmd+'--version', function (error) {
			assert(!error);
			done();
		});
	});

	iit('should return error on missing command', function(done) {

		exec(cmd, function (error) {
			assert(error);
			assert.equal(error.code,1);
			done();
		});

	});

	iit('should return error on unknown command', function(done) {

		exec(cmd+'junkcmd', function (error) {
			assert(error);
			assert.equal(error.code,1);
			done();
		});
	});
    */

});
