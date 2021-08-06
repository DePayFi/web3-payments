import { CONSTANTS } from 'depay-web3-constants';
import { setApiKey as setApiKey$1, getWallet } from 'depay-web3-wallets';
import { route as route$1 } from 'depay-web3-exchanges';
import { Transaction } from 'depay-web3-transaction';
import { Token } from 'depay-web3-tokens';

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

let apiKey = undefined;

function setApiKey(key) {
  apiKey = key;
  setApiKey$1(apiKey);
}

var plugins = {
  ethereum: {
    payment: '0x99F3F4685a7178F26EB4F4Ca8B75a1724F1577B9',
    uniswap_v2: '0xe04b08Dfc6CaA0F4Ec523a3Ae283Ece7efE00019'
  },
  bsc: {
    payment: '0x8B127D169D232D5F3ebE1C3D06CE343FD7C1AA11',
    pancakeswap: '0xAC3Ec4e420DD78bA86d932501E1f3867dbbfb77B'
  } 
};

let routeToTransaction = ({ paymentRoute })=> {
  let exchangeRoute = paymentRoute.exchangeRoutes[0];
  return new Transaction({
    blockchain: paymentRoute.blockchain,
    address: routers[paymentRoute.blockchain].address,
    api: routers[paymentRoute.blockchain].api,
    method: 'route',
    params: {
      path: transactionPath({ paymentRoute, exchangeRoute }),
      amounts: transactionAmounts({ paymentRoute, exchangeRoute }),
      addresses: transactionAddresses({ paymentRoute }),
      plugins: transactionPlugins({ paymentRoute, exchangeRoute }),
      data: []
    },
    value: transactionValue({ paymentRoute, exchangeRoute })
  })
};

let transactionPath = ({ paymentRoute, exchangeRoute })=> {
  if(exchangeRoute) {
    return exchangeRoute.path
  } else {
    return [paymentRoute.toToken.address]
  }
};

let transactionAmounts = ({ paymentRoute, exchangeRoute })=> {
  if(exchangeRoute) {
    return [
      exchangeRoute.amountIn,
      exchangeRoute.amountOutMin,
      exchangeRoute.transaction.params.deadline
    ]
  } else {
    return [paymentRoute.toAmount]
  }
};

let transactionAddresses = ({ paymentRoute })=> {
  return [paymentRoute.fromAddress, paymentRoute.toAddress]
};

let transactionPlugins = ({ paymentRoute, exchangeRoute })=> {
  if(exchangeRoute) {
    return [
      plugins[paymentRoute.blockchain][exchangeRoute.exchange.name],
      plugins[paymentRoute.blockchain].payment
    ]
  } else {
    return [
      plugins[paymentRoute.blockchain].payment
    ]
  }
};

let transactionValue = ({ paymentRoute, exchangeRoute })=> {
  if(exchangeRoute) {
    return exchangeRoute.amountIn
  } else {
    return paymentRoute.toAmount
  }
};

class PaymentRoute {
  constructor({ blockchain, fromToken, toToken, toAmount, fromAddress, toAddress }) {
    this.blockchain = blockchain;
    this.fromToken = fromToken;
    this.fromBalance = 0;
    this.toToken = toToken;
    this.toAmount = toAmount;
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.exchangeRoutes = [];
    this.transaction = undefined;
  }
}

async function route({ blockchain, fromAddress, toAddress, token, amount }) {
  let wallet = getWallet();
  let toToken = new Token({ blockchain, address: token });
  let amountBN = await toToken.BigNumber(amount);
  let paymentRoutes = await wallet
    .assets(blockchain)
    .then(assetsToTokens)
    .then(filterTransferable)
    .then((tokens) => convertToRoutes({ tokens, toToken, toAmount: amountBN, fromAddress, toAddress }))
    .then((routes) => addExchangeRoutes({ blockchain, routes, amount, fromAddress, toAddress }))
    .then((routes) => filterNotRoutable({ routes, token }))
    .then((routes) => addBalances({ routes, fromAddress }))
    .then((routes) => filterInsufficientBalance({ routes, token, amountBN }))
    .then((routes) => addApprovalStatus({ routes, blockchain }))
    .then((routes) => sortPaymentRoutes({ routes, token }))
    .then(addTransactions);

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
  return assets.map((asset) => new Token({ blockchain: asset.blockchain, address: asset.address }))
};

let filterTransferable = async (tokens) => {
  return await Promise.all(tokens.map((token) => token.transferable())).then((transferables) =>
    tokens.filter((token, index) => transferables[index]),
  )
};

let convertToRoutes = ({ tokens, toToken, toAmount, fromAddress, toAddress }) => {
  return tokens.map((token) => {
    return new PaymentRoute({
      blockchain: toToken.blockchain,
      fromToken: token,
      toToken,
      toAmount,
      fromAddress,
      toAddress
    })
  })
};

let addExchangeRoutes = async ({ blockchain, routes, amount, fromAddress, toAddress }) => {
  return await Promise.all(
    routes.map((route) => {
      return route$1({
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
      route.exchangeRoutes.length != 0 ||
      route.fromToken.address == token // direct transfer always possible
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

let addApprovalStatus = ({ routes, blockchain }) => {
  return Promise.all(routes.map(
    (route) => route.fromToken.allowance(routers[blockchain].address)
  )).then(
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

    if (a.fromToken.address == CONSTANTS[a.blockchain].NATIVE) {
      return aWins
    }
    if (b.fromToken.address == CONSTANTS[b.blockchain].NATIVE) {
      return bWins
    }

    return equal
  })
};

let addTransactions = (routes) => {
  return routes.map((route)=>{
    route.transaction = routeToTransaction({ paymentRoute: route });
    return route
  })
};

export { route, setApiKey };
