/*#if _EVM

import { dripAssets } from '@depay/web3-assets-evm'
import Exchanges from '@depay/web3-exchanges-evm'
import Token from '@depay/web3-tokens-evm'

/*#elif _SVM

import { dripAssets } from '@depay/web3-assets-svm'
import Exchanges from '@depay/web3-exchanges-svm'
import Token from '@depay/web3-tokens-svm'

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
import { getRouterApprovalTransaction, getPermit2ApprovalTransaction, getPermit2ApprovalSignature } from './approval'
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
    fee2,
    feeAmount2,
    protocolFee,
    protocolFeeAmount,
    exchangeRoutes,
    directTransfer,
    approvalRequired,
    currentRouterAllowance,
    currentPermit2Allowance,
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
    this.fee2 = fee2
    this.feeAmount2 = feeAmount2
    this.protocolFee = protocolFee
    this.protocolFeeAmount = protocolFeeAmount
    this.exchangeRoutes = exchangeRoutes || []
    this.directTransfer = directTransfer
    this.approvalRequired = approvalRequired
    this.currentRouterAllowance = currentRouterAllowance
    this.currentPermit2Allowance = currentPermit2Allowance
    this.getRouterApprovalTransaction = async (options)=> {
      return await getRouterApprovalTransaction({ paymentRoute: this, options })
    }
    this.getPermit2ApprovalTransaction = async (options)=> {
      return await getPermit2ApprovalTransaction({ paymentRoute: this, options })
    }
    this.getPermit2ApprovalSignature = async (options)=> {
      return await getPermit2ApprovalSignature({ paymentRoute: this, options })
    }
    this.getTransaction = async (options)=> {
      return await getTransaction({ paymentRoute: this, options })
    }
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
          toAddress: configuration.receiver,
          fee: configuration.fee,
          fee2: configuration.fee2,
          protocolFee: configuration.protocolFee,
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
          toAddress: configuration.receiver,
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
  })
}

function route({ accept, from, whitelist, blacklist, drip }) {
  ['fee', 'fee2', 'protocolFee'].forEach((attribute)=>feeSanityCheck(accept, attribute))

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

    // add native currency as priority if does not exist already
    [...new Set(blockchains)].forEach((blockchain)=>{
      if(
        !priority.find((priority)=>priority.blockchain === blockchain && priority.address === Blockchains[blockchain].currency.address) &&
        (!whitelist || (whitelist && whitelist[blockchain] && whitelist[blockchain].includes(Blockchains[blockchain].currency.address)))
      ) {
        priority.push({ blockchain, address: Blockchains[blockchain].currency.address })
      }
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

    const sortPriorities = (priorities, a,b)=>{
      if(!priorities || priorities.length === 0) { return 0 }
      let priorityIndexOfA = priorities.indexOf([a.blockchain, a.address.toLowerCase()].join(''))
      let priorityIndexOfB = priorities.indexOf([b.blockchain, b.address.toLowerCase()].join(''))
      
      if(priorityIndexOfA !== -1 && priorityIndexOfB === -1) {
        return -1 // a wins
      }
      if(priorityIndexOfB !== -1 && priorityIndexOfA === -1) {
        return 1 // b wins
      }

      if(priorityIndexOfA < priorityIndexOfB) {
        return -1 // a wins
      }
      if(priorityIndexOfB < priorityIndexOfA) {
        return 1 // b wins
      }
      return 0
    }

    let drippedIndex = 0
    const dripQueue = []
    const dripped = []
    const priorities = priority.map((priority)=>[priority.blockchain, priority.address.toLowerCase()].join(''))
    const thresholdToFirstDripIfNo1PriorityWasNotFirst = 3000
    const now = ()=>Math.ceil(new Date())
    const time = now()
    setTimeout(()=>{
      dripQueue.forEach((asset)=>dripRoute(route, false))
    }, thresholdToFirstDripIfNo1PriorityWasNotFirst)
    const dripRoute = (route, recursive = true)=>{
      try {
        const asset = { blockchain: route.blockchain, address: route.fromToken.address }
        const assetAsKey = [asset.blockchain, asset.address.toLowerCase()].join('')
        const timeThresholdReached = now()-time > thresholdToFirstDripIfNo1PriorityWasNotFirst
        if(dripped.indexOf(assetAsKey) > -1) { return }
        if(priorities.indexOf(assetAsKey) === drippedIndex) {
          dripped.push(assetAsKey)
          drip(route)
          drippedIndex += 1
          if(!recursive){ return }
          dripQueue.forEach((asset)=>dripRoute(route, false))
        } else if(drippedIndex >= priorities.length || timeThresholdReached) {
          if(priorities.indexOf(assetAsKey) === -1) {
            dripped.push(assetAsKey)
            drip(route)
          } else if (drippedIndex >= priorities.length || timeThresholdReached) {
            dripped.push(assetAsKey)
            drip(route)
          }
        } else if(!dripQueue.find((queued)=>queued.blockchain === asset.blockchain && queued.address.toLowerCase() === asset.address.toLowerCase())) {
          dripQueue.push(asset)
          dripQueue.sort((a,b)=>sortPriorities(priorities, a, b))
        }
      } catch {}
    }

    let allAssets = await dripAssets({
      accounts: from,
      priority,
      only: whitelist,
      exclude: blacklist,
      drip: !drip ? undefined : (asset)=>{
        assetsToRoutes({ assets: [asset], blacklist, accept, from }).then((routes)=>{
          if(routes?.length) {
            dripRoute(routes[0])
          }
        })
      }
    })

    allAssets = allAssets.filter((route)=>{
      if(route.blockchain != 'solana') {
        return true
      } else {
        return Blockchains.solana.tokens.find((token)=>token.address == route.address)
      }
    })

    let allPaymentRoutes = (await assetsToRoutes({ assets: allAssets, blacklist, accept, from }) || [])
    allPaymentRoutes.assets = allAssets
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
      return Exchanges.route({
        blockchain: route.blockchain,
        tokenIn: route.fromToken.address,
        tokenOut: route.toToken.address,
        amountOutMin: route.toAmount,
        fromAddress: route.fromAddress,
        toAddress: route.toAddress
      })
    }),
  ).then((exchangeRoutes) => {
    return routes.map((route, index) => {
      route.exchangeRoutes = exchangeRoutes[index].filter(Boolean)
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
        return [
          Promise.resolve(Blockchains.solana.maxInt),
          Promise.resolve(Blockchains.solana.maxInt)
        ]
      } else {
        return Promise.all([
          route.fromToken.allowance(route.fromAddress, routers[route.blockchain].address).catch(()=>{}),
          route.fromToken.allowance(route.fromAddress, Blockchains[route.blockchain].permit2).catch(()=>{})
        ])
      }
    }
  )).then(
    (allowances) => {
      routes = routes.map((route, index) => {
        if(
          route.directTransfer ||
          route.fromToken.address.toLowerCase() === Blockchains[route.blockchain].currency.address.toLowerCase() ||
          route.blockchain === 'solana'
        ){
          route.approvalRequired = false
        } else if (allowances[index] != undefined) {
          if(allowances[index][0]) {
            route.currentRouterAllowance = ethers.BigNumber.from(allowances[index][0])
          }
          if(allowances[index][1]) {
            route.currentPermit2Allowance = ethers.BigNumber.from(allowances[index][1])
          }
          route.approvalRequired = ![
            routes[index].currentRouterAllowance,
            routes[index].currentPermit2Allowance
          ].filter(Boolean).some((amount)=>{
            return amount.gte(routes[index].fromAmount)
          })
        }
        return route
      })
      return routes
    },
  )
}

let addDirectTransferStatus = ({ routes }) => {
  return routes.map((route)=>{
    if(supported.evm.includes(route.blockchain)) {
      route.directTransfer = route.fromToken.address.toLowerCase() == route.toToken.address.toLowerCase() && route.fee == undefined && route.fee2 == undefined
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
  let feeAmount2
  let protocolFeeAmount
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
    feeAmount = getFeeAmount({ paymentRoute, amount: paymentRoute?.fee?.amount })
  }
  if(paymentRoute.fee2){
    feeAmount2 = getFeeAmount({ paymentRoute, amount: paymentRoute?.fee2?.amount })
  }
  if(paymentRoute.protocolFee){
    protocolFeeAmount = getFeeAmount({ paymentRoute, amount: paymentRoute?.protocolFee })
  }
  return { fromAmount, toAmount, feeAmount, feeAmount2, protocolFeeAmount }
}

let subtractFee = ({ amount, paymentRoute })=> {
  if(!paymentRoute.fee && !paymentRoute.fee2 && !paymentRoute.protocolFee) { return amount }
  let feeAmount = getFeeAmount({ paymentRoute, amount: paymentRoute?.fee?.amount })
  let feeAmount2 = getFeeAmount({ paymentRoute, amount: paymentRoute?.fee2?.amount })
  let protocolFee = getFeeAmount({ paymentRoute, amount: paymentRoute?.protocolFee })
  return ethers.BigNumber.from(amount).sub(feeAmount).sub(feeAmount2).sub(protocolFee).toString()
}

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
}

let addRouteAmounts = ({ routes })=> {
  return routes.map((route)=>{

    if(supported.evm.includes(route.blockchain)) {

      if(route.directTransfer && !route.fee && !route.fee2) {
        route.fromAmount = route.toAmount
      } else {
        let { fromAmount, toAmount, feeAmount, feeAmount2, protocolFeeAmount } = calculateAmounts({ paymentRoute: route, exchangeRoute: route.exchangeRoutes[0] })
        route.fromAmount = fromAmount
        route.toAmount = toAmount
        if(route.fee){
          route.feeAmount = feeAmount
        }
        if(route.fee2){
          route.feeAmount2 = feeAmount2
        }
        if(route.protocolFee){
          route.protocolFeeAmount = protocolFeeAmount
        }
      }
    } else if (supported.svm.includes(route.blockchain)) {

      let { fromAmount, toAmount, feeAmount, feeAmount2, protocolFeeAmount } = calculateAmounts({ paymentRoute: route, exchangeRoute: route.exchangeRoutes[0] })
      route.fromAmount = fromAmount
      route.toAmount = toAmount
      if(route.fee){
        route.feeAmount = feeAmount
      }
      if(route.fee2){
        route.feeAmount2 = feeAmount2
      }
      if(route.protocolFee){
        route.protocolFeeAmount = protocolFeeAmount
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

    // cheaper blockchains are more cost-efficient
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

    // requiring approval is less cost-efficient
    // requiring approval is less cost efficient
    if (a.approvalRequired && !b.approvalRequired) {
      return bWins
    }
    if (b.approvalRequired && !a.approvalRequired) {
      return aWins
    }

    // NATIVE -> WRAPPED is more cost-efficient that swapping to another token
    if (JSON.stringify([a.fromToken.address.toLowerCase(), a.toToken.address.toLowerCase()].sort()) == JSON.stringify([Blockchains[a.blockchain].currency.address.toLowerCase(), Blockchains[a.blockchain].wrapped.address.toLowerCase()].sort())) {
      return aWins
    }
    if (JSON.stringify([b.fromToken.address.toLowerCase(), b.toToken.address.toLowerCase()].sort()) == JSON.stringify([Blockchains[b.blockchain].currency.address.toLowerCase(), Blockchains[b.blockchain].wrapped.address.toLowerCase()].sort())) {
      return bWins
    }

    // NATIVE input token is more cost-efficient
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
