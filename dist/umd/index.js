(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@depay/web3-blockchains'), require('@depay/web3-assets'), require('@depay/web3-exchanges'), require('@depay/web3-tokens'), require('@depay/solana-web3.js'), require('ethers')) :
  typeof define === 'function' && define.amd ? define(['exports', '@depay/web3-blockchains', '@depay/web3-assets', '@depay/web3-exchanges', '@depay/web3-tokens', '@depay/solana-web3.js', 'ethers'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Web3Payments = {}, global.Web3Blockchains, global.Web3Assets, global.Web3Exchanges, global.Web3Tokens, global.SolanaWeb3js, global.ethers));
})(this, (function (exports, Blockchains, web3Assets, web3Exchanges, web3Tokens, solanaWeb3_js, ethers) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var Blockchains__default = /*#__PURE__*/_interopDefaultLegacy(Blockchains);

  const prepareUniswapTransaction = (transaction)=>{
    transaction.params.path = transaction.params.path.filter((token, index, path)=>{
      if(
        index == 1 &&
        token == Blockchains__default["default"][transaction.blockchain].wrapped.address &&
        path[0] == Blockchains__default["default"][transaction.blockchain].currency.address
      ) { 
        return false
      } else if (
        index == path.length-2 &&
        token == Blockchains__default["default"][transaction.blockchain].wrapped.address &&
        path[path.length-1] == Blockchains__default["default"][transaction.blockchain].currency.address
      ) {
        return false
      } else {
        return true
      }
    });
    return transaction
  };

  var plugins$1 = {
    ethereum: {
      payment: {
        address: '0x99F3F4685a7178F26EB4F4Ca8B75a1724F1577B9'
      },
      weth: {
        wrap: { address: '0xF4cc97D00dD0639c3e383D7CafB3d815616cbB2C' },
        unwrap: { address: '0xcA575c6C5305e8127F3D376bb22776eAD370De4a' },
      },
      uniswap_v2: {
        address: '0xe04b08Dfc6CaA0F4Ec523a3Ae283Ece7efE00019',
        prepareTransaction: prepareUniswapTransaction
      },
      paymentWithEvent: {
        address: '0xD8fBC10787b019fE4059Eb5AA5fB11a5862229EF'
      },
      paymentFee: {
        address: '0x874Cb669D7BFff79d4A6A30F4ea52c5e413BD6A7',
      },
      paymentFeeWithEvent: {
        address: '0x981cAd45c768d56136FDBb2C5E115F33D971bE6C'
      }
    },
    bsc: {
      payment: {
        address: '0x8B127D169D232D5F3ebE1C3D06CE343FD7C1AA11',
      },
      wbnb: {
        wrap: { address: '0xf361888459a4C863a8498ee344C2688C9196Be51' },
        unwrap: { address: '0x65693291C20271f5e5030261766D1D6b3AC9d44E' },
      },
      pancakeswap: {
        address: '0xAC3Ec4e420DD78bA86d932501E1f3867dbbfb77B',
        prepareTransaction: prepareUniswapTransaction
      },
      paymentWithEvent: {
        address: '0x1869E236c03eE67B9FfEd3aCA139f4AeBA79Dc21'
      },
      paymentFee: {
        address: '0xae33f10AD57A38113f74FCdc1ffA6B1eC47B94E3',
      },
      paymentFeeWithEvent: {
        address: '0xF1a05D715AaBFA380543719F7bA8754d0331c5A9'
      }
    },
    polygon: {
      payment: {
        address: '0x78C0F1c712A9AA2004C1F401A7307d8bCB62abBd'
      },
      wmatic: {
        wrap: { address: '0x8B62F604499c1204573664447D445690E0A0011b' },
        unwrap: { address: '0x2fd0a07a4F73285d0eBa8176426BF9B8c0121206' },
      },
      quickswap: {
        address: '0x0Dfb7137bC64b63F7a0de7Cb9CDa178702666220',
        prepareTransaction: prepareUniswapTransaction
      },
      paymentWithEvent: {
        address: '0xfAD2F276D464EAdB71435127BA2c2e9dDefb93a4'
      },
      paymentFee: {
        address: '0xd625c7087E940b2A91ed8bD8db45cB24D3526B56',
      },
      paymentFeeWithEvent: {
        address: '0xBC56ED8E32b64a33f64Ed7A5fF9EACdFC117e07a'
      }
    },
  };

  var plugins = {... plugins$1};

  var routers$2 = {
    ethereum: {
      address: '0xae60aC8e69414C2Dc362D0e6a03af643d1D85b92',
      api: [{"inputs":[{"internalType":"address","name":"_configuration","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"ETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"configuration","outputs":[{"internalType":"contract DePayRouterV1Configuration","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"pluginAddress","type":"address"}],"name":"isApproved","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"address[]","name":"addresses","type":"address[]"},{"internalType":"address[]","name":"plugins","type":"address[]"},{"internalType":"string[]","name":"data","type":"string[]"}],"name":"route","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]
    },
    bsc: {
      address: '0x0Dfb7137bC64b63F7a0de7Cb9CDa178702666220',
      api: [{"inputs":[{"internalType":"address","name":"_configuration","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"ETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"configuration","outputs":[{"internalType":"contract DePayRouterV1Configuration","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"pluginAddress","type":"address"}],"name":"isApproved","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"address[]","name":"addresses","type":"address[]"},{"internalType":"address[]","name":"plugins","type":"address[]"},{"internalType":"string[]","name":"data","type":"string[]"}],"name":"route","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]
    },
    polygon: {
      address: '0x2CA727BC33915823e3D05fe043d310B8c5b2dC5b',
      api: [{"inputs":[{"internalType":"address","name":"_configuration","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"ETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"configuration","outputs":[{"internalType":"contract DePayRouterV1Configuration","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"pluginAddress","type":"address"}],"name":"isApproved","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"address[]","name":"addresses","type":"address[]"},{"internalType":"address[]","name":"plugins","type":"address[]"},{"internalType":"string[]","name":"data","type":"string[]"}],"name":"route","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]
    }
  };

  var routers$1 = {
    solana: {
      address: 'DePayRG7ZySPWzeK9Kvq7aPeif7sdbBZNh6DHcvNj7F7',
      ammProgram: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
      alt: 'EYGgx5fYCZtLN2pvnR4Bhn5KpMffKwyHCms4VhjSvF2K',
      api: {
        createPaymentsAccount: {
          anchorDiscriminator: new solanaWeb3_js.BN("8445995362644372894"),
          layout: solanaWeb3_js.struct([
            solanaWeb3_js.u64("anchorDiscriminator"),
          ])
        },
        createEscrowSolAccount: {
          anchorDiscriminator: new solanaWeb3_js.BN("2482112285991870004"),
          layout: solanaWeb3_js.struct([
            solanaWeb3_js.u64("anchorDiscriminator"),
          ])
        },
        createEscrowTokenAccount: {
          anchorDiscriminator: new solanaWeb3_js.BN("16156440424245087"),
          layout: solanaWeb3_js.struct([
            solanaWeb3_js.u64("anchorDiscriminator"),
          ])
        },
        routeSol: {
          anchorDiscriminator: new solanaWeb3_js.BN("6497164560834983274"),
          layout: solanaWeb3_js.struct([
            solanaWeb3_js.u64("anchorDiscriminator"),
            solanaWeb3_js.u64("nonce"),
            solanaWeb3_js.u64("paymentAmount"),
            solanaWeb3_js.u64("feeAmount"),
          ])
        },
        routeToken: {
          anchorDiscriminator: new solanaWeb3_js.BN("13483873682232752277"),
          layout: solanaWeb3_js.struct([
            solanaWeb3_js.u64("anchorDiscriminator"),
            solanaWeb3_js.u64("nonce"),
            solanaWeb3_js.u64("paymentAmount"),
            solanaWeb3_js.u64("feeAmount"),
          ])
        },
        routeOrcaSwap: {
          anchorDiscriminator: new solanaWeb3_js.BN("9797248061404332986"),
          layout: solanaWeb3_js.struct([
            solanaWeb3_js.u64("anchorDiscriminator"),
            solanaWeb3_js.u64("nonce"),
            solanaWeb3_js.u64("amountIn"),
            solanaWeb3_js.u128("sqrtPriceLimit"),
            solanaWeb3_js.bool("amountSpecifiedIsInput"),
            solanaWeb3_js.bool("aToB"),
            solanaWeb3_js.u64("paymentAmount"),
            solanaWeb3_js.u64("feeAmount"),
          ])
        },
        routeOrcaSwapSolOut: {
          anchorDiscriminator: new solanaWeb3_js.BN("13662217913752830165"),
          layout: solanaWeb3_js.struct([
            solanaWeb3_js.u64("anchorDiscriminator"),
            solanaWeb3_js.u64("nonce"),
            solanaWeb3_js.u64("amountIn"),
            solanaWeb3_js.u128("sqrtPriceLimit"),
            solanaWeb3_js.bool("amountSpecifiedIsInput"),
            solanaWeb3_js.bool("aToB"),
            solanaWeb3_js.u64("paymentAmount"),
            solanaWeb3_js.u64("feeAmount"),
          ])
        },
        routeOrcaTwoHopSwap: {
          anchorDiscriminator: new solanaWeb3_js.BN("15695720599845325801"),
          layout: solanaWeb3_js.struct([
            solanaWeb3_js.u64("anchorDiscriminator"),
            solanaWeb3_js.u64("nonce"),
            solanaWeb3_js.u64("amountIn"),
            solanaWeb3_js.bool("amountSpecifiedIsInput"),
            solanaWeb3_js.bool("aToBOne"),
            solanaWeb3_js.bool("aToBTwo"),
            solanaWeb3_js.u128("sqrtPriceLimitOne"),
            solanaWeb3_js.u128("sqrtPriceLimitTwo"),
            solanaWeb3_js.u64("paymentAmount"),
            solanaWeb3_js.u64("feeAmount"),
          ])
        },
        routeOrcaTwoHopSwapSolOut: {
          anchorDiscriminator: new solanaWeb3_js.BN("15074061855608091530"),
          layout: solanaWeb3_js.struct([
            solanaWeb3_js.u64("anchorDiscriminator"),
            solanaWeb3_js.u64("nonce"),
            solanaWeb3_js.u64("amountIn"),
            solanaWeb3_js.bool("amountSpecifiedIsInput"),
            solanaWeb3_js.bool("aToBOne"),
            solanaWeb3_js.bool("aToBTwo"),
            solanaWeb3_js.u128("sqrtPriceLimitOne"),
            solanaWeb3_js.u128("sqrtPriceLimitTwo"),
            solanaWeb3_js.u64("paymentAmount"),
            solanaWeb3_js.u64("feeAmount"),
          ])
        }
      }
    },
  };

  var routers = {... routers$2, ...routers$1};

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
  }

  var isObject_1 = isObject;

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  /** Detect free variable `global` from Node.js. */

  var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

  var _freeGlobal = freeGlobal;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = _freeGlobal || freeSelf || Function('return this')();

  var _root = root;

  /**
   * Gets the timestamp of the number of milliseconds that have elapsed since
   * the Unix epoch (1 January 1970 00:00:00 UTC).
   *
   * @static
   * @memberOf _
   * @since 2.4.0
   * @category Date
   * @returns {number} Returns the timestamp.
   * @example
   *
   * _.defer(function(stamp) {
   *   console.log(_.now() - stamp);
   * }, _.now());
   * // => Logs the number of milliseconds it took for the deferred invocation.
   */
  var now = function() {
    return _root.Date.now();
  };

  var now_1 = now;

  /** Used to match a single whitespace character. */
  var reWhitespace = /\s/;

  /**
   * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
   * character of `string`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {number} Returns the index of the last non-whitespace character.
   */
  function trimmedEndIndex(string) {
    var index = string.length;

    while (index-- && reWhitespace.test(string.charAt(index))) {}
    return index;
  }

  var _trimmedEndIndex = trimmedEndIndex;

  /** Used to match leading whitespace. */
  var reTrimStart = /^\s+/;

  /**
   * The base implementation of `_.trim`.
   *
   * @private
   * @param {string} string The string to trim.
   * @returns {string} Returns the trimmed string.
   */
  function baseTrim(string) {
    return string
      ? string.slice(0, _trimmedEndIndex(string) + 1).replace(reTrimStart, '')
      : string;
  }

  var _baseTrim = baseTrim;

  /** Built-in value references. */
  var Symbol = _root.Symbol;

  var _Symbol = Symbol;

  /** Used for built-in method references. */
  var objectProto$1 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto$1.hasOwnProperty;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString$1 = objectProto$1.toString;

  /** Built-in value references. */
  var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag$1),
        tag = value[symToStringTag$1];

    try {
      value[symToStringTag$1] = undefined;
      var unmasked = true;
    } catch (e) {}

    var result = nativeObjectToString$1.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag$1] = tag;
      } else {
        delete value[symToStringTag$1];
      }
    }
    return result;
  }

  var _getRawTag = getRawTag;

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString = objectProto.toString;

  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */
  function objectToString(value) {
    return nativeObjectToString.call(value);
  }

  var _objectToString = objectToString;

  /** `Object#toString` result references. */
  var nullTag = '[object Null]',
      undefinedTag = '[object Undefined]';

  /** Built-in value references. */
  var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return (symToStringTag && symToStringTag in Object(value))
      ? _getRawTag(value)
      : _objectToString(value);
  }

  var _baseGetTag = baseGetTag;

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return value != null && typeof value == 'object';
  }

  var isObjectLike_1 = isObjectLike;

  /** `Object#toString` result references. */
  var symbolTag = '[object Symbol]';

  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
  function isSymbol(value) {
    return typeof value == 'symbol' ||
      (isObjectLike_1(value) && _baseGetTag(value) == symbolTag);
  }

  var isSymbol_1 = isSymbol;

  /** Used as references for various `Number` constants. */
  var NAN = 0 / 0;

  /** Used to detect bad signed hexadecimal string values. */
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

  /** Used to detect binary string values. */
  var reIsBinary = /^0b[01]+$/i;

  /** Used to detect octal string values. */
  var reIsOctal = /^0o[0-7]+$/i;

  /** Built-in method references without a dependency on `root`. */
  var freeParseInt = parseInt;

  /**
   * Converts `value` to a number.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to process.
   * @returns {number} Returns the number.
   * @example
   *
   * _.toNumber(3.2);
   * // => 3.2
   *
   * _.toNumber(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toNumber(Infinity);
   * // => Infinity
   *
   * _.toNumber('3.2');
   * // => 3.2
   */
  function toNumber(value) {
    if (typeof value == 'number') {
      return value;
    }
    if (isSymbol_1(value)) {
      return NAN;
    }
    if (isObject_1(value)) {
      var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
      value = isObject_1(other) ? (other + '') : other;
    }
    if (typeof value != 'string') {
      return value === 0 ? value : +value;
    }
    value = _baseTrim(value);
    var isBinary = reIsBinary.test(value);
    return (isBinary || reIsOctal.test(value))
      ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
      : (reIsBadHex.test(value) ? NAN : +value);
  }

  var toNumber_1 = toNumber;

  /** Error message constants. */
  var FUNC_ERROR_TEXT$1 = 'Expected a function';

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax = Math.max,
      nativeMin = Math.min;

  /**
   * Creates a debounced function that delays invoking `func` until after `wait`
   * milliseconds have elapsed since the last time the debounced function was
   * invoked. The debounced function comes with a `cancel` method to cancel
   * delayed `func` invocations and a `flush` method to immediately invoke them.
   * Provide `options` to indicate whether `func` should be invoked on the
   * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
   * with the last arguments provided to the debounced function. Subsequent
   * calls to the debounced function return the result of the last `func`
   * invocation.
   *
   * **Note:** If `leading` and `trailing` options are `true`, `func` is
   * invoked on the trailing edge of the timeout only if the debounced function
   * is invoked more than once during the `wait` timeout.
   *
   * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
   * until to the next tick, similar to `setTimeout` with a timeout of `0`.
   *
   * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
   * for details over the differences between `_.debounce` and `_.throttle`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to debounce.
   * @param {number} [wait=0] The number of milliseconds to delay.
   * @param {Object} [options={}] The options object.
   * @param {boolean} [options.leading=false]
   *  Specify invoking on the leading edge of the timeout.
   * @param {number} [options.maxWait]
   *  The maximum time `func` is allowed to be delayed before it's invoked.
   * @param {boolean} [options.trailing=true]
   *  Specify invoking on the trailing edge of the timeout.
   * @returns {Function} Returns the new debounced function.
   * @example
   *
   * // Avoid costly calculations while the window size is in flux.
   * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
   *
   * // Invoke `sendMail` when clicked, debouncing subsequent calls.
   * jQuery(element).on('click', _.debounce(sendMail, 300, {
   *   'leading': true,
   *   'trailing': false
   * }));
   *
   * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
   * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
   * var source = new EventSource('/stream');
   * jQuery(source).on('message', debounced);
   *
   * // Cancel the trailing debounced invocation.
   * jQuery(window).on('popstate', debounced.cancel);
   */
  function debounce(func, wait, options) {
    var lastArgs,
        lastThis,
        maxWait,
        result,
        timerId,
        lastCallTime,
        lastInvokeTime = 0,
        leading = false,
        maxing = false,
        trailing = true;

    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT$1);
    }
    wait = toNumber_1(wait) || 0;
    if (isObject_1(options)) {
      leading = !!options.leading;
      maxing = 'maxWait' in options;
      maxWait = maxing ? nativeMax(toNumber_1(options.maxWait) || 0, wait) : maxWait;
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }

    function invokeFunc(time) {
      var args = lastArgs,
          thisArg = lastThis;

      lastArgs = lastThis = undefined;
      lastInvokeTime = time;
      result = func.apply(thisArg, args);
      return result;
    }

    function leadingEdge(time) {
      // Reset any `maxWait` timer.
      lastInvokeTime = time;
      // Start the timer for the trailing edge.
      timerId = setTimeout(timerExpired, wait);
      // Invoke the leading edge.
      return leading ? invokeFunc(time) : result;
    }

    function remainingWait(time) {
      var timeSinceLastCall = time - lastCallTime,
          timeSinceLastInvoke = time - lastInvokeTime,
          timeWaiting = wait - timeSinceLastCall;

      return maxing
        ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
        : timeWaiting;
    }

    function shouldInvoke(time) {
      var timeSinceLastCall = time - lastCallTime,
          timeSinceLastInvoke = time - lastInvokeTime;

      // Either this is the first call, activity has stopped and we're at the
      // trailing edge, the system time has gone backwards and we're treating
      // it as the trailing edge, or we've hit the `maxWait` limit.
      return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
        (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
    }

    function timerExpired() {
      var time = now_1();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      // Restart the timer.
      timerId = setTimeout(timerExpired, remainingWait(time));
    }

    function trailingEdge(time) {
      timerId = undefined;

      // Only invoke if we have `lastArgs` which means `func` has been
      // debounced at least once.
      if (trailing && lastArgs) {
        return invokeFunc(time);
      }
      lastArgs = lastThis = undefined;
      return result;
    }

    function cancel() {
      if (timerId !== undefined) {
        clearTimeout(timerId);
      }
      lastInvokeTime = 0;
      lastArgs = lastCallTime = lastThis = timerId = undefined;
    }

    function flush() {
      return timerId === undefined ? result : trailingEdge(now_1());
    }

    function debounced() {
      var time = now_1(),
          isInvoking = shouldInvoke(time);

      lastArgs = arguments;
      lastThis = this;
      lastCallTime = time;

      if (isInvoking) {
        if (timerId === undefined) {
          return leadingEdge(lastCallTime);
        }
        if (maxing) {
          // Handle invocations in a tight loop.
          clearTimeout(timerId);
          timerId = setTimeout(timerExpired, wait);
          return invokeFunc(lastCallTime);
        }
      }
      if (timerId === undefined) {
        timerId = setTimeout(timerExpired, wait);
      }
      return result;
    }
    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced;
  }

  var debounce_1 = debounce;

  /** Error message constants. */
  var FUNC_ERROR_TEXT = 'Expected a function';

  /**
   * Creates a throttled function that only invokes `func` at most once per
   * every `wait` milliseconds. The throttled function comes with a `cancel`
   * method to cancel delayed `func` invocations and a `flush` method to
   * immediately invoke them. Provide `options` to indicate whether `func`
   * should be invoked on the leading and/or trailing edge of the `wait`
   * timeout. The `func` is invoked with the last arguments provided to the
   * throttled function. Subsequent calls to the throttled function return the
   * result of the last `func` invocation.
   *
   * **Note:** If `leading` and `trailing` options are `true`, `func` is
   * invoked on the trailing edge of the timeout only if the throttled function
   * is invoked more than once during the `wait` timeout.
   *
   * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
   * until to the next tick, similar to `setTimeout` with a timeout of `0`.
   *
   * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
   * for details over the differences between `_.throttle` and `_.debounce`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to throttle.
   * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
   * @param {Object} [options={}] The options object.
   * @param {boolean} [options.leading=true]
   *  Specify invoking on the leading edge of the timeout.
   * @param {boolean} [options.trailing=true]
   *  Specify invoking on the trailing edge of the timeout.
   * @returns {Function} Returns the new throttled function.
   * @example
   *
   * // Avoid excessively updating the position while scrolling.
   * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
   *
   * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
   * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
   * jQuery(element).on('click', throttled);
   *
   * // Cancel the trailing throttled invocation.
   * jQuery(window).on('popstate', throttled.cancel);
   */
  function throttle(func, wait, options) {
    var leading = true,
        trailing = true;

    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    if (isObject_1(options)) {
      leading = 'leading' in options ? !!options.leading : leading;
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }
    return debounce_1(func, wait, {
      'leading': leading,
      'maxWait': wait,
      'trailing': trailing
    });
  }

  var throttle_1 = throttle;

  let getTransaction$2 = async({ paymentRoute, event })=> {
    let exchangeRoute = paymentRoute.exchangeRoutes[0];

    let transaction = {
      blockchain: paymentRoute.blockchain,
      to: transactionAddress({ paymentRoute }),
      api: transactionApi({ paymentRoute }),
      method: transactionMethod({ paymentRoute }),
      params: transactionParams({ paymentRoute, exchangeRoute, event }),
      value: transactionValue({ paymentRoute, exchangeRoute })
    };

    if(exchangeRoute) {
      if(paymentRoute.exchangePlugin && paymentRoute.exchangePlugin.prepareTransaction) {
        transaction = paymentRoute.exchangePlugin.prepareTransaction(transaction);
      }
    }

    return transaction
  };

  let transactionAddress = ({ paymentRoute })=> {
    if(paymentRoute.directTransfer && !paymentRoute.fee) {
      if(paymentRoute.toToken.address == Blockchains__default["default"][paymentRoute.blockchain].currency.address) {
        return paymentRoute.toAddress
      } else {
        return paymentRoute.toToken.address
      }
    } else {
      return routers$2[paymentRoute.blockchain].address
    }
  };

  let transactionApi = ({ paymentRoute })=> {
    if(paymentRoute.directTransfer && !paymentRoute.fee) {
      if(paymentRoute.toToken.address == Blockchains__default["default"][paymentRoute.blockchain].currency.address) {
        return undefined
      } else {
        return web3Tokens.Token[paymentRoute.blockchain].DEFAULT
      }
    } else {
      return routers$2[paymentRoute.blockchain].api
    }
  };

  let transactionMethod = ({ paymentRoute })=> {
    if(paymentRoute.directTransfer && !paymentRoute.fee) {
      if(paymentRoute.toToken.address == Blockchains__default["default"][paymentRoute.blockchain].currency.address) {
        return undefined
      } else {
        return 'transfer'
      }
    } else {
      return 'route'
    }
  };

  let transactionParams = ({ paymentRoute, exchangeRoute, event })=> {
    if(paymentRoute.directTransfer && !paymentRoute.fee) {
      if(paymentRoute.toToken.address == Blockchains__default["default"][paymentRoute.blockchain].currency.address) {
        return undefined
      } else {
        return [paymentRoute.toAddress, paymentRoute.toAmount]
      }
    } else {
      return {
        path: transactionPath({ paymentRoute, exchangeRoute }),
        amounts: getTransactionAmounts({ paymentRoute, exchangeRoute }),
        addresses: transactionAddresses({ paymentRoute }),
        plugins: transactionPlugins({ paymentRoute, exchangeRoute, event }),
        data: []
      }
    }
  };

  let transactionPath = ({ paymentRoute, exchangeRoute })=> {
    if(exchangeRoute) {
      return exchangeRoute.path
    } else {
      return [paymentRoute.toToken.address]
    }
  };

  let getTransactionAmounts = ({ paymentRoute, exchangeRoute })=> {
    let amounts;
    if(exchangeRoute) {
      if(exchangeRoute && exchangeRoute.exchange.wrapper) {
        amounts = [ paymentRoute.fromAmount, paymentRoute.toAmount ];
      } else {
        amounts = [
          paymentRoute.fromAmount,
          paymentRoute.toAmount,
          Math.round(Date.now() / 1000) + 30 * 60, // 30 minutes
        ];
      }
    } else {
      amounts = [ paymentRoute.fromAmount, paymentRoute.toAmount ];
    }
    if(paymentRoute.fee){
      amounts[4] = paymentRoute.feeAmount;
    }
    for(var i = 0; i < amounts.length; i++) {
      if(amounts[i] == undefined){ amounts[i] = '0'; }
    }
    return amounts
  };

  let transactionAddresses = ({ paymentRoute })=> {
    if(paymentRoute.fee) {
      return [paymentRoute.fromAddress, paymentRoute.fee.receiver, paymentRoute.toAddress]
    } else {
      return [paymentRoute.fromAddress, paymentRoute.toAddress]
    }
  };

  let transactionPlugins = ({ paymentRoute, exchangeRoute, event })=> {
    let paymentPlugins = [];

    if(exchangeRoute) {
      paymentRoute.exchangePlugin = plugins$1[paymentRoute.blockchain][exchangeRoute.exchange.name];
      if(paymentRoute.exchangePlugin.wrap && paymentRoute.fromToken.address == Blockchains__default["default"][paymentRoute.blockchain].currency.address) {
        paymentPlugins.push(paymentRoute.exchangePlugin.wrap.address);
      } else if(paymentRoute.exchangePlugin.wrap && paymentRoute.fromToken.address == Blockchains__default["default"][paymentRoute.blockchain].wrapped.address) {
        paymentPlugins.push(paymentRoute.exchangePlugin.unwrap.address);
      } else {
        paymentPlugins.push(paymentRoute.exchangePlugin.address);
      }
    }

    if(event == 'ifSwapped' && !paymentRoute.directTransfer) {
      paymentPlugins.push(plugins$1[paymentRoute.blockchain].paymentWithEvent.address);
    } else if(event == 'ifRoutedAndNative' && !paymentRoute.directTransfer && paymentRoute.toToken.address == Blockchains__default["default"][paymentRoute.blockchain].currency.address) {
      paymentPlugins.push(plugins$1[paymentRoute.blockchain].paymentWithEvent.address);
    } else {
      paymentPlugins.push(plugins$1[paymentRoute.blockchain].payment.address);
    }

    if(paymentRoute.fee) {
      if(event == 'ifRoutedAndNative' && !paymentRoute.directTransfer && paymentRoute.toToken.address == Blockchains__default["default"][paymentRoute.blockchain].currency.address) {
        paymentPlugins.push(plugins$1[paymentRoute.blockchain].paymentFeeWithEvent.address);
      } else {
        paymentPlugins.push(plugins$1[paymentRoute.blockchain].paymentFee.address);
      }
    }

    return paymentPlugins
  };

  let transactionValue = ({ paymentRoute, exchangeRoute })=> {
    if(paymentRoute.fromToken.address == Blockchains__default["default"][paymentRoute.blockchain].currency.address) {
      if(exchangeRoute) {
        return exchangeRoute.amountIn.toString()
      } else { // direct payment
        return paymentRoute.toAmount.toString()
      }
    } else {
      return ethers.ethers.BigNumber.from('0').toString()
    }
  };

  let _window;

  let getWindow = () => {
    if(_window) { return _window }
    if (typeof global == 'object') {
      _window = global;
    } else {
      _window = window;
    }
    return _window
  };

  const getConfiguration = () =>{
    if(getWindow()._Web3ClientConfiguration === undefined) {
      getWindow()._Web3ClientConfiguration = {};
    }
    return getWindow()._Web3ClientConfiguration
  };

  const BATCH_INTERVAL$1 = 10;
  const CHUNK_SIZE$1 = 99;

  class StaticJsonRpcBatchProvider extends ethers.ethers.providers.JsonRpcProvider {

    constructor(url, network, endpoints, failover) {
      super(url);
      this._network = network;
      this._endpoint = url;
      this._endpoints = endpoints;
      this._failover = failover;
      this._pendingBatch = [];
    }

    detectNetwork() {
      return Promise.resolve(Blockchains__default["default"].findByName(this._network).id)
    }

    requestChunk(chunk, endpoint) {
      
      const request = chunk.map((inflight) => inflight.request);

      return ethers.ethers.utils.fetchJson(endpoint, JSON.stringify(request))
        .then((result) => {
          // For each result, feed it to the correct Promise, depending
          // on whether it was a success or error
          chunk.forEach((inflightRequest, index) => {
            const payload = result[index];
            if (payload.error) {
              const error = new Error(payload.error.message);
              error.code = payload.error.code;
              error.data = payload.error.data;
              inflightRequest.reject(error);
            }
            else {
              inflightRequest.resolve(payload.result);
            }
          });
        }).catch((error) => {
          if(error && error.code == 'SERVER_ERROR') {
            const index = this._endpoints.indexOf(this._endpoint)+1;
            this._failover();
            this._endpoint = index >= this._endpoints.length ? this._endpoints[0] : this._endpoints[index];
            this.requestChunk(chunk, this._endpoint);
          } else {
            chunk.forEach((inflightRequest) => {
              inflightRequest.reject(error);
            });
          }
        })
    }
      
    send(method, params) {

      const request = {
        method: method,
        params: params,
        id: (this._nextId++),
        jsonrpc: "2.0"
      };

      if (this._pendingBatch == null) {
        this._pendingBatch = [];
      }

      const inflightRequest = { request, resolve: null, reject: null };

      const promise = new Promise((resolve, reject) => {
        inflightRequest.resolve = resolve;
        inflightRequest.reject = reject;
      });

      this._pendingBatch.push(inflightRequest);

      if (!this._pendingBatchAggregator) {
        // Schedule batch for next event loop + short duration
        this._pendingBatchAggregator = setTimeout(() => {
          // Get the current batch and clear it, so new requests
          // go into the next batch
          const batch = this._pendingBatch;
          this._pendingBatch = [];
          this._pendingBatchAggregator = null;
          // Prepare Chunks of CHUNK_SIZE
          const chunks = [];
          for (let i = 0; i < Math.ceil(batch.length / CHUNK_SIZE$1); i++) {
            chunks[i] = batch.slice(i*CHUNK_SIZE$1, (i+1)*CHUNK_SIZE$1);
          }
          chunks.forEach((chunk)=>{
            // Get the request as an array of requests
            chunk.map((inflight) => inflight.request);
            return this.requestChunk(chunk, this._endpoint)
          });
        }, getConfiguration().batchInterval || BATCH_INTERVAL$1);
      }

      return promise
    }

  }

  const getAllProviders$1 = ()=> {
    if(getWindow()._Web3ClientProviders == undefined) {
      getWindow()._Web3ClientProviders = {};
    }
    return getWindow()._Web3ClientProviders
  };

  const setProvider$2 = (blockchain, provider)=> {
    if(getAllProviders$1()[blockchain] === undefined) { getAllProviders$1()[blockchain] = []; }
    const index = getAllProviders$1()[blockchain].indexOf(provider);
    if(index > -1) {
      getAllProviders$1()[blockchain].splice(index, 1);
    }
    getAllProviders$1()[blockchain].unshift(provider);
  };

  const setProviderEndpoints$2 = async (blockchain, endpoints, detectFastest = true)=> {
    
    getAllProviders$1()[blockchain] = endpoints.map((endpoint, index)=>
      new StaticJsonRpcBatchProvider(endpoint, blockchain, endpoints, ()=>{
        if(getAllProviders$1()[blockchain].length === 1) {
          setProviderEndpoints$2(blockchain, endpoints, detectFastest);
        } else {
          getAllProviders$1()[blockchain].splice(index, 1);
        }
      })
    );
    
    let provider;
    let window = getWindow();

    if(
      window.fetch == undefined ||
      (typeof process != 'undefined' && process['env'] && process['env']['NODE_ENV'] == 'test') ||
      (typeof window.cy != 'undefined') ||
      detectFastest === false
    ) {
      provider = getAllProviders$1()[blockchain][0];
    } else {
      
      let responseTimes = await Promise.all(endpoints.map((endpoint)=>{
        return new Promise(async (resolve)=>{
          let timeout = 900;
          let before = new Date().getTime();
          setTimeout(()=>resolve(timeout), timeout);
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ method: 'net_version', id: 1, jsonrpc: '2.0' })
          });
          if(!response.ok) { return resolve(999) }
          let after = new Date().getTime();
          resolve(after-before);
        })
      }));

      const fastestResponse = Math.min(...responseTimes);
      const fastestIndex = responseTimes.indexOf(fastestResponse);
      provider = getAllProviders$1()[blockchain][fastestIndex];
    }
    
    setProvider$2(blockchain, provider);
  };

  const getProvider$2 = async (blockchain)=> {

    let providers = getAllProviders$1();
    if(providers && providers[blockchain]){ return providers[blockchain][0] }
    
    let window = getWindow();
    if(window._Web3ClientGetProviderPromise && window._Web3ClientGetProviderPromise[blockchain]) { return await window._Web3ClientGetProviderPromise[blockchain] }

    if(!window._Web3ClientGetProviderPromise){ window._Web3ClientGetProviderPromise = {}; }
    window._Web3ClientGetProviderPromise[blockchain] = new Promise(async(resolve)=> {
      await setProviderEndpoints$2(blockchain, Blockchains__default["default"][blockchain].endpoints);
      resolve(getWindow()._Web3ClientProviders[blockchain][0]);
    });

    return await window._Web3ClientGetProviderPromise[blockchain]
  };

  const getProviders$2 = async(blockchain)=>{

    let providers = getAllProviders$1();
    if(providers && providers[blockchain]){ return providers[blockchain] }
    
    let window = getWindow();
    if(window._Web3ClientGetProvidersPromise && window._Web3ClientGetProvidersPromise[blockchain]) { return await window._Web3ClientGetProvidersPromise[blockchain] }

    if(!window._Web3ClientGetProvidersPromise){ window._Web3ClientGetProvidersPromise = {}; }
    window._Web3ClientGetProvidersPromise[blockchain] = new Promise(async(resolve)=> {
      await setProviderEndpoints$2(blockchain, Blockchains__default["default"][blockchain].endpoints);
      resolve(getWindow()._Web3ClientProviders[blockchain]);
    });

    return await window._Web3ClientGetProvidersPromise[blockchain]
  };

  var EVM = {
    getProvider: getProvider$2,
    getProviders: getProviders$2,
    setProviderEndpoints: setProviderEndpoints$2,
    setProvider: setProvider$2,
  };

  const BATCH_INTERVAL = 10;
  const CHUNK_SIZE = 99;

  class StaticJsonRpcSequentialProvider extends solanaWeb3_js.Connection {

    constructor(url, network, endpoints, failover) {
      super(url);
      this._provider = new solanaWeb3_js.Connection(url);
      this._network = network;
      this._endpoint = url;
      this._endpoints = endpoints;
      this._failover = failover;
      this._pendingBatch = [];
      this._rpcRequest = this._rpcRequestReplacement.bind(this);
    }

    requestChunk(chunk) {

      const batch = chunk.map((inflight) => inflight.request);

      return this._provider._rpcBatchRequest(batch)
        .then((result) => {
          // For each result, feed it to the correct Promise, depending
          // on whether it was a success or error
          chunk.forEach((inflightRequest, index) => {
            const payload = result[index];
            if (payload.error) {
              const error = new Error(payload.error.message);
              error.code = payload.error.code;
              error.data = payload.error.data;
              inflightRequest.reject(error);
            } else {
              inflightRequest.resolve(payload);
            }
          });
        }).catch((error) => {
          if(error && [
            'Failed to fetch', '504', '503', '502', '500', '429', '426', '422', '413', '409', '408', '406', '405', '404', '403', '402', '401', '400'
          ].some((errorType)=>error.toString().match(errorType))) {
            const index = this._endpoints.indexOf(this._endpoint)+1;
            this._endpoint = index >= this._endpoints.length ? this._endpoints[0] : this._endpoints[index];
            this._provider = new solanaWeb3_js.Connection(this._endpoint);
            this.requestChunk(chunk);
          } else {
            chunk.forEach((inflightRequest) => {
              inflightRequest.reject(error);
            });
          }
        })
    }
      
    _rpcRequestReplacement(methodName, args) {

      const request = { methodName, args };

      if (this._pendingBatch == null) {
        this._pendingBatch = [];
      }

      const inflightRequest = { request, resolve: null, reject: null };

      const promise = new Promise((resolve, reject) => {
        inflightRequest.resolve = resolve;
        inflightRequest.reject = reject;
      });

      this._pendingBatch.push(inflightRequest);

      if (!this._pendingBatchAggregator) {
        // Schedule batch for next event loop + short duration
        this._pendingBatchAggregator = setTimeout(() => {
          // Get the current batch and clear it, so new requests
          // go into the next batch
          const batch = this._pendingBatch;
          this._pendingBatch = [];
          this._pendingBatchAggregator = null;
          // Prepare Chunks of CHUNK_SIZE
          const chunks = [];
          for (let i = 0; i < Math.ceil(batch.length / CHUNK_SIZE); i++) {
            chunks[i] = batch.slice(i*CHUNK_SIZE, (i+1)*CHUNK_SIZE);
          }
          chunks.forEach((chunk)=>{
            // Get the request as an array of requests
            chunk.map((inflight) => inflight.request);
            return this.requestChunk(chunk)
          });
        }, getConfiguration().batchInterval || BATCH_INTERVAL);
      }

      return promise
    }
  }

  const getAllProviders = ()=> {
    if(getWindow()._Web3ClientProviders == undefined) {
      getWindow()._Web3ClientProviders = {};
    }
    return getWindow()._Web3ClientProviders
  };

  const setProvider$1 = (blockchain, provider)=> {
    if(getAllProviders()[blockchain] === undefined) { getAllProviders()[blockchain] = []; }
    const index = getAllProviders()[blockchain].indexOf(provider);
    if(index > -1) {
      getAllProviders()[blockchain].splice(index, 1);
    }
    getAllProviders()[blockchain].unshift(provider);
  };

  const setProviderEndpoints$1 = async (blockchain, endpoints, detectFastest = true)=> {
    
    getAllProviders()[blockchain] = endpoints.map((endpoint, index)=>
      new StaticJsonRpcSequentialProvider(endpoint, blockchain, endpoints, ()=>{
        if(getAllProviders()[blockchain].length === 1) {
          setProviderEndpoints$1(blockchain, endpoints, detectFastest);
        } else {
          getAllProviders()[blockchain].splice(index, 1);
        }
      })
    );

    let provider;
    let window = getWindow();

    if(
      window.fetch == undefined ||
      (typeof process != 'undefined' && process['env'] && process['env']['NODE_ENV'] == 'test') ||
      (typeof window.cy != 'undefined') ||
      detectFastest === false
    ) {
      provider = getAllProviders()[blockchain][0];
    } else {
      
      let responseTimes = await Promise.all(endpoints.map((endpoint)=>{
        return new Promise(async (resolve)=>{
          let timeout = 900;
          let before = new Date().getTime();
          setTimeout(()=>resolve(timeout), timeout);
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ method: 'getIdentity', id: 1, jsonrpc: '2.0' })
          });
          if(!response.ok) { return resolve(999) }
          let after = new Date().getTime();
          resolve(after-before);
        })
      }));

      const fastestResponse = Math.min(...responseTimes);
      const fastestIndex = responseTimes.indexOf(fastestResponse);
      provider = getAllProviders()[blockchain][fastestIndex];
    }
    
    setProvider$1(blockchain, provider);
  };

  const getProvider$1 = async (blockchain)=> {

    let providers = getAllProviders();
    if(providers && providers[blockchain]){ return providers[blockchain][0] }
    
    let window = getWindow();
    if(window._Web3ClientGetProviderPromise && window._Web3ClientGetProviderPromise[blockchain]) { return await window._Web3ClientGetProviderPromise[blockchain] }

    if(!window._Web3ClientGetProviderPromise){ window._Web3ClientGetProviderPromise = {}; }
    window._Web3ClientGetProviderPromise[blockchain] = new Promise(async(resolve)=> {
      await setProviderEndpoints$1(blockchain, Blockchains__default["default"][blockchain].endpoints);
      resolve(getWindow()._Web3ClientProviders[blockchain][0]);
    });

    return await window._Web3ClientGetProviderPromise[blockchain]
  };

  const getProviders$1 = async(blockchain)=>{

    let providers = getAllProviders();
    if(providers && providers[blockchain]){ return providers[blockchain] }
    
    let window = getWindow();
    if(window._Web3ClientGetProvidersPromise && window._Web3ClientGetProvidersPromise[blockchain]) { return await window._Web3ClientGetProvidersPromise[blockchain] }

    if(!window._Web3ClientGetProvidersPromise){ window._Web3ClientGetProvidersPromise = {}; }
    window._Web3ClientGetProvidersPromise[blockchain] = new Promise(async(resolve)=> {
      await setProviderEndpoints$1(blockchain, Blockchains__default["default"][blockchain].endpoints);
      resolve(getWindow()._Web3ClientProviders[blockchain]);
    });

    return await window._Web3ClientGetProvidersPromise[blockchain]
  };

  var Solana = {
    getProvider: getProvider$1,
    getProviders: getProviders$1,
    setProviderEndpoints: setProviderEndpoints$1,
    setProvider: setProvider$1,
  };

  let supported$1 = ['ethereum', 'bsc', 'polygon', 'solana', 'fantom', 'velas'];
  supported$1.evm = ['ethereum', 'bsc', 'polygon', 'fantom', 'velas'];
  supported$1.solana = ['solana'];

  function _optionalChain$1(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
  let getCacheStore = () => {
    if (getWindow()._Web3ClientCacheStore == undefined) {
      getWindow()._Web3ClientCacheStore = {};
    }
    return getWindow()._Web3ClientCacheStore
  };

  let getPromiseStore = () => {
    if (getWindow()._Web3ClientPromiseStore == undefined) {
      getWindow()._Web3ClientPromiseStore = {};
    }
    return getWindow()._Web3ClientPromiseStore
  };

  let set = function ({ key, value, expires }) {
    getCacheStore()[key] = {
      expiresAt: Date.now() + expires,
      value,
    };
  };

  let get = function ({ key, expires }) {
    let cachedEntry = getCacheStore()[key];
    if (_optionalChain$1([cachedEntry, 'optionalAccess', _ => _.expiresAt]) > Date.now()) {
      return cachedEntry.value
    }
  };

  let getPromise = function({ key }) {
    return getPromiseStore()[key]
  };

  let setPromise = function({ key, promise }) {
    getPromiseStore()[key] = promise;
    return promise
  };

  let deletePromise = function({ key }) {
    getPromiseStore()[key] = undefined; 
  };

  let cache = function ({ call, key, expires = 0 }) {
    return new Promise((resolve, reject)=>{
      let value;
      key = JSON.stringify(key);
      
      // get existing promise (of a previous pending request asking for the exact same thing)
      let existingPromise = getPromise({ key });
      if(existingPromise) { 
        return existingPromise
          .then(resolve)
          .catch(reject)
      }

      setPromise({ key, promise: new Promise((resolveQueue, rejectQueue)=>{
        if (expires === 0) {
          return call()
            .then((value)=>{
              resolve(value);
              resolveQueue(value);
            })
            .catch((error)=>{
              reject(error);
              rejectQueue(error);
            })
        }
        
        // get cached value
        value = get({ key, expires });
        if (value) {
          resolve(value);
          resolveQueue(value);
          return value
        }

        // set new cache value
        call()
          .then((value)=>{
            if (value) {
              set({ key, value, expires });
            }
            resolve(value);
            resolveQueue(value);
          })
          .catch((error)=>{
            reject(error);
            rejectQueue(error);
          });
        })
      }).then(()=>{
        deletePromise({ key });
      }).catch(()=>{
        deletePromise({ key });
      });
    })
  };

  const getProvider = async (blockchain)=>{

    if(supported$1.evm.includes(blockchain)) {


      return await EVM.getProvider(blockchain)


    } else if(supported$1.solana.includes(blockchain)) {


      return await Solana.getProvider(blockchain)


    } else {
      throw 'Unknown blockchain: ' + blockchain
    }
  };

  let paramsToContractArgs = ({ contract, method, params }) => {
    let fragment = contract.interface.fragments.find((fragment) => {
      return fragment.name == method
    });

    return fragment.inputs.map((input, index) => {
      if (Array.isArray(params)) {
        return params[index]
      } else {
        return params[input.name]
      }
    })
  };

  const contractCall = ({ address, api, method, params, provider, block }) => {
    let contract = new ethers.ethers.Contract(address, api, provider);
    let args = paramsToContractArgs({ contract, method, params });
    return contract[method](...args, { blockTag: block })
  };

  const balance$1 = ({ address, provider }) => {
    return provider.getBalance(address)
  };

  const transactionCount = ({ address, provider }) => {
    return provider.getTransactionCount(address)
  };

  const singleRequest$1 = ({ blockchain, address, api, method, params, block, provider }) =>{
    if (api) {
      return contractCall({ address, api, method, params, provider, block })
    } else if (method === 'latestBlockNumber') {
      return provider.getBlockNumber()
    } else if (method === 'balance') {
      return balance$1({ address, provider })
    } else if (method === 'transactionCount') {
      return transactionCount({ address, provider })
    }
  };

  var requestEVM = async ({ blockchain, address, api, method, params, block, timeout, strategy }) => {

    strategy = strategy ? strategy : (getConfiguration().strategy || 'failover');
    timeout = timeout ? timeout : (getConfiguration().timeout || undefined);

    if(strategy === 'fastest') {

      return Promise.race((await EVM.getProviders(blockchain)).map((provider)=>{

        const request = singleRequest$1({ blockchain, address, api, method, params, block, provider });
      
        if(timeout) {
          const timeoutPromise = new Promise((_, reject)=>setTimeout(()=>{ reject(new Error("Web3ClientTimeout")); }, timeout));
          return Promise.race([request, timeoutPromise])
        } else {
          return request
        }
      }))

    } else { // failover

      const provider = await EVM.getProvider(blockchain);
      const request = singleRequest$1({ blockchain, address, api, method, params, block, provider });
      
      if(timeout) {
        timeout = new Promise((_, reject)=>setTimeout(()=>{ reject(new Error("Web3ClientTimeout")); }, timeout));
        return Promise.race([request, timeout])
      } else {
        return request
      }
    }
  };

  const accountInfo = async ({ address, api, method, params, provider, block }) => {
    const info = await provider.getAccountInfo(new solanaWeb3_js.PublicKey(address));
    if(!info || !info.data) { return }
    return api.decode(info.data)
  };

  const balance = ({ address, provider }) => {
    return provider.getBalance(new solanaWeb3_js.PublicKey(address))
  };

  const singleRequest = async({ blockchain, address, api, method, params, block, provider, providers })=> {

    try {

      if(method == undefined || method === 'getAccountInfo') {
        if(api == undefined) {
          api = solanaWeb3_js.ACCOUNT_LAYOUT; 
        }
        return await accountInfo({ address, api, method, params, provider, block })
      } else if(method === 'getProgramAccounts') {
        return await provider.getProgramAccounts(new solanaWeb3_js.PublicKey(address), params).then((accounts)=>{
          if(api){
            return accounts.map((account)=>{
              account.data = api.decode(account.account.data);
              return account
            })
          } else {
            return accounts
          }
        })
      } else if(method === 'getTokenAccountBalance') {
        return await provider.getTokenAccountBalance(new solanaWeb3_js.PublicKey(address))
      } else if (method === 'latestBlockNumber') {
        return await provider.getBlockHeight()  
      } else if (method === 'balance') {
        return await balance({ address, provider })
      }

    } catch (error){
      if(providers && error && [
        'Failed to fetch', '504', '503', '502', '500', '429', '426', '422', '413', '409', '408', '406', '405', '404', '403', '402', '401', '400'
      ].some((errorType)=>error.toString().match(errorType))) {
        let nextProvider = providers[providers.indexOf(provider)+1] || providers[0];
        return singleRequest({ blockchain, address, api, method, params, block, provider: nextProvider, providers })
      } else {
        throw error
      }
    }
  };

  var requestSolana = async ({ blockchain, address, api, method, params, block, timeout, strategy }) => {

    strategy = strategy ? strategy : (getConfiguration().strategy || 'failover');
    timeout = timeout ? timeout : (getConfiguration().timeout || undefined);

    const providers = await Solana.getProviders(blockchain);

    if(strategy === 'fastest') {

      return Promise.race(providers.map((provider)=>{

        const succeedingRequest = new Promise((resolve)=>{
          singleRequest({ blockchain, address, api, method, params, block, provider }).then(resolve);
        }); // failing requests are ignored during race/fastest
      
        const timeoutPromise = new Promise((_, reject)=>setTimeout(()=>{ reject(new Error("Web3ClientTimeout")); }, timeout || 10000));
          
        return Promise.race([succeedingRequest, timeoutPromise])
      }))
      
    } else { // failover

      const provider = await Solana.getProvider(blockchain);
      const request = singleRequest({ blockchain, address, api, method, params, block, provider, providers });

      if(timeout) {
        timeout = new Promise((_, reject)=>setTimeout(()=>{ reject(new Error("Web3ClientTimeout")); }, timeout));
        return Promise.race([request, timeout])
      } else {
        return request
      }
    }
  };

  var parseUrl = (url) => {
    if (typeof url == 'object') {
      return url
    }
    let deconstructed = url.match(/(?<blockchain>\w+):\/\/(?<part1>[\w\d]+)(\/(?<part2>[\w\d]+)*)?/);

    if(deconstructed.groups.part2 == undefined) {
      if(deconstructed.groups.part1.match(/\d/)) {
        return {
          blockchain: deconstructed.groups.blockchain,
          address: deconstructed.groups.part1
        }
      } else {
        return {
          blockchain: deconstructed.groups.blockchain,
          method: deconstructed.groups.part1
        }
      }
    } else {
      return {
        blockchain: deconstructed.groups.blockchain,
        address: deconstructed.groups.part1,
        method: deconstructed.groups.part2
      }
    }
  };

  const request = async function (url, options) {
    
    const { blockchain, address, method } = parseUrl(url);
    const { api, params, cache: cache$1, block, timeout, strategy } = (typeof(url) == 'object' ? url : options) || {};

    return await cache({
      expires: cache$1 || 0,
      key: [blockchain, address, method, params, block],
      call: async()=>{
        if(supported$1.evm.includes(blockchain)) {


          return await requestEVM({ blockchain, address, api, method, params, block, strategy, timeout })


        } else if(supported$1.solana.includes(blockchain)) {


          return await requestSolana({ blockchain, address, api, method, params, block, strategy, timeout })


        } else {
          throw 'Unknown blockchain: ' + blockchain
        }  
      }
    })
  };

  const getWSolSenderAccountKeypairIfNeeded = async ({ paymentRoute })=> {

    if(
      paymentRoute.fromToken.address === Blockchains__default["default"].solana.currency.address &&
      paymentRoute.toToken.address !== Blockchains__default["default"].solana.currency.address
    ){
      return solanaWeb3_js.Keypair.generate()
    }
  };

  const getWSolEscrowAccountKeypairIfNeeded = async ({ paymentRoute })=> {

    if(
      paymentRoute.fromToken.address !== Blockchains__default["default"].solana.currency.address &&
      paymentRoute.toToken.address === Blockchains__default["default"].solana.currency.address
    ){
      return solanaWeb3_js.Keypair.generate()
    }
  };

  const createWSolSenderAccount = async ({ wSolSenderAccountKeypair, paymentRoute })=>{

    if(!wSolSenderAccountKeypair) {
      return
    }

    const wSolStartAmount = paymentRoute.fromToken.address === Blockchains__default["default"].solana.currency.address ? new solanaWeb3_js.BN(paymentRoute.fromAmount) : new solanaWeb3_js.BN('0');
    const provider = await getProvider('solana');
    const rent = new solanaWeb3_js.BN(await provider.getMinimumBalanceForRentExemption(web3Tokens.Token.solana.TOKEN_LAYOUT.span));
    const owner = paymentRoute.fromAddress;
    const lamports = wSolStartAmount.add(rent);

    const createAccountInstruction = solanaWeb3_js.SystemProgram.createAccount({
      fromPubkey: new solanaWeb3_js.PublicKey(owner),
      newAccountPubkey: wSolSenderAccountKeypair.publicKey,
      programId: new solanaWeb3_js.PublicKey(web3Tokens.Token.solana.TOKEN_PROGRAM),
      space: web3Tokens.Token.solana.TOKEN_LAYOUT.span,
      lamports
    });

    const initializeAccountInstruction = web3Tokens.Token.solana.initializeAccountInstruction({
      account: wSolSenderAccountKeypair.publicKey.toString(),
      token: Blockchains__default["default"].solana.wrapped.address,
      owner
    });

    return [
      createAccountInstruction,
      initializeAccountInstruction
    ]
  };

  const createEscrowOutWSolAccount = async ({ wSolEscrowAccountKeypair, paymentRoute })=>{

    if(!wSolEscrowAccountKeypair) {
      return
    }

    const provider = await getProvider('solana');
    const rent = new solanaWeb3_js.BN(await provider.getMinimumBalanceForRentExemption(web3Tokens.Token.solana.TOKEN_LAYOUT.span));
    const owner = await getEscrowSolAccountPublicKey();

    const createAccountInstruction = solanaWeb3_js.SystemProgram.createAccount({
      fromPubkey: new solanaWeb3_js.PublicKey(paymentRoute.fromAddress),
      newAccountPubkey: wSolEscrowAccountKeypair.publicKey,
      programId: new solanaWeb3_js.PublicKey(web3Tokens.Token.solana.TOKEN_PROGRAM),
      space: web3Tokens.Token.solana.TOKEN_LAYOUT.span,
      lamports: rent
    });

    const initializeAccountInstruction = web3Tokens.Token.solana.initializeAccountInstruction({
      account: wSolEscrowAccountKeypair.publicKey.toString(),
      token: Blockchains__default["default"].solana.wrapped.address,
      owner: owner.toString()
    });

    return [
      createAccountInstruction,
      initializeAccountInstruction
    ]
  };

  const getMiddleToken = ({ paymentRoute })=>{
    let path = [...paymentRoute.exchangeRoutes[0].path];
    if(path.indexOf(Blockchains__default["default"].solana.currency.address) > -1) { path.splice(path.indexOf(Blockchains__default["default"].solana.currency.address), 1); }
    if(path.indexOf(paymentRoute.fromToken.address) > -1) { path.splice(path.indexOf(paymentRoute.fromToken.address), 1); }
    if(path.indexOf(paymentRoute.toToken.address) > -1) { path.splice(path.indexOf(paymentRoute.toToken.address), 1); }

    if(path.length === 2 && path[0] === Blockchains__default["default"].solana.wrapped.address) {
      return path[1]
    } else { 
      return path[0]
    }
  };

  const getMiddleTokenAccountAddress = async ({ paymentRoute })=>{

    return await web3Tokens.Token.solana.findProgramAddress({
      token: getMiddleToken({ paymentRoute }),
      owner: paymentRoute.fromAddress
    })
  };

  const getMiddleTokenAccount = async ({ paymentRoute })=> {

    return await request({
      blockchain: 'solana',
      address: await getMiddleTokenAccountAddress({ paymentRoute }),
      api: web3Tokens.Token.solana.TOKEN_LAYOUT,
      cache: 1000
    })
  };

  const createTokenMiddleAccount = async ({ paymentRoute })=>{

    if(
      paymentRoute.exchangeRoutes.length === 0 ||
      getFixedPath(paymentRoute.exchangeRoutes[0].path).length <= 2
    ) {
      return
    }

    const middleTokenAccount = await getMiddleTokenAccount({ paymentRoute });
    if(middleTokenAccount) {
      return
    }

    return web3Tokens.Token.solana.createAssociatedTokenAccountInstruction({
      token: getMiddleToken({ paymentRoute }),
      owner: paymentRoute.fromAddress,
      payer: paymentRoute.fromAddress,
    })
  };

  const closeWSolSenderAccount = async ({ wSolSenderAccountKeypair, paymentRoute })=>{

    if(!wSolSenderAccountKeypair) {
      return
    }
    
    return web3Tokens.Token.solana.closeAccountInstruction({
      account: wSolSenderAccountKeypair.publicKey.toString(),
      owner: paymentRoute.fromAddress
    })
  };

  const getPaymentsAccountAddress = async({ from })=>{
    let seeds = [solanaWeb3_js.Buffer.from("payments"), new solanaWeb3_js.PublicKey(from).toBuffer()];

    let [ pdaPublicKey ] = await solanaWeb3_js.PublicKey.findProgramAddress(
      seeds, new solanaWeb3_js.PublicKey(routers$1.solana.address)
    );

    return pdaPublicKey
  };

  const getPaymentsAccountData = async({ from })=>{
    let address = (await getPaymentsAccountAddress({ from })).toString();
    return await request({
      blockchain: 'solana',
      address,
      api: solanaWeb3_js.struct([solanaWeb3_js.u64('anchorDiscriminator'), solanaWeb3_js.u64('nonce')]),
      cache: 1000
    })
  };

  const createPaymentsAccount = async({ from })=> {

    let paymentsAccountData = await getPaymentsAccountData({ from });
    if(paymentsAccountData) { 
      return
    }
    
    const keys = [
      { pubkey: solanaWeb3_js.SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: new solanaWeb3_js.PublicKey(from), isSigner: true, isWritable: true },
      { pubkey: await getPaymentsAccountAddress({ from }), isSigner: false, isWritable: true },
    ];

    const data = solanaWeb3_js.Buffer.alloc(routers$1.solana.api.createPaymentsAccount.layout.span);
    routers$1.solana.api.createPaymentsAccount.layout.encode({
      anchorDiscriminator: routers$1.solana.api.createPaymentsAccount.anchorDiscriminator
    }, data);
    
    return new solanaWeb3_js.TransactionInstruction({ 
      keys,
      programId: new solanaWeb3_js.PublicKey(routers$1.solana.address),
      data
    })
  };

  const getPaymentSenderTokenAccountAddress = async ({ paymentRoute })=> {

    return await web3Tokens.Token.solana.findProgramAddress({
      token: paymentRoute.fromToken.address,
      owner: paymentRoute.fromAddress
    })
  };

  const getPaymentReceiverTokenAccountAddress = async ({ paymentRoute })=> {

    return await web3Tokens.Token.solana.findProgramAddress({
      token: paymentRoute.toToken.address,
      owner: paymentRoute.toAddress
    })
  };

  const getPaymentReceiverTokenAccount = async ({ paymentRoute })=> {

    return await web3Tokens.Token.solana.findAccount({
      token: paymentRoute.toToken.address,
      owner: paymentRoute.toAddress
    })  
  };

  const createPaymentReceiverAccount = async({ paymentRoute })=> {
    
    if(paymentRoute.toToken.address === Blockchains__default["default"].solana.currency.address) {

      const paymentReceiverBalance = await request({ blockchain: 'solana', method: 'balance', address: paymentRoute.toAddress });
      const provider = await getProvider('solana');
      const rent = new solanaWeb3_js.BN(await provider.getMinimumBalanceForRentExemption(0));
      const paymentAmount = new solanaWeb3_js.BN(paymentRoute.toAmount);

      if(new solanaWeb3_js.BN(paymentReceiverBalance).add(paymentAmount).gt(rent)) {
        return
      }
      
      return solanaWeb3_js.SystemProgram.transfer({
        fromPubkey: new solanaWeb3_js.PublicKey(paymentRoute.fromAddress),
        toPubkey: new solanaWeb3_js.PublicKey(paymentRoute.toAddress),
        lamports: rent.sub(paymentAmount)
      })
    
    } else {

      const token = paymentRoute.toToken.address === Blockchains__default["default"].solana.currency.address ? Blockchains__default["default"].solana.wrapped.address : paymentRoute.toToken.address;

      const paymentReceiverTokenAccount = await getPaymentReceiverTokenAccount({ paymentRoute });
      if(paymentReceiverTokenAccount) {
        return
      }

      return web3Tokens.Token.solana.createAssociatedTokenAccountInstruction({
        token,
        owner: paymentRoute.toAddress,
        payer: paymentRoute.fromAddress,
      })
    }
  };

  const getFeeReceiverTokenAccountAddress = async ({ paymentRoute })=> {

    return await web3Tokens.Token.solana.findProgramAddress({
      token: paymentRoute.toToken.address,
      owner: paymentRoute.fee.receiver
    })  
  };

  const getFeeReceiverTokenAccount = async ({ paymentRoute })=> {

    return await web3Tokens.Token.solana.findAccount({
      token: paymentRoute.toToken.address,
      owner: paymentRoute.fee.receiver
    })
  };

  const createFeeReceiverAccount = async({ paymentRoute })=> {
    
    if(!paymentRoute.fee) {
      return
    }
    
    if(paymentRoute.toToken.address === Blockchains__default["default"].solana.currency.address) {

      const feeReceiverBalance = await request({ blockchain: 'solana', method: 'balance', address: paymentRoute.fee.receiver });
      const provider = await getProvider('solana');
      const rent = new solanaWeb3_js.BN(await provider.getMinimumBalanceForRentExemption(0));
      const feeAmount = new solanaWeb3_js.BN(paymentRoute.feeAmount);

      if(new solanaWeb3_js.BN(feeReceiverBalance).add(feeAmount).gt(rent)) {
        return
      }
      
      return solanaWeb3_js.SystemProgram.transfer({
        fromPubkey: new solanaWeb3_js.PublicKey(paymentRoute.fromAddress),
        toPubkey: new solanaWeb3_js.PublicKey(paymentRoute.fee.receiver),
        lamports: rent.sub(feeAmount)
      })
    
    } else {

      const token = paymentRoute.toToken.address === Blockchains__default["default"].solana.currency.address ? Blockchains__default["default"].solana.wrapped.address : paymentRoute.toToken.address;

      const feeReceiverTokenAccount = await getFeeReceiverTokenAccount({ paymentRoute });
      if(feeReceiverTokenAccount) {
        return
      }


      return web3Tokens.Token.solana.createAssociatedTokenAccountInstruction({
        token,
        owner: paymentRoute.fee.receiver,
        payer: paymentRoute.fromAddress,
      })
    }
  };

  const getEscrowSolAccountPublicKey = async()=>{

    let seeds = [solanaWeb3_js.Buffer.from("escrow_sol")];
    
    let [ pdaPublicKey, bump ] = await solanaWeb3_js.PublicKey.findProgramAddress(
      seeds, new solanaWeb3_js.PublicKey(routers$1.solana.address)
    );

    return pdaPublicKey
  };

  const getEscrowAccountPublicKey = async({ paymentRoute })=>{

    let seeds = [
      solanaWeb3_js.Buffer.from("escrow"),
      new solanaWeb3_js.PublicKey(paymentRoute.toToken.address === Blockchains__default["default"].solana.currency.address ? Blockchains__default["default"].solana.wrapped.address : paymentRoute.toToken.address).toBuffer()
    ];
    
    let [ pdaPublicKey, bump ] = await solanaWeb3_js.PublicKey.findProgramAddress(
      seeds, new solanaWeb3_js.PublicKey(routers$1.solana.address)
    );

    return pdaPublicKey
  };

  const getEscrowAccountData = async({ paymentRoute })=>{
    return await request({
      blockchain: 'solana',
      address: (await getEscrowAccountPublicKey({ paymentRoute })).toString(),
      api: web3Tokens.Token.solana.TOKEN_LAYOUT,
      cache: 1000
    })
  };

  const createEscrowOutTokenAccount = async({ paymentRoute })=> {

    if(paymentRoute.exchangeRoutes.length === 0) {
      return
    }

    const escrowAccount = await getEscrowAccountData({ paymentRoute });

    if(escrowAccount) {
      return
    }

    const keys = [
      { pubkey: solanaWeb3_js.SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: new solanaWeb3_js.PublicKey(web3Tokens.Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
      { pubkey: new solanaWeb3_js.PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
      { pubkey: new solanaWeb3_js.PublicKey(paymentRoute.toToken.address === Blockchains__default["default"].solana.currency.address ? Blockchains__default["default"].solana.wrapped.address : paymentRoute.toToken.address), isSigner: false, isWritable: true },
      { pubkey: await getEscrowAccountPublicKey({ paymentRoute }), isSigner: false, isWritable: true },
    ];

    const data = solanaWeb3_js.Buffer.alloc(routers$1.solana.api.createEscrowTokenAccount.layout.span);
    routers$1.solana.api.createEscrowTokenAccount.layout.encode({
      anchorDiscriminator: routers$1.solana.api.createEscrowTokenAccount.anchorDiscriminator
    }, data);
    
    return new solanaWeb3_js.TransactionInstruction({
      keys,
      programId: new solanaWeb3_js.PublicKey(routers$1.solana.address),
      data
    })
  };

  const createEscrowOutSolAccount = async({ paymentRoute })=> {

    if(
      paymentRoute.exchangeRoutes.length === 0 ||
      paymentRoute.toToken.address != Blockchains__default["default"].solana.currency.address
    ) {
      return
    }

    const escrowAccount = await getEscrowAccountData({ paymentRoute });

    if(escrowAccount) {
      return
    }

    const keys = [
      { pubkey: solanaWeb3_js.SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: new solanaWeb3_js.PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
      { pubkey: await getEscrowSolAccountPublicKey(), isSigner: false, isWritable: true },
    ];

    const data = solanaWeb3_js.Buffer.alloc(routers$1.solana.api.createEscrowSolAccount.layout.span);
    routers$1.solana.api.createEscrowSolAccount.layout.encode({
      anchorDiscriminator: routers$1.solana.api.createEscrowSolAccount.anchorDiscriminator
    }, data);
    
    return new solanaWeb3_js.TransactionInstruction({ 
      keys,
      programId: new solanaWeb3_js.PublicKey(routers$1.solana.address),
      data
    })
  };

  const getFixedPath = (path)=> path.filter((step)=>step!==Blockchains__default["default"].solana.currency.address);

  const getPaymentMethod = ({ paymentRoute })=>{

    if(
      paymentRoute.fromToken.address === Blockchains__default["default"].solana.currency.address &&
      paymentRoute.toToken.address === Blockchains__default["default"].solana.currency.address
    ){

      return 'routeSol'

    } else if (
      paymentRoute.fromToken.address !== Blockchains__default["default"].solana.currency.address &&
      paymentRoute.toToken.address !== Blockchains__default["default"].solana.currency.address &&
      paymentRoute.exchangeRoutes.length === 0
    ) {

      return 'routeToken'

    } else if (
      paymentRoute.exchangeRoutes.length > 0 &&
      getFixedPath(paymentRoute.exchangeRoutes[0].path).length === 2
    ) {

      if(paymentRoute.toToken.address === Blockchains__default["default"].solana.currency.address) {

        return 'routeOrcaSwapSolOut'

      } else {

        return 'routeOrcaSwap'

      }

    } else if (
      paymentRoute.exchangeRoutes.length > 0 &&
      getFixedPath(paymentRoute.exchangeRoutes[0].path).length > 2
    ) {

      if(paymentRoute.toToken.address === Blockchains__default["default"].solana.currency.address) {

        return 'routeOrcaTwoHopSwapSolOut'

      } else {

        return 'routeOrcaTwoHopSwap'

      }

    } else {

      throw 'Payment method does not exist!'

    }
  };

  const routeSol = async({ paymentRoute, paymentsAccountData }) =>{

    const paymentReceiverPublicKey = new solanaWeb3_js.PublicKey(paymentRoute.toAddress);
    const feeReceiverPublicKey = paymentRoute.fee ? new solanaWeb3_js.PublicKey(paymentRoute.fee.receiver) : paymentReceiverPublicKey;

    const keys = [
      { pubkey: solanaWeb3_js.SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: new solanaWeb3_js.PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
      { pubkey: await getPaymentsAccountAddress({ from: paymentRoute.fromAddress }), isSigner: false, isWritable: true },
      { pubkey: paymentReceiverPublicKey, isSigner: false, isWritable: true },
      { pubkey: feeReceiverPublicKey, isSigner: false, isWritable: true },
    ];

    const data = solanaWeb3_js.Buffer.alloc(routers$1.solana.api.routeSol.layout.span);
    routers$1.solana.api.routeSol.layout.encode({
      anchorDiscriminator: routers$1.solana.api.routeSol.anchorDiscriminator,
      nonce: paymentsAccountData ? paymentsAccountData.nonce : new solanaWeb3_js.BN('0'),
      paymentAmount: new solanaWeb3_js.BN(paymentRoute.toAmount.toString()),
      feeAmount: new solanaWeb3_js.BN((paymentRoute.feeAmount || '0').toString())
    }, data);
    
    return new solanaWeb3_js.TransactionInstruction({
      keys,
      programId: new solanaWeb3_js.PublicKey(routers$1.solana.address),
      data
    })
  };

  const routeToken = async({ paymentRoute, paymentsAccountData }) =>{

    const senderTokenAccountAddress = await getPaymentSenderTokenAccountAddress({ paymentRoute });
    const paymentReceiverTokenAccountAddress = await getPaymentReceiverTokenAccountAddress({ paymentRoute });
    const feeReceiverTokenAccountAddress = paymentRoute.fee ? await getFeeReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress;

    const keys = [
      { pubkey: new solanaWeb3_js.PublicKey(web3Tokens.Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
      { pubkey: new solanaWeb3_js.PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
      { pubkey: await getPaymentsAccountAddress({ from: paymentRoute.fromAddress }), isSigner: false, isWritable: true },
      { pubkey: new solanaWeb3_js.PublicKey(senderTokenAccountAddress), isSigner: false, isWritable: true },
      { pubkey: new solanaWeb3_js.PublicKey(paymentReceiverTokenAccountAddress), isSigner: false, isWritable: true },
      { pubkey: new solanaWeb3_js.PublicKey(feeReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    ];

    const data = solanaWeb3_js.Buffer.alloc(routers$1.solana.api.routeToken.layout.span);
    routers$1.solana.api.routeToken.layout.encode({
      anchorDiscriminator: routers$1.solana.api.routeToken.anchorDiscriminator,
      nonce: paymentsAccountData ? paymentsAccountData.nonce : new solanaWeb3_js.BN('0'),
      paymentAmount: new solanaWeb3_js.BN(paymentRoute.toAmount.toString()),
      feeAmount: new solanaWeb3_js.BN((paymentRoute.feeAmount || '0').toString())
    }, data);
    
    return new solanaWeb3_js.TransactionInstruction({ 
      keys,
      programId: new solanaWeb3_js.PublicKey(routers$1.solana.address),
      data 
    })    
  };

  const routeOrcaSwap = async({ paymentRoute, paymentsAccountData, wSolSenderAccountKeypair }) =>{

    const senderTokenAccountAddress = wSolSenderAccountKeypair ? wSolSenderAccountKeypair.publicKey : await getPaymentSenderTokenAccountAddress({ paymentRoute });
    const paymentReceiverTokenAccountAddress = await getPaymentReceiverTokenAccountAddress({ paymentRoute });
    const feeReceiverTokenAccountAddress = paymentRoute.fee ? await getFeeReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress;
    const escrowOutPublicKey = await getEscrowAccountPublicKey({ paymentRoute });
    const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ from: paymentRoute.fromAddress });
    const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers$1.solana.ammProgram);

    const SWAP_LAYOUT = solanaWeb3_js.struct([
      solanaWeb3_js.u64("anchorDiscriminator"),
      solanaWeb3_js.u64("amount"),
      solanaWeb3_js.u64("otherAmountThreshold"),
      solanaWeb3_js.u128("sqrtPriceLimit"),
      solanaWeb3_js.bool("amountSpecifiedIsInput"),
      solanaWeb3_js.bool("aToB"),
    ]);
    const exchangeRouteSwapInstructionData = SWAP_LAYOUT.decode(exchangeRouteSwapInstruction.data);

    const keys = [
      // token_program
      { pubkey: new solanaWeb3_js.PublicKey(web3Tokens.Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
      // amm_program
      { pubkey: new solanaWeb3_js.PublicKey(routers$1.solana.ammProgram), isSigner: false, isWritable: false },
      // sender
      { pubkey: new solanaWeb3_js.PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
      // payments
      { pubkey: await getPaymentsAccountAddress({ from: paymentRoute.fromAddress }), isSigner: false, isWritable: true },
      // sender_token_account
      { pubkey: new solanaWeb3_js.PublicKey(senderTokenAccountAddress), isSigner: false, isWritable: true },
      // whirlpool
      exchangeRouteSwapInstruction.keys[2],
      // token_vault_a
      exchangeRouteSwapInstruction.keys[4],
      // token_vault_b
      exchangeRouteSwapInstruction.keys[6],
      // tick_array_0
      exchangeRouteSwapInstruction.keys[7],
      // tick_array_1
      exchangeRouteSwapInstruction.keys[8],
      // tick_array_2
      exchangeRouteSwapInstruction.keys[9],
      // oracle
      exchangeRouteSwapInstruction.keys[10],
      // escrow_out
      { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
      // payment_receiver
      { pubkey: new solanaWeb3_js.PublicKey(paymentReceiverTokenAccountAddress), isSigner: false, isWritable: true },
      // fee_receiver
      { pubkey: new solanaWeb3_js.PublicKey(feeReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    ];

    const data = solanaWeb3_js.Buffer.alloc(routers$1.solana.api.routeOrcaSwap.layout.span);
    routers$1.solana.api.routeOrcaSwap.layout.encode({
      anchorDiscriminator: routers$1.solana.api.routeOrcaSwap.anchorDiscriminator,
      nonce: paymentsAccountData ? paymentsAccountData.nonce : new solanaWeb3_js.BN('0'),
      amountIn: exchangeRouteSwapInstructionData.amount,
      sqrtPriceLimit: exchangeRouteSwapInstructionData.sqrtPriceLimit,
      amountSpecifiedIsInput: exchangeRouteSwapInstructionData.amountSpecifiedIsInput,
      aToB: exchangeRouteSwapInstructionData.aToB,
      paymentAmount: new solanaWeb3_js.BN(paymentRoute.toAmount.toString()),
      feeAmount: new solanaWeb3_js.BN((paymentRoute.feeAmount || '0').toString())
    }, data);
    
    return new solanaWeb3_js.TransactionInstruction({ 
      keys,
      programId: new solanaWeb3_js.PublicKey(routers$1.solana.address),
      data
    })
  };

  const routeOrcaSwapSolOut = async({ paymentRoute, paymentsAccountData, wSolEscrowAccountKeypair }) =>{

    const senderTokenAccountAddress = await getPaymentSenderTokenAccountAddress({ paymentRoute });
    const escrowOutWsolPublicKey = wSolEscrowAccountKeypair.publicKey;
    const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ from: paymentRoute.fromAddress });
    const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers$1.solana.ammProgram);

    const SWAP_LAYOUT = solanaWeb3_js.struct([
      solanaWeb3_js.u64("anchorDiscriminator"),
      solanaWeb3_js.u64("amount"),
      solanaWeb3_js.u64("otherAmountThreshold"),
      solanaWeb3_js.u128("sqrtPriceLimit"),
      solanaWeb3_js.bool("amountSpecifiedIsInput"),
      solanaWeb3_js.bool("aToB"),
    ]);
    const exchangeRouteSwapInstructionData = SWAP_LAYOUT.decode(exchangeRouteSwapInstruction.data);

    const keys = [
      // system_program
      { pubkey: solanaWeb3_js.SystemProgram.programId, isSigner: false, isWritable: false },
      // token_program
      { pubkey: new solanaWeb3_js.PublicKey(web3Tokens.Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
      // amm_program
      { pubkey: new solanaWeb3_js.PublicKey(routers$1.solana.ammProgram), isSigner: false, isWritable: false },
      // sender
      { pubkey: new solanaWeb3_js.PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
      // payments
      { pubkey: await getPaymentsAccountAddress({ from: paymentRoute.fromAddress }), isSigner: false, isWritable: true },
      // sender_token_account
      { pubkey: new solanaWeb3_js.PublicKey(senderTokenAccountAddress), isSigner: false, isWritable: true },
      // whirlpool
      exchangeRouteSwapInstruction.keys[2],
      // token_vault_a
      exchangeRouteSwapInstruction.keys[4],
      // token_vault_b
      exchangeRouteSwapInstruction.keys[6],
      // tick_array_0
      exchangeRouteSwapInstruction.keys[7],
      // tick_array_1
      exchangeRouteSwapInstruction.keys[8],
      // tick_array_2
      exchangeRouteSwapInstruction.keys[9],
      // oracle
      exchangeRouteSwapInstruction.keys[10],
      // escrow_out
      { pubkey: escrowOutWsolPublicKey, isSigner: false, isWritable: true },
      // escrow_out_sol
      { pubkey: await getEscrowSolAccountPublicKey(), isSigner: false, isWritable: true },
      // payment_receiver
      { pubkey: new solanaWeb3_js.PublicKey(paymentRoute.toAddress), isSigner: false, isWritable: true },
      // fee_receiver
      { pubkey: new solanaWeb3_js.PublicKey(paymentRoute.fee ? paymentRoute.fee.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
    ];

    const data = solanaWeb3_js.Buffer.alloc(routers$1.solana.api.routeOrcaSwapSolOut.layout.span);
    routers$1.solana.api.routeOrcaSwapSolOut.layout.encode({
      anchorDiscriminator: routers$1.solana.api.routeOrcaSwapSolOut.anchorDiscriminator,
      nonce: paymentsAccountData ? paymentsAccountData.nonce : new solanaWeb3_js.BN('0'),
      amountIn: exchangeRouteSwapInstructionData.amount,
      sqrtPriceLimit: exchangeRouteSwapInstructionData.sqrtPriceLimit,
      amountSpecifiedIsInput: exchangeRouteSwapInstructionData.amountSpecifiedIsInput,
      aToB: exchangeRouteSwapInstructionData.aToB,
      paymentAmount: new solanaWeb3_js.BN(paymentRoute.toAmount.toString()),
      feeAmount: new solanaWeb3_js.BN((paymentRoute.feeAmount || '0').toString())
    }, data);
    
    return new solanaWeb3_js.TransactionInstruction({ 
      keys,
      programId: new solanaWeb3_js.PublicKey(routers$1.solana.address),
      data
    })
  };

  const routeOrcaTwoHopSwap = async({ paymentRoute, paymentsAccountData, wSolSenderAccountKeypair }) =>{

    const paymentReceiverTokenAccountPublicKey = new solanaWeb3_js.PublicKey(await getPaymentReceiverTokenAccountAddress({ paymentRoute }));
    const feeReceiverTokenAccountPublicKey = paymentRoute.fee ? new solanaWeb3_js.PublicKey(await getFeeReceiverTokenAccountAddress({ paymentRoute })) : paymentReceiverTokenAccountPublicKey;
    const escrowOutPublicKey = await getEscrowAccountPublicKey({ paymentRoute });
    const middleTokenAccountPublicKey = new solanaWeb3_js.PublicKey(await getMiddleTokenAccountAddress({ paymentRoute }));
    const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ from: paymentRoute.fromAddress });
    const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers$1.solana.ammProgram);
    const senderTokenAccountPublicKey = wSolSenderAccountKeypair ? wSolSenderAccountKeypair.publicKey : new solanaWeb3_js.PublicKey(await getPaymentSenderTokenAccountAddress({ paymentRoute }));

    const SWAP_LAYOUT = solanaWeb3_js.struct([
      solanaWeb3_js.u64("anchorDiscriminator"),
      solanaWeb3_js.u64("amount"),
      solanaWeb3_js.u64("otherAmountThreshold"),
      solanaWeb3_js.bool("amountSpecifiedIsInput"),
      solanaWeb3_js.bool("aToBOne"),
      solanaWeb3_js.bool("aToBTwo"),
      solanaWeb3_js.u128("sqrtPriceLimitOne"),
      solanaWeb3_js.u128("sqrtPriceLimitTwo"),
    ]);
    const exchangeRouteSwapInstructionData = SWAP_LAYOUT.decode(exchangeRouteSwapInstruction.data);

    const keys = [
      // token_program
      { pubkey: new solanaWeb3_js.PublicKey(web3Tokens.Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
      // amm_program
      { pubkey: new solanaWeb3_js.PublicKey(routers$1.solana.ammProgram), isSigner: false, isWritable: false },
      // sender
      { pubkey: new solanaWeb3_js.PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
      // payments
      { pubkey: await getPaymentsAccountAddress({ from: paymentRoute.fromAddress }), isSigner: false, isWritable: true },
      // whirlpool_one
      exchangeRouteSwapInstruction.keys[2],
      // whirlpool_two
      exchangeRouteSwapInstruction.keys[3],
      // sender_token_account
      { pubkey: senderTokenAccountPublicKey, isSigner: false, isWritable: true },
      // token_vault_one_a
      exchangeRouteSwapInstruction.keys[5],
      // token_vault_one_b
      exchangeRouteSwapInstruction.keys[7],
      // middle_token_account
      { pubkey: middleTokenAccountPublicKey, isSigner: false, isWritable: true },
      // token_vault_two_a
      exchangeRouteSwapInstruction.keys[9],
      // token_vault_two_b
      exchangeRouteSwapInstruction.keys[11],
      // tick_array_one_0
      exchangeRouteSwapInstruction.keys[12],
      // tick_array_one_1
      exchangeRouteSwapInstruction.keys[13],
      // tick_array_one_2
      exchangeRouteSwapInstruction.keys[14],
      // tick_array_two_0
      exchangeRouteSwapInstruction.keys[15],
      // tick_array_two_1
      exchangeRouteSwapInstruction.keys[16],
      // tick_array_two_2
      exchangeRouteSwapInstruction.keys[17],
      // oracle_one
      exchangeRouteSwapInstruction.keys[18],
      // oracle_two
      exchangeRouteSwapInstruction.keys[19],
      // escrow_out
      { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
      // payment_receiver
      { pubkey: paymentReceiverTokenAccountPublicKey, isSigner: false, isWritable: true },
      // fee_receiver
      { pubkey: feeReceiverTokenAccountPublicKey, isSigner: false, isWritable: true },
    ];

    const data = solanaWeb3_js.Buffer.alloc(routers$1.solana.api.routeOrcaTwoHopSwap.layout.span);
    routers$1.solana.api.routeOrcaTwoHopSwap.layout.encode({
      anchorDiscriminator: routers$1.solana.api.routeOrcaTwoHopSwap.anchorDiscriminator,
      nonce: paymentsAccountData ? paymentsAccountData.nonce : new solanaWeb3_js.BN('0'),
      amountIn: exchangeRouteSwapInstructionData.amount,
      amountSpecifiedIsInput: exchangeRouteSwapInstructionData.amountSpecifiedIsInput,
      aToBOne: exchangeRouteSwapInstructionData.aToBOne,
      aToBTwo: exchangeRouteSwapInstructionData.aToBTwo,
      sqrtPriceLimitOne: exchangeRouteSwapInstructionData.sqrtPriceLimitOne,
      sqrtPriceLimitTwo: exchangeRouteSwapInstructionData.sqrtPriceLimitTwo,
      paymentAmount: new solanaWeb3_js.BN(paymentRoute.toAmount.toString()),
      feeAmount: new solanaWeb3_js.BN((paymentRoute.feeAmount || '0').toString())
    }, data);
    
    return new solanaWeb3_js.TransactionInstruction({ 
      keys,
      programId: new solanaWeb3_js.PublicKey(routers$1.solana.address),
      data
    })
  };

  const routeOrcaTwoHopSwapSolOut = async({ paymentRoute, paymentsAccountData, wSolEscrowAccountKeypair }) =>{

    const middleTokenAccountPublicKey = new solanaWeb3_js.PublicKey(await getMiddleTokenAccountAddress({ paymentRoute }));
    const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ from: paymentRoute.fromAddress });
    const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers$1.solana.ammProgram);
    const senderTokenAccountPublicKey = new solanaWeb3_js.PublicKey(await getPaymentSenderTokenAccountAddress({ paymentRoute }));

    const SWAP_LAYOUT = solanaWeb3_js.struct([
      solanaWeb3_js.u64("anchorDiscriminator"),
      solanaWeb3_js.u64("amount"),
      solanaWeb3_js.u64("otherAmountThreshold"),
      solanaWeb3_js.bool("amountSpecifiedIsInput"),
      solanaWeb3_js.bool("aToBOne"),
      solanaWeb3_js.bool("aToBTwo"),
      solanaWeb3_js.u128("sqrtPriceLimitOne"),
      solanaWeb3_js.u128("sqrtPriceLimitTwo"),
    ]);
    const exchangeRouteSwapInstructionData = SWAP_LAYOUT.decode(exchangeRouteSwapInstruction.data);

    const keys = [
      // system_program
      { pubkey: solanaWeb3_js.SystemProgram.programId, isSigner: false, isWritable: false },
      // token_program
      { pubkey: new solanaWeb3_js.PublicKey(web3Tokens.Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
      // amm_program
      { pubkey: new solanaWeb3_js.PublicKey(routers$1.solana.ammProgram), isSigner: false, isWritable: false },
      // sender
      { pubkey: new solanaWeb3_js.PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
      // payments
      { pubkey: await getPaymentsAccountAddress({ from: paymentRoute.fromAddress }), isSigner: false, isWritable: true },
      // sender_token_account
      { pubkey: senderTokenAccountPublicKey, isSigner: false, isWritable: true },
      // whirlpool_one
      exchangeRouteSwapInstruction.keys[2],
      // whirlpool_two
      exchangeRouteSwapInstruction.keys[3],
      // token_vault_one_a
      exchangeRouteSwapInstruction.keys[5],
      // token_vault_one_b
      exchangeRouteSwapInstruction.keys[7],
      // middle_token_account
      { pubkey: middleTokenAccountPublicKey, isSigner: false, isWritable: true },
      // token_vault_two_a
      exchangeRouteSwapInstruction.keys[9],
      // token_vault_two_b
      exchangeRouteSwapInstruction.keys[11],
      // tick_array_one_0
      exchangeRouteSwapInstruction.keys[12],
      // tick_array_one_1
      exchangeRouteSwapInstruction.keys[13],
      // tick_array_one_2
      exchangeRouteSwapInstruction.keys[14],
      // tick_array_two_0
      exchangeRouteSwapInstruction.keys[15],
      // tick_array_two_1
      exchangeRouteSwapInstruction.keys[16],
      // tick_array_two_2
      exchangeRouteSwapInstruction.keys[17],
      // oracle_one
      exchangeRouteSwapInstruction.keys[18],
      // oracle_two
      exchangeRouteSwapInstruction.keys[19],
      // escrow_out
      { pubkey: wSolEscrowAccountKeypair.publicKey, isSigner: false, isWritable: true },
      // escrow_out_sol
      { pubkey: await getEscrowSolAccountPublicKey(), isSigner: false, isWritable: true },
      // payment_receiver
      { pubkey: new solanaWeb3_js.PublicKey(paymentRoute.toAddress), isSigner: false, isWritable: true },
      // fee_receiver
      { pubkey: new solanaWeb3_js.PublicKey(paymentRoute.fee ? paymentRoute.fee.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
    ];

    const data = solanaWeb3_js.Buffer.alloc(routers$1.solana.api.routeOrcaTwoHopSwapSolOut.layout.span);
    routers$1.solana.api.routeOrcaTwoHopSwapSolOut.layout.encode({
      anchorDiscriminator: routers$1.solana.api.routeOrcaTwoHopSwapSolOut.anchorDiscriminator,
      nonce: paymentsAccountData ? paymentsAccountData.nonce : new solanaWeb3_js.BN('0'),
      amountIn: exchangeRouteSwapInstructionData.amount,
      amountSpecifiedIsInput: exchangeRouteSwapInstructionData.amountSpecifiedIsInput,
      aToBOne: exchangeRouteSwapInstructionData.aToBOne,
      aToBTwo: exchangeRouteSwapInstructionData.aToBTwo,
      sqrtPriceLimitOne: exchangeRouteSwapInstructionData.sqrtPriceLimitOne,
      sqrtPriceLimitTwo: exchangeRouteSwapInstructionData.sqrtPriceLimitTwo,
      paymentAmount: new solanaWeb3_js.BN(paymentRoute.toAmount.toString()),
      feeAmount: new solanaWeb3_js.BN((paymentRoute.feeAmount || '0').toString())
    }, data);
    
    return new solanaWeb3_js.TransactionInstruction({ 
      keys,
      programId: new solanaWeb3_js.PublicKey(routers$1.solana.address),
      data
    })
  };

  const payment = async({ paymentRoute, wSolSenderAccountKeypair, wSolEscrowAccountKeypair })=> {

    const paymentsAccountData = await getPaymentsAccountData({ from: paymentRoute.fromAddress });
    const paymentMethod = getPaymentMethod({ paymentRoute });

    switch(paymentMethod){
      
      case 'routeSol':
      return await routeSol({ paymentRoute, paymentsAccountData });
      
      case 'routeToken':
      return await routeToken({ paymentRoute, paymentsAccountData });

      case 'routeOrcaSwap':
      return await routeOrcaSwap({ paymentRoute, paymentsAccountData, wSolSenderAccountKeypair });

      case 'routeOrcaSwapSolOut':
      return await routeOrcaSwapSolOut({ paymentRoute, paymentsAccountData, wSolEscrowAccountKeypair });

      case 'routeOrcaTwoHopSwap':
      return await routeOrcaTwoHopSwap({ paymentRoute, paymentsAccountData, wSolSenderAccountKeypair });

      case 'routeOrcaTwoHopSwapSolOut':
      return await routeOrcaTwoHopSwapSolOut({ paymentRoute, paymentsAccountData, wSolEscrowAccountKeypair });

    }

  };

  const getTransaction$1 = async({ paymentRoute })=> {

    const wSolSenderAccountKeypair = await getWSolSenderAccountKeypairIfNeeded({ paymentRoute });
    const wSolEscrowAccountKeypair = await getWSolEscrowAccountKeypairIfNeeded({ paymentRoute });

    let instructions = (
      await Promise.all([
        createPaymentsAccount({ from: paymentRoute.fromAddress }),
        createWSolSenderAccount({ paymentRoute, wSolSenderAccountKeypair }),
        createTokenMiddleAccount({ paymentRoute }),
        createPaymentReceiverAccount({ paymentRoute }),
        createFeeReceiverAccount({ paymentRoute }),
        createEscrowOutSolAccount({ paymentRoute }), // needs to happen before createEscrowOutWSolAccount
        createEscrowOutWSolAccount({ paymentRoute, wSolEscrowAccountKeypair }),
        createEscrowOutTokenAccount({ paymentRoute }),
        payment({ paymentRoute, wSolSenderAccountKeypair, wSolEscrowAccountKeypair }),
        closeWSolSenderAccount({ paymentRoute, wSolSenderAccountKeypair }),
      ])
    ).filter(Boolean).flat();

    const transaction = {
      blockchain: paymentRoute.blockchain,
      instructions,
      signers: [wSolSenderAccountKeypair, wSolEscrowAccountKeypair].filter(Boolean),
      alts: [routers$1.solana.alt]
    };

    // debug(transaction, paymentRoute)

    return transaction
  };

  let supported = ['ethereum', 'bsc', 'polygon', 'solana'];
  supported.evm = ['ethereum', 'bsc', 'polygon'];
  supported.solana = ['solana'];

  const getTransaction = ({ paymentRoute, event, fee })=>{
    if(supported.evm.includes(paymentRoute.blockchain)) {
      return getTransaction$2({ paymentRoute, event, fee })
    } else if(supported.solana.includes(paymentRoute.blockchain)) {
      return getTransaction$1({ paymentRoute, event, fee })
    } else {
      throw('Blockchain not supported!')
    }
  };

  function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

  class PaymentRoute {
    constructor({
      blockchain,
      fromAddress,
      fromToken,
      fromAmount,
      fromDecimals,
      fromBalance,
      toToken,
      toAmount,
      toDecimals,
      toAddress,
      fee,
      feeAmount,
      exchangeRoutes,
      approvalRequired,
      approvalTransaction,
      directTransfer,
      event,
    }) {
      this.blockchain = blockchain;
      this.fromAddress = fromAddress;
      this.fromToken = fromToken;
      this.fromAmount = _optionalChain([(fromAmount || toAmount), 'optionalAccess', _ => _.toString, 'call', _2 => _2()]);
      this.fromDecimals = fromDecimals;
      this.fromBalance = fromBalance;
      this.toToken = toToken;
      this.toAmount = _optionalChain([toAmount, 'optionalAccess', _3 => _3.toString, 'call', _4 => _4()]);
      this.toDecimals = toDecimals;
      this.toAddress = toAddress;
      this.fee = fee;
      this.feeAmount = feeAmount;
      this.exchangeRoutes = exchangeRoutes || [];
      this.approvalRequired = approvalRequired;
      this.approvalTransaction = approvalTransaction;
      this.directTransfer = directTransfer;
      this.event = event;
      this.getTransaction = async ()=> await getTransaction({ paymentRoute: this, event });
    }
  }

  function convertToRoutes({ assets, accept, from, event }) {
    return Promise.all(assets.map(async (asset)=>{
      let relevantConfigurations = accept.filter((configuration)=>(configuration.blockchain == asset.blockchain));
      let fromToken = new web3Tokens.Token(asset);
      return Promise.all(relevantConfigurations.map(async (configuration)=>{
        if(configuration.token && configuration.amount) {
          let blockchain = configuration.blockchain;
          let fromDecimals = asset.decimals;
          let toToken = new web3Tokens.Token({ blockchain, address: configuration.token });
          let toDecimals = await toToken.decimals();
          let toAmount = (await toToken.BigNumber(configuration.amount)).toString();

          return new PaymentRoute({
            blockchain,
            fromToken,
            fromDecimals,
            toToken,
            toAmount,
            toDecimals,
            fromBalance: asset.balance,
            fromAddress: from[configuration.blockchain],
            toAddress: configuration.toAddress,
            fee: configuration.fee,
            event
          })
        } else if(configuration.fromToken && configuration.fromAmount && fromToken.address.toLowerCase() == configuration.fromToken.toLowerCase()) {
          let blockchain = configuration.blockchain;
          let fromAmount = (await fromToken.BigNumber(configuration.fromAmount)).toString();
          let fromDecimals = asset.decimals;
          let toToken = new web3Tokens.Token({ blockchain, address: configuration.toToken });
          let toDecimals = await toToken.decimals();
          
          return new PaymentRoute({
            blockchain,
            fromToken,
            fromDecimals,
            fromAmount,
            toToken,
            toDecimals,
            fromBalance: asset.balance,
            fromAddress: from[configuration.blockchain],
            toAddress: configuration.toAddress,
            fee: configuration.fee,
            event
          })
        }
      }))
    })).then((routes)=> routes.flat().filter(el => el))
  }

  function assetsToRoutes({ assets, blacklist, accept, from, event }) {
    return Promise.resolve(filterBlacklistedAssets({ assets, blacklist }))
      .then((assets) => convertToRoutes({ assets, accept, from, event }))
      .then((routes) => addDirectTransferStatus({ routes }))
      .then(addExchangeRoutes)
      .then(filterExchangeRoutesWithoutPlugin)
      .then(filterNotRoutable)
      .then(filterInsufficientBalance)
      .then((routes)=>addRouteAmounts({ routes }))
      .then(addApproval)
      .then(sortPaymentRoutes)
      .then(filterDuplicateFromTokens)
      .then((routes)=>routes.map((route)=>new PaymentRoute(route)))
  }

  function route({ accept, from, whitelist, blacklist, event, update }) {
    if(accept.some((accept)=>{ return accept && accept.fee && typeof(accept.fee.amount) == 'string' && accept.fee.amount.match(/\.\d\d+\%/) })) {
      throw('Only up to 1 decimal is supported for fee amounts!')
    }

    return new Promise(async (resolveAll, rejectAll)=>{

      let priority = [];
      if(whitelist) {
        for (const blockchain in whitelist) {
          (whitelist[blockchain] || []).forEach((address)=>{
            priority.push({ blockchain, address });
          });
        }
      } else {
        accept.forEach((accepted)=>{
          priority.push({ blockchain: accepted.blockchain, address: accepted.token || accepted.toToken });
        });
      }

      let throttledUpdate;
      if(update) {
        throttledUpdate = throttle_1(async ({ assets, blacklist, accept, from, event })=>{
          update.callback(await assetsToRoutes({ assets, blacklist, accept, from, event }));
        }, update.every);
      }
      
      let drippedAssets = [];
      const allAssets = await web3Assets.dripAssets({
        accounts: from,
        priority: priority,
        only: whitelist,
        exclude: blacklist,
        drip: (asset)=>{
          if(update) {
            drippedAssets.push(asset);
            throttledUpdate({ assets: drippedAssets, blacklist, accept, from, event });
          }
        }
      });

      let allPaymentRoutes = await assetsToRoutes({ assets: allAssets, blacklist, accept, from, event });
      resolveAll(allPaymentRoutes);
    })
  }

  let filterBlacklistedAssets = ({ assets, blacklist }) => {
    if(blacklist == undefined) {
      return assets
    } else {
      return assets.filter((asset)=> {
        if(blacklist[asset.blockchain] == undefined) {
          return true
        } else {
          return !blacklist[asset.blockchain].find((blacklistedAddress)=>{
            return blacklistedAddress.toLowerCase() == asset.address.toLowerCase()
          })
        }
      })
    }
  };

  let addExchangeRoutes = async (routes) => {
    return await Promise.all(
      routes.map((route) => {
        if(route.directTransfer) { return [] }
        if(route.toToken && route.toAmount) {
          return web3Exchanges.route({
            blockchain: route.blockchain,
            tokenIn: route.fromToken.address,
            tokenOut: route.toToken.address,
            amountOutMin: route.toAmount,
            fromAddress: route.fromAddress,
            toAddress: route.toAddress
          })
        } else if(route.fromToken && route.fromAmount) {
          return web3Exchanges.route({
            blockchain: route.blockchain,
            tokenIn: route.fromToken.address,
            tokenOut: route.toToken.address,
            amountIn: route.fromAmount,
            fromAddress: route.fromAddress,
            toAddress: route.toAddress
          })
        }
      }),
    ).then((exchangeRoutes) => {
      return routes.map((route, index) => {
        route.exchangeRoutes = exchangeRoutes[index];
        return route
      })
    })
  };

  let filterExchangeRoutesWithoutPlugin = (routes) => {
    return routes.filter((route)=>{
      if(route.exchangeRoutes.length === 0) { return true }
      if(route.blockchain === 'solana') { return true }
      return plugins[route.blockchain][route.exchangeRoutes[0].exchange.name] != undefined
    })
  };

  let filterNotRoutable = (routes) => {
    return routes.filter((route) => {
      return (
        route.exchangeRoutes.length != 0 ||
        route.fromToken.address.toLowerCase() == route.toToken.address.toLowerCase() // direct transfer always possible
      )
    })
  };

  let filterInsufficientBalance = async(routes) => {
    return routes.filter((route) => {
      if (route.fromToken.address.toLowerCase() == route.toToken.address.toLowerCase()) {
        return ethers.ethers.BigNumber.from(route.fromBalance).gte(ethers.ethers.BigNumber.from(route.toAmount))
      } else if(route.fromAmount && route.toAmount) {
        return ethers.ethers.BigNumber.from(route.fromBalance).gte(ethers.ethers.BigNumber.from(route.exchangeRoutes[0].amountInMax))
      } else if(route.exchangeRoutes[0] && route.exchangeRoutes[0].amountIn) {
        return ethers.ethers.BigNumber.from(route.fromBalance).gte(ethers.ethers.BigNumber.from(route.exchangeRoutes[0].amountIn))
      }
    })
  };

  let addApproval = (routes) => {
    return Promise.all(routes.map(
      (route) => {
        if(route.blockchain === 'solana') {
          return Promise.resolve(Blockchains__default["default"].solana.maxInt)
        } else {
          return route.fromToken.allowance(route.fromAddress, routers[route.blockchain].address)
        }
      }
    )).then(
      (allowances) => {
        routes.map((route, index) => {
          if(
            (
              route.directTransfer ||
              route.fromToken.address.toLowerCase() == Blockchains__default["default"][route.blockchain].currency.address.toLowerCase() ||
              route.blockchain === 'solana'
            )
          ) {
            routes[index].approvalRequired = false;
          } else {
            routes[index].approvalRequired = ethers.ethers.BigNumber.from(route.fromAmount).gte(ethers.ethers.BigNumber.from(allowances[index]));
            if(routes[index].approvalRequired) {
              routes[index].approvalTransaction = {
                blockchain: route.blockchain,
                to: route.fromToken.address,
                api: web3Tokens.Token[route.blockchain].DEFAULT,
                method: 'approve',
                params: [routers[route.blockchain].address, Blockchains__default["default"][route.blockchain].maxInt]
              };
            }
          }
        });
        return routes
      },
    )
  };

  let addDirectTransferStatus = ({ routes }) => {
    return routes.map((route)=>{
      if(supported.evm.includes(route.blockchain)) {
        route.directTransfer = route.fromToken.address.toLowerCase() == route.toToken.address.toLowerCase() && route.fee == undefined;
      } else if (route.blockchain === 'solana') {
        route.directTransfer = route.fromToken.address.toLowerCase() == route.toToken.address.toLowerCase();
      }
      return route
    })
  };

  let calculateAmounts = ({ paymentRoute, exchangeRoute })=>{
    let fromAmount;
    let toAmount;
    let feeAmount;
    if(exchangeRoute) {
      if(exchangeRoute && exchangeRoute.exchange.wrapper) {
        fromAmount = exchangeRoute.amountIn.toString();
        toAmount = subtractFee({ amount: exchangeRoute.amountOutMin.toString(), paymentRoute });
      } else {
        fromAmount = exchangeRoute.amountIn.toString();
        toAmount = subtractFee({ amount: exchangeRoute.amountOutMin.toString(), paymentRoute });
      }
    } else {
      fromAmount = paymentRoute.fromAmount;
      toAmount = subtractFee({ amount: paymentRoute.fromAmount, paymentRoute });
    }
    if(paymentRoute.fee){
      feeAmount = getFeeAmount({ paymentRoute });
    }
    return { fromAmount, toAmount, feeAmount }
  };

  let subtractFee = ({ amount, paymentRoute })=> {
    if(paymentRoute.fee) {
      let feeAmount = getFeeAmount({ paymentRoute });
      return ethers.ethers.BigNumber.from(amount).sub(feeAmount).toString()
    } else {
      return amount
    }
  };

  let getFeeAmount = ({ paymentRoute })=> {
    if(typeof paymentRoute.fee.amount == 'string' && paymentRoute.fee.amount.match('%')) {
      return ethers.ethers.BigNumber.from(paymentRoute.toAmount).mul(parseFloat(paymentRoute.fee.amount)*10).div(1000).toString()
    } else if(typeof paymentRoute.fee.amount == 'string') {
      return paymentRoute.fee.amount
    } else if(typeof paymentRoute.fee.amount == 'number') {
      return ethers.ethers.utils.parseUnits(paymentRoute.fee.amount.toString(), paymentRoute.toDecimals).toString()
    } else {
      throw('Unknown fee amount type!')
    }
  };

  let addRouteAmounts = ({ routes })=> {
    return routes.map((route)=>{

      if(supported.evm.includes(route.blockchain)) {

        if(route.directTransfer && !route.fee) {
          route.fromAmount = route.toAmount;
        } else {
          let { fromAmount, toAmount, feeAmount } = calculateAmounts({ paymentRoute: route, exchangeRoute: route.exchangeRoutes[0] });
          route.fromAmount = fromAmount;
          route.toAmount = toAmount;
          if(route.fee){
            route.feeAmount = feeAmount;
          }
        }
      } else if (supported.solana.includes(route.blockchain)) {

        let { fromAmount, toAmount, feeAmount } = calculateAmounts({ paymentRoute: route, exchangeRoute: route.exchangeRoutes[0] });
        route.fromAmount = fromAmount;
        route.toAmount = toAmount;
        if(route.fee){
          route.feeAmount = feeAmount;
        }

      }
      
      return route
    })
  };

  let filterDuplicateFromTokens = (routes) => {
    return routes.filter((routeA, indexA)=>{
      let otherMoreEfficientRoute = routes.find((routeB, indexB)=>{
        if(routeA.fromToken.address != routeB.fromToken.address) { return false }
        if(routeA.fromToken.blockchain != routeB.fromToken.blockchain) { return false }
        if(routeB.directTransfer && !routeA.directTransfer) { return true }
        if(ethers.ethers.BigNumber.from(routeB.fromAmount).lt(ethers.ethers.BigNumber.from(routeA.fromAmount)) && !routeA.directTransfer) { return true }
        if(routeB.fromAmount == routeA.fromAmount && indexB < indexA) { return true }
      });

      return otherMoreEfficientRoute == undefined
    })
  };

  let scoreBlockchainCost = (blockchain) => {
    switch(blockchain) {
      case 'solana':
        return 10
      case 'polygon':
        return 30
      case 'bsc':
        return 70
      case 'ethereum':
        return 99
      default:
        return 100
    }
  };

  let sortPaymentRoutes = (routes) => {
    let aWins = -1;
    let bWins = 1;
    let equal = 0;
    return routes.sort((a, b) => {
      if (scoreBlockchainCost(a.fromToken.blockchain) < scoreBlockchainCost(b.fromToken.blockchain)) {
        return aWins
      }
      if (scoreBlockchainCost(b.fromToken.blockchain) < scoreBlockchainCost(a.fromToken.blockchain)) {
        return bWins
      }

      if (a.fromToken.address.toLowerCase() == a.toToken.address.toLowerCase()) {
        return aWins
      }
      if (b.fromToken.address.toLowerCase() == b.toToken.address.toLowerCase()) {
        return bWins
      }

      if (a.approvalRequired && !b.approvalRequired) {
        return bWins
      }
      if (b.approvalRequired && !a.approvalRequired) {
        return aWins
      }

      if (JSON.stringify([a.fromToken.address.toLowerCase(), a.toToken.address.toLowerCase()].sort()) == JSON.stringify([Blockchains__default["default"][a.blockchain].currency.address.toLowerCase(), Blockchains__default["default"][a.blockchain].wrapped.address.toLowerCase()].sort())) {
        return aWins
      }
      if (JSON.stringify([b.fromToken.address.toLowerCase(), b.toToken.address.toLowerCase()].sort()) == JSON.stringify([Blockchains__default["default"][b.blockchain].currency.address.toLowerCase(), Blockchains__default["default"][b.blockchain].wrapped.address.toLowerCase()].sort())) {
        return bWins
      }

      if (a.fromToken.address.toLowerCase() == Blockchains__default["default"][a.blockchain].currency.address.toLowerCase()) {
        return aWins
      }
      if (b.fromToken.address.toLowerCase() == Blockchains__default["default"][b.blockchain].currency.address.toLowerCase()) {
        return bWins
      }

      return equal
    })
  };

  exports.plugins = plugins;
  exports.route = route;
  exports.routers = routers;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
