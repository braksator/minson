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

    Minson._encode(config, testBool);
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

    Minson._encode(config, testBool);
    expect(Minson.bits).to.equal('0');

    var result = Minson._decode(config);
    expect(result).to.equal(false);
  });
  
  it('should handle boolean value1', function () {
    var Minson = require('../index');
    var testBool = 'yes';
    var config = 'bool("yes", "no")';
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, testBool);
    expect(Minson.bits).to.equal('1');

    var result = Minson._decode(config);
    expect(result).to.equal('yes');
  });

  it('should handle boolean value2', function () {
    var Minson = require('../index');
    var testBool = 'no';
    var config = "bool('yes', 'no')";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, testBool);
    expect(Minson.bits).to.equal('0');

    var result = Minson._decode(config);
    expect(result).to.equal('no');
  });

  it('should handle enum range int', function () {
    var Minson = require('../index');
    var test = 2;
    var config = "enum(5)";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    expect(Minson.bits).to.equal('010');

    var result = Minson._decode(config);
    expect(result).to.equal(2);
  });

  it('should handle enum value list', function () {
    var Minson = require('../index');
    var test = "baz";
    var config = "enum('foo', 'bar', 'baz')";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    expect(Minson.bits).to.equal('10');

    var result = Minson._decode(config);
    expect(result).to.equal("baz");
  });


  it('should handle int(8)', function () {
    var Minson = require('../index');
    var test = "100";
    var config = "int(8)";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.equal(100);
  });

  it('should handle int(8) negative', function () {
    var Minson = require('../index');
    var test = "-100";
    var config = "int(8)";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.equal(-100);
  });

  it('should handle uint(8)', function () {
    var Minson = require('../index');
    var test = "202";
    var config = "uint(8)";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.equal(202);
  });

  it('should handle int(16)', function () {
    var Minson = require('../index');
    var test = "1001";
    var config = "int(16)";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.equal(1001);
  });

  it('should handle uint(16)', function () {
    var Minson = require('../index');
    var test = "2301";
    var config = "uint(16)";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.equal(2301);
  });

  
  it('should handle int(32)', function () {
    var Minson = require('../index');
    var test = "21021";
    var config = "int(16)";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.equal(21021);
  });
  
  it('should handle int(32) negative', function () {
    var Minson = require('../index');
    var test = "-210213";
    var config = "int(32)";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.equal(-210213);
  });

  it('should handle uint(32)', function () {
    var Minson = require('../index');
    var test = "56656";
    var config = "uint(32)";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.equal(56656);
  });

  
  it('should handle float(32)', function () {
    var Minson = require('../index');
    var test = 123.456;
    var config = "float(32)";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.be.closeTo(123.456, 0.001);
  });

  it('should handle float(32) negative', function () {
    var Minson = require('../index');
    var test = -23.456;
    var config = "float(32)";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.be.closeTo(-23.456, 0.001);
  });
  
  
  it('should handle float(64)', function () {
    var Minson = require('../index');
    var test = 97531.0022;
    var config = "float(64)";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.be.closeTo(97531.0022, 0.001);
  });

  
  it('should handle bigint(64)', function () {
    var Minson = require('../index');
    var test = 9007199254740900n;
    var config = "bigint(64)";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result.toString()).to.equal(9007199254740900n.toString());
  });
  
  it('should handle bigint(64) negative', function () {
    var Minson = require('../index');
    var test = -46574936470n;
    var config = "bigint(64)";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result.toString()).to.equal(BigInt('-46574936470').toString());
  });
  
  it('should handle biguint(64)', function () {
    var Minson = require('../index');
    var test = 90199254740900n;
    var config = "bigint(64)";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result.toString()).to.equal(90199254740900n.toString());
  });

  it('should handle varchar(255)', function () {
    var Minson = require('../index');
    var test = "a test string";
    var config = "varchar(255)";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.equal("a test string");
  });

  it('should handle varchar', function () {
    var Minson = require('../index');
    var test = "Leverage agile frameworks to provide a robust synopsis for high level overviews. Iterative approaches to corporate strategy foster collaborative thinking to further the overall value proposition. Organically grow the holistic world view of disruptive innovation via workplace diversity and empowerment.  Bring to the table win-win survival strategies to ensure proactive domination. At the end of the day, going forward, a new normal that has evolved from generation X is on the runway heading towards a streamlined cloud solution. User generated content in real-time will have multiple touchpoints for offshoring.  Capitalize on low hanging fruit to identify a ballpark value added activity to beta test. Override the digital divide with additional clickthroughs from DevOps. Nanotechnology immersion along the information highway will close the loop on focusing solely on the bottom line.";
    var config = "varchar";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.equal(test);
  });
  
  it('should handle varchar(255){charset}', function () {
    var Minson = require('../index');
    var test = "ggaffbc";
    var config = "varchar(255){abcdefg}";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    console.log("bits:", Minson.bits);
    var result = Minson._decode(config);
    expect(result).to.equal("ggaffbc");
  });
});


