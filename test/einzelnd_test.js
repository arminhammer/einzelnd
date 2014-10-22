'use strict';

var expect = require('expect.js');
var exec = require('child_process').exec;
var path = require('path');

describe('einzelnd bin', function(){

	var cmd = 'node '+path.join(__dirname, '../einzelnd.js')+' ';
	console.log(cmd);

	it('--help should run without errors', function(done) {
		exec(cmd+'--help', function (error) {
			expect(!error);
			done();
		});
	});

	it('--version should run without errors', function(done) {
		exec(cmd+'--version', function (error) {
			expect(!error);
			done();
		});
	});

	it('should return error on missing command', function(done) {

		exec(cmd, function (error) {
			expect(error);
			expect(error.code).to.equal(1);
			done();
		});

	});

	it('should return error on unknown command', function(done) {

		exec(cmd+'junkcmd', function (error) {
			expect(error);
			expect(error.code).to.equal(1);
			done();
		});
	});

});
