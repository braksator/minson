'use strict';

var fs = require('fs');
var chai = require('chai');
chai.use(require('chai-fs'));
var expect = chai.expect;
var assert = chai.assert;
var lint = require('mocha-eslint');

// Linting paths.
var paths = [
    'index.js',
    'test/test.js'
];

// Linting options.
var options = {
    // Specify style of output
    formatter: 'compact',  // Defaults to `stylish`

    // Only display warnings if a test is failing
    alwaysWarn: false,  // Defaults to `true`, always show warnings

    // Increase the timeout of the test if linting takes to long
    timeout: 5000,  // Defaults to the global mocha `timeout` option

    // Increase the time until a test is marked as slow
    slow: 1000,  // Defaults to the global mocha `slow` option

    // Consider linting warnings as errors and return failure
    strict: true  // Defaults to `false`, only notify the warnings
};

// Run the lint.
lint(paths, options);

var debugFuncs = (funcs) => {
  for (let func in funcs) {
    console.log(func + ":" + funcs[func].toString());
  }
};

// Tests
describe('Minson', function () {

  it('should handle boolean true', function () {
    var Minson = require('../index');
    var testBool = true;
    var config = "bool";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson.bits = '';
    console.log("exec:", Minson.bits);
    var out = Minson._encode(config, testBool);
    console.log("bits:", Minson.bits);
    //Minson.input =put(out);
    expect(Minson.bits).to.equal('1');

    var result = Minson._decode(config);
    expect(result).to.equal(true);
  });

  it('should handle boolean false', function () {
    var Minson = require('../index');
    var testBool = false;
    var config = "bool";
    Minson.bits = '';
    Minson.decodePos = 0;

    var out = Minson._encode(config, testBool);
    console.log("bits:", Minson.bits);
    expect(Minson.bits).to.equal('0');

    var result = Minson._decode(config);
    expect(result).to.equal(false);
  });
});


