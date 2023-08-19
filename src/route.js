/*#if _EVM

import { dripAssets } from '@depay/web3-assets-evm'
import Exchanges from '@depay/web3-exchanges-evm'
import Token from '@depay/web3-tokens-evm'

/*#elif _SOLANA

import { dripAssets } from '@depay/web3-assets-solana'
import Exchanges from '@depay/web3-exchanges-solana'
import Token from '@depay/web3-tokens-solana'

//#else */

import { dripAssets } from '@depay/web3-assets'
import Exchanges from '@depay/web3-exchanges'
import Token from '@depay/web3-tokens'

//#endif

import Blockchains from '@depay/web3-blockchains'
import routers from './routers'
import throttle from 'lodash/throttle'
import { ethers } from 'ethers'
import { getBlockchainCost } from './costs'
import { getTransaction } from './transaction'
import { supported } from './blockchains'

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
  }) {
    this.blockchain = blockchain
    this.fromAddress = fromAddress
    this.fromToken = fromToken
    this.fromAmount = (fromAmount || toAmount)?.toString()
    this.fromDecimals = fromDecimals
    this.fromBalance = fromBalance
    this.toToken = toToken
    this.toAmount = toAmount?.toString()
    this.toDecimals = toDecimals
    this.toAddress = toAddress
    this.fee = fee
    this.feeAmount = feeAmount
    this.exchangeRoutes = exchangeRoutes || []
    this.approvalRequired = approvalRequired
    this.approvalTransaction = approvalTransaction
    this.directTransfer = directTransfer
    this.getTransaction = async ()=> await getTransaction({ paymentRoute: this })
  }
}

function convertToRoutes({ assets, accept, from }) {
  return Promise.all(assets.map(async (asset)=>{
    let relevantConfigurations = accept.filter((configuration)=>(configuration.blockchain == asset.blockchain))
    let fromToken = new Token(asset)
    return Promise.all(relevantConfigurations.map(async (configuration)=>{
      if(configuration.token && configuration.amount) {
        let blockchain = configuration.blockchain
        let fromDecimals = asset.decimals
        let toToken = new Token({ blockchain, address: configuration.token })
        let toDecimals = await toToken.decimals()
        let toAmount = (await toToken.BigNumber(configuration.amount)).toString()

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
        })
      } else if(configuration.fromToken && configuration.fromAmount && fromToken.address.toLowerCase() == configuration.fromToken.toLowerCase()) {
        let blockchain = configuration.blockchain
        let fromAmount = (await fromToken.BigNumber(configuration.fromAmount)).toString()
        let fromDecimals = asset.decimals
        let toToken = new Token({ blockchain, address: configuration.toToken })
        let toDecimals = await toToken.decimals()
        
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
        })
      }
    }))
  })).then((routes)=> routes.flat().filter(el => el))
}

function assetsToRoutes({ assets, blacklist, accept, from }) {
  return Promise.resolve(filterBlacklistedAssets({ assets, blacklist }))
    .then((assets) => convertToRoutes({ assets, accept, from }))
    .then((routes) => addDirectTransferStatus({ routes }))
    .then(addExchangeRoutes)
    .then(filterNotRoutable)
    .then(filterInsufficientBalance)
    .then((routes)=>addRouteAmounts({ routes }))
    .then(addApproval)
    .then(sortPaymentRoutes)
    .then(filterDuplicateFromTokens)
    .then((routes)=>routes.map((route)=>new PaymentRoute(route)))
}

