import Exchanges from '@depay/web3-exchanges';
import Token from '@depay/web3-tokens';
import Blockchains from '@depay/web3-blockchains';
import { BN, struct, u64, i64, bool, u8, Connection, ACCOUNT_LAYOUT, PublicKey, ComputeBudgetProgram, SystemProgram, Buffer, TransactionInstruction, u128 } from '@depay/solana-web3.js';
import { ethers } from 'ethers';

const config = {
  endpoints: {
    routesBest: 'https://public.depay.com/routes/best'
  }
};

const API = [{"inputs":[{"internalType":"address","name":"_PERMIT2","type":"address"},{"internalType":"address","name":"_FORWARDER","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"ExchangeCallFailed","type":"error"},{"inputs":[],"name":"ExchangeCallMissing","type":"error"},{"inputs":[],"name":"ExchangeNotApproved","type":"error"},{"inputs":[],"name":"ForwardingPaymentFailed","type":"error"},{"inputs":[],"name":"InsufficientBalanceInAfterPayment","type":"error"},{"inputs":[],"name":"InsufficientBalanceOutAfterPayment","type":"error"},{"inputs":[],"name":"InsufficientProtocolAmount","type":"error"},{"inputs":[],"name":"NativeFeePaymentFailed","type":"error"},{"inputs":[],"name":"NativePaymentFailed","type":"error"},{"inputs":[],"name":"PaymentDeadlineReached","type":"error"},{"inputs":[],"name":"PaymentToZeroAddressNotAllowed","type":"error"},{"inputs":[],"name":"WrongAmountPaidIn","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"exchange","type":"address"}],"name":"Disabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"exchange","type":"address"}],"name":"Enabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"deadline","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amountIn","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"paymentAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"feeAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"feeAmount2","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"protocolAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"slippageInAmount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"slippageOutAmount","type":"uint256"},{"indexed":false,"internalType":"address","name":"tokenInAddress","type":"address"},{"indexed":false,"internalType":"address","name":"tokenOutAddress","type":"address"},{"indexed":false,"internalType":"address","name":"feeReceiverAddress","type":"address"},{"indexed":false,"internalType":"address","name":"feeReceiverAddress2","type":"address"}],"name":"Payment","type":"event"},{"inputs":[],"name":"FORWARDER","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERMIT2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"exchange","type":"address"},{"internalType":"bool","name":"enabled","type":"bool"}],"name":"enable","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"exchanges","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"paymentAmount","type":"uint256"},{"internalType":"uint256","name":"feeAmount","type":"uint256"},{"internalType":"uint256","name":"feeAmount2","type":"uint256"},{"internalType":"uint256","name":"protocolAmount","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"address","name":"tokenInAddress","type":"address"},{"internalType":"address","name":"exchangeAddress","type":"address"},{"internalType":"address","name":"tokenOutAddress","type":"address"},{"internalType":"address","name":"paymentReceiverAddress","type":"address"},{"internalType":"address","name":"feeReceiverAddress","type":"address"},{"internalType":"address","name":"feeReceiverAddress2","type":"address"},{"internalType":"uint8","name":"exchangeType","type":"uint8"},{"internalType":"uint8","name":"receiverType","type":"uint8"},{"internalType":"bool","name":"permit2","type":"bool"},{"internalType":"bytes","name":"exchangeCallData","type":"bytes"},{"internalType":"bytes","name":"receiverCallData","type":"bytes"}],"internalType":"struct IDePayRouterV3.Payment","name":"payment","type":"tuple"},{"components":[{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct IPermit2.TokenPermissions","name":"permitted","type":"tuple"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct IPermit2.PermitTransferFrom","name":"permitTransferFrom","type":"tuple"},{"internalType":"bytes","name":"signature","type":"bytes"}],"internalType":"struct IDePayRouterV3.PermitTransferFromAndSignature","name":"permitTransferFromAndSignature","type":"tuple"}],"name":"pay","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"paymentAmount","type":"uint256"},{"internalType":"uint256","name":"feeAmount","type":"uint256"},{"internalType":"uint256","name":"feeAmount2","type":"uint256"},{"internalType":"uint256","name":"protocolAmount","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"address","name":"tokenInAddress","type":"address"},{"internalType":"address","name":"exchangeAddress","type":"address"},{"internalType":"address","name":"tokenOutAddress","type":"address"},{"internalType":"address","name":"paymentReceiverAddress","type":"address"},{"internalType":"address","name":"feeReceiverAddress","type":"address"},{"internalType":"address","name":"feeReceiverAddress2","type":"address"},{"internalType":"uint8","name":"exchangeType","type":"uint8"},{"internalType":"uint8","name":"receiverType","type":"uint8"},{"internalType":"bool","name":"permit2","type":"bool"},{"internalType":"bytes","name":"exchangeCallData","type":"bytes"},{"internalType":"bytes","name":"receiverCallData","type":"bytes"}],"internalType":"struct IDePayRouterV3.Payment","name":"payment","type":"tuple"}],"name":"pay","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"paymentAmount","type":"uint256"},{"internalType":"uint256","name":"feeAmount","type":"uint256"},{"internalType":"uint256","name":"feeAmount2","type":"uint256"},{"internalType":"uint256","name":"protocolAmount","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"address","name":"tokenInAddress","type":"address"},{"internalType":"address","name":"exchangeAddress","type":"address"},{"internalType":"address","name":"tokenOutAddress","type":"address"},{"internalType":"address","name":"paymentReceiverAddress","type":"address"},{"internalType":"address","name":"feeReceiverAddress","type":"address"},{"internalType":"address","name":"feeReceiverAddress2","type":"address"},{"internalType":"uint8","name":"exchangeType","type":"uint8"},{"internalType":"uint8","name":"receiverType","type":"uint8"},{"internalType":"bool","name":"permit2","type":"bool"},{"internalType":"bytes","name":"exchangeCallData","type":"bytes"},{"internalType":"bytes","name":"receiverCallData","type":"bytes"}],"internalType":"struct IDePayRouterV3.Payment","name":"payment","type":"tuple"},{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"uint48","name":"expiration","type":"uint48"},{"internalType":"uint48","name":"nonce","type":"uint48"}],"internalType":"struct IPermit2.PermitDetails","name":"details","type":"tuple"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"sigDeadline","type":"uint256"}],"internalType":"struct IPermit2.PermitSingle","name":"permitSingle","type":"tuple"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"pay","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"pendingOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];

var routers$2 = {

  ethereum: {
    address: '0x365f7B56D2fB16C8Af89D7d33b420E4e013461e8',
    api: API
  },

  bsc: {
    address: '0x5F565EDfB9C446976a9F9910631cfeDb6A87220c',
    api: API
  },

  polygon: {
    address: '0xe04b08Dfc6CaA0F4Ec523a3Ae283Ece7efE00019',
    api: API
  },

  avalanche: {
    address: '0x39E7C98BF4ac3E4C394dD600397f5f7Ee3779BE8',
    api: API
  },

  gnosis: {
    address: '0x328FE8bbd30487BB7b5A8eEb909f892E9E229271',
    api: API
  },

  arbitrum: {
    address: '0x328FE8bbd30487BB7b5A8eEb909f892E9E229271',
    api: API
  },

  optimism: {
    address: '0x558302715e3011Be6695605c11A65526D2ba2245',
    api: API
  },

  base: {
    address: '0x48825133EF08327535D0b24d73779E82BE6Ea4d9',
    api: API
  },

  worldchain: {
    address: '0x886eb82a7e5E7310F66A0E83748662A17E391eb0',
    api: API
  },

};

