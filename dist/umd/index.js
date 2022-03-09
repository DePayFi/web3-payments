(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@depay/web3-constants'), require('@depay/web3-assets'), require('@depay/web3-exchanges'), require('@depay/web3-tokens'), require('buffer')) :
  typeof define === 'function' && define.amd ? define(['exports', '@depay/web3-constants', '@depay/web3-assets', '@depay/web3-exchanges', '@depay/web3-tokens', 'buffer'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Web3Payments = {}, global.Web3Constants, global.Web3Assets, global.Web3Exchanges, global.Web3Tokens, global.require$$0));
})(this, (function (exports, web3Constants, web3Assets, web3Exchanges, web3Tokens, require$$0) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);

  const prepareUniswapTransaction = (transaction)=>{
    transaction.params.path = transaction.params.path.filter((token, index, path)=>{
      if(
        index == 1 &&
        token == web3Constants.CONSTANTS[transaction.blockchain].WRAPPED &&
        path[0] == web3Constants.CONSTANTS[transaction.blockchain].NATIVE
      ) { 
        return false
      } else if (
        index == path.length-2 &&
        token == web3Constants.CONSTANTS[transaction.blockchain].WRAPPED &&
        path[path.length-1] == web3Constants.CONSTANTS[transaction.blockchain].NATIVE
      ) {
        return false
      } else {
        return true
      }
    });
    return transaction
  };

  const prepareContractCallAddressAmountBooleanTransaction = (transaction, toContract)=> {
    transaction.params.data = [
      toContract.signature,
      toContract.params[0]
    ];
    return transaction
  };

  const prepareContractCallAddressPassedAmountBooleanTransaction = (transaction, toContract)=> {
    transaction.params.data = [
      toContract.signature,
      toContract.params[1]
    ];
    if(!transaction.params.amounts[1]) { transaction.params.amounts[1] = '0'; }
    if(!transaction.params.amounts[2]) { transaction.params.amounts[2] = '0'; }
    if(!transaction.params.amounts[3]) { transaction.params.amounts[3] = '0'; }
    if(!transaction.params.amounts[4]) { transaction.params.amounts[4] = '0'; }
    transaction.params.amounts[5] = toContract.params[0];
    return transaction
  };

  const preparePaymentFeeTransaction = (transaction)=> {

  };

  var plugins = {
    ethereum: {
      payment: {
        address: '0x99F3F4685a7178F26EB4F4Ca8B75a1724F1577B9'
      },
      uniswap_v2: {
        address: '0xe04b08Dfc6CaA0F4Ec523a3Ae283Ece7efE00019',
        prepareTransaction: prepareUniswapTransaction
      },
      paymentWithEvent: {
        address: '0xD8fBC10787b019fE4059Eb5AA5fB11a5862229EF'
      },
      contractCall: {
        approveAndCallContractAddressAmountBoolean: {
          address: '0xF984eb8b466AD6c728E0aCc7b69Af6f69B32437F',
          prepareTransaction: prepareContractCallAddressAmountBooleanTransaction
        },
        approveAndCallContractAddressPassedAmountBoolean: {
          address: '0x2D18c5A46cc1780d2460DD51B5d0996e55Fd2446',
          prepareTransaction: prepareContractCallAddressPassedAmountBooleanTransaction
        }
      },
      paymentFee: {
        address: '0x874Cb669D7BFff79d4A6A30F4ea52c5e413BD6A7',
        prepareTransaction: preparePaymentFeeTransaction
      }
    },
    bsc: {
      payment: {
        address: '0x8B127D169D232D5F3ebE1C3D06CE343FD7C1AA11',
      },
      pancakeswap: {
        address: '0xAC3Ec4e420DD78bA86d932501E1f3867dbbfb77B',
        prepareTransaction: prepareUniswapTransaction
      },
      paymentWithEvent: {
        address: '0x1869E236c03eE67B9FfEd3aCA139f4AeBA79Dc21'
      },
      contractCall: {
        approveAndCallContractAddressAmountBoolean: {
          address: '0xd73dFeF8F9c213b449fB39B84c2b33FBBc2C8eD3',
          prepareTransaction: prepareContractCallAddressAmountBooleanTransaction
        },
        approveAndCallContractAddressPassedAmountBoolean: {
          address: '0x7E655088214d0657251A51aDccE9109CFd23B5B5',
          prepareTransaction: prepareContractCallAddressPassedAmountBooleanTransaction
        }
      },
      paymentFee: {
        address: '0xae33f10AD57A38113f74FCdc1ffA6B1eC47B94E3',
        prepareTransaction: preparePaymentFeeTransaction
      }
    } 
  };

  var routers = {
    ethereum: {
      address: '0xae60aC8e69414C2Dc362D0e6a03af643d1D85b92',
      api: [{"inputs":[{"internalType":"address","name":"_configuration","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"ETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"configuration","outputs":[{"internalType":"contract DePayRouterV1Configuration","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"pluginAddress","type":"address"}],"name":"isApproved","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"address[]","name":"addresses","type":"address[]"},{"internalType":"address[]","name":"plugins","type":"address[]"},{"internalType":"string[]","name":"data","type":"string[]"}],"name":"route","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]
    },
    bsc: {
      address: '0x0Dfb7137bC64b63F7a0de7Cb9CDa178702666220',
      api: [{"inputs":[{"internalType":"address","name":"_configuration","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"ETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"configuration","outputs":[{"internalType":"contract DePayRouterV1Configuration","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"pluginAddress","type":"address"}],"name":"isApproved","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"address[]","name":"addresses","type":"address[]"},{"internalType":"address[]","name":"plugins","type":"address[]"},{"internalType":"string[]","name":"data","type":"string[]"}],"name":"route","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]
    }
  };

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn) {
    var module = { exports: {} };
  	return fn(module, module.exports), module.exports;
  }

  var bn = createCommonjsModule(function (module) {
  (function (module, exports) {

    // Utils
    function assert (val, msg) {
      if (!val) throw new Error(msg || 'Assertion failed');
    }

    // Could use `inherits` module, but don't want to move from single file
    // architecture yet.
    function inherits (ctor, superCtor) {
      ctor.super_ = superCtor;
      var TempCtor = function () {};
      TempCtor.prototype = superCtor.prototype;
      ctor.prototype = new TempCtor();
      ctor.prototype.constructor = ctor;
    }

    // BN

    function BN (number, base, endian) {
      if (BN.isBN(number)) {
        return number;
      }

      this.negative = 0;
      this.words = null;
      this.length = 0;

      // Reduction context
      this.red = null;

      if (number !== null) {
        if (base === 'le' || base === 'be') {
          endian = base;
          base = 10;
        }

        this._init(number || 0, base || 10, endian || 'be');
      }
    }
    if (typeof module === 'object') {
      module.exports = BN;
    } else {
      exports.BN = BN;
    }

    BN.BN = BN;
    BN.wordSize = 26;

    var Buffer;
    try {
      if (typeof window !== 'undefined' && typeof window.Buffer !== 'undefined') {
        Buffer = window.Buffer;
      } else {
        Buffer = require$$0__default["default"].Buffer;
      }
    } catch (e) {
    }

    BN.isBN = function isBN (num) {
      if (num instanceof BN) {
        return true;
      }

      return num !== null && typeof num === 'object' &&
        num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
    };

    BN.max = function max (left, right) {
      if (left.cmp(right) > 0) return left;
      return right;
    };

    BN.min = function min (left, right) {
      if (left.cmp(right) < 0) return left;
      return right;
    };

    BN.prototype._init = function init (number, base, endian) {
      if (typeof number === 'number') {
        return this._initNumber(number, base, endian);
      }

      if (typeof number === 'object') {
        return this._initArray(number, base, endian);
      }

      if (base === 'hex') {
        base = 16;
      }
      assert(base === (base | 0) && base >= 2 && base <= 36);

      number = number.toString().replace(/\s+/g, '');
      var start = 0;
      if (number[0] === '-') {
        start++;
        this.negative = 1;
      }

      if (start < number.length) {
        if (base === 16) {
          this._parseHex(number, start, endian);
        } else {
          this._parseBase(number, base, start);
          if (endian === 'le') {
            this._initArray(this.toArray(), base, endian);
          }
        }
      }
    };

    BN.prototype._initNumber = function _initNumber (number, base, endian) {
      if (number < 0) {
        this.negative = 1;
        number = -number;
      }
      if (number < 0x4000000) {
        this.words = [ number & 0x3ffffff ];
        this.length = 1;
      } else if (number < 0x10000000000000) {
        this.words = [
          number & 0x3ffffff,
          (number / 0x4000000) & 0x3ffffff
        ];
        this.length = 2;
      } else {
        assert(number < 0x20000000000000); // 2 ^ 53 (unsafe)
        this.words = [
          number & 0x3ffffff,
          (number / 0x4000000) & 0x3ffffff,
          1
        ];
        this.length = 3;
      }

      if (endian !== 'le') return;

      // Reverse the bytes
      this._initArray(this.toArray(), base, endian);
    };

    BN.prototype._initArray = function _initArray (number, base, endian) {
      // Perhaps a Uint8Array
      assert(typeof number.length === 'number');
      if (number.length <= 0) {
        this.words = [ 0 ];
        this.length = 1;
        return this;
      }

      this.length = Math.ceil(number.length / 3);
      this.words = new Array(this.length);
      for (var i = 0; i < this.length; i++) {
        this.words[i] = 0;
      }

      var j, w;
      var off = 0;
      if (endian === 'be') {
        for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
          w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
          this.words[j] |= (w << off) & 0x3ffffff;
          this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
          off += 24;
          if (off >= 26) {
            off -= 26;
            j++;
          }
        }
      } else if (endian === 'le') {
        for (i = 0, j = 0; i < number.length; i += 3) {
          w = number[i] | (number[i + 1] << 8) | (number[i + 2] << 16);
          this.words[j] |= (w << off) & 0x3ffffff;
          this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
          off += 24;
          if (off >= 26) {
            off -= 26;
            j++;
          }
        }
      }
      return this.strip();
    };

    function parseHex4Bits (string, index) {
      var c = string.charCodeAt(index);
      // 'A' - 'F'
      if (c >= 65 && c <= 70) {
        return c - 55;
      // 'a' - 'f'
      } else if (c >= 97 && c <= 102) {
        return c - 87;
      // '0' - '9'
      } else {
        return (c - 48) & 0xf;
      }
    }

    function parseHexByte (string, lowerBound, index) {
      var r = parseHex4Bits(string, index);
      if (index - 1 >= lowerBound) {
        r |= parseHex4Bits(string, index - 1) << 4;
      }
      return r;
    }

    BN.prototype._parseHex = function _parseHex (number, start, endian) {
      // Create possibly bigger array to ensure that it fits the number
      this.length = Math.ceil((number.length - start) / 6);
      this.words = new Array(this.length);
      for (var i = 0; i < this.length; i++) {
        this.words[i] = 0;
      }

      // 24-bits chunks
      var off = 0;
      var j = 0;

      var w;
      if (endian === 'be') {
        for (i = number.length - 1; i >= start; i -= 2) {
          w = parseHexByte(number, start, i) << off;
          this.words[j] |= w & 0x3ffffff;
          if (off >= 18) {
            off -= 18;
            j += 1;
            this.words[j] |= w >>> 26;
          } else {
            off += 8;
          }
        }
      } else {
        var parseLength = number.length - start;
        for (i = parseLength % 2 === 0 ? start + 1 : start; i < number.length; i += 2) {
          w = parseHexByte(number, start, i) << off;
          this.words[j] |= w & 0x3ffffff;
          if (off >= 18) {
            off -= 18;
            j += 1;
            this.words[j] |= w >>> 26;
          } else {
            off += 8;
          }
        }
      }

      this.strip();
    };

    function parseBase (str, start, end, mul) {
      var r = 0;
      var len = Math.min(str.length, end);
      for (var i = start; i < len; i++) {
        var c = str.charCodeAt(i) - 48;

        r *= mul;

        // 'a'
        if (c >= 49) {
          r += c - 49 + 0xa;

        // 'A'
        } else if (c >= 17) {
          r += c - 17 + 0xa;

        // '0' - '9'
        } else {
          r += c;
        }
      }
      return r;
    }

    BN.prototype._parseBase = function _parseBase (number, base, start) {
      // Initialize as zero
      this.words = [ 0 ];
      this.length = 1;

      // Find length of limb in base
      for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base) {
        limbLen++;
      }
      limbLen--;
      limbPow = (limbPow / base) | 0;

      var total = number.length - start;
      var mod = total % limbLen;
      var end = Math.min(total, total - mod) + start;

      var word = 0;
      for (var i = start; i < end; i += limbLen) {
        word = parseBase(number, i, i + limbLen, base);

        this.imuln(limbPow);
        if (this.words[0] + word < 0x4000000) {
          this.words[0] += word;
        } else {
          this._iaddn(word);
        }
      }

      if (mod !== 0) {
        var pow = 1;
        word = parseBase(number, i, number.length, base);

        for (i = 0; i < mod; i++) {
          pow *= base;
        }

        this.imuln(pow);
        if (this.words[0] + word < 0x4000000) {
          this.words[0] += word;
        } else {
          this._iaddn(word);
        }
      }

      this.strip();
    };

    BN.prototype.copy = function copy (dest) {
      dest.words = new Array(this.length);
      for (var i = 0; i < this.length; i++) {
        dest.words[i] = this.words[i];
      }
      dest.length = this.length;
      dest.negative = this.negative;
      dest.red = this.red;
    };

    BN.prototype.clone = function clone () {
      var r = new BN(null);
      this.copy(r);
      return r;
    };

    BN.prototype._expand = function _expand (size) {
      while (this.length < size) {
        this.words[this.length++] = 0;
      }
      return this;
    };

    // Remove leading `0` from `this`
    BN.prototype.strip = function strip () {
      while (this.length > 1 && this.words[this.length - 1] === 0) {
        this.length--;
      }
      return this._normSign();
    };

    BN.prototype._normSign = function _normSign () {
      // -0 = 0
      if (this.length === 1 && this.words[0] === 0) {
        this.negative = 0;
      }
      return this;
    };

    BN.prototype.inspect = function inspect () {
      return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
    };

    /*

    var zeros = [];
    var groupSizes = [];
    var groupBases = [];

    var s = '';
    var i = -1;
    while (++i < BN.wordSize) {
      zeros[i] = s;
      s += '0';
    }
    groupSizes[0] = 0;
    groupSizes[1] = 0;
    groupBases[0] = 0;
    groupBases[1] = 0;
    var base = 2 - 1;
    while (++base < 36 + 1) {
      var groupSize = 0;
      var groupBase = 1;
      while (groupBase < (1 << BN.wordSize) / base) {
        groupBase *= base;
        groupSize += 1;
      }
      groupSizes[base] = groupSize;
      groupBases[base] = groupBase;
    }

    */

    var zeros = [
      '',
      '0',
      '00',
      '000',
      '0000',
      '00000',
      '000000',
      '0000000',
      '00000000',
      '000000000',
      '0000000000',
      '00000000000',
      '000000000000',
      '0000000000000',
      '00000000000000',
      '000000000000000',
      '0000000000000000',
      '00000000000000000',
      '000000000000000000',
      '0000000000000000000',
      '00000000000000000000',
      '000000000000000000000',
      '0000000000000000000000',
      '00000000000000000000000',
      '000000000000000000000000',
      '0000000000000000000000000'
    ];

    var groupSizes = [
      0, 0,
      25, 16, 12, 11, 10, 9, 8,
      8, 7, 7, 7, 7, 6, 6,
      6, 6, 6, 6, 6, 5, 5,
      5, 5, 5, 5, 5, 5, 5,
      5, 5, 5, 5, 5, 5, 5
    ];

    var groupBases = [
      0, 0,
      33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216,
      43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625,
      16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632,
      6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149,
      24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176
    ];

    BN.prototype.toString = function toString (base, padding) {
      base = base || 10;
      padding = padding | 0 || 1;

      var out;
      if (base === 16 || base === 'hex') {
        out = '';
        var off = 0;
        var carry = 0;
        for (var i = 0; i < this.length; i++) {
          var w = this.words[i];
          var word = (((w << off) | carry) & 0xffffff).toString(16);
          carry = (w >>> (24 - off)) & 0xffffff;
          if (carry !== 0 || i !== this.length - 1) {
            out = zeros[6 - word.length] + word + out;
          } else {
            out = word + out;
          }
          off += 2;
          if (off >= 26) {
            off -= 26;
            i--;
          }
        }
        if (carry !== 0) {
          out = carry.toString(16) + out;
        }
        while (out.length % padding !== 0) {
          out = '0' + out;
        }
        if (this.negative !== 0) {
          out = '-' + out;
        }
        return out;
      }

      if (base === (base | 0) && base >= 2 && base <= 36) {
        // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
        var groupSize = groupSizes[base];
        // var groupBase = Math.pow(base, groupSize);
        var groupBase = groupBases[base];
        out = '';
        var c = this.clone();
        c.negative = 0;
        while (!c.isZero()) {
          var r = c.modn(groupBase).toString(base);
          c = c.idivn(groupBase);

          if (!c.isZero()) {
            out = zeros[groupSize - r.length] + r + out;
          } else {
            out = r + out;
          }
        }
        if (this.isZero()) {
          out = '0' + out;
        }
        while (out.length % padding !== 0) {
          out = '0' + out;
        }
        if (this.negative !== 0) {
          out = '-' + out;
        }
        return out;
      }

      assert(false, 'Base should be between 2 and 36');
    };

    BN.prototype.toNumber = function toNumber () {
      var ret = this.words[0];
      if (this.length === 2) {
        ret += this.words[1] * 0x4000000;
      } else if (this.length === 3 && this.words[2] === 0x01) {
        // NOTE: at this stage it is known that the top bit is set
        ret += 0x10000000000000 + (this.words[1] * 0x4000000);
      } else if (this.length > 2) {
        assert(false, 'Number can only safely store up to 53 bits');
      }
      return (this.negative !== 0) ? -ret : ret;
    };

    BN.prototype.toJSON = function toJSON () {
      return this.toString(16);
    };

    BN.prototype.toBuffer = function toBuffer (endian, length) {
      assert(typeof Buffer !== 'undefined');
      return this.toArrayLike(Buffer, endian, length);
    };

    BN.prototype.toArray = function toArray (endian, length) {
      return this.toArrayLike(Array, endian, length);
    };

    BN.prototype.toArrayLike = function toArrayLike (ArrayType, endian, length) {
      var byteLength = this.byteLength();
      var reqLength = length || Math.max(1, byteLength);
      assert(byteLength <= reqLength, 'byte array longer than desired length');
      assert(reqLength > 0, 'Requested array length <= 0');

      this.strip();
      var littleEndian = endian === 'le';
      var res = new ArrayType(reqLength);

      var b, i;
      var q = this.clone();
      if (!littleEndian) {
        // Assume big-endian
        for (i = 0; i < reqLength - byteLength; i++) {
          res[i] = 0;
        }

        for (i = 0; !q.isZero(); i++) {
          b = q.andln(0xff);
          q.iushrn(8);

          res[reqLength - i - 1] = b;
        }
      } else {
        for (i = 0; !q.isZero(); i++) {
          b = q.andln(0xff);
          q.iushrn(8);

          res[i] = b;
        }

        for (; i < reqLength; i++) {
          res[i] = 0;
        }
      }

      return res;
    };

    if (Math.clz32) {
      BN.prototype._countBits = function _countBits (w) {
        return 32 - Math.clz32(w);
      };
    } else {
      BN.prototype._countBits = function _countBits (w) {
        var t = w;
        var r = 0;
        if (t >= 0x1000) {
          r += 13;
          t >>>= 13;
        }
        if (t >= 0x40) {
          r += 7;
          t >>>= 7;
        }
        if (t >= 0x8) {
          r += 4;
          t >>>= 4;
        }
        if (t >= 0x02) {
          r += 2;
          t >>>= 2;
        }
        return r + t;
      };
    }

    BN.prototype._zeroBits = function _zeroBits (w) {
      // Short-cut
      if (w === 0) return 26;

      var t = w;
      var r = 0;
      if ((t & 0x1fff) === 0) {
        r += 13;
        t >>>= 13;
      }
      if ((t & 0x7f) === 0) {
        r += 7;
        t >>>= 7;
      }
      if ((t & 0xf) === 0) {
        r += 4;
        t >>>= 4;
      }
      if ((t & 0x3) === 0) {
        r += 2;
        t >>>= 2;
      }
      if ((t & 0x1) === 0) {
        r++;
      }
      return r;
    };

    // Return number of used bits in a BN
    BN.prototype.bitLength = function bitLength () {
      var w = this.words[this.length - 1];
      var hi = this._countBits(w);
      return (this.length - 1) * 26 + hi;
    };

    function toBitArray (num) {
      var w = new Array(num.bitLength());

      for (var bit = 0; bit < w.length; bit++) {
        var off = (bit / 26) | 0;
        var wbit = bit % 26;

        w[bit] = (num.words[off] & (1 << wbit)) >>> wbit;
      }

      return w;
    }

    // Number of trailing zero bits
    BN.prototype.zeroBits = function zeroBits () {
      if (this.isZero()) return 0;

      var r = 0;
      for (var i = 0; i < this.length; i++) {
        var b = this._zeroBits(this.words[i]);
        r += b;
        if (b !== 26) break;
      }
      return r;
    };

    BN.prototype.byteLength = function byteLength () {
      return Math.ceil(this.bitLength() / 8);
    };

    BN.prototype.toTwos = function toTwos (width) {
      if (this.negative !== 0) {
        return this.abs().inotn(width).iaddn(1);
      }
      return this.clone();
    };

    BN.prototype.fromTwos = function fromTwos (width) {
      if (this.testn(width - 1)) {
        return this.notn(width).iaddn(1).ineg();
      }
      return this.clone();
    };

    BN.prototype.isNeg = function isNeg () {
      return this.negative !== 0;
    };

    // Return negative clone of `this`
    BN.prototype.neg = function neg () {
      return this.clone().ineg();
    };

    BN.prototype.ineg = function ineg () {
      if (!this.isZero()) {
        this.negative ^= 1;
      }

      return this;
    };

    // Or `num` with `this` in-place
    BN.prototype.iuor = function iuor (num) {
      while (this.length < num.length) {
        this.words[this.length++] = 0;
      }

      for (var i = 0; i < num.length; i++) {
        this.words[i] = this.words[i] | num.words[i];
      }

      return this.strip();
    };

    BN.prototype.ior = function ior (num) {
      assert((this.negative | num.negative) === 0);
      return this.iuor(num);
    };

    // Or `num` with `this`
    BN.prototype.or = function or (num) {
      if (this.length > num.length) return this.clone().ior(num);
      return num.clone().ior(this);
    };

    BN.prototype.uor = function uor (num) {
      if (this.length > num.length) return this.clone().iuor(num);
      return num.clone().iuor(this);
    };

    // And `num` with `this` in-place
    BN.prototype.iuand = function iuand (num) {
      // b = min-length(num, this)
      var b;
      if (this.length > num.length) {
        b = num;
      } else {
        b = this;
      }

      for (var i = 0; i < b.length; i++) {
        this.words[i] = this.words[i] & num.words[i];
      }

      this.length = b.length;

      return this.strip();
    };

    BN.prototype.iand = function iand (num) {
      assert((this.negative | num.negative) === 0);
      return this.iuand(num);
    };

    // And `num` with `this`
    BN.prototype.and = function and (num) {
      if (this.length > num.length) return this.clone().iand(num);
      return num.clone().iand(this);
    };

    BN.prototype.uand = function uand (num) {
      if (this.length > num.length) return this.clone().iuand(num);
      return num.clone().iuand(this);
    };

    // Xor `num` with `this` in-place
    BN.prototype.iuxor = function iuxor (num) {
      // a.length > b.length
      var a;
      var b;
      if (this.length > num.length) {
        a = this;
        b = num;
      } else {
        a = num;
        b = this;
      }

      for (var i = 0; i < b.length; i++) {
        this.words[i] = a.words[i] ^ b.words[i];
      }

      if (this !== a) {
        for (; i < a.length; i++) {
          this.words[i] = a.words[i];
        }
      }

      this.length = a.length;

      return this.strip();
    };

    BN.prototype.ixor = function ixor (num) {
      assert((this.negative | num.negative) === 0);
      return this.iuxor(num);
    };

    // Xor `num` with `this`
    BN.prototype.xor = function xor (num) {
      if (this.length > num.length) return this.clone().ixor(num);
      return num.clone().ixor(this);
    };

    BN.prototype.uxor = function uxor (num) {
      if (this.length > num.length) return this.clone().iuxor(num);
      return num.clone().iuxor(this);
    };

    // Not ``this`` with ``width`` bitwidth
    BN.prototype.inotn = function inotn (width) {
      assert(typeof width === 'number' && width >= 0);

      var bytesNeeded = Math.ceil(width / 26) | 0;
      var bitsLeft = width % 26;

      // Extend the buffer with leading zeroes
      this._expand(bytesNeeded);

      if (bitsLeft > 0) {
        bytesNeeded--;
      }

      // Handle complete words
      for (var i = 0; i < bytesNeeded; i++) {
        this.words[i] = ~this.words[i] & 0x3ffffff;
      }

      // Handle the residue
      if (bitsLeft > 0) {
        this.words[i] = ~this.words[i] & (0x3ffffff >> (26 - bitsLeft));
      }

      // And remove leading zeroes
      return this.strip();
    };

    BN.prototype.notn = function notn (width) {
      return this.clone().inotn(width);
    };

    // Set `bit` of `this`
    BN.prototype.setn = function setn (bit, val) {
      assert(typeof bit === 'number' && bit >= 0);

      var off = (bit / 26) | 0;
      var wbit = bit % 26;

      this._expand(off + 1);

      if (val) {
        this.words[off] = this.words[off] | (1 << wbit);
      } else {
        this.words[off] = this.words[off] & ~(1 << wbit);
      }

      return this.strip();
    };

    // Add `num` to `this` in-place
    BN.prototype.iadd = function iadd (num) {
      var r;

      // negative + positive
      if (this.negative !== 0 && num.negative === 0) {
        this.negative = 0;
        r = this.isub(num);
        this.negative ^= 1;
        return this._normSign();

      // positive + negative
      } else if (this.negative === 0 && num.negative !== 0) {
        num.negative = 0;
        r = this.isub(num);
        num.negative = 1;
        return r._normSign();
      }

      // a.length > b.length
      var a, b;
      if (this.length > num.length) {
        a = this;
        b = num;
      } else {
        a = num;
        b = this;
      }

      var carry = 0;
      for (var i = 0; i < b.length; i++) {
        r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
        this.words[i] = r & 0x3ffffff;
        carry = r >>> 26;
      }
      for (; carry !== 0 && i < a.length; i++) {
        r = (a.words[i] | 0) + carry;
        this.words[i] = r & 0x3ffffff;
        carry = r >>> 26;
      }

      this.length = a.length;
      if (carry !== 0) {
        this.words[this.length] = carry;
        this.length++;
      // Copy the rest of the words
      } else if (a !== this) {
        for (; i < a.length; i++) {
          this.words[i] = a.words[i];
        }
      }

      return this;
    };

    // Add `num` to `this`
    BN.prototype.add = function add (num) {
      var res;
      if (num.negative !== 0 && this.negative === 0) {
        num.negative = 0;
        res = this.sub(num);
        num.negative ^= 1;
        return res;
      } else if (num.negative === 0 && this.negative !== 0) {
        this.negative = 0;
        res = num.sub(this);
        this.negative = 1;
        return res;
      }

      if (this.length > num.length) return this.clone().iadd(num);

      return num.clone().iadd(this);
    };

    // Subtract `num` from `this` in-place
    BN.prototype.isub = function isub (num) {
      // this - (-num) = this + num
      if (num.negative !== 0) {
        num.negative = 0;
        var r = this.iadd(num);
        num.negative = 1;
        return r._normSign();

      // -this - num = -(this + num)
      } else if (this.negative !== 0) {
        this.negative = 0;
        this.iadd(num);
        this.negative = 1;
        return this._normSign();
      }

      // At this point both numbers are positive
      var cmp = this.cmp(num);

      // Optimization - zeroify
      if (cmp === 0) {
        this.negative = 0;
        this.length = 1;
        this.words[0] = 0;
        return this;
      }

      // a > b
      var a, b;
      if (cmp > 0) {
        a = this;
        b = num;
      } else {
        a = num;
        b = this;
      }

      var carry = 0;
      for (var i = 0; i < b.length; i++) {
        r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
        carry = r >> 26;
        this.words[i] = r & 0x3ffffff;
      }
      for (; carry !== 0 && i < a.length; i++) {
        r = (a.words[i] | 0) + carry;
        carry = r >> 26;
        this.words[i] = r & 0x3ffffff;
      }

      // Copy rest of the words
      if (carry === 0 && i < a.length && a !== this) {
        for (; i < a.length; i++) {
          this.words[i] = a.words[i];
        }
      }

      this.length = Math.max(this.length, i);

      if (a !== this) {
        this.negative = 1;
      }

      return this.strip();
    };

    // Subtract `num` from `this`
    BN.prototype.sub = function sub (num) {
      return this.clone().isub(num);
    };

    function smallMulTo (self, num, out) {
      out.negative = num.negative ^ self.negative;
      var len = (self.length + num.length) | 0;
      out.length = len;
      len = (len - 1) | 0;

      // Peel one iteration (compiler can't do it, because of code complexity)
      var a = self.words[0] | 0;
      var b = num.words[0] | 0;
      var r = a * b;

      var lo = r & 0x3ffffff;
      var carry = (r / 0x4000000) | 0;
      out.words[0] = lo;

      for (var k = 1; k < len; k++) {
        // Sum all words with the same `i + j = k` and accumulate `ncarry`,
        // note that ncarry could be >= 0x3ffffff
        var ncarry = carry >>> 26;
        var rword = carry & 0x3ffffff;
        var maxJ = Math.min(k, num.length - 1);
        for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
          var i = (k - j) | 0;
          a = self.words[i] | 0;
          b = num.words[j] | 0;
          r = a * b + rword;
          ncarry += (r / 0x4000000) | 0;
          rword = r & 0x3ffffff;
        }
        out.words[k] = rword | 0;
        carry = ncarry | 0;
      }
      if (carry !== 0) {
        out.words[k] = carry | 0;
      } else {
        out.length--;
      }

      return out.strip();
    }

    // TODO(indutny): it may be reasonable to omit it for users who don't need
    // to work with 256-bit numbers, otherwise it gives 20% improvement for 256-bit
    // multiplication (like elliptic secp256k1).
    var comb10MulTo = function comb10MulTo (self, num, out) {
      var a = self.words;
      var b = num.words;
      var o = out.words;
      var c = 0;
      var lo;
      var mid;
      var hi;
      var a0 = a[0] | 0;
      var al0 = a0 & 0x1fff;
      var ah0 = a0 >>> 13;
      var a1 = a[1] | 0;
      var al1 = a1 & 0x1fff;
      var ah1 = a1 >>> 13;
      var a2 = a[2] | 0;
      var al2 = a2 & 0x1fff;
      var ah2 = a2 >>> 13;
      var a3 = a[3] | 0;
      var al3 = a3 & 0x1fff;
      var ah3 = a3 >>> 13;
      var a4 = a[4] | 0;
      var al4 = a4 & 0x1fff;
      var ah4 = a4 >>> 13;
      var a5 = a[5] | 0;
      var al5 = a5 & 0x1fff;
      var ah5 = a5 >>> 13;
      var a6 = a[6] | 0;
      var al6 = a6 & 0x1fff;
      var ah6 = a6 >>> 13;
      var a7 = a[7] | 0;
      var al7 = a7 & 0x1fff;
      var ah7 = a7 >>> 13;
      var a8 = a[8] | 0;
      var al8 = a8 & 0x1fff;
      var ah8 = a8 >>> 13;
      var a9 = a[9] | 0;
      var al9 = a9 & 0x1fff;
      var ah9 = a9 >>> 13;
      var b0 = b[0] | 0;
      var bl0 = b0 & 0x1fff;
      var bh0 = b0 >>> 13;
      var b1 = b[1] | 0;
      var bl1 = b1 & 0x1fff;
      var bh1 = b1 >>> 13;
      var b2 = b[2] | 0;
      var bl2 = b2 & 0x1fff;
      var bh2 = b2 >>> 13;
      var b3 = b[3] | 0;
      var bl3 = b3 & 0x1fff;
      var bh3 = b3 >>> 13;
      var b4 = b[4] | 0;
      var bl4 = b4 & 0x1fff;
      var bh4 = b4 >>> 13;
      var b5 = b[5] | 0;
      var bl5 = b5 & 0x1fff;
      var bh5 = b5 >>> 13;
      var b6 = b[6] | 0;
      var bl6 = b6 & 0x1fff;
      var bh6 = b6 >>> 13;
      var b7 = b[7] | 0;
      var bl7 = b7 & 0x1fff;
      var bh7 = b7 >>> 13;
      var b8 = b[8] | 0;
      var bl8 = b8 & 0x1fff;
      var bh8 = b8 >>> 13;
      var b9 = b[9] | 0;
      var bl9 = b9 & 0x1fff;
      var bh9 = b9 >>> 13;

      out.negative = self.negative ^ num.negative;
      out.length = 19;
      /* k = 0 */
      lo = Math.imul(al0, bl0);
      mid = Math.imul(al0, bh0);
      mid = (mid + Math.imul(ah0, bl0)) | 0;
      hi = Math.imul(ah0, bh0);
      var w0 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
      c = (((hi + (mid >>> 13)) | 0) + (w0 >>> 26)) | 0;
      w0 &= 0x3ffffff;
      /* k = 1 */
      lo = Math.imul(al1, bl0);
      mid = Math.imul(al1, bh0);
      mid = (mid + Math.imul(ah1, bl0)) | 0;
      hi = Math.imul(ah1, bh0);
      lo = (lo + Math.imul(al0, bl1)) | 0;
      mid = (mid + Math.imul(al0, bh1)) | 0;
      mid = (mid + Math.imul(ah0, bl1)) | 0;
      hi = (hi + Math.imul(ah0, bh1)) | 0;
      var w1 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
      c = (((hi + (mid >>> 13)) | 0) + (w1 >>> 26)) | 0;
      w1 &= 0x3ffffff;
      /* k = 2 */
      lo = Math.imul(al2, bl0);
      mid = Math.imul(al2, bh0);
      mid = (mid + Math.imul(ah2, bl0)) | 0;
      hi = Math.imul(ah2, bh0);
      lo = (lo + Math.imul(al1, bl1)) | 0;
      mid = (mid + Math.imul(al1, bh1)) | 0;
      mid = (mid + Math.imul(ah1, bl1)) | 0;
      hi = (hi + Math.imul(ah1, bh1)) | 0;
      lo = (lo + Math.imul(al0, bl2)) | 0;
      mid = (mid + Math.imul(al0, bh2)) | 0;
      mid = (mid + Math.imul(ah0, bl2)) | 0;
      hi = (hi + Math.imul(ah0, bh2)) | 0;
      var w2 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
      c = (((hi + (mid >>> 13)) | 0) + (w2 >>> 26)) | 0;
      w2 &= 0x3ffffff;
      /* k = 3 */
      lo = Math.imul(al3, bl0);
      mid = Math.imul(al3, bh0);
      mid = (mid + Math.imul(ah3, bl0)) | 0;
      hi = Math.imul(ah3, bh0);
      lo = (lo + Math.imul(al2, bl1)) | 0;
      mid = (mid + Math.imul(al2, bh1)) | 0;
      mid = (mid + Math.imul(ah2, bl1)) | 0;
      hi = (hi + Math.imul(ah2, bh1)) | 0;
      lo = (lo + Math.imul(al1, bl2)) | 0;
      mid = (mid + Math.imul(al1, bh2)) | 0;
      mid = (mid + Math.imul(ah1, bl2)) | 0;
      hi = (hi + Math.imul(ah1, bh2)) | 0;
      lo = (lo + Math.imul(al0, bl3)) | 0;
      mid = (mid + Math.imul(al0, bh3)) | 0;
      mid = (mid + Math.imul(ah0, bl3)) | 0;
      hi = (hi + Math.imul(ah0, bh3)) | 0;
      var w3 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
      c = (((hi + (mid >>> 13)) | 0) + (w3 >>> 26)) | 0;
      w3 &= 0x3ffffff;
      /* k = 4 */
      lo = Math.imul(al4, bl0);
      mid = Math.imul(al4, bh0);
      mid = (mid + Math.imul(ah4, bl0)) | 0;
      hi = Math.imul(ah4, bh0);
      lo = (lo + Math.imul(al3, bl1)) | 0;
      mid = (mid + Math.imul(al3, bh1)) | 0;
      mid = (mid + Math.imul(ah3, bl1)) | 0;
      hi = (hi + Math.imul(ah3, bh1)) | 0;
      lo = (lo + Math.imul(al2, bl2)) | 0;
      mid = (mid + Math.imul(al2, bh2)) | 0;
      mid = (mid + Math.imul(ah2, bl2)) | 0;
      hi = (hi + Math.imul(ah2, bh2)) | 0;
      lo = (lo + Math.imul(al1, bl3)) | 0;
      mid = (mid + Math.imul(al1, bh3)) | 0;
      mid = (mid + Math.imul(ah1, bl3)) | 0;
      hi = (hi + Math.imul(ah1, bh3)) | 0;
      lo = (lo + Math.imul(al0, bl4)) | 0;
      mid = (mid + Math.imul(al0, bh4)) | 0;
      mid = (mid + Math.imul(ah0, bl4)) | 0;
      hi = (hi + Math.imul(ah0, bh4)) | 0;
      var w4 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
      c = (((hi + (mid >>> 13)) | 0) + (w4 >>> 26)) | 0;
      w4 &= 0x3ffffff;
      /* k = 5 */
      lo = Math.imul(al5, bl0);
      mid = Math.imul(al5, bh0);
      mid = (mid + Math.imul(ah5, bl0)) | 0;
      hi = Math.imul(ah5, bh0);
      lo = (lo + Math.imul(al4, bl1)) | 0;
      mid = (mid + Math.imul(al4, bh1)) | 0;
      mid = (mid + Math.imul(ah4, bl1)) | 0;
      hi = (hi + Math.imul(ah4, bh1)) | 0;
      lo = (lo + Math.imul(al3, bl2)) | 0;
      mid = (mid + Math.imul(al3, bh2)) | 0;
      mid = (mid + Math.imul(ah3, bl2)) | 0;
      hi = (hi + Math.imul(ah3, bh2)) | 0;
      lo = (lo + Math.imul(al2, bl3)) | 0;
      mid = (mid + Math.imul(al2, bh3)) | 0;
      mid = (mid + Math.imul(ah2, bl3)) | 0;
      hi = (hi + Math.imul(ah2, bh3)) | 0;
      lo = (lo + Math.imul(al1, bl4)) | 0;
      mid = (mid + Math.imul(al1, bh4)) | 0;
      mid = (mid + Math.imul(ah1, bl4)) | 0;
      hi = (hi + Math.imul(ah1, bh4)) | 0;
      lo = (lo + Math.imul(al0, bl5)) | 0;
      mid = (mid + Math.imul(al0, bh5)) | 0;
      mid = (mid + Math.imul(ah0, bl5)) | 0;
      hi = (hi + Math.imul(ah0, bh5)) | 0;
      var w5 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
      c = (((hi + (mid >>> 13)) | 0) + (w5 >>> 26)) | 0;
      w5 &= 0x3ffffff;
      /* k = 6 */
      lo = Math.imul(al6, bl0);
      mid = Math.imul(al6, bh0);
      mid = (mid + Math.imul(ah6, bl0)) | 0;
      hi = Math.imul(ah6, bh0);
      lo = (lo + Math.imul(al5, bl1)) | 0;
      mid = (mid + Math.imul(al5, bh1)) | 0;
      mid = (mid + Math.imul(ah5, bl1)) | 0;
      hi = (hi + Math.imul(ah5, bh1)) | 0;
      lo = (lo + Math.imul(al4, bl2)) | 0;
      mid = (mid + Math.imul(al4, bh2)) | 0;
      mid = (mid + Math.imul(ah4, bl2)) | 0;
      hi = (hi + Math.imul(ah4, bh2)) | 0;
      lo = (lo + Math.imul(al3, bl3)) | 0;
      mid = (mid + Math.imul(al3, bh3)) | 0;
      mid = (mid + Math.imul(ah3, bl3)) | 0;
      hi = (hi + Math.imul(ah3, bh3)) | 0;
      lo = (lo + Math.imul(al2, bl4)) | 0;
      mid = (mid + Math.imul(al2, bh4)) | 0;
      mid = (mid + Math.imul(ah2, bl4)) | 0;
      hi = (hi + Math.imul(ah2, bh4)) | 0;
      lo = (lo + Math.imul(al1, bl5)) | 0;
      mid = (mid + Math.imul(al1, bh5)) | 0;
      mid = (mid + Math.imul(ah1, bl5)) | 0;
      hi = (hi + Math.imul(ah1, bh5)) | 0;
      lo = (lo + Math.imul(al0, bl6)) | 0;
      mid = (mid + Math.imul(al0, bh6)) | 0;
      mid = (mid + Math.imul(ah0, bl6)) | 0;
      hi = (hi + Math.imul(ah0, bh6)) | 0;
      var w6 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
      c = (((hi + (mid >>> 13)) | 0) + (w6 >>> 26)) | 0;
      w6 &= 0x3ffffff;
      /* k = 7 */
      lo = Math.imul(al7, bl0);
      mid = Math.imul(al7, bh0);
      mid = (mid + Math.imul(ah7, bl0)) | 0;
      hi = Math.imul(ah7, bh0);
      lo = (lo + Math.imul(al6, bl1)) | 0;
      mid = (mid + Math.imul(al6, bh1)) | 0;
      mid = (mid + Math.imul(ah6, bl1)) | 0;
      hi = (hi + Math.imul(ah6, bh1)) | 0;
      lo = (lo + Math.imul(al5, bl2)) | 0;
      mid = (mid + Math.imul(al5, bh2)) | 0;
      mid = (mid + Math.imul(ah5, bl2)) | 0;
      hi = (hi + Math.imul(ah5, bh2)) | 0;
      lo = (lo + Math.imul(al4, bl3)) | 0;
      mid = (mid + Math.imul(al4, bh3)) | 0;
      mid = (mid + Math.imul(ah4, bl3)) | 0;
      hi = (hi + Math.imul(ah4, bh3)) | 0;
      lo = (lo + Math.imul(al3, bl4)) | 0;
      mid = (mid + Math.imul(al3, bh4)) | 0;
      mid = (mid + Math.imul(ah3, bl4)) | 0;
      hi = (hi + Math.imul(ah3, bh4)) | 0;
      lo = (lo + Math.imul(al2, bl5)) | 0;
      mid = (mid + Math.imul(al2, bh5)) | 0;
      mid = (mid + Math.imul(ah2, bl5)) | 0;
      hi = (hi + Math.imul(ah2, bh5)) | 0;
      lo = (lo + Math.imul(al1, bl6)) | 0;
      mid = (mid + Math.imul(al1, bh6)) | 0;
      mid = (mid + Math.imul(ah1, bl6)) | 0;
      hi = (hi + Math.imul(ah1, bh6)) | 0;
      lo = (lo + Math.imul(al0, bl7)) | 0;
      mid = (mid + Math.imul(al0, bh7)) | 0;
      mid = (mid + Math.imul(ah0, bl7)) | 0;
      hi = (hi + Math.imul(ah0, bh7)) | 0;
      var w7 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
      c = (((hi + (mid >>> 13)) | 0) + (w7 >>> 26)) | 0;
      w7 &= 0x3ffffff;
      /* k = 8 */
      lo = Math.imul(al8, bl0);
      mid = Math.imul(al8, bh0);
      mid = (mid + Math.imul(ah8, bl0)) | 0;
      hi = Math.imul(ah8, bh0);
      lo = (lo + Math.imul(al7, bl1)) | 0;
      mid = (mid + Math.imul(al7, bh1)) | 0;
      mid = (mid + Math.imul(ah7, bl1)) | 0;
      hi = (hi + Math.imul(ah7, bh1)) | 0;
      lo = (lo + Math.imul(al6, bl2)) | 0;
      mid = (mid + Math.imul(al6, bh2)) | 0;
      mid = (mid + Math.imul(ah6, bl2)) | 0;
      hi = (hi + Math.imul(ah6, bh2)) | 0;
      lo = (lo + Math.imul(al5, bl3)) | 0;
      mid = (mid + Math.imul(al5, bh3)) | 0;
      mid = (mid + Math.imul(ah5, bl3)) | 0;
      hi = (hi + Math.imul(ah5, bh3)) | 0;
      lo = (lo + Math.imul(al4, bl4)) | 0;
      mid = (mid + Math.imul(al4, bh4)) | 0;
      mid = (mid + Math.imul(ah4, bl4)) | 0;
      hi = (hi + Math.imul(ah4, bh4)) | 0;
      lo = (lo + Math.imul(al3, bl5)) | 0;
      mid = (mid + Math.imul(al3, bh5)) | 0;
      mid = (mid + Math.imul(ah3, bl5)) | 0;
      hi = (hi + Math.imul(ah3, bh5)) | 0;
      lo = (lo + Math.imul(al2, bl6)) | 0;
      mid = (mid + Math.imul(al2, bh6)) | 0;
      mid = (mid + Math.imul(ah2, bl6)) | 0;
      hi = (hi + Math.imul(ah2, bh6)) | 0;
      lo = (lo + Math.imul(al1, bl7)) | 0;
      mid = (mid + Math.imul(al1, bh7)) | 0;
      mid = (mid + Math.imul(ah1, bl7)) | 0;
      hi = (hi + Math.imul(ah1, bh7)) | 0;
      lo = (lo + Math.imul(al0, bl8)) | 0;
      mid = (mid + Math.imul(al0, bh8)) | 0;
      mid = (mid + Math.imul(ah0, bl8)) | 0;
      hi = (hi + Math.imul(ah0, bh8)) | 0;
      var w8 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
      c = (((hi + (mid >>> 13)) | 0) + (w8 >>> 26)) | 0;
      w8 &= 0x3ffffff;
      /* k = 9 */
      lo = Math.imul(al9, bl0);
      mid = Math.imul(al9, bh0);
      mid = (mid + Math.imul(ah9, bl0)) | 0;
      hi = Math.imul(ah9, bh0);
      lo = (lo + Math.imul(al8, bl1)) | 0;
      mid = (mid + Math.imul(al8, bh1)) | 0;
      mid = (mid + Math.imul(ah8, bl1)) | 0;
      hi = (hi + Math.imul(ah8, bh1)) | 0;
      lo = (lo + Math.imul(al7, bl2)) | 0;
      mid = (mid + Math.imul(al7, bh2)) | 0;
      mid = (mid + Math.imul(ah7, bl2)) | 0;
      hi = (hi + Math.imul(ah7, bh2)) | 0;
      lo = (lo + Math.imul(al6, bl3)) | 0;
      mid = (mid + Math.imul(al6, bh3)) | 0;
      mid = (mid + Math.imul(ah6, bl3)) | 0;
      hi = (hi + Math.imul(ah6, bh3)) | 0;
      lo = (lo + Math.imul(al5, bl4)) | 0;
      mid = (mid + Math.imul(al5, bh4)) | 0;
      mid = (mid + Math.imul(ah5, bl4)) | 0;
      hi = (hi + Math.imul(ah5, bh4)) | 0;
      lo = (lo + Math.imul(al4, bl5)) | 0;
      mid = (mid + Math.imul(al4, bh5)) | 0;
      mid = (mid + Math.imul(ah4, bl5)) | 0;
      hi = (hi + Math.imul(ah4, bh5)) | 0;
      lo = (lo + Math.imul(al3, bl6)) | 0;
      mid = (mid + Math.imul(al3, bh6)) | 0;
      mid = (mid + Math.imul(ah3, bl6)) | 0;
      hi = (hi + Math.imul(ah3, bh6)) | 0;
      lo = (lo + Math.imul(al2, bl7)) | 0;
      mid = (mid + Math.imul(al2, bh7)) | 0;
      mid = (mid + Math.imul(ah2, bl7)) | 0;
      hi = (hi + Math.imul(ah2, bh7)) | 0;
      lo = (lo + Math.imul(al1, bl8)) | 0;
      mid = (mid + Math.imul(al1, bh8)) | 0;
      mid = (mid + Math.imul(ah1, bl8)) | 0;
      hi = (hi + Math.imul(ah1, bh8)) | 0;
      lo = (lo + Math.imul(al0, bl9)) | 0;
      mid = (mid + Math.imul(al0, bh9)) | 0;
      mid = (mid + Math.imul(ah0, bl9)) | 0;
      hi = (hi + Math.imul(ah0, bh9)) | 0;
      var w9 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
      c = (((hi + (mid >>> 13)) | 0) + (w9 >>> 26)) | 0;
      w9 &= 0x3ffffff;
      /* k = 10 */
      lo = Math.imul(al9, bl1);
      mid = Math.imul(al9, bh1);
      mid = (mid + Math.imul(ah9, bl1)) | 0;
      hi = Math.imul(ah9, bh1);
      lo = (lo + Math.imul(al8, bl2)) | 0;
      mid = (mid + Math.imul(al8, bh2)) | 0;
      mid = (mid + Math.imul(ah8, bl2)) | 0;
      hi = (hi + Math.imul(ah8, bh2)) | 0;
      lo = (lo + Math.imul(al7, bl3)) | 0;
      mid = (mid + Math.imul(al7, bh3)) | 0;
      mid = (mid + Math.imul(ah7, bl3)) | 0;
      hi = (hi + Math.imul(ah7, bh3)) | 0;
      lo = (lo + Math.imul(al6, bl4)) | 0;
      mid = (mid + Math.imul(al6, bh4)) | 0;
      mid = (mid + Math.imul(ah6, bl4)) | 0;
      hi = (hi + Math.imul(ah6, bh4)) | 0;
      lo = (lo + Math.imul(al5, bl5)) | 0;
      mid = (mid + Math.imul(al5, bh5)) | 0;
      mid = (mid + Math.imul(ah5, bl5)) | 0;
      hi = (hi + Math.imul(ah5, bh5)) | 0;
      lo = (lo + Math.imul(al4, bl6)) | 0;
      mid = (mid + Math.imul(al4, bh6)) | 0;
      mid = (mid + Math.imul(ah4, bl6)) | 0;
      hi = (hi + Math.imul(ah4, bh6)) | 0;
      lo = (lo + Math.imul(al3, bl7)) | 0;
      mid = (mid + Math.imul(al3, bh7)) | 0;
      mid = (mid + Math.imul(ah3, bl7)) | 0;
      hi = (hi + Math.imul(ah3, bh7)) | 0;
      lo = (lo + Math.imul(al2, bl8)) | 0;
      mid = (mid + Math.imul(al2, bh8)) | 0;
      mid = (mid + Math.imul(ah2, bl8)) | 0;
      hi = (hi + Math.imul(ah2, bh8)) | 0;
      lo = (lo + Math.imul(al1, bl9)) | 0;
      mid = (mid + Math.imul(al1, bh9)) | 0;
      mid = (mid + Math.imul(ah1, bl9)) | 0;
      hi = (hi + Math.imul(ah1, bh9)) | 0;
      var w10 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
      c = (((hi + (mid >>> 13)) | 0) + (w10 >>> 26)) | 0;
      w10 &= 0x3ffffff;
      /* k = 11 */
      lo = Math.imul(al9, bl2);
      mid = Math.imul(al9, bh2);
      mid = (mid + Math.imul(ah9, bl2)) | 0;
      hi = Math.imul(ah9, bh2);
      lo = (lo + Math.imul(al8, bl3)) | 0;
      mid = (mid + Math.imul(al8, bh3)) | 0;
      mid = (mid + Math.imul(ah8, bl3)) | 0;
      hi = (hi + Math.imul(ah8, bh3)) | 0;
      lo = (lo + Math.imul(al7, bl4)) | 0;
      mid = (mid + Math.imul(al7, bh4)) | 0;
      mid = (mid + Math.imul(ah7, bl4)) | 0;
      hi = (hi + Math.imul(ah7, bh4)) | 0;
      lo = (lo + Math.imul(al6, bl5)) | 0;
      mid = (mid + Math.imul(al6, bh5)) | 0;
      mid = (mid + Math.imul(ah6, bl5)) | 0;
      hi = (hi + Math.imul(ah6, bh5)) | 0;
      lo = (lo + Math.imul(al5, bl6)) | 0;
      mid = (mid + Math.imul(al5, bh6)) | 0;
      mid = (mid + Math.imul(ah5, bl6)) | 0;
      hi = (hi + Math.imul(ah5, bh6)) | 0;
      lo = (lo + Math.imul(al4, bl7)) | 0;
      mid = (mid + Math.imul(al4, bh7)) | 0;
      mid = (mid + Math.imul(ah4, bl7)) | 0;
      hi = (hi + Math.imul(ah4, bh7)) | 0;
      lo = (lo + Math.imul(al3, bl8)) | 0;
      mid = (mid + Math.imul(al3, bh8)) | 0;
      mid = (mid + Math.imul(ah3, bl8)) | 0;
      hi = (hi + Math.imul(ah3, bh8)) | 0;
      lo = (lo + Math.imul(al2, bl9)) | 0;
      mid = (mid + Math.imul(al2, bh9)) | 0;
      mid = (mid + Math.imul(ah2, bl9)) | 0;
      hi = (hi + Math.imul(ah2, bh9)) | 0;
      var w11 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
      c = (((hi + (mid >>> 13)) | 0) + (w11 >>> 26)) | 0;
      w11 &= 0x3ffffff;
      /* k = 12 */
      lo = Math.imul(al9, bl3);
      mid = Math.imul(al9, bh3);
      mid = (mid + Math.imul(ah9, bl3)) | 0;
      hi = Math.imul(ah9, bh3);
      lo = (lo + Math.imul(al8, bl4)) | 0;
      mid = (mid + Math.imul(al8, bh4)) | 0;
      mid = (mid + Math.imul(ah8, bl4)) | 0;
      hi = (hi + Math.imul(ah8, bh4)) | 0;
      lo = (lo + Math.imul(al7, bl5)) | 0;
      mid = (mid + Math.imul(al7, bh5)) | 0;
      mid = (mid + Math.imul(ah7, bl5)) | 0;
      hi = (hi + Math.imul(ah7, bh5)) | 0;
      lo = (lo + Math.imul(al6, bl6)) | 0;
      mid = (mid + Math.imul(al6, bh6)) | 0;
      mid = (mid + Math.imul(ah6, bl6)) | 0;
      hi = (hi + Math.imul(ah6, bh6)) | 0;
      lo = (lo + Math.imul(al5, bl7)) | 0;
      mid = (mid + Math.imul(al5, bh7)) | 0;
      mid = (mid + Math.imul(ah5, bl7)) | 0;
      hi = (hi + Math.imul(ah5, bh7)) | 0;
      lo = (lo + Math.imul(al4, bl8)) | 0;
      mid = (mid + Math.imul(al4, bh8)) | 0;
      mid = (mid + Math.imul(ah4, bl8)) | 0;
      hi = (hi + Math.imul(ah4, bh8)) | 0;
      lo = (lo + Math.imul(al3, bl9)) | 0;
      mid = (mid + Math.imul(al3, bh9)) | 0;
      mid = (mid + Math.imul(ah3, bl9)) | 0;
      hi = (hi + Math.imul(ah3, bh9)) | 0;
      var w12 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
      c = (((hi + (mid >>> 13)) | 0) + (w12 >>> 26)) | 0;
      w12 &= 0x3ffffff;
      /* k = 13 */
      lo = Math.imul(al9, bl4);
      mid = Math.imul(al9, bh4);
      mid = (mid + Math.imul(ah9, bl4)) | 0;
      hi = Math.imul(ah9, bh4);
      lo = (lo + Math.imul(al8, bl5)) | 0;
      mid = (mid + Math.imul(al8, bh5)) | 0;
      mid = (mid + Math.imul(ah8, bl5)) | 0;
      hi = (hi + Math.imul(ah8, bh5)) | 0;
      lo = (lo + Math.imul(al7, bl6)) | 0;
      mid = (mid + Math.imul(al7, bh6)) | 0;
      mid = (mid + Math.imul(ah7, bl6)) | 0;
      hi = (hi + Math.imul(ah7, bh6)) | 0;
      lo = (lo + Math.imul(al6, bl7)) | 0;
      mid = (mid + Math.imul(al6, bh7)) | 0;
      mid = (mid + Math.imul(ah6, bl7)) | 0;
      hi = (hi + Math.imul(ah6, bh7)) | 0;
      lo = (lo + Math.imul(al5, bl8)) | 0;
      mid = (mid + Math.imul(al5, bh8)) | 0;
      mid = (mid + Math.imul(ah5, bl8)) | 0;
      hi = (hi + Math.imul(ah5, bh8)) | 0;
      lo = (lo + Math.imul(al4, bl9)) | 0;
      mid = (mid + Math.imul(al4, bh9)) | 0;
      mid = (mid + Math.imul(ah4, bl9)) | 0;
      hi = (hi + Math.imul(ah4, bh9)) | 0;
      var w13 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
      c = (((hi + (mid >>> 13)) | 0) + (w13 >>> 26)) | 0;
      w13 &= 0x3ffffff;
      /* k = 14 */
      lo = Math.imul(al9, bl5);
      mid = Math.imul(al9, bh5);
      mid = (mid + Math.imul(ah9, bl5)) | 0;
      hi = Math.imul(ah9, bh5);
      lo = (lo + Math.imul(al8, bl6)) | 0;
      mid = (mid + Math.imul(al8, bh6)) | 0;
      mid = (mid + Math.imul(ah8, bl6)) | 0;
      hi = (hi + Math.imul(ah8, bh6)) | 0;
      lo = (lo + Math.imul(al7, bl7)) | 0;
      mid = (mid + Math.imul(al7, bh7)) | 0;
      mid = (mid + Math.imul(ah7, bl7)) | 0;
      hi = (hi + Math.imul(ah7, bh7)) | 0;
      lo = (lo + Math.imul(al6, bl8)) | 0;
      mid = (mid + Math.imul(al6, bh8)) | 0;
      mid = (mid + Math.imul(ah6, bl8)) | 0;
      hi = (hi + Math.imul(ah6, bh8)) | 0;
      lo = (lo + Math.imul(al5, bl9)) | 0;
      mid = (mid + Math.imul(al5, bh9)) | 0;
      mid = (mid + Math.imul(ah5, bl9)) | 0;
      hi = (hi + Math.imul(ah5, bh9)) | 0;
      var w14 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
      c = (((hi + (mid >>> 13)) | 0) + (w14 >>> 26)) | 0;
      w14 &= 0x3ffffff;
      /* k = 15 */
      lo = Math.imul(al9, bl6);
      mid = Math.imul(al9, bh6);
      mid = (mid + Math.imul(ah9, bl6)) | 0;
      hi = Math.imul(ah9, bh6);
      lo = (lo + Math.imul(al8, bl7)) | 0;
      mid = (mid + Math.imul(al8, bh7)) | 0;
      mid = (mid + Math.imul(ah8, bl7)) | 0;
      hi = (hi + Math.imul(ah8, bh7)) | 0;
      lo = (lo + Math.imul(al7, bl8)) | 0;
      mid = (mid + Math.imul(al7, bh8)) | 0;
      mid = (mid + Math.imul(ah7, bl8)) | 0;
      hi = (hi + Math.imul(ah7, bh8)) | 0;
      lo = (lo + Math.imul(al6, bl9)) | 0;
      mid = (mid + Math.imul(al6, bh9)) | 0;
      mid = (mid + Math.imul(ah6, bl9)) | 0;
      hi = (hi + Math.imul(ah6, bh9)) | 0;
      var w15 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
      c = (((hi + (mid >>> 13)) | 0) + (w15 >>> 26)) | 0;
      w15 &= 0x3ffffff;
      /* k = 16 */
      lo = Math.imul(al9, bl7);
      mid = Math.imul(al9, bh7);
      mid = (mid + Math.imul(ah9, bl7)) | 0;
      hi = Math.imul(ah9, bh7);
      lo = (lo + Math.imul(al8, bl8)) | 0;
      mid = (mid + Math.imul(al8, bh8)) | 0;
      mid = (mid + Math.imul(ah8, bl8)) | 0;
      hi = (hi + Math.imul(ah8, bh8)) | 0;
      lo = (lo + Math.imul(al7, bl9)) | 0;
      mid = (mid + Math.imul(al7, bh9)) | 0;
      mid = (mid + Math.imul(ah7, bl9)) | 0;
      hi = (hi + Math.imul(ah7, bh9)) | 0;
      var w16 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
      c = (((hi + (mid >>> 13)) | 0) + (w16 >>> 26)) | 0;
      w16 &= 0x3ffffff;
      /* k = 17 */
      lo = Math.imul(al9, bl8);
      mid = Math.imul(al9, bh8);
      mid = (mid + Math.imul(ah9, bl8)) | 0;
      hi = Math.imul(ah9, bh8);
      lo = (lo + Math.imul(al8, bl9)) | 0;
      mid = (mid + Math.imul(al8, bh9)) | 0;
      mid = (mid + Math.imul(ah8, bl9)) | 0;
      hi = (hi + Math.imul(ah8, bh9)) | 0;
      var w17 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
      c = (((hi + (mid >>> 13)) | 0) + (w17 >>> 26)) | 0;
      w17 &= 0x3ffffff;
      /* k = 18 */
      lo = Math.imul(al9, bl9);
      mid = Math.imul(al9, bh9);
      mid = (mid + Math.imul(ah9, bl9)) | 0;
      hi = Math.imul(ah9, bh9);
      var w18 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
      c = (((hi + (mid >>> 13)) | 0) + (w18 >>> 26)) | 0;
      w18 &= 0x3ffffff;
      o[0] = w0;
      o[1] = w1;
      o[2] = w2;
      o[3] = w3;
      o[4] = w4;
      o[5] = w5;
      o[6] = w6;
      o[7] = w7;
      o[8] = w8;
      o[9] = w9;
      o[10] = w10;
      o[11] = w11;
      o[12] = w12;
      o[13] = w13;
      o[14] = w14;
      o[15] = w15;
      o[16] = w16;
      o[17] = w17;
      o[18] = w18;
      if (c !== 0) {
        o[19] = c;
        out.length++;
      }
      return out;
    };

    // Polyfill comb
    if (!Math.imul) {
      comb10MulTo = smallMulTo;
    }

    function bigMulTo (self, num, out) {
      out.negative = num.negative ^ self.negative;
      out.length = self.length + num.length;

      var carry = 0;
      var hncarry = 0;
      for (var k = 0; k < out.length - 1; k++) {
        // Sum all words with the same `i + j = k` and accumulate `ncarry`,
        // note that ncarry could be >= 0x3ffffff
        var ncarry = hncarry;
        hncarry = 0;
        var rword = carry & 0x3ffffff;
        var maxJ = Math.min(k, num.length - 1);
        for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
          var i = k - j;
          var a = self.words[i] | 0;
          var b = num.words[j] | 0;
          var r = a * b;

          var lo = r & 0x3ffffff;
          ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
          lo = (lo + rword) | 0;
          rword = lo & 0x3ffffff;
          ncarry = (ncarry + (lo >>> 26)) | 0;

          hncarry += ncarry >>> 26;
          ncarry &= 0x3ffffff;
        }
        out.words[k] = rword;
        carry = ncarry;
        ncarry = hncarry;
      }
      if (carry !== 0) {
        out.words[k] = carry;
      } else {
        out.length--;
      }

      return out.strip();
    }

    function jumboMulTo (self, num, out) {
      var fftm = new FFTM();
      return fftm.mulp(self, num, out);
    }

    BN.prototype.mulTo = function mulTo (num, out) {
      var res;
      var len = this.length + num.length;
      if (this.length === 10 && num.length === 10) {
        res = comb10MulTo(this, num, out);
      } else if (len < 63) {
        res = smallMulTo(this, num, out);
      } else if (len < 1024) {
        res = bigMulTo(this, num, out);
      } else {
        res = jumboMulTo(this, num, out);
      }

      return res;
    };

    // Cooley-Tukey algorithm for FFT
    // slightly revisited to rely on looping instead of recursion

    function FFTM (x, y) {
      this.x = x;
      this.y = y;
    }

    FFTM.prototype.makeRBT = function makeRBT (N) {
      var t = new Array(N);
      var l = BN.prototype._countBits(N) - 1;
      for (var i = 0; i < N; i++) {
        t[i] = this.revBin(i, l, N);
      }

      return t;
    };

    // Returns binary-reversed representation of `x`
    FFTM.prototype.revBin = function revBin (x, l, N) {
      if (x === 0 || x === N - 1) return x;

      var rb = 0;
      for (var i = 0; i < l; i++) {
        rb |= (x & 1) << (l - i - 1);
        x >>= 1;
      }

      return rb;
    };

    // Performs "tweedling" phase, therefore 'emulating'
    // behaviour of the recursive algorithm
    FFTM.prototype.permute = function permute (rbt, rws, iws, rtws, itws, N) {
      for (var i = 0; i < N; i++) {
        rtws[i] = rws[rbt[i]];
        itws[i] = iws[rbt[i]];
      }
    };

    FFTM.prototype.transform = function transform (rws, iws, rtws, itws, N, rbt) {
      this.permute(rbt, rws, iws, rtws, itws, N);

      for (var s = 1; s < N; s <<= 1) {
        var l = s << 1;

        var rtwdf = Math.cos(2 * Math.PI / l);
        var itwdf = Math.sin(2 * Math.PI / l);

        for (var p = 0; p < N; p += l) {
          var rtwdf_ = rtwdf;
          var itwdf_ = itwdf;

          for (var j = 0; j < s; j++) {
            var re = rtws[p + j];
            var ie = itws[p + j];

            var ro = rtws[p + j + s];
            var io = itws[p + j + s];

            var rx = rtwdf_ * ro - itwdf_ * io;

            io = rtwdf_ * io + itwdf_ * ro;
            ro = rx;

            rtws[p + j] = re + ro;
            itws[p + j] = ie + io;

            rtws[p + j + s] = re - ro;
            itws[p + j + s] = ie - io;

            /* jshint maxdepth : false */
            if (j !== l) {
              rx = rtwdf * rtwdf_ - itwdf * itwdf_;

              itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_;
              rtwdf_ = rx;
            }
          }
        }
      }
    };

    FFTM.prototype.guessLen13b = function guessLen13b (n, m) {
      var N = Math.max(m, n) | 1;
      var odd = N & 1;
      var i = 0;
      for (N = N / 2 | 0; N; N = N >>> 1) {
        i++;
      }

      return 1 << i + 1 + odd;
    };

    FFTM.prototype.conjugate = function conjugate (rws, iws, N) {
      if (N <= 1) return;

      for (var i = 0; i < N / 2; i++) {
        var t = rws[i];

        rws[i] = rws[N - i - 1];
        rws[N - i - 1] = t;

        t = iws[i];

        iws[i] = -iws[N - i - 1];
        iws[N - i - 1] = -t;
      }
    };

    FFTM.prototype.normalize13b = function normalize13b (ws, N) {
      var carry = 0;
      for (var i = 0; i < N / 2; i++) {
        var w = Math.round(ws[2 * i + 1] / N) * 0x2000 +
          Math.round(ws[2 * i] / N) +
          carry;

        ws[i] = w & 0x3ffffff;

        if (w < 0x4000000) {
          carry = 0;
        } else {
          carry = w / 0x4000000 | 0;
        }
      }

      return ws;
    };

    FFTM.prototype.convert13b = function convert13b (ws, len, rws, N) {
      var carry = 0;
      for (var i = 0; i < len; i++) {
        carry = carry + (ws[i] | 0);

        rws[2 * i] = carry & 0x1fff; carry = carry >>> 13;
        rws[2 * i + 1] = carry & 0x1fff; carry = carry >>> 13;
      }

      // Pad with zeroes
      for (i = 2 * len; i < N; ++i) {
        rws[i] = 0;
      }

      assert(carry === 0);
      assert((carry & ~0x1fff) === 0);
    };

    FFTM.prototype.stub = function stub (N) {
      var ph = new Array(N);
      for (var i = 0; i < N; i++) {
        ph[i] = 0;
      }

      return ph;
    };

    FFTM.prototype.mulp = function mulp (x, y, out) {
      var N = 2 * this.guessLen13b(x.length, y.length);

      var rbt = this.makeRBT(N);

      var _ = this.stub(N);

      var rws = new Array(N);
      var rwst = new Array(N);
      var iwst = new Array(N);

      var nrws = new Array(N);
      var nrwst = new Array(N);
      var niwst = new Array(N);

      var rmws = out.words;
      rmws.length = N;

      this.convert13b(x.words, x.length, rws, N);
      this.convert13b(y.words, y.length, nrws, N);

      this.transform(rws, _, rwst, iwst, N, rbt);
      this.transform(nrws, _, nrwst, niwst, N, rbt);

      for (var i = 0; i < N; i++) {
        var rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i];
        iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i];
        rwst[i] = rx;
      }

      this.conjugate(rwst, iwst, N);
      this.transform(rwst, iwst, rmws, _, N, rbt);
      this.conjugate(rmws, _, N);
      this.normalize13b(rmws, N);

      out.negative = x.negative ^ y.negative;
      out.length = x.length + y.length;
      return out.strip();
    };

    // Multiply `this` by `num`
    BN.prototype.mul = function mul (num) {
      var out = new BN(null);
      out.words = new Array(this.length + num.length);
      return this.mulTo(num, out);
    };

    // Multiply employing FFT
    BN.prototype.mulf = function mulf (num) {
      var out = new BN(null);
      out.words = new Array(this.length + num.length);
      return jumboMulTo(this, num, out);
    };

    // In-place Multiplication
    BN.prototype.imul = function imul (num) {
      return this.clone().mulTo(num, this);
    };

    BN.prototype.imuln = function imuln (num) {
      assert(typeof num === 'number');
      assert(num < 0x4000000);

      // Carry
      var carry = 0;
      for (var i = 0; i < this.length; i++) {
        var w = (this.words[i] | 0) * num;
        var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
        carry >>= 26;
        carry += (w / 0x4000000) | 0;
        // NOTE: lo is 27bit maximum
        carry += lo >>> 26;
        this.words[i] = lo & 0x3ffffff;
      }

      if (carry !== 0) {
        this.words[i] = carry;
        this.length++;
      }

      return this;
    };

    BN.prototype.muln = function muln (num) {
      return this.clone().imuln(num);
    };

    // `this` * `this`
    BN.prototype.sqr = function sqr () {
      return this.mul(this);
    };

    // `this` * `this` in-place
    BN.prototype.isqr = function isqr () {
      return this.imul(this.clone());
    };

    // Math.pow(`this`, `num`)
    BN.prototype.pow = function pow (num) {
      var w = toBitArray(num);
      if (w.length === 0) return new BN(1);

      // Skip leading zeroes
      var res = this;
      for (var i = 0; i < w.length; i++, res = res.sqr()) {
        if (w[i] !== 0) break;
      }

      if (++i < w.length) {
        for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
          if (w[i] === 0) continue;

          res = res.mul(q);
        }
      }

      return res;
    };

    // Shift-left in-place
    BN.prototype.iushln = function iushln (bits) {
      assert(typeof bits === 'number' && bits >= 0);
      var r = bits % 26;
      var s = (bits - r) / 26;
      var carryMask = (0x3ffffff >>> (26 - r)) << (26 - r);
      var i;

      if (r !== 0) {
        var carry = 0;

        for (i = 0; i < this.length; i++) {
          var newCarry = this.words[i] & carryMask;
          var c = ((this.words[i] | 0) - newCarry) << r;
          this.words[i] = c | carry;
          carry = newCarry >>> (26 - r);
        }

        if (carry) {
          this.words[i] = carry;
          this.length++;
        }
      }

      if (s !== 0) {
        for (i = this.length - 1; i >= 0; i--) {
          this.words[i + s] = this.words[i];
        }

        for (i = 0; i < s; i++) {
          this.words[i] = 0;
        }

        this.length += s;
      }

      return this.strip();
    };

    BN.prototype.ishln = function ishln (bits) {
      // TODO(indutny): implement me
      assert(this.negative === 0);
      return this.iushln(bits);
    };

    // Shift-right in-place
    // NOTE: `hint` is a lowest bit before trailing zeroes
    // NOTE: if `extended` is present - it will be filled with destroyed bits
    BN.prototype.iushrn = function iushrn (bits, hint, extended) {
      assert(typeof bits === 'number' && bits >= 0);
      var h;
      if (hint) {
        h = (hint - (hint % 26)) / 26;
      } else {
        h = 0;
      }

      var r = bits % 26;
      var s = Math.min((bits - r) / 26, this.length);
      var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
      var maskedWords = extended;

      h -= s;
      h = Math.max(0, h);

      // Extended mode, copy masked part
      if (maskedWords) {
        for (var i = 0; i < s; i++) {
          maskedWords.words[i] = this.words[i];
        }
        maskedWords.length = s;
      }

      if (s === 0) ; else if (this.length > s) {
        this.length -= s;
        for (i = 0; i < this.length; i++) {
          this.words[i] = this.words[i + s];
        }
      } else {
        this.words[0] = 0;
        this.length = 1;
      }

      var carry = 0;
      for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
        var word = this.words[i] | 0;
        this.words[i] = (carry << (26 - r)) | (word >>> r);
        carry = word & mask;
      }

      // Push carried bits as a mask
      if (maskedWords && carry !== 0) {
        maskedWords.words[maskedWords.length++] = carry;
      }

      if (this.length === 0) {
        this.words[0] = 0;
        this.length = 1;
      }

      return this.strip();
    };

    BN.prototype.ishrn = function ishrn (bits, hint, extended) {
      // TODO(indutny): implement me
      assert(this.negative === 0);
      return this.iushrn(bits, hint, extended);
    };

    // Shift-left
    BN.prototype.shln = function shln (bits) {
      return this.clone().ishln(bits);
    };

    BN.prototype.ushln = function ushln (bits) {
      return this.clone().iushln(bits);
    };

    // Shift-right
    BN.prototype.shrn = function shrn (bits) {
      return this.clone().ishrn(bits);
    };

    BN.prototype.ushrn = function ushrn (bits) {
      return this.clone().iushrn(bits);
    };

    // Test if n bit is set
    BN.prototype.testn = function testn (bit) {
      assert(typeof bit === 'number' && bit >= 0);
      var r = bit % 26;
      var s = (bit - r) / 26;
      var q = 1 << r;

      // Fast case: bit is much higher than all existing words
      if (this.length <= s) return false;

      // Check bit and return
      var w = this.words[s];

      return !!(w & q);
    };

    // Return only lowers bits of number (in-place)
    BN.prototype.imaskn = function imaskn (bits) {
      assert(typeof bits === 'number' && bits >= 0);
      var r = bits % 26;
      var s = (bits - r) / 26;

      assert(this.negative === 0, 'imaskn works only with positive numbers');

      if (this.length <= s) {
        return this;
      }

      if (r !== 0) {
        s++;
      }
      this.length = Math.min(s, this.length);

      if (r !== 0) {
        var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
        this.words[this.length - 1] &= mask;
      }

      return this.strip();
    };

    // Return only lowers bits of number
    BN.prototype.maskn = function maskn (bits) {
      return this.clone().imaskn(bits);
    };

    // Add plain number `num` to `this`
    BN.prototype.iaddn = function iaddn (num) {
      assert(typeof num === 'number');
      assert(num < 0x4000000);
      if (num < 0) return this.isubn(-num);

      // Possible sign change
      if (this.negative !== 0) {
        if (this.length === 1 && (this.words[0] | 0) < num) {
          this.words[0] = num - (this.words[0] | 0);
          this.negative = 0;
          return this;
        }

        this.negative = 0;
        this.isubn(num);
        this.negative = 1;
        return this;
      }

      // Add without checks
      return this._iaddn(num);
    };

    BN.prototype._iaddn = function _iaddn (num) {
      this.words[0] += num;

      // Carry
      for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
        this.words[i] -= 0x4000000;
        if (i === this.length - 1) {
          this.words[i + 1] = 1;
        } else {
          this.words[i + 1]++;
        }
      }
      this.length = Math.max(this.length, i + 1);

      return this;
    };

    // Subtract plain number `num` from `this`
    BN.prototype.isubn = function isubn (num) {
      assert(typeof num === 'number');
      assert(num < 0x4000000);
      if (num < 0) return this.iaddn(-num);

      if (this.negative !== 0) {
        this.negative = 0;
        this.iaddn(num);
        this.negative = 1;
        return this;
      }

      this.words[0] -= num;

      if (this.length === 1 && this.words[0] < 0) {
        this.words[0] = -this.words[0];
        this.negative = 1;
      } else {
        // Carry
        for (var i = 0; i < this.length && this.words[i] < 0; i++) {
          this.words[i] += 0x4000000;
          this.words[i + 1] -= 1;
        }
      }

      return this.strip();
    };

    BN.prototype.addn = function addn (num) {
      return this.clone().iaddn(num);
    };

    BN.prototype.subn = function subn (num) {
      return this.clone().isubn(num);
    };

    BN.prototype.iabs = function iabs () {
      this.negative = 0;

      return this;
    };

    BN.prototype.abs = function abs () {
      return this.clone().iabs();
    };

    BN.prototype._ishlnsubmul = function _ishlnsubmul (num, mul, shift) {
      var len = num.length + shift;
      var i;

      this._expand(len);

      var w;
      var carry = 0;
      for (i = 0; i < num.length; i++) {
        w = (this.words[i + shift] | 0) + carry;
        var right = (num.words[i] | 0) * mul;
        w -= right & 0x3ffffff;
        carry = (w >> 26) - ((right / 0x4000000) | 0);
        this.words[i + shift] = w & 0x3ffffff;
      }
      for (; i < this.length - shift; i++) {
        w = (this.words[i + shift] | 0) + carry;
        carry = w >> 26;
        this.words[i + shift] = w & 0x3ffffff;
      }

      if (carry === 0) return this.strip();

      // Subtraction overflow
      assert(carry === -1);
      carry = 0;
      for (i = 0; i < this.length; i++) {
        w = -(this.words[i] | 0) + carry;
        carry = w >> 26;
        this.words[i] = w & 0x3ffffff;
      }
      this.negative = 1;

      return this.strip();
    };

    BN.prototype._wordDiv = function _wordDiv (num, mode) {
      var shift = this.length - num.length;

      var a = this.clone();
      var b = num;

      // Normalize
      var bhi = b.words[b.length - 1] | 0;
      var bhiBits = this._countBits(bhi);
      shift = 26 - bhiBits;
      if (shift !== 0) {
        b = b.ushln(shift);
        a.iushln(shift);
        bhi = b.words[b.length - 1] | 0;
      }

      // Initialize quotient
      var m = a.length - b.length;
      var q;

      if (mode !== 'mod') {
        q = new BN(null);
        q.length = m + 1;
        q.words = new Array(q.length);
        for (var i = 0; i < q.length; i++) {
          q.words[i] = 0;
        }
      }

      var diff = a.clone()._ishlnsubmul(b, 1, m);
      if (diff.negative === 0) {
        a = diff;
        if (q) {
          q.words[m] = 1;
        }
      }

      for (var j = m - 1; j >= 0; j--) {
        var qj = (a.words[b.length + j] | 0) * 0x4000000 +
          (a.words[b.length + j - 1] | 0);

        // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
        // (0x7ffffff)
        qj = Math.min((qj / bhi) | 0, 0x3ffffff);

        a._ishlnsubmul(b, qj, j);
        while (a.negative !== 0) {
          qj--;
          a.negative = 0;
          a._ishlnsubmul(b, 1, j);
          if (!a.isZero()) {
            a.negative ^= 1;
          }
        }
        if (q) {
          q.words[j] = qj;
        }
      }
      if (q) {
        q.strip();
      }
      a.strip();

      // Denormalize
      if (mode !== 'div' && shift !== 0) {
        a.iushrn(shift);
      }

      return {
        div: q || null,
        mod: a
      };
    };

    // NOTE: 1) `mode` can be set to `mod` to request mod only,
    //       to `div` to request div only, or be absent to
    //       request both div & mod
    //       2) `positive` is true if unsigned mod is requested
    BN.prototype.divmod = function divmod (num, mode, positive) {
      assert(!num.isZero());

      if (this.isZero()) {
        return {
          div: new BN(0),
          mod: new BN(0)
        };
      }

      var div, mod, res;
      if (this.negative !== 0 && num.negative === 0) {
        res = this.neg().divmod(num, mode);

        if (mode !== 'mod') {
          div = res.div.neg();
        }

        if (mode !== 'div') {
          mod = res.mod.neg();
          if (positive && mod.negative !== 0) {
            mod.iadd(num);
          }
        }

        return {
          div: div,
          mod: mod
        };
      }

      if (this.negative === 0 && num.negative !== 0) {
        res = this.divmod(num.neg(), mode);

        if (mode !== 'mod') {
          div = res.div.neg();
        }

        return {
          div: div,
          mod: res.mod
        };
      }

      if ((this.negative & num.negative) !== 0) {
        res = this.neg().divmod(num.neg(), mode);

        if (mode !== 'div') {
          mod = res.mod.neg();
          if (positive && mod.negative !== 0) {
            mod.isub(num);
          }
        }

        return {
          div: res.div,
          mod: mod
        };
      }

      // Both numbers are positive at this point

      // Strip both numbers to approximate shift value
      if (num.length > this.length || this.cmp(num) < 0) {
        return {
          div: new BN(0),
          mod: this
        };
      }

      // Very short reduction
      if (num.length === 1) {
        if (mode === 'div') {
          return {
            div: this.divn(num.words[0]),
            mod: null
          };
        }

        if (mode === 'mod') {
          return {
            div: null,
            mod: new BN(this.modn(num.words[0]))
          };
        }

        return {
          div: this.divn(num.words[0]),
          mod: new BN(this.modn(num.words[0]))
        };
      }

      return this._wordDiv(num, mode);
    };

    // Find `this` / `num`
    BN.prototype.div = function div (num) {
      return this.divmod(num, 'div', false).div;
    };

    // Find `this` % `num`
    BN.prototype.mod = function mod (num) {
      return this.divmod(num, 'mod', false).mod;
    };

    BN.prototype.umod = function umod (num) {
      return this.divmod(num, 'mod', true).mod;
    };

    // Find Round(`this` / `num`)
    BN.prototype.divRound = function divRound (num) {
      var dm = this.divmod(num);

      // Fast case - exact division
      if (dm.mod.isZero()) return dm.div;

      var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;

      var half = num.ushrn(1);
      var r2 = num.andln(1);
      var cmp = mod.cmp(half);

      // Round down
      if (cmp < 0 || r2 === 1 && cmp === 0) return dm.div;

      // Round up
      return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
    };

    BN.prototype.modn = function modn (num) {
      assert(num <= 0x3ffffff);
      var p = (1 << 26) % num;

      var acc = 0;
      for (var i = this.length - 1; i >= 0; i--) {
        acc = (p * acc + (this.words[i] | 0)) % num;
      }

      return acc;
    };

    // In-place division by number
    BN.prototype.idivn = function idivn (num) {
      assert(num <= 0x3ffffff);

      var carry = 0;
      for (var i = this.length - 1; i >= 0; i--) {
        var w = (this.words[i] | 0) + carry * 0x4000000;
        this.words[i] = (w / num) | 0;
        carry = w % num;
      }

      return this.strip();
    };

    BN.prototype.divn = function divn (num) {
      return this.clone().idivn(num);
    };

    BN.prototype.egcd = function egcd (p) {
      assert(p.negative === 0);
      assert(!p.isZero());

      var x = this;
      var y = p.clone();

      if (x.negative !== 0) {
        x = x.umod(p);
      } else {
        x = x.clone();
      }

      // A * x + B * y = x
      var A = new BN(1);
      var B = new BN(0);

      // C * x + D * y = y
      var C = new BN(0);
      var D = new BN(1);

      var g = 0;

      while (x.isEven() && y.isEven()) {
        x.iushrn(1);
        y.iushrn(1);
        ++g;
      }

      var yp = y.clone();
      var xp = x.clone();

      while (!x.isZero()) {
        for (var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
        if (i > 0) {
          x.iushrn(i);
          while (i-- > 0) {
            if (A.isOdd() || B.isOdd()) {
              A.iadd(yp);
              B.isub(xp);
            }

            A.iushrn(1);
            B.iushrn(1);
          }
        }

        for (var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
        if (j > 0) {
          y.iushrn(j);
          while (j-- > 0) {
            if (C.isOdd() || D.isOdd()) {
              C.iadd(yp);
              D.isub(xp);
            }

            C.iushrn(1);
            D.iushrn(1);
          }
        }

        if (x.cmp(y) >= 0) {
          x.isub(y);
          A.isub(C);
          B.isub(D);
        } else {
          y.isub(x);
          C.isub(A);
          D.isub(B);
        }
      }

      return {
        a: C,
        b: D,
        gcd: y.iushln(g)
      };
    };

    // This is reduced incarnation of the binary EEA
    // above, designated to invert members of the
    // _prime_ fields F(p) at a maximal speed
    BN.prototype._invmp = function _invmp (p) {
      assert(p.negative === 0);
      assert(!p.isZero());

      var a = this;
      var b = p.clone();

      if (a.negative !== 0) {
        a = a.umod(p);
      } else {
        a = a.clone();
      }

      var x1 = new BN(1);
      var x2 = new BN(0);

      var delta = b.clone();

      while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
        for (var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
        if (i > 0) {
          a.iushrn(i);
          while (i-- > 0) {
            if (x1.isOdd()) {
              x1.iadd(delta);
            }

            x1.iushrn(1);
          }
        }

        for (var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
        if (j > 0) {
          b.iushrn(j);
          while (j-- > 0) {
            if (x2.isOdd()) {
              x2.iadd(delta);
            }

            x2.iushrn(1);
          }
        }

        if (a.cmp(b) >= 0) {
          a.isub(b);
          x1.isub(x2);
        } else {
          b.isub(a);
          x2.isub(x1);
        }
      }

      var res;
      if (a.cmpn(1) === 0) {
        res = x1;
      } else {
        res = x2;
      }

      if (res.cmpn(0) < 0) {
        res.iadd(p);
      }

      return res;
    };

    BN.prototype.gcd = function gcd (num) {
      if (this.isZero()) return num.abs();
      if (num.isZero()) return this.abs();

      var a = this.clone();
      var b = num.clone();
      a.negative = 0;
      b.negative = 0;

      // Remove common factor of two
      for (var shift = 0; a.isEven() && b.isEven(); shift++) {
        a.iushrn(1);
        b.iushrn(1);
      }

      do {
        while (a.isEven()) {
          a.iushrn(1);
        }
        while (b.isEven()) {
          b.iushrn(1);
        }

        var r = a.cmp(b);
        if (r < 0) {
          // Swap `a` and `b` to make `a` always bigger than `b`
          var t = a;
          a = b;
          b = t;
        } else if (r === 0 || b.cmpn(1) === 0) {
          break;
        }

        a.isub(b);
      } while (true);

      return b.iushln(shift);
    };

    // Invert number in the field F(num)
    BN.prototype.invm = function invm (num) {
      return this.egcd(num).a.umod(num);
    };

    BN.prototype.isEven = function isEven () {
      return (this.words[0] & 1) === 0;
    };

    BN.prototype.isOdd = function isOdd () {
      return (this.words[0] & 1) === 1;
    };

    // And first word and num
    BN.prototype.andln = function andln (num) {
      return this.words[0] & num;
    };

    // Increment at the bit position in-line
    BN.prototype.bincn = function bincn (bit) {
      assert(typeof bit === 'number');
      var r = bit % 26;
      var s = (bit - r) / 26;
      var q = 1 << r;

      // Fast case: bit is much higher than all existing words
      if (this.length <= s) {
        this._expand(s + 1);
        this.words[s] |= q;
        return this;
      }

      // Add bit and propagate, if needed
      var carry = q;
      for (var i = s; carry !== 0 && i < this.length; i++) {
        var w = this.words[i] | 0;
        w += carry;
        carry = w >>> 26;
        w &= 0x3ffffff;
        this.words[i] = w;
      }
      if (carry !== 0) {
        this.words[i] = carry;
        this.length++;
      }
      return this;
    };

    BN.prototype.isZero = function isZero () {
      return this.length === 1 && this.words[0] === 0;
    };

    BN.prototype.cmpn = function cmpn (num) {
      var negative = num < 0;

      if (this.negative !== 0 && !negative) return -1;
      if (this.negative === 0 && negative) return 1;

      this.strip();

      var res;
      if (this.length > 1) {
        res = 1;
      } else {
        if (negative) {
          num = -num;
        }

        assert(num <= 0x3ffffff, 'Number is too big');

        var w = this.words[0] | 0;
        res = w === num ? 0 : w < num ? -1 : 1;
      }
      if (this.negative !== 0) return -res | 0;
      return res;
    };

    // Compare two numbers and return:
    // 1 - if `this` > `num`
    // 0 - if `this` == `num`
    // -1 - if `this` < `num`
    BN.prototype.cmp = function cmp (num) {
      if (this.negative !== 0 && num.negative === 0) return -1;
      if (this.negative === 0 && num.negative !== 0) return 1;

      var res = this.ucmp(num);
      if (this.negative !== 0) return -res | 0;
      return res;
    };

    // Unsigned comparison
    BN.prototype.ucmp = function ucmp (num) {
      // At this point both numbers have the same sign
      if (this.length > num.length) return 1;
      if (this.length < num.length) return -1;

      var res = 0;
      for (var i = this.length - 1; i >= 0; i--) {
        var a = this.words[i] | 0;
        var b = num.words[i] | 0;

        if (a === b) continue;
        if (a < b) {
          res = -1;
        } else if (a > b) {
          res = 1;
        }
        break;
      }
      return res;
    };

    BN.prototype.gtn = function gtn (num) {
      return this.cmpn(num) === 1;
    };

    BN.prototype.gt = function gt (num) {
      return this.cmp(num) === 1;
    };

    BN.prototype.gten = function gten (num) {
      return this.cmpn(num) >= 0;
    };

    BN.prototype.gte = function gte (num) {
      return this.cmp(num) >= 0;
    };

    BN.prototype.ltn = function ltn (num) {
      return this.cmpn(num) === -1;
    };

    BN.prototype.lt = function lt (num) {
      return this.cmp(num) === -1;
    };

    BN.prototype.lten = function lten (num) {
      return this.cmpn(num) <= 0;
    };

    BN.prototype.lte = function lte (num) {
      return this.cmp(num) <= 0;
    };

    BN.prototype.eqn = function eqn (num) {
      return this.cmpn(num) === 0;
    };

    BN.prototype.eq = function eq (num) {
      return this.cmp(num) === 0;
    };

    //
    // A reduce context, could be using montgomery or something better, depending
    // on the `m` itself.
    //
    BN.red = function red (num) {
      return new Red(num);
    };

    BN.prototype.toRed = function toRed (ctx) {
      assert(!this.red, 'Already a number in reduction context');
      assert(this.negative === 0, 'red works only with positives');
      return ctx.convertTo(this)._forceRed(ctx);
    };

    BN.prototype.fromRed = function fromRed () {
      assert(this.red, 'fromRed works only with numbers in reduction context');
      return this.red.convertFrom(this);
    };

    BN.prototype._forceRed = function _forceRed (ctx) {
      this.red = ctx;
      return this;
    };

    BN.prototype.forceRed = function forceRed (ctx) {
      assert(!this.red, 'Already a number in reduction context');
      return this._forceRed(ctx);
    };

    BN.prototype.redAdd = function redAdd (num) {
      assert(this.red, 'redAdd works only with red numbers');
      return this.red.add(this, num);
    };

    BN.prototype.redIAdd = function redIAdd (num) {
      assert(this.red, 'redIAdd works only with red numbers');
      return this.red.iadd(this, num);
    };

    BN.prototype.redSub = function redSub (num) {
      assert(this.red, 'redSub works only with red numbers');
      return this.red.sub(this, num);
    };

    BN.prototype.redISub = function redISub (num) {
      assert(this.red, 'redISub works only with red numbers');
      return this.red.isub(this, num);
    };

    BN.prototype.redShl = function redShl (num) {
      assert(this.red, 'redShl works only with red numbers');
      return this.red.shl(this, num);
    };

    BN.prototype.redMul = function redMul (num) {
      assert(this.red, 'redMul works only with red numbers');
      this.red._verify2(this, num);
      return this.red.mul(this, num);
    };

    BN.prototype.redIMul = function redIMul (num) {
      assert(this.red, 'redMul works only with red numbers');
      this.red._verify2(this, num);
      return this.red.imul(this, num);
    };

    BN.prototype.redSqr = function redSqr () {
      assert(this.red, 'redSqr works only with red numbers');
      this.red._verify1(this);
      return this.red.sqr(this);
    };

    BN.prototype.redISqr = function redISqr () {
      assert(this.red, 'redISqr works only with red numbers');
      this.red._verify1(this);
      return this.red.isqr(this);
    };

    // Square root over p
    BN.prototype.redSqrt = function redSqrt () {
      assert(this.red, 'redSqrt works only with red numbers');
      this.red._verify1(this);
      return this.red.sqrt(this);
    };

    BN.prototype.redInvm = function redInvm () {
      assert(this.red, 'redInvm works only with red numbers');
      this.red._verify1(this);
      return this.red.invm(this);
    };

    // Return negative clone of `this` % `red modulo`
    BN.prototype.redNeg = function redNeg () {
      assert(this.red, 'redNeg works only with red numbers');
      this.red._verify1(this);
      return this.red.neg(this);
    };

    BN.prototype.redPow = function redPow (num) {
      assert(this.red && !num.red, 'redPow(normalNum)');
      this.red._verify1(this);
      return this.red.pow(this, num);
    };

    // Prime numbers with efficient reduction
    var primes = {
      k256: null,
      p224: null,
      p192: null,
      p25519: null
    };

    // Pseudo-Mersenne prime
    function MPrime (name, p) {
      // P = 2 ^ N - K
      this.name = name;
      this.p = new BN(p, 16);
      this.n = this.p.bitLength();
      this.k = new BN(1).iushln(this.n).isub(this.p);

      this.tmp = this._tmp();
    }

    MPrime.prototype._tmp = function _tmp () {
      var tmp = new BN(null);
      tmp.words = new Array(Math.ceil(this.n / 13));
      return tmp;
    };

    MPrime.prototype.ireduce = function ireduce (num) {
      // Assumes that `num` is less than `P^2`
      // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
      var r = num;
      var rlen;

      do {
        this.split(r, this.tmp);
        r = this.imulK(r);
        r = r.iadd(this.tmp);
        rlen = r.bitLength();
      } while (rlen > this.n);

      var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
      if (cmp === 0) {
        r.words[0] = 0;
        r.length = 1;
      } else if (cmp > 0) {
        r.isub(this.p);
      } else {
        if (r.strip !== undefined) {
          // r is BN v4 instance
          r.strip();
        } else {
          // r is BN v5 instance
          r._strip();
        }
      }

      return r;
    };

    MPrime.prototype.split = function split (input, out) {
      input.iushrn(this.n, 0, out);
    };

    MPrime.prototype.imulK = function imulK (num) {
      return num.imul(this.k);
    };

    function K256 () {
      MPrime.call(
        this,
        'k256',
        'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
    }
    inherits(K256, MPrime);

    K256.prototype.split = function split (input, output) {
      // 256 = 9 * 26 + 22
      var mask = 0x3fffff;

      var outLen = Math.min(input.length, 9);
      for (var i = 0; i < outLen; i++) {
        output.words[i] = input.words[i];
      }
      output.length = outLen;

      if (input.length <= 9) {
        input.words[0] = 0;
        input.length = 1;
        return;
      }

      // Shift by 9 limbs
      var prev = input.words[9];
      output.words[output.length++] = prev & mask;

      for (i = 10; i < input.length; i++) {
        var next = input.words[i] | 0;
        input.words[i - 10] = ((next & mask) << 4) | (prev >>> 22);
        prev = next;
      }
      prev >>>= 22;
      input.words[i - 10] = prev;
      if (prev === 0 && input.length > 10) {
        input.length -= 10;
      } else {
        input.length -= 9;
      }
    };

    K256.prototype.imulK = function imulK (num) {
      // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
      num.words[num.length] = 0;
      num.words[num.length + 1] = 0;
      num.length += 2;

      // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390
      var lo = 0;
      for (var i = 0; i < num.length; i++) {
        var w = num.words[i] | 0;
        lo += w * 0x3d1;
        num.words[i] = lo & 0x3ffffff;
        lo = w * 0x40 + ((lo / 0x4000000) | 0);
      }

      // Fast length reduction
      if (num.words[num.length - 1] === 0) {
        num.length--;
        if (num.words[num.length - 1] === 0) {
          num.length--;
        }
      }
      return num;
    };

    function P224 () {
      MPrime.call(
        this,
        'p224',
        'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
    }
    inherits(P224, MPrime);

    function P192 () {
      MPrime.call(
        this,
        'p192',
        'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
    }
    inherits(P192, MPrime);

    function P25519 () {
      // 2 ^ 255 - 19
      MPrime.call(
        this,
        '25519',
        '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
    }
    inherits(P25519, MPrime);

    P25519.prototype.imulK = function imulK (num) {
      // K = 0x13
      var carry = 0;
      for (var i = 0; i < num.length; i++) {
        var hi = (num.words[i] | 0) * 0x13 + carry;
        var lo = hi & 0x3ffffff;
        hi >>>= 26;

        num.words[i] = lo;
        carry = hi;
      }
      if (carry !== 0) {
        num.words[num.length++] = carry;
      }
      return num;
    };

    // Exported mostly for testing purposes, use plain name instead
    BN._prime = function prime (name) {
      // Cached version of prime
      if (primes[name]) return primes[name];

      var prime;
      if (name === 'k256') {
        prime = new K256();
      } else if (name === 'p224') {
        prime = new P224();
      } else if (name === 'p192') {
        prime = new P192();
      } else if (name === 'p25519') {
        prime = new P25519();
      } else {
        throw new Error('Unknown prime ' + name);
      }
      primes[name] = prime;

      return prime;
    };

    //
    // Base reduction engine
    //
    function Red (m) {
      if (typeof m === 'string') {
        var prime = BN._prime(m);
        this.m = prime.p;
        this.prime = prime;
      } else {
        assert(m.gtn(1), 'modulus must be greater than 1');
        this.m = m;
        this.prime = null;
      }
    }

    Red.prototype._verify1 = function _verify1 (a) {
      assert(a.negative === 0, 'red works only with positives');
      assert(a.red, 'red works only with red numbers');
    };

    Red.prototype._verify2 = function _verify2 (a, b) {
      assert((a.negative | b.negative) === 0, 'red works only with positives');
      assert(a.red && a.red === b.red,
        'red works only with red numbers');
    };

    Red.prototype.imod = function imod (a) {
      if (this.prime) return this.prime.ireduce(a)._forceRed(this);
      return a.umod(this.m)._forceRed(this);
    };

    Red.prototype.neg = function neg (a) {
      if (a.isZero()) {
        return a.clone();
      }

      return this.m.sub(a)._forceRed(this);
    };

    Red.prototype.add = function add (a, b) {
      this._verify2(a, b);

      var res = a.add(b);
      if (res.cmp(this.m) >= 0) {
        res.isub(this.m);
      }
      return res._forceRed(this);
    };

    Red.prototype.iadd = function iadd (a, b) {
      this._verify2(a, b);

      var res = a.iadd(b);
      if (res.cmp(this.m) >= 0) {
        res.isub(this.m);
      }
      return res;
    };

    Red.prototype.sub = function sub (a, b) {
      this._verify2(a, b);

      var res = a.sub(b);
      if (res.cmpn(0) < 0) {
        res.iadd(this.m);
      }
      return res._forceRed(this);
    };

    Red.prototype.isub = function isub (a, b) {
      this._verify2(a, b);

      var res = a.isub(b);
      if (res.cmpn(0) < 0) {
        res.iadd(this.m);
      }
      return res;
    };

    Red.prototype.shl = function shl (a, num) {
      this._verify1(a);
      return this.imod(a.ushln(num));
    };

    Red.prototype.imul = function imul (a, b) {
      this._verify2(a, b);
      return this.imod(a.imul(b));
    };

    Red.prototype.mul = function mul (a, b) {
      this._verify2(a, b);
      return this.imod(a.mul(b));
    };

    Red.prototype.isqr = function isqr (a) {
      return this.imul(a, a.clone());
    };

    Red.prototype.sqr = function sqr (a) {
      return this.mul(a, a);
    };

    Red.prototype.sqrt = function sqrt (a) {
      if (a.isZero()) return a.clone();

      var mod3 = this.m.andln(3);
      assert(mod3 % 2 === 1);

      // Fast case
      if (mod3 === 3) {
        var pow = this.m.add(new BN(1)).iushrn(2);
        return this.pow(a, pow);
      }

      // Tonelli-Shanks algorithm (Totally unoptimized and slow)
      //
      // Find Q and S, that Q * 2 ^ S = (P - 1)
      var q = this.m.subn(1);
      var s = 0;
      while (!q.isZero() && q.andln(1) === 0) {
        s++;
        q.iushrn(1);
      }
      assert(!q.isZero());

      var one = new BN(1).toRed(this);
      var nOne = one.redNeg();

      // Find quadratic non-residue
      // NOTE: Max is such because of generalized Riemann hypothesis.
      var lpow = this.m.subn(1).iushrn(1);
      var z = this.m.bitLength();
      z = new BN(2 * z * z).toRed(this);

      while (this.pow(z, lpow).cmp(nOne) !== 0) {
        z.redIAdd(nOne);
      }

      var c = this.pow(z, q);
      var r = this.pow(a, q.addn(1).iushrn(1));
      var t = this.pow(a, q);
      var m = s;
      while (t.cmp(one) !== 0) {
        var tmp = t;
        for (var i = 0; tmp.cmp(one) !== 0; i++) {
          tmp = tmp.redSqr();
        }
        assert(i < m);
        var b = this.pow(c, new BN(1).iushln(m - i - 1));

        r = r.redMul(b);
        c = b.redSqr();
        t = t.redMul(c);
        m = i;
      }

      return r;
    };

    Red.prototype.invm = function invm (a) {
      var inv = a._invmp(this.m);
      if (inv.negative !== 0) {
        inv.negative = 0;
        return this.imod(inv).redNeg();
      } else {
        return this.imod(inv);
      }
    };

    Red.prototype.pow = function pow (a, num) {
      if (num.isZero()) return new BN(1).toRed(this);
      if (num.cmpn(1) === 0) return a.clone();

      var windowSize = 4;
      var wnd = new Array(1 << windowSize);
      wnd[0] = new BN(1).toRed(this);
      wnd[1] = a;
      for (var i = 2; i < wnd.length; i++) {
        wnd[i] = this.mul(wnd[i - 1], a);
      }

      var res = wnd[0];
      var current = 0;
      var currentLen = 0;
      var start = num.bitLength() % 26;
      if (start === 0) {
        start = 26;
      }

      for (i = num.length - 1; i >= 0; i--) {
        var word = num.words[i];
        for (var j = start - 1; j >= 0; j--) {
          var bit = (word >> j) & 1;
          if (res !== wnd[0]) {
            res = this.sqr(res);
          }

          if (bit === 0 && current === 0) {
            currentLen = 0;
            continue;
          }

          current <<= 1;
          current |= bit;
          currentLen++;
          if (currentLen !== windowSize && (i !== 0 || j !== 0)) continue;

          res = this.mul(res, wnd[current]);
          currentLen = 0;
          current = 0;
        }
        start = 26;
      }

      return res;
    };

    Red.prototype.convertTo = function convertTo (num) {
      var r = num.umod(this.m);

      return r === num ? r.clone() : r;
    };

    Red.prototype.convertFrom = function convertFrom (num) {
      var res = num.clone();
      res.red = null;
      return res;
    };

    //
    // Montgomery method engine
    //

    BN.mont = function mont (num) {
      return new Mont(num);
    };

    function Mont (m) {
      Red.call(this, m);

      this.shift = this.m.bitLength();
      if (this.shift % 26 !== 0) {
        this.shift += 26 - (this.shift % 26);
      }

      this.r = new BN(1).iushln(this.shift);
      this.r2 = this.imod(this.r.sqr());
      this.rinv = this.r._invmp(this.m);

      this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
      this.minv = this.minv.umod(this.r);
      this.minv = this.r.sub(this.minv);
    }
    inherits(Mont, Red);

    Mont.prototype.convertTo = function convertTo (num) {
      return this.imod(num.ushln(this.shift));
    };

    Mont.prototype.convertFrom = function convertFrom (num) {
      var r = this.imod(num.mul(this.rinv));
      r.red = null;
      return r;
    };

    Mont.prototype.imul = function imul (a, b) {
      if (a.isZero() || b.isZero()) {
        a.words[0] = 0;
        a.length = 1;
        return a;
      }

      var t = a.imul(b);
      var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
      var u = t.isub(c).iushrn(this.shift);
      var res = u;

      if (u.cmp(this.m) >= 0) {
        res = u.isub(this.m);
      } else if (u.cmpn(0) < 0) {
        res = u.iadd(this.m);
      }

      return res._forceRed(this);
    };

    Mont.prototype.mul = function mul (a, b) {
      if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this);

      var t = a.mul(b);
      var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
      var u = t.isub(c).iushrn(this.shift);
      var res = u;
      if (u.cmp(this.m) >= 0) {
        res = u.isub(this.m);
      } else if (u.cmpn(0) < 0) {
        res = u.iadd(this.m);
      }

      return res._forceRed(this);
    };

    Mont.prototype.invm = function invm (a) {
      // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
      var res = this.imod(a._invmp(this.m).mul(this.r2));
      return res._forceRed(this);
    };
  })(module, commonjsGlobal);
  });

  const version$3 = "logger/5.5.0";

  let _permanentCensorErrors = false;
  let _censorErrors = false;
  const LogLevels = { debug: 1, "default": 2, info: 2, warning: 3, error: 4, off: 5 };
  let _logLevel = LogLevels["default"];
  let _globalLogger = null;
  function _checkNormalize() {
      try {
          const missing = [];
          // Make sure all forms of normalization are supported
          ["NFD", "NFC", "NFKD", "NFKC"].forEach((form) => {
              try {
                  if ("test".normalize(form) !== "test") {
                      throw new Error("bad normalize");
                  }
                  ;
              }
              catch (error) {
                  missing.push(form);
              }
          });
          if (missing.length) {
              throw new Error("missing " + missing.join(", "));
          }
          if (String.fromCharCode(0xe9).normalize("NFD") !== String.fromCharCode(0x65, 0x0301)) {
              throw new Error("broken implementation");
          }
      }
      catch (error) {
          return error.message;
      }
      return null;
  }
  const _normalizeError = _checkNormalize();
  var LogLevel;
  (function (LogLevel) {
      LogLevel["DEBUG"] = "DEBUG";
      LogLevel["INFO"] = "INFO";
      LogLevel["WARNING"] = "WARNING";
      LogLevel["ERROR"] = "ERROR";
      LogLevel["OFF"] = "OFF";
  })(LogLevel || (LogLevel = {}));
  var ErrorCode;
  (function (ErrorCode) {
      ///////////////////
      // Generic Errors
      // Unknown Error
      ErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
      // Not Implemented
      ErrorCode["NOT_IMPLEMENTED"] = "NOT_IMPLEMENTED";
      // Unsupported Operation
      //   - operation
      ErrorCode["UNSUPPORTED_OPERATION"] = "UNSUPPORTED_OPERATION";
      // Network Error (i.e. Ethereum Network, such as an invalid chain ID)
      //   - event ("noNetwork" is not re-thrown in provider.ready; otherwise thrown)
      ErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
      // Some sort of bad response from the server
      ErrorCode["SERVER_ERROR"] = "SERVER_ERROR";
      // Timeout
      ErrorCode["TIMEOUT"] = "TIMEOUT";
      ///////////////////
      // Operational  Errors
      // Buffer Overrun
      ErrorCode["BUFFER_OVERRUN"] = "BUFFER_OVERRUN";
      // Numeric Fault
      //   - operation: the operation being executed
      //   - fault: the reason this faulted
      ErrorCode["NUMERIC_FAULT"] = "NUMERIC_FAULT";
      ///////////////////
      // Argument Errors
      // Missing new operator to an object
      //  - name: The name of the class
      ErrorCode["MISSING_NEW"] = "MISSING_NEW";
      // Invalid argument (e.g. value is incompatible with type) to a function:
      //   - argument: The argument name that was invalid
      //   - value: The value of the argument
      ErrorCode["INVALID_ARGUMENT"] = "INVALID_ARGUMENT";
      // Missing argument to a function:
      //   - count: The number of arguments received
      //   - expectedCount: The number of arguments expected
      ErrorCode["MISSING_ARGUMENT"] = "MISSING_ARGUMENT";
      // Too many arguments
      //   - count: The number of arguments received
      //   - expectedCount: The number of arguments expected
      ErrorCode["UNEXPECTED_ARGUMENT"] = "UNEXPECTED_ARGUMENT";
      ///////////////////
      // Blockchain Errors
      // Call exception
      //  - transaction: the transaction
      //  - address?: the contract address
      //  - args?: The arguments passed into the function
      //  - method?: The Solidity method signature
      //  - errorSignature?: The EIP848 error signature
      //  - errorArgs?: The EIP848 error parameters
      //  - reason: The reason (only for EIP848 "Error(string)")
      ErrorCode["CALL_EXCEPTION"] = "CALL_EXCEPTION";
      // Insufficient funds (< value + gasLimit * gasPrice)
      //   - transaction: the transaction attempted
      ErrorCode["INSUFFICIENT_FUNDS"] = "INSUFFICIENT_FUNDS";
      // Nonce has already been used
      //   - transaction: the transaction attempted
      ErrorCode["NONCE_EXPIRED"] = "NONCE_EXPIRED";
      // The replacement fee for the transaction is too low
      //   - transaction: the transaction attempted
      ErrorCode["REPLACEMENT_UNDERPRICED"] = "REPLACEMENT_UNDERPRICED";
      // The gas limit could not be estimated
      //   - transaction: the transaction passed to estimateGas
      ErrorCode["UNPREDICTABLE_GAS_LIMIT"] = "UNPREDICTABLE_GAS_LIMIT";
      // The transaction was replaced by one with a higher gas price
      //   - reason: "cancelled", "replaced" or "repriced"
      //   - cancelled: true if reason == "cancelled" or reason == "replaced")
      //   - hash: original transaction hash
      //   - replacement: the full TransactionsResponse for the replacement
      //   - receipt: the receipt of the replacement
      ErrorCode["TRANSACTION_REPLACED"] = "TRANSACTION_REPLACED";
  })(ErrorCode || (ErrorCode = {}));
  const HEX = "0123456789abcdef";
  class Logger {
      constructor(version) {
          Object.defineProperty(this, "version", {
              enumerable: true,
              value: version,
              writable: false
          });
      }
      _log(logLevel, args) {
          const level = logLevel.toLowerCase();
          if (LogLevels[level] == null) {
              this.throwArgumentError("invalid log level name", "logLevel", logLevel);
          }
          if (_logLevel > LogLevels[level]) {
              return;
          }
          console.log.apply(console, args);
      }
      debug(...args) {
          this._log(Logger.levels.DEBUG, args);
      }
      info(...args) {
          this._log(Logger.levels.INFO, args);
      }
      warn(...args) {
          this._log(Logger.levels.WARNING, args);
      }
      makeError(message, code, params) {
          // Errors are being censored
          if (_censorErrors) {
              return this.makeError("censored error", code, {});
          }
          if (!code) {
              code = Logger.errors.UNKNOWN_ERROR;
          }
          if (!params) {
              params = {};
          }
          const messageDetails = [];
          Object.keys(params).forEach((key) => {
              const value = params[key];
              try {
                  if (value instanceof Uint8Array) {
                      let hex = "";
                      for (let i = 0; i < value.length; i++) {
                          hex += HEX[value[i] >> 4];
                          hex += HEX[value[i] & 0x0f];
                      }
                      messageDetails.push(key + "=Uint8Array(0x" + hex + ")");
                  }
                  else {
                      messageDetails.push(key + "=" + JSON.stringify(value));
                  }
              }
              catch (error) {
                  messageDetails.push(key + "=" + JSON.stringify(params[key].toString()));
              }
          });
          messageDetails.push(`code=${code}`);
          messageDetails.push(`version=${this.version}`);
          const reason = message;
          if (messageDetails.length) {
              message += " (" + messageDetails.join(", ") + ")";
          }
          // @TODO: Any??
          const error = new Error(message);
          error.reason = reason;
          error.code = code;
          Object.keys(params).forEach(function (key) {
              error[key] = params[key];
          });
          return error;
      }
      throwError(message, code, params) {
          throw this.makeError(message, code, params);
      }
      throwArgumentError(message, name, value) {
          return this.throwError(message, Logger.errors.INVALID_ARGUMENT, {
              argument: name,
              value: value
          });
      }
      assert(condition, message, code, params) {
          if (!!condition) {
              return;
          }
          this.throwError(message, code, params);
      }
      assertArgument(condition, message, name, value) {
          if (!!condition) {
              return;
          }
          this.throwArgumentError(message, name, value);
      }
      checkNormalize(message) {
          if (_normalizeError) {
              this.throwError("platform missing String.prototype.normalize", Logger.errors.UNSUPPORTED_OPERATION, {
                  operation: "String.prototype.normalize", form: _normalizeError
              });
          }
      }
      checkSafeUint53(value, message) {
          if (typeof (value) !== "number") {
              return;
          }
          if (message == null) {
              message = "value not safe";
          }
          if (value < 0 || value >= 0x1fffffffffffff) {
              this.throwError(message, Logger.errors.NUMERIC_FAULT, {
                  operation: "checkSafeInteger",
                  fault: "out-of-safe-range",
                  value: value
              });
          }
          if (value % 1) {
              this.throwError(message, Logger.errors.NUMERIC_FAULT, {
                  operation: "checkSafeInteger",
                  fault: "non-integer",
                  value: value
              });
          }
      }
      checkArgumentCount(count, expectedCount, message) {
          if (message) {
              message = ": " + message;
          }
          else {
              message = "";
          }
          if (count < expectedCount) {
              this.throwError("missing argument" + message, Logger.errors.MISSING_ARGUMENT, {
                  count: count,
                  expectedCount: expectedCount
              });
          }
          if (count > expectedCount) {
              this.throwError("too many arguments" + message, Logger.errors.UNEXPECTED_ARGUMENT, {
                  count: count,
                  expectedCount: expectedCount
              });
          }
      }
      checkNew(target, kind) {
          if (target === Object || target == null) {
              this.throwError("missing new", Logger.errors.MISSING_NEW, { name: kind.name });
          }
      }
      checkAbstract(target, kind) {
          if (target === kind) {
              this.throwError("cannot instantiate abstract class " + JSON.stringify(kind.name) + " directly; use a sub-class", Logger.errors.UNSUPPORTED_OPERATION, { name: target.name, operation: "new" });
          }
          else if (target === Object || target == null) {
              this.throwError("missing new", Logger.errors.MISSING_NEW, { name: kind.name });
          }
      }
      static globalLogger() {
          if (!_globalLogger) {
              _globalLogger = new Logger(version$3);
          }
          return _globalLogger;
      }
      static setCensorship(censorship, permanent) {
          if (!censorship && permanent) {
              this.globalLogger().throwError("cannot permanently disable censorship", Logger.errors.UNSUPPORTED_OPERATION, {
                  operation: "setCensorship"
              });
          }
          if (_permanentCensorErrors) {
              if (!censorship) {
                  return;
              }
              this.globalLogger().throwError("error censorship permanent", Logger.errors.UNSUPPORTED_OPERATION, {
                  operation: "setCensorship"
              });
          }
          _censorErrors = !!censorship;
          _permanentCensorErrors = !!permanent;
      }
      static setLogLevel(logLevel) {
          const level = LogLevels[logLevel.toLowerCase()];
          if (level == null) {
              Logger.globalLogger().warn("invalid log level - " + logLevel);
              return;
          }
          _logLevel = level;
      }
      static from(version) {
          return new Logger(version);
      }
  }
  Logger.errors = ErrorCode;
  Logger.levels = LogLevel;

  const version$2 = "bytes/5.5.0";

  const logger$3 = new Logger(version$2);
  ///////////////////////////////
  function isHexable(value) {
      return !!(value.toHexString);
  }
  function addSlice(array) {
      if (array.slice) {
          return array;
      }
      array.slice = function () {
          const args = Array.prototype.slice.call(arguments);
          return addSlice(new Uint8Array(Array.prototype.slice.apply(array, args)));
      };
      return array;
  }
  function isInteger(value) {
      return (typeof (value) === "number" && value == value && (value % 1) === 0);
  }
  function isBytes(value) {
      if (value == null) {
          return false;
      }
      if (value.constructor === Uint8Array) {
          return true;
      }
      if (typeof (value) === "string") {
          return false;
      }
      if (!isInteger(value.length) || value.length < 0) {
          return false;
      }
      for (let i = 0; i < value.length; i++) {
          const v = value[i];
          if (!isInteger(v) || v < 0 || v >= 256) {
              return false;
          }
      }
      return true;
  }
  function arrayify(value, options) {
      if (!options) {
          options = {};
      }
      if (typeof (value) === "number") {
          logger$3.checkSafeUint53(value, "invalid arrayify value");
          const result = [];
          while (value) {
              result.unshift(value & 0xff);
              value = parseInt(String(value / 256));
          }
          if (result.length === 0) {
              result.push(0);
          }
          return addSlice(new Uint8Array(result));
      }
      if (options.allowMissingPrefix && typeof (value) === "string" && value.substring(0, 2) !== "0x") {
          value = "0x" + value;
      }
      if (isHexable(value)) {
          value = value.toHexString();
      }
      if (isHexString(value)) {
          let hex = value.substring(2);
          if (hex.length % 2) {
              if (options.hexPad === "left") {
                  hex = "0x0" + hex.substring(2);
              }
              else if (options.hexPad === "right") {
                  hex += "0";
              }
              else {
                  logger$3.throwArgumentError("hex data is odd-length", "value", value);
              }
          }
          const result = [];
          for (let i = 0; i < hex.length; i += 2) {
              result.push(parseInt(hex.substring(i, i + 2), 16));
          }
          return addSlice(new Uint8Array(result));
      }
      if (isBytes(value)) {
          return addSlice(new Uint8Array(value));
      }
      return logger$3.throwArgumentError("invalid arrayify value", "value", value);
  }
  function isHexString(value, length) {
      if (typeof (value) !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
          return false;
      }
      if (length && value.length !== 2 + 2 * length) {
          return false;
      }
      return true;
  }
  const HexCharacters = "0123456789abcdef";
  function hexlify(value, options) {
      if (!options) {
          options = {};
      }
      if (typeof (value) === "number") {
          logger$3.checkSafeUint53(value, "invalid hexlify value");
          let hex = "";
          while (value) {
              hex = HexCharacters[value & 0xf] + hex;
              value = Math.floor(value / 16);
          }
          if (hex.length) {
              if (hex.length % 2) {
                  hex = "0" + hex;
              }
              return "0x" + hex;
          }
          return "0x00";
      }
      if (typeof (value) === "bigint") {
          value = value.toString(16);
          if (value.length % 2) {
              return ("0x0" + value);
          }
          return "0x" + value;
      }
      if (options.allowMissingPrefix && typeof (value) === "string" && value.substring(0, 2) !== "0x") {
          value = "0x" + value;
      }
      if (isHexable(value)) {
          return value.toHexString();
      }
      if (isHexString(value)) {
          if (value.length % 2) {
              if (options.hexPad === "left") {
                  value = "0x0" + value.substring(2);
              }
              else if (options.hexPad === "right") {
                  value += "0";
              }
              else {
                  logger$3.throwArgumentError("hex data is odd-length", "value", value);
              }
          }
          return value.toLowerCase();
      }
      if (isBytes(value)) {
          let result = "0x";
          for (let i = 0; i < value.length; i++) {
              let v = value[i];
              result += HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f];
          }
          return result;
      }
      return logger$3.throwArgumentError("invalid hexlify value", "value", value);
  }
  function hexZeroPad(value, length) {
      if (typeof (value) !== "string") {
          value = hexlify(value);
      }
      else if (!isHexString(value)) {
          logger$3.throwArgumentError("invalid hex string", "value", value);
      }
      if (value.length > 2 * length + 2) {
          logger$3.throwArgumentError("value out of range", "value", arguments[1]);
      }
      while (value.length < 2 * length + 2) {
          value = "0x0" + value.substring(2);
      }
      return value;
  }

  const version$1 = "bignumber/5.5.0";

  var BN = bn.BN;
  const logger$2 = new Logger(version$1);
  const _constructorGuard$1 = {};
  const MAX_SAFE = 0x1fffffffffffff;
  function isBigNumberish(value) {
      return (value != null) && (BigNumber.isBigNumber(value) ||
          (typeof (value) === "number" && (value % 1) === 0) ||
          (typeof (value) === "string" && !!value.match(/^-?[0-9]+$/)) ||
          isHexString(value) ||
          (typeof (value) === "bigint") ||
          isBytes(value));
  }
  // Only warn about passing 10 into radix once
  let _warnedToStringRadix = false;
  class BigNumber {
      constructor(constructorGuard, hex) {
          logger$2.checkNew(new.target, BigNumber);
          if (constructorGuard !== _constructorGuard$1) {
              logger$2.throwError("cannot call constructor directly; use BigNumber.from", Logger.errors.UNSUPPORTED_OPERATION, {
                  operation: "new (BigNumber)"
              });
          }
          this._hex = hex;
          this._isBigNumber = true;
          Object.freeze(this);
      }
      fromTwos(value) {
          return toBigNumber(toBN(this).fromTwos(value));
      }
      toTwos(value) {
          return toBigNumber(toBN(this).toTwos(value));
      }
      abs() {
          if (this._hex[0] === "-") {
              return BigNumber.from(this._hex.substring(1));
          }
          return this;
      }
      add(other) {
          return toBigNumber(toBN(this).add(toBN(other)));
      }
      sub(other) {
          return toBigNumber(toBN(this).sub(toBN(other)));
      }
      div(other) {
          const o = BigNumber.from(other);
          if (o.isZero()) {
              throwFault$1("division by zero", "div");
          }
          return toBigNumber(toBN(this).div(toBN(other)));
      }
      mul(other) {
          return toBigNumber(toBN(this).mul(toBN(other)));
      }
      mod(other) {
          const value = toBN(other);
          if (value.isNeg()) {
              throwFault$1("cannot modulo negative values", "mod");
          }
          return toBigNumber(toBN(this).umod(value));
      }
      pow(other) {
          const value = toBN(other);
          if (value.isNeg()) {
              throwFault$1("cannot raise to negative values", "pow");
          }
          return toBigNumber(toBN(this).pow(value));
      }
      and(other) {
          const value = toBN(other);
          if (this.isNegative() || value.isNeg()) {
              throwFault$1("cannot 'and' negative values", "and");
          }
          return toBigNumber(toBN(this).and(value));
      }
      or(other) {
          const value = toBN(other);
          if (this.isNegative() || value.isNeg()) {
              throwFault$1("cannot 'or' negative values", "or");
          }
          return toBigNumber(toBN(this).or(value));
      }
      xor(other) {
          const value = toBN(other);
          if (this.isNegative() || value.isNeg()) {
              throwFault$1("cannot 'xor' negative values", "xor");
          }
          return toBigNumber(toBN(this).xor(value));
      }
      mask(value) {
          if (this.isNegative() || value < 0) {
              throwFault$1("cannot mask negative values", "mask");
          }
          return toBigNumber(toBN(this).maskn(value));
      }
      shl(value) {
          if (this.isNegative() || value < 0) {
              throwFault$1("cannot shift negative values", "shl");
          }
          return toBigNumber(toBN(this).shln(value));
      }
      shr(value) {
          if (this.isNegative() || value < 0) {
              throwFault$1("cannot shift negative values", "shr");
          }
          return toBigNumber(toBN(this).shrn(value));
      }
      eq(other) {
          return toBN(this).eq(toBN(other));
      }
      lt(other) {
          return toBN(this).lt(toBN(other));
      }
      lte(other) {
          return toBN(this).lte(toBN(other));
      }
      gt(other) {
          return toBN(this).gt(toBN(other));
      }
      gte(other) {
          return toBN(this).gte(toBN(other));
      }
      isNegative() {
          return (this._hex[0] === "-");
      }
      isZero() {
          return toBN(this).isZero();
      }
      toNumber() {
          try {
              return toBN(this).toNumber();
          }
          catch (error) {
              throwFault$1("overflow", "toNumber", this.toString());
          }
          return null;
      }
      toBigInt() {
          try {
              return BigInt(this.toString());
          }
          catch (e) { }
          return logger$2.throwError("this platform does not support BigInt", Logger.errors.UNSUPPORTED_OPERATION, {
              value: this.toString()
          });
      }
      toString() {
          // Lots of people expect this, which we do not support, so check (See: #889)
          if (arguments.length > 0) {
              if (arguments[0] === 10) {
                  if (!_warnedToStringRadix) {
                      _warnedToStringRadix = true;
                      logger$2.warn("BigNumber.toString does not accept any parameters; base-10 is assumed");
                  }
              }
              else if (arguments[0] === 16) {
                  logger$2.throwError("BigNumber.toString does not accept any parameters; use bigNumber.toHexString()", Logger.errors.UNEXPECTED_ARGUMENT, {});
              }
              else {
                  logger$2.throwError("BigNumber.toString does not accept parameters", Logger.errors.UNEXPECTED_ARGUMENT, {});
              }
          }
          return toBN(this).toString(10);
      }
      toHexString() {
          return this._hex;
      }
      toJSON(key) {
          return { type: "BigNumber", hex: this.toHexString() };
      }
      static from(value) {
          if (value instanceof BigNumber) {
              return value;
          }
          if (typeof (value) === "string") {
              if (value.match(/^-?0x[0-9a-f]+$/i)) {
                  return new BigNumber(_constructorGuard$1, toHex(value));
              }
              if (value.match(/^-?[0-9]+$/)) {
                  return new BigNumber(_constructorGuard$1, toHex(new BN(value)));
              }
              return logger$2.throwArgumentError("invalid BigNumber string", "value", value);
          }
          if (typeof (value) === "number") {
              if (value % 1) {
                  throwFault$1("underflow", "BigNumber.from", value);
              }
              if (value >= MAX_SAFE || value <= -MAX_SAFE) {
                  throwFault$1("overflow", "BigNumber.from", value);
              }
              return BigNumber.from(String(value));
          }
          const anyValue = value;
          if (typeof (anyValue) === "bigint") {
              return BigNumber.from(anyValue.toString());
          }
          if (isBytes(anyValue)) {
              return BigNumber.from(hexlify(anyValue));
          }
          if (anyValue) {
              // Hexable interface (takes priority)
              if (anyValue.toHexString) {
                  const hex = anyValue.toHexString();
                  if (typeof (hex) === "string") {
                      return BigNumber.from(hex);
                  }
              }
              else {
                  // For now, handle legacy JSON-ified values (goes away in v6)
                  let hex = anyValue._hex;
                  // New-form JSON
                  if (hex == null && anyValue.type === "BigNumber") {
                      hex = anyValue.hex;
                  }
                  if (typeof (hex) === "string") {
                      if (isHexString(hex) || (hex[0] === "-" && isHexString(hex.substring(1)))) {
                          return BigNumber.from(hex);
                      }
                  }
              }
          }
          return logger$2.throwArgumentError("invalid BigNumber value", "value", value);
      }
      static isBigNumber(value) {
          return !!(value && value._isBigNumber);
      }
  }
  // Normalize the hex string
  function toHex(value) {
      // For BN, call on the hex string
      if (typeof (value) !== "string") {
          return toHex(value.toString(16));
      }
      // If negative, prepend the negative sign to the normalized positive value
      if (value[0] === "-") {
          // Strip off the negative sign
          value = value.substring(1);
          // Cannot have multiple negative signs (e.g. "--0x04")
          if (value[0] === "-") {
              logger$2.throwArgumentError("invalid hex", "value", value);
          }
          // Call toHex on the positive component
          value = toHex(value);
          // Do not allow "-0x00"
          if (value === "0x00") {
              return value;
          }
          // Negate the value
          return "-" + value;
      }
      // Add a "0x" prefix if missing
      if (value.substring(0, 2) !== "0x") {
          value = "0x" + value;
      }
      // Normalize zero
      if (value === "0x") {
          return "0x00";
      }
      // Make the string even length
      if (value.length % 2) {
          value = "0x0" + value.substring(2);
      }
      // Trim to smallest even-length string
      while (value.length > 4 && value.substring(0, 4) === "0x00") {
          value = "0x" + value.substring(4);
      }
      return value;
  }
  function toBigNumber(value) {
      return BigNumber.from(toHex(value));
  }
  function toBN(value) {
      const hex = BigNumber.from(value).toHexString();
      if (hex[0] === "-") {
          return (new BN("-" + hex.substring(3), 16));
      }
      return new BN(hex.substring(2), 16);
  }
  function throwFault$1(fault, operation, value) {
      const params = { fault: fault, operation: operation };
      if (value != null) {
          params.value = value;
      }
      return logger$2.throwError(fault, Logger.errors.NUMERIC_FAULT, params);
  }

  const logger$1 = new Logger(version$1);
  const _constructorGuard = {};
  const Zero = BigNumber.from(0);
  const NegativeOne = BigNumber.from(-1);
  function throwFault(message, fault, operation, value) {
      const params = { fault: fault, operation: operation };
      if (value !== undefined) {
          params.value = value;
      }
      return logger$1.throwError(message, Logger.errors.NUMERIC_FAULT, params);
  }
  // Constant to pull zeros from for multipliers
  let zeros = "0";
  while (zeros.length < 256) {
      zeros += zeros;
  }
  // Returns a string "1" followed by decimal "0"s
  function getMultiplier(decimals) {
      if (typeof (decimals) !== "number") {
          try {
              decimals = BigNumber.from(decimals).toNumber();
          }
          catch (e) { }
      }
      if (typeof (decimals) === "number" && decimals >= 0 && decimals <= 256 && !(decimals % 1)) {
          return ("1" + zeros.substring(0, decimals));
      }
      return logger$1.throwArgumentError("invalid decimal size", "decimals", decimals);
  }
  function formatFixed(value, decimals) {
      if (decimals == null) {
          decimals = 0;
      }
      const multiplier = getMultiplier(decimals);
      // Make sure wei is a big number (convert as necessary)
      value = BigNumber.from(value);
      const negative = value.lt(Zero);
      if (negative) {
          value = value.mul(NegativeOne);
      }
      let fraction = value.mod(multiplier).toString();
      while (fraction.length < multiplier.length - 1) {
          fraction = "0" + fraction;
      }
      // Strip training 0
      fraction = fraction.match(/^([0-9]*[1-9]|0)(0*)/)[1];
      const whole = value.div(multiplier).toString();
      if (multiplier.length === 1) {
          value = whole;
      }
      else {
          value = whole + "." + fraction;
      }
      if (negative) {
          value = "-" + value;
      }
      return value;
  }
  function parseFixed(value, decimals) {
      if (decimals == null) {
          decimals = 0;
      }
      const multiplier = getMultiplier(decimals);
      if (typeof (value) !== "string" || !value.match(/^-?[0-9.]+$/)) {
          logger$1.throwArgumentError("invalid decimal value", "value", value);
      }
      // Is it negative?
      const negative = (value.substring(0, 1) === "-");
      if (negative) {
          value = value.substring(1);
      }
      if (value === ".") {
          logger$1.throwArgumentError("missing value", "value", value);
      }
      // Split it into a whole and fractional part
      const comps = value.split(".");
      if (comps.length > 2) {
          logger$1.throwArgumentError("too many decimal points", "value", value);
      }
      let whole = comps[0], fraction = comps[1];
      if (!whole) {
          whole = "0";
      }
      if (!fraction) {
          fraction = "0";
      }
      // Trim trailing zeros
      while (fraction[fraction.length - 1] === "0") {
          fraction = fraction.substring(0, fraction.length - 1);
      }
      // Check the fraction doesn't exceed our decimals size
      if (fraction.length > multiplier.length - 1) {
          throwFault("fractional component exceeds decimals", "underflow", "parseFixed");
      }
      // If decimals is 0, we have an empty string for fraction
      if (fraction === "") {
          fraction = "0";
      }
      // Fully pad the string with zeros to get to wei
      while (fraction.length < multiplier.length - 1) {
          fraction += "0";
      }
      const wholeValue = BigNumber.from(whole);
      const fractionValue = BigNumber.from(fraction);
      let wei = (wholeValue.mul(multiplier)).add(fractionValue);
      if (negative) {
          wei = wei.mul(NegativeOne);
      }
      return wei;
  }
  class FixedFormat {
      constructor(constructorGuard, signed, width, decimals) {
          if (constructorGuard !== _constructorGuard) {
              logger$1.throwError("cannot use FixedFormat constructor; use FixedFormat.from", Logger.errors.UNSUPPORTED_OPERATION, {
                  operation: "new FixedFormat"
              });
          }
          this.signed = signed;
          this.width = width;
          this.decimals = decimals;
          this.name = (signed ? "" : "u") + "fixed" + String(width) + "x" + String(decimals);
          this._multiplier = getMultiplier(decimals);
          Object.freeze(this);
      }
      static from(value) {
          if (value instanceof FixedFormat) {
              return value;
          }
          if (typeof (value) === "number") {
              value = `fixed128x${value}`;
          }
          let signed = true;
          let width = 128;
          let decimals = 18;
          if (typeof (value) === "string") {
              if (value === "fixed") ;
              else if (value === "ufixed") {
                  signed = false;
              }
              else {
                  const match = value.match(/^(u?)fixed([0-9]+)x([0-9]+)$/);
                  if (!match) {
                      logger$1.throwArgumentError("invalid fixed format", "format", value);
                  }
                  signed = (match[1] !== "u");
                  width = parseInt(match[2]);
                  decimals = parseInt(match[3]);
              }
          }
          else if (value) {
              const check = (key, type, defaultValue) => {
                  if (value[key] == null) {
                      return defaultValue;
                  }
                  if (typeof (value[key]) !== type) {
                      logger$1.throwArgumentError("invalid fixed format (" + key + " not " + type + ")", "format." + key, value[key]);
                  }
                  return value[key];
              };
              signed = check("signed", "boolean", signed);
              width = check("width", "number", width);
              decimals = check("decimals", "number", decimals);
          }
          if (width % 8) {
              logger$1.throwArgumentError("invalid fixed format width (not byte aligned)", "format.width", width);
          }
          if (decimals > 80) {
              logger$1.throwArgumentError("invalid fixed format (decimals too large)", "format.decimals", decimals);
          }
          return new FixedFormat(_constructorGuard, signed, width, decimals);
      }
  }
  class FixedNumber {
      constructor(constructorGuard, hex, value, format) {
          logger$1.checkNew(new.target, FixedNumber);
          if (constructorGuard !== _constructorGuard) {
              logger$1.throwError("cannot use FixedNumber constructor; use FixedNumber.from", Logger.errors.UNSUPPORTED_OPERATION, {
                  operation: "new FixedFormat"
              });
          }
          this.format = format;
          this._hex = hex;
          this._value = value;
          this._isFixedNumber = true;
          Object.freeze(this);
      }
      _checkFormat(other) {
          if (this.format.name !== other.format.name) {
              logger$1.throwArgumentError("incompatible format; use fixedNumber.toFormat", "other", other);
          }
      }
      addUnsafe(other) {
          this._checkFormat(other);
          const a = parseFixed(this._value, this.format.decimals);
          const b = parseFixed(other._value, other.format.decimals);
          return FixedNumber.fromValue(a.add(b), this.format.decimals, this.format);
      }
      subUnsafe(other) {
          this._checkFormat(other);
          const a = parseFixed(this._value, this.format.decimals);
          const b = parseFixed(other._value, other.format.decimals);
          return FixedNumber.fromValue(a.sub(b), this.format.decimals, this.format);
      }
      mulUnsafe(other) {
          this._checkFormat(other);
          const a = parseFixed(this._value, this.format.decimals);
          const b = parseFixed(other._value, other.format.decimals);
          return FixedNumber.fromValue(a.mul(b).div(this.format._multiplier), this.format.decimals, this.format);
      }
      divUnsafe(other) {
          this._checkFormat(other);
          const a = parseFixed(this._value, this.format.decimals);
          const b = parseFixed(other._value, other.format.decimals);
          return FixedNumber.fromValue(a.mul(this.format._multiplier).div(b), this.format.decimals, this.format);
      }
      floor() {
          const comps = this.toString().split(".");
          if (comps.length === 1) {
              comps.push("0");
          }
          let result = FixedNumber.from(comps[0], this.format);
          const hasFraction = !comps[1].match(/^(0*)$/);
          if (this.isNegative() && hasFraction) {
              result = result.subUnsafe(ONE.toFormat(result.format));
          }
          return result;
      }
      ceiling() {
          const comps = this.toString().split(".");
          if (comps.length === 1) {
              comps.push("0");
          }
          let result = FixedNumber.from(comps[0], this.format);
          const hasFraction = !comps[1].match(/^(0*)$/);
          if (!this.isNegative() && hasFraction) {
              result = result.addUnsafe(ONE.toFormat(result.format));
          }
          return result;
      }
      // @TODO: Support other rounding algorithms
      round(decimals) {
          if (decimals == null) {
              decimals = 0;
          }
          // If we are already in range, we're done
          const comps = this.toString().split(".");
          if (comps.length === 1) {
              comps.push("0");
          }
          if (decimals < 0 || decimals > 80 || (decimals % 1)) {
              logger$1.throwArgumentError("invalid decimal count", "decimals", decimals);
          }
          if (comps[1].length <= decimals) {
              return this;
          }
          const factor = FixedNumber.from("1" + zeros.substring(0, decimals), this.format);
          const bump = BUMP.toFormat(this.format);
          return this.mulUnsafe(factor).addUnsafe(bump).floor().divUnsafe(factor);
      }
      isZero() {
          return (this._value === "0.0" || this._value === "0");
      }
      isNegative() {
          return (this._value[0] === "-");
      }
      toString() { return this._value; }
      toHexString(width) {
          if (width == null) {
              return this._hex;
          }
          if (width % 8) {
              logger$1.throwArgumentError("invalid byte width", "width", width);
          }
          const hex = BigNumber.from(this._hex).fromTwos(this.format.width).toTwos(width).toHexString();
          return hexZeroPad(hex, width / 8);
      }
      toUnsafeFloat() { return parseFloat(this.toString()); }
      toFormat(format) {
          return FixedNumber.fromString(this._value, format);
      }
      static fromValue(value, decimals, format) {
          // If decimals looks more like a format, and there is no format, shift the parameters
          if (format == null && decimals != null && !isBigNumberish(decimals)) {
              format = decimals;
              decimals = null;
          }
          if (decimals == null) {
              decimals = 0;
          }
          if (format == null) {
              format = "fixed";
          }
          return FixedNumber.fromString(formatFixed(value, decimals), FixedFormat.from(format));
      }
      static fromString(value, format) {
          if (format == null) {
              format = "fixed";
          }
          const fixedFormat = FixedFormat.from(format);
          const numeric = parseFixed(value, fixedFormat.decimals);
          if (!fixedFormat.signed && numeric.lt(Zero)) {
              throwFault("unsigned value cannot be negative", "overflow", "value", value);
          }
          let hex = null;
          if (fixedFormat.signed) {
              hex = numeric.toTwos(fixedFormat.width).toHexString();
          }
          else {
              hex = numeric.toHexString();
              hex = hexZeroPad(hex, fixedFormat.width / 8);
          }
          const decimal = formatFixed(numeric, fixedFormat.decimals);
          return new FixedNumber(_constructorGuard, hex, decimal, fixedFormat);
      }
      static fromBytes(value, format) {
          if (format == null) {
              format = "fixed";
          }
          const fixedFormat = FixedFormat.from(format);
          if (arrayify(value).length > fixedFormat.width / 8) {
              throw new Error("overflow");
          }
          let numeric = BigNumber.from(value);
          if (fixedFormat.signed) {
              numeric = numeric.fromTwos(fixedFormat.width);
          }
          const hex = numeric.toTwos((fixedFormat.signed ? 0 : 1) + fixedFormat.width).toHexString();
          const decimal = formatFixed(numeric, fixedFormat.decimals);
          return new FixedNumber(_constructorGuard, hex, decimal, fixedFormat);
      }
      static from(value, format) {
          if (typeof (value) === "string") {
              return FixedNumber.fromString(value, format);
          }
          if (isBytes(value)) {
              return FixedNumber.fromBytes(value, format);
          }
          try {
              return FixedNumber.fromValue(value, 0, format);
          }
          catch (error) {
              // Allow NUMERIC_FAULT to bubble up
              if (error.code !== Logger.errors.INVALID_ARGUMENT) {
                  throw error;
              }
          }
          return logger$1.throwArgumentError("invalid FixedNumber value", "value", value);
      }
      static isFixedNumber(value) {
          return !!(value && value._isFixedNumber);
      }
  }
  const ONE = FixedNumber.from(1);
  const BUMP = FixedNumber.from("0.5");

  const version = "units/5.5.0";

  const logger = new Logger(version);
  const names = [
      "wei",
      "kwei",
      "mwei",
      "gwei",
      "szabo",
      "finney",
      "ether",
  ];
  function parseUnits(value, unitName) {
      if (typeof (value) !== "string") {
          logger.throwArgumentError("value must be a string", "value", value);
      }
      if (typeof (unitName) === "string") {
          const index = names.indexOf(unitName);
          if (index !== -1) {
              unitName = 3 * index;
          }
      }
      return parseFixed(value, (unitName != null) ? unitName : 18);
  }

  function _optionalChain$1(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
  let getTransaction = ({ paymentRoute, event, fee })=> {
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
      if(paymentRoute.exchangePlugin) {
        transaction = paymentRoute.exchangePlugin.prepareTransaction(transaction);
      }
    }

    if(paymentRoute.contractCallPlugin) {
      transaction = paymentRoute.contractCallPlugin.prepareTransaction(transaction, paymentRoute.toContract);
    }

    return transaction
  };

  let transactionAddress = ({ paymentRoute, fee })=> {
    if(paymentRoute.directTransfer && !fee) {
      if(paymentRoute.toToken.address == web3Constants.CONSTANTS[paymentRoute.blockchain].NATIVE) {
        return paymentRoute.toAddress
      } else {
        return paymentRoute.toToken.address
      }
    } else {
      return routers[paymentRoute.blockchain].address
    }
  };

  let transactionApi = ({ paymentRoute, fee })=> {
    if(paymentRoute.directTransfer && !fee) {
      if(paymentRoute.toToken.address == web3Constants.CONSTANTS[paymentRoute.blockchain].NATIVE) {
        return undefined
      } else {
        return web3Tokens.Token[paymentRoute.blockchain].DEFAULT
      }
    } else {
      return routers[paymentRoute.blockchain].api
    }
  };

  let transactionMethod = ({ paymentRoute, fee })=> {
    if(paymentRoute.directTransfer && !fee) {
      if(paymentRoute.toToken.address == web3Constants.CONSTANTS[paymentRoute.blockchain].NATIVE) {
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
      if(paymentRoute.toToken.address == web3Constants.CONSTANTS[paymentRoute.blockchain].NATIVE) {
        return undefined
      } else {
        return [paymentRoute.toAddress, paymentRoute.toAmount]
      }
    } else {
      return {
        path: transactionPath({ paymentRoute, exchangeRoute }),
        amounts: transactionAmounts({ paymentRoute, exchangeRoute, fee }),
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

  let transactionAmounts = ({ paymentRoute, exchangeRoute, fee })=> {
    let amounts;
    if(exchangeRoute) {
      amounts = [
        exchangeRoute.amountIn.toString(),
        subtractFee({ amount: exchangeRoute.amountOutMin.toString(), paymentRoute, fee }),
        exchangeRoute.transaction.params.deadline
      ];
    } else {
      amounts = [
        paymentRoute.toAmount, // from
        subtractFee({ amount: paymentRoute.toAmount, paymentRoute, fee }) // to
      ];
    }
    if(fee){
      amounts[4] = transactionFeeAmount({ paymentRoute, fee });
    }
    for(var i = 0; i < amounts.length; i++) {
      if(amounts[i] == undefined){ amounts[i] = '0'; }
    }
    return amounts
  };

  let subtractFee = ({ amount, paymentRoute, fee })=> {
    if(fee) {
      let feeAmount = transactionFeeAmount({ paymentRoute, fee });
      return BigNumber.from(amount).sub(feeAmount).toString()
    } else {
      return amount
    }
  };

  let transactionFeeAmount = ({ paymentRoute, fee })=> {
    if(typeof fee.amount == 'string' && fee.amount.match('%')) {
      return BigNumber.from(paymentRoute.toAmount).div(100).mul(parseFloat(fee.amount)).toString()
    } else if(typeof fee.amount == 'string') {
      return fee.amount
    } else if(typeof fee.amount == 'number') {
      return parseUnits(fee.amount.toString(), paymentRoute.toDecimals).toString()
    } else {
      throw('Unknown fee amount type!')
    }
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
      paymentRoute.exchangePlugin = plugins[paymentRoute.blockchain][exchangeRoute.exchange.name];
      paymentPlugins.push(paymentRoute.exchangePlugin.address);
    }

    if(paymentRoute.toContract) {
      let signature = paymentRoute.toContract.signature.match(/\(.*\)/);
      if(signature && _optionalChain$1([signature, 'optionalAccess', _ => _.length])) {
        signature = signature[0].replace(/[\(\)]/g, '');
        let splitSignature = signature.split(',');
        if(splitSignature[0] == 'address' && splitSignature[1].match('uint') && splitSignature[2] == 'bool' && Number.isNaN(parseInt(paymentRoute.toContract.params[0]))) {
          paymentRoute.contractCallPlugin = plugins[paymentRoute.blockchain].contractCall.approveAndCallContractAddressAmountBoolean;
        } else if(splitSignature[0] == 'address' && splitSignature[1].match('uint') && splitSignature[2] == 'bool' && !Number.isNaN(parseInt(paymentRoute.toContract.params[0]))) {
          paymentRoute.contractCallPlugin = plugins[paymentRoute.blockchain].contractCall.approveAndCallContractAddressPassedAmountBoolean;
        } else {
          throw(signature)
        }
        paymentPlugins.push(paymentRoute.contractCallPlugin.address);
      }
    } else if(event == 'ifSwapped' && !paymentRoute.directTransfer) {
      paymentPlugins.push(plugins[paymentRoute.blockchain].paymentWithEvent.address);
    } else {
      paymentPlugins.push(plugins[paymentRoute.blockchain].payment.address);
    }

    if(fee) {
      paymentPlugins.push(plugins[paymentRoute.blockchain].paymentFee.address);
    }

    return paymentPlugins
  };

  let transactionValue = ({ paymentRoute, exchangeRoute })=> {
    if(paymentRoute.fromToken.address == web3Constants.CONSTANTS[paymentRoute.blockchain].NATIVE) {
      if(exchangeRoute) {
        return exchangeRoute.amountIn.toString()
      } else { // direct payment
        return paymentRoute.toAmount.toString()
      }
    } else {
      return BigNumber.from('0').toString()
    }
  };

  function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
  class PaymentRoute {
    constructor({ blockchain, fromAddress, fromToken, fromDecimals, fromAmount, toToken, toDecimals, toAmount, toAddress, toContract }) {
      this.blockchain = blockchain;
      this.fromAddress = fromAddress;
      this.fromToken = fromToken;
      this.fromAmount = _optionalChain([fromAmount, 'optionalAccess', _ => _.toString, 'call', _2 => _2()]);
      this.fromDecimals = fromDecimals;
      this.fromBalance = 0;
      this.toToken = toToken;
      this.toAmount = _optionalChain([toAmount, 'optionalAccess', _3 => _3.toString, 'call', _4 => _4()]);
      this.toDecimals = toDecimals;
      this.toAddress = toAddress;
      this.toContract = toContract;
      this.exchangeRoutes = [];
      this.transaction = undefined;
      this.approvalRequired = undefined;
      this.approvalTransaction = undefined;
      this.directTransfer = undefined;
      this.event = undefined;
    }
  }

  async function getAllAssetsFromAggregator({ accept }) {

    let routes = [
      ...new Set(
        accept.map(
          (configuration)=>(JSON.stringify({ blockchain: configuration.blockchain, fromAddress: configuration.fromAddress }))
        )
      )
    ];

    return await Promise.all(
      routes.map(
        async (route)=> {
          route = JSON.parse(route);
          return await web3Assets.getAssets({ blockchain: route.blockchain, account: route.fromAddress })
        }
      )
    ).then((assets)=>{
      return assets.flat()
    })
  }

  async function onlyGetWhitelistedAssets({ whitelist }) {
    let assets = [];

    Object.entries(whitelist).forEach((entry)=>{
      let blockchain = entry[0];
      entry[1].forEach((address)=>{
        assets.push({ blockchain, address });
      });
    });

    return assets
  }

  async function getAllAssets({ accept, whitelist }) {

    if(whitelist == undefined) {
      return getAllAssetsFromAggregator({ accept })
    } else {
      return onlyGetWhitelistedAssets({ whitelist })
    }
  }

  function convertToRoutes({ tokens, accept }) {
    return Promise.all(tokens.map(async (fromToken)=>{
      let relevantConfigurations = accept.filter((configuration)=>(configuration.blockchain == fromToken.blockchain));
      return Promise.all(relevantConfigurations.map(async (configuration)=>{
        if(configuration.token && configuration.amount) {
          let blockchain = configuration.blockchain;
          let toToken = new web3Tokens.Token({ blockchain, address: configuration.token });
          let fromDecimals = await fromToken.decimals();
          let toDecimals = await toToken.decimals();
          let toAmount = (await toToken.BigNumber(configuration.amount)).toString();

          return new PaymentRoute({
            blockchain,
            fromToken,
            fromDecimals,
            toToken,
            toAmount,
            toDecimals,
            fromAddress: configuration.fromAddress,
            toAddress: configuration.toAddress,
            toContract: configuration.toContract
          })
        } else if(configuration.fromToken && configuration.fromAmount && fromToken.address.toLowerCase() == configuration.fromToken.toLowerCase()) {
          let blockchain = configuration.blockchain;
          let fromAmount = (await fromToken.BigNumber(configuration.fromAmount)).toString();
          let fromDecimals = await fromToken.decimals();
          let toToken = new web3Tokens.Token({ blockchain, address: configuration.toToken });
          let toDecimals = await toToken.decimals();
          
          return new PaymentRoute({
            blockchain,
            fromToken,
            fromAmount,
            fromDecimals,
            toToken,
            toDecimals,
            fromAddress: configuration.fromAddress,
            toAddress: configuration.toAddress,
            toContract: configuration.toContract
          })
        }
      }))
    })).then((routes)=> routes.flat().filter(el => el))
  }

  async function route({ accept, whitelist, blacklist, event, fee }) {
    let paymentRoutes = getAllAssets({ accept, whitelist })
      .then((assets)=>filterBlacklistedAssets({ assets, blacklist }))
      .then(assetsToTokens)
      .then((tokens) => convertToRoutes({ tokens, accept }))
      .then(addDirectTransferStatus)
      .then(addExchangeRoutes)
      .then(filterExchangeRoutesWithoutPlugin)
      .then(filterNotRoutable)
      .then(addBalances)
      .then(filterInsufficientBalance)
      .then(addApproval)
      .then(sortPaymentRoutes)
      .then((routes)=>addTransactions({ routes, event, fee }))
      .then(addRouteAmounts)
      .then(filterDuplicateFromTokens);

    return paymentRoutes
  }

  let addBalances = async (routes) => {
    return Promise.all(routes.map((route) => route.fromToken.balance(route.fromAddress))).then((balances) => {
      balances.forEach((balance, index) => {
        routes[index].fromBalance = balance.toString();
      });
      return routes
    })
  };

  let assetsToTokens = async (assets) => {
    return assets.map((asset) => new web3Tokens.Token({ blockchain: asset.blockchain, address: asset.address }))
  };

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
      if(route.exchangeRoutes.length == 0) { return true }
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
        return BigNumber.from(route.fromBalance).gte(BigNumber.from(route.toAmount))
      } else if(route.fromAmount && route.toAmount) {
        return BigNumber.from(route.fromBalance).gte(BigNumber.from(route.exchangeRoutes[0].amountInMax))
      } else if(route.exchangeRoutes[0] && route.exchangeRoutes[0].amountIn) {
        return BigNumber.from(route.fromBalance).gte(BigNumber.from(route.exchangeRoutes[0].amountIn))
      }
    })
  };

  let addApproval = (routes) => {
    return Promise.all(routes.map(
      (route) => route.fromToken.allowance(route.fromAddress, routers[route.blockchain].address)
    )).then(
      (allowances) => {
        routes.forEach((route, index) => {
          if(
            (
              route.directTransfer ||
              route.fromToken.address.toLowerCase() == web3Constants.CONSTANTS[route.blockchain].NATIVE.toLowerCase()
            ) && route.toContract == undefined
          ) {
            routes[index].approvalRequired = false;
          } else {
            routes[index].approvalRequired = BigNumber.from(route.fromBalance).gte(BigNumber.from(allowances[index]));
            if(routes[index].approvalRequired) {
              routes[index].approvalTransaction = {
                blockchain: route.blockchain,
                to: route.fromToken.address,
                api: web3Tokens.Token[route.blockchain].DEFAULT,
                method: 'approve',
                params: [routers[route.blockchain].address, web3Constants.CONSTANTS[route.blockchain].MAXINT]
              };
            }
          }
        });
        return routes
      },
    )
  };

  let addDirectTransferStatus = (routes) => {
    return routes.map((route)=>{
      route.directTransfer = route.fromToken.address.toLowerCase() == route.toToken.address.toLowerCase() && route.toContract == undefined;
      return route
    })
  };

  let addRouteAmounts = (routes)=> {
    return routes.map((route)=>{
      if(route.directTransfer && !route.fee) {
        if(route.fromToken.address.toLowerCase() == web3Constants.CONSTANTS[route.blockchain].NATIVE.toLowerCase()) {
          route.fromAmount = route.transaction.value;
          route.toAmount = route.transaction.value;
        } else {
          route.fromAmount = route.transaction.params[1];
          route.toAmount = route.transaction.params[1];
        }
      } else {
        route.fromAmount = route.transaction.params.amounts[0];
        route.toAmount = route.transaction.params.amounts[1];
      }
      return route
    })
  };

  let filterDuplicateFromTokens = (routes) => {
    return routes.filter((routeA, indexA)=>{
      let otherMoreEfficientRoute = routes.find((routeB, indexB)=>{
        if(routeA.fromToken.address != routeB.fromToken.address) { return false }
        if(routeA.fromToken.blockchain != routeB.fromToken.blockchain) { return false }
        if(BigNumber.from(routeB.fromAmount).lt(BigNumber.from(routeA.fromAmount))) { return true }
        if(routeB.fromAmount == routeA.fromAmount && indexB < indexA) { return true }
      });

      return otherMoreEfficientRoute == undefined
    })
  };

  let scoreBlockchainCost = (blockchain) => {
    switch(blockchain) {
      case 'bsc':
        return 1
      case 'ethereum':
        return 2
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

      if (a.fromToken.address.toLowerCase() == web3Constants.CONSTANTS[a.blockchain].NATIVE.toLowerCase()) {
        return aWins
      }
      if (b.fromToken.address.toLowerCase() == web3Constants.CONSTANTS[b.blockchain].NATIVE.toLowerCase()) {
        return bWins
      }

      return equal
    })
  };

  let addTransactions = ({ routes, event, fee }) => {
    return routes.map((route)=>{
      route.transaction = getTransaction({ paymentRoute: route, event, fee });
      route.event = !route.directTransfer;
      route.fee = !!fee;
      return route
    })
  };

  exports.plugins = plugins;
  exports.route = route;
  exports.routers = routers;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
