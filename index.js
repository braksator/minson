#!/usr/bin/env node
'use strict';

/**
 * @file
 * Minson encoder/decoder.
 */


class MinsonConfig {
    constructor(config) {
        for (var key in config) {
            this[key] = config[key];
        }
    }
};

class MinsonType {
    constructor(config) {
        for (var key in config) {
            this[key] = config[key];
        }
    }
}

var Minson = module.exports =  {
    format: null,
    decodePos: 0,
    bits: '',

    type: {
        //OBJECT:             new MinsonType({type: 'object', struct: true}),
        //ARRAY:              new MinsonType({type: 'array', struct: true}),
        //MAP:                new MinsonType({type: 'map', struct: true}),
        //WEAKMAP:            new MinsonType({type: 'map', struct: true}),
        //SET:                new MinsonType({type: 'set', struct: true}),
        //WEAKSET:            new MinsonType({type: 'set', struct: true}),

        BOOL:               new MinsonType({type: 'bool'}),
        ENUM:               new MinsonType({type: 'enum', paramRequired: true}),
        INT:                new MinsonType({type: 'Int', handler: 'number', paramRequired: true, validParams: [8, 16, 32]}),
        UINT:               new MinsonType({type: 'Uint', handler: 'number', paramRequired: true, validParams: [8, 16, 32]}),
        FLOAT:              new MinsonType({type: 'Float', handler: 'number', paramRequired: true, validParams: [32, 64]}),
        BIGINT:             new MinsonType({type: 'BigInt', handler: 'number', paramRequired: true, validParams: [64]}),
        BIGUINT:            new MinsonType({type: 'BigUint', handler: 'number', paramRequired: true, validParams: [64]}),
        CHAR:               new MinsonType({type: 'char'}),
        WCHAR:              new MinsonType({type: 'wchar'}),
        VARCHAR:            new MinsonType({type: 'varchar', validParams: [255]}),
        JSON:               new MinsonType({type: 'json'}),

        INT8ARRAY:          new MinsonType({type: 'Int8Array', handler: 'typedArray', sub: {type: 'INT', size: 8}}),
        UINT8ARRAY:         new MinsonType({type: 'Uint8Array', handler: 'typedArray', sub: {type: 'UINT', size: 8}}),
        UINT8CLAMPEDARRAY:  new MinsonType({type: 'Uint8ClampedArray', handler: 'typedArray', sub: {type: 'UINT', size: 8}}),
        INT16ARRAY:         new MinsonType({type: 'Int16Array', handler: 'typedArray', sub: {type: 'INT', size: 16}}),
        UINT16ARRAY:        new MinsonType({type: 'Uint16Array', handler: 'typedArray', sub: {type: 'UINT', size: 16}}),
        INT32ARRAY:         new MinsonType({type: 'Int32Array', handler: 'typedArray', sub: {type: 'INT', size: 32}}),
        UINT32ARRAY:        new MinsonType({type: 'Uint32Array', handler: 'typedArray', sub: {type: 'UINT', size: 32}}),
        FLOAT32ARRAY:       new MinsonType({type: 'Float32Array', handler: 'typedArray', sub: {type: 'FLOAT', size: 32}}),
        FLOAT64ARRAY:       new MinsonType({type: 'Float64Array', handler: 'typedArray', sub: {type: 'FLOAT', size: 64}}),
        BIGINT64ARRAY:      new MinsonType({type: 'BigInt64Array', handler: 'typedArray', sub: {type: 'BIGINT', size: 64}}),
        BIGUINT64ARRAY:     new MinsonType({type: 'BigUint64Array', handler: 'typedArray', sub: {type: 'BIGUINT', size: 64}}),
    },

    charset: {
        ALPHANUMERIC: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        NUMERIC: '0123456789',
        HEXADECIMAL: '0123456789ABCDEF',
        ALPHA: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        ALPHAUPPER: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        ALPHALOWER: 'abcdefghijklmnopqrstuvwxyz',
    },

    config: (type, param, def, charset) => {
        var config = typeof type === 'object' ? type : {type: type};
        if (config.type instanceof MinsonType) {
            config.type = config.type.type;
        }

        if (param !== undefined) {
            config.param = param;
        }
        if (def !== undefined) {
            config.default = def;
        }
        if (charset !== undefined) {
            config.charset = charset;
        }

        return Minson.processConfig(new MinsonConfig(config));
    },

    processConfig(config) {
        if (config.type) {
            var typeDef = Minson.type[config.type.toUpperCase()];
            config.type = typeDef.type;
            if (!config.param && typeDef.paramRequired && typeDef.validParams.length === 1) {
                config.param = typeDef.validParams[0];
            }
            if (!config.param && typeDef.paramRequired) {
                throw "Minson expected param for type " + config.type;
            }
            if (config.param && typeDef.validParams && typeDef.validParams.indexOf(config.param) === -1) {
                throw "Minson received invalid param " + config.param + " for type " + config.type;
            }
            if (typeDef.handler) {
                config.handler = typeDef.handler;
            }
        }
        return config;
    },

    configToString(config) {
        var param = Minson._paramToString(config.param);
        var def = Minson._paramToString(config.default);
        return config.type.toLowerCase() 
            + (param ? '(' + param + ')': '') 
            + (def ? '[' + def + ']' : '') 
            + (config.charset ? '{' + config.charset + '}' : '');
    },

    stringToConfig: (str) => {
        var config = {};

        // Before any parens or brackets.
        var type = str.match(/[^()\[\]\{\}]+/g);
        config.type = type ? type[0] : '';

        // Get contents of optional parens.
        var param = str.match(/\(([^)]+)\)/);
        if (param && param[1]) {
            config.param = param[1].trim();
        }
        // Get contents of optional brackets.
        var def = str.match(/\[([^)]+)\]/);
        if (def && def[1]) {
            config.default = def[1].trim();
        }
        // Get contents of optional braces.
        var charset = str.match(/\{([^)]+)\}/);
        if (charset && charset[1]) {
            config.charset = charset[1];
        }
        
        if (config.param) {
            config.param = Minson._stringToParam(config.param);
        }
        if (config.default) {
            config.default = Minson._stringToParam(config.default);
        }
        
        return Minson.config(config);
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

    _escape(text) {    
        return text
            .replace(/\\/g, '\\\\')
            .replace(/\n/g, '\\n');
    },
    
    _unescape(text) {
        var replacements = {'\\\\': '\\', '\\n': '\n'};
        return text.replace(/\\(\\|n|")/g, function(replace) {
            return replacements[replace];
        });
    },

    _base64encode: (str) => {
        Buffer.from(str, 'binary').toString('base64');
    },

    _base64decode: (str) => {
        Buffer.from(str, 'base64').toString('binary');
    },

    _stringToParam: (value) => {
        var param = value.split(/,(?=(?:(?:[^'"]*(?:'|")){2})*[^'"]*$)/).map(function (v) {
            return Minson._unstring(v.trim().replace(/^["'](.*)["']$/, '$1'));
        });
        return param.length === 1 ? param[0] : param;
    },

    _paramToString(value) {
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

    _action: (action, config, input) => {
        var actionLower = action.toLowerCase();
        var handler;
        
        if (typeof config === 'string') {
            config = Minson.stringToConfig(config);
        }
        
        if (config instanceof MinsonConfig) {
            handler = config.handler ? config.handler : config.type ? config.type : 'unknown';
        }
        else if (config instanceof Map || config instanceof WeakMap) {
            handler = 'map';
        }
        else if (config instanceof Set || config instanceof WeakSet) {
            handler = 'set';
        }
        else if (Array.isArray(config)) {
            handler = 'array';
        }
        else {
            handler = 'object';
        }

        if (typeof Minson[handler + action] === "function") {
            return Minson[handler + action](config, input);
        }
        else {
            throw "Minson cannot " + actionLower + " configured variable of type " + config.type;
        }
    },

    _encode: (config, input) => {
        Minson._action('Encode', config, input);
    },

    _decode: (config) => {
        return Minson._action('Decode', config);
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
            return Minson._base64encode(text);
        }
        return Minson._escape(text);
    },

    decode: (config, input, format) => {
        Minson.format = format ? format : null;
        if (input) {
            if (Minson.format == 'bits') {
                Minson.bits = input.join('');
            }
            else {
                if (Minson.format == 'base64') {
                    input = Minson._base64decode(input);
                }
                else if (!Minson.format) {
                    input = Minson._unescape(input);
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
        var boolVals = config.param ? config.param : [true, false];
        Minson.bits += (input == boolVals[0]) ? '1' : '0';
    },

    boolDecode: (config) => {
        var boolVals = config.param ? config.param : [true, false];
        return Minson.bits[Minson.decodePos++] == 1 ? boolVals[0] : boolVals[1];
    },
    
    enumEncode: (config, input) => {
        var enumCount;
        var enumVal;
        if (Array.isArray(config.param)) {
            enumCount = config.param.length;
            enumVal = config.param.indexOf(input);
        }
        else {
            enumCount = config.param;
            enumVal = input;
        }
        if (enumVal < 0 || enumVal >= enumCount) {
            throw "Minson got invalid value (" + enumVal + ") for enum: " + types.enum[i].key;
        }
        var numBits = Math.floor(Math.log2(enumCount - 1) + 1);
        Minson.bits += enumVal.toString(2).padStart(numBits, '0');
    },

    enumDecode: (config) => {
        var enumCount;
        var enumVal;
        var intOnly = false;
        if (Array.isArray(config.param)) {
            enumCount = config.param.length;
        }
        else {
            enumCount = config.param;
            intOnly = true;
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
        var typeDef = Minson.type[config.type];
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

    unknownEncode: (config, input) => {
        var cfg = {};

        if (input === true || input === false) {
            cfg.type = 'bool';
            Minson._encodeUnknownType(cfg.type);
        }
        else if (typeof input == 'bigint') {
            cfg.type = input <= Math.pow(2, 63) - 1 ? 'BigInt' : 'BigUint';
            cfg.param = 64;
            Minson._encodeUnknownType(cfg.type);
            // For future flagging purposes if BigInt() spec changes.
            Minson.bits += '0';
        }
        else if (parseInt(input) == input) {
            if (input < 0) {
                cfg.type = 'Int';
                cfg.param = Math.pow(2, Math.ceil(Math.log(Math.log2(Math.abs(input) * 2)) / Math.log(2)));
            }
            else {
                cfg.type = 'Uint';
                cfg.param = Math.pow(2, Math.ceil(Math.log(Math.log2(input + 1)) / Math.log(2)));
            }
            Minson._encodeUnknownType(cfg.type);
            Minson.bits += Minson.unknownParams.indexOf(cfg.param).toString(2).padStart(Math.ceil(Math.log2(Minson.unknownParams.length)), '0');
        }
        else if (parseFloat(input) == input) {
            cfg.type = 'Float';
            cfg.param = (1.2e-38 <= input && input <= 3.4e38) ? 32 : 64;
            Minson._encodeUnknownType(cfg.type);
            Minson.bits += cfg.param == 32 ? '0' : '1';
        }
        else if (typeof input == 'string') {
            if (input.length === 1) {
                cfg.type = 'char';
                Minson._encodeUnknownType(cfg.type);
            }
            else {
                if (input.length <= 255) {
                    cfg.type = 'varchar';
                    cfg.param = 255;
                }
                else {
                    cfg.type = 'varchar';
                }
                Minson._encodeUnknownType(cfg.type);
                if (cfg.param) {
                    Minson.bits += cfg.param == 255 ? '1' : '0';
                }
            }
        }
        else if (Array.isArray(input)) {
            Minson._encodeUnknownType('array');
            return Minson._encode([''], input);
        }
        else {
            cfg.type = 'json';
            Minson._encodeUnknownType(cfg.type);
        }

        Minson._encode(Minson.config(cfg), input);
    },

    unknownDecode: (config) => {
        var cfg = {};
        cfg.type = Minson._decodeUnknownType();

        switch (cfg.type) {
            case 'BigInt':
            case 'BigUint':
                Minson.decodePos++;
                cfg.param = 64;
            break;
            case 'Int':
            case 'Uint':
                var len = Math.ceil(Math.log2(Minson.unknownParams.length));
                cfg.param = Minson.unknownParams[parseInt(Minson.bits.substring(Minson.decodePos, Minson.decodePos + len), 2)];
                Minson.decodePos += len;
            break;
            case 'Float':
                    cfg.param = Minson.bits.charAt(Minson.decodePos++) === '0' ? 32 : 64;
            break;
            case 'varchar':
                if (Minson.bits.charAt(Minson.decodePos++) === '1') {
                    cfg.param = 255;
                }
            break;
            case 'array':
                    return Minson._decode(['']);
            break;
        }
        
        return Minson._decode(Minson.config(cfg));
    },

};
