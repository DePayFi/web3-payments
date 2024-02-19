/*#if _EVM

import Token from '@depay/web3-tokens-evm'

/*#elif _SOLANA

//#else */

import Token from '@depay/web3-tokens'

//#endif

import Blockchains from '@depay/web3-blockchains'
import routers from './routers'
import { ethers } from 'ethers'

const EXCHANGE_PROXIES = {
  'arbitrum': {
    [Blockchains.arbitrum.wrapped.address]: '0x7E655088214d0657251A51aDccE9109CFd23B5B5'
  },
  'avalanche': {
    [Blockchains.avalanche.wrapped.address]: '0x2d0a6275eaDa0d03226919ce6D93661E589B2d59'
  },
  'base': {
    [Blockchains.base.wrapped.address]: '0xD1711710843B125a6a01FfDF9b95fDc3064BeF7A'
  },
  'bsc': {
    [Blockchains.bsc.wrapped.address]: '0xeEb80d14abfB058AA78DE38813fe705c3e3b243E'
  },
  'ethereum': {
    [Blockchains.ethereum.wrapped.address]: '0x298f4980525594b3b982779cf74ba76819708D43'
  },
  'fantom': {
    [Blockchains.fantom.wrapped.address]: '0x2d0a6275eaDa0d03226919ce6D93661E589B2d59'
  },
  'gnosis': {
    [Blockchains.gnosis.wrapped.address]: '0x2d0a6275eaDa0d03226919ce6D93661E589B2d59'
  },
  'optimism': {
    [Blockchains.optimism.wrapped.address]: '0x69594057e2C0224deb1180c7a5Df9ec9d5B611B5'
  },
  'polygon': {
    [Blockchains.polygon.wrapped.address]: '0xaE59C9d3E055BdFAa583E169aA5Ebe395689476a'
  },
  'solana': {}
}

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
  if(exchangeRoute.exchange.name === 'uniswap_v3' || exchangeRoute.exchange[blockchain].router.address === Blockchains[blockchain].wrapped.address) {
    return 2 // push
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
    const deadline = Math.ceil(new Date()/1000)+3600 // 1 hour
    const exchangeRoute = paymentRoute.exchangeRoutes[0]
    const exchangeType = getExchangeType({ exchangeRoute, blockchain: paymentRoute.blockchain })
    const exchangeTransaction = !exchangeRoute ? undefined : await exchangeRoute.getTransaction({
      account: routers[paymentRoute.blockchain].address,
      inputTokenPushed: exchangeType === 2
    })
    const exchangeCallData = !exchangeTransaction ? Blockchains[paymentRoute.blockchain].zero : getExchangeCallData({ exchangeTransaction })
    let exchangeAddress = Blockchains[paymentRoute.blockchain].zero
    if (exchangeRoute) {
      if(
        paymentRoute.blockchain === 'bsc' &&
        exchangeRoute.exchange.name === 'pancakeswap_v3' &&
        paymentRoute.toToken.address === Blockchains[paymentRoute.blockchain].currency.address
      ) {
        // bsc pancakeswap_v3 requries smart router exchange address for converting and paying out BNB/NATIVE
        exchangeAddress = exchangeRoute.exchange[paymentRoute.blockchain].smartRouter.address
      } else { // proxy exchange or exchange directly
        exchangeAddress = EXCHANGE_PROXIES[exchangeTransaction.blockchain][exchangeRoute.exchange[paymentRoute.blockchain].router.address] || exchangeRoute.exchange[paymentRoute.blockchain].router.address
      }
    }
    return {
      payment: {
        amountIn: paymentRoute.fromAmount,
        paymentAmount: paymentRoute.toAmount,
        feeAmount: paymentRoute.feeAmount || 0,
        tokenInAddress: paymentRoute.fromToken.address,
        exchangeAddress,
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
