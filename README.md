[![npm](https://img.shields.io/npm/dt/minson.svg)](#)

MINSON
===========

Data serializer with minimal output.

Serializes an object (or other variable) using a predefined template into a
non-human readable output string that uses a minimal amount of characters.

> WARNING: This package is relatively new - use with vigilant caution. 

Designed for storage of app configs in text files, therefore works particularly
well with multiple-choice values such as booleans and enums.  Also efficient
with integers that have a small maximum value, and length-limited strings.

Will happily handle large strings, floats, big ints, and nested structures.

> The catch is that to get the most out of Minson you have to create a 
> *template* that defines your data types. The template is like a key to unlock 
> your data.

## Output

Given a JavaScript object value Minson creates a string that looks something like this:

> HÿÿÿÓW@ux£×\n=q`╗ÅFRV6²═'&÷vâ═f÷═§V×2═÷fW"FR═Æ§═Förà¶FÆ¶£6FÆ¶£&Ài§¢É#jËu ╔·²&
> öæR#£Â'Gvò#£"Â'F&VR#£7Þø qìÑÍÐÄèàÌ°ÑÍÐÈèÌÐÌÌÉô

## MINSON vs JSON vs BSON

|                     	| Output length in chars 	| Output length in bytes 	|
|---------------------	|------------------------	|------------------------	|
| **Minified Object** 	| 308                    	| 308                    	|
| **JSON**            	| 351                    	| 351                    	|
| **BSON**            	| 361                   	| 361                    	|
| **MINSON**          	| 151                    	| 202                    	|

<small>The test data used here is the input object from the test "should encode
and decode" in this package.  With a well designed template and input
data the results for Minson will be even better.</small>

## Installation

This is a Node.JS module available from the Node Package Manager (NPM).

https://www.npmjs.com/package/minson

Here's the command to download and install from NPM:

`npm install minson -S`

or with Yarn:

`yarn add minson`

It is recommend to use a package locking system like Yarn in case a change is
introduced into this project that makes it incompatible with your encoded data.

## Usage

Include Minson in your project:

```javascript
var Minson = require('Minson');

```

Create a template that describes your data.  

For objects, the template is an object with the same keys as the data object, and
the values are configurations strings containing the Minson *type* names (and 
optionally some additional config in parenthesis, brackets, and braces):

```javascript
var myData = {
  key: '3f18ac06',
  title: 'My Data',
  description: 'This is an example object',
  timestamp: 1563797326,
  enabled: true,
  revision: 192,
  status: 'published',
  user: {
    id: 3006,
    name: 'Harry',
    interests: ['fish', 'stamps'],
  },
  access: true,
};

var template = {
  key: 'varchar(255)',
  title: 'varchar(255)["untitled"]',
  description: 'varchar',
  timestamp: 'uint(32)',
  enabled: 'bool',
  revision: 'uint(16)',
  status: 'enum("unpublished", "pending", "published")',
  user: {
    id: 'uint(16)',
    name: 'varchar(255)',
    interests: ['varchar(255)'],
  },
  access: 'bool',
};
```

If your data is an array, the template is also an array.

```javascript
var primeDigits = [2, 3, 5, 7];

var template = ['uint(8)'];
```

If only one configuration string is given inside the template array Minson
will store an array-length based on the length of the input data.

It is more efficient to have a fixed array length:

```javascript
var topThreeSwordsmen = ['Sasaki Kojiro', 'El Cid', 'Ito Ittosai Kagehisa'];

var template = ['varchar(255)', 'varchar(255)', 'varchar(255)'];
```

For other variable types the template is just a configuration string:

```javascript
var inputVar = 1587123;

var template = 'int(32)';
```

### Encoding

Supply the template and the data variables to the encode() function:

```javascript
var encodedString = Minson.encode(template, inputVar);
```

### Decoding

Supply the template and the encoded string to the decode() function:

```javascript
var decodedVariable = Minson.decode(template, encodedString);
```

The template must be identical to the one supplied during encoding, therefore
since it's possible your data structure will change, you should consider maintaining
revisions of these templates in your project in order to access older encoded
data.

## Data Structures

The following data structures are supported by Minson templates.

> [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
>
> [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
>
> [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
>
> [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)
>
> [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
>
> [WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet)
>

If this isn't sufficient, and your data is serializable with JSON,
you can use the *json* data type to include the data structure into a Minson
encoded string.

## Typed Arrays

Minson can handle variables of [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) types.

These are provided to Minson's templates not like Data Structures, but like 
Data Types, and will be exploded into their Array equivalent.

For example specifying a configuration string of `'Int8Array'` will convert it
to `['int(8)']` and specifying `Int8Array(3)[5]` will convert it to 
`['int(8)[5]', 'int(8)[5]', 'int(8)[5]']`.  The correct TypedArray type will be
restored during decoding.

Not that unlike data types, the capitalization of the TypedArray type name is
important.


## Data Types

In addition to data structures, the following is a list of supported data
types. Your goal should be to choose the smallest representation of your 
data. If you're storing data from a form that allows a selection from a 
predefined list of options; use an enum over a varchar, and choose integer 
types with a smaller param if your expected values always fit within the value
range.

| type(size/param)                   	| Description                                                                                                                 	| Value range                     	|
|-----------------------------------	|-----------------------------------------------------------------------------------------------------------------------------	|---------------------------------	|
| bool                              	| Boolean true or false                                                                                                       	| true & false                    	|
| bool(value1, value2)              	| 2-value list                                                                                                                	| value1 & value2                 	|
| enum(n)                           	| Multiple-choice integers                                                                                                    	| 0 to n-1                        	|
| enum(val1, val2, val3, ...)       	| Multiple-choice list                                                                                                        	| Any listed value                	|
| int(8)                            	| 1-byte signed integer                                                                                                       	| -128 to 127                     	|
| uint(8)                           	| 1-byte unsigned integer                                                                                                     	| 0 to 255                        	|
| int(16)                           	| 2-byte signed integer                                                                                                       	| -32,768 to 32,767               	|
| uint(16)                          	| 2-byte unsigned integer                                                                                                     	| 0 to 65,535                     	|
| int(32)                           	| 4-byte signed integer                                                                                                       	| 0 to 4,294,967,295              	|
| uint(32)                          	| 4-byte unsigned integer                                                                                                     	| -2,147,483,648 to 2,147,483,647 	|
| float(32)                         	| 4-byte floating point number                                                                                                	| 1.2x10^-38 to 3.4x10^38         	|
| float(64)                         	| 8-byte floating point number                                                                                                	| 5.0x10^-324 to 1.8x10^308       	|
| bigint(64)                        	| 8-byte BigInt() signed integer                                                                                              	| -2^63 to 2^63-1                 	|
| biguint(64)                       	| 8-byte BigInt() unsigned integer   	                                                                                          | 0 to 2^64-1                     	|
| varchar(255)                        | A string with 255 bytes or less                                                                                               | 0 to 255 bytes                    |
| varchar                             | Long string                                                                                                                   | unlimited                         |
| char                              	| Character                                                                                                                   	| 0 to 255 (by default)            	|
| wchar                             	| Wide character up to 4 bytes                                                                                                 	| 0 to 4,294,967,295                |
| json                                | Any value serializable with JSON                                                                                              | unlimited                         |

### bool

**Boolean**

`bool(param)[default]`
Param: Two values separated by comma (optional - defaults to *true, false*)

Perfect choice for storing binary options like on/off checkboxes or switches.
Will not store *null* or *undefined* - they will be coerced to *false*, if
you need that consider using `'enum(true, false, null, undefined)'` instead.

Examples:
```javascript
// Configure true or false values (same as default params)
'bool(true, false)'
```

```javascript
// Configure strings "on" or "off"
'bool("on", "off")'
```

Aliases: bool, boolean.

### enum

**Enumerated**

`enum(param)[default]`
Param: One or more values separated by commas, or a single integer (required)

Many configs or select/radio forms limit value choices to a predefined list,
and this is an ideal type for encoding those values.

Examples:
```javascript
// Configure enum to expect any of the values: 0, 1, 2, or 3
'enum(4)'
```
```javascript
// Configure enum to expect any of the values: "red", "blue", or "green"
'enum("red", "blue", "green")'
```

Aliases: enum.

### int

**Signed integer**

`int(size)[default]`
Size: 8, 16, or 32 (required) 

Signed integers allow encoding negative integers.  If you do not need to allow
for negative integers it may be preferable to use `uint(size)` (Unsigned 
integer) instead because it allows for larger values.

Example:
```javascript
// Configure integer with values from -32,768 to 32,767 
'int(16)'
```

Aliases: int, i, integer, signed, signed int, signed integer.

### uint

**Unsigned integer**

`uint(size)[default]`
Size: 8, 16, or 32 (required)

When choosing an integer size (i.e. the param) refer to the table above for the
data ranges and choose the smallest size you could possibly need.

Example:
```javascript
// Configure integer with values from 0 to 255
'uint(8)'
```

Aliases: uint, u, unsigned, unsigned int, unsigned integer.

### float

**Floating-point number**

`float(size)[default]`
Size: 32 or 64 (required)

For number values that have, or may need to have, a decimal point. Likely
conforms to IEEE Standard for Floating-Point Arithmetic (IEEE 754):
- 32: Single Precision; Sign Bits = 1, Exponent Bits = 8, Significand Bits = 23
- 64: Double Precision; Sign Bits = 1, Exponent Bits = 11, Significand Bits = 52

Example:
```javascript
// Configure a floating-point number
'float(32)'
```

Aliases: float, double, decimal.

### bigint

**Signed BigInt**

`bigint(size)[default]`
Size: 64 (required)

For JavaScript [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) numbers.

Example:
```javascript
// Configure a BigInt number
'bigint(64)'
```

Aliases: bigint.

### biguint

**Unsigned BigInt**

`bigint(size)[default]`
Size: 64 (required)

For JavaScript [BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) numbers.

Example:
```javascript
// Configure an unsigned BigInt number
'biguint(64)'
```

Aliases: biguint.

### varchar

**Variable-sized character string**

`varchar(size)[default]{charset}`
Size: 255 (optional)

Since many strings from input and generated functions are of a limited size, 
use the param 255 if the length is known to be 255 bytes or less.  Since
characters can be up to four bytes long, it should be reasonable to assume
a string of 63 unicode characters or less is safe to use with the 255 param.

If the param is not supplied, a string of any length can be used.

- This type supports an optional charset (See "Custom Charset")

Example:
```javascript
// Configure a varchar
'varchar'
```

Aliases: varchar, text, string.

### char

**Character**

`char[default]{charset}`

Used for strings of exactly one character, which by default is 8-bits (1 byte)
in length.

- This type supports an optional charset and it is possible to use it to encode
values of less than one byte (See "Custom Charset")

Example:
```javascript
// Configure a char
'char'
```

Aliases: char, byte.

### wchar

**Wide character**

`wchar[default]`
Param: (not applicable)

Used for strings of exactly one multibyte character, which may be up to
4-bytes in length. 

Example:
```javascript
// Configure a wide char
'wchar'
```

Aliases: wchar.

### json

**JSON**

`json[default]`
Param: (not applicable)

Serializes any value with [JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
and stores it as a varchar. This is less efficient than selecting another
type, and carries the same limitations as JSON.

This is useful for encoding/decoding an object with unknown keys.

Example:
```javascript
// Configure a json serializable variable
'json'
```

Aliases: json.

### Variables of unknown or mixed type

This isn't an ideal usage of Minson, but you can supply an empty configuration
string:

```javascript
// An object containing a property of unknown type:
var template = {
  property: '',
}

// An array with mixed values:
var template = [''];

// A scalar variable of unknown type:
var template = '';
```
Minson will handle the value reasonably well if it is a scalar or array value,
and objects will be handled using the *json* type (as Minson won't be templated
to handle that object's keys).

## Default Values

If your templated value is missing from your input data (i.e. it is undefined),
you can supply a default value in the template by appending square brackets.


```javascript
// Set the integer to 1 if it is missing.
int(32)[1]
```

The default value is stored during encoding, and changing the templated default
value will have no effect during decoding.

## Custom Charset

The *varchar* and *char* types support an optional custom charset.

Many string values contain a limited set of characters, for example a machine
key might only contain characters A-Za-z0-9 (i.e alphabet letters both upper
case and lower case as well as numeric digits), a string based on a
hexadecimal hash only contains the characters 0-9A-F, and some character sets
like the US-ASCII and GSM-7 (for SMS text) are limited to 128 characters.  
Minson can use this to encode a smaller amount of data for varchar and char
types.

```javascript
// Only use characters A-Za-z0-9
// That's 62 chars, Minson will encode 25% less data.
'varchar{ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789}'
```

```javascript
// Only use characters 0-9A-F
// That's 16 chars, Minson will encode 50% less data.
'varchar{0123456789ABCDEF}'
```

```javascript
// Only allow DNA nucleotides ACGT
// That's 4 chars, Minson will encode 75% less data.
'char{ACGT}'
```

Custom charsets are supplied as a list of characters between braces in the
templated configuration string.  The order of the list is important and
should be consistent between encode() and decode().

## Encoding Format

By default Minson escapes newline characters from its output, this can increase
the length of the output slightly.

The entry functions for Minson allow an optional third parameter to set the
output format: `Minson.encode(config, input, format)` and 
`Minson.decode(config, input, format)`.

Valid *format* values are the following strings:
- 'noescape' to allow shorter multiline output e.g. `Minson.encode(config, input, 'noescape')`
- 'base64' for longer output without gibberish e.g. `Minson.encode(config, input, 'base64')`
- 'bits' for an array of bit strings e.g. `Minson.encode(config, input, 'bits')`

Just remember to set this the same way for encode() and decode().

## Generating Configuration Strings

An alternative to typing `'type(param)[default]{charset}'` strings is to
generate these strings using `Minson.config()`.

```javascript
var cfgStr = Minson.config(Minson.type.TYPE, param, default, charset);
```

This will perform some basic error checking and sanitization, and may be 
preferable to use this in order to catch configuration issues early.

Allowed values for TYPE are: 
BOOL, ENUM, INT, UINT, FLOAT, BIGINT, BIGUINT, CHAR, WCHAR, VARCHAR, JSON

```javascript
var cfgStr = Minson.config(Minson.type.ENUM, ['one', 'two', 'three'], 'three');
```

Notice how it's possible to supply an actual array to the *param* value.  This
also applies to the *default* value.

You can also supply an equivalent object like so:

```javascript
var cfgStr = Minson.config({
  type: Minson.type.ENUM, 
  param: ['one', 'two', 'three'], 
  default: 'three',
});
```

The *param* key can also be called *size* when that feels appropriate:

```javascript
var cfgStr = Minson.config({
  type: Minson.type.INT, 
  size: 32,
});
```

You can also use `Minson.charset.CHARSET` to supply a predefined charset.  
Available values for CHARSET are:
ALPHANUMERIC, NUMERIC, HEXADECIMAL, ALPHA, ALPHAUPPER, ALPHALOWER

You can concatenate multiple charsets or perform other string operations
on them.

## Function Aliases

If you prefer the terminology, Minson.encode() is aliased with 
Minson.stringify() and Minson.serialize().  Similarly Minson.decode() is
aliased with Minson.parse() and Minson.unserialize().

## Unexpected Values

If an object or map contains keys that are not configured in the template, they will
be ignored, not included in the encoded output, and not present in the decoded
variable.  If you anticipate unexpected keys you should instead use the *json* data
type.

*It may be possible to handle this functionality in the future.*

## Invalid Values

There is currently no detection of invalid values, you will 
experience undefined behaviour if your values don't match your template
configuration - including malforming your data.

*It may be possible to handle this functionality in the future.*

## Tests

Tests are available in the github repo and can be executed with `npm test`.

To check coverage you have to install istanbul globally:
`npm install istanbul -g`

and then execute: `npm run coverage`

A coverage summary will be displayed and a full coverage report will appear in
the /coverage directory.

## Contributing

https://github.com/braksator/minson

In lieu of a formal style guide, take care to maintain the existing coding
style. Add tests for coverage and explicitly test bugs and features.
