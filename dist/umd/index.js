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

  var routers$1 = {
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

  var solanaRouters = {
    solana: {
      address: 'DePayRG7ZySPWzeK9Kvq7aPeif7sdbBZNh6DHcvNj7F7',
      api: {
        createPaymentsAccount: {
          anchorDiscriminator: new solanaWeb3_js.BN("8445995362644372894"),
          layout: solanaWeb3_js.struct([
            solanaWeb3_js.u64("anchorDiscriminator"),
          ])
        },
        createEscrowAccount: {
          anchorDiscriminator: new solanaWeb3_js.BN("103653380020343698"),
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
        }
      }
    },
  };

  var routers = {... routers$1, solanaRouters};

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

  let getTransaction$2 = async({ paymentRoute, event, fee })=> {
    let exchangeRoute = paymentRoute.exchangeRoutes[0];

    let transaction = {
      blockchain: paymentRoute.blockchain,
      to: transactionAddress({ paymentRoute, fee }),
      api: transactionApi({ paymentRoute, fee }),
      method: transactionMethod({ paymentRoute, fee }),
      params: transactionParams({ paymentRoute, exchangeRoute, event, fee }),
      value: transactionValue({ paymentRoute, exchangeRoute })
    };

    if(exchangeRoute) {
      if(paymentRoute.exchangePlugin && paymentRoute.exchangePlugin.prepareTransaction) {
        transaction = paymentRoute.exchangePlugin.prepareTransaction(transaction);
      }
    }

    return transaction
  };

  let transactionAddress = ({ paymentRoute, fee })=> {
    if(paymentRoute.directTransfer && !fee) {
      if(paymentRoute.toToken.address == Blockchains__default["default"][paymentRoute.blockchain].currency.address) {
        return paymentRoute.toAddress
      } else {
        return paymentRoute.toToken.address
      }
    } else {
      return routers$1[paymentRoute.blockchain].address
    }
  };

  let transactionApi = ({ paymentRoute, fee })=> {
    if(paymentRoute.directTransfer && !fee) {
      if(paymentRoute.toToken.address == Blockchains__default["default"][paymentRoute.blockchain].currency.address) {
        return undefined
      } else {
        return web3Tokens.Token[paymentRoute.blockchain].DEFAULT
      }
    } else {
      return routers$1[paymentRoute.blockchain].api
    }
  };

  let transactionMethod = ({ paymentRoute, fee })=> {
    if(paymentRoute.directTransfer && !fee) {
      if(paymentRoute.toToken.address == Blockchains__default["default"][paymentRoute.blockchain].currency.address) {
        return undefined
      } else {
        return 'transfer'
      }
    } else {
      return 'route'
    }
  };

  let transactionParams = ({ paymentRoute, exchangeRoute, event, fee })=> {
    if(paymentRoute.directTransfer && !fee) {
      if(paymentRoute.toToken.address == Blockchains__default["default"][paymentRoute.blockchain].currency.address) {
        return undefined
      } else {
        return [paymentRoute.toAddress, paymentRoute.toAmount]
      }
    } else {
      return {
        path: transactionPath({ paymentRoute, exchangeRoute }),
        amounts: getTransactionAmounts({ paymentRoute, exchangeRoute, fee }),
        addresses: transactionAddresses({ paymentRoute, fee }),
        plugins: transactionPlugins({ paymentRoute, exchangeRoute, event, fee }),
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

  let getTransactionAmounts = ({ paymentRoute, exchangeRoute, fee })=> {
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
    if(fee){
      amounts[4] = paymentRoute.feeAmount;
    }
    for(var i = 0; i < amounts.length; i++) {
      if(amounts[i] == undefined){ amounts[i] = '0'; }
    }
    return amounts
  };

  let transactionAddresses = ({ paymentRoute, fee })=> {
    if(fee) {
      return [paymentRoute.fromAddress, fee.receiver, paymentRoute.toAddress]
    } else {
      return [paymentRoute.fromAddress, paymentRoute.toAddress]
    }
  };

  let transactionPlugins = ({ paymentRoute, exchangeRoute, event, fee })=> {
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

    if(fee) {
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

  const createPaymentsAccount = async({ from })=> {

  };

  const getTransaction$1 = async({ paymentRoute, event, fee })=> {

    console.log('paymentRoute', paymentRoute);

    let instructions = [
      await createPaymentsAccount({ from: paymentRoute.fromAddress })
    ].filter(Boolean);

    return {
      blockchain: paymentRoute.blockchain,
      instructions
    }
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
      this.getTransaction = async ()=> await getTransaction({ paymentRoute: this, event, fee });
    }
  }

  function convertToRoutes({ assets, accept, from, fee, event }) {
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
            fee,
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
            fee,
            event
          })
        }
      }))
    })).then((routes)=> routes.flat().filter(el => el))
  }

  function assetsToRoutes({ assets, blacklist, accept, from, event, fee }) {
    return Promise.resolve(filterBlacklistedAssets({ assets, blacklist }))
      .then((assets) => convertToRoutes({ assets, accept, from, fee, event }))
      .then((routes) => addDirectTransferStatus({ routes, fee }))
      .then(addExchangeRoutes)
      .then(filterExchangeRoutesWithoutPlugin)
      .then(filterNotRoutable)
      .then(filterInsufficientBalance)
      .then((routes)=>addRouteAmounts({ routes, fee }))
      .then(addApproval)
      .then(sortPaymentRoutes)
      .then(filterDuplicateFromTokens)
      .then((routes)=>routes.map((route)=>new PaymentRoute(route)))
  }

  function route({ accept, from, whitelist, blacklist, event, fee, update }) {
    if(fee && fee.amount && typeof(fee.amount) == 'string' && fee.amount.match(/\.\d\d+\%/)) {
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
        throttledUpdate = throttle_1(async ({ assets, blacklist, accept, from, event, fee })=>{
          update.callback(await assetsToRoutes({ assets, blacklist, accept, from, event, fee }));
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
            throttledUpdate({ assets: drippedAssets, blacklist, accept, from, event, fee });
          }
        }
      });

      let allPaymentRoutes = await assetsToRoutes({ assets: allAssets, blacklist, accept, from, event, fee });
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

  let addDirectTransferStatus = ({ routes, fee }) => {
    return routes.map((route)=>{
      route.directTransfer = route.fromToken.address.toLowerCase() == route.toToken.address.toLowerCase() && fee == undefined;
      return route
    })
  };

  let calculateAmounts = ({ paymentRoute, exchangeRoute, fee })=>{
    let fromAmount;
    let toAmount;
    let feeAmount;
    if(exchangeRoute) {
      if(exchangeRoute && exchangeRoute.exchange.wrapper) {
        fromAmount = exchangeRoute.amountIn.toString();
        toAmount = subtractFee({ amount: exchangeRoute.amountOutMin.toString(), paymentRoute, fee });
      } else {
        fromAmount = exchangeRoute.amountIn.toString();
        toAmount = subtractFee({ amount: exchangeRoute.amountOutMin.toString(), paymentRoute, fee });
      }
    } else {
      fromAmount = paymentRoute.fromAmount;
      toAmount = subtractFee({ amount: paymentRoute.fromAmount, paymentRoute, fee });
    }
    if(fee){
      feeAmount = getFeeAmount({ paymentRoute, fee });
    }
    return { fromAmount, toAmount, feeAmount }
  };

  let subtractFee = ({ amount, paymentRoute, fee })=> {
    if(fee) {
      let feeAmount = getFeeAmount({ paymentRoute, fee });
      return ethers.ethers.BigNumber.from(amount).sub(feeAmount).toString()
    } else {
      return amount
    }
  };

  let getFeeAmount = ({ paymentRoute, fee })=> {
    if(typeof fee.amount == 'string' && fee.amount.match('%')) {
      return ethers.ethers.BigNumber.from(paymentRoute.toAmount).mul(parseFloat(fee.amount)*10).div(1000).toString()
    } else if(typeof fee.amount == 'string') {
      return fee.amount
    } else if(typeof fee.amount == 'number') {
      return ethers.ethers.utils.parseUnits(fee.amount.toString(), paymentRoute.toDecimals).toString()
    } else {
      throw('Unknown fee amount type!')
    }
  };

  let addRouteAmounts = ({ routes, fee })=> {
    return routes.map((route)=>{

      if(supported.evm.includes(route.blockchain)) {

        if(route.directTransfer && !route.fee) {
          route.fromAmount = route.toAmount;
        } else {
          let { fromAmount, toAmount, feeAmount } = calculateAmounts({ paymentRoute: route, exchangeRoute: route.exchangeRoutes[0], fee });
          route.fromAmount = fromAmount;
          route.toAmount = toAmount;
          if(route.fee){
            route.feeAmount = feeAmount;
          }
        }
      } else if (supported.solana.includes(route.blockchain)) {

        console.log('add route amounts solana!!!');

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
