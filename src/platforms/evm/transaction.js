/*#if _EVM

import Token from '@depay/web3-tokens-evm'

/*#elif _SOLANA

//#else */

import Token from '@depay/web3-tokens'

//#endif

import Blockchains from '@depay/web3-blockchains'
import routers from './routers'
import { ethers } from 'ethers'

const getTransaction = async({ paymentRoute })=> {

  const transaction = {
    blockchain: paymentRoute.blockchain,
    to: transactionAddress({ paymentRoute }),
    api: transactionApi({ paymentRoute }),
    method: transactionMethod({ paymentRoute }),
    params: await transactionParams({ paymentRoute }),
    value: transactionValue({ paymentRoute })
  }

  return transaction
}

const transactionAddress = ({ paymentRoute })=> {
  if(paymentRoute.directTransfer && !paymentRoute.fee) {
    if(paymentRoute.toToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
      return paymentRoute.toAddress
    } else {
      return paymentRoute.toToken.address
    }
  } else {
    return routers[paymentRoute.blockchain].address
  }
}

const transactionApi = ({ paymentRoute })=> {
  if(paymentRoute.directTransfer && !paymentRoute.fee) {
    if(paymentRoute.toToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
      return undefined
    } else {
      return Token[paymentRoute.blockchain].DEFAULT
    }
  } else {
    return routers[paymentRoute.blockchain].api
  }
}

const transactionMethod = ({ paymentRoute })=> {
  if(paymentRoute.directTransfer && !paymentRoute.fee) {
    if(paymentRoute.toToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
      return undefined
    } else { // standard token transfer
      return 'transfer'
    }
  } else {
    return 'pay'
  }
}

const getExchangeType = ({ exchangeRoute, blockchain })=> {
  if( typeof exchangeRoute === 'undefined' ) { return 0 }
  if(exchangeRoute.exchange.name === 'uniswap_v3') {
    return 2 // push
  } else if(exchangeRoute.exchange[blockchain].address === Blockchains[blockchain].wrapped.address) {
    return 0 // do nothing
  } else {
    return 1 // pull
  }
}

const getExchangeCallData = ({ exchangeTransaction })=>{
  const contract = new ethers.Contract(exchangeTransaction.to, exchangeTransaction.api)
  const method = exchangeTransaction.method
  const params = exchangeTransaction.params
  
  let contractMethod
  let fragment
  fragment = contract.interface.fragments.find((fragment) => {
    return(
      fragment.name == method &&
      (fragment.inputs && params && typeof(params) === 'object' ? fragment.inputs.length == Object.keys(params).length : true)
    )
  })
  let paramsToEncode
  if(fragment.inputs.length === 1 && fragment.inputs[0].type === 'tuple') {
    contractMethod = method
    paramsToEncode = [params[fragment.inputs[0].name]]
  } else {
    contractMethod = `${method}(${fragment.inputs.map((input)=>input.type).join(',')})`
    paramsToEncode = fragment.inputs.map((input) => {
      if(input.type === 'tuple') {
        let tuple = {}
        input.components.forEach((component, index)=>{
          tuple[component.name] = params[input.name][index]
        })
        contractMethod = method
        return tuple
      } else {
        return params[input.name]
      }
    })
  }
  return contract.interface.encodeFunctionData(contractMethod, paramsToEncode)
}

const transactionParams = async ({ paymentRoute })=> {
  if(paymentRoute.directTransfer && !paymentRoute.fee) {
    if(paymentRoute.toToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
      return undefined
    } else { // standard token transfer
      return [paymentRoute.toAddress, paymentRoute.toAmount]
    }
  } else {
    const deadline = Math.ceil(new Date()/1000)+86400 // 1 day
    const exchangeRoute = paymentRoute.exchangeRoutes[0]
    const exchangeType = getExchangeType({ exchangeRoute, blockchain: paymentRoute.blockchain })
    const exchangeTransaction = !exchangeRoute ? undefined : await exchangeRoute.getTransaction({
      account: routers[paymentRoute.blockchain].address,
      inputTokenPushed: exchangeType === 2
    })
    const exchangeCallData = !exchangeTransaction ? Blockchains[paymentRoute.blockchain].zero : getExchangeCallData({ exchangeTransaction })
    return {
      payment: {
        amountIn: paymentRoute.fromAmount,
        paymentAmount: paymentRoute.toAmount,
        feeAmount: paymentRoute.feeAmount || 0,
        tokenInAddress: paymentRoute.fromToken.address,
        exchangeAddress: !exchangeRoute ? Blockchains[paymentRoute.blockchain].zero : exchangeRoute.exchange[paymentRoute.blockchain].router.address,
        tokenOutAddress: paymentRoute.toToken.address,
        paymentReceiverAddress: paymentRoute.toAddress,
        feeReceiverAddress: paymentRoute.fee ? paymentRoute.fee.receiver : Blockchains[paymentRoute.blockchain].zero,
        exchangeType: exchangeType,
        receiverType: 0,
        exchangeCallData: exchangeCallData,
        receiverCallData: Blockchains[paymentRoute.blockchain].zero,
        deadline,
      }
    }
  }
}

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
}

export {
  getTransaction
}
