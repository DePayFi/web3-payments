import CONSTANTS from 'depay-blockchain-constants';
import { setApiKey as setApiKey$1, getWallet } from 'depay-crypto-wallets';
import { route as route$1 } from 'depay-decentralized-exchanges';
import { Token } from 'depay-blockchain-token';

let DePayRouterV1 = '0xae60aC8e69414C2Dc362D0e6a03af643d1D85b92';

let apiKey = undefined;

function setApiKey(key) {
  apiKey = key;
  setApiKey$1(apiKey);
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
  let wallet = getWallet();
  let toToken = new Token({ blockchain, address: token });
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
  return assets.map((asset) => new Token({ blockchain: asset.blockchain, address: asset.address }))
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
      return route$1({
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

    if(a.fromToken.address == CONSTANTS[a.blockchain].NATIVE) { return aWins }
    if(b.fromToken.address == CONSTANTS[b.blockchain].NATIVE) { return bWins }

    return equal
  })
};

export { route, setApiKey };
