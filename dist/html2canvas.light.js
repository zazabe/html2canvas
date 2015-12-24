/*
 html2canvas 0.5.0-beta3 <http://html2canvas.hertzen.com>
 Copyright (c) 2015 Niklas von Hertzen

 Released under  License
 */
/*  html2canvas light version 0.5.0-beta3 by Cargo Media */

(function(f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f()
  } else if (typeof define === "function" && define.amd) {
    define([], f)
  } else {
    var g;
    if (typeof window !== "undefined") {
      g = window
    } else if (typeof global !== "undefined") {
      g = global
    } else if (typeof self !== "undefined") {
      g = self
    } else {
      g = this
    }
    g.html2canvas = f()
  }
})(function() {
  var define, module, exports;
  return (function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;
          if (!u && a)return a(o, !0);
          if (i)return i(o, !0);
          var f = new Error("Cannot find module '" + o + "'");
          throw f.code = "MODULE_NOT_FOUND", f
        }
        var l = n[o] = {exports: {}};
        t[o][0].call(l.exports, function(e) {
          var n = t[o][1][e];
          return s(n ? n : e)
        }, l, l.exports, e, t, n, r)
      }
      return n[o].exports
    }

    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++)s(r[o]);
    return s
  })({
    1: [function(require, module, exports) {
      var FakeImageLoader = function() {
        this.ready = Promise.resolve();
      };

      FakeImageLoader.prototype.fetch = function() {
        return this;
      };

      module.exports = FakeImageLoader;

    }, {}], 2: [function(require, module, exports) {
      function Support() {
        this.rangeBounds = true;
        this.cors = true;
        this.svg = true;
      }

      Support.prototype.testRangeBounds = function() {
        return true;
      };

      Support.prototype.testCORS = function() {
        return true;
      };

      Support.prototype.testSVG = function() {
        return true;
      };

      module.exports = Support;

    }, {}], 3: [function(require, module, exports) {
      var NodeParser = require('../src/nodeparser');

      function TextNodeParser(element, renderer, support, imageLoader, options) {
        NodeParser.call(this, element, renderer, support, imageLoader, options || {background: '#eee'});
      }

      TextNodeParser.prototype = Object.create(NodeParser.prototype);
      TextNodeParser.prototype.constructor = TextNodeParser;

      TextNodeParser.prototype.createStyles = function(document, styles) {
        if (window.html2canvas.logging) {
          console.warn('Pseudo style added externally.');
        }
      };

      module.exports = TextNodeParser;

    }, {"../src/nodeparser": 14}], 4: [function(require, module, exports) {
      var CanvasRenderer = require('../src/renderers/canvas');

      var TextRender = function() {
        CanvasRenderer.apply(this, arguments);
      };

      TextRender.prototype = Object.create(CanvasRenderer.prototype);
      TextRender.prototype.constructor = TextRender;

      TextRender.prototype.renderBackgroundImage = function() {
        if (window.html2canvas.logging) {
          console.warn('renderBackgroundImage not supported');
        }
      };

      module.exports = TextRender;

    }, {"../src/renderers/canvas": 17}], 5: [function(require, module, exports) {
      var TextRenderer = require('./TextRenderer');
      var TextNodeParser = require('./TextNodeParser');
      var FakeImageLoader = require('./FakeImageLoader');
      var FakeSupport = require('./FakeSupport');

      module.exports = function(node, options) {
        options = options || {};

        if (options.logging) {
          window.html2canvas.logging = true;
          window.html2canvas.start = Date.now();
        }
        if (!options.canvas) {
          options.canvas = document.createElement('canvas');
        }

        var support = new FakeSupport();
        var imageLoader = new FakeImageLoader();
        var renderer = new TextRenderer(options.width, options.height, imageLoader, options, document);
        var parser = new TextNodeParser(node, renderer, support, imageLoader);

        return parser.ready.then(function() {
          return renderer.canvas;
        });
      };

    }, {"./FakeImageLoader": 1, "./FakeSupport": 2, "./TextNodeParser": 3, "./TextRenderer": 4}], 6: [function(require, module, exports) {
      (function(global) {
        /*! https://mths.be/punycode v1.4.0 by @mathias */
        ;
        (function(root) {

          /** Detect free variables */
          var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;
          var freeModule = typeof module == 'object' && module && !module.nodeType && module;
          var freeGlobal = typeof global == 'object' && global;
          if (
            freeGlobal.global === freeGlobal ||
            freeGlobal.window === freeGlobal ||
            freeGlobal.self === freeGlobal
          ) {
            root = freeGlobal;
          }

          /**
           * The `punycode` object.
           * @name punycode
           * @type Object
           */
          var punycode,

            /** Highest positive signed 32-bit float value */
            maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

            /** Bootstring parameters */
            base = 36,
            tMin = 1,
            tMax = 26,
            skew = 38,
            damp = 700,
            initialBias = 72,
            initialN = 128, // 0x80
            delimiter = '-', // '\x2D'

            /** Regular expressions */
            regexPunycode = /^xn--/,
            regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
            regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

            /** Error messages */
            errors = {
              'overflow': 'Overflow: input needs wider integers to process',
              'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
              'invalid-input': 'Invalid input'
            },

            /** Convenience shortcuts */
            baseMinusTMin = base - tMin,
            floor = Math.floor,
            stringFromCharCode = String.fromCharCode,

            /** Temporary variable */
            key;

          /*--------------------------------------------------------------------------*/

          /**
           * A generic error utility function.
           * @private
           * @param {String} type The error type.
           * @returns {Error} Throws a `RangeError` with the applicable error message.
           */
          function error(type) {
            throw new RangeError(errors[type]);
          }

          /**
           * A generic `Array#map` utility function.
           * @private
           * @param {Array} array The array to iterate over.
           * @param {Function} callback The function that gets called for every array
           * item.
           * @returns {Array} A new array of values returned by the callback function.
           */
          function map(array, fn) {
            var length = array.length;
            var result = [];
            while (length--) {
              result[length] = fn(array[length]);
            }
            return result;
          }

          /**
           * A simple `Array#map`-like wrapper to work with domain name strings or email
           * addresses.
           * @private
           * @param {String} domain The domain name or email address.
           * @param {Function} callback The function that gets called for every
           * character.
           * @returns {Array} A new string of characters returned by the callback
           * function.
           */
          function mapDomain(string, fn) {
            var parts = string.split('@');
            var result = '';
            if (parts.length > 1) {
              // In email addresses, only the domain name should be punycoded. Leave
              // the local part (i.e. everything up to `@`) intact.
              result = parts[0] + '@';
              string = parts[1];
            }
            // Avoid `split(regex)` for IE8 compatibility. See #17.
            string = string.replace(regexSeparators, '\x2E');
            var labels = string.split('.');
            var encoded = map(labels, fn).join('.');
            return result + encoded;
          }

          /**
           * Creates an array containing the numeric code points of each Unicode
           * character in the string. While JavaScript uses UCS-2 internally,
           * this function will convert a pair of surrogate halves (each of which
           * UCS-2 exposes as separate characters) into a single code point,
           * matching UTF-16.
           * @see `punycode.ucs2.encode`
           * @see <https://mathiasbynens.be/notes/javascript-encoding>
           * @memberOf punycode.ucs2
           * @name decode
           * @param {String} string The Unicode input string (UCS-2).
           * @returns {Array} The new array of code points.
           */
          function ucs2decode(string) {
            var output = [],
              counter = 0,
              length = string.length,
              value,
              extra;
            while (counter < length) {
              value = string.charCodeAt(counter++);
              if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
                // high surrogate, and there is a next character
                extra = string.charCodeAt(counter++);
                if ((extra & 0xFC00) == 0xDC00) { // low surrogate
                  output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
                } else {
                  // unmatched surrogate; only append this code unit, in case the next
                  // code unit is the high surrogate of a surrogate pair
                  output.push(value);
                  counter--;
                }
              } else {
                output.push(value);
              }
            }
            return output;
          }

          /**
           * Creates a string based on an array of numeric code points.
           * @see `punycode.ucs2.decode`
           * @memberOf punycode.ucs2
           * @name encode
           * @param {Array} codePoints The array of numeric code points.
           * @returns {String} The new Unicode string (UCS-2).
           */
          function ucs2encode(array) {
            return map(array, function(value) {
              var output = '';
              if (value > 0xFFFF) {
                value -= 0x10000;
                output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
                value = 0xDC00 | value & 0x3FF;
              }
              output += stringFromCharCode(value);
              return output;
            }).join('');
          }

          /**
           * Converts a basic code point into a digit/integer.
           * @see `digitToBasic()`
           * @private
           * @param {Number} codePoint The basic numeric code point value.
           * @returns {Number} The numeric value of a basic code point (for use in
           * representing integers) in the range `0` to `base - 1`, or `base` if
           * the code point does not represent a value.
           */
          function basicToDigit(codePoint) {
            if (codePoint - 48 < 10) {
              return codePoint - 22;
            }
            if (codePoint - 65 < 26) {
              return codePoint - 65;
            }
            if (codePoint - 97 < 26) {
              return codePoint - 97;
            }
            return base;
          }

          /**
           * Converts a digit/integer into a basic code point.
           * @see `basicToDigit()`
           * @private
           * @param {Number} digit The numeric value of a basic code point.
           * @returns {Number} The basic code point whose value (when used for
           * representing integers) is `digit`, which needs to be in the range
           * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
           * used; else, the lowercase form is used. The behavior is undefined
           * if `flag` is non-zero and `digit` has no uppercase form.
           */
          function digitToBasic(digit, flag) {
            //  0..25 map to ASCII a..z or A..Z
            // 26..35 map to ASCII 0..9
            return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
          }

          /**
           * Bias adaptation function as per section 3.4 of RFC 3492.
           * https://tools.ietf.org/html/rfc3492#section-3.4
           * @private
           */
          function adapt(delta, numPoints, firstTime) {
            var k = 0;
            delta = firstTime ? floor(delta / damp) : delta >> 1;
            delta += floor(delta / numPoints);
            for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
              delta = floor(delta / baseMinusTMin);
            }
            return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
          }

          /**
           * Converts a Punycode string of ASCII-only symbols to a string of Unicode
           * symbols.
           * @memberOf punycode
           * @param {String} input The Punycode string of ASCII-only symbols.
           * @returns {String} The resulting string of Unicode symbols.
           */
          function decode(input) {
            // Don't use UCS-2
            var output = [],
              inputLength = input.length,
              out,
              i = 0,
              n = initialN,
              bias = initialBias,
              basic,
              j,
              index,
              oldi,
              w,
              k,
              digit,
              t,
              /** Cached calculation results */
              baseMinusT;

            // Handle the basic code points: let `basic` be the number of input code
            // points before the last delimiter, or `0` if there is none, then copy
            // the first basic code points to the output.

            basic = input.lastIndexOf(delimiter);
            if (basic < 0) {
              basic = 0;
            }

            for (j = 0; j < basic; ++j) {
              // if it's not a basic code point
              if (input.charCodeAt(j) >= 0x80) {
                error('not-basic');
              }
              output.push(input.charCodeAt(j));
            }

            // Main decoding loop: start just after the last delimiter if any basic code
            // points were copied; start at the beginning otherwise.

            for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

              // `index` is the index of the next character to be consumed.
              // Decode a generalized variable-length integer into `delta`,
              // which gets added to `i`. The overflow checking is easier
              // if we increase `i` as we go, then subtract off its starting
              // value at the end to obtain `delta`.
              for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

                if (index >= inputLength) {
                  error('invalid-input');
                }

                digit = basicToDigit(input.charCodeAt(index++));

                if (digit >= base || digit > floor((maxInt - i) / w)) {
                  error('overflow');
                }

                i += digit * w;
                t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

                if (digit < t) {
                  break;
                }

                baseMinusT = base - t;
                if (w > floor(maxInt / baseMinusT)) {
                  error('overflow');
                }

                w *= baseMinusT;

              }

              out = output.length + 1;
              bias = adapt(i - oldi, out, oldi == 0);

              // `i` was supposed to wrap around from `out` to `0`,
              // incrementing `n` each time, so we'll fix that now:
              if (floor(i / out) > maxInt - n) {
                error('overflow');
              }

              n += floor(i / out);
              i %= out;

              // Insert `n` at position `i` of the output
              output.splice(i++, 0, n);

            }

            return ucs2encode(output);
          }

          /**
           * Converts a string of Unicode symbols (e.g. a domain name label) to a
           * Punycode string of ASCII-only symbols.
           * @memberOf punycode
           * @param {String} input The string of Unicode symbols.
           * @returns {String} The resulting Punycode string of ASCII-only symbols.
           */
          function encode(input) {
            var n,
              delta,
              handledCPCount,
              basicLength,
              bias,
              j,
              m,
              q,
              k,
              t,
              currentValue,
              output = [],
              /** `inputLength` will hold the number of code points in `input`. */
              inputLength,
              /** Cached calculation results */
              handledCPCountPlusOne,
              baseMinusT,
              qMinusT;

            // Convert the input in UCS-2 to Unicode
            input = ucs2decode(input);

            // Cache the length
            inputLength = input.length;

            // Initialize the state
            n = initialN;
            delta = 0;
            bias = initialBias;

            // Handle the basic code points
            for (j = 0; j < inputLength; ++j) {
              currentValue = input[j];
              if (currentValue < 0x80) {
                output.push(stringFromCharCode(currentValue));
              }
            }

            handledCPCount = basicLength = output.length;

            // `handledCPCount` is the number of code points that have been handled;
            // `basicLength` is the number of basic code points.

            // Finish the basic string - if it is not empty - with a delimiter
            if (basicLength) {
              output.push(delimiter);
            }

            // Main encoding loop:
            while (handledCPCount < inputLength) {

              // All non-basic code points < n have been handled already. Find the next
              // larger one:
              for (m = maxInt, j = 0; j < inputLength; ++j) {
                currentValue = input[j];
                if (currentValue >= n && currentValue < m) {
                  m = currentValue;
                }
              }

              // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
              // but guard against overflow
              handledCPCountPlusOne = handledCPCount + 1;
              if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
                error('overflow');
              }

              delta += (m - n) * handledCPCountPlusOne;
              n = m;

              for (j = 0; j < inputLength; ++j) {
                currentValue = input[j];

                if (currentValue < n && ++delta > maxInt) {
                  error('overflow');
                }

                if (currentValue == n) {
                  // Represent delta as a generalized variable-length integer
                  for (q = delta, k = base; /* no condition */; k += base) {
                    t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
                    if (q < t) {
                      break;
                    }
                    qMinusT = q - t;
                    baseMinusT = base - t;
                    output.push(
                      stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
                    );
                    q = floor(qMinusT / baseMinusT);
                  }

                  output.push(stringFromCharCode(digitToBasic(q, 0)));
                  bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
                  delta = 0;
                  ++handledCPCount;
                }
              }

              ++delta;
              ++n;

            }
            return output.join('');
          }

          /**
           * Converts a Punycode string representing a domain name or an email address
           * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
           * it doesn't matter if you call it on a string that has already been
           * converted to Unicode.
           * @memberOf punycode
           * @param {String} input The Punycoded domain name or email address to
           * convert to Unicode.
           * @returns {String} The Unicode representation of the given Punycode
           * string.
           */
          function toUnicode(input) {
            return mapDomain(input, function(string) {
              return regexPunycode.test(string)
                ? decode(string.slice(4).toLowerCase())
                : string;
            });
          }

          /**
           * Converts a Unicode string representing a domain name or an email address to
           * Punycode. Only the non-ASCII parts of the domain name will be converted,
           * i.e. it doesn't matter if you call it with a domain that's already in
           * ASCII.
           * @memberOf punycode
           * @param {String} input The domain name or email address to convert, as a
           * Unicode string.
           * @returns {String} The Punycode representation of the given domain name or
           * email address.
           */
          function toASCII(input) {
            return mapDomain(input, function(string) {
              return regexNonASCII.test(string)
                ? 'xn--' + encode(string)
                : string;
            });
          }

          /*--------------------------------------------------------------------------*/

          /** Define the public API */
          punycode = {
            /**
             * A string representing the current Punycode.js version number.
             * @memberOf punycode
             * @type String
             */
            'version': '1.3.2',
            /**
             * An object of methods to convert from JavaScript's internal character
             * representation (UCS-2) to Unicode code points, and back.
             * @see <https://mathiasbynens.be/notes/javascript-encoding>
             * @memberOf punycode
             * @type Object
             */
            'ucs2': {
              'decode': ucs2decode,
              'encode': ucs2encode
            },
            'decode': decode,
            'encode': encode,
            'toASCII': toASCII,
            'toUnicode': toUnicode
          };

          /** Expose `punycode` */
          // Some AMD build optimizers, like r.js, check for specific condition patterns
          // like the following:
          if (
            typeof define == 'function' &&
            typeof define.amd == 'object' &&
            define.amd
          ) {
            define('punycode', function() {
              return punycode;
            });
          } else if (freeExports && freeModule) {
            if (module.exports == freeExports) {
              // in Node.js, io.js, or RingoJS v0.8.0+
              freeModule.exports = punycode;
            } else {
              // in Narwhal or RingoJS v0.7.0-
              for (key in punycode) {
                punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
              }
            }
          } else {
            // in Rhino or a web browser
            root.punycode = punycode;
          }

        }(this));

      }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {}], 7: [function(require, module, exports) {
      // http://dev.w3.org/csswg/css-color/

      function Color(value) {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = null;
        var result = this.fromArray(value) ||
          this.namedColor(value) ||
          this.rgb(value) ||
          this.rgba(value) ||
          this.hex6(value) ||
          this.hex3(value);
      }

      Color.prototype.darken = function(amount) {
        var a = 1 - amount;
        return new Color([
          Math.round(this.r * a),
          Math.round(this.g * a),
          Math.round(this.b * a),
          this.a
        ]);
      };

      Color.prototype.isTransparent = function() {
        return this.a === 0;
      };

      Color.prototype.isBlack = function() {
        return this.r === 0 && this.g === 0 && this.b === 0;
      };

      Color.prototype.fromArray = function(array) {
        if (Array.isArray(array)) {
          this.r = Math.min(array[0], 255);
          this.g = Math.min(array[1], 255);
          this.b = Math.min(array[2], 255);
          if (array.length > 3) {
            this.a = array[3];
        }
        }

        return (Array.isArray(array));
      };

      var _hex3 = /^#([a-f0-9]{3})$/i;

      Color.prototype.hex3 = function(value) {
        var match = null;
        if ((match = value.match(_hex3)) !== null) {
          this.r = parseInt(match[1][0] + match[1][0], 16);
          this.g = parseInt(match[1][1] + match[1][1], 16);
          this.b = parseInt(match[1][2] + match[1][2], 16);
        }
        return match !== null;
      };

      var _hex6 = /^#([a-f0-9]{6})$/i;

      Color.prototype.hex6 = function(value) {
        var match = null;
        if ((match = value.match(_hex6)) !== null) {
          this.r = parseInt(match[1].substring(0, 2), 16);
          this.g = parseInt(match[1].substring(2, 4), 16);
          this.b = parseInt(match[1].substring(4, 6), 16);
        }
        return match !== null;
      };


      var _rgb = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;

      Color.prototype.rgb = function(value) {
        var match = null;
        if ((match = value.match(_rgb)) !== null) {
          this.r = Number(match[1]);
          this.g = Number(match[2]);
          this.b = Number(match[3]);
        }
        return match !== null;
      };

      var _rgba = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d?\.?\d+)\s*\)$/;

      Color.prototype.rgba = function(value) {
        var match = null;
        if ((match = value.match(_rgba)) !== null) {
          this.r = Number(match[1]);
          this.g = Number(match[2]);
          this.b = Number(match[3]);
          this.a = Number(match[4]);
        }
        return match !== null;
      };

      Color.prototype.toString = function() {
        return this.a !== null && this.a !== 1 ?
        "rgba(" + [this.r, this.g, this.b, this.a].join(",") + ")" :
        "rgb(" + [this.r, this.g, this.b].join(",") + ")";
      };

      Color.prototype.namedColor = function(value) {
        value = value.toLowerCase();
        var color = colors[value];
        if (color) {
          this.r = color[0];
          this.g = color[1];
          this.b = color[2];
        } else if (value === "transparent") {
          this.r = this.g = this.b = this.a = 0;
          return true;
        }

        return !!color;
      };

      Color.prototype.isColor = true;

      // JSON.stringify([].slice.call($$('.named-color-table tr'), 1).map(function(row) { return [row.childNodes[3].textContent, row.childNodes[5].textContent.trim().split(",").map(Number)] }).reduce(function(data, row) {data[row[0]] = row[1]; return data}, {}))
      var colors = {
        "aliceblue": [240, 248, 255],
        "antiquewhite": [250, 235, 215],
        "aqua": [0, 255, 255],
        "aquamarine": [127, 255, 212],
        "azure": [240, 255, 255],
        "beige": [245, 245, 220],
        "bisque": [255, 228, 196],
        "black": [0, 0, 0],
        "blanchedalmond": [255, 235, 205],
        "blue": [0, 0, 255],
        "blueviolet": [138, 43, 226],
        "brown": [165, 42, 42],
        "burlywood": [222, 184, 135],
        "cadetblue": [95, 158, 160],
        "chartreuse": [127, 255, 0],
        "chocolate": [210, 105, 30],
        "coral": [255, 127, 80],
        "cornflowerblue": [100, 149, 237],
        "cornsilk": [255, 248, 220],
        "crimson": [220, 20, 60],
        "cyan": [0, 255, 255],
        "darkblue": [0, 0, 139],
        "darkcyan": [0, 139, 139],
        "darkgoldenrod": [184, 134, 11],
        "darkgray": [169, 169, 169],
        "darkgreen": [0, 100, 0],
        "darkgrey": [169, 169, 169],
        "darkkhaki": [189, 183, 107],
        "darkmagenta": [139, 0, 139],
        "darkolivegreen": [85, 107, 47],
        "darkorange": [255, 140, 0],
        "darkorchid": [153, 50, 204],
        "darkred": [139, 0, 0],
        "darksalmon": [233, 150, 122],
        "darkseagreen": [143, 188, 143],
        "darkslateblue": [72, 61, 139],
        "darkslategray": [47, 79, 79],
        "darkslategrey": [47, 79, 79],
        "darkturquoise": [0, 206, 209],
        "darkviolet": [148, 0, 211],
        "deeppink": [255, 20, 147],
        "deepskyblue": [0, 191, 255],
        "dimgray": [105, 105, 105],
        "dimgrey": [105, 105, 105],
        "dodgerblue": [30, 144, 255],
        "firebrick": [178, 34, 34],
        "floralwhite": [255, 250, 240],
        "forestgreen": [34, 139, 34],
        "fuchsia": [255, 0, 255],
        "gainsboro": [220, 220, 220],
        "ghostwhite": [248, 248, 255],
        "gold": [255, 215, 0],
        "goldenrod": [218, 165, 32],
        "gray": [128, 128, 128],
        "green": [0, 128, 0],
        "greenyellow": [173, 255, 47],
        "grey": [128, 128, 128],
        "honeydew": [240, 255, 240],
        "hotpink": [255, 105, 180],
        "indianred": [205, 92, 92],
        "indigo": [75, 0, 130],
        "ivory": [255, 255, 240],
        "khaki": [240, 230, 140],
        "lavender": [230, 230, 250],
        "lavenderblush": [255, 240, 245],
        "lawngreen": [124, 252, 0],
        "lemonchiffon": [255, 250, 205],
        "lightblue": [173, 216, 230],
        "lightcoral": [240, 128, 128],
        "lightcyan": [224, 255, 255],
        "lightgoldenrodyellow": [250, 250, 210],
        "lightgray": [211, 211, 211],
        "lightgreen": [144, 238, 144],
        "lightgrey": [211, 211, 211],
        "lightpink": [255, 182, 193],
        "lightsalmon": [255, 160, 122],
        "lightseagreen": [32, 178, 170],
        "lightskyblue": [135, 206, 250],
        "lightslategray": [119, 136, 153],
        "lightslategrey": [119, 136, 153],
        "lightsteelblue": [176, 196, 222],
        "lightyellow": [255, 255, 224],
        "lime": [0, 255, 0],
        "limegreen": [50, 205, 50],
        "linen": [250, 240, 230],
        "magenta": [255, 0, 255],
        "maroon": [128, 0, 0],
        "mediumaquamarine": [102, 205, 170],
        "mediumblue": [0, 0, 205],
        "mediumorchid": [186, 85, 211],
        "mediumpurple": [147, 112, 219],
        "mediumseagreen": [60, 179, 113],
        "mediumslateblue": [123, 104, 238],
        "mediumspringgreen": [0, 250, 154],
        "mediumturquoise": [72, 209, 204],
        "mediumvioletred": [199, 21, 133],
        "midnightblue": [25, 25, 112],
        "mintcream": [245, 255, 250],
        "mistyrose": [255, 228, 225],
        "moccasin": [255, 228, 181],
        "navajowhite": [255, 222, 173],
        "navy": [0, 0, 128],
        "oldlace": [253, 245, 230],
        "olive": [128, 128, 0],
        "olivedrab": [107, 142, 35],
        "orange": [255, 165, 0],
        "orangered": [255, 69, 0],
        "orchid": [218, 112, 214],
        "palegoldenrod": [238, 232, 170],
        "palegreen": [152, 251, 152],
        "paleturquoise": [175, 238, 238],
        "palevioletred": [219, 112, 147],
        "papayawhip": [255, 239, 213],
        "peachpuff": [255, 218, 185],
        "peru": [205, 133, 63],
        "pink": [255, 192, 203],
        "plum": [221, 160, 221],
        "powderblue": [176, 224, 230],
        "purple": [128, 0, 128],
        "rebeccapurple": [102, 51, 153],
        "red": [255, 0, 0],
        "rosybrown": [188, 143, 143],
        "royalblue": [65, 105, 225],
        "saddlebrown": [139, 69, 19],
        "salmon": [250, 128, 114],
        "sandybrown": [244, 164, 96],
        "seagreen": [46, 139, 87],
        "seashell": [255, 245, 238],
        "sienna": [160, 82, 45],
        "silver": [192, 192, 192],
        "skyblue": [135, 206, 235],
        "slateblue": [106, 90, 205],
        "slategray": [112, 128, 144],
        "slategrey": [112, 128, 144],
        "snow": [255, 250, 250],
        "springgreen": [0, 255, 127],
        "steelblue": [70, 130, 180],
        "tan": [210, 180, 140],
        "teal": [0, 128, 128],
        "thistle": [216, 191, 216],
        "tomato": [255, 99, 71],
        "turquoise": [64, 224, 208],
        "violet": [238, 130, 238],
        "wheat": [245, 222, 179],
        "white": [255, 255, 255],
        "whitesmoke": [245, 245, 245],
        "yellow": [255, 255, 0],
        "yellowgreen": [154, 205, 50]
      };

      module.exports = Color;

    }, {}], 8: [function(require, module, exports) {
      var smallImage = require('./utils').smallImage;

      function Font(family, size) {
        var container = document.createElement('div'),
          img = document.createElement('img'),
          span = document.createElement('span'),
          sampleText = 'Hidden Text',
          baseline,
          middle;

        container.style.visibility = "hidden";
        container.style.fontFamily = family;
        container.style.fontSize = size;
        container.style.margin = 0;
        container.style.padding = 0;

        document.body.appendChild(container);

        img.src = smallImage();
        img.width = 1;
        img.height = 1;

        img.style.margin = 0;
        img.style.padding = 0;
        img.style.verticalAlign = "baseline";

        span.style.fontFamily = family;
        span.style.fontSize = size;
        span.style.margin = 0;
        span.style.padding = 0;

        span.appendChild(document.createTextNode(sampleText));
        container.appendChild(span);
        container.appendChild(img);
        baseline = (img.offsetTop - span.offsetTop) + 1;

        container.removeChild(span);
        container.appendChild(document.createTextNode(sampleText));

        container.style.lineHeight = "normal";
        img.style.verticalAlign = "super";

        middle = (img.offsetTop - container.offsetTop) + 1;

        document.body.removeChild(container);

        this.baseline = baseline;
        this.lineWidth = 1;
        this.middle = middle;
      }

      module.exports = Font;

    }, {"./utils": 20}], 9: [function(require, module, exports) {
      var Font = require('./font');

      function FontMetrics() {
        this.data = {};
      }

      FontMetrics.prototype.getMetrics = function(family, size) {
        if (this.data[family + "-" + size] === undefined) {
          this.data[family + "-" + size] = new Font(family, size);
        }
        return this.data[family + "-" + size];
      };

      module.exports = FontMetrics;

    }, {"./font": 8}], 10: [function(require, module, exports) {
      function GradientContainer(imageData) {
        this.src = imageData.value;
        this.colorStops = [];
        this.type = null;
        this.x0 = 0.5;
        this.y0 = 0.5;
        this.x1 = 0.5;
        this.y1 = 0.5;
        this.promise = Promise.resolve(true);
      }

      GradientContainer.TYPES = {
        LINEAR: 1,
        RADIAL: 2
      };

      // TODO: support hsl[a], negative %/length values
      // TODO: support <angle> (e.g. -?\d{1,3}(?:\.\d+)deg, etc. : https://developer.mozilla.org/docs/Web/CSS/angle )
      GradientContainer.REGEXP_COLORSTOP = /^\s*(rgba?\(\s*\d{1,3},\s*\d{1,3},\s*\d{1,3}(?:,\s*[0-9\.]+)?\s*\)|[a-z]{3,20}|#[a-f0-9]{3,6})(?:\s+(\d{1,3}(?:\.\d+)?)(%|px)?)?(?:\s|$)/i;

      module.exports = GradientContainer;

    }, {}], 11: [function(require, module, exports) {
      var GradientContainer = require('./gradientcontainer');
      var Color = require('./color');

      function LinearGradientContainer(imageData) {
        GradientContainer.apply(this, arguments);
        this.type = GradientContainer.TYPES.LINEAR;

        var hasDirection = LinearGradientContainer.REGEXP_DIRECTION.test(imageData.args[0]) || !GradientContainer.REGEXP_COLORSTOP.test(imageData.args[0]);

        if (hasDirection) {
          imageData.args[0].split(/\s+/).reverse().forEach(function(position, index) {
            switch (position) {
              case "left":
                this.x0 = 0;
                this.x1 = 1;
                break;
              case "top":
                this.y0 = 0;
                this.y1 = 1;
                break;
              case "right":
                this.x0 = 1;
                this.x1 = 0;
                break;
              case "bottom":
                this.y0 = 1;
                this.y1 = 0;
                break;
              case "to":
                var y0 = this.y0;
                var x0 = this.x0;
                this.y0 = this.y1;
                this.x0 = this.x1;
                this.x1 = x0;
                this.y1 = y0;
                break;
              case "center":
                break; // centered by default
              // Firefox internally converts position keywords to percentages:
              // http://www.w3.org/TR/2010/WD-CSS2-20101207/colors.html#propdef-background-position
              default: // percentage or absolute length
                // TODO: support absolute start point positions (e.g., use bounds to convert px to a ratio)
                var ratio = parseFloat(position, 10) * 1e-2;
                if (isNaN(ratio)) { // invalid or unhandled value
                  break;
                }
                if (index === 0) {
                  this.y0 = ratio;
                  this.y1 = 1 - this.y0;
                } else {
                  this.x0 = ratio;
                  this.x1 = 1 - this.x0;
                }
                break;
            }
          }, this);
        } else {
          this.y0 = 0;
          this.y1 = 1;
        }

        this.colorStops = imageData.args.slice(hasDirection ? 1 : 0).map(function(colorStop) {
          var colorStopMatch = colorStop.match(GradientContainer.REGEXP_COLORSTOP);
          var value = +colorStopMatch[2];
          var unit = value === 0 ? "%" : colorStopMatch[3]; // treat "0" as "0%"
          return {
            color: new Color(colorStopMatch[1]),
            // TODO: support absolute stop positions (e.g., compute gradient line length & convert px to ratio)
            stop: unit === "%" ? value / 100 : null
          };
        });

        if (this.colorStops[0].stop === null) {
          this.colorStops[0].stop = 0;
        }

        if (this.colorStops[this.colorStops.length - 1].stop === null) {
          this.colorStops[this.colorStops.length - 1].stop = 1;
        }

        // calculates and fills-in explicit stop positions when omitted from rule
        this.colorStops.forEach(function(colorStop, index) {
          if (colorStop.stop === null) {
            this.colorStops.slice(index).some(function(find, count) {
              if (find.stop !== null) {
                colorStop.stop = ((find.stop - this.colorStops[index - 1].stop) / (count + 1)) + this.colorStops[index - 1].stop;
                return true;
              } else {
                return false;
              }
            }, this);
          }
        }, this);
      }

      LinearGradientContainer.prototype = Object.create(GradientContainer.prototype);

      // TODO: support <angle> (e.g. -?\d{1,3}(?:\.\d+)deg, etc. : https://developer.mozilla.org/docs/Web/CSS/angle )
      LinearGradientContainer.REGEXP_DIRECTION = /^\s*(?:to|left|right|top|bottom|center|\d{1,3}(?:\.\d+)?%?)(?:\s|$)/i;

      module.exports = LinearGradientContainer;

    }, {"./color": 7, "./gradientcontainer": 10}], 12: [function(require, module, exports) {
      module.exports = function() {
        if (window.html2canvas.logging && window.console && window.console.log) {
          Function.prototype.bind.call(window.console.log, (window.console)).apply(window.console, [(Date.now() - window.html2canvas.start) + "ms", "html2canvas:"].concat([].slice.call(arguments, 0)));
        }
      };

    }, {}], 13: [function(require, module, exports) {
      var Color = require('./color');
      var utils = require('./utils');
      var getBounds = utils.getBounds;
      var parseBackgrounds = utils.parseBackgrounds;
      var offsetBounds = utils.offsetBounds;

      function NodeContainer(node, parent) {
        this.node = node;
        this.parent = parent;
        this.stack = null;
        this.bounds = null;
        this.borders = null;
        this.clip = [];
        this.backgroundClip = [];
        this.offsetBounds = null;
        this.visible = null;
        this.computedStyles = null;
        this.colors = {};
        this.styles = {};
        this.backgroundImages = null;
        this.transformData = null;
        this.transformMatrix = null;
        this.isPseudoElement = false;
        this.opacity = null;
      }

      NodeContainer.prototype.cloneTo = function(stack) {
        stack.visible = this.visible;
        stack.borders = this.borders;
        stack.bounds = this.bounds;
        stack.clip = this.clip;
        stack.backgroundClip = this.backgroundClip;
        stack.computedStyles = this.computedStyles;
        stack.styles = this.styles;
        stack.backgroundImages = this.backgroundImages;
        stack.opacity = this.opacity;
      };

      NodeContainer.prototype.getOpacity = function() {
        return this.opacity === null ? (this.opacity = this.cssFloat('opacity')) : this.opacity;
      };

      NodeContainer.prototype.assignStack = function(stack) {
        this.stack = stack;
        stack.children.push(this);
      };

      NodeContainer.prototype.isElementVisible = function() {
        return this.node.nodeType === Node.TEXT_NODE ? this.parent.visible : (
          this.css('display') !== "none" &&
          this.css('visibility') !== "hidden" && !this.node.hasAttribute("data-html2canvas-ignore") &&
          (this.node.nodeName !== "INPUT" || this.node.getAttribute("type") !== "hidden")
        );
      };

      NodeContainer.prototype.css = function(attribute) {
        if (!this.computedStyles) {
          this.computedStyles = this.isPseudoElement ? this.parent.computedStyle(this.before ? ":before" : ":after") : this.computedStyle(null);
        }

        return this.styles[attribute] || (this.styles[attribute] = this.computedStyles[attribute]);
      };

      NodeContainer.prototype.prefixedCss = function(attribute) {
        var prefixes = ["webkit", "moz", "ms", "o"];
        var value = this.css(attribute);
        if (value === undefined) {
          prefixes.some(function(prefix) {
            value = this.css(prefix + attribute.substr(0, 1).toUpperCase() + attribute.substr(1));
            return value !== undefined;
          }, this);
        }
        return value === undefined ? null : value;
      };

      NodeContainer.prototype.computedStyle = function(type) {
        return this.node.ownerDocument.defaultView.getComputedStyle(this.node, type);
      };

      NodeContainer.prototype.cssInt = function(attribute) {
        var value = parseInt(this.css(attribute), 10);
        return (isNaN(value)) ? 0 : value; // borders in old IE are throwing 'medium' for demo.html
      };

      NodeContainer.prototype.color = function(attribute) {
        return this.colors[attribute] || (this.colors[attribute] = new Color(this.css(attribute)));
      };

      NodeContainer.prototype.cssFloat = function(attribute) {
        var value = parseFloat(this.css(attribute));
        return (isNaN(value)) ? 0 : value;
      };

      NodeContainer.prototype.fontWeight = function() {
        var weight = this.css("fontWeight");
        switch (parseInt(weight, 10)) {
          case 401:
            weight = "bold";
            break;
          case 400:
            weight = "normal";
            break;
        }
        return weight;
      };

      NodeContainer.prototype.parseClip = function() {
        var matches = this.css('clip').match(this.CLIP);
        if (matches) {
          return {
            top: parseInt(matches[1], 10),
            right: parseInt(matches[2], 10),
            bottom: parseInt(matches[3], 10),
            left: parseInt(matches[4], 10)
          };
        }
        return null;
      };

      NodeContainer.prototype.parseBackgroundImages = function() {
        return this.backgroundImages || (this.backgroundImages = parseBackgrounds(this.css("backgroundImage")));
      };

      NodeContainer.prototype.cssList = function(property, index) {
        var value = (this.css(property) || '').split(',');
        value = value[index || 0] || value[0] || 'auto';
        value = value.trim().split(' ');
        if (value.length === 1) {
          value = [value[0], isPercentage(value[0]) ? 'auto' : value[0]];
        }
        return value;
      };

      NodeContainer.prototype.parseBackgroundSize = function(bounds, image, index) {
        var size = this.cssList("backgroundSize", index);
        var width, height;

        if (isPercentage(size[0])) {
          width = bounds.width * parseFloat(size[0]) / 100;
        } else if (/contain|cover/.test(size[0])) {
          var targetRatio = bounds.width / bounds.height, currentRatio = image.width / image.height;
          return (targetRatio < currentRatio ^ size[0] === 'contain') ? {
            width: bounds.height * currentRatio,
            height: bounds.height
          } : {width: bounds.width, height: bounds.width / currentRatio};
        } else {
          width = parseInt(size[0], 10);
        }

        if (size[0] === 'auto' && size[1] === 'auto') {
          height = image.height;
        } else if (size[1] === 'auto') {
          height = width / image.width * image.height;
        } else if (isPercentage(size[1])) {
          height = bounds.height * parseFloat(size[1]) / 100;
        } else {
          height = parseInt(size[1], 10);
        }

        if (size[0] === 'auto') {
          width = height / image.height * image.width;
        }

        return {width: width, height: height};
      };

      NodeContainer.prototype.parseBackgroundPosition = function(bounds, image, index, backgroundSize) {
        var position = this.cssList('backgroundPosition', index);
        var left, top;

        if (isPercentage(position[0])) {
          left = (bounds.width - (backgroundSize || image).width) * (parseFloat(position[0]) / 100);
        } else {
          left = parseInt(position[0], 10);
        }

        if (position[1] === 'auto') {
          top = left / image.width * image.height;
        } else if (isPercentage(position[1])) {
          top = (bounds.height - (backgroundSize || image).height) * parseFloat(position[1]) / 100;
        } else {
          top = parseInt(position[1], 10);
        }

        if (position[0] === 'auto') {
          left = top / image.height * image.width;
        }

        return {left: left, top: top};
      };

      NodeContainer.prototype.parseBackgroundRepeat = function(index) {
        return this.cssList("backgroundRepeat", index)[0];
      };

      NodeContainer.prototype.parseTextShadows = function() {
        var textShadow = this.css("textShadow");
        var results = [];

        if (textShadow && textShadow !== 'none') {
          var shadows = textShadow.match(this.TEXT_SHADOW_PROPERTY);
          for (var i = 0; shadows && (i < shadows.length); i++) {
            var s = shadows[i].match(this.TEXT_SHADOW_VALUES);
            results.push({
              color: new Color(s[0]),
              offsetX: s[1] ? parseFloat(s[1].replace('px', '')) : 0,
              offsetY: s[2] ? parseFloat(s[2].replace('px', '')) : 0,
              blur: s[3] ? s[3].replace('px', '') : 0
            });
        }
        }
        return results;
      };

      NodeContainer.prototype.parseTransform = function() {
        if (!this.transformData) {
          if (this.hasTransform()) {
            var offset = this.parseBounds();
            var origin = this.prefixedCss("transformOrigin").split(" ").map(removePx).map(asFloat);
            origin[0] += offset.left;
            origin[1] += offset.top;
            this.transformData = {
              origin: origin,
              matrix: this.parseTransformMatrix()
            };
          } else {
            this.transformData = {
              origin: [0, 0],
              matrix: [1, 0, 0, 1, 0, 0]
            };
        }
        }
        return this.transformData;
      };

      NodeContainer.prototype.parseTransformMatrix = function() {
        if (!this.transformMatrix) {
          var transform = this.prefixedCss("transform");
          var matrix = transform ? parseMatrix(transform.match(this.MATRIX_PROPERTY)) : null;
          this.transformMatrix = matrix ? matrix : [1, 0, 0, 1, 0, 0];
        }
        return this.transformMatrix;
      };

      NodeContainer.prototype.parseBounds = function() {
        return this.bounds || (this.bounds = this.hasTransform() ? offsetBounds(this.node) : getBounds(this.node));
      };

      NodeContainer.prototype.hasTransform = function() {
        return this.parseTransformMatrix().join(",") !== "1,0,0,1,0,0" || (this.parent && this.parent.hasTransform());
      };

      NodeContainer.prototype.getValue = function() {
        var value = this.node.value || "";
        if (this.node.tagName === "SELECT") {
          value = selectionValue(this.node);
        } else if (this.node.type === "password") {
          value = Array(value.length + 1).join('\u2022'); // jshint ignore:line
        }
        return value.length === 0 ? (this.node.placeholder || "") : value;
      };

      NodeContainer.prototype.MATRIX_PROPERTY = /(matrix|matrix3d)\((.+)\)/;
      NodeContainer.prototype.TEXT_SHADOW_PROPERTY = /((rgba|rgb)\([^\)]+\)(\s-?\d+px){0,})/g;
      NodeContainer.prototype.TEXT_SHADOW_VALUES = /(-?\d+px)|(#.+)|(rgb\(.+\))|(rgba\(.+\))/g;
      NodeContainer.prototype.CLIP = /^rect\((\d+)px,? (\d+)px,? (\d+)px,? (\d+)px\)$/;

      function selectionValue(node) {
        var option = node.options[node.selectedIndex || 0];
        return option ? (option.text || "") : "";
      }

      function parseMatrix(match) {
        if (match && match[1] === "matrix") {
          return match[2].split(",").map(function(s) {
            return parseFloat(s.trim());
          });
        } else if (match && match[1] === "matrix3d") {
          var matrix3d = match[2].split(",").map(function(s) {
            return parseFloat(s.trim());
          });
          return [matrix3d[0], matrix3d[1], matrix3d[4], matrix3d[5], matrix3d[12], matrix3d[13]];
        }
      }

      function isPercentage(value) {
        return value.toString().indexOf("%") !== -1;
      }

      function removePx(str) {
        return str.replace("px", "");
      }

      function asFloat(str) {
        return parseFloat(str);
      }

      module.exports = NodeContainer;

    }, {"./color": 7, "./utils": 20}], 14: [function(require, module, exports) {
      var log = require('./log');
      var punycode = require('punycode');
      var NodeContainer = require('./nodecontainer');
      var TextContainer = require('./textcontainer');
      var PseudoElementContainer = require('./pseudoelementcontainer');
      var FontMetrics = require('./fontmetrics');
      var Color = require('./color');
      var StackingContext = require('./stackingcontext');
      var utils = require('./utils');
      var bind = utils.bind;
      var getBounds = utils.getBounds;
      var parseBackgrounds = utils.parseBackgrounds;
      var offsetBounds = utils.offsetBounds;

      function NodeParser(element, renderer, support, imageLoader, options) {
        log("Starting NodeParser");
        this.renderer = renderer;
        this.options = options;
        this.range = null;
        this.support = support;
        this.renderQueue = [];
        this.stack = new StackingContext(true, 1, element.ownerDocument, null);
        var parent = new NodeContainer(element, null);
        if (options.background) {
          renderer.rectangle(0, 0, renderer.width, renderer.height, new Color(options.background));
        }
        if (element === element.ownerDocument.documentElement) {
          // http://www.w3.org/TR/css3-background/#special-backgrounds
          var canvasBackground = new NodeContainer(parent.color('backgroundColor').isTransparent() ? element.ownerDocument.body : element.ownerDocument.documentElement, null);
          renderer.rectangle(0, 0, renderer.width, renderer.height, canvasBackground.color('backgroundColor'));
        }
        parent.visibile = parent.isElementVisible();
        this.createPseudoHideStyles(element.ownerDocument);
        this.disableAnimations(element.ownerDocument);
        this.nodes = flatten([parent].concat(this.getChildren(parent)).filter(function(container) {
          return container.visible = container.isElementVisible();
        }).map(this.getPseudoElements, this));
        this.fontMetrics = new FontMetrics();
        log("Fetched nodes, total:", this.nodes.length);
        log("Calculate overflow clips");
        this.calculateOverflowClips();
        log("Start fetching images");
        this.images = imageLoader.fetch(this.nodes.filter(isElement));
        this.ready = this.images.ready.then(bind(function() {
          log("Images loaded, starting parsing");
          log("Creating stacking contexts");
          this.createStackingContexts();
          log("Sorting stacking contexts");
          this.sortStackingContexts(this.stack);
          this.parse(this.stack);
          log("Render queue created with " + this.renderQueue.length + " items");
          return new Promise(bind(function(resolve) {
            if (!options.async) {
              this.renderQueue.forEach(this.paint, this);
              resolve();
            } else if (typeof(options.async) === "function") {
              options.async.call(this, this.renderQueue, resolve);
            } else if (this.renderQueue.length > 0) {
              this.renderIndex = 0;
              this.asyncRenderer(this.renderQueue, resolve);
            } else {
              resolve();
            }
        }, this));
        }, this));
      }

      NodeParser.prototype.calculateOverflowClips = function() {
        this.nodes.forEach(function(container) {
          if (isElement(container)) {
            if (isPseudoElement(container)) {
              container.appendToDOM();
            }
            container.borders = this.parseBorders(container);
            var clip = (container.css('overflow') === "hidden") ? [container.borders.clip] : [];
            var cssClip = container.parseClip();
            if (cssClip && ["absolute", "fixed"].indexOf(container.css('position')) !== -1) {
              clip.push([["rect",
                container.bounds.left + cssClip.left,
                container.bounds.top + cssClip.top,
                cssClip.right - cssClip.left,
                cssClip.bottom - cssClip.top
              ]]);
            }
            container.clip = hasParentClip(container) ? container.parent.clip.concat(clip) : clip;
            container.backgroundClip = (container.css('overflow') !== "hidden") ? container.clip.concat([container.borders.clip]) : container.clip;
            if (isPseudoElement(container)) {
              container.cleanDOM();
            }
          } else if (isTextNode(container)) {
            container.clip = hasParentClip(container) ? container.parent.clip : [];
          }
          if (!isPseudoElement(container)) {
            container.bounds = null;
          }
        }, this);
      };

      function hasParentClip(container) {
        return container.parent && container.parent.clip.length;
      }

      NodeParser.prototype.asyncRenderer = function(queue, resolve, asyncTimer) {
        asyncTimer = asyncTimer || Date.now();
        this.paint(queue[this.renderIndex++]);
        if (queue.length === this.renderIndex) {
          resolve();
        } else if (asyncTimer + 20 > Date.now()) {
          this.asyncRenderer(queue, resolve, asyncTimer);
        } else {
          setTimeout(bind(function() {
            this.asyncRenderer(queue, resolve);
          }, this), 0);
        }
      };

      NodeParser.prototype.createPseudoHideStyles = function(document) {
        this.createStyles(document, '.' + PseudoElementContainer.prototype.PSEUDO_HIDE_ELEMENT_CLASS_BEFORE + ':before { content: "" !important; display: none !important; }' +
          '.' + PseudoElementContainer.prototype.PSEUDO_HIDE_ELEMENT_CLASS_AFTER + ':after { content: "" !important; display: none !important; }');
      };

      NodeParser.prototype.disableAnimations = function(document) {
        this.createStyles(document, '* { -webkit-animation: none !important; -moz-animation: none !important; -o-animation: none !important; animation: none !important; ' +
          '-webkit-transition: none !important; -moz-transition: none !important; -o-transition: none !important; transition: none !important;}');
      };

      NodeParser.prototype.createStyles = function(document, styles) {
        var hidePseudoElements = document.createElement('style');
        hidePseudoElements.innerHTML = styles;
        document.body.appendChild(hidePseudoElements);
      };

      NodeParser.prototype.getPseudoElements = function(container) {
        var nodes = [[container]];
        if (container.node.nodeType === Node.ELEMENT_NODE) {
          var before = this.getPseudoElement(container, ":before");
          var after = this.getPseudoElement(container, ":after");

          if (before) {
            nodes.push(before);
          }

          if (after) {
            nodes.push(after);
        }
        }
        return flatten(nodes);
      };

      function toCamelCase(str) {
        return str.replace(/(\-[a-z])/g, function(match) {
          return match.toUpperCase().replace('-', '');
        });
      }

      NodeParser.prototype.getPseudoElement = function(container, type) {
        var style = container.computedStyle(type);
        if (!style || !style.content || style.content === "none" || style.content === "-moz-alt-content" || style.display === "none") {
          return null;
        }

        var content = stripQuotes(style.content);
        var isImage = content.substr(0, 3) === 'url';
        var pseudoNode = document.createElement(isImage ? 'img' : 'html2canvaspseudoelement');
        var pseudoContainer = new PseudoElementContainer(pseudoNode, container, type);

        for (var i = style.length - 1; i >= 0; i--) {
          var property = toCamelCase(style.item(i));
          pseudoNode.style[property] = style[property];
        }

        pseudoNode.className = PseudoElementContainer.prototype.PSEUDO_HIDE_ELEMENT_CLASS_BEFORE + " " + PseudoElementContainer.prototype.PSEUDO_HIDE_ELEMENT_CLASS_AFTER;

        if (isImage) {
          pseudoNode.src = parseBackgrounds(content)[0].args[0];
          return [pseudoContainer];
        } else {
          var text = document.createTextNode(content);
          pseudoNode.appendChild(text);
          return [pseudoContainer, new TextContainer(text, pseudoContainer)];
        }
      };


      NodeParser.prototype.getChildren = function(parentContainer) {
        return flatten([].filter.call(parentContainer.node.childNodes, renderableNode).map(function(node) {
          var container = [node.nodeType === Node.TEXT_NODE ? new TextContainer(node, parentContainer) : new NodeContainer(node, parentContainer)].filter(nonIgnoredElement);
          return node.nodeType === Node.ELEMENT_NODE && container.length && node.tagName !== "TEXTAREA" ? (container[0].isElementVisible() ? container.concat(this.getChildren(container[0])) : []) : container;
        }, this));
      };

      NodeParser.prototype.newStackingContext = function(container, hasOwnStacking) {
        var stack = new StackingContext(hasOwnStacking, container.getOpacity(), container.node, container.parent);
        container.cloneTo(stack);
        var parentStack = hasOwnStacking ? stack.getParentStack(this) : stack.parent.stack;
        parentStack.contexts.push(stack);
        container.stack = stack;
      };

      NodeParser.prototype.createStackingContexts = function() {
        this.nodes.forEach(function(container) {
          if (isElement(container) && (this.isRootElement(container) || hasOpacity(container) || isPositionedForStacking(container) || this.isBodyWithTransparentRoot(container) || container.hasTransform())) {
            this.newStackingContext(container, true);
          } else if (isElement(container) && ((isPositioned(container) && zIndex0(container)) || isInlineBlock(container) || isFloating(container))) {
            this.newStackingContext(container, false);
          } else {
            container.assignStack(container.parent.stack);
          }
        }, this);
      };

      NodeParser.prototype.isBodyWithTransparentRoot = function(container) {
        return container.node.nodeName === "BODY" && container.parent.color('backgroundColor').isTransparent();
      };

      NodeParser.prototype.isRootElement = function(container) {
        return container.parent === null;
      };

      NodeParser.prototype.sortStackingContexts = function(stack) {
        stack.contexts.sort(zIndexSort(stack.contexts.slice(0)));
        stack.contexts.forEach(this.sortStackingContexts, this);
      };

      NodeParser.prototype.parseTextBounds = function(container) {
        return function(text, index, textList) {
          if (container.parent.css("textDecoration").substr(0, 4) !== "none" || text.trim().length !== 0) {
            if (this.support.rangeBounds && !container.parent.hasTransform()) {
              var offset = textList.slice(0, index).join("").length;
              return this.getRangeBounds(container.node, offset, text.length);
            } else if (container.node && typeof(container.node.data) === "string") {
              var replacementNode = container.node.splitText(text.length);
              var bounds = this.getWrapperBounds(container.node, container.parent.hasTransform());
              container.node = replacementNode;
              return bounds;
            }
          } else if (!this.support.rangeBounds || container.parent.hasTransform()) {
            container.node = container.node.splitText(text.length);
          }
          return {};
        };
      };

      NodeParser.prototype.getWrapperBounds = function(node, transform) {
        var wrapper = node.ownerDocument.createElement('html2canvaswrapper');
        var parent = node.parentNode,
          backupText = node.cloneNode(true);

        wrapper.appendChild(node.cloneNode(true));
        parent.replaceChild(wrapper, node);
        var bounds = transform ? offsetBounds(wrapper) : getBounds(wrapper);
        parent.replaceChild(backupText, wrapper);
        return bounds;
      };

      NodeParser.prototype.getRangeBounds = function(node, offset, length) {
        var range = this.range || (this.range = node.ownerDocument.createRange());
        range.setStart(node, offset);
        range.setEnd(node, offset + length);
        return range.getBoundingClientRect();
      };

      function ClearTransform() {
      }

      NodeParser.prototype.parse = function(stack) {
        // http://www.w3.org/TR/CSS21/visuren.html#z-index
        var negativeZindex = stack.contexts.filter(negativeZIndex); // 2. the child stacking contexts with negative stack levels (most negative first).
        var descendantElements = stack.children.filter(isElement);
        var descendantNonFloats = descendantElements.filter(not(isFloating));
        var nonInlineNonPositionedDescendants = descendantNonFloats.filter(not(isPositioned)).filter(not(inlineLevel)); // 3 the in-flow, non-inline-level, non-positioned descendants.
        var nonPositionedFloats = descendantElements.filter(not(isPositioned)).filter(isFloating); // 4. the non-positioned floats.
        var inFlow = descendantNonFloats.filter(not(isPositioned)).filter(inlineLevel); // 5. the in-flow, inline-level, non-positioned descendants, including inline tables and inline blocks.
        var stackLevel0 = stack.contexts.concat(descendantNonFloats.filter(isPositioned)).filter(zIndex0); // 6. the child stacking contexts with stack level 0 and the positioned descendants with stack level 0.
        var text = stack.children.filter(isTextNode).filter(hasText);
        var positiveZindex = stack.contexts.filter(positiveZIndex); // 7. the child stacking contexts with positive stack levels (least positive first).
        negativeZindex.concat(nonInlineNonPositionedDescendants).concat(nonPositionedFloats)
          .concat(inFlow).concat(stackLevel0).concat(text).concat(positiveZindex).forEach(function(container) {
            this.renderQueue.push(container);
            if (isStackingContext(container)) {
              this.parse(container);
              this.renderQueue.push(new ClearTransform());
            }
          }, this);
      };

      NodeParser.prototype.paint = function(container) {
        try {
          if (container instanceof ClearTransform) {
            this.renderer.ctx.restore();
          } else if (isTextNode(container)) {
            if (isPseudoElement(container.parent)) {
              container.parent.appendToDOM();
            }
            this.paintText(container);
            if (isPseudoElement(container.parent)) {
              container.parent.cleanDOM();
            }
          } else {
            this.paintNode(container);
          }
        } catch (e) {
          log(e);
          if (this.options.strict) {
            throw e;
        }
        }
      };

      NodeParser.prototype.paintNode = function(container) {
        if (isStackingContext(container)) {
          this.renderer.setOpacity(container.opacity);
          this.renderer.ctx.save();
          if (container.hasTransform()) {
            this.renderer.setTransform(container.parseTransform());
        }
        }

        if (container.node.nodeName === "INPUT" && container.node.type === "checkbox") {
          this.paintCheckbox(container);
        } else if (container.node.nodeName === "INPUT" && container.node.type === "radio") {
          this.paintRadio(container);
        } else {
          this.paintElement(container);
        }
      };

      NodeParser.prototype.paintElement = function(container) {
        var bounds = container.parseBounds();
        this.renderer.clip(container.backgroundClip, function() {
          this.renderer.renderBackground(container, bounds, container.borders.borders.map(getWidth));
        }, this);

        this.renderer.clip(container.clip, function() {
          this.renderer.renderBorders(container.borders.borders);
        }, this);

        this.renderer.clip(container.backgroundClip, function() {
          switch (container.node.nodeName) {
            case "svg":
            case "IFRAME":
              var imgContainer = this.images.get(container.node);
              if (imgContainer) {
                this.renderer.renderImage(container, bounds, container.borders, imgContainer);
              } else {
                log("Error loading <" + container.node.nodeName + ">", container.node);
              }
              break;
            case "IMG":
              var imageContainer = this.images.get(container.node.src);
              if (imageContainer) {
                this.renderer.renderImage(container, bounds, container.borders, imageContainer);
              } else {
                log("Error loading <img>", container.node.src);
              }
              break;
            case "CANVAS":
              this.renderer.renderImage(container, bounds, container.borders, {image: container.node});
              break;
            case "SELECT":
            case "INPUT":
            case "TEXTAREA":
              this.paintFormValue(container);
              break;
          }
        }, this);
      };

      NodeParser.prototype.paintCheckbox = function(container) {
        var b = container.parseBounds();

        var size = Math.min(b.width, b.height);
        var bounds = {width: size - 1, height: size - 1, top: b.top, left: b.left};
        var r = [3, 3];
        var radius = [r, r, r, r];
        var borders = [1, 1, 1, 1].map(function(w) {
          return {color: new Color('#A5A5A5'), width: w};
        });

        var borderPoints = calculateCurvePoints(bounds, radius, borders);

        this.renderer.clip(container.backgroundClip, function() {
          this.renderer.rectangle(bounds.left + 1, bounds.top + 1, bounds.width - 2, bounds.height - 2, new Color("#DEDEDE"));
          this.renderer.renderBorders(calculateBorders(borders, bounds, borderPoints, radius));
          if (container.node.checked) {
            this.renderer.font(new Color('#424242'), 'normal', 'normal', 'bold', (size - 3) + "px", 'arial');
            this.renderer.text("\u2714", bounds.left + size / 6, bounds.top + size - 1);
          }
        }, this);
      };

      NodeParser.prototype.paintRadio = function(container) {
        var bounds = container.parseBounds();

        var size = Math.min(bounds.width, bounds.height) - 2;

        this.renderer.clip(container.backgroundClip, function() {
          this.renderer.circleStroke(bounds.left + 1, bounds.top + 1, size, new Color('#DEDEDE'), 1, new Color('#A5A5A5'));
          if (container.node.checked) {
            this.renderer.circle(Math.ceil(bounds.left + size / 4) + 1, Math.ceil(bounds.top + size / 4) + 1, Math.floor(size / 2), new Color('#424242'));
          }
        }, this);
      };

      NodeParser.prototype.paintFormValue = function(container) {
        var value = container.getValue();
        if (value.length > 0) {
          var document = container.node.ownerDocument;
          var wrapper = document.createElement('html2canvaswrapper');
          var properties = ['lineHeight', 'textAlign', 'fontFamily', 'fontWeight', 'fontSize', 'color',
            'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom',
            'width', 'height', 'borderLeftStyle', 'borderTopStyle', 'borderLeftWidth', 'borderTopWidth',
            'boxSizing', 'whiteSpace', 'wordWrap'];

          properties.forEach(function(property) {
            try {
              wrapper.style[property] = container.css(property);
            } catch (e) {
              // Older IE has issues with "border"
              log("html2canvas: Parse: Exception caught in renderFormValue: " + e.message);
            }
        });
          var bounds = container.parseBounds();
          wrapper.style.position = "fixed";
          wrapper.style.left = bounds.left + "px";
          wrapper.style.top = bounds.top + "px";
          wrapper.textContent = value;
          document.body.appendChild(wrapper);
          this.paintText(new TextContainer(wrapper.firstChild, container));
          document.body.removeChild(wrapper);
        }
      };

      NodeParser.prototype.paintText = function(container) {
        container.applyTextTransform();
        var characters = punycode.ucs2.decode(container.node.data);
        var textList = (!this.options.letterRendering || noLetterSpacing(container)) && !hasUnicode(container.node.data) ? getWords(characters) : characters.map(function(character) {
          return punycode.ucs2.encode([character]);
        });

        var weight = container.parent.fontWeight();
        var size = container.parent.css('fontSize');
        var family = container.parent.css('fontFamily');
        var shadows = container.parent.parseTextShadows();

        this.renderer.font(container.parent.color('color'), container.parent.css('fontStyle'), container.parent.css('fontVariant'), weight, size, family);
        if (shadows.length) {
          // TODO: support multiple text shadows
          this.renderer.fontShadow(shadows[0].color, shadows[0].offsetX, shadows[0].offsetY, shadows[0].blur);
        } else {
          this.renderer.clearShadow();
        }

        this.renderer.clip(container.parent.clip, function() {
          textList.map(this.parseTextBounds(container), this).forEach(function(bounds, index) {
            if (bounds) {
              this.renderer.text(textList[index], bounds.left, bounds.bottom);
              this.renderTextDecoration(container.parent, bounds, this.fontMetrics.getMetrics(family, size));
            }
        }, this);
        }, this);
      };

      NodeParser.prototype.renderTextDecoration = function(container, bounds, metrics) {
        switch (container.css("textDecoration").split(" ")[0]) {
          case "underline":
            // Draws a line at the baseline of the font
            // TODO As some browsers display the line as more than 1px if the font-size is big, need to take that into account both in position and size
            this.renderer.rectangle(bounds.left, Math.round(bounds.top + metrics.baseline + metrics.lineWidth), bounds.width, 1, container.color("color"));
            break;
          case "overline":
            this.renderer.rectangle(bounds.left, Math.round(bounds.top), bounds.width, 1, container.color("color"));
            break;
          case "line-through":
            // TODO try and find exact position for line-through
            this.renderer.rectangle(bounds.left, Math.ceil(bounds.top + metrics.middle + metrics.lineWidth), bounds.width, 1, container.color("color"));
            break;
        }
      };

      var borderColorTransforms = {
        inset: [
          ["darken", 0.60],
          ["darken", 0.10],
          ["darken", 0.10],
          ["darken", 0.60]
        ]
      };

      NodeParser.prototype.parseBorders = function(container) {
        var nodeBounds = container.parseBounds();
        var radius = getBorderRadiusData(container);
        var borders = ["Top", "Right", "Bottom", "Left"].map(function(side, index) {
          var style = container.css('border' + side + 'Style');
          var color = container.color('border' + side + 'Color');
          if (style === "inset" && color.isBlack()) {
            color = new Color([255, 255, 255, color.a]); // this is wrong, but
          }
          var colorTransform = borderColorTransforms[style] ? borderColorTransforms[style][index] : null;
          return {
            width: container.cssInt('border' + side + 'Width'),
            color: colorTransform ? color[colorTransform[0]](colorTransform[1]) : color,
            args: null
        };
        });
        var borderPoints = calculateCurvePoints(nodeBounds, radius, borders);

        return {
          clip: this.parseBackgroundClip(container, borderPoints, borders, radius, nodeBounds),
          borders: calculateBorders(borders, nodeBounds, borderPoints, radius)
        };
      };

      function calculateBorders(borders, nodeBounds, borderPoints, radius) {
        return borders.map(function(border, borderSide) {
          if (border.width > 0) {
            var bx = nodeBounds.left;
            var by = nodeBounds.top;
            var bw = nodeBounds.width;
            var bh = nodeBounds.height - (borders[2].width);

            switch (borderSide) {
              case 0:
                // top border
                bh = borders[0].width;
                border.args = drawSide({
                    c1: [bx, by],
                    c2: [bx + bw, by],
                    c3: [bx + bw - borders[1].width, by + bh],
                    c4: [bx + borders[3].width, by + bh]
                  }, radius[0], radius[1],
                  borderPoints.topLeftOuter, borderPoints.topLeftInner, borderPoints.topRightOuter, borderPoints.topRightInner);
                break;
              case 1:
                // right border
                bx = nodeBounds.left + nodeBounds.width - (borders[1].width);
                bw = borders[1].width;

                border.args = drawSide({
                    c1: [bx + bw, by],
                    c2: [bx + bw, by + bh + borders[2].width],
                    c3: [bx, by + bh],
                    c4: [bx, by + borders[0].width]
                  }, radius[1], radius[2],
                  borderPoints.topRightOuter, borderPoints.topRightInner, borderPoints.bottomRightOuter, borderPoints.bottomRightInner);
                break;
              case 2:
                // bottom border
                by = (by + nodeBounds.height) - (borders[2].width);
                bh = borders[2].width;
                border.args = drawSide({
                    c1: [bx + bw, by + bh],
                    c2: [bx, by + bh],
                    c3: [bx + borders[3].width, by],
                    c4: [bx + bw - borders[3].width, by]
                  }, radius[2], radius[3],
                  borderPoints.bottomRightOuter, borderPoints.bottomRightInner, borderPoints.bottomLeftOuter, borderPoints.bottomLeftInner);
                break;
              case 3:
                // left border
                bw = borders[3].width;
                border.args = drawSide({
                    c1: [bx, by + bh + borders[2].width],
                    c2: [bx, by],
                    c3: [bx + bw, by + borders[0].width],
                    c4: [bx + bw, by + bh]
                  }, radius[3], radius[0],
                  borderPoints.bottomLeftOuter, borderPoints.bottomLeftInner, borderPoints.topLeftOuter, borderPoints.topLeftInner);
                break;
            }
          }
          return border;
        });
      }

      NodeParser.prototype.parseBackgroundClip = function(container, borderPoints, borders, radius, bounds) {
        var backgroundClip = container.css('backgroundClip'),
          borderArgs = [];

        switch (backgroundClip) {
          case "content-box":
          case "padding-box":
            parseCorner(borderArgs, radius[0], radius[1], borderPoints.topLeftInner, borderPoints.topRightInner, bounds.left + borders[3].width, bounds.top + borders[0].width);
            parseCorner(borderArgs, radius[1], radius[2], borderPoints.topRightInner, borderPoints.bottomRightInner, bounds.left + bounds.width - borders[1].width, bounds.top + borders[0].width);
            parseCorner(borderArgs, radius[2], radius[3], borderPoints.bottomRightInner, borderPoints.bottomLeftInner, bounds.left + bounds.width - borders[1].width, bounds.top + bounds.height - borders[2].width);
            parseCorner(borderArgs, radius[3], radius[0], borderPoints.bottomLeftInner, borderPoints.topLeftInner, bounds.left + borders[3].width, bounds.top + bounds.height - borders[2].width);
            break;

          default:
            parseCorner(borderArgs, radius[0], radius[1], borderPoints.topLeftOuter, borderPoints.topRightOuter, bounds.left, bounds.top);
            parseCorner(borderArgs, radius[1], radius[2], borderPoints.topRightOuter, borderPoints.bottomRightOuter, bounds.left + bounds.width, bounds.top);
            parseCorner(borderArgs, radius[2], radius[3], borderPoints.bottomRightOuter, borderPoints.bottomLeftOuter, bounds.left + bounds.width, bounds.top + bounds.height);
            parseCorner(borderArgs, radius[3], radius[0], borderPoints.bottomLeftOuter, borderPoints.topLeftOuter, bounds.left, bounds.top + bounds.height);
            break;
        }

        return borderArgs;
      };

      function getCurvePoints(x, y, r1, r2) {
        var kappa = 4 * ((Math.sqrt(2) - 1) / 3);
        var ox = (r1) * kappa, // control point offset horizontal
          oy = (r2) * kappa, // control point offset vertical
          xm = x + r1, // x-middle
          ym = y + r2; // y-middle
        return {
          topLeft: bezierCurve({x: x, y: ym}, {x: x, y: ym - oy}, {x: xm - ox, y: y}, {x: xm, y: y}),
          topRight: bezierCurve({x: x, y: y}, {x: x + ox, y: y}, {x: xm, y: ym - oy}, {x: xm, y: ym}),
          bottomRight: bezierCurve({x: xm, y: y}, {x: xm, y: y + oy}, {x: x + ox, y: ym}, {x: x, y: ym}),
          bottomLeft: bezierCurve({x: xm, y: ym}, {x: xm - ox, y: ym}, {x: x, y: y + oy}, {x: x, y: y})
        };
      }

      function calculateCurvePoints(bounds, borderRadius, borders) {
        var x = bounds.left,
          y = bounds.top,
          width = bounds.width,
          height = bounds.height,

          tlh = borderRadius[0][0] < width / 2 ? borderRadius[0][0] : width / 2,
          tlv = borderRadius[0][1] < height / 2 ? borderRadius[0][1] : height / 2,
          trh = borderRadius[1][0] < width / 2 ? borderRadius[1][0] : width / 2,
          trv = borderRadius[1][1] < height / 2 ? borderRadius[1][1] : height / 2,
          brh = borderRadius[2][0] < width / 2 ? borderRadius[2][0] : width / 2,
          brv = borderRadius[2][1] < height / 2 ? borderRadius[2][1] : height / 2,
          blh = borderRadius[3][0] < width / 2 ? borderRadius[3][0] : width / 2,
          blv = borderRadius[3][1] < height / 2 ? borderRadius[3][1] : height / 2;

        var topWidth = width - trh,
          rightHeight = height - brv,
          bottomWidth = width - brh,
          leftHeight = height - blv;

        return {
          topLeftOuter: getCurvePoints(x, y, tlh, tlv).topLeft.subdivide(0.5),
          topLeftInner: getCurvePoints(x + borders[3].width, y + borders[0].width, Math.max(0, tlh - borders[3].width), Math.max(0, tlv - borders[0].width)).topLeft.subdivide(0.5),
          topRightOuter: getCurvePoints(x + topWidth, y, trh, trv).topRight.subdivide(0.5),
          topRightInner: getCurvePoints(x + Math.min(topWidth, width + borders[3].width), y + borders[0].width, (topWidth > width + borders[3].width) ? 0 : trh - borders[3].width, trv - borders[0].width).topRight.subdivide(0.5),
          bottomRightOuter: getCurvePoints(x + bottomWidth, y + rightHeight, brh, brv).bottomRight.subdivide(0.5),
          bottomRightInner: getCurvePoints(x + Math.min(bottomWidth, width - borders[3].width), y + Math.min(rightHeight, height + borders[0].width), Math.max(0, brh - borders[1].width), brv - borders[2].width).bottomRight.subdivide(0.5),
          bottomLeftOuter: getCurvePoints(x, y + leftHeight, blh, blv).bottomLeft.subdivide(0.5),
          bottomLeftInner: getCurvePoints(x + borders[3].width, y + leftHeight, Math.max(0, blh - borders[3].width), blv - borders[2].width).bottomLeft.subdivide(0.5)
        };
      }

      function bezierCurve(start, startControl, endControl, end) {
        var lerp = function(a, b, t) {
          return {
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t
        };
        };

        return {
          start: start,
          startControl: startControl,
          endControl: endControl,
          end: end,
          subdivide: function(t) {
            var ab = lerp(start, startControl, t),
              bc = lerp(startControl, endControl, t),
              cd = lerp(endControl, end, t),
              abbc = lerp(ab, bc, t),
              bccd = lerp(bc, cd, t),
              dest = lerp(abbc, bccd, t);
            return [bezierCurve(start, ab, abbc, dest), bezierCurve(dest, bccd, cd, end)];
          },
          curveTo: function(borderArgs) {
            borderArgs.push(["bezierCurve", startControl.x, startControl.y, endControl.x, endControl.y, end.x, end.y]);
          },
          curveToReversed: function(borderArgs) {
            borderArgs.push(["bezierCurve", endControl.x, endControl.y, startControl.x, startControl.y, start.x, start.y]);
          }
        };
      }

      function drawSide(borderData, radius1, radius2, outer1, inner1, outer2, inner2) {
        var borderArgs = [];

        if (radius1[0] > 0 || radius1[1] > 0) {
          borderArgs.push(["line", outer1[1].start.x, outer1[1].start.y]);
          outer1[1].curveTo(borderArgs);
        } else {
          borderArgs.push(["line", borderData.c1[0], borderData.c1[1]]);
        }

        if (radius2[0] > 0 || radius2[1] > 0) {
          borderArgs.push(["line", outer2[0].start.x, outer2[0].start.y]);
          outer2[0].curveTo(borderArgs);
          borderArgs.push(["line", inner2[0].end.x, inner2[0].end.y]);
          inner2[0].curveToReversed(borderArgs);
        } else {
          borderArgs.push(["line", borderData.c2[0], borderData.c2[1]]);
          borderArgs.push(["line", borderData.c3[0], borderData.c3[1]]);
        }

        if (radius1[0] > 0 || radius1[1] > 0) {
          borderArgs.push(["line", inner1[1].end.x, inner1[1].end.y]);
          inner1[1].curveToReversed(borderArgs);
        } else {
          borderArgs.push(["line", borderData.c4[0], borderData.c4[1]]);
        }

        return borderArgs;
      }

      function parseCorner(borderArgs, radius1, radius2, corner1, corner2, x, y) {
        if (radius1[0] > 0 || radius1[1] > 0) {
          borderArgs.push(["line", corner1[0].start.x, corner1[0].start.y]);
          corner1[0].curveTo(borderArgs);
          corner1[1].curveTo(borderArgs);
        } else {
          borderArgs.push(["line", x, y]);
        }

        if (radius2[0] > 0 || radius2[1] > 0) {
          borderArgs.push(["line", corner2[0].start.x, corner2[0].start.y]);
        }
      }

      function negativeZIndex(container) {
        return container.cssInt("zIndex") < 0;
      }

      function positiveZIndex(container) {
        return container.cssInt("zIndex") > 0;
      }

      function zIndex0(container) {
        return container.cssInt("zIndex") === 0;
      }

      function inlineLevel(container) {
        return ["inline", "inline-block", "inline-table"].indexOf(container.css("display")) !== -1;
      }

      function isStackingContext(container) {
        return (container instanceof StackingContext);
      }

      function hasText(container) {
        return container.node.data.trim().length > 0;
      }

      function noLetterSpacing(container) {
        return (/^(normal|none|0px)$/.test(container.parent.css("letterSpacing")));
      }

      function getBorderRadiusData(container) {
        return ["TopLeft", "TopRight", "BottomRight", "BottomLeft"].map(function(side) {
          var value = container.css('border' + side + 'Radius');
          var arr = value.split(" ");
          if (arr.length <= 1) {
            arr[1] = arr[0];
          }
          return arr.map(asInt);
        });
      }

      function renderableNode(node) {
        return (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE);
      }

      function isPositionedForStacking(container) {
        var position = container.css("position");
        var zIndex = (["absolute", "relative", "fixed"].indexOf(position) !== -1) ? container.css("zIndex") : "auto";
        return zIndex !== "auto";
      }

      function isPositioned(container) {
        return container.css("position") !== "static";
      }

      function isFloating(container) {
        return container.css("float") !== "none";
      }

      function isInlineBlock(container) {
        return ["inline-block", "inline-table"].indexOf(container.css("display")) !== -1;
      }

      function not(callback) {
        var context = this;
        return function() {
          return !callback.apply(context, arguments);
        };
      }

      function isElement(container) {
        return container.node.nodeType === Node.ELEMENT_NODE;
      }

      function isPseudoElement(container) {
        return container.isPseudoElement === true;
      }

      function isTextNode(container) {
        return container.node.nodeType === Node.TEXT_NODE;
      }

      function zIndexSort(contexts) {
        return function(a, b) {
          return (a.cssInt("zIndex") + (contexts.indexOf(a) / contexts.length)) - (b.cssInt("zIndex") + (contexts.indexOf(b) / contexts.length));
        };
      }

      function hasOpacity(container) {
        return container.getOpacity() < 1;
      }

      function asInt(value) {
        return parseInt(value, 10);
      }

      function getWidth(border) {
        return border.width;
      }

      function nonIgnoredElement(nodeContainer) {
        return (nodeContainer.node.nodeType !== Node.ELEMENT_NODE || ["SCRIPT", "HEAD", "TITLE", "OBJECT", "BR", "OPTION"].indexOf(nodeContainer.node.nodeName) === -1);
      }

      function flatten(arrays) {
        return [].concat.apply([], arrays);
      }

      function stripQuotes(content) {
        var first = content.substr(0, 1);
        return (first === content.substr(content.length - 1) && first.match(/'|"/)) ? content.substr(1, content.length - 2) : content;
      }

      function getWords(characters) {
        var words = [], i = 0, onWordBoundary = false, word;
        while (characters.length) {
          if (isWordBoundary(characters[i]) === onWordBoundary) {
            word = characters.splice(0, i);
            if (word.length) {
              words.push(punycode.ucs2.encode(word));
            }
            onWordBoundary = !onWordBoundary;
            i = 0;
          } else {
            i++;
          }

          if (i >= characters.length) {
            word = characters.splice(0, i);
            if (word.length) {
              words.push(punycode.ucs2.encode(word));
            }
        }
        }
        return words;
      }

      function isWordBoundary(characterCode) {
        return [
            32, // <space>
            13, // \r
            10, // \n
            9, // \t
            45 // -
          ].indexOf(characterCode) !== -1;
      }

      function hasUnicode(string) {
        return (/[^\u0000-\u00ff]/).test(string);
      }

      module.exports = NodeParser;

    }, {
      "./color": 7,
      "./fontmetrics": 9,
      "./log": 12,
      "./nodecontainer": 13,
      "./pseudoelementcontainer": 15,
      "./stackingcontext": 18,
      "./textcontainer": 19,
      "./utils": 20,
      "punycode": 6
    }], 15: [function(require, module, exports) {
      var NodeContainer = require('./nodecontainer');

      function PseudoElementContainer(node, parent, type) {
        NodeContainer.call(this, node, parent);
        this.isPseudoElement = true;
        this.before = type === ":before";
      }

      PseudoElementContainer.prototype.cloneTo = function(stack) {
        PseudoElementContainer.prototype.cloneTo.call(this, stack);
        stack.isPseudoElement = true;
        stack.before = this.before;
      };

      PseudoElementContainer.prototype = Object.create(NodeContainer.prototype);

      PseudoElementContainer.prototype.appendToDOM = function() {
        if (this.before) {
          this.parent.node.insertBefore(this.node, this.parent.node.firstChild);
        } else {
          this.parent.node.appendChild(this.node);
        }
        this.parent.node.className += " " + this.getHideClass();
      };

      PseudoElementContainer.prototype.cleanDOM = function() {
        this.node.parentNode.removeChild(this.node);
        this.parent.node.className = this.parent.node.className.replace(this.getHideClass(), "");
      };

      PseudoElementContainer.prototype.getHideClass = function() {
        return this["PSEUDO_HIDE_ELEMENT_CLASS_" + (this.before ? "BEFORE" : "AFTER")];
      };

      PseudoElementContainer.prototype.PSEUDO_HIDE_ELEMENT_CLASS_BEFORE = "___html2canvas___pseudoelement_before";
      PseudoElementContainer.prototype.PSEUDO_HIDE_ELEMENT_CLASS_AFTER = "___html2canvas___pseudoelement_after";

      module.exports = PseudoElementContainer;

    }, {"./nodecontainer": 13}], 16: [function(require, module, exports) {
      var log = require('./log');

      function Renderer(width, height, images, options, document) {
        this.width = width;
        this.height = height;
        this.images = images;
        this.options = options;
        this.document = document;
      }

      Renderer.prototype.renderImage = function(container, bounds, borderData, imageContainer) {
        var paddingLeft = container.cssInt('paddingLeft'),
          paddingTop = container.cssInt('paddingTop'),
          paddingRight = container.cssInt('paddingRight'),
          paddingBottom = container.cssInt('paddingBottom'),
          borders = borderData.borders;

        var width = bounds.width - (borders[1].width + borders[3].width + paddingLeft + paddingRight);
        var height = bounds.height - (borders[0].width + borders[2].width + paddingTop + paddingBottom);
        this.drawImage(
          imageContainer,
          0,
          0,
          imageContainer.image.width || width,
          imageContainer.image.height || height,
          bounds.left + paddingLeft + borders[3].width,
          bounds.top + paddingTop + borders[0].width,
          width,
          height
        );
      };

      Renderer.prototype.renderBackground = function(container, bounds, borderData) {
        if (bounds.height > 0 && bounds.width > 0) {
          this.renderBackgroundColor(container, bounds);
          this.renderBackgroundImage(container, bounds, borderData);
        }
      };

      Renderer.prototype.renderBackgroundColor = function(container, bounds) {
        var color = container.color("backgroundColor");
        if (!color.isTransparent()) {
          this.rectangle(bounds.left, bounds.top, bounds.width, bounds.height, color);
        }
      };

      Renderer.prototype.renderBorders = function(borders) {
        borders.forEach(this.renderBorder, this);
      };

      Renderer.prototype.renderBorder = function(data) {
        if (!data.color.isTransparent() && data.args !== null) {
          this.drawShape(data.args, data.color);
        }
      };

      Renderer.prototype.renderBackgroundImage = function(container, bounds, borderData) {
        var backgroundImages = container.parseBackgroundImages();
        backgroundImages.reverse().forEach(function(backgroundImage, index, arr) {
          switch (backgroundImage.method) {
            case "url":
              var image = this.images.get(backgroundImage.args[0]);
              if (image) {
                this.renderBackgroundRepeating(container, bounds, image, arr.length - (index + 1), borderData);
              } else {
                log("Error loading background-image", backgroundImage.args[0]);
              }
              break;
            case "linear-gradient":
            case "gradient":
              var gradientImage = this.images.get(backgroundImage.value);
              if (gradientImage) {
                this.renderBackgroundGradient(gradientImage, bounds, borderData);
              } else {
                log("Error loading background-image", backgroundImage.args[0]);
              }
            break;
            case "none":
            break;
            default:
              log("Unknown background-image type", backgroundImage.args[0]);
        }
        }, this);
      };

      Renderer.prototype.renderBackgroundRepeating = function(container, bounds, imageContainer, index, borderData) {
        var size = container.parseBackgroundSize(bounds, imageContainer.image, index);
        var position = container.parseBackgroundPosition(bounds, imageContainer.image, index, size);
        var repeat = container.parseBackgroundRepeat(index);
        switch (repeat) {
          case "repeat-x":
          case "repeat no-repeat":
            this.backgroundRepeatShape(imageContainer, position, size, bounds, bounds.left + borderData[3], bounds.top + position.top + borderData[0], 99999, size.height, borderData);
            break;
          case "repeat-y":
          case "no-repeat repeat":
            this.backgroundRepeatShape(imageContainer, position, size, bounds, bounds.left + position.left + borderData[3], bounds.top + borderData[0], size.width, 99999, borderData);
            break;
          case "no-repeat":
            this.backgroundRepeatShape(imageContainer, position, size, bounds, bounds.left + position.left + borderData[3], bounds.top + position.top + borderData[0], size.width, size.height, borderData);
            break;
          default:
            this.renderBackgroundRepeat(imageContainer, position, size, {top: bounds.top, left: bounds.left}, borderData[3], borderData[0]);
            break;
        }
      };

      module.exports = Renderer;

    }, {"./log": 12}], 17: [function(require, module, exports) {
      var Renderer = require('../renderer');
      var LinearGradientContainer = require('../lineargradientcontainer');
      var log = require('../log');

      function CanvasRenderer(width, height) {
        Renderer.apply(this, arguments);
        this.canvas = this.options.canvas || this.document.createElement("canvas");
        if (!this.options.canvas) {
          this.canvas.width = width;
          this.canvas.height = height;
        }
        this.ctx = this.canvas.getContext("2d");
        this.taintCtx = this.document.createElement("canvas").getContext("2d");
        this.ctx.textBaseline = "bottom";
        this.variables = {};
        log("Initialized CanvasRenderer with size", width, "x", height);
      }

      CanvasRenderer.prototype = Object.create(Renderer.prototype);

      CanvasRenderer.prototype.setFillStyle = function(fillStyle) {
        this.ctx.fillStyle = typeof(fillStyle) === "object" && !!fillStyle.isColor ? fillStyle.toString() : fillStyle;
        return this.ctx;
      };

      CanvasRenderer.prototype.rectangle = function(left, top, width, height, color) {
        this.setFillStyle(color).fillRect(left, top, width, height);
      };

      CanvasRenderer.prototype.circle = function(left, top, size, color) {
        this.setFillStyle(color);
        this.ctx.beginPath();
        this.ctx.arc(left + size / 2, top + size / 2, size / 2, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.fill();
      };

      CanvasRenderer.prototype.circleStroke = function(left, top, size, color, stroke, strokeColor) {
        this.circle(left, top, size, color);
        this.ctx.strokeStyle = strokeColor.toString();
        this.ctx.stroke();
      };

      CanvasRenderer.prototype.drawShape = function(shape, color) {
        this.shape(shape);
        this.setFillStyle(color).fill();
      };

      CanvasRenderer.prototype.taints = function(imageContainer) {
        if (imageContainer.tainted === null) {
          this.taintCtx.drawImage(imageContainer.image, 0, 0);
          try {
            this.taintCtx.getImageData(0, 0, 1, 1);
            imageContainer.tainted = false;
          } catch (e) {
            this.taintCtx = document.createElement("canvas").getContext("2d");
            imageContainer.tainted = true;
        }
        }

        return imageContainer.tainted;
      };

      CanvasRenderer.prototype.drawImage = function(imageContainer, sx, sy, sw, sh, dx, dy, dw, dh) {
        if (!this.taints(imageContainer) || this.options.allowTaint) {
          this.ctx.drawImage(imageContainer.image, sx, sy, sw, sh, dx, dy, dw, dh);
        }
      };

      CanvasRenderer.prototype.clip = function(shapes, callback, context) {
        this.ctx.save();
        shapes.filter(hasEntries).forEach(function(shape) {
          this.shape(shape).clip();
        }, this);
        callback.call(context);
        this.ctx.restore();
      };

      CanvasRenderer.prototype.shape = function(shape) {
        this.ctx.beginPath();
        shape.forEach(function(point, index) {
          if (point[0] === "rect") {
            this.ctx.rect.apply(this.ctx, point.slice(1));
          } else {
            this.ctx[(index === 0) ? "moveTo" : point[0] + "To"].apply(this.ctx, point.slice(1));
          }
        }, this);
        this.ctx.closePath();
        return this.ctx;
      };

      CanvasRenderer.prototype.font = function(color, style, variant, weight, size, family) {
        this.setFillStyle(color).font = [style, variant, weight, size, family].join(" ").split(",")[0];
      };

      CanvasRenderer.prototype.fontShadow = function(color, offsetX, offsetY, blur) {
        this.setVariable("shadowColor", color.toString())
          .setVariable("shadowOffsetY", offsetX)
          .setVariable("shadowOffsetX", offsetY)
          .setVariable("shadowBlur", blur);
      };

      CanvasRenderer.prototype.clearShadow = function() {
        this.setVariable("shadowColor", "rgba(0,0,0,0)");
      };

      CanvasRenderer.prototype.setOpacity = function(opacity) {
        this.ctx.globalAlpha = opacity;
      };

      CanvasRenderer.prototype.setTransform = function(transform) {
        this.ctx.translate(transform.origin[0], transform.origin[1]);
        this.ctx.transform.apply(this.ctx, transform.matrix);
        this.ctx.translate(-transform.origin[0], -transform.origin[1]);
      };

      CanvasRenderer.prototype.setVariable = function(property, value) {
        if (this.variables[property] !== value) {
          this.variables[property] = this.ctx[property] = value;
        }

        return this;
      };

      CanvasRenderer.prototype.text = function(text, left, bottom) {
        this.ctx.fillText(text, left, bottom);
      };

      CanvasRenderer.prototype.backgroundRepeatShape = function(imageContainer, backgroundPosition, size, bounds, left, top, width, height, borderData) {
        var shape = [
          ["line", Math.round(left), Math.round(top)],
          ["line", Math.round(left + width), Math.round(top)],
          ["line", Math.round(left + width), Math.round(height + top)],
          ["line", Math.round(left), Math.round(height + top)]
        ];
        this.clip([shape], function() {
          this.renderBackgroundRepeat(imageContainer, backgroundPosition, size, bounds, borderData[3], borderData[0]);
        }, this);
      };

      CanvasRenderer.prototype.renderBackgroundRepeat = function(imageContainer, backgroundPosition, size, bounds, borderLeft, borderTop) {
        var offsetX = Math.round(bounds.left + backgroundPosition.left + borderLeft), offsetY = Math.round(bounds.top + backgroundPosition.top + borderTop);
        this.setFillStyle(this.ctx.createPattern(this.resizeImage(imageContainer, size), "repeat"));
        this.ctx.translate(offsetX, offsetY);
        this.ctx.fill();
        this.ctx.translate(-offsetX, -offsetY);
      };

      CanvasRenderer.prototype.renderBackgroundGradient = function(gradientImage, bounds) {
        if (gradientImage instanceof LinearGradientContainer) {
          var gradient = this.ctx.createLinearGradient(
            bounds.left + bounds.width * gradientImage.x0,
            bounds.top + bounds.height * gradientImage.y0,
            bounds.left + bounds.width * gradientImage.x1,
            bounds.top + bounds.height * gradientImage.y1);
          gradientImage.colorStops.forEach(function(colorStop) {
            gradient.addColorStop(colorStop.stop, colorStop.color.toString());
          });
          this.rectangle(bounds.left, bounds.top, bounds.width, bounds.height, gradient);
        }
      };

      CanvasRenderer.prototype.resizeImage = function(imageContainer, size) {
        var image = imageContainer.image;
        if (image.width === size.width && image.height === size.height) {
          return image;
        }

        var ctx, canvas = document.createElement('canvas');
        canvas.width = size.width;
        canvas.height = size.height;
        ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, size.width, size.height);
        return canvas;
      };

      function hasEntries(array) {
        return array.length > 0;
      }

      module.exports = CanvasRenderer;

    }, {"../lineargradientcontainer": 11, "../log": 12, "../renderer": 16}], 18: [function(require, module, exports) {
      var NodeContainer = require('./nodecontainer');

      function StackingContext(hasOwnStacking, opacity, element, parent) {
        NodeContainer.call(this, element, parent);
        this.ownStacking = hasOwnStacking;
        this.contexts = [];
        this.children = [];
        this.opacity = (this.parent ? this.parent.stack.opacity : 1) * opacity;
      }

      StackingContext.prototype = Object.create(NodeContainer.prototype);

      StackingContext.prototype.getParentStack = function(context) {
        var parentStack = (this.parent) ? this.parent.stack : null;
        return parentStack ? (parentStack.ownStacking ? parentStack : parentStack.getParentStack(context)) : context.stack;
      };

      module.exports = StackingContext;

    }, {"./nodecontainer": 13}], 19: [function(require, module, exports) {
      var NodeContainer = require('./nodecontainer');

      function TextContainer(node, parent) {
        NodeContainer.call(this, node, parent);
      }

      TextContainer.prototype = Object.create(NodeContainer.prototype);

      TextContainer.prototype.applyTextTransform = function() {
        this.node.data = this.transform(this.parent.css("textTransform"));
      };

      TextContainer.prototype.transform = function(transform) {
        var text = this.node.data;
        switch (transform) {
          case "lowercase":
            return text.toLowerCase();
          case "capitalize":
            return text.replace(/(^|\s|:|-|\(|\))([a-z])/g, capitalize);
          case "uppercase":
            return text.toUpperCase();
          default:
            return text;
        }
      };

      function capitalize(m, p1, p2) {
        if (m.length > 0) {
          return p1 + p2.toUpperCase();
        }
      }

      module.exports = TextContainer;

    }, {"./nodecontainer": 13}], 20: [function(require, module, exports) {
      exports.smallImage = function smallImage() {
        return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      };

      exports.bind = function(callback, context) {
        return function() {
          return callback.apply(context, arguments);
        };
      };

      /*
       * base64-arraybuffer
       * https://github.com/niklasvh/base64-arraybuffer
       *
       * Copyright (c) 2012 Niklas von Hertzen
       * Licensed under the MIT license.
       */

      exports.decode64 = function(base64) {
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var len = base64.length, i, encoded1, encoded2, encoded3, encoded4, byte1, byte2, byte3;

        var output = "";

        for (i = 0; i < len; i += 4) {
          encoded1 = chars.indexOf(base64[i]);
          encoded2 = chars.indexOf(base64[i + 1]);
          encoded3 = chars.indexOf(base64[i + 2]);
          encoded4 = chars.indexOf(base64[i + 3]);

          byte1 = (encoded1 << 2) | (encoded2 >> 4);
          byte2 = ((encoded2 & 15) << 4) | (encoded3 >> 2);
          byte3 = ((encoded3 & 3) << 6) | encoded4;
          if (encoded3 === 64) {
            output += String.fromCharCode(byte1);
          } else if (encoded4 === 64 || encoded4 === -1) {
            output += String.fromCharCode(byte1, byte2);
          } else {
            output += String.fromCharCode(byte1, byte2, byte3);
        }
        }

        return output;
      };

      exports.getBounds = function(node) {
        if (node.getBoundingClientRect) {
          var clientRect = node.getBoundingClientRect();
          var width = node.offsetWidth == null ? clientRect.width : node.offsetWidth;
          return {
            top: clientRect.top,
            bottom: clientRect.bottom || (clientRect.top + clientRect.height),
            right: clientRect.left + width,
            left: clientRect.left,
            width: width,
            height: node.offsetHeight == null ? clientRect.height : node.offsetHeight
          };
        }
        return {};
      };

      exports.offsetBounds = function(node) {
        var parent = node.offsetParent ? exports.offsetBounds(node.offsetParent) : {top: 0, left: 0};

        return {
          top: node.offsetTop + parent.top,
          bottom: node.offsetTop + node.offsetHeight + parent.top,
          right: node.offsetLeft + parent.left + node.offsetWidth,
          left: node.offsetLeft + parent.left,
          width: node.offsetWidth,
          height: node.offsetHeight
        };
      };

      exports.parseBackgrounds = function(backgroundImage) {
        var whitespace = ' \r\n\t',
          method, definition, prefix, prefix_i, block, results = [],
          mode = 0, numParen = 0, quote, args;
        var appendResult = function() {
          if (method) {
            if (definition.substr(0, 1) === '"') {
              definition = definition.substr(1, definition.length - 2);
            }
            if (definition) {
              args.push(definition);
            }
            if (method.substr(0, 1) === '-' && (prefix_i = method.indexOf('-', 1) + 1) > 0) {
              prefix = method.substr(0, prefix_i);
              method = method.substr(prefix_i);
            }
            results.push({
              prefix: prefix,
              method: method.toLowerCase(),
              value: block,
              args: args,
              image: null
            });
          }
        args = [];
        method = prefix = definition = block = '';
        };
        args = [];
        method = prefix = definition = block = '';
        backgroundImage.split("").forEach(function(c) {
          if (mode === 0 && whitespace.indexOf(c) > -1) {
            return;
          }
          switch (c) {
            case '"':
              if (!quote) {
                quote = c;
              } else if (quote === c) {
                quote = null;
              }
              break;
            case '(':
              if (quote) {
                break;
              } else if (mode === 0) {
                mode = 1;
                block += c;
                return;
              } else {
                numParen++;
              }
              break;
            case ')':
              if (quote) {
                break;
              } else if (mode === 1) {
                if (numParen === 0) {
                  mode = 0;
                  block += c;
                  appendResult();
                  return;
                } else {
                  numParen--;
                }
              }
              break;

            case ',':
              if (quote) {
                break;
              } else if (mode === 0) {
                appendResult();
                return;
              } else if (mode === 1) {
                if (numParen === 0 && !method.match(/^url$/i)) {
                  args.push(definition);
                  definition = '';
                  block += c;
                  return;
                }
              }
              break;
          }

          block += c;
          if (mode === 0) {
            method += c;
          } else {
            definition += c;
          }
        });

        appendResult();
        return results;
      };

    }, {}]
  }, {}, [5])(5)
});
