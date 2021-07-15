(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('depay-blockchain-constants'), require('depay-crypto-wallets'), require('depay-decentralized-exchanges'), require('depay-blockchain-token')) :
  typeof define === 'function' && define.amd ? define(['exports', 'depay-blockchain-constants', 'depay-crypto-wallets', 'depay-decentralized-exchanges', 'depay-blockchain-token'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.PaymentRouting = {}, global.BlockchainConstants, global.CryptoWallets, global.Exchange, global.BlockchainToken));
}(this, (function (exports, CONSTANTS, depayCryptoWallets, depayDecentralizedExchanges, depayBlockchainToken) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var CONSTANTS__default = /*#__PURE__*/_interopDefaultLegacy(CONSTANTS);

  let DePayRouterV1 = '0xae60aC8e69414C2Dc362D0e6a03af643d1D85b92';

  let apiKey = undefined;

  function setApiKey(key) {
    apiKey = key;
    depayCryptoWallets.setApiKey(apiKey);
  }

  class PaymentRoute {
    constructor({ blockchain, fromToken, toToken }) {
      this.blockchain = blockchain;
      this.fromToken = fromToken;
      this.fromBalance = 0;
      this.toToken = toToken;
      this.exchangeRoutes = [];
    }
  }

  async function route({ blockchain, from, to, token, amount }) {
    let wallet = depayCryptoWallets.getWallet();
    let toToken = new depayBlockchainToken.Token({ blockchain, address: token });
    let amountBN = await toToken.BigNumber(amount);
    let paymentRoutes = await wallet
      .assets()
      .then(assetsToTokens)
      .then(filterTransferable)
      .then((tokens) => convertToRoutes({ tokens, toToken }))
      .then((routes) => addExchangeRoutes({ routes, amount, from, to }))
      .then((routes) => filterNotRoutable({ routes, token }))
      .then((routes) => addBalances({ routes, from }))
      .then((routes) => filterInsufficientBalance({ routes, token, amountBN }))
      .then(addApprovalStatus)
      .then((routes)=> sortPaymentRoutes({ routes, token }));

    return paymentRoutes
  }

  let addBalances = async ({ routes, from }) => {
    return Promise.all(
      routes.map((route)=>route.fromToken.balance(from))
    ).then((balances)=>{
      balances.forEach((balance, index)=>{ 
        routes[index].fromBalance = balance;
      });
      return routes
    })
  };

  let assetsToTokens = async (assets) => {
    return assets.map((asset) => new depayBlockchainToken.Token({ blockchain: asset.blockchain, address: asset.address }))
  };

  let filterTransferable = async (tokens) => {
    return await Promise.all(tokens.map((token) => token.transferable())).then((transferables) =>
      tokens.filter((token, index) => transferables[index]),
    )
  };

  let convertToRoutes = ({ tokens, toToken }) => {
    return tokens.map((token) => {
      return new PaymentRoute({
        blockchain: toToken.blockchain,
        fromToken: token,
        toToken: toToken
      })
    })
  };

  let addExchangeRoutes = async ({ routes, amount, from, to }) => {
    return await Promise.all(
      routes.map((route) => {
        return depayDecentralizedExchanges.route({
          tokenIn: route.fromToken.address,
          tokenOut: route.toToken.address,
          amountOutMin: amount,
          from,
          to,
        })
      }),
    ).then((exchangeRoutes) => {
      routes.map((route, index)=>{
        route.exchangeRoutes = exchangeRoutes[index];
      });
      return routes
    })
  };

  let filterNotRoutable = ({ routes, token })=>{
    return routes.filter((route)=>{
      return(
        route.exchangeRoutes.length != 0 ||
        route.fromToken.address == token // direct transfer still possible
      )
    })
  };

  let filterInsufficientBalance = ({ routes, token, amountBN })=>{
    return routes.filter((route)=>{
      if(route.fromToken.address == token) {
        return route.fromBalance.gte(amountBN)
      } else {
        return route.fromBalance.gte(route.exchangeRoutes[0].amountInMax)
      }
    })
  };

  let addApprovalStatus = (routes)=>{
    return Promise.all(
      routes.map((route)=>route.fromToken.allowance(DePayRouterV1))
    ).then((allowances)=>{
      routes.forEach((route, index)=>{ 
        routes[index].approvalRequired = route.fromBalance.lt(allowances[index]);
      });
      return routes
    })
  };

  let sortPaymentRoutes = ({ routes, token })=> {
    let aWins = -1;
    let bWins = 1;
    let equal = 0;
    return routes.sort((a, b) => {

      if(a.fromToken.address == token) { return aWins }
      if(b.fromToken.address == token) { return bWins }

      if(a.approvalRequired && !b.approvalRequired) { return aWins }
      if(b.approvalRequired && !a.approvalRequired) { return bWins }

      if(a.fromToken.address == CONSTANTS__default['default'][a.blockchain].NATIVE) { return aWins }
      if(b.fromToken.address == CONSTANTS__default['default'][b.blockchain].NATIVE) { return bWins }

      return equal
    })
  };

  exports.route = route;
  exports.setApiKey = setApiKey;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
