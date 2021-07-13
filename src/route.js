import { getApiKey } from './apiKey'
import { getWallet } from 'depay-crypto-wallets'
import { route as exchangeRoute } from 'depay-decentralized-exchanges'
import { Token } from 'depay-blockchain-token'

class PaymentRoute {
  constructor({ blockchain, fromToken, toToken }) {
    this.blockchain = blockchain
    this.fromToken = fromToken
    this.toToken = toToken
    this.exchangeRoutes = []
  }
}

async function route({ blockchain, from, to, token, amount }) {
  let wallet = getWallet()
  let toToken = new Token({ blockchain, address: token })
  let paymentRoutes = await wallet
    .assets()
    .then(assetsToTokens)
    .then(filterTransferable)
    .then((tokens) => convertToRoutes({ tokens, toToken }))
    .then((routes) => addExchangeRoutes({ routes, amount, from, to }))
  // .then(filterSufficientBalance)

  console.log('paymentRoutes', paymentRoutes)
  return paymentRoutes
}

let assetsToTokens = async (assets) => {
  return assets.map((asset) => new Token({ blockchain: asset.blockchain, address: asset.address }))
}

let filterTransferable = async (tokens) => {
  return await Promise.all(tokens.map((token) => token.transferable())).then((transferables) =>
    tokens.filter((token, index) => transferables[index]),
  )
}

let convertToRoutes = ({ tokens, toToken }) => {
  return tokens.map((token) => {
    return new PaymentRoute({
      blockchain: toToken.blockchain,
      fromToken: token,
      toToken: toToken,
    })
  })
}

let addExchangeRoutes = async ({ routes, amount, from, to }) => {
  return await Promise.all(
    routes.map((route) => {
      return exchangeRoute({
        tokenIn: route.fromToken.address,
        tokenOut: route.toToken.address,
        amountOut: amount,
        from,
        to,
      })
    }),
  ).then((exchangeRoutes) => {
    console.log('exchangeRoutes', exchangeRoutes)
  })
}

export default route
