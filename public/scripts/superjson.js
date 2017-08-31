(function (global, exports) {
    var Date = global.Date;
    var Function = global.Function;
    var RegExp = global.RegExp;

    var create, defaultOpts, dateSerializer, escapeForRegExp, isArray,
    isReplaceable, regExpSerializer
    var hasProp = function (obj, prop) { return Object.hasOwnProperty.call(obj, prop); };
    var jsonParse = JSON.parse;
    var jsonStringify = JSON.stringify;
    var identifierFormat = '[a-zA-Z_$][0-9a-zA-Z_$]*';
    var identifierPattern = new RegExp('^' + identifierFormat + '$');
    var functionPattern = new RegExp(
      '^\\s*function(?:\\s+' + identifierFormat + ')?\\s*' +
      '\\(\\s*(?:(' + identifierFormat + ')' +
      '((?:\\s*,\\s*' + identifierFormat + ')*)?)?\\s*\\)\\s*' +
      '\\{([\\s\\S]*)\\}\\s*', 'm');
    var nativeFunctionBodyPattern = /^\s\[native\scode\]\s$/;

    isArray = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    escapeForRegExp = function (s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    isReplaceable = function (obj) {
        return (typeof obj === 'object' && obj !== null) ||
          typeof obj === 'function';
    }

    dateSerializer = {
        serialize: function (date) {
            return [date.getTime()];
        },
        deserialize: function (time) {
            return new Date(time);
        },
        isInstance: function (obj) {
            return obj instanceof Date;
        },
        name: 'Date'
    }

    regExpSerializer = {
        serialize: function (regExp) {
            var flags = '';
            if (regExp.global) flags += 'g';
            if (regExp.multiline) flags += 'm';
            if (regExp.ignoreCase) flags += 'i';
            return [regExp.source, flags];
        },
        deserialize: function (source, flags) {
            return new RegExp(source, flags);
        },
        isInstance: function (obj) {
            return obj instanceof RegExp;
        },
        name: 'RegExp'
    }

    functionSerializer = {
        serialize: function (f) {
            var firstArg, functionBody, parts, remainingArgs;
            var args = '';

            parts = functionPattern.exec(f.toString());

            if (!parts)
                throw new Error('Functions must have a working toString method' +
                                'in order to be serialized');

            firstArg = parts[1];
            remainingArgs = parts[2];
            functionBody = parts[3];

            if (nativeFunctionBodyPattern.test(functionBody))
                throw new Error('Native functions cannot be serialized');

            if (firstArg)
                args += firstArg.trim()

            if (remainingArgs) {
                remainingArgs = remainingArgs.split(',').slice(1);
                for (var i = 0; i < remainingArgs.length; i += 1) {
                    args += ', ' + remainingArgs[i].trim();
                }
            }

            return [args, functionBody];
        },
        deserialize: function (args, functionBody) {
            var rv = new Function(args, functionBody);
            return rv;
        },
        isInstance: function (obj) {
            return typeof obj === 'function';
        },
        name: 'Function'
    }

    defaultOpts = {
        magic: '#!',
        serializers: [dateSerializer, regExpSerializer, functionSerializer]
    }

    create = function (options) {
        var i, installSerializer, parse, replacer, replaceValue,
        reviver, reviveValue, stringEscaper, stringify;
        var magic = escapeForRegExp((options && options.magic) ||
                                    defaultOpts.magic);
        var initialSerializers = (options && options.serializers) ||
          defaultOpts.serializers;
        var serializers = [];
        var magicEscaper = new RegExp('([' + magic + '])', 'g');
        var magicUnescaper = new RegExp('([' + magic + '])\\1', 'g');
        var superJsonStringPattern = new RegExp('^([' + magic + ']+)' +
                                          '(' + identifierFormat +
                                          '\\[.*\\])$');
        var superJsonPattern = new RegExp('^' + magic +
                                          '(' + identifierFormat + ')' +
                                          '(\\[.*\\])$');

        installSerializer = function (serializer) {
            if (!identifierPattern.test(serializer.name))
                throw new Error("Serializers must have a 'name' property " +
                                'that is a valid javascript identifier');

            if (typeof serializer.serialize !== 'function')
                throw new Error("Serializers must have a 'serialize' function " +
                                'that will receive an instance and return an array ' +
                                'of arguments necessary to reconstruct the object ' +
                                'state.');

            if (typeof serializer.deserialize !== 'function')
                throw new Error("Serializers must have a 'deserialize' function " +
                                'that when passed the arguments generated by ' +
                                "'serialize' will return a instance that is equal " +
                                'to the one serialized');

            if (typeof serializer.isInstance !== 'function')
                throw new Error("Serializers must have a 'isInstance' function " +
                                'that tells if an object is an instance of the ' +
                                'type represented by the serializer');

            serializers.push(serializer);
        }

        for (i = 0; i < initialSerializers.length; i += 1) {
            installSerializer(initialSerializers[i]);
        }

        replaceValue = function (value) {
            var args, match, name, i, serializer;

            if (typeof value === 'string' &&
                (match = superJsonStringPattern.exec(value))) {
                // Escape magic string at the start only
                return match[1].replace(magicEscaper, '$1$1') + match[2];
            } else {
                for (i = 0; i < serializers.length; i += 1) {
                    serializer = serializers[i];
                    name = serializer.name;
                    if (serializer.isInstance(value)) {
                        args = serializer.serialize(value);
                        if (!isArray(args))
                            throw new Error("'serialize' function must return an array " +
                                            "containing arguments for 'deserialize'");
                        return magic + name + stringify(args);
                    }
                }
            }
        }

        replacer = function (key, value) {
            var k, setter, replacedValue, v;
            var rv = null;

            if (isReplaceable(value)) {
                if (isArray(value)) {
                    rv = [];
                    for (var i = 0; i < value.length; i += 1) {
                        v = value[i];
                        replacedValue = replaceValue(v);
                        if (replacedValue === undefined) replacedValue = v;
                        rv.push(replacedValue);
                    }
                } else {
                    rv = {};
                    for (k in value) if (hasProp(value, k)) {
                        v = value[k];
                        replacedValue = replaceValue(v);
                        if (replacedValue === undefined) replacedValue = v;
                        rv[k] = replacedValue;
                    }
                }
            }

            if (!rv) return value;
            return rv;
        }

        reviveValue = function (value) {
            var args, match, name, serializer;

            if (match = superJsonPattern.exec(value)) {
                name = match[1];
                try {
                    args = parse(match[2]);
                } catch (e) {
                    // Ignore parse errors
                    return;
                }
                for (var i = 0; i < serializers.length; i += 1) {
                    serializer = serializers[i];
                    if (name === serializer.name)
                        return serializer.deserialize.apply(serializer, args);
                }
            } else if (typeof value === 'string' &&
                       (match = superJsonStringPattern.exec(value))) {
                return match[1].replace(magicUnescaper, '$1') + match[2];
            }
        }

        reviver = function (key, value) {
            var k, match, revivedValue, v;

            if (typeof value == 'object') {
                for (k in value) if (hasProp(value, k)) {
                    v = value[k];
                    revivedValue = reviveValue(v);
                    if (!revivedValue) revivedValue = v;
                    value[k] = revivedValue;
                }
            }

            return value
        }

        stringify = function (obj, userReplacer, indent) {
            var rv;

            if (typeof userReplacer === 'number')
                indent = userReplacer;

            if (!userReplacer && isReplaceable(obj))
                rv = replaceValue(obj);

            if (rv)
                return jsonStringify(rv, null, indent);

            return jsonStringify(obj, typeof userReplacer === 'function' ?
                userReplacer : replacer, indent);
        }

        parse = function (json, userReviver) {
            var rv;
            var parsed = jsonParse(json, typeof userReviver === 'function' ?
                userReviver : reviver);

            if (typeof parsed === 'string') rv = reviveValue(parsed);
            if (!rv) rv = parsed;
            return rv;
        }

        return {
            stringify: stringify,
            parse: parse,
            installSerializer: installSerializer
        };
    }

    exports.dateSerializer = dateSerializer;
    exports.regExpSerializer = regExpSerializer;
    exports.functionSerializer = functionSerializer;
    exports.create = create;

}).apply(this, typeof (window) === 'undefined' ?
  [global, module.exports] : [window, window.superJson = {}]);