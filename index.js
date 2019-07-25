#!/usr/bin/env node
'use strict';

/**
 * @file
 * Minson encoder/decoder.
 */

const base64encode = str => Buffer.from(str, 'binary').toString('base64');
const base64decode = str => Buffer.from(str, 'base64').toString('binary');

var Minson = module.exports =  {
    format: null,
    decodePos: 0,
    bits: '',
    aliases: {
        'bool': 'bool',
        'boolean': 'bool',

        'enum': 'enum',

        'int': 'Int',
        'i': 'Int',
        'integer': 'Int',
        'signed': 'Int',
        'signed int': 'Int',
        'signed integer': 'Int',

        'uint': 'Uint',
        'u': 'Uint',
        'unsigned': 'Uint',
        'unsigned int': 'Uint',
        'unsigned integer': 'Uint',

        'float': 'Float',
        'double': 'Float',
        'decimal': 'Float',

        'bigint': 'BigInt',

        'biguint': 'BigUint',

        'char': 'char',
        'byte': 'char',

        'wchar': 'wchar',
        
        'varchar': 'varchar',
        'text': 'varchar',
        'string': 'varchar',

        'json': 'json',
    },
    
    typedArrays: {
        Int8Array: 'int(8)',
        Uint8Array: 'uint(8)',
        Uint8ClampedArray: 'uint(8)',
        Int16Array: 'int(16)',
        Uint16Array: 'uint(16)',
        Int32Array: 'int(32)',
        Uint32Array: 'uint(32)',
        Float32Array: 'float(32)',
        Float64Array: 'float(64)',
        BigInt64Array: 'bigint(64)',
        BigUint64Array: 'biguint(64)',
    },

    typeFromAlias: (alias) => {
        if (!(alias in Minson.aliases)) {
            throw "Minson cannot handle type " + alias;
        }
        return Minson.aliases[alias];
    },

    parseConfig: (unparsedConfig, key) => {
        var config = {};

        // Before any parens or brackets.
        var type = unparsedConfig.match(/[^()\[\]\{\}]+/g);
        config.type = type[0];

        if (config.type in Minson.typedArrays) {
            config.handler = 'typedArray';
        }

        // Get contents of optional parens.
        var param = unparsedConfig.match(/\(([^)]+)\)/);
        if (param && param[1]) {
            config.param = param[1].trim();
        }
        // Get contents of optional brackets.
        var def = unparsedConfig.match(/\[([^)]+)\]/);
        if (def && def[1]) {
            config.default = def[1].trim();
        }
        // Get contents of optional braces.
        var charset = unparsedConfig.match(/\{([^)]+)\}/);
        if (charset && charset[1]) {
            config.charset = charset[1];
        }

        if (config.handler != 'typedArray') {
            config.handler = config.type = Minson.typeFromAlias(config.type.toLowerCase().replace(/[0-9]/g, ''));

            if (['Int', 'Uint', 'Float', 'BigInt', 'BigUint'].indexOf(config.type) > -1) {
                config.handler = 'number';
            }
        }

        return config;
    },

    _unstring: (val) => {
        if (val == 'undefined') return undefined;
        if (val == 'null') return null;
        if (val == 'false') return false;
        if (val == 'true') return false;
        if (val == parseInt(val)) return parseInt(val);
        if (val == parseFloat(val)) return parseFloat(val);
        return val;
    },

    escape(text) {    
        return text
            .replace(/\\/g, '\\\\')
            .replace(/\n/g, '\\n');
    },
    
    unescape(text) {
        var replacements = {'\\\\': '\\', '\\n': '\n'};
        return text.replace(/\\(\\|n|")/g, function(replace) {
            return replacements[replace];
        });
    },

    _paramToList: (param) => {
        return param.split(/,(?=(?:(?:[^'"]*(?:'|")){2})*[^'"]*$)/).map(function (p) {
            return p.trim().replace(/^["'](.*)["']$/, '$1');
        });
    },

    unknownTypes: ['bool', 'Int', 'Uint', 'Float', 'BigInt', 'char', 'varchar', null],
    unknownTypesExtended: ['BigUint', 'array', 'json', null],
    unknownParams: [8, 16, 32, 64],

    _encodeUnknownType: (type) => {
        if (Minson.unknownTypes.indexOf(type) > -1) {
            Minson.bits += Minson.unknownTypes.indexOf(type).toString(2).padStart(Math.ceil(Math.log2(Minson.unknownTypes.length)), '0');
        }
        else if (Minson.unknownTypesExtended.indexOf(type) > -1) {
            Minson.bits += Minson.unknownTypes.indexOf(null).toString(2).padStart(Math.ceil(Math.log2(Minson.unknownTypes.length)), '0');
            Minson.bits += Minson.unknownTypesExtended.indexOf(type).toString(2).padStart(Math.ceil(Math.log2(Minson.unknownTypesExtended.length)), '0');
        }
    },

    _decodeUnknownType: () => {
        var len = Math.ceil(Math.log2(Minson.unknownTypes.length));
        var type = Minson.unknownTypes[parseInt(Minson.bits.substring(Minson.decodePos, Minson.decodePos + len), 2)];
        Minson.decodePos += len;
        if (type === null) {
            len = Math.ceil(Math.log2(Minson.unknownTypesExtended.length));
            type = Minson.unknownTypesExtended[parseInt(Minson.bits.substring(Minson.decodePos, Minson.decodePos + len), 2)];
            Minson.decodePos += len;
        }
        return type;
    },

    _encodeUnknown: (input) => {
        var type;
        var param;
        if (input === true || input === false) {
            type = 'bool';
            Minson._encodeUnknownType(type);
        }
        else if (typeof input == 'bigint') {
            type = input <= Math.pow(2, 63) - 1 ? 'BigInt' : 'BigUint';
            param = '64';
            Minson._encodeUnknownType(type);
            // For future flagging purposes if BigInt() spec changes.
            Minson.bits += '0';
        }
        else if (parseInt(input) == input) {
            if (input < 0) {
                type = 'Int';
                param = Math.pow(2, Math.ceil(Math.log(Math.log2(Math.abs(input) * 2)) / Math.log(2)));
            }
            else {
                type = 'Uint';
                param = Math.pow(2, Math.ceil(Math.log(Math.log2(input + 1)) / Math.log(2)));
            }
            Minson._encodeUnknownType(type);
            Minson.bits += Minson.unknownParams.indexOf(param).toString(2).padStart(Math.ceil(Math.log2(Minson.unknownParams.length)), '0');
        }
        else if (parseFloat(input) == input) {
            type = 'Float';
            param = (1.2e-38 <= input && input <= 3.4e38) ? 32 : 64;
            Minson._encodeUnknownType(type);
            Minson.bits += param == 32 ? '0' : '1';
        }
        else if (typeof input == 'string') {
            if (input.length === 1) {
                type = 'char';
                Minson._encodeUnknownType(type);
            }
            else {
                if (input.length <= 255) {
                    type = 'varchar';
                    param = '255';
                }
                else {
                    type = 'varchar';
                }
                Minson._encodeUnknownType(type);
                if (param) {
                    Minson.bits += param == '255' ? '1' : '0';
                }
            }
        }
        else if (Array.isArray(input)) {
            type = [''];
            Minson._encodeUnknownType('array');
        }
        else {
            type = 'json';
            Minson._encodeUnknownType(type);
        }
        return param ? type + '(' + param + ')' : type;
    },

    _decodeUnknown: () => {
        var param;
        var type = Minson._decodeUnknownType();

        switch (type) {
            case 'BigInt':
            case 'BigUint':
                Minson.decodePos++;
                param = '64';
            break;
            case 'Int':
            case 'Uint':
                var len = Math.ceil(Math.log2(Minson.unknownParams.length));
                param = Minson.unknownParams[parseInt(Minson.bits.substring(Minson.decodePos, Minson.decodePos + len), 2)];
                Minson.decodePos += len;
            break;
            case 'Float':
                param = Minson.bits.charAt(Minson.decodePos++) === '0' ? '32' : '64';
            break;
            case 'varchar':
                if (Minson.bits.charAt(Minson.decodePos++) === '1') {
                    param = '255';
                }
            break;
            case 'array':
                type = [''];
            break;
        }
        
        return param ? type + '(' + param + ')' : type;
    },

    _encode: (config, input) => {
        if (typeof config === 'string') {
            if (config === '') {
                config = Minson._encodeUnknown(input);
                if (config) {
                    return Minson._encode(config, input);
                }
            }
            config = Minson.parseConfig(config);
            if (typeof Minson[config.handler + 'Encode'] === "function") {
                if (input === undefined && 'default' in config) {
                    input = config.default;
                }
                Minson[config.handler + 'Encode'](config, input);
            }
            else {
                throw "Minson cannot encode configured variable of type " + config.type;
            }
        }
        else if (config instanceof Map) {
            Minson.mapEncode(config, input);
        }
        else if (config instanceof Set) {
            Minson.setEncode(config, input);
        }
        else if (Array.isArray(config)) {
            Minson.arrayEncode(config, input);
        }
        else {
            Minson.objectEncode(config, input);
        }
    },

    _decode: (config) => {
        var out;
        if (typeof config === 'string') {
            if (config === '') {
                config = Minson._decodeUnknown();
                if (config) {
                    return Minson._decode(config);
                }
            }
            config = Minson.parseConfig(config);
            if (typeof Minson[config.handler + 'Decode'] === "function") { 
                out = Minson[config.handler + 'Decode'](config);
            }
            else {
                throw "Minson cannot encode configured variable of type " + config.type;
            }
        }
        else if (config instanceof Map || config instanceof WeakMap) {
            out = Minson.mapDecode(config);
        }
        else if (config instanceof Set || config instanceof WeakSet) {
            out = Minson.setDecode(config);
        }
        else if (Array.isArray(config)) {
            out = Minson.arrayDecode(config);
        }
        else {
            out = Minson.objectDecode(config);
        }
        return out;
    },

    encode: (config, input, format) => {
        Minson.format = format ? format : null;
        Minson.bits = '';
        Minson._encode(config, input);
        var text = '';
        var chunks = Minson.bits.padEnd(Minson.bits.length + 8 - (Minson.bits.length % 8), '0').match(/.{1,8}/g);
        Minson.bits = '';
        if (Minson.format == 'bits') {
            return chunks;
        }
        for (var i = 0; i < chunks.length; ++i) {
            text += String.fromCharCode(parseInt(chunks[i], 2));
        }
        if (Minson.format == 'noescape') {
            return text;
        }
        if (Minson.format == 'base64') {
            return base64encode(text);
        }
        return Minson.escape(text);
    },

    decode: (config, input, format) => {
        Minson.format = format ? format : null;
        if (input) {
            if (Minson.format == 'bits') {
                Minson.bits = input.join('');
            }
            else {
                if (Minson.format == 'base64') {
                    input = base64decode(input);
                }
                else if (!Minson.format) {
                    input = Minson.unescape(input);
                }
                Minson.bits = '';
                for (var i = 0; i < input.length; ++i) {
                    Minson.bits += input.charCodeAt(i).toString(2).padStart(8, '0');
                }
            }
            Minson.decodePos = 0;
        }
        var out = Minson._decode(config);
        Minson.bits = '';
        return out;
    },

    // Function aliases
    serialize: (config, input, format) => Minson.encode(config, input, format),
    stringify: (config, input, format) => Minson.encode(config, input, format),
    unserialize: (config, input, format) => Minson.decode(config, input, format),
    parse: (config, input, format) => Minson.decode(config, input, format),

    boolEncode: (config, input) => {
        var boolVals = config.param ? Minson._paramToList(config.param) : [true, false];
        Minson.bits += (input == boolVals[0]) ? '1' : '0';
    },

    boolDecode: (config) => {
        var boolVals = config.param ? Minson._paramToList(config.param) : [true, false];
        return Minson.bits[Minson.decodePos++] == 1 ? boolVals[0] : boolVals[1];
    },
    
    enumEncode: (config, input) => {
        if (!config.param) {
            throw "Minson expected a parameter for enum: " + types.enum[i].key;
        }
        if (typeof config.param === 'string') {
            config.param = Minson._paramToList(config.param);
        }
        var enumCount;
        var enumVal;
        if (config.param.length === 1 && !isNaN(parseInt(config.param[0])) && !isNaN(config.param[0] - 0)) {
            enumCount = parseInt(config.param[0]);
            enumVal = parseInt(input);
        }
        else {
            enumCount = config.param.length;
            enumVal = config.param.indexOf(input);
        }
        if (enumVal < 0 || enumVal >= enumCount) {
            throw "Minson got invalid value (" + enumVal + ") for enum: " + types.enum[i].key;
        }
        var numBits = Math.floor(Math.log2(enumCount - 1) + 1);
        Minson.bits += enumVal.toString(2).padStart(numBits, '0');
    },

    enumDecode: (config) => {
        if (!config.param) {
            throw "Minson expected a parameter for enum: " + types.enum[i].key;
        }
        if (typeof config.param === 'string') {
            config.param = Minson._paramToList(config.param);
        }
        var enumCount;
        var enumVal;
        var intOnly = false;
        if (config.param.length === 1 && !isNaN(parseInt(config.param[0])) && !isNaN(config.param[0] - 0)) {
            enumCount = parseInt(config.param[0]);
            intOnly = true;
        }
        else {
            enumCount = config.param.length;
        }
        var numBits = Math.floor(Math.log2(enumCount - 1) + 1);
        var chunk = Minson.bits.substring(Minson.decodePos, Minson.decodePos + numBits);
        Minson.decodePos += numBits;
        var enumVal = parseInt(chunk, 2);
        return intOnly ? enumVal : Minson._unstring(config.param[enumVal]);
    },

    numberEncode: (config, input) => {
        var bits = '';
        
        var numBytes = config.param / 8;
        var buffer = new ArrayBuffer(numBytes);
        var dataView = new DataView(buffer);

        var dataViewFunc = 'set' + config.type + config.param;
        try {
            dataView[dataViewFunc](0, input, false);
        } catch (e) {
            throw "Minson got an invalid configuration: " + config.type + " " + config.param + " with value " + input;
        }

        for (var offset = 0; offset < numBytes; ++offset) {
            bits += dataView.getUint8(offset, false).toString(2).padStart(8, '0');
        }

        Minson.bits += bits.padStart(config.param, '0');
    },
    
    numberDecode: (config) => {
        var out;

        var numBytes = config.param / 8;
        var buffer = new ArrayBuffer(numBytes);
        var dataView = new DataView(buffer);
        var chunks = Minson.bits.substring(Minson.decodePos, Minson.decodePos + (numBytes * 8)).match(/.{1,8}/g);
        Minson.decodePos += (numBytes * 8);
        for (var offset = 0; offset < numBytes; ++offset) {
            dataView.setUint8(offset, parseInt(chunks[offset], 2), false);
        }

        var dataViewFunc = 'get' + config.type + config.param;
        try {
            out = dataView[dataViewFunc](0, false);
        } catch (e) {
            throw "Minson got an invalid configuration: " + config.type + " " + config.param;
        }

        if (config.type == 'bigint' || config.type == 'biguint') {
            out = BigInt(out + 'n');
        }
        else {
            out = Minson._unstring(out);
        }

        return out;
    },

    charsetCharEncode: (charset, char) => {
        var numBits = Math.ceil(Math.log2(charset.length));
        var value = charset.indexOf(char);
        if (value === -1) {
            throw "Minson encountered char " + char + " not in charset {" + charset + '}';
        }
        Minson.bits += value.toString(2).padStart(numBits, '0');
    },

    charsetCharDecode: (charset) => {
        var numBits = Math.ceil(Math.log2(charset.length));
        var chunk = Minson.bits.substring(Minson.decodePos, Minson.decodePos + numBits);
        Minson.decodePos += numBits;
        return charset.charAt(parseInt(chunk, 2));
    },
        
    charEncode: (config, input) => {
        if (config.charset) {
            return Minson.charsetCharEncode(config.charset, input);
        }
        Minson.bits += input.charCodeAt(0).toString(2).padStart(8, '0');
    },

    charDecode: (config) => {
        if (config.charset) {
            return Minson.charsetCharDecode(config.charset);
        }
        var chunk = Minson.bits.substring(Minson.decodePos, Minson.decodePos + 8);
        Minson.decodePos += 8;
        return String.fromCharCode(parseInt(chunk, 2));
    },

    wcharEncode: (config, input) => {
        var code0 = input.charCodeAt(0);
        var code1 = input.charCodeAt(1);
        var bytes4 = !isNaN(code1);        
        Minson.bits += bytes4 ? '1' : '0';
        Minson._encode('uint(16)', input.charCodeAt(0));
        if (bytes4) {
            Minson._encode('uint(16)', input.charCodeAt(1));
        }
    },

    wcharDecode: (config) => {
        var bytes4 = Minson.bits.charAt(Minson.decodePos++) === '1';
        var out = String.fromCharCode(Minson._decode('uint(16)'));
        if (bytes4) {
            out += String.fromCharCode(Minson._decode('uint(16)'));
        }
        return out;
    },
        
    varcharEncode: (config, input) => {
        if (config.param == 255) {
            Minson._encode('uint(8)', input.length);
        }
        else {
            var max = Math.pow(2, 16) - 1;
            var length = input.length;
            while (length >= max) {
                length -= max;
                Minson._encode('uint(16)', max);
            }
            Minson._encode('uint(16)', length);
        }
        if (config.charset) {
            for (var pos = 0; pos < input.length; ++pos) {
                Minson.charsetCharEncode(config.charset, input.charAt(pos));
            }
        }
        else {
            for (var pos = 0; pos < input.length; ++pos) {
                Minson.bits += input.charCodeAt(pos).toString(2).padStart(8, '0');
            }
        }
    },

    varcharDecode: (config) => {
        var length;
        if (config.param == 255) {
            length = Minson._decode('uint(8)');
        }
        else {            
            length = Minson._decode('uint(16)');
            var max = Math.pow(2, 16) - 1;
            var lastLength = length;
            while (lastLength == max) {
                lastLength = Minson._decode('uint(16)');
                length += lastLength;
            }
        }

        var out = '';
        var chunk;
        if (config.charset) {
            for (var pos = 0; pos < length; ++pos) {
                out += Minson.charsetCharDecode(config.charset);
            }
        }
        else {
            for (var pos = 0; pos < length; ++pos) {
                chunk = Minson.bits.substring(Minson.decodePos, Minson.decodePos + 8);
                Minson.decodePos += 8;
                out += String.fromCharCode(parseInt(chunk, 2));
            }
        }
        return out;
    },
    
    arrayEncode: (config, input) => {
        var size = config.length > 1 ? config.length : null;

        if (size === null) {
            var max = Math.pow(2, 8) - 1;
            var length = input.length;
            while (length >= max) {
                length -= max;
                Minson._encode('uint(8)', max);
            }
            Minson._encode('uint(8)', length);
        }

        var iters = size === null ? input.length : size;

        for (var i = 0; i < iters; ++i) {
            Minson._encode(config[i] || config[0], input[i]);
        }
    
    },

    arrayDecode: (config) => {
        var out = [];
        var size = config.length > 1 ? config.length : null;

        if (size === null) {
            var max = Math.pow(2, 8) - 1;
            size = Minson._decode('uint(8)');
            var lastLength = size;
            while (lastLength == max) {
                lastLength = Minson._decode('uint(8)');
                size += lastLength;
            }
        }

        for (var i = 0; i < size; ++i) {
            out.push(Minson._decode(config[i] || config[0]));
        }

        return out;
    },
    
    objectEncode: (config, input) => {
        for (var key in config) {
            Minson._encode(config[key], input[key]);            
        }
    },

    objectDecode: (config) => {
        var out = {};
        for (var key in config) {
            out[key] = Minson._decode(config[key]);
        }
        return out;
    },

    mapEncode: (config, input) => {
        for (var [key, value] of config) {
            Minson._encode(value, input.get(key)); 
        }
    },

    mapDecode: (config) => {
        var out = config instanceof WeakMap ? new WeakMap() : new Map();
        for (var [key, value] of config) {
            out.set(key, Minson._decode(value));
        }
        return out;
    },

    setEncode: (config, input) => {
        Minson.arrayEncode(Array.from(config), Array.from(input));
    },

    setDecode: (config) => {
        return config instanceof WeakSet ? 
            new WeakSet(arrayDecode(Array.from(config))) : 
            new Set(arrayDecode(Array.from(config)));
    },

    _typedArrayConfig: (config) => {
        var subConfig = [];
        var subType = Minson.typedArrays[config.type];
        if (config.default !== undefined) {
            subType += '[' + config.default + ']';
        }
        config.param = parseInt(config.param ? config.param : 1);
        for (var i = 0; i < config.param; ++i) {
            subConfig.push(subType);
        }
        return subConfig;
    },

    typedArrayEncode: (config, input) => {
        Minson._encode(Minson._typedArrayConfig(config), Array.from(input));
    },

    typedArrayDecode: (config) => {
        return this[config.type].from(Minson._decode(Minson._typedArrayConfig(config)));
    },

    jsonEncode: (config, input) => {
        Minson.varcharEncode(config, JSON.stringify(input));
    },

    jsonDecode: (config) => {
        return JSON.parse(Minson.varcharDecode(config));
    },

    type: {
        BOOL: 'bool',
        ENUM: 'enum',
        INT: 'int',
        UINT: 'uint',
        FLOAT: 'float',
        BIGINT: 'bigint',
        BIGUINT: 'biguint',
        CHAR: 'char',
        WCHAR: 'wchar',
        VARCHAR: 'varchar',
        JSON: 'json',
        INT8ARRAY: 'Int8Array',
        UINT8ARRAY: 'Uint8Array',
        UINT8CLAMPEDARRAY: 'Uint8ClampedArray',
        INT16ARRAY: 'Int16Array',
        UINT16ARRAY: 'Uint16Array',
        INT32ARRAY: 'Int32Array',
        UINT32ARRAY: 'Uint32Array',
        FLOAT32ARRAY: 'Float32Array',
        FLOAT64ARRAY: 'Float64Array',
        BIGINT64ARRAY: 'BigInt64Array',
        BIGUINT64ARRAY: 'BigUint64Array',
    },

    charset: {
        ALPHANUMERIC: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        NUMERIC: '0123456789',
        HEXADECIMAL: '0123456789ABCDEF',
        ALPHA: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        ALPHAUPPER: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        ALPHALOWER: 'abcdefghijklmnopqrstuvwxyz',
    },

    configValueFormat: (value) => {
        if (value !== undefined && Array.isArray(value)) {
            value = value.map((val) => {
                val = Minson._unstring(val);
                return typeof val == 'string' ? '"' + val + '"' : val;
            }).join(', ');
        }
        else {
            value = Minson._unstring(value);
            value = typeof value == 'string' ? '"' + value + '"' : value;
        }
        return value;
    },

    config: (type, param, def, charset) => {
        if (typeof type === 'object') {
            param = type.size !== undefined ? type.size : type.param;
            def = type.default;
            charset = type.charset;
            type = type.type;
        }

        var requiredParams = false;
        var validParams = [];
        if (type == 'int' || type == 'uint') {
            validParams = [8, 16, 32];
            requiredParams = true;
        }
        else if (type == 'float') {
            validParams = [32, 64];
            requiredParams = true;
        }
        else if (type == 'bigint' || type == 'biguint') {
            validParams = [64];
            param = 64;
            requiredParams = true;
        }
        else if (type == 'varchar') {
            validParams = [255];
        }
        else if (type == 'enum') {
            requiredParams = true;
        }

        if (!param && requiredParams) {
            throw "Minson expected param for type " + type;
        }
        if (param && validParams.length && validParams.indexOf(param) === -1) {
            throw "Minson received invalid param " + param + " for type " + type;
        }

        param = Minson.configValueFormat(param);
        def = Minson.configValueFormat(def);

        return type + (param ? '(' + param + ')': '') + (def ? '[' + def + ']' : '') + (charset ? '{' + charset + '}' : '');
    }

};
