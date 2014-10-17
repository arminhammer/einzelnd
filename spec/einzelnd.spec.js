'use strict';

var assert = require('assert');
var exec = require('child_process').exec;
var path = require('path');

describe('einzelnd bin', function(){

	var cmd = 'node '+path.join(__dirname, '../bin/einzelnd')+' ';
	console.log(cmd);

	it('--help should run without errors', function(done) {
		exec(cmd+'--help', function (error) {
			assert(!error);
			done();
		});
	});

	it('--version should run without errors', function(done) {
		exec(cmd+'--version', function (error) {
			assert(!error);
			done();
		});
	});

	it('should return error on missing command', function(done) {

		exec(cmd, function (error) {
			assert(error);
			assert.equal(error.code,1);
			done();
		});

	});

	it('should return error on unknown command', function(done) {

		exec(cmd+'junkcmd', function (error) {
			assert(error);
			assert.equal(error.code,1);
			done();
		});
	});

});
