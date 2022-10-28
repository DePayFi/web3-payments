import plugins from './plugins'
import routers from './routers'
import { CONSTANTS } from '@depay/web3-constants'
import { ethers } from 'ethers'
import { dripAssets } from '@depay/web3-assets-evm'
import { route as exchangeRoute } from '@depay/web3-exchanges-evm'
import { getTransaction } from './transaction.evm'
import { Token } from '@depay/web3-tokens-evm'
import throttle from 'lodash/throttle'

class PaymentRoute {
  constructor({ blockchain, fromAddress, fromToken, fromDecimals, fromAmount, fromBalance, toToken, toDecimals, toAmount, toAddress, toContract }) {
    this.blockchain = blockchain
    this.fromAddress = fromAddress
    this.fromToken = fromToken
    this.fromAmount = fromAmount?.toString()
    this.fromDecimals = fromDecimals
    this.fromBalance = fromBalance
    this.toToken = toToken
    this.toAmount = toAmount?.toString()
    this.toDecimals = toDecimals
    this.toAddress = toAddress
    this.toContract = toContract
    this.exchangeRoutes = []
    this.transaction = undefined
    this.approvalRequired = undefined
    this.approvalTransaction = undefined
    this.directTransfer = undefined
    this.event = undefined
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
          toContract: configuration.toContract
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
          toContract: configuration.toContract
        })
      }
    }))
  })).then((routes)=> routes.flat().filter(el => el))
}

function assetsToRoutes({ assets, blacklist, accept, from, event, fee }) {
  return Promise.resolve(filterBlacklistedAssets({ assets, blacklist }))
    .then((assets) => convertToRoutes({ assets, accept, from }))
    .then((routes) => addDirectTransferStatus({ routes, fee }))
    .then(addExchangeRoutes)
    .then(filterExchangeRoutesWithoutPlugin)
    .then(filterNotRoutable)
    .then(filterInsufficientBalance)
    .then(addApproval)
    .then(sortPaymentRoutes)
    .then((routes)=>addTransactions({ routes, event, fee }))
    .then(addRouteAmounts)
    .then(filterDuplicateFromTokens)
}

function route({ accept, from, whitelist, blacklist, event, fee, update }) {
  if(fee && fee.amount && typeof(fee.amount) == 'string' && fee.amount.match(/\.\d\d+\%/)) {
    throw('Only up to 1 decimal is supported for fee amounts!')
  }

  return new Promise(async (resolveAll, rejectAll)=>{

    let priority = []
    if(whitelist) {
      for (const blockchain in whitelist) {
        (whitelist[blockchain] || []).forEach((address)=>{
          priority.push({ blockchain, address })
        })
      }
    } else {
      accept.forEach((accepted)=>{
        priority.push({ blockchain: accepted.blockchain, address: accepted.token || accepted.toToken })
      })
    }

    let throttledUpdate
    if(update) {
      throttledUpdate = throttle(async ({ assets, blacklist, accept, from, event, fee })=>{
        update.callback(await assetsToRoutes({ assets, blacklist, accept, from, event, fee }))
      }, update.every)
    }
    
    let drippedAssets = []
    const allAssets = await dripAssets({
      accounts: from,
      priority: priority,
      only: whitelist,
      exclude: blacklist,
      drip: (asset)=>{
        if(update) {
          drippedAssets.push(asset)
          throttledUpdate({ assets: drippedAssets, blacklist, accept, from, event, fee })
        }
      }
    })

    let allPaymentRoutes = await assetsToRoutes({ assets: allAssets, blacklist, accept, from, event, fee })
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
        return exchangeRoute({
          blockchain: route.blockchain,
          tokenIn: route.fromToken.address,
          tokenOut: route.toToken.address,
          amountOutMin: route.toAmount,
          fromAddress: route.fromAddress,
          toAddress: route.toAddress
        })
      } else if(route.fromToken && route.fromAmount) {
        return exchangeRoute({
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

let filterExchangeRoutesWithoutPlugin = (routes) => {
  return routes.filter((route)=>{
    if(route.exchangeRoutes.length == 0) { return true }
    return plugins[route.blockchain][route.exchangeRoutes[0].exchange.name] != undefined
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
    (route) => route.fromToken.allowance(route.fromAddress, routers[route.blockchain].address)
  )).then(
    (allowances) => {
      routes.forEach((route, index) => {
        if(
          (
            route.directTransfer ||
            route.fromToken.address.toLowerCase() == CONSTANTS[route.blockchain].NATIVE.toLowerCase()
          ) && route.toContract == undefined
        ) {
          routes[index].approvalRequired = false
        } else {
          routes[index].approvalRequired = ethers.BigNumber.from(route.fromBalance).gte(ethers.BigNumber.from(allowances[index]))
          if(routes[index].approvalRequired) {
            routes[index].approvalTransaction = {
              blockchain: route.blockchain,
              to: route.fromToken.address,
              api: Token[route.blockchain].DEFAULT,
              method: 'approve',
              params: [routers[route.blockchain].address, CONSTANTS[route.blockchain].MAXINT]
            }
          }
        }
      })
      return routes
    },
  )
}

let addDirectTransferStatus = ({ routes, fee }) => {
  return routes.map((route)=>{
    route.directTransfer = route.fromToken.address.toLowerCase() == route.toToken.address.toLowerCase() && route.toContract == undefined && fee == undefined
    return route
  })
}

let addRouteAmounts = (routes)=> {
  return routes.map((route)=>{
    if(route.directTransfer && !route.fee) {
      if(route.fromToken.address.toLowerCase() == CONSTANTS[route.blockchain].NATIVE.toLowerCase()) {
        route.fromAmount = route.transaction.value
        route.toAmount = route.transaction.value
      } else {
        route.fromAmount = route.transaction.params[1]
        route.toAmount = route.transaction.params[1]
      }
    } else {
      route.fromAmount = route.transaction.params.amounts[0]
      route.toAmount = route.transaction.params.amounts[1]
      if(route.fee){
        route.feeAmount = route.transaction.params.amounts[4]
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
      if(ethers.BigNumber.from(routeB.fromAmount).lt(ethers.BigNumber.from(routeA.fromAmount))) { return true }
      if(routeB.fromAmount == routeA.fromAmount && indexB < indexA) { return true }
    })

    return otherMoreEfficientRoute == undefined
  })
}

let scoreBlockchainCost = (blockchain) => {
  switch(blockchain) {
    case 'polygon':
      return 50
      break;
    case 'bsc':
      return 90
      break;
    case 'ethereum':
      return 99
      break;
    default:
      return 100
  }
}

let sortPaymentRoutes = (routes) => {
  let aWins = -1
  let bWins = 1
  let equal = 0
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

    if (a.fromToken.address.toLowerCase() == CONSTANTS[a.blockchain].NATIVE.toLowerCase()) {
      return aWins
    }
    if (b.fromToken.address.toLowerCase() == CONSTANTS[b.blockchain].NATIVE.toLowerCase()) {
      return bWins
    }

    return equal
  })
}

let addTransactions = ({ routes, event, fee }) => {
  return Promise.all(routes.map(async (route)=>{
    route.transaction = await getTransaction({ paymentRoute: route, event, fee })
    route.event = !route.directTransfer
    route.fee = !!fee
    return route
  }))
}

export default route
