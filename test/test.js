'use strict';

var fs = require('fs');
var chai = require('chai');
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

  it('should handle unknown boolean true', function () {
    var Minson = require('../index');
    var testBool = true;
    var config = "";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, testBool);
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

  it('should handle unknown int', function () {
    var Minson = require('../index');
    var test = "1001";
    var config = "";
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

  it('should handle unknown float(32)', function () {
    var Minson = require('../index');
    var test = 123.456;
    var config = "";
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
  
  it('should handle unknown bigint(64) negative', function () {
    var Minson = require('../index');
    var test = -46574936470n;
    var config = "";
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

  it('should handle unknown biguint(64)', function () {
    var Minson = require('../index');
    var test = 90199254740900n;
    var config = "";
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

  it('should handle unknown varchar', function () {
    var Minson = require('../index');
    var test = "a test string";
    var config = "";
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
    var result = Minson._decode(config);
    expect(result).to.equal("ggaffbc");
  });

  it('should handle varchar(255){charset}', function () {
    var Minson = require('../index');
    var test = "ggaffbc";
    var config = "varchar(255){abcdefg}";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.equal("ggaffbc");
  });

  it('should handle char', function () {
    var Minson = require('../index');
    var test = "d";
    var config = "char";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.equal("d");
  });
  
  it('should handle unknown char', function () {
    var Minson = require('../index');
    var test = "d";
    var config = "";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.equal("d");
  });

  it('should handle char{charset}', function () {
    var Minson = require('../index');
    var test = "y";
    var config = "char{xyz}";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.equal("y");
  });
  
  it('should handle 4-byte wchar', function () {
    var Minson = require('../index');
    var test = "🤣";
    var config = "wchar";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.equal("🤣");
  });

  it('should handle 2-byte wchar', function () {
    var Minson = require('../index');
    var test = "æ";
    var config = "wchar";
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.equal("æ");
  });

  it('should handle a fixed length array', function () {
    var Minson = require('../index');
    var test = [52, 42, 32, 22];
    var config = ['int(8)', 'int(8)', 'int(8)', 'int(8)'];
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.eql([52, 42, 32, 22]);
  });

  it('should handle a variable length array', function () {
    var Minson = require('../index');
    var test = ['wiggle', 'it', 'just', 'a', 'little', 'bit'];
    var config = ['varchar'];
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.eql(['wiggle', 'it', 'just', 'a', 'little', 'bit']);
  });
  
  it('should handle unknown variable length array', function () {
    var Minson = require('../index');
    var test = ['wiggle', 'it', 'just', 'a', 'little', 'bit'];
    var config = [''];
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.eql(['wiggle', 'it', 'just', 'a', 'little', 'bit']);
  });

  it('should handle an object', function () {
    var Minson = require('../index');
    var test = { key1: 'key1', key2: 'second key'};
    var config = { key1: 'varchar', key2: 'varchar(255)'};
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.eql({ key1: 'key1', key2: 'second key'});
  });

  it('should handle json', function () {
    var Minson = require('../index');
    var test = { key1: 'key1', key2: 'second key'};
    var config = 'json';
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.eql({ key1: 'key1', key2: 'second key'});
  });

  it('should handle unknown object', function () {
    var Minson = require('../index');
    var test = { key1: 'key1', key2: 'second key'};
    var config = '';
    Minson.bits = '';
    Minson.decodePos = 0;

    Minson._encode(config, test);
    var result = Minson._decode(config);
    expect(result).to.eql({ key1: 'key1', key2: 'second key'});
  });

  it('should generate config strings', function () {
    var Minson = require('../index');
    var test = {
      myObject: {myKey: Minson.config(Minson.type.INT, 8)},
      myInt: Minson.config(Minson.type.INT, 32),
      myUint: Minson.config(Minson.type.UINT, 16),
      myBigint: Minson.config(Minson.type.BIGINT, 64),
      myBiguint: Minson.config(Minson.type.BIGUINT, 64),
      myFloat: Minson.config(Minson.type.FLOAT, 64),
      myEnum: Minson.config(Minson.type.ENUM, ['uno', 'dos', 'tres']),
      myBool: Minson.config(Minson.type.BOOL),
      myBoolTrue: Minson.config(Minson.type.BOOL, null, true),
      myVarchar: Minson.config(Minson.type.VARCHAR),
      myVarchar255: Minson.config(Minson.type.VARCHAR, 255),
      myVarchar255Charset: Minson.config(Minson.type.VARCHAR, 255, null, Minson.charset.ALPHANUMERIC),
      myVarchar255CharsetObj: Minson.config({
        type: Minson.type.VARCHAR,
        param: 255,
        default: 'abc123',
        charset: Minson.charset.ALPHANUMERIC,
      }),
      myJson: Minson.config(Minson.type.JSON),
      myUnknown: Minson.config(''),
      myArr: [Minson.config(Minson.type.INT, 8)],
    };
    
    expect(test).to.eql({
      myObject: {myKey: 'int(8)'},
      myInt: 'int(32)',
      myUint: 'uint(16)',
      myBigint: 'bigint(64)',
      myBiguint: 'biguint(64)',
      myFloat: 'float(64)',
      myEnum: 'enum("uno", "dos", "tres")',
      myBool: 'bool',
      myBoolTrue: 'bool[true]',
      myVarchar: 'varchar',
      myVarchar255: 'varchar(255)',
      myVarchar255Charset: 'varchar(255){ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789}',
      myVarchar255CharsetObj: 'varchar(255)["abc123"]{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789}',
      myJson: 'json',
      myUnknown: '',
      myArr: ['int(8)'],
    });
  });

  it('should encode and decode', function () {
    var Minson = require('../index');
    var template = {
      myObject: {myKey: 'int(8)'},
      myInt: 'int(32)',
      myUint: 'uint(16)',
      myFloat: 'float(64)',
      myEnum: 'enum("uno", "dos", "tres")',
      myBool: 'bool',
      myBoolTrue: 'bool[true]',
      myVarchar: 'varchar',
      myVarchar255: 'varchar(255)',
      myVarchar255Charset: 'varchar(255){ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789}',
      myVarchar255CharsetObj: 'varchar(255)["abc123"]{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789}',
      myJson: 'json',
      myUnknown: '',
    };

    var input = {
      myObject: {myKey: 72},
      myInt: -45,
      myUint: 87,
      myFloat: 343.54,
      myEnum: "dos",
      myBool: true,
      myBoolTrue: false,
      myVarchar: "The quick brown fox jumps over the lazy dog.",
      myVarchar255: 'dlkj3dlkj2l',
      myVarchar255Charset: 'mnop99',
      myVarchar255CharsetObj: 'lskjassada',
      myJson: {one: 1, two: 2, three: 3},
      myUnknown: [{test1: 'x3', test2: 34332}],
    };

    var out = Minson.encode(template, input);
    var result = Minson.decode(template, out);

    expect(result).to.eql(input);
  });

  it('should encode and decode object with bigints', function () {
    var Minson = require('../index');
    var template = {
      myBigint: 'bigint(64)',
      myBiguint: 'biguint(64)',
    };

    var input = {
      myBigint: -54294967295n,
      myBiguint: 9223372036854775900n,
    };

    var out = Minson.encode(template, input);
    var result = Minson.decode(template, out);

    expect(result.myBigint.toString()).to.equal(input.myBigint.toString());
    expect(result.myBiguint.toString()).to.equal(input.myBiguint.toString());
  });
  
  it('should encode and decode object with array', function () {
    var Minson = require('../index');
    var template = {
      myArr: ['int(8)'],
    };

    var input = {
      myArr: [8, 2, 4, 5],
    };

    var out = Minson.encode(template, input);
    var result = Minson.decode(template, out);

    expect(result).to.eql(input);
  });

  it('should have consistent output from aliased functions', function () {
    var Minson = require('../index');
    var test = "a test string";
    var config = "";

    var enc1 = Minson.encode(config, test);
    var enc2 = Minson.serialize(config, test);
    var enc3 = Minson.stringify(config, test);
    
    var dec1 = Minson.decode(config, enc1);
    var dec2 = Minson.unserialize(config, enc2);
    var dec3 = Minson.parse(config, enc3);

    expect(enc1 == enc2 && enc1 == enc3 && dec1 == dec2 && dec1 == dec3).to.equal(true);
  });

});