function route({ accept, from, whitelist, blacklist, drip }) {
  if(accept.some((accept)=>{ return accept && accept.fee && typeof(accept.fee.amount) == 'string' && accept.fee.amount.match(/\.\d\d+\%/) })) {
    throw('Only up to 1 decimal is supported for fee amounts!')
  }

  return new Promise(async (resolveAll, rejectAll)=>{

    let priority = []
    let blockchains = []
    if(whitelist) {
      for (const blockchain in whitelist) {
        (whitelist[blockchain] || []).forEach((address)=>{
          blockchains.push(blockchain)
          priority.push({ blockchain, address })
        })
      }
    } else {
      accept.forEach((accepted)=>{
        blockchains.push(accepted.blockchain)
        priority.push({ blockchain: accepted.blockchain, address: accepted.token || accepted.toToken })
      })
    }

    [...new Set(blockchains)].forEach((blockchain)=>{
      priority.push({ blockchain, address: Blockchains[blockchain].currency.address })
    })

    priority.sort((a,b)=>{

      // cheaper blockchains are more cost efficient
      if (getBlockchainCost(a.blockchain) < getBlockchainCost(b.blockchain)) {
        return -1 // a wins
      }
      if (getBlockchainCost(b.blockchain) < getBlockchainCost(a.blockchain)) {
        return 1 // b wins
      }

      // NATIVE input token is more cost efficient
      if (a.address.toLowerCase() === Blockchains[a.blockchain].currency.address.toLowerCase()) {
        return -1 // a wins
      }
      if (b.address.toLowerCase() === Blockchains[b.blockchain].currency.address.toLowerCase()) {
        return 1 // b wins
      }

      return 0
    })

    const allAssets = await dripAssets({
      accounts: from,
      priority,
      only: whitelist,
      exclude: blacklist,
      drip: !drip ? undefined : (asset)=>{
        assetsToRoutes({ assets: [asset], blacklist, accept, from }).then((routes)=>{
          if(routes?.length){
            drip(routes[0])
          }
        })
      }
    })

    let allPaymentRoutes = await assetsToRoutes({ assets: allAssets, blacklist, accept, from })
    resolveAll(allPaymentRoutes)
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
}

let addExchangeRoutes = async (routes) => {
  return await Promise.all(
    routes.map((route) => {
      if(route.directTransfer) { return [] }
      if(route.toToken && route.toAmount) {
        return Exchanges.route({
          blockchain: route.blockchain,
          tokenIn: route.fromToken.address,
          tokenOut: route.toToken.address,
          amountOutMin: route.toAmount,
          fromAddress: route.fromAddress,
          toAddress: route.toAddress
        })
      } else if(route.fromToken && route.fromAmount) {
        return Exchanges.route({
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
      route.exchangeRoutes = exchangeRoutes[index]
      return route
    })
  })
}

let filterNotRoutable = (routes) => {
  return routes.filter((route) => {
    return (
      route.exchangeRoutes.length != 0 ||
      route.fromToken.address.toLowerCase() == route.toToken.address.toLowerCase() // direct transfer always possible
    )
  })
}

let filterInsufficientBalance = async(routes) => {
  return routes.filter((route) => {
    if (route.fromToken.address.toLowerCase() == route.toToken.address.toLowerCase()) {
      return ethers.BigNumber.from(route.fromBalance).gte(ethers.BigNumber.from(route.toAmount))
    } else if(route.fromAmount && route.toAmount) {
      return ethers.BigNumber.from(route.fromBalance).gte(ethers.BigNumber.from(route.exchangeRoutes[0].amountInMax))
    } else if(route.exchangeRoutes[0] && route.exchangeRoutes[0].amountIn) {
      return ethers.BigNumber.from(route.fromBalance).gte(ethers.BigNumber.from(route.exchangeRoutes[0].amountIn))
    }
  })
}

let addApproval = (routes) => {
  return Promise.all(routes.map(
    (route) => {
      if(route.blockchain === 'solana') {
        return Promise.resolve(Blockchains.solana.maxInt)
      } else {
        return route.fromToken.allowance(route.fromAddress, routers[route.blockchain].address).catch(()=>{})
      }
    }
  )).then(
    (allowances) => {
      routes.map((route, index) => {
        if(
          (
            allowances[index] === undefined ||
            route.directTransfer ||
            route.fromToken.address.toLowerCase() == Blockchains[route.blockchain].currency.address.toLowerCase() ||
            route.blockchain === 'solana'
          )
        ) {
          routes[index].approvalRequired = false
        } else {
          routes[index].approvalRequired = ethers.BigNumber.from(route.fromAmount).gte(ethers.BigNumber.from(allowances[index]))
          if(routes[index].approvalRequired) {
            routes[index].approvalTransaction = {
              blockchain: route.blockchain,
              to: route.fromToken.address,
              api: Token[route.blockchain].DEFAULT,
              method: 'approve',
              params: [routers[route.blockchain].address, Blockchains[route.blockchain].maxInt]
            }
          }
        }
      })
      return routes
    },
  )
}

let addDirectTransferStatus = ({ routes }) => {
  return routes.map((route)=>{
    if(supported.evm.includes(route.blockchain)) {
      route.directTransfer = route.fromToken.address.toLowerCase() == route.toToken.address.toLowerCase() && route.fee == undefined
    } else if (route.blockchain === 'solana') {
      route.directTransfer = route.fromToken.address.toLowerCase() == route.toToken.address.toLowerCase()
    }
    return route
  })
}

let calculateAmounts = ({ paymentRoute, exchangeRoute })=>{
  let fromAmount
  let toAmount
  let feeAmount
  if(exchangeRoute) {
    if(exchangeRoute && exchangeRoute.exchange.wrapper) {
      fromAmount = exchangeRoute.amountIn.toString()
      toAmount = subtractFee({ amount: exchangeRoute.amountOutMin.toString(), paymentRoute })
    } else {
      fromAmount = exchangeRoute.amountIn.toString()
      toAmount = subtractFee({ amount: exchangeRoute.amountOutMin.toString(), paymentRoute })
    }
  } else {
    fromAmount = paymentRoute.fromAmount
    toAmount = subtractFee({ amount: paymentRoute.fromAmount, paymentRoute })
  }
  if(paymentRoute.fee){
    feeAmount = getFeeAmount({ paymentRoute })
  }
  return { fromAmount, toAmount, feeAmount }
}

let subtractFee = ({ amount, paymentRoute })=> {
  if(paymentRoute.fee) {
    let feeAmount = getFeeAmount({ paymentRoute })
    return ethers.BigNumber.from(amount).sub(feeAmount).toString()
  } else {
    return amount
  }
}

let getFeeAmount = ({ paymentRoute })=> {
  if(typeof paymentRoute.fee.amount == 'string' && paymentRoute.fee.amount.match('%')) {
    return ethers.BigNumber.from(paymentRoute.toAmount).mul(parseFloat(paymentRoute.fee.amount)*10).div(1000).toString()
  } else if(typeof paymentRoute.fee.amount == 'string') {
    return paymentRoute.fee.amount
  } else if(typeof paymentRoute.fee.amount == 'number') {
    return ethers.utils.parseUnits(paymentRoute.fee.amount.toString(), paymentRoute.toDecimals).toString()
  } else {
    throw('Unknown fee amount type!')
  }
}

let addRouteAmounts = ({ routes })=> {
  return routes.map((route)=>{

    if(supported.evm.includes(route.blockchain)) {

      if(route.directTransfer && !route.fee) {
        route.fromAmount = route.toAmount
      } else {
        let { fromAmount, toAmount, feeAmount } = calculateAmounts({ paymentRoute: route, exchangeRoute: route.exchangeRoutes[0] })
        route.fromAmount = fromAmount
        route.toAmount = toAmount
        if(route.fee){
          route.feeAmount = feeAmount
        }
      }
    } else if (supported.solana.includes(route.blockchain)) {

      let { fromAmount, toAmount, feeAmount } = calculateAmounts({ paymentRoute: route, exchangeRoute: route.exchangeRoutes[0] })
      route.fromAmount = fromAmount
      route.toAmount = toAmount
      if(route.fee){
        route.feeAmount = feeAmount
      }

    }
    
    return route
  })
}

let filterDuplicateFromTokens = (routes) => {
  return routes.filter((routeA, indexA)=>{
    let otherMoreEfficientRoute = routes.find((routeB, indexB)=>{
      if(routeA.fromToken.address != routeB.fromToken.address) { return false }
      if(routeA.fromToken.blockchain != routeB.fromToken.blockchain) { return false }
      if(routeB.directTransfer && !routeA.directTransfer) { return true }
      if(ethers.BigNumber.from(routeB.fromAmount).lt(ethers.BigNumber.from(routeA.fromAmount)) && !routeA.directTransfer) { return true }
      if(routeB.fromAmount == routeA.fromAmount && indexB < indexA) { return true }
    })

    return otherMoreEfficientRoute == undefined
  })
}

let sortPaymentRoutes = (routes) => {
  let aWins = -1
  let bWins = 1
  let equal = 0
  return routes.sort((a, b) => {

    // cheaper blockchains are more cost-efficien
    if (getBlockchainCost(a.fromToken.blockchain) < getBlockchainCost(b.fromToken.blockchain)) {
      return aWins
    }
    if (getBlockchainCost(b.fromToken.blockchain) < getBlockchainCost(a.fromToken.blockchain)) {
      return bWins
    }

    // direct transfer is always more cost-efficient
    if (a.fromToken.address.toLowerCase() == a.toToken.address.toLowerCase()) {
      return aWins
    }
    if (b.fromToken.address.toLowerCase() == b.toToken.address.toLowerCase()) {
      return bWins
    }

    // requiring approval is less cost efficient
    if (a.approvalRequired && !b.approvalRequired) {
      return bWins
    }
    if (b.approvalRequired && !a.approvalRequired) {
      return aWins
    }

    // NATIVE -> WRAPPED is more cost efficient that swapping to another token
    if (JSON.stringify([a.fromToken.address.toLowerCase(), a.toToken.address.toLowerCase()].sort()) == JSON.stringify([Blockchains[a.blockchain].currency.address.toLowerCase(), Blockchains[a.blockchain].wrapped.address.toLowerCase()].sort())) {
      return aWins
    }
    if (JSON.stringify([b.fromToken.address.toLowerCase(), b.toToken.address.toLowerCase()].sort()) == JSON.stringify([Blockchains[b.blockchain].currency.address.toLowerCase(), Blockchains[b.blockchain].wrapped.address.toLowerCase()].sort())) {
      return bWins
    }

    // NATIVE input token is more cost efficient
    if (a.fromToken.address.toLowerCase() == Blockchains[a.blockchain].currency.address.toLowerCase()) {
      return aWins
    }
    if (b.fromToken.address.toLowerCase() == Blockchains[b.blockchain].currency.address.toLowerCase()) {
      return bWins
    }

    if (a.fromToken.address < b.fromToken.address) {
      return aWins
    } else {
      return bWins
    }
  })
}

export default route
