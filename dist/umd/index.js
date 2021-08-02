(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('depay-web3-constants'), require('depay-web3-wallets'), require('depay-web3-exchanges'), require('depay-web3-tokens')) :
  typeof define === 'function' && define.amd ? define(['exports', 'depay-web3-constants', 'depay-web3-wallets', 'depay-web3-exchanges', 'depay-web3-tokens'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Web3Payments = {}, global.Web3Constants, global.Web3Wallets, global.Web3Exchanges, global.Web3Tokens));
}(this, (function (exports, depayWeb3Constants, depayWeb3Wallets, depayWeb3Exchanges, depayWeb3Tokens) { 'use strict';

  let DePayRouterV1 = '0xae60aC8e69414C2Dc362D0e6a03af643d1D85b92';

  let apiKey = undefined;

  function setApiKey(key) {
    apiKey = key;
    depayWeb3Wallets.setApiKey(apiKey);
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

  async function route({ blockchain, fromAddress, toAddress, token, amount }) {
    let wallet = depayWeb3Wallets.getWallet();
    let toToken = new depayWeb3Tokens.Token({ blockchain, address: token });
    let amountBN = await toToken.BigNumber(amount);
    let paymentRoutes = await wallet
      .assets(blockchain)
      .then(assetsToTokens)
      .then(filterTransferable)
      .then((tokens) => convertToRoutes({ tokens, toToken }))
      .then((routes) => addExchangeRoutes({ blockchain, routes, amount, fromAddress, toAddress }))
      .then((routes) => filterNotRoutable({ routes, token }))
      .then((routes) => addBalances({ routes, fromAddress }))
      .then((routes) => filterInsufficientBalance({ routes, token, amountBN }))
      .then(addApprovalStatus)
      .then((routes) => sortPaymentRoutes({ routes, token }));

    return paymentRoutes
  }

  let addBalances = async ({ routes, fromAddress }) => {
    return Promise.all(routes.map((route) => route.fromToken.balance(fromAddress))).then((balances) => {
      balances.forEach((balance, index) => {
        routes[index].fromBalance = balance;
      });
      return routes
    })
  };

  let assetsToTokens = async (assets) => {
    return assets.map((asset) => new depayWeb3Tokens.Token({ blockchain: asset.blockchain, address: asset.address }))
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
        toToken: toToken,
      })
    })
  };

  let addExchangeRoutes = async ({ blockchain, routes, amount, fromAddress, toAddress }) => {
    return await Promise.all(
      routes.map((route) => {
        return depayWeb3Exchanges.route({
          blockchain,
          tokenIn: route.fromToken.address,
          tokenOut: route.toToken.address,
          amountOutMin: amount,
          fromAddress,
          toAddress,
        })
      }),
    ).then((exchangeRoutes) => {
      routes.map((route, index) => {
        route.exchangeRoutes = exchangeRoutes[index];
      });
      return routes
    })
  };

  let filterNotRoutable = ({ routes, token }) => {
    return routes.filter((route) => {
      return (
        route.exchangeRoutes.length != 0 || route.fromToken.address == token // direct transfer always possible
      )
    })
  };

  let filterInsufficientBalance = ({ routes, token, amountBN }) => {
    return routes.filter((route) => {
      if (route.fromToken.address == token) {
        return route.fromBalance.gte(amountBN)
      } else {
        return route.fromBalance.gte(route.exchangeRoutes[0].amountInMax)
      }
    })
  };

  let addApprovalStatus = (routes) => {
    return Promise.all(routes.map((route) => route.fromToken.allowance(DePayRouterV1))).then(
      (allowances) => {
        routes.forEach((route, index) => {
          routes[index].approvalRequired = route.fromBalance.lt(allowances[index]);
        });
        return routes
      },
    )
  };

  let sortPaymentRoutes = ({ routes, token }) => {
    let aWins = -1;
    let bWins = 1;
    let equal = 0;
    return routes.sort((a, b) => {
      if (a.fromToken.address == token) {
        return aWins
      }
      if (b.fromToken.address == token) {
        return bWins
      }

      if (a.approvalRequired && !b.approvalRequired) {
        return aWins
      }
      if (b.approvalRequired && !a.approvalRequired) {
        return bWins
      }

      if (a.fromToken.address == depayWeb3Constants.CONSTANTS[a.blockchain].NATIVE) {
        return aWins
      }
      if (b.fromToken.address == depayWeb3Constants.CONSTANTS[b.blockchain].NATIVE) {
        return bWins
      }

      return equal
    })
  };

  exports.route = route;
  exports.setApiKey = setApiKey;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