var routers$1 = {
  solana: {
    address: 'DePayR1gQfDmViCPKctnZXNtUgqRwnEqMax8LX9ho1Zg',
    exchanges: {
      orca: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
      raydiumCP: 'CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C',
      raydiumCL: 'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK',
    },
    alt: '8bYq3tcwX1NM2K2JYMjrEqAPtCXFPCjzPazFothc618e',
    api: {
      createEscrowSolAccount: {
        anchorDiscriminator: new BN("2482112285991870004"),
        layout: struct([
          u64("anchorDiscriminator"),
        ])
      },
      createEscrowTokenAccount: {
        anchorDiscriminator: new BN("16156440424245087"),
        layout: struct([
          u64("anchorDiscriminator"),
        ])
      },
      routeSol: {
        anchorDiscriminator: new BN("6497164560834983274"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeToken: {
        anchorDiscriminator: new BN("13483873682232752277"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeOrcaSwap: {
        anchorDiscriminator: new BN("9797248061404332986"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountIn"),
          bool("aToB"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeOrcaSwapSolOut: {
        anchorDiscriminator: new BN("13662217913752830165"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountIn"),
          bool("aToB"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeOrcaSwapSolIn: {
        anchorDiscriminator: new BN("16115018480206947614"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountIn"),
          bool("aToB"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeOrcaTwoHopSwap: {
        anchorDiscriminator: new BN("15695720599845325801"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountInOne"),
          u64("amountInTwo"),
          bool("aToBOne"),
          bool("aToBTwo"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeOrcaTwoHopSwapSolOut: {
        anchorDiscriminator: new BN("15074061855608091530"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountInOne"),
          u64("amountInTwo"),
          bool("aToBOne"),
          bool("aToBTwo"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeOrcaTwoHopSwapSolIn: {
        anchorDiscriminator: new BN("2678451299937372540"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountInOne"),
          u64("amountInTwo"),
          bool("aToBOne"),
          bool("aToBTwo"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeRaydiumClSwap: {
        anchorDiscriminator: new BN("2954182973248174268"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountIn"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeRaydiumClSwapSolOut: {
        anchorDiscriminator: new BN("18389700643710627390"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountIn"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeRaydiumClSwapSolIn: {
        anchorDiscriminator: new BN("564150378912976829"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountIn"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeRaydiumClTwoHopSwap: {
        anchorDiscriminator: new BN("3828760301615328551"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountInOne"),
          u64("amountInTwo"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
          u8("remainingAccountsSplit"),
        ])
      },
      routeRaydiumClTwoHopSwapSolOut: {
        anchorDiscriminator: new BN("11373220799455718953"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountInOne"),
          u64("amountInTwo"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
          u8("remainingAccountsSplit"),
        ])
      },
      routeRaydiumClTwoHopSwapSolIn: {
        anchorDiscriminator: new BN("1635173573630140652"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountInOne"),
          u64("amountInTwo"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
          u8("remainingAccountsSplit"),
        ])
      },
      routeRaydiumCpSwap: {
        anchorDiscriminator: new BN("7437765211943645137"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountIn"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeRaydiumCpSwapSolOut: {
        anchorDiscriminator: new BN("9045257739866411286"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountIn"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeRaydiumCpSwapSolIn: {
        anchorDiscriminator: new BN("432305509198797158"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountIn"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeRaydiumCpTwoHopSwap: {
        anchorDiscriminator: new BN("3384279312781294015"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountInOne"),
          u64("amountInTwo"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeRaydiumCpTwoHopSwapSolOut: {
        anchorDiscriminator: new BN("18428464202744806632"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountInOne"),
          u64("amountInTwo"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeRaydiumCpTwoHopSwapSolIn: {
        anchorDiscriminator: new BN("16266677464406446072"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountInOne"),
          u64("amountInTwo"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      }
    }
  },
};

var routers = {... routers$2, ...routers$1};

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

function _optionalChain$5(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
const BATCH_INTERVAL$1 = 10;
const CHUNK_SIZE$1 = 50;
const MAX_RETRY$1 = 5;

class StaticJsonRpcBatchProvider extends ethers.providers.JsonRpcProvider {

  constructor(url, network, endpoints, failover) {
    super(url);
    this._network = network;
    this._endpoint = url;
    this._endpoints = endpoints;
    this._failover = failover;
    this._pendingBatch = [];
  }

  handleError(error, attempt, chunk) {
    if(attempt < MAX_RETRY$1 && error) {
      const index = this._endpoints.indexOf(this._endpoint)+1;
      this._failover();
      this._endpoint = index >= this._endpoints.length ? this._endpoints[0] : this._endpoints[index];
      this.requestChunk(chunk, this._endpoint, attempt+1);
    } else {
      chunk.forEach((inflightRequest) => {
        inflightRequest.reject(error);
      });
    }
  }

  detectNetwork() {
    return Promise.resolve(Blockchains.findByName(this._network).id)
  }

  batchRequest(batch, attempt) {
    return new Promise((resolve, reject) => {
      
      if (batch.length === 0) resolve([]); // Do nothing if requests is empty

      fetch(
        this._endpoint,
        {
          method: 'POST',
          body: JSON.stringify(batch),
          headers: { 'Content-Type': 'application/json' },
          signal: _optionalChain$5([AbortSignal, 'optionalAccess', _ => _.timeout]) ? AbortSignal.timeout(10000) : undefined  // 10-second timeout
        }
      ).then((response)=>{
        if(response.ok) {
          response.json().then((parsedJson)=>{
            if(parsedJson.find((entry)=>{
              return _optionalChain$5([entry, 'optionalAccess', _2 => _2.error]) && [-32062,-32016].includes(_optionalChain$5([entry, 'optionalAccess', _3 => _3.error, 'optionalAccess', _4 => _4.code]))
            })) {
              if(attempt < MAX_RETRY$1) {
                reject('Error in batch found!');
              } else {
                resolve(parsedJson);
              }
            } else {
              resolve(parsedJson);
            }
          }).catch(reject);
        } else {
          reject(`${response.status} ${response.text}`);
        }
      }).catch(reject);
    })
  }

  requestChunk(chunk, endpoint, attempt) {

    const batch = chunk.map((inflight) => inflight.request);

    try {
      return this.batchRequest(batch, attempt)
        .then((result) => {
          // For each result, feed it to the correct Promise, depending
          // on whether it was a success or error
          chunk.forEach((inflightRequest, index) => {
            const payload = result[index];
            if (_optionalChain$5([payload, 'optionalAccess', _5 => _5.error])) {
              const error = new Error(payload.error.message);
              error.code = payload.error.code;
              error.data = payload.error.data;
              inflightRequest.reject(error);
            } else if(_optionalChain$5([payload, 'optionalAccess', _6 => _6.result])) {
              inflightRequest.resolve(payload.result);
            } else {
              inflightRequest.reject();
            }
          });
        }).catch((error) => this.handleError(error, attempt, chunk))
    } catch (error){ this.handleError(error, attempt, chunk); }
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
          return this.requestChunk(chunk, this._endpoint, 1)
        });
      }, getConfiguration().batchInterval || BATCH_INTERVAL$1);
    }

    return promise
  }

}

function _optionalChain$4(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
const getAllProviders$1 = ()=> {
  if(getWindow()._Web3ClientProviders == undefined) {
    getWindow()._Web3ClientProviders = {};
  }
  return getWindow()._Web3ClientProviders
};

const setProvider$2 = (blockchain, provider)=> {
  if(provider == undefined) { return }
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
        let response;
        try {
          response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            referrer: "",
            referrerPolicy: "no-referrer",
            body: JSON.stringify({ method: 'net_version', id: 1, jsonrpc: '2.0' }),
            signal: _optionalChain$4([AbortSignal, 'optionalAccess', _ => _.timeout]) ? AbortSignal.timeout(10000) : undefined  // 10-second timeout
          });
        } catch (e) {}
        if(!_optionalChain$4([response, 'optionalAccess', _2 => _2.ok])) { return resolve(999) }
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
    await setProviderEndpoints$2(blockchain, Blockchains[blockchain].endpoints);
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
    await setProviderEndpoints$2(blockchain, Blockchains[blockchain].endpoints);
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

function _optionalChain$3(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
const BATCH_INTERVAL = 10;
const CHUNK_SIZE = 50;
const MAX_RETRY = 10;

class StaticJsonRpcSequentialProvider extends Connection {

  constructor(url, network, endpoints, failover) {
    super(url);
    this._provider = new Connection(url);
    this._network = network;
    this._endpoint = url;
    this._endpoints = endpoints;
    this._failover = failover;
    this._pendingBatch = [];
    this._rpcRequest = this._rpcRequestReplacement.bind(this);
  }

  handleError(error, attempt, chunk) {
    if(attempt < MAX_RETRY) {
      const index = this._endpoints.indexOf(this._endpoint)+1;
      this._endpoint = index >= this._endpoints.length ? this._endpoints[0] : this._endpoints[index];
      this._provider = new Connection(this._endpoint);
      this.requestChunk(chunk, attempt+1);
    } else {
      chunk.forEach((inflightRequest) => {
        inflightRequest.reject(error);
      });
    }
  }

  batchRequest(requests, attempt) {
    return new Promise((resolve, reject) => {
      if (requests.length === 0) resolve([]); // Do nothing if requests is empty

      const batch = requests.map(params => {
        return this._rpcClient.request(params.methodName, params.args)
      });

      fetch(
        this._endpoint,
        {
          method: 'POST',
          body: JSON.stringify(batch),
          headers: { 'Content-Type': 'application/json' },
          signal: _optionalChain$3([AbortSignal, 'optionalAccess', _ => _.timeout]) ? AbortSignal.timeout(60000) : undefined  // 60-second timeout
        }
      ).then((response)=>{
        if(response.ok) {
          response.json().then((parsedJson)=>{
            if(parsedJson.find((entry)=>_optionalChain$3([entry, 'optionalAccess', _2 => _2.error]))) {
              if(attempt < MAX_RETRY) {
                reject('Error in batch found!');
              } else {
                resolve(parsedJson);
              }
            } else {
              resolve(parsedJson);
            }
          }).catch(reject);
        } else {
          reject(`${response.status} ${response.text}`);
        }
      }).catch(reject);
    })
  }

  requestChunk(chunk, attempt) {

    const batch = chunk.map((inflight) => inflight.request);

    try {
      return this.batchRequest(batch, attempt)
        .then((result) => {
          chunk.forEach((inflightRequest, index) => {
            const payload = result[index];
            if (_optionalChain$3([payload, 'optionalAccess', _3 => _3.error])) {
              const error = new Error(payload.error.message);
              error.code = payload.error.code;
              error.data = payload.error.data;
              inflightRequest.reject(error);
            } else if(payload) {
              inflightRequest.resolve(payload);
            } else {
              inflightRequest.reject();
            }
          });
        }).catch((error)=>this.handleError(error, attempt, chunk))
    } catch (error){ return this.handleError(error, attempt, chunk) }
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
          return this.requestChunk(chunk, 1)
        });
      }, getConfiguration().batchInterval || BATCH_INTERVAL);
    }

    return promise
  }
}

function _optionalChain$2$1(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
const getAllProviders = ()=> {
  if(getWindow()._Web3ClientProviders == undefined) {
    getWindow()._Web3ClientProviders = {};
  }
  return getWindow()._Web3ClientProviders
};

const setProvider$1 = (blockchain, provider)=> {
  if(provider == undefined) { return }
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
        let response;
        try {
          response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            referrer: "",
            referrerPolicy: "no-referrer",
            body: JSON.stringify({ method: 'getIdentity', id: 1, jsonrpc: '2.0' }),
            signal: _optionalChain$2$1([AbortSignal, 'optionalAccess', _ => _.timeout]) ? AbortSignal.timeout(60000) : undefined  // 60-second timeout
          });
        } catch (e) {}
        if(!_optionalChain$2$1([response, 'optionalAccess', _2 => _2.ok])) { return resolve(999) }
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
    await setProviderEndpoints$1(blockchain, Blockchains[blockchain].endpoints);
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
    await setProviderEndpoints$1(blockchain, Blockchains[blockchain].endpoints);
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

let supported$1 = ['ethereum', 'bsc', 'polygon', 'solana', 'fantom', 'arbitrum', 'avalanche', 'gnosis', 'optimism', 'base', 'worldchain'];
supported$1.evm = ['ethereum', 'bsc', 'polygon', 'fantom', 'arbitrum', 'avalanche', 'gnosis', 'optimism', 'base', 'worldchain'];
supported$1.svm = ['solana'];

function _optionalChain$1$1(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
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
  if (_optionalChain$1$1([cachedEntry, 'optionalAccess', _ => _.expiresAt]) > Date.now()) {
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


  } else if(supported$1.svm.includes(blockchain)) {


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
  const contract = new ethers.Contract(address, api, provider);
  const args = paramsToContractArgs({ contract, method, params });
  const fragment = contract.interface.fragments.find((fragment)=>fragment.name === method);
  if(contract[method] === undefined) {
    method = `${method}(${fragment.inputs.map((input)=>input.type).join(',')})`;
  }
  if(fragment && fragment.stateMutability === 'nonpayable') {
    return contract.callStatic[method](...args, { blockTag: block })
  } else {
    return contract[method](...args, { blockTag: block })
  }
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

    const providers = await EVM.getProviders(blockchain);
    
    let allRequestsFailed = [];

    const allRequestsInParallel = providers.map((provider)=>{
      return new Promise((resolve)=>{
        allRequestsFailed.push(
          singleRequest$1({ blockchain, address, api, method, params, block, provider }).then(resolve)
        );
      })
    });
    
    const timeoutPromise = new Promise((_, reject)=>setTimeout(()=>{ reject(new Error("Web3ClientTimeout")); }, timeout || 10000));

    allRequestsFailed = Promise.all(allRequestsFailed.map((request)=>{
      return new Promise((resolve)=>{ request.catch(resolve); })
    })).then(()=>{ return });

    return Promise.race([...allRequestsInParallel, timeoutPromise, allRequestsFailed])

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
  const info = await provider.getAccountInfo(new PublicKey(address));
  if(!info || !info.data) { return }
  return api.decode(info.data)
};

const balance = ({ address, provider }) => {
  return provider.getBalance(new PublicKey(address))
};

const singleRequest = async({ blockchain, address, api, method, params, block, provider, providers })=> {

  try {

    if(method == undefined || method === 'getAccountInfo') {
      if(api == undefined) {
        api = ACCOUNT_LAYOUT; 
      }
      return await accountInfo({ address, api, method, params, provider, block })
    } else if(method === 'getProgramAccounts') {
      return await provider.getProgramAccounts(new PublicKey(address), params).then((accounts)=>{
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
      return await provider.getTokenAccountBalance(new PublicKey(address))
    } else if (method === 'latestBlockNumber') {
      return await provider.getSlot(params ? params : undefined)
    } else if (method === 'balance') {
      return await balance({ address, provider })
    }

  } catch (error){
    if(providers && error && [
      'Failed to fetch', 'limit reached', '504', '503', '502', '500', '429', '426', '422', '413', '409', '408', '406', '405', '404', '403', '402', '401', '400'
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

    let allRequestsFailed = [];

    const allRequestsInParallel = providers.map((provider)=>{
      return new Promise((resolve)=>{
        allRequestsFailed.push(
          singleRequest({ blockchain, address, api, method, params, block, provider }).then(resolve)
        );
      })
    });
    
    const timeoutPromise = new Promise((_, reject)=>setTimeout(()=>{ reject(new Error("Web3ClientTimeout")); }, timeout || 60000)); // 60s default timeout

    allRequestsFailed = Promise.all(allRequestsFailed.map((request)=>{
      return new Promise((resolve)=>{ request.catch(resolve); })
    })).then(()=>{ return });

    return Promise.race([...allRequestsInParallel, timeoutPromise, allRequestsFailed])

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
  const { api, params, cache: cache$1, block, timeout, strategy, cacheKey } = (typeof(url) == 'object' ? url : options) || {};

  return await cache({
    expires: cache$1 || 0,
    key: cacheKey || [blockchain, address, method, params, block],
    call: async()=>{
      if(supported$1.evm.includes(blockchain)) {


        return await requestEVM({ blockchain, address, api, method, params, block, strategy, timeout })


      } else if(supported$1.svm.includes(blockchain)) {


        return await requestSolana({ blockchain, address, api, method, params, block, strategy, timeout })


      } else {
        throw 'Unknown blockchain: ' + blockchain
      }  
    }
  })
};

function _optionalChain$2(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

const EXCHANGE_PROXIES = {
  'arbitrum': {
    [Blockchains.arbitrum.wrapped.address]: '0x7E655088214d0657251A51aDccE9109CFd23B5B5'
  },
  'avalanche': {
    [Blockchains.avalanche.wrapped.address]: '0x2d0a6275eaDa0d03226919ce6D93661E589B2d59'
  },
  'base': {
    [Blockchains.base.wrapped.address]: '0xD1711710843B125a6a01FfDF9b95fDc3064BeF7A'
  },
  'bsc': {
    [Blockchains.bsc.wrapped.address]: '0xeEb80d14abfB058AA78DE38813fe705c3e3b243E'
  },
  'ethereum': {
    [Blockchains.ethereum.wrapped.address]: '0x298f4980525594b3b982779cf74ba76819708D43'
  },
  'fantom': {
    [Blockchains.fantom.wrapped.address]: '0x2d0a6275eaDa0d03226919ce6D93661E589B2d59'
  },
  'gnosis': {
    [Blockchains.gnosis.wrapped.address]: '0x2d0a6275eaDa0d03226919ce6D93661E589B2d59'
  },
  'optimism': {
    [Blockchains.optimism.wrapped.address]: '0x69594057e2C0224deb1180c7a5Df9ec9d5B611B5'
  },
  'polygon': {
    [Blockchains.polygon.wrapped.address]: '0xaE59C9d3E055BdFAa583E169aA5Ebe395689476a'
  },
  'worldchain': {
    [Blockchains.worldchain.wrapped.address]: '0x2CA727BC33915823e3D05fe043d310B8c5b2dC5b'
  },
  'solana': {}
};

const getTransaction$3 = async({ paymentRoute, options })=> {

  let deadline = _optionalChain$2([options, 'optionalAccess', _ => _.deadline]) || Math.ceil(new Date())+(1800*1000); // 30 minutes in ms (default)

  const transaction = {
    blockchain: paymentRoute.blockchain,
    to: transactionAddress({ paymentRoute, options }),
    api: transactionApi({ paymentRoute, options }),
    method: transactionMethod({ paymentRoute, options }),
    params: await transactionParams({ paymentRoute, options, deadline }),
    value: transactionValue({ paymentRoute })
  };

  transaction.deadline = deadline;

  return transaction
};

const transactionAddress = ({ paymentRoute, options })=> {
  if(paymentRoute.directTransfer && !paymentRoute.fee && !paymentRoute.fee2 && _optionalChain$2([options, 'optionalAccess', _2 => _2.wallet, 'optionalAccess', _3 => _3.name]) !== 'World App') {
    if(paymentRoute.toToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
      return paymentRoute.toAddress
    } else {
      return paymentRoute.toToken.address
    }
  } else {
    return routers$2[paymentRoute.blockchain].address
  }
};

const transactionApi = ({ paymentRoute, options })=> {
  if(paymentRoute.directTransfer && !paymentRoute.fee && !paymentRoute.fee2 && _optionalChain$2([options, 'optionalAccess', _4 => _4.wallet, 'optionalAccess', _5 => _5.name]) !== 'World App') {
    if(paymentRoute.toToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
      return undefined
    } else {
      return Token[paymentRoute.blockchain].DEFAULT
    }
  } else {
    return routers$2[paymentRoute.blockchain].api
  }
};

const transactionMethod = ({ paymentRoute, options })=> {
  if(paymentRoute.directTransfer && !paymentRoute.fee && !paymentRoute.fee2 && _optionalChain$2([options, 'optionalAccess', _6 => _6.wallet, 'optionalAccess', _7 => _7.name]) !== 'World App') {
    if(paymentRoute.toToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
      return undefined
    } else { // standard token transfer
      return 'transfer'
    }
  } else {
    return 'pay'
  }
};

const getExchangeType = ({ exchangeRoute, blockchain })=> {
  if( typeof exchangeRoute === 'undefined' ) { return 0 }
  if(exchangeRoute.exchange[blockchain].router.address === Blockchains[blockchain].wrapped.address) {
    return 2 // push
  } else {
    return 1 // pull
  }
};

const getExchangeCallData = ({ exchangeTransaction })=>{
  const contract = new ethers.Contract(exchangeTransaction.to, exchangeTransaction.api);
  const method = exchangeTransaction.method;
  const params = exchangeTransaction.params;
  
  let contractMethod;
  let fragment;
  fragment = contract.interface.fragments.find((fragment) => {
    return(
      fragment.name == method &&
      (fragment.inputs && params && typeof(params) === 'object' ? fragment.inputs.length == Object.keys(params).length : true)
    )
  });
  let paramsToEncode;
  if(fragment.inputs.length === 1 && fragment.inputs[0].type === 'tuple') {
    contractMethod = method;
    paramsToEncode = [params[fragment.inputs[0].name]];
  } else {
    contractMethod = `${method}(${fragment.inputs.map((input)=>input.type).join(',')})`;
    paramsToEncode = fragment.inputs.map((input) => {
      if(input.type === 'tuple') {
        let tuple = {};
        input.components.forEach((component, index)=>{
          tuple[component.name] = params[input.name][index];
        });
        contractMethod = method;
        return tuple
      } else {
        return params[input.name]
      }
    });
  }
  return contract.interface.encodeFunctionData(contractMethod, paramsToEncode)
};

const getPermit2SignatureTransferNonce = async({ address, blockchain })=>{
        
  const getBitmap = (address, word)=>request({
    blockchain: blockchain,
    address: Blockchains[blockchain].permit2,
    api: [{"inputs":[{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"AllowanceExpired","type":"error"},{"inputs":[],"name":"ExcessiveInvalidation","type":"error"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"uint256","name":"maxAmount","type":"uint256"}],"name":"InvalidAmount","type":"error"},{"inputs":[],"name":"InvalidContractSignature","type":"error"},{"inputs":[],"name":"InvalidNonce","type":"error"},{"inputs":[],"name":"InvalidSignature","type":"error"},{"inputs":[],"name":"InvalidSignatureLength","type":"error"},{"inputs":[],"name":"InvalidSigner","type":"error"},{"inputs":[],"name":"LengthMismatch","type":"error"},{"inputs":[{"internalType":"uint256","name":"signatureDeadline","type":"uint256"}],"name":"SignatureExpired","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint160","name":"amount","type":"uint160"},{"indexed":false,"internalType":"uint48","name":"expiration","type":"uint48"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"address","name":"spender","type":"address"}],"name":"Lockdown","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint48","name":"newNonce","type":"uint48"},{"indexed":false,"internalType":"uint48","name":"oldNonce","type":"uint48"}],"name":"NonceInvalidation","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint160","name":"amount","type":"uint160"},{"indexed":false,"internalType":"uint48","name":"expiration","type":"uint48"},{"indexed":false,"internalType":"uint48","name":"nonce","type":"uint48"}],"name":"Permit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"word","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"mask","type":"uint256"}],"name":"UnorderedNonceInvalidation","type":"event"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"uint48","name":"expiration","type":"uint48"},{"internalType":"uint48","name":"nonce","type":"uint48"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"uint48","name":"expiration","type":"uint48"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint48","name":"newNonce","type":"uint48"}],"name":"invalidateNonces","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"wordPos","type":"uint256"},{"internalType":"uint256","name":"mask","type":"uint256"}],"name":"invalidateUnorderedNonces","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"internalType":"struct IAllowanceTransfer.TokenSpenderPair[]","name":"approvals","type":"tuple[]"}],"name":"lockdown","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"nonceBitmap","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"uint48","name":"expiration","type":"uint48"},{"internalType":"uint48","name":"nonce","type":"uint48"}],"internalType":"struct IAllowanceTransfer.PermitDetails[]","name":"details","type":"tuple[]"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"sigDeadline","type":"uint256"}],"internalType":"struct IAllowanceTransfer.PermitBatch","name":"permitBatch","type":"tuple"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"uint48","name":"expiration","type":"uint48"},{"internalType":"uint48","name":"nonce","type":"uint48"}],"internalType":"struct IAllowanceTransfer.PermitDetails","name":"details","type":"tuple"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"sigDeadline","type":"uint256"}],"internalType":"struct IAllowanceTransfer.PermitSingle","name":"permitSingle","type":"tuple"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct ISignatureTransfer.TokenPermissions","name":"permitted","type":"tuple"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct ISignatureTransfer.PermitTransferFrom","name":"permit","type":"tuple"},{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"requestedAmount","type":"uint256"}],"internalType":"struct ISignatureTransfer.SignatureTransferDetails","name":"transferDetails","type":"tuple"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permitTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct ISignatureTransfer.TokenPermissions[]","name":"permitted","type":"tuple[]"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct ISignatureTransfer.PermitBatchTransferFrom","name":"permit","type":"tuple"},{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"requestedAmount","type":"uint256"}],"internalType":"struct ISignatureTransfer.SignatureTransferDetails[]","name":"transferDetails","type":"tuple[]"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permitTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct ISignatureTransfer.TokenPermissions","name":"permitted","type":"tuple"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct ISignatureTransfer.PermitTransferFrom","name":"permit","type":"tuple"},{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"requestedAmount","type":"uint256"}],"internalType":"struct ISignatureTransfer.SignatureTransferDetails","name":"transferDetails","type":"tuple"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes32","name":"witness","type":"bytes32"},{"internalType":"string","name":"witnessTypeString","type":"string"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permitWitnessTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct ISignatureTransfer.TokenPermissions[]","name":"permitted","type":"tuple[]"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct ISignatureTransfer.PermitBatchTransferFrom","name":"permit","type":"tuple"},{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"requestedAmount","type":"uint256"}],"internalType":"struct ISignatureTransfer.SignatureTransferDetails[]","name":"transferDetails","type":"tuple[]"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes32","name":"witness","type":"bytes32"},{"internalType":"string","name":"witnessTypeString","type":"string"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permitWitnessTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"address","name":"token","type":"address"}],"internalType":"struct IAllowanceTransfer.AllowanceTransferDetails[]","name":"transferDetails","type":"tuple[]"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"address","name":"token","type":"address"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"}],
    method: 'nonceBitmap',
    params: [address, word]
  });

  const getFirstUnsetBit = (bitmap)=>{
    for (let i = 0; i < 256; i++) {
      if (bitmap.shr(i).and(1).eq(0)) {
        return i
      }
    }
    return -1
  };

  function buildNonce(word, bitPos) {
    return ethers.BigNumber.from(word).mul(256).add(bitPos)
  }

  let word = 0;

  while(word < 1) {
    const bitmap = await getBitmap(address, word);
    if(bitmap.toString() != Blockchains[blockchain].maxInt) {
      const bitPos = getFirstUnsetBit(bitmap);
      if (bitPos >= 0) {
        // Build and return the nonce
        const nonce = buildNonce(word, bitPos);
        return nonce
      }
    }
    word = word+1;
  }
};

const transactionParams = async ({ paymentRoute, options, deadline })=> {
  if(paymentRoute.directTransfer && !paymentRoute.fee && !paymentRoute.fee2 && _optionalChain$2([options, 'optionalAccess', _8 => _8.wallet, 'optionalAccess', _9 => _9.name]) !== 'World App') {
    if(paymentRoute.toToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
      return undefined
    } else { // standard token transfer
      return [paymentRoute.toAddress, paymentRoute.toAmount]
    }
  } else {
    const exchangeRoute = paymentRoute.exchangeRoutes[0];
    const exchangeType = getExchangeType({ exchangeRoute, blockchain: paymentRoute.blockchain });
    const exchangeTransaction = !exchangeRoute ? undefined : await exchangeRoute.getTransaction({
      account: routers$2[paymentRoute.blockchain].address,
      inputTokenPushed: exchangeType === 2
    });
    const exchangeCallData = !exchangeTransaction ? Blockchains[paymentRoute.blockchain].zero : getExchangeCallData({ exchangeTransaction });
    let exchangeAddress = Blockchains[paymentRoute.blockchain].zero;
    if (exchangeRoute) {
      if(
        paymentRoute.blockchain === 'bsc' &&
        exchangeRoute.exchange.name === 'pancakeswap_v3' &&
        paymentRoute.toToken.address === Blockchains[paymentRoute.blockchain].currency.address
      ) {
        // bsc pancakeswap_v3 requries smart router exchange address for converting and paying out BNB/NATIVE
        exchangeAddress = exchangeRoute.exchange[paymentRoute.blockchain].smartRouter.address;
      } else { // proxy exchange or exchange directly
        exchangeAddress = EXCHANGE_PROXIES[exchangeTransaction.blockchain][exchangeRoute.exchange[paymentRoute.blockchain].router.address] || exchangeRoute.exchange[paymentRoute.blockchain].router.address;
      }
    }
    let params;
    if(options && _optionalChain$2([options, 'optionalAccess', _10 => _10.wallet, 'optionalAccess', _11 => _11.name]) === 'World App' && paymentRoute.blockchain === 'worldchain'){
      
      const permitDeadline = Math.floor(Date.now() / 1000) + 30 * 60; // 60 minutes in seconds (default)
      const nonce = await getPermit2SignatureTransferNonce({ blockchain: paymentRoute.blockchain, address: paymentRoute.fromAddress });
      
      const permitTransfer = {
        permitted: {
          token: paymentRoute.fromToken.address,
          amount: paymentRoute.fromAmount.toString(),
        },
        nonce: nonce.toString(),
        deadline: permitDeadline.toString(),
      };

      params = {
        args: [
          [ // payment
            paymentRoute.fromAmount.toString(), // amountIn
            paymentRoute.toAmount.toString(), // paymentAmount
            (paymentRoute.feeAmount || 0).toString(), // feeAmount
            (paymentRoute.feeAmount2 || 0).toString(), // feeAmount
            (paymentRoute.protocolFeeAmount || 0).toString(), // protocolAmount
            deadline.toString(), // deadline
            paymentRoute.fromToken.address, // tokenInAddress
            exchangeAddress, // exchangeAddress
            paymentRoute.toToken.address, // tokenOutAddress
            paymentRoute.toAddress, // paymentReceiverAddress
            paymentRoute.fee ? paymentRoute.fee.receiver : Blockchains[paymentRoute.blockchain].zero, // feeReceiverAddress
            paymentRoute.fee2 ? paymentRoute.fee2.receiver : Blockchains[paymentRoute.blockchain].zero, // feeReceiverAddress2
            exchangeType, // exchangeType
            0, // receiverType
            true, // permit2
            exchangeCallData, // exchangeCallData
            '0x', // receiverCallData
          ],
          [ // permitTransferFromAndSignature
            [ // permitTransferFrom
              [ // permitted
                paymentRoute.fromToken.address, // token
                paymentRoute.fromAmount.toString() // amount
              ],
              nonce.toString(), // nonce
              permitDeadline.toString() // deadline
            ],
            "PERMIT2_SIGNATURE_PLACEHOLDER_0"
          ]
        ],
        permit2: {
          ...permitTransfer,
          spender: routers$2[paymentRoute.blockchain].address,
        },
      };

    } else {

      params = {
        payment: {
          amountIn: paymentRoute.fromAmount,
          paymentAmount: paymentRoute.toAmount,
          feeAmount: (paymentRoute.feeAmount || 0).toString(),
          feeAmount2: (paymentRoute.feeAmount2 || 0).toString(),
          protocolAmount: (paymentRoute.protocolFeeAmount || 0).toString(),
          tokenInAddress: paymentRoute.fromToken.address,
          exchangeAddress,
          tokenOutAddress: paymentRoute.toToken.address,
          paymentReceiverAddress: paymentRoute.toAddress,
          feeReceiverAddress: paymentRoute.fee ? paymentRoute.fee.receiver : Blockchains[paymentRoute.blockchain].zero,
          feeReceiverAddress2: paymentRoute.fee2 ? paymentRoute.fee2.receiver : Blockchains[paymentRoute.blockchain].zero,
          exchangeType: exchangeType,
          receiverType: 0,
          exchangeCallData: exchangeCallData,
          receiverCallData: Blockchains[paymentRoute.blockchain].zero,
          deadline,
        }
      };

      if(_optionalChain$2([options, 'optionalAccess', _12 => _12.signature])) {

        params = [
          {...params.payment, permit2: true},
          { // permitTransferFromAndSignature
            permitTransferFrom: {
               permitted: {
                token: paymentRoute.fromToken.address,
                amount: paymentRoute.fromAmount.toString(),
              },
              nonce: options.signatureNonce,
              deadline: options.signatureDeadline
            },
            signature: options.signature
          }
        ];

      }
    }

    return params
  }
};

const transactionValue = ({ paymentRoute })=> {
  if(paymentRoute.fromToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
    if(!paymentRoute.directTransfer) {
      return paymentRoute.fromAmount.toString()
    } else { // direct payment
      return paymentRoute.toAmount.toString()
    }
  } else {
    return ethers.BigNumber.from('0').toString()
  }
};

function _optionalChain$1(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

const getRouterApprovalTransaction$1 = async({ paymentRoute, options })=> {
  return({
    blockchain: paymentRoute.blockchain,
    to: paymentRoute.fromToken.address,
    api: Token[paymentRoute.blockchain].DEFAULT,
    method: 'approve',
    params: [routers$2[paymentRoute.blockchain].address, (_optionalChain$1([options, 'optionalAccess', _ => _.amount]) || Blockchains[paymentRoute.blockchain].maxInt)]
  })
};

const getPermit2ApprovalTransaction$1 = async({ paymentRoute, options })=> {
  return({
    blockchain: paymentRoute.blockchain,
    to: paymentRoute.fromToken.address,
    api: Token[paymentRoute.blockchain].DEFAULT,
    method: 'approve',
    params: [Blockchains[paymentRoute.blockchain].permit2, (_optionalChain$1([options, 'optionalAccess', _2 => _2.amount]) || Blockchains[paymentRoute.blockchain].maxInt)]
  })
};

const getPermit2ApprovalSignature$1 = async({ paymentRoute, options })=> {

  const domain = {
    name: "Permit2",
    chainId: Blockchains[paymentRoute.blockchain].networkId,
    verifyingContract: Blockchains[paymentRoute.blockchain].permit2
  };

  const types = {
    TokenPermissions: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    EIP712Domain: [
      { name: "name", type: "string" }, 
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" }
    ],
    PermitTransferFrom: [
      { name: "permitted", type: "TokenPermissions" },
      { name: "spender", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" }
    ],
  };

  let deadline = _optionalChain$1([options, 'optionalAccess', _3 => _3.deadline]) || Math.ceil(new Date()/1000)+(3600); // 60 minutes in seconds (default)
  
  const nonce = await getPermit2SignatureTransferNonce({ blockchain: paymentRoute.blockchain, address: paymentRoute.fromAddress });

  const data = {
    permitted: {
      token: paymentRoute.fromToken.address,
      amount: paymentRoute.fromAmount.toString(),
    },
    spender: routers$2[paymentRoute.blockchain].address,
    nonce: nonce.toString(),
    deadline: deadline.toString()
  };

  return {
    domain,
    types,
    message: data,
    primaryType: "PermitTransferFrom"
  }
};

let supported = ['ethereum', 'bsc', 'polygon', 'solana', 'arbitrum', 'avalanche', 'gnosis', 'optimism', 'base', 'worldchain'];
supported.evm = ['ethereum', 'bsc', 'polygon', 'arbitrum', 'avalanche', 'gnosis', 'optimism', 'base', 'worldchain'];
supported.svm = ['solana'];

const getRouterApprovalTransaction = ({ paymentRoute, options })=>{
  if(supported.evm.includes(paymentRoute.blockchain)) {
    return getRouterApprovalTransaction$1({ paymentRoute, options })
  } else if(supported.svm.includes(paymentRoute.blockchain)) ; else {
    throw('Blockchain not supported!')
  }
};

const getPermit2ApprovalTransaction = ({ paymentRoute, options })=>{
  if(supported.evm.includes(paymentRoute.blockchain)) {
    return getPermit2ApprovalTransaction$1({ paymentRoute, options })
  } else if(supported.svm.includes(paymentRoute.blockchain)) ; else {
    throw('Blockchain not supported!')
  }
};

const getPermit2ApprovalSignature = ({ paymentRoute, options })=>{
  if(supported.evm.includes(paymentRoute.blockchain)) {
    return getPermit2ApprovalSignature$1({ paymentRoute, options })
  } else if(supported.svm.includes(paymentRoute.blockchain)) ; else {
    throw('Blockchain not supported!')
  }
};

const createComputeInstruction = async ({ paymentRoute })=> {

  if(
    paymentRoute.exchangeRoutes.length > 0 &&
    getFixedPath(paymentRoute.exchangeRoutes[0].path).length > 2 &&
    paymentRoute.exchangeRoutes[0].exchange.name == 'raydium_cl'
  ) {
    return ComputeBudgetProgram.setComputeUnitLimit({ units: 300000 })
  }
};

const getMiddleToken = ({ paymentRoute })=>{
  let path = [...paymentRoute.exchangeRoutes[0].path];
  if(path.indexOf(Blockchains.solana.currency.address) > -1) { path.splice(path.indexOf(Blockchains.solana.currency.address), 1); }
  if(path.indexOf(paymentRoute.fromToken.address) > -1) { path.splice(path.indexOf(paymentRoute.fromToken.address), 1); }
  if(path.indexOf(paymentRoute.toToken.address) > -1) { path.splice(path.indexOf(paymentRoute.toToken.address), 1); }

  if(path.length === 2 && path[0] === Blockchains.solana.wrapped.address) {
    return path[1]
  } else { 
    return path[0]
  }
};

const getMiddleTokenAccountAddress = async ({ paymentRoute })=>{

  return await Token.solana.findProgramAddress({
    token: getMiddleToken({ paymentRoute }),
    owner: paymentRoute.fromAddress
  })
};

const getMiddleTokenAccount = async ({ paymentRoute })=> {

  return await request({
    blockchain: 'solana',
    address: await getMiddleTokenAccountAddress({ paymentRoute }),
    api: Token.solana.TOKEN_LAYOUT,
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

  return Token.solana.createAssociatedTokenAccountInstruction({
    token: getMiddleToken({ paymentRoute }),
    owner: paymentRoute.fromAddress,
    payer: paymentRoute.fromAddress,
  })
};

const getPaymentSenderTokenAccountAddress = async ({ paymentRoute })=> {

  return await Token.solana.findProgramAddress({
    token: paymentRoute.fromToken.address,
    owner: paymentRoute.fromAddress
  })
};

const getPaymentReceiverTokenAccountAddress = async ({ paymentRoute })=> {

  return await Token.solana.findProgramAddress({
    token: paymentRoute.toToken.address,
    owner: paymentRoute.toAddress
  })
};

const getPaymentReceiverTokenAccount = async ({ paymentRoute })=> {

  return await Token.solana.findAccount({
    token: paymentRoute.toToken.address,
    owner: paymentRoute.toAddress
  })  
};

const createPaymentReceiverAccount = async({ paymentRoute })=> {
  
  if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {

    const paymentReceiverBalance = await request({ blockchain: 'solana', method: 'balance', address: paymentRoute.toAddress });
    const provider = await getProvider('solana');
    const rent = new BN(await provider.getMinimumBalanceForRentExemption(0));
    const paymentAmount = new BN(paymentRoute.toAmount);

    if(new BN(paymentReceiverBalance).add(paymentAmount).gt(rent)) {
      return
    }
    
    return SystemProgram.transfer({
      fromPubkey: new PublicKey(paymentRoute.fromAddress),
      toPubkey: new PublicKey(paymentRoute.toAddress),
      lamports: rent.sub(paymentAmount)
    })
  
  } else {

    const token = paymentRoute.toToken.address;

    const paymentReceiverTokenAccount = await getPaymentReceiverTokenAccount({ paymentRoute });
    if(paymentReceiverTokenAccount) {
      return
    }

    return Token.solana.createAssociatedTokenAccountInstruction({
      token,
      owner: paymentRoute.toAddress,
      payer: paymentRoute.fromAddress,
    })
  }
};

const getFeeReceiverTokenAccountAddress = async ({ paymentRoute })=> {

  return await Token.solana.findProgramAddress({
    token: paymentRoute.toToken.address,
    owner: paymentRoute.fee.receiver
  })  
};

const getFee2ReceiverTokenAccountAddress = async ({ paymentRoute })=> {

  return await Token.solana.findProgramAddress({
    token: paymentRoute.toToken.address,
    owner: paymentRoute.fee2.receiver
  })  
};

const getFeeReceiverTokenAccount = async ({ paymentRoute })=> {

  return await Token.solana.findAccount({
    token: paymentRoute.toToken.address,
    owner: paymentRoute.fee.receiver
  })
};

const getFee2ReceiverTokenAccount = async ({ paymentRoute })=> {

  return await Token.solana.findAccount({
    token: paymentRoute.toToken.address,
    owner: paymentRoute.fee2.receiver
  })
};

const createFeeReceiverAccount = async({ paymentRoute })=> {
  
  if(!paymentRoute.fee) {
    return
  }
  
  if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {

    const feeReceiverBalance = await request({ blockchain: 'solana', method: 'balance', address: paymentRoute.fee.receiver });
    const provider = await getProvider('solana');
    const rent = new BN(await provider.getMinimumBalanceForRentExemption(0));
    const feeAmount = new BN(paymentRoute.feeAmount);

    if(new BN(feeReceiverBalance).add(feeAmount).gt(rent)) {
      return
    }
    
    return SystemProgram.transfer({
      fromPubkey: new PublicKey(paymentRoute.fromAddress),
      toPubkey: new PublicKey(paymentRoute.fee.receiver),
      lamports: rent.sub(feeAmount)
    })
  
  } else {

    const token = paymentRoute.toToken.address;

    const feeReceiverTokenAccount = await getFeeReceiverTokenAccount({ paymentRoute });
    
    if(feeReceiverTokenAccount) {
      return
    }

    return Token.solana.createAssociatedTokenAccountInstruction({
      token,
      owner: paymentRoute.fee.receiver,
      payer: paymentRoute.fromAddress,
    })
  }
};

const createFee2ReceiverAccount = async({ paymentRoute })=> {
  
  if(!paymentRoute.fee2) {
    return
  }
  
  if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {

    const feeReceiverBalance = await request({ blockchain: 'solana', method: 'balance', address: paymentRoute.fee2.receiver });
    const provider = await getProvider('solana');
    const rent = new BN(await provider.getMinimumBalanceForRentExemption(0));
    const feeAmount = new BN(paymentRoute.feeAmount2);

    if(new BN(feeReceiverBalance).add(feeAmount).gt(rent)) {
      return
    }
    
    return SystemProgram.transfer({
      fromPubkey: new PublicKey(paymentRoute.fromAddress),
      toPubkey: new PublicKey(paymentRoute.fee2.receiver),
      lamports: rent.sub(feeAmount)
    })
  
  } else {

    const token = paymentRoute.toToken.address;

    const feeReceiverTokenAccount = await getFee2ReceiverTokenAccount({ paymentRoute });
    
    if(feeReceiverTokenAccount) {
      return
    }

    return Token.solana.createAssociatedTokenAccountInstruction({
      token,
      owner: paymentRoute.fee2.receiver,
      payer: paymentRoute.fromAddress,
    })
  }
};

const getEscrowSolAccountPublicKey = async()=>{

  let seeds = [Buffer.from("escrow_sol")];
  
  let [ pdaPublicKey, bump ] = await PublicKey.findProgramAddress(
    seeds, new PublicKey(routers$1.solana.address)
  );

  return pdaPublicKey
};

const createEscrowOutSolAccount = async({ paymentRoute })=> {

  return; // this is only ever needed once and never again
};

const getEscrowInWSolAccountPublicKey = async()=>{

  let seeds = [
    Buffer.from("escrow"),
    new PublicKey(Blockchains.solana.wrapped.address).toBuffer()
  ];
  
  let [ pdaPublicKey, bump ] = await PublicKey.findProgramAddress(
    seeds, new PublicKey(routers$1.solana.address)
  );

  return pdaPublicKey
};

const createEscrowInWSOLTokenAccount = async({ paymentRoute })=> {

  return; // this is only ever needed once and never again
};

const getEscrowOutWSolAccountPublicKey = async()=>{

  let seeds = [Buffer.from("escrow_wsol")];
  
  let [ pdaPublicKey, bump ] = await PublicKey.findProgramAddress(
    seeds, new PublicKey(routers$1.solana.address)
  );

  return pdaPublicKey
};

const getEscrowOutAccountPublicKey = async({ paymentRoute })=>{

  let seeds = [
    Buffer.from("escrow"),
    new PublicKey(paymentRoute.toToken.address === Blockchains.solana.currency.address ? Blockchains.solana.wrapped.address : paymentRoute.toToken.address).toBuffer()
  ];
  
  let [ pdaPublicKey, bump ] = await PublicKey.findProgramAddress(
    seeds, new PublicKey(routers$1.solana.address)
  );

  return pdaPublicKey
};

const getEscrowOutAccountData = async({ paymentRoute })=>{
  return await request({
    blockchain: 'solana',
    address: (await getEscrowOutAccountPublicKey({ paymentRoute })).toString(),
    api: Token.solana.TOKEN_LAYOUT,
    cache: 1000
  })
};

const createEscrowOutTokenAccount = async({ paymentRoute })=> {

  if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {
    return
  }

  const escrowOutAccount = await getEscrowOutAccountData({ paymentRoute });

  if(escrowOutAccount) {
    return
  }

  const keys = [
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    { pubkey: new PublicKey(paymentRoute.toToken.address === Blockchains.solana.currency.address ? Blockchains.solana.wrapped.address : paymentRoute.toToken.address), isSigner: false, isWritable: true },
    { pubkey: await getEscrowOutAccountPublicKey({ paymentRoute }), isSigner: false, isWritable: true },
  ];

  const data = Buffer.alloc(routers$1.solana.api.createEscrowTokenAccount.layout.span);
  routers$1.solana.api.createEscrowTokenAccount.layout.encode({
    anchorDiscriminator: routers$1.solana.api.createEscrowTokenAccount.anchorDiscriminator
  }, data);
  
  return new TransactionInstruction({
    keys,
    programId: new PublicKey(routers$1.solana.address),
    data
  })
};

const getEscrowMiddleAccountPublicKey = async({ paymentRoute })=>{

  let seeds = [
    Buffer.from("escrow"),
    new PublicKey(getFixedPath(paymentRoute.exchangeRoutes[0].path)[1]).toBuffer()
  ];
  
  let [ pdaPublicKey, bump ] = await PublicKey.findProgramAddress(
    seeds, new PublicKey(routers$1.solana.address)
  );

  return pdaPublicKey
};

const getEscrowMiddleAccountData = async({ paymentRoute })=>{
  return await request({
    blockchain: 'solana',
    address: (await getEscrowMiddleAccountPublicKey({ paymentRoute })).toString(),
    api: Token.solana.TOKEN_LAYOUT,
    cache: 1000
  })
};

const createEscrowMiddleTokenAccount = async({ paymentRoute })=> {

  if(
    paymentRoute.exchangeRoutes == undefined ||
    paymentRoute.exchangeRoutes[0] == undefined ||
    getFixedPath(paymentRoute.exchangeRoutes[0].path).length <= 2
  ) {
    return
  }

  const escrowMiddleAccount = await getEscrowMiddleAccountData({ paymentRoute });

  if(escrowMiddleAccount) {
    return
  }

  const keys = [
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    { pubkey: new PublicKey(getFixedPath(paymentRoute.exchangeRoutes[0].path)[1]), isSigner: false, isWritable: true },
    { pubkey: await getEscrowMiddleAccountPublicKey({ paymentRoute }), isSigner: false, isWritable: true },
  ];

  const data = Buffer.alloc(routers$1.solana.api.createEscrowTokenAccount.layout.span);
  routers$1.solana.api.createEscrowTokenAccount.layout.encode({
    anchorDiscriminator: routers$1.solana.api.createEscrowTokenAccount.anchorDiscriminator
  }, data);
  
  return new TransactionInstruction({
    keys,
    programId: new PublicKey(routers$1.solana.address),
    data
  })
};

// returns the actual path on the dex without including native currency
const getFixedPath = (path)=> {
  return path.map((step)=>step===Blockchains.solana.currency.address ? Blockchains.solana.wrapped.address : step).filter(Boolean)
};

const getPaymentMethod = ({ paymentRoute })=>{

  if(
    paymentRoute.fromToken.address === Blockchains.solana.currency.address &&
    paymentRoute.toToken.address === Blockchains.solana.currency.address
  ){

    return 'routeSol'

  } else if (
    paymentRoute.fromToken.address !== Blockchains.solana.currency.address &&
    paymentRoute.toToken.address !== Blockchains.solana.currency.address &&
    paymentRoute.exchangeRoutes.length === 0
  ) {

    return 'routeToken'

  } else if (
    paymentRoute.exchangeRoutes.length > 0 &&
    getFixedPath(paymentRoute.exchangeRoutes[0].path).length === 2 &&
    paymentRoute.exchangeRoutes[0].exchange.name == 'orca'
  ) {

    if(paymentRoute.fromToken.address === Blockchains.solana.currency.address) {

      return 'routeOrcaSwapSolIn'

    } else if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {

      return 'routeOrcaSwapSolOut'

    } else {

      return 'routeOrcaSwap'

    }

  } else if (
    paymentRoute.exchangeRoutes.length > 0 &&
    getFixedPath(paymentRoute.exchangeRoutes[0].path).length > 2 &&
    paymentRoute.exchangeRoutes[0].exchange.name == 'orca'
  ) {

    if(paymentRoute.fromToken.address === Blockchains.solana.currency.address) {

      return 'routeOrcaTwoHopSwapSolIn'

    } else if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {

      return 'routeOrcaTwoHopSwapSolOut'

    } else {

      return 'routeOrcaTwoHopSwap'

    }

  } else if (
    paymentRoute.exchangeRoutes.length > 0 &&
    getFixedPath(paymentRoute.exchangeRoutes[0].path).length === 2 &&
    paymentRoute.exchangeRoutes[0].exchange.name == 'raydium_cp'
  ) {

    if(paymentRoute.fromToken.address === Blockchains.solana.currency.address) {

      return 'routeRaydiumCpSwapSolIn'

    } else if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {

      return 'routeRaydiumCpSwapSolOut'

    } else {

      return 'routeRaydiumCpSwap'

    }

  } else if (
    paymentRoute.exchangeRoutes.length > 0 &&
    getFixedPath(paymentRoute.exchangeRoutes[0].path).length > 2 &&
    paymentRoute.exchangeRoutes[0].exchange.name == 'raydium_cp'
  ) {

    if(paymentRoute.fromToken.address === Blockchains.solana.currency.address) {
      
      return 'routeRaydiumCpTwoHopSwapSolIn'

    } else if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {

      return 'routeRaydiumCpTwoHopSwapSolOut'

    } else {

      return 'routeRaydiumCpTwoHopSwap'

    }

  } else if (
    paymentRoute.exchangeRoutes.length > 0 &&
    getFixedPath(paymentRoute.exchangeRoutes[0].path).length === 2 &&
    paymentRoute.exchangeRoutes[0].exchange.name == 'raydium_cl'
  ) {

    if(paymentRoute.fromToken.address === Blockchains.solana.currency.address) {

      return 'routeRaydiumClSwapSolIn'

    } else if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {

      return 'routeRaydiumClSwapSolOut'

    } else {

      return 'routeRaydiumClSwap'

    }

  } else if (
    paymentRoute.exchangeRoutes.length > 0 &&
    getFixedPath(paymentRoute.exchangeRoutes[0].path).length > 2 &&
    paymentRoute.exchangeRoutes[0].exchange.name == 'raydium_cl'
  ) {

    if(paymentRoute.fromToken.address === Blockchains.solana.currency.address) {

      return 'routeRaydiumClTwoHopSwapSolIn'

    } else if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {

      return 'routeRaydiumClTwoHopSwapSolOut'

    } else {

      return 'routeRaydiumClTwoHopSwap'

    }

  } else {

    throw 'Payment method does not exist!'

  }
};

const getDeadline = ()=>{
  return Math.ceil(new Date().getTime())+(5 *60*1000) // 5 minutes in milliseconds
};

const routeSol = async({ paymentRoute, deadline }) =>{

  const paymentReceiverPublicKey = new PublicKey(paymentRoute.toAddress);
  const feeReceiverPublicKey = paymentRoute.fee ? new PublicKey(paymentRoute.fee.receiver) : paymentReceiverPublicKey;
  const feeReceiver2PublicKey = paymentRoute.fee2 ? new PublicKey(paymentRoute.fee2.receiver) : paymentReceiverPublicKey;

  const keys = [
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    { pubkey: paymentReceiverPublicKey, isSigner: false, isWritable: true },
    { pubkey: feeReceiverPublicKey, isSigner: false, isWritable: true },
    { pubkey: feeReceiver2PublicKey, isSigner: false, isWritable: true },
    { pubkey: await getEscrowSolAccountPublicKey(), isSigner: false, isWritable: true },
  ];

  const data = Buffer.alloc(routers$1.solana.api.routeSol.layout.span);
  routers$1.solana.api.routeSol.layout.encode({
    anchorDiscriminator: routers$1.solana.api.routeSol.anchorDiscriminator,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data);
  
  return new TransactionInstruction({
    keys,
    programId: new PublicKey(routers$1.solana.address),
    data
  })
};

const routeToken = async({ paymentRoute, deadline }) =>{

  const senderTokenAccountAddress = await getPaymentSenderTokenAccountAddress({ paymentRoute });
  const paymentReceiverTokenAccountAddress = await getPaymentReceiverTokenAccountAddress({ paymentRoute });
  const feeReceiverTokenAccountAddress = paymentRoute.fee ? await getFeeReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress;
  const fee2ReceiverTokenAccountAddress = paymentRoute.fee2 ? await getFee2ReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress;

  const keys = [
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    { pubkey: new PublicKey(senderTokenAccountAddress), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(paymentReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(feeReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(fee2ReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    { pubkey: await getEscrowOutAccountPublicKey({ paymentRoute }), isSigner: false, isWritable: true },
  ];

  const data = Buffer.alloc(routers$1.solana.api.routeToken.layout.span);
  routers$1.solana.api.routeToken.layout.encode({
    anchorDiscriminator: routers$1.solana.api.routeToken.anchorDiscriminator,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data);
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers$1.solana.address),
    data 
  })    
};

const routeOrcaSwap = async({ paymentRoute, deadline }) =>{

  const senderTokenAccountAddress = await getPaymentSenderTokenAccountAddress({ paymentRoute });
  const paymentReceiverTokenAccountAddress = await getPaymentReceiverTokenAccountAddress({ paymentRoute });
  const feeReceiverTokenAccountAddress = paymentRoute.fee ? await getFeeReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress;
  const fee2ReceiverTokenAccountAddress = paymentRoute.fee2 ? await getFee2ReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress;
  const escrowOutPublicKey = await getEscrowOutAccountPublicKey({ paymentRoute });
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress });
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers$1.solana.exchanges.orca);

  const SWAP_LAYOUT = struct([
    u64("anchorDiscriminator"),
    u64("amount"),
    u64("otherAmountThreshold"),
    u128("sqrtPriceLimit"),
    bool("amountSpecifiedIsInput"),
    bool("aToB"),
  ]);
  const exchangeRouteSwapInstructionData = SWAP_LAYOUT.decode(exchangeRouteSwapInstruction.data);

  const keys = [
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // amm_program
    { pubkey: new PublicKey(routers$1.solana.exchanges.orca), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // sender_token_account
    { pubkey: new PublicKey(senderTokenAccountAddress), isSigner: false, isWritable: true },
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
    { pubkey: exchangeRouteSwapInstruction.keys[10].pubkey, isSigner: false, isWritable: true },
    // escrow_out
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(feeReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver2
    { pubkey: new PublicKey(fee2ReceiverTokenAccountAddress), isSigner: false, isWritable: true },
  ];

  const data = Buffer.alloc(routers$1.solana.api.routeOrcaSwap.layout.span);
  routers$1.solana.api.routeOrcaSwap.layout.encode({
    anchorDiscriminator: routers$1.solana.api.routeOrcaSwap.anchorDiscriminator,
    amountIn: exchangeRouteSwapInstructionData.amount,
    aToB: exchangeRouteSwapInstructionData.aToB,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data);
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers$1.solana.address),
    data
  })
};

const routeOrcaSwapSolIn = async({ paymentRoute, deadline }) =>{

  const paymentReceiverTokenAccountPublicKey = new PublicKey(await getPaymentReceiverTokenAccountAddress({ paymentRoute }));
  const feeReceiverTokenAccountPublicKey = paymentRoute.fee ? new PublicKey(await getFeeReceiverTokenAccountAddress({ paymentRoute })) : paymentReceiverTokenAccountPublicKey;
  const feeReceiver2TokenAccountPublicKey = paymentRoute.fee2 ? new PublicKey(await getFee2ReceiverTokenAccountAddress({ paymentRoute })) : paymentReceiverTokenAccountPublicKey;
  const escrowOutPublicKey = await getEscrowOutAccountPublicKey({ paymentRoute });
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress });
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers$1.solana.exchanges.orca);

  const SWAP_LAYOUT = struct([
    u64("anchorDiscriminator"),
    u64("amount"),
    u64("otherAmountThreshold"),
    u128("sqrtPriceLimit"),
    bool("amountSpecifiedIsInput"),
    bool("aToB"),
  ]);
  const exchangeRouteSwapInstructionData = SWAP_LAYOUT.decode(exchangeRouteSwapInstruction.data);

  const keys = [
    // system_program
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // amm_program
    { pubkey: new PublicKey(routers$1.solana.exchanges.orca), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // escrow_in
    { pubkey: await getEscrowInWSolAccountPublicKey(), isSigner: false, isWritable: true },
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
    { pubkey: exchangeRouteSwapInstruction.keys[10].pubkey, isSigner: false, isWritable: true },
    // escrow_out
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: paymentReceiverTokenAccountPublicKey, isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: feeReceiverTokenAccountPublicKey, isSigner: false, isWritable: true },
    // fee2_receiver
    { pubkey: feeReceiver2TokenAccountPublicKey, isSigner: false, isWritable: true },
  ];

  const data = Buffer.alloc(routers$1.solana.api.routeOrcaSwapSolIn.layout.span);
  routers$1.solana.api.routeOrcaSwapSolIn.layout.encode({
    anchorDiscriminator: routers$1.solana.api.routeOrcaSwapSolIn.anchorDiscriminator,
    amountIn: exchangeRouteSwapInstructionData.amount,
    aToB: exchangeRouteSwapInstructionData.aToB,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data);
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers$1.solana.address),
    data
  })
};

const routeOrcaSwapSolOut = async({ paymentRoute, deadline }) =>{

  const senderTokenAccountAddress = await getPaymentSenderTokenAccountAddress({ paymentRoute });
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress });
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers$1.solana.exchanges.orca);

  const SWAP_LAYOUT = struct([
    u64("anchorDiscriminator"),
    u64("amount"),
    u64("otherAmountThreshold"),
    u128("sqrtPriceLimit"),
    bool("amountSpecifiedIsInput"),
    bool("aToB"),
  ]);
  const exchangeRouteSwapInstructionData = SWAP_LAYOUT.decode(exchangeRouteSwapInstruction.data);

  const keys = [
    // system_program
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // amm_program
    { pubkey: new PublicKey(routers$1.solana.exchanges.orca), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // sender_token_account
    { pubkey: new PublicKey(senderTokenAccountAddress), isSigner: false, isWritable: true },
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
    { pubkey: exchangeRouteSwapInstruction.keys[10].pubkey, isSigner: false, isWritable: true },
    // escrow_out_mint
    { pubkey: new PublicKey(Blockchains.solana.wrapped.address), isSigner: false, isWritable: false },
    // escrow_out
    { pubkey: await getEscrowOutWSolAccountPublicKey(), isSigner: false, isWritable: true },
    // escrow_out_sol
    { pubkey: await getEscrowSolAccountPublicKey(), isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentRoute.toAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(paymentRoute.fee ? paymentRoute.fee.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
    // fee2_receiver
    { pubkey: new PublicKey(paymentRoute.fee2 ? paymentRoute.fee2.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
  ];

  const data = Buffer.alloc(routers$1.solana.api.routeOrcaSwapSolOut.layout.span);
  routers$1.solana.api.routeOrcaSwapSolOut.layout.encode({
    anchorDiscriminator: routers$1.solana.api.routeOrcaSwapSolOut.anchorDiscriminator,
    amountIn: exchangeRouteSwapInstructionData.amount,
    aToB: exchangeRouteSwapInstructionData.aToB,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data);
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers$1.solana.address),
    data
  })
};

const routeOrcaTwoHopSwap = async({ paymentRoute, deadline }) =>{

  const paymentReceiverTokenAccountPublicKey = new PublicKey(await getPaymentReceiverTokenAccountAddress({ paymentRoute }));
  const feeReceiverTokenAccountPublicKey = paymentRoute.fee ? new PublicKey(await getFeeReceiverTokenAccountAddress({ paymentRoute })) : paymentReceiverTokenAccountPublicKey;
  const feeReceiver2TokenAccountPublicKey = paymentRoute.fee2 ? new PublicKey(await getFee2ReceiverTokenAccountAddress({ paymentRoute })) : paymentReceiverTokenAccountPublicKey;
  const escrowOutPublicKey = await getEscrowOutAccountPublicKey({ paymentRoute });
  const escrowMiddlePublicKey = await getEscrowMiddleAccountPublicKey({ paymentRoute });
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress });
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers$1.solana.exchanges.orca);
  const senderTokenAccountPublicKey = new PublicKey(await getPaymentSenderTokenAccountAddress({ paymentRoute }));

  const SWAP_LAYOUT = struct([
    u64("anchorDiscriminator"),
    u64("amount"),
    u64("otherAmountThreshold"),
    bool("amountSpecifiedIsInput"),
    bool("aToBOne"),
    bool("aToBTwo"),
    u128("sqrtPriceLimitOne"),
    u128("sqrtPriceLimitTwo"),
  ]);
  const exchangeRouteSwapInstructionData = SWAP_LAYOUT.decode(exchangeRouteSwapInstruction.data);

  const keys = [
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // amm_program
    { pubkey: new PublicKey(routers$1.solana.exchanges.orca), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
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
    { pubkey: exchangeRouteSwapInstruction.keys[18].pubkey, isSigner: false, isWritable: true },
    // oracle_two
    { pubkey: exchangeRouteSwapInstruction.keys[19].pubkey, isSigner: false, isWritable: true },
    // escrow_middle
    { pubkey: escrowMiddlePublicKey, isSigner: false, isWritable: true },
    // escrow_out
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: paymentReceiverTokenAccountPublicKey, isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: feeReceiverTokenAccountPublicKey, isSigner: false, isWritable: true },
    // fee_receiver2
    { pubkey: feeReceiver2TokenAccountPublicKey, isSigner: false, isWritable: true },
  ];

  const data = Buffer.alloc(routers$1.solana.api.routeOrcaTwoHopSwap.layout.span);
  routers$1.solana.api.routeOrcaTwoHopSwap.layout.encode({
    anchorDiscriminator: routers$1.solana.api.routeOrcaTwoHopSwap.anchorDiscriminator,
    amountInOne: new BN(paymentRoute.exchangeRoutes[0].amounts[0].toString()),
    amountInTwo: new BN(paymentRoute.exchangeRoutes[0].amounts[1].toString()),
    aToBOne: exchangeRouteSwapInstructionData.aToBOne,
    aToBTwo: exchangeRouteSwapInstructionData.aToBTwo,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data);

  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers$1.solana.address),
    data
  })
};

const routeOrcaTwoHopSwapSolIn = async({ paymentRoute, deadline }) =>{

  const paymentReceiverTokenAccountPublicKey = new PublicKey(await getPaymentReceiverTokenAccountAddress({ paymentRoute }));
  const feeReceiverTokenAccountPublicKey = paymentRoute.fee ? new PublicKey(await getFeeReceiverTokenAccountAddress({ paymentRoute })) : paymentReceiverTokenAccountPublicKey;
  const feeReceiver2TokenAccountPublicKey = paymentRoute.fee2 ? new PublicKey(await getFee2ReceiverTokenAccountAddress({ paymentRoute })) : paymentReceiverTokenAccountPublicKey;
  const escrowOutPublicKey = await getEscrowOutAccountPublicKey({ paymentRoute });
  const escrowMiddlePublicKey = await getEscrowMiddleAccountPublicKey({ paymentRoute });
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress });
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers$1.solana.exchanges.orca);
  new PublicKey(await getPaymentSenderTokenAccountAddress({ paymentRoute }));

  const SWAP_LAYOUT = struct([
    u64("anchorDiscriminator"),
    u64("amount"),
    u64("otherAmountThreshold"),
    bool("amountSpecifiedIsInput"),
    bool("aToBOne"),
    bool("aToBTwo"),
    u128("sqrtPriceLimitOne"),
    u128("sqrtPriceLimitTwo"),
  ]);
  const exchangeRouteSwapInstructionData = SWAP_LAYOUT.decode(exchangeRouteSwapInstruction.data);

  const keys = [
    // system_program
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // amm_program
    { pubkey: new PublicKey(routers$1.solana.exchanges.orca), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // escrow_in
    { pubkey: await getEscrowInWSolAccountPublicKey(), isSigner: false, isWritable: true },
    // whirlpool_one
    exchangeRouteSwapInstruction.keys[2],
    // whirlpool_two
    exchangeRouteSwapInstruction.keys[3],
    // token_vault_one_a
    exchangeRouteSwapInstruction.keys[5],
    // token_vault_one_b
    exchangeRouteSwapInstruction.keys[7],
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
    { pubkey: exchangeRouteSwapInstruction.keys[18].pubkey, isSigner: false, isWritable: true },
    // oracle_two
    { pubkey: exchangeRouteSwapInstruction.keys[19].pubkey, isSigner: false, isWritable: true },
    // escrow_middle
    { pubkey: escrowMiddlePublicKey, isSigner: false, isWritable: true },
    // escrow_out
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: paymentReceiverTokenAccountPublicKey, isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: feeReceiverTokenAccountPublicKey, isSigner: false, isWritable: true },
    // fee_receiver2
    { pubkey: feeReceiver2TokenAccountPublicKey, isSigner: false, isWritable: true },
  ];

  const data = Buffer.alloc(routers$1.solana.api.routeOrcaTwoHopSwapSolIn.layout.span);
  routers$1.solana.api.routeOrcaTwoHopSwapSolIn.layout.encode({
    anchorDiscriminator: routers$1.solana.api.routeOrcaTwoHopSwapSolIn.anchorDiscriminator,
    amountInOne: new BN(paymentRoute.exchangeRoutes[0].amounts[0].toString()),
    amountInTwo: new BN(paymentRoute.exchangeRoutes[0].amounts[1].toString()),
    aToBOne: exchangeRouteSwapInstructionData.aToBOne,
    aToBTwo: exchangeRouteSwapInstructionData.aToBTwo,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data);

  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers$1.solana.address),
    data
  })
};

const routeOrcaTwoHopSwapSolOut = async({ paymentRoute, deadline }) =>{

  new PublicKey(await getMiddleTokenAccountAddress({ paymentRoute }));
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress });
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers$1.solana.exchanges.orca);
  const senderTokenAccountPublicKey = new PublicKey(await getPaymentSenderTokenAccountAddress({ paymentRoute }));
  const escrowMiddlePublicKey = await getEscrowMiddleAccountPublicKey({ paymentRoute });

  const SWAP_LAYOUT = struct([
    u64("anchorDiscriminator"),
    u64("amount"),
    u64("otherAmountThreshold"),
    bool("amountSpecifiedIsInput"),
    bool("aToBOne"),
    bool("aToBTwo"),
    u128("sqrtPriceLimitOne"),
    u128("sqrtPriceLimitTwo"),
  ]);
  const exchangeRouteSwapInstructionData = SWAP_LAYOUT.decode(exchangeRouteSwapInstruction.data);

  const keys = [
    // system_program
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // amm_program
    { pubkey: new PublicKey(routers$1.solana.exchanges.orca), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
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
    { pubkey: exchangeRouteSwapInstruction.keys[18].pubkey, isSigner: false, isWritable: true },
    // oracle_two
    { pubkey: exchangeRouteSwapInstruction.keys[19].pubkey, isSigner: false, isWritable: true },
    // escrow_middle
    { pubkey: escrowMiddlePublicKey, isSigner: false, isWritable: true },
    // escrow_out_mint
    { pubkey: new PublicKey(Blockchains.solana.wrapped.address), isSigner: false, isWritable: false },
    // escrow_out
    { pubkey: await getEscrowOutWSolAccountPublicKey(), isSigner: false, isWritable: true },
    // escrow_out_sol
    { pubkey: await getEscrowSolAccountPublicKey(), isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentRoute.toAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(paymentRoute.fee ? paymentRoute.fee.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
    // fee_receiver2
    { pubkey: new PublicKey(paymentRoute.fee2 ? paymentRoute.fee2.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
  ];

  const data = Buffer.alloc(routers$1.solana.api.routeOrcaTwoHopSwapSolOut.layout.span);
  routers$1.solana.api.routeOrcaTwoHopSwapSolOut.layout.encode({
    anchorDiscriminator: routers$1.solana.api.routeOrcaTwoHopSwapSolOut.anchorDiscriminator,
    amountInOne: new BN(paymentRoute.exchangeRoutes[0].amounts[0].toString()),
    amountInTwo: new BN(paymentRoute.exchangeRoutes[0].amounts[1].toString()),
    aToBOne: exchangeRouteSwapInstructionData.aToBOne,
    aToBTwo: exchangeRouteSwapInstructionData.aToBTwo,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data);
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers$1.solana.address),
    data
  })
};

const routeRaydiumCpSwap = async({ paymentRoute, deadline }) =>{

  const senderTokenAccountAddress = await getPaymentSenderTokenAccountAddress({ paymentRoute });
  const paymentReceiverTokenAccountAddress = await getPaymentReceiverTokenAccountAddress({ paymentRoute });
  const feeReceiverTokenAccountAddress = paymentRoute.fee ? await getFeeReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress;
  const fee2ReceiverTokenAccountAddress = paymentRoute.fee2 ? await getFee2ReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress;
  const escrowOutPublicKey = await getEscrowOutAccountPublicKey({ paymentRoute });
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress });
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers$1.solana.exchanges.raydiumCP);

  const keys = [
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // cp_swap_program
    { pubkey: new PublicKey(routers$1.solana.exchanges.raydiumCP), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // authority
    exchangeRouteSwapInstruction.keys[1],
    // amm_config
    exchangeRouteSwapInstruction.keys[2],
    // pool_state
    exchangeRouteSwapInstruction.keys[3],
    // input_token_account
    { pubkey: new PublicKey(senderTokenAccountAddress), isSigner: false, isWritable: true },
    // input_vault
    exchangeRouteSwapInstruction.keys[6],
    // output_vault
    exchangeRouteSwapInstruction.keys[7],
    // input_token_mint
    exchangeRouteSwapInstruction.keys[10],
    // output_token_mint
    exchangeRouteSwapInstruction.keys[11],
    // observation_state
    exchangeRouteSwapInstruction.keys[12],
    // escrow_out
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(feeReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver2
    { pubkey: new PublicKey(fee2ReceiverTokenAccountAddress), isSigner: false, isWritable: true },
  ];

  const data = Buffer.alloc(routers$1.solana.api.routeRaydiumCpSwap.layout.span);
  routers$1.solana.api.routeRaydiumCpSwap.layout.encode({
    anchorDiscriminator: routers$1.solana.api.routeRaydiumCpSwap.anchorDiscriminator,
    amountIn: new BN(paymentRoute.fromAmount.toString()),
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data);
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers$1.solana.address),
    data
  })
};

const routeRaydiumCpSwapSolIn = async({ paymentRoute, deadline }) =>{

  const paymentReceiverTokenAccountAddress = await getPaymentReceiverTokenAccountAddress({ paymentRoute });
  const feeReceiverTokenAccountAddress = paymentRoute.fee ? await getFeeReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress;
  const fee2ReceiverTokenAccountAddress = paymentRoute.fee2 ? await getFee2ReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress;
  const escrowOutPublicKey = await getEscrowOutAccountPublicKey({ paymentRoute });
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress });
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers$1.solana.exchanges.raydiumCP);

  const keys = [
    // system_program
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // cp_swap_program
    { pubkey: new PublicKey(routers$1.solana.exchanges.raydiumCP), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // authority
    exchangeRouteSwapInstruction.keys[1],
    // amm_config
    exchangeRouteSwapInstruction.keys[2],
    // pool_state
    exchangeRouteSwapInstruction.keys[3],
    // escrow_in
    { pubkey: await getEscrowInWSolAccountPublicKey(), isSigner: false, isWritable: true },
    // input_vault
    exchangeRouteSwapInstruction.keys[6],
    // output_vault
    exchangeRouteSwapInstruction.keys[7],
    // input_token_mint
    exchangeRouteSwapInstruction.keys[10],
    // output_token_mint
    exchangeRouteSwapInstruction.keys[11],
    // observation_state
    exchangeRouteSwapInstruction.keys[12],
    // escrow_out
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(feeReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver2
    { pubkey: new PublicKey(fee2ReceiverTokenAccountAddress), isSigner: false, isWritable: true },
  ];

  const data = Buffer.alloc(routers$1.solana.api.routeRaydiumCpSwapSolIn.layout.span);
  routers$1.solana.api.routeRaydiumCpSwapSolIn.layout.encode({
    anchorDiscriminator: routers$1.solana.api.routeRaydiumCpSwapSolIn.anchorDiscriminator,
    amountIn: new BN(paymentRoute.fromAmount.toString()),
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data);
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers$1.solana.address),
    data
  })
};

const routeRaydiumCpSwapSolOut = async({ paymentRoute, deadline }) =>{

  const senderTokenAccountAddress = await getPaymentSenderTokenAccountAddress({ paymentRoute });
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress });
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers$1.solana.exchanges.raydiumCP);

  const keys = [
    // system_program
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // cp_swap_program
    { pubkey: new PublicKey(routers$1.solana.exchanges.raydiumCP), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // authority
    exchangeRouteSwapInstruction.keys[1],
    // amm_config
    exchangeRouteSwapInstruction.keys[2],
    // pool_state
    exchangeRouteSwapInstruction.keys[3],
    // input_token_account
    { pubkey: new PublicKey(senderTokenAccountAddress), isSigner: false, isWritable: true },
    // input_vault
    exchangeRouteSwapInstruction.keys[6],
    // output_vault
    exchangeRouteSwapInstruction.keys[7],
    // input_token_mint
    exchangeRouteSwapInstruction.keys[10],
    // output_token_mint
    exchangeRouteSwapInstruction.keys[11],
    // observation_state
    exchangeRouteSwapInstruction.keys[12],
    // escrow_out
    { pubkey: await getEscrowOutWSolAccountPublicKey(), isSigner: false, isWritable: true },
    // escrow_out_sol
    { pubkey: await getEscrowSolAccountPublicKey(), isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentRoute.toAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(paymentRoute.fee ? paymentRoute.fee.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
    // fee_receiver2
    { pubkey: new PublicKey(paymentRoute.fee2 ? paymentRoute.fee2.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
  ];

  const data = Buffer.alloc(routers$1.solana.api.routeRaydiumCpSwapSolOut.layout.span);
  routers$1.solana.api.routeRaydiumCpSwapSolOut.layout.encode({
    anchorDiscriminator: routers$1.solana.api.routeRaydiumCpSwapSolOut.anchorDiscriminator,
    amountIn: new BN(paymentRoute.fromAmount.toString()),
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data);
  
  return new TransactionInstruction({
    keys,
    programId: new PublicKey(routers$1.solana.address),
    data
  })
};

const routeRaydiumCpTwoHopSwap = async({ paymentRoute, deadline }) =>{
  throw('PENDING');
};

const routeRaydiumCpTwoHopSwapSolIn = async({ paymentRoute, deadline }) =>{
  throw('PENDING');
};

const routeRaydiumCpTwoHopSwapSolOut = async({ paymentRoute, deadline }) =>{
  throw('PENDING');
};

const routeRaydiumClSwap = async({ paymentRoute, deadline }) =>{

  const senderTokenAccountAddress = await getPaymentSenderTokenAccountAddress({ paymentRoute });
  const paymentReceiverTokenAccountAddress = await getPaymentReceiverTokenAccountAddress({ paymentRoute });
  const feeReceiverTokenAccountAddress = paymentRoute.fee ? await getFeeReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress;
  const fee2ReceiverTokenAccountAddress = paymentRoute.fee2 ? await getFee2ReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress;
  const escrowOutPublicKey = await getEscrowOutAccountPublicKey({ paymentRoute });
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress });
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers$1.solana.exchanges.raydiumCL);

  const keys = [
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // token_program_2022
    { pubkey: new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'), isSigner: false, isWritable: false },
    // clmm_program
    { pubkey: new PublicKey(routers$1.solana.exchanges.raydiumCL), isSigner: false, isWritable: false },
    // memo_program
    { pubkey: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // amm_config
    exchangeRouteSwapInstruction.keys[1],
    // pool_state
    exchangeRouteSwapInstruction.keys[2],
    // input_token_account
    { pubkey: new PublicKey(senderTokenAccountAddress), isSigner: false, isWritable: true },
    // input_vault
    exchangeRouteSwapInstruction.keys[5],
    // output_vault
    exchangeRouteSwapInstruction.keys[6],
    // input_token_mint
    exchangeRouteSwapInstruction.keys[11],
    // output_token_mint
    exchangeRouteSwapInstruction.keys[12],
    // observation_state
    exchangeRouteSwapInstruction.keys[7],
    // escrow_out
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(feeReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver2
    { pubkey: new PublicKey(fee2ReceiverTokenAccountAddress), isSigner: false, isWritable: true },
  ].concat(exchangeRouteSwapInstruction.keys.slice(13)); // remaining accounts from index 12 onwards

  const data = Buffer.alloc(routers$1.solana.api.routeRaydiumClSwap.layout.span);
  routers$1.solana.api.routeRaydiumClSwap.layout.encode({
    anchorDiscriminator: routers$1.solana.api.routeRaydiumClSwap.anchorDiscriminator,
    amountIn: new BN(paymentRoute.fromAmount.toString()),
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data);
  
  return new TransactionInstruction({
    keys,
    programId: new PublicKey(routers$1.solana.address),
    data
  })
};

const routeRaydiumClSwapSolIn = async({ paymentRoute, deadline }) =>{

  const paymentReceiverTokenAccountAddress = await getPaymentReceiverTokenAccountAddress({ paymentRoute });
  const feeReceiverTokenAccountAddress = paymentRoute.fee ? await getFeeReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress;
  const fee2ReceiverTokenAccountAddress = paymentRoute.fee2 ? await getFee2ReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress;
  const escrowOutPublicKey = await getEscrowOutAccountPublicKey({ paymentRoute });
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress });
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers$1.solana.exchanges.raydiumCL);

  const keys = [
    // system_program
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // token_program_2022
    { pubkey: new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'), isSigner: false, isWritable: false },
    // clmm_program
    { pubkey: new PublicKey(routers$1.solana.exchanges.raydiumCL), isSigner: false, isWritable: false },
    // memo_program
    { pubkey: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // amm_config
    exchangeRouteSwapInstruction.keys[1],
    // pool_state
    exchangeRouteSwapInstruction.keys[2],
    // escrow_in
    { pubkey: await getEscrowInWSolAccountPublicKey(), isSigner: false, isWritable: true },
    // input_vault
    exchangeRouteSwapInstruction.keys[5],
    // output_vault
    exchangeRouteSwapInstruction.keys[6],
    // input_token_mint
    exchangeRouteSwapInstruction.keys[11],
    // output_token_mint
    exchangeRouteSwapInstruction.keys[12],
    // observation_state
    exchangeRouteSwapInstruction.keys[7],
    // escrow_out
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(feeReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver2
    { pubkey: new PublicKey(fee2ReceiverTokenAccountAddress), isSigner: false, isWritable: true },
  ].concat(exchangeRouteSwapInstruction.keys.slice(13)); // remaining accounts from index 12 onwards

  const data = Buffer.alloc(routers$1.solana.api.routeRaydiumClSwapSolIn.layout.span);
  routers$1.solana.api.routeRaydiumClSwapSolIn.layout.encode({
    anchorDiscriminator: routers$1.solana.api.routeRaydiumClSwapSolIn.anchorDiscriminator,
    amountIn: new BN(paymentRoute.exchangeRoutes[0].amounts[0].toString()),
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data);
  
  return new TransactionInstruction({
    keys,
    programId: new PublicKey(routers$1.solana.address),
    data
  })

};

const routeRaydiumClSwapSolOut = async({ paymentRoute, deadline }) =>{

  const senderTokenAccountAddress = await getPaymentSenderTokenAccountAddress({ paymentRoute });
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress });
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers$1.solana.exchanges.raydiumCL);

  const keys = [
    // system_program
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // token_program_2022
    { pubkey: new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'), isSigner: false, isWritable: false },
    // clmm_program
    { pubkey: new PublicKey(routers$1.solana.exchanges.raydiumCL), isSigner: false, isWritable: false },
    // memo_program
    { pubkey: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // amm_config
    exchangeRouteSwapInstruction.keys[1],
    // pool_state
    exchangeRouteSwapInstruction.keys[2],
    // input_token_account
    { pubkey: new PublicKey(senderTokenAccountAddress), isSigner: false, isWritable: true },
    // input_vault
    exchangeRouteSwapInstruction.keys[5],
    // output_vault
    exchangeRouteSwapInstruction.keys[6],
    // input_token_mint
    exchangeRouteSwapInstruction.keys[11],
    // output_token_mint
    exchangeRouteSwapInstruction.keys[12],
    // observation_state
    exchangeRouteSwapInstruction.keys[7],
    // escrow_out
    { pubkey: await getEscrowOutWSolAccountPublicKey(), isSigner: false, isWritable: true },
    // escrow_out_sol
    { pubkey: await getEscrowSolAccountPublicKey(), isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentRoute.toAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(paymentRoute.fee ? paymentRoute.fee.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
    // fee2_receiver
    { pubkey: new PublicKey(paymentRoute.fee2 ? paymentRoute.fee2.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
  ].concat(exchangeRouteSwapInstruction.keys.slice(13)); // remaining accounts from index 12 onwards

  const data = Buffer.alloc(routers$1.solana.api.routeRaydiumClSwapSolOut.layout.span);
  routers$1.solana.api.routeRaydiumClSwapSolOut.layout.encode({
    anchorDiscriminator: routers$1.solana.api.routeRaydiumClSwapSolOut.anchorDiscriminator,
    amountIn: new BN(paymentRoute.fromAmount.toString()),
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data);
  
  return new TransactionInstruction({
    keys,
    programId: new PublicKey(routers$1.solana.address),
    data
  })
};

const routeRaydiumClTwoHopSwap = async({ paymentRoute, deadline }) =>{

  const senderTokenAccountAddress = await getPaymentSenderTokenAccountAddress({ paymentRoute });
  const paymentReceiverTokenAccountAddress = await getPaymentReceiverTokenAccountAddress({ paymentRoute });
  const feeReceiverTokenAccountAddress = paymentRoute.fee ? await getFeeReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress;
  const fee2ReceiverTokenAccountAddress = paymentRoute.fee2 ? await getFee2ReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress;
  const escrowMiddlePublicKey = await getEscrowMiddleAccountPublicKey({ paymentRoute });
  const escrowOutPublicKey = await getEscrowOutAccountPublicKey({ paymentRoute });
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress });
  const exchangeRouteSwapInstructions = exchangeRouteTransaction.instructions.filter((instruction)=>instruction.programId.toString() === routers$1.solana.exchanges.raydiumCL);
  const exchangeRouteSwapInstructionOne = exchangeRouteSwapInstructions[0];
  const exchangeRouteSwapInstructionTwo = exchangeRouteSwapInstructions[1];

  const keys = [
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // token_program_2022
    { pubkey: new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'), isSigner: false, isWritable: false },
    // clmm_program
    { pubkey: new PublicKey(routers$1.solana.exchanges.raydiumCL), isSigner: false, isWritable: false },
    // memo_program
    { pubkey: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // amm_config_one
    exchangeRouteSwapInstructionOne.keys[1],
    // amm_config_two
    exchangeRouteSwapInstructionTwo.keys[1],
    // pool_state_one
    exchangeRouteSwapInstructionOne.keys[2],
    // pool_state_two
    exchangeRouteSwapInstructionTwo.keys[2],
    // input_token_account
    { pubkey: new PublicKey(senderTokenAccountAddress), isSigner: false, isWritable: true },
    // input_vault
    exchangeRouteSwapInstructionOne.keys[5],
    // input_token_mint
    exchangeRouteSwapInstructionOne.keys[11],
    // middle_vault_one
    exchangeRouteSwapInstructionOne.keys[6],
    // middle_vault_two
    exchangeRouteSwapInstructionTwo.keys[5],
    // middle_token_mint
    exchangeRouteSwapInstructionOne.keys[12],
    // escrow_middle
    { pubkey: escrowMiddlePublicKey, isSigner: false, isWritable: true },
    // output_vault
    exchangeRouteSwapInstructionTwo.keys[6],
    // output_token_mint
    exchangeRouteSwapInstructionTwo.keys[12],
    // observation_state_one
    exchangeRouteSwapInstructionOne.keys[7],
    // observation_state_two
    exchangeRouteSwapInstructionTwo.keys[7],
    // escrow_out
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(feeReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver2
    { pubkey: new PublicKey(fee2ReceiverTokenAccountAddress), isSigner: false, isWritable: true },
  ].concat(exchangeRouteSwapInstructionOne.keys.slice(13)).concat(exchangeRouteSwapInstructionTwo.keys.slice(13)); // remaining accounts from index 12 onwards

  const data = Buffer.alloc(routers$1.solana.api.routeRaydiumClTwoHopSwap.layout.span);
  routers$1.solana.api.routeRaydiumClTwoHopSwap.layout.encode({
    anchorDiscriminator: routers$1.solana.api.routeRaydiumClTwoHopSwap.anchorDiscriminator,
    amountInOne: new BN(paymentRoute.exchangeRoutes[0].amounts[0].toString()),
    amountInTwo: new BN(paymentRoute.exchangeRoutes[0].amounts[1].toString()),
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
    remainingAccountsSplit: exchangeRouteSwapInstructionOne.keys.slice(13).length,
  }, data);
  
  return new TransactionInstruction({
    keys,
    programId: new PublicKey(routers$1.solana.address),
    data
  })
};

const routeRaydiumClTwoHopSwapSolIn = async({ paymentRoute, deadline }) =>{

  const paymentReceiverTokenAccountAddress = await getPaymentReceiverTokenAccountAddress({ paymentRoute });
  const feeReceiverTokenAccountAddress = paymentRoute.fee ? await getFeeReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress;
  const fee2ReceiverTokenAccountAddress = paymentRoute.fee2 ? await getFee2ReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress;
  const escrowMiddlePublicKey = await getEscrowMiddleAccountPublicKey({ paymentRoute });
  const escrowOutPublicKey = await getEscrowOutAccountPublicKey({ paymentRoute });
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress });
  const exchangeRouteSwapInstructions = exchangeRouteTransaction.instructions.filter((instruction)=>instruction.programId.toString() === routers$1.solana.exchanges.raydiumCL);
  const exchangeRouteSwapInstructionOne = exchangeRouteSwapInstructions[0];
  const exchangeRouteSwapInstructionTwo = exchangeRouteSwapInstructions[1];

  const keys = [
    // system_program
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // token_program_2022
    { pubkey: new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'), isSigner: false, isWritable: false },
    // clmm_program
    { pubkey: new PublicKey(routers$1.solana.exchanges.raydiumCL), isSigner: false, isWritable: false },
    // memo_program
    { pubkey: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // amm_config_one
    exchangeRouteSwapInstructionOne.keys[1],
    // amm_config_two
    exchangeRouteSwapInstructionTwo.keys[1],
    // pool_state_one
    exchangeRouteSwapInstructionOne.keys[2],
    // pool_state_two
    exchangeRouteSwapInstructionTwo.keys[2],
    // input_vault
    exchangeRouteSwapInstructionOne.keys[5],
    // input_token_mint
    exchangeRouteSwapInstructionOne.keys[11],
    // escrow_in
    { pubkey: await getEscrowInWSolAccountPublicKey(), isSigner: false, isWritable: true },
    // middle_vault_one
    exchangeRouteSwapInstructionOne.keys[6],
    // middle_vault_two
    exchangeRouteSwapInstructionTwo.keys[5],
    // middle_token_mint
    exchangeRouteSwapInstructionOne.keys[12],
    // escrow_middle
    { pubkey: escrowMiddlePublicKey, isSigner: false, isWritable: true },
    // output_vault
    exchangeRouteSwapInstructionTwo.keys[6],
    // output_token_mint
    exchangeRouteSwapInstructionTwo.keys[12],
    // observation_state_one
    exchangeRouteSwapInstructionOne.keys[7],
    // observation_state_two
    exchangeRouteSwapInstructionTwo.keys[7],
    // escrow_out
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(feeReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver2
    { pubkey: new PublicKey(fee2ReceiverTokenAccountAddress), isSigner: false, isWritable: true },
  ].concat(exchangeRouteSwapInstructionOne.keys.slice(13)).concat(exchangeRouteSwapInstructionTwo.keys.slice(13)); // remaining accounts from index 12 onwards

  const data = Buffer.alloc(routers$1.solana.api.routeRaydiumClTwoHopSwapSolIn.layout.span);
  routers$1.solana.api.routeRaydiumClTwoHopSwapSolIn.layout.encode({
    anchorDiscriminator: routers$1.solana.api.routeRaydiumClTwoHopSwapSolIn.anchorDiscriminator,
    amountInOne: new BN(paymentRoute.exchangeRoutes[0].amounts[0].toString()),
    amountInTwo: new BN(paymentRoute.exchangeRoutes[0].amounts[1].toString()),
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
    remainingAccountsSplit: exchangeRouteSwapInstructionOne.keys.slice(13).length,
  }, data);
  
  return new TransactionInstruction({
    keys,
    programId: new PublicKey(routers$1.solana.address),
    data
  })
};

const routeRaydiumClTwoHopSwapSolOut = async({ paymentRoute, deadline }) =>{

  const senderTokenAccountAddress = await getPaymentSenderTokenAccountAddress({ paymentRoute });
  const escrowMiddlePublicKey = await getEscrowMiddleAccountPublicKey({ paymentRoute });
  await getEscrowInWSolAccountPublicKey();
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress });
  const exchangeRouteSwapInstructions = exchangeRouteTransaction.instructions.filter((instruction)=>instruction.programId.toString() === routers$1.solana.exchanges.raydiumCL);
  const exchangeRouteSwapInstructionOne = exchangeRouteSwapInstructions[0];
  const exchangeRouteSwapInstructionTwo = exchangeRouteSwapInstructions[1];

  const keys = [
    // system_program
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // token_program_2022
    { pubkey: new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'), isSigner: false, isWritable: false },
    // clmm_program
    { pubkey: new PublicKey(routers$1.solana.exchanges.raydiumCL), isSigner: false, isWritable: false },
    // memo_program
    { pubkey: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // amm_config_one
    exchangeRouteSwapInstructionOne.keys[1],
    // amm_config_two
    exchangeRouteSwapInstructionTwo.keys[1],
    // pool_state_one
    exchangeRouteSwapInstructionOne.keys[2],
    // pool_state_two
    exchangeRouteSwapInstructionTwo.keys[2],
    // input_token_account
    { pubkey: new PublicKey(senderTokenAccountAddress), isSigner: false, isWritable: true },
    // input_vault
    exchangeRouteSwapInstructionOne.keys[5],
    // input_token_mint
    exchangeRouteSwapInstructionOne.keys[11],
    // middle_vault_one
    exchangeRouteSwapInstructionOne.keys[6],
    // middle_vault_two
    exchangeRouteSwapInstructionTwo.keys[5],
    // middle_token_mint
    exchangeRouteSwapInstructionOne.keys[12],
    // escrow_middle
    { pubkey: escrowMiddlePublicKey, isSigner: false, isWritable: true },
    // output_vault
    exchangeRouteSwapInstructionTwo.keys[6],
    // output_token_mint
    exchangeRouteSwapInstructionTwo.keys[12],
    // observation_state_one
    exchangeRouteSwapInstructionOne.keys[7],
    // observation_state_two
    exchangeRouteSwapInstructionTwo.keys[7],
    // escrow_out
    { pubkey: await getEscrowOutWSolAccountPublicKey(), isSigner: false, isWritable: true },
    // escrow_out_sol
    { pubkey: await getEscrowSolAccountPublicKey(), isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentRoute.toAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(paymentRoute.fee ? paymentRoute.fee.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
    // fee2_receiver
    { pubkey: new PublicKey(paymentRoute.fee2 ? paymentRoute.fee2.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
  ].concat(exchangeRouteSwapInstructionOne.keys.slice(13)).concat(exchangeRouteSwapInstructionTwo.keys.slice(13)); // remaining accounts from index 12 onwards

  const data = Buffer.alloc(routers$1.solana.api.routeRaydiumClTwoHopSwapSolOut.layout.span);
  routers$1.solana.api.routeRaydiumClTwoHopSwapSolOut.layout.encode({
    anchorDiscriminator: routers$1.solana.api.routeRaydiumClTwoHopSwapSolOut.anchorDiscriminator,
    amountInOne: new BN(paymentRoute.exchangeRoutes[0].amounts[0].toString()),
    amountInTwo: new BN(paymentRoute.exchangeRoutes[0].amounts[1].toString()),
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
    remainingAccountsSplit: exchangeRouteSwapInstructionOne.keys.slice(13).length,
  }, data);
  
  return new TransactionInstruction({
    keys,
    programId: new PublicKey(routers$1.solana.address),
    data
  })
};

const payment = async({ paymentRoute, deadline })=> {

  const paymentMethod = getPaymentMethod({ paymentRoute });

  switch(paymentMethod){
    
    case 'routeSol':
    return await routeSol({ paymentRoute, deadline });
    
    case 'routeToken':
    return await routeToken({ paymentRoute, deadline });

    case 'routeOrcaSwap':
    return await routeOrcaSwap({ paymentRoute, deadline });

    case 'routeOrcaSwapSolIn':
    return await routeOrcaSwapSolIn({ paymentRoute, deadline });

    case 'routeOrcaSwapSolOut':
    return await routeOrcaSwapSolOut({ paymentRoute, deadline });

    case 'routeOrcaTwoHopSwap':
    return await routeOrcaTwoHopSwap({ paymentRoute, deadline });

    case 'routeOrcaTwoHopSwapSolIn':
    return await routeOrcaTwoHopSwapSolIn({ paymentRoute, deadline });

    case 'routeOrcaTwoHopSwapSolOut':
    return await routeOrcaTwoHopSwapSolOut({ paymentRoute, deadline });

    case 'routeRaydiumCpSwap':
    return await routeRaydiumCpSwap({ paymentRoute, deadline });

    case 'routeRaydiumCpSwapSolIn':
    return await routeRaydiumCpSwapSolIn({ paymentRoute, deadline });

    case 'routeRaydiumCpSwapSolOut':
    return await routeRaydiumCpSwapSolOut({ paymentRoute, deadline });

    case 'routeRaydiumCpTwoHopSwap':
    return await routeRaydiumCpTwoHopSwap({ paymentRoute, deadline });

    case 'routeRaydiumCpTwoHopSwapSolIn':
    return await routeRaydiumCpTwoHopSwapSolIn({ paymentRoute, deadline });

    case 'routeRaydiumCpTwoHopSwapSolOut':
    return await routeRaydiumCpTwoHopSwapSolOut({ paymentRoute, deadline });

    case 'routeRaydiumClSwap':
    return await routeRaydiumClSwap({ paymentRoute, deadline });

    case 'routeRaydiumClSwapSolIn':
    return await routeRaydiumClSwapSolIn({ paymentRoute, deadline });

    case 'routeRaydiumClSwapSolOut':
    return await routeRaydiumClSwapSolOut({ paymentRoute, deadline });

    case 'routeRaydiumClTwoHopSwap':
    return await routeRaydiumClTwoHopSwap({ paymentRoute, deadline });

    case 'routeRaydiumClTwoHopSwapSolIn':
    return await routeRaydiumClTwoHopSwapSolIn({ paymentRoute, deadline });

    case 'routeRaydiumClTwoHopSwapSolOut':
    return await routeRaydiumClTwoHopSwapSolOut({ paymentRoute, deadline });

  }

};

const getTransaction$2 = async({ paymentRoute })=> {

  const deadline = paymentRoute.deadline || getDeadline();

  let instructions = (
    await Promise.all([
      createComputeInstruction({ paymentRoute }),
      createTokenMiddleAccount({ paymentRoute }),
      createPaymentReceiverAccount({ paymentRoute }),
      createFeeReceiverAccount({ paymentRoute }),
      createFee2ReceiverAccount({ paymentRoute }),
      createEscrowInWSOLTokenAccount({ paymentRoute }),
      createEscrowOutSolAccount({ paymentRoute }),
      createEscrowMiddleTokenAccount({ paymentRoute }),
      createEscrowOutTokenAccount({ paymentRoute }),
      payment({ paymentRoute, deadline }),
    ])
  );
  instructions = instructions.filter(Boolean).flat();

  const transaction = {
    blockchain: paymentRoute.blockchain,
    instructions,
    alts: [routers$1.solana.alt]
  };

  // debug(transaction, paymentRoute)

  transaction.deadline = deadline;

  return transaction
};

const getTransaction$1 = ({ paymentRoute, fee, options })=>{
  if(supported.evm.includes(paymentRoute.blockchain)) {
    return getTransaction$3({ paymentRoute, fee, options })
  } else if(supported.svm.includes(paymentRoute.blockchain)) {
    return getTransaction$2({ paymentRoute, fee, options })
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
    fee2,
    feeAmount2,
    protocolFee,
    protocolFeeAmount,
    exchangeRoutes,
    approvalRequired,
    currentRouterAllowance,
    currentPermit2Allowance,
  }) {
    this.blockchain = blockchain;
    this.fromAddress = fromAddress;
    this.fromToken = fromToken;
    this.fromAmount = _optionalChain([(fromAmount || toAmount), 'optionalAccess', _ => _.toString, 'call', _2 => _2()]);
    this.fromDecimals = fromDecimals;
    this.fromBalance = _optionalChain([fromBalance, 'optionalAccess', _3 => _3.toString, 'call', _4 => _4()]);
    this.toToken = toToken;
    this.toAmount = _optionalChain([toAmount, 'optionalAccess', _5 => _5.toString, 'call', _6 => _6()]);
    this.toDecimals = toDecimals;
    this.toAddress = toAddress;
    this.fee = fee;
    this.feeAmount = feeAmount;
    this.fee2 = fee2;
    this.feeAmount2 = feeAmount2;
    this.protocolFee = protocolFee;
    this.protocolFeeAmount = protocolFeeAmount;
    this.exchangeRoutes = exchangeRoutes || [];
    this.approvalRequired = approvalRequired;
    this.currentRouterAllowance = currentRouterAllowance;
    this.currentPermit2Allowance = currentPermit2Allowance;
    this.getRouterApprovalTransaction = async (options)=> {
      return await getRouterApprovalTransaction({ paymentRoute: this, options })
    };
    this.getPermit2ApprovalTransaction = async (options)=> {
      return await getPermit2ApprovalTransaction({ paymentRoute: this, options })
    };
    this.getPermit2ApprovalSignature = async (options)=> {
      return await getPermit2ApprovalSignature({ paymentRoute: this, options })
    };
    this.getTransaction = async (options)=> {
      return await getTransaction$1({ paymentRoute: this, options })
    };
  }
}

function feeSanityCheck(accept, attribute) {
  if(!accept) { return }

  accept.forEach((accept)=>{ 
    if(accept && accept[attribute] != undefined) {
      if(
        (typeof accept[attribute] == 'string' && accept[attribute].match(/\.\d\d+\%/)) ||
        (typeof accept[attribute] == 'object' && typeof accept[attribute].amount == 'string' && accept[attribute].amount.match(/\.\d\d+\%/))
      ) {
        throw('Only up to 1 decimal is supported for fee amounts in percent!')
      } else if(
        (['string', 'number'].includes(typeof accept[attribute]) && accept[attribute].toString().match(/^0/))  ||
        (typeof accept[attribute] == 'object' && ['string', 'number'].includes(typeof accept[attribute].amount) && accept[attribute].amount.toString().match(/^0/))
      ) {
        throw('Zero fee is not possible!')
      }
    }
  });
}

async function remoteRouteToPaymentRoute({ remoteRoute, from, accept }) {
  const fromToken = new Token({ blockchain: remoteRoute['blockchain'], address: remoteRoute['fromToken'], name: remoteRoute['fromName'], symbol: remoteRoute['fromSymbol'], decimals: remoteRoute['fromDecimals'] });
  const toToken = remoteRoute['fromToken'] == remoteRoute['toToken'] ? fromToken : new Token({ blockchain: remoteRoute['blockchain'], address: remoteRoute['toToken'], name: remoteRoute['toName'], symbol: remoteRoute['toSymbol'], decimals: remoteRoute['toDecimals'] });
  const fromAddress = from[remoteRoute['blockchain']];
  const toAmount = ethers.BigNumber.from(remoteRoute['toAmount']);

  const configuration = accept.find((configuration)=>{
    return configuration.blockchain == remoteRoute['blockchain'] &&
      configuration.token.toLowerCase() == remoteRoute['toToken'].toLowerCase()
  });

  if(!configuration){ throw('Remote route not found in accept!') }

  const toAddress = configuration.receiver;
  
  const [
    fromDecimals,
    toDecimals,
    fromBalance,
    exchangeRoute,
  ] = await Promise.all([
    remoteRoute['fromDecimals'] ? Promise.resolve(remoteRoute['fromDecimals']) : fromToken.decimals(),
    remoteRoute['toDecimals'] ? Promise.resolve(remoteRoute['toDecimals']) : toToken.decimals(),
    fromToken.balance(fromAddress),
    remoteRoute.pairsData ?
      Exchanges[ remoteRoute.pairsData[0]['exchange'] ].route({
        blockchain: remoteRoute['blockchain'],
        tokenIn: fromToken.address,
        tokenOut: toToken.address,
        amountOutMin: toAmount.toString(),
        fromAddress: fromAddress,
        toAddress: toAddress,
        pairsData: remoteRoute.pairsData
      }) : Promise.resolve(undefined),
  ]);

  if(fromToken.address != toToken.address && exchangeRoute == undefined) { return }

  let fromAmount;
  if(exchangeRoute) {
    fromAmount = exchangeRoute.amountIn;
  } else {
    fromAmount = toAmount;
  }

  let paymentRoute = new PaymentRoute({
    blockchain: remoteRoute['blockchain'],
    fromAddress,
    fromToken,
    fromBalance,
    fromDecimals,
    fromAmount,
    toToken,
    toAmount,
    toDecimals,
    toAddress,
    fee: configuration.fee,
    fee2: configuration.fee2,
    exchangeRoutes: [exchangeRoute].filter(Boolean),
    protocolFee: configuration.protocolFee,
  });

  paymentRoute = addRouteAmounts(paymentRoute);
  paymentRoute = await addApproval(paymentRoute);

  return paymentRoute
}

function route({ accept, from, allow, deny, best, blacklist, whitelist }) {
  ['fee', 'fee2', 'protocolFee'].forEach((attribute)=>feeSanityCheck(accept, attribute));

  return new Promise(async (resolveAll, rejectAll)=>{

    const fail = (text, error)=>{
      console.log(error);
      rejectAll(new Error(text));
    };

    const reducedAccept = accept.map((configuration)=>{
      return({
        amount: configuration.amount,
        blockchain: configuration.blockchain,
        token: configuration.token,
        receiver: configuration.receiver,
      })
    });

    // Helper to perform a fetch with timeout
    const fetchWithTimeout = (url, options = {}, timeout = 10000) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      return fetch(url, {
        ...options,
        signal: controller.signal
      })
        .finally(() => clearTimeout(timer))
    };

    // Always try to load the best route, but don’t block loading all routes if it fails
    try {
      const bestResponse = await fetchWithTimeout(
        config.endpoints.routesBest,
        {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accounts: from,
            accept: reducedAccept,
            allow: allow || whitelist,
            deny: deny || blacklist,
          })
        }
      );

      if (bestResponse.ok && bestResponse.status !== 404) {
        const remoteBest = await bestResponse.json().catch(() => null);
        if (remoteBest) {
          const bestRoute = await remoteRouteToPaymentRoute({ remoteRoute: remoteBest, from, accept })
            .catch(error => { console.error('Best route could not be loaded!', error); });

          if (typeof best === 'function' && _optionalChain([bestRoute, 'optionalAccess', _7 => _7.fromAmount]) && bestRoute.fromAmount !== '0') {
            best(bestRoute);
          }
        }
      }
    } catch (error) {
      console.error('Best route could not be loaded!', error);
    }

    // Always load all routes regardless of best route outcome
    try {
      const allResponse = await fetchWithTimeout(
        `https://public.depay.com/routes/all`,
        {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accounts: from,
            accept: reducedAccept,
            allow: allow || whitelist,
            deny: deny || blacklist,
          })
        }
      );

      if (!allResponse.ok) {
        throw new Error(`All routes: HTTP ${allResponse.status}`)
      }

      const remoteAll = await allResponse.json();
      const settled = await Promise.allSettled(
        remoteAll.map(remoteRoute =>
          remoteRouteToPaymentRoute({ remoteRoute, from, accept })
        )
      );

      const validRoutes = settled
        .filter(r => r.status === 'fulfilled' && _optionalChain([r, 'access', _8 => _8.value, 'optionalAccess', _9 => _9.fromAmount]) && r.value.fromAmount !== '0')
        .map(r => r.value)
        .sort((a, b) => {
          // requiring approval is less cost efficient
          if (a.approvalRequired && !b.approvalRequired) return 1
          if (b.approvalRequired && !a.approvalRequired) return -1
          return 0
        });

      resolveAll(validRoutes);
    } catch (error) {
      fail('All routes could not be loaded!', error);
    }

  })
}

let addApproval = async (route) => {

  let allowances;
  if(route.blockchain === 'solana') {
    allowances = [
      Promise.resolve(Blockchains.solana.maxInt),
      Promise.resolve(Blockchains.solana.maxInt)
    ];
  } else {
    allowances = await Promise.all([
      route.fromToken.allowance(route.fromAddress, routers[route.blockchain].address).catch(()=>{}),
      route.fromToken.allowance(route.fromAddress, Blockchains[route.blockchain].permit2).catch(()=>{})
    ]);
  }

  if(
    route.fromToken.address.toLowerCase() === Blockchains[route.blockchain].currency.address.toLowerCase() ||
    route.blockchain === 'solana'
  ){
    route.approvalRequired = false;
  } else if (allowances != undefined) {
    if(allowances[0]) {
      route.currentRouterAllowance = allowances[0];
    }
    if(allowances[1]) {
      route.currentPermit2Allowance = allowances[1];
    }
    route.approvalRequired = ![
      route.currentRouterAllowance ? ethers.BigNumber.from(route.currentRouterAllowance) : undefined,
    ].filter(Boolean).some((amount)=>{
      return amount.gte(route.fromAmount)
    });
  }

  return route
};

let calculateAmounts = ({ paymentRoute, exchangeRoute })=>{
  let fromAmount;
  let toAmount;
  let feeAmount;
  let feeAmount2;
  let protocolFeeAmount;
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
    feeAmount = getFeeAmount({ paymentRoute, amount: _optionalChain([paymentRoute, 'optionalAccess', _10 => _10.fee, 'optionalAccess', _11 => _11.amount]) });
  }
  if(paymentRoute.fee2){
    feeAmount2 = getFeeAmount({ paymentRoute, amount: _optionalChain([paymentRoute, 'optionalAccess', _12 => _12.fee2, 'optionalAccess', _13 => _13.amount]) });
  }
  if(paymentRoute.protocolFee){
    protocolFeeAmount = getFeeAmount({ paymentRoute, amount: _optionalChain([paymentRoute, 'optionalAccess', _14 => _14.protocolFee]) });
  }
  return { fromAmount, toAmount, feeAmount, feeAmount2, protocolFeeAmount }
};

let subtractFee = ({ amount, paymentRoute })=> {
  if(!paymentRoute.fee && !paymentRoute.fee2 && !paymentRoute.protocolFee) { return amount }
  let feeAmount = getFeeAmount({ paymentRoute, amount: _optionalChain([paymentRoute, 'optionalAccess', _15 => _15.fee, 'optionalAccess', _16 => _16.amount]) });
  let feeAmount2 = getFeeAmount({ paymentRoute, amount: _optionalChain([paymentRoute, 'optionalAccess', _17 => _17.fee2, 'optionalAccess', _18 => _18.amount]) });
  let protocolFee = getFeeAmount({ paymentRoute, amount: _optionalChain([paymentRoute, 'optionalAccess', _19 => _19.protocolFee]) });
  return ethers.BigNumber.from(amount).sub(feeAmount).sub(feeAmount2).sub(protocolFee).toString()
};

let getFeeAmount = ({ paymentRoute, amount })=> {
  if(amount == undefined) {
    return '0'
  } else if(typeof amount == 'string' && amount.match('%')) {
    return ethers.BigNumber.from(paymentRoute.toAmount).mul(parseFloat(amount)*10).div(1000).toString()
  } else if(typeof amount == 'string') {
    return amount
  } else if(typeof amount == 'number') {
    return ethers.utils.parseUnits(amount.toString(), paymentRoute.toDecimals).toString()
  } else {
    throw('Unknown fee amount type!')
  }
};

let addRouteAmounts = (route)=> {

  if(supported.evm.includes(route.blockchain)) {

    if(route.directTransfer && !route.fee && !route.fee2) {
      route.fromAmount = route.toAmount;
    } else {
      let { fromAmount, toAmount, feeAmount, feeAmount2, protocolFeeAmount } = calculateAmounts({ paymentRoute: route, exchangeRoute: route.exchangeRoutes[0] });
      route.fromAmount = fromAmount;
      route.toAmount = toAmount;
      if(route.fee){
        route.feeAmount = feeAmount;
      }
      if(route.fee2){
        route.feeAmount2 = feeAmount2;
      }
      if(route.protocolFee){
        route.protocolFeeAmount = protocolFeeAmount;
      }
    }
  } else if (supported.svm.includes(route.blockchain)) {

    let { fromAmount, toAmount, feeAmount, feeAmount2, protocolFeeAmount } = calculateAmounts({ paymentRoute: route, exchangeRoute: route.exchangeRoutes[0] });
    route.fromAmount = fromAmount;
    route.toAmount = toAmount;
    if(route.fee){
      route.feeAmount = feeAmount;
    }
    if(route.fee2){
      route.feeAmount2 = feeAmount2;
    }
    if(route.protocolFee){
      route.protocolFeeAmount = protocolFeeAmount;
    }
  }
  
  return route
};

const getTransaction = (paymentRoute)=>{
  if(paymentRoute.blockchain === 'solana') { // solanapay
    return getTransaction$2({ paymentRoute })
  }
};

export { config, getTransaction, route, routers };
