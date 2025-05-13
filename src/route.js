/*#if _EVM

import Exchanges from '@depay/web3-exchanges-evm'
import Token from '@depay/web3-tokens-evm'

/*#elif _SVM

import Exchanges from '@depay/web3-exchanges-svm'
import Token from '@depay/web3-tokens-svm'

//#else */

import Exchanges from '@depay/web3-exchanges'
import Token from '@depay/web3-tokens'

//#endif

import Blockchains from '@depay/web3-blockchains'
import routers from './routers'
import { ethers } from 'ethers'
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
    approvalRequired,
    currentRouterAllowance,
    currentPermit2Allowance,
  }) {
    this.blockchain = blockchain
    this.fromAddress = fromAddress
    this.fromToken = fromToken
    this.fromAmount = (fromAmount || toAmount)?.toString()
    this.fromDecimals = fromDecimals
    this.fromBalance = fromBalance?.toString()
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

const aWins = -1
const bWins = 1

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

async function remoteRouteToPaymentRoute({ remoteRoute, from, accept }) {
  const fromToken = new Token({ blockchain: remoteRoute['blockchain'], address: remoteRoute['fromToken'], name: remoteRoute['fromName'], symbol: remoteRoute['fromSymbol'], decimals: remoteRoute['fromDecimals'] })
  const toToken = remoteRoute['fromToken'] == remoteRoute['toToken'] ? fromToken : new Token({ blockchain: remoteRoute['blockchain'], address: remoteRoute['toToken'], name: remoteRoute['toName'], symbol: remoteRoute['toSymbol'], decimals: remoteRoute['toDecimals'] })
  const fromAddress = from[remoteRoute['blockchain']]
  const toAmount = ethers.BigNumber.from(remoteRoute['toAmount'])

  const configuration = accept.find((configuration)=>{
    return configuration.blockchain == remoteRoute['blockchain'] &&
      configuration.token.toLowerCase() == remoteRoute['toToken'].toLowerCase()
  })

  if(!configuration){ throw('Remote route not found in accept!') }

  const toAddress = configuration.receiver
  
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
  ])

  if(fromToken.address != toToken.address && exchangeRoute == undefined) { return }

  let fromAmount
  if(exchangeRoute) {
    fromAmount = exchangeRoute.amountIn
  } else {
    fromAmount = toAmount
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
  })

  paymentRoute = addRouteAmounts(paymentRoute)
  paymentRoute = await addApproval(paymentRoute)

  return paymentRoute
}

function route({ accept, from, allow, deny, best, blacklist, whitelist }) {
  ['fee', 'fee2', 'protocolFee'].forEach((attribute)=>feeSanityCheck(accept, attribute))

  return new Promise(async (resolveAll, rejectAll)=>{

    const fail = (text, error)=>{
      console.log(error)
      rejectAll(new Error(text))
    }

    const reducedAccept = accept.map((configuration)=>{
      return({
        amount: configuration.amount,
        blockchain: configuration.blockchain,
        token: configuration.token,
        receiver: configuration.receiver,
      })
    })

    const fetchBestController = new AbortController()
    setTimeout(()=>fetchBestController.abort(), 10000)

    fetch(
      `https://public.depay.com/routes/best`,
      {
        method: 'POST',
        body: JSON.stringify({
          accounts: from,
          accept: reducedAccept,
          allow: allow || whitelist,
          deny: deny || blacklist,
        }),
        headers: { "Content-Type": "application/json" },
        signal: fetchBestController.signal
      }
    )
    .catch((error)=>{ fail('Best route could not be loaded!', error) })
    .then(async(bestRouteResponse)=>{
      if(bestRouteResponse.status == 404) { return resolveAll([]) }
      if(!bestRouteResponse.ok) { fail('Best route could not be loaded!') }
      bestRouteResponse.json()
      .then(async(bestRoute)=>{
        bestRoute = await remoteRouteToPaymentRoute({ remoteRoute: bestRoute, from, accept })
          .catch((error)=>{ fail('Best route could not be loaded!', error) })
        if(typeof best == 'function' && bestRoute?.fromAmount && bestRoute?.fromAmount != '0') {
          best(bestRoute)
        }
        const fetchAllController = new AbortController()
        setTimeout(()=>fetchAllController.abort(), 10000)
        fetch(
          `https://public.depay.com/routes/all`,
          {
            method: 'POST',
            body: JSON.stringify({
              accounts: from,
              accept: reducedAccept,
              allow: allow || whitelist,
              deny: deny || blacklist,
            }),
            headers: { "Content-Type": "application/json" },
            signal: fetchAllController.signal
          }
        )
        .then((allRoutesResponse)=>{
          if(!allRoutesResponse.ok) { fail('All routes could not be loaded!') }
          allRoutesResponse.json()
          .then(async (allRoutes)=>{
            allRoutes = await Promise.all(allRoutes.map((remoteRoute)=>{
              return remoteRouteToPaymentRoute({ remoteRoute, from, accept })
            })).catch((error)=>{ fail('All routes could not be loaded!', error) })
            resolveAll(
              allRoutes
              .filter(Boolean)
              .filter((route)=>route?.fromAmount !== '0')
              .sort((a, b)=>{
                // requiring approval is less cost efficient
                if (a.approvalRequired && !b.approvalRequired) {
                  return bWins
                }
                if (b.approvalRequired && !a.approvalRequired) {
                  return aWins
                }
                return 0
              })
            )
          })
          .catch((error)=>{ fail('All routes could not be loaded!', error) })
        })
        .catch((error)=>{ fail('Best route could not be loaded!', error) })
      })
      .catch((error)=> {
        fail('Best route could not be loaded!', error)
      })
    })
  })
}

let addApproval = async (route) => {

  let allowances
  if(route.blockchain === 'solana') {
    allowances = [
      Promise.resolve(Blockchains.solana.maxInt),
      Promise.resolve(Blockchains.solana.maxInt)
    ]
  } else {
    allowances = await Promise.all([
      route.fromToken.allowance(route.fromAddress, routers[route.blockchain].address).catch(()=>{}),
      route.fromToken.allowance(route.fromAddress, Blockchains[route.blockchain].permit2).catch(()=>{})
    ])
  }

  if(
    route.fromToken.address.toLowerCase() === Blockchains[route.blockchain].currency.address.toLowerCase() ||
    route.blockchain === 'solana'
  ){
    route.approvalRequired = false
  } else if (allowances != undefined) {
    if(allowances[0]) {
      route.currentRouterAllowance = allowances[0]
    }
    if(allowances[1]) {
      route.currentPermit2Allowance = allowances[1]
    }
    route.approvalRequired = ![
      route.currentRouterAllowance ? ethers.BigNumber.from(route.currentRouterAllowance) : undefined,
    ].filter(Boolean).some((amount)=>{
      return amount.gte(route.fromAmount)
    })
  }

  return route
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

let addRouteAmounts = (route)=> {

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
}

export default route
