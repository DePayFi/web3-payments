/*#if _EVM

import { Token } from '@depay/web3-tokens-evm'

/*#elif _SOLANA

//#else */

import { Token } from '@depay/web3-tokens'

//#endif

import Blockchains from '@depay/web3-blockchains'
import plugins from './plugins'
import routers from './routers'
import { ethers } from 'ethers'

let getTransaction = async({ paymentRoute, event })=> {
  let exchangeRoute = paymentRoute.exchangeRoutes[0]

  let transaction = {
    blockchain: paymentRoute.blockchain,
    to: transactionAddress({ paymentRoute }),
    api: transactionApi({ paymentRoute }),
    method: transactionMethod({ paymentRoute }),
    params: transactionParams({ paymentRoute, exchangeRoute, event }),
    value: transactionValue({ paymentRoute })
  }

  if(exchangeRoute) {
    if(paymentRoute.exchangePlugin && paymentRoute.exchangePlugin.prepareTransaction) {
      transaction = paymentRoute.exchangePlugin.prepareTransaction(transaction)
    }
  }

  return transaction
}

let transactionAddress = ({ paymentRoute })=> {
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

let transactionApi = ({ paymentRoute })=> {
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

let transactionMethod = ({ paymentRoute })=> {
  if(paymentRoute.directTransfer && !paymentRoute.fee) {
    if(paymentRoute.toToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
      return undefined
    } else {
      return 'transfer'
    }
  } else {
    return 'route'
  }
}

let transactionParams = ({ paymentRoute, exchangeRoute, event })=> {
  if(paymentRoute.directTransfer && !paymentRoute.fee) {
    if(paymentRoute.toToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
      return undefined
    } else {
      return [paymentRoute.toAddress, paymentRoute.toAmount]
    }
  } else {
    return {
      path: transactionPath({ paymentRoute, exchangeRoute }),
      amounts: getTransactionAmounts({ paymentRoute, exchangeRoute }),
      addresses: transactionAddresses({ paymentRoute }),
      plugins: transactionPlugins({ paymentRoute, exchangeRoute, event }),
      data: []
    }
  }
}

let transactionPath = ({ paymentRoute, exchangeRoute })=> {
  if(exchangeRoute) {
    return exchangeRoute.path
  } else {
    return [paymentRoute.toToken.address]
  }
}

let getTransactionAmounts = ({ paymentRoute, exchangeRoute })=> {
  let amounts
  if(exchangeRoute) {
    if(exchangeRoute && exchangeRoute.exchange.wrapper) {
      amounts = [ paymentRoute.fromAmount, paymentRoute.toAmount ]
    } else {
      amounts = [
        paymentRoute.fromAmount,
        paymentRoute.toAmount,
        Math.round(Date.now() / 1000) + 30 * 60, // 30 minutes
      ]
    }
  } else {
    amounts = [ paymentRoute.fromAmount, paymentRoute.toAmount ]
  }
  if(paymentRoute.fee){
    amounts[4] = paymentRoute.feeAmount
  }
  for(var i = 0; i < amounts.length; i++) {
    if(amounts[i] == undefined){ amounts[i] = '0' }
  }
  return amounts
}

let transactionAddresses = ({ paymentRoute })=> {
  if(paymentRoute.fee) {
    return [paymentRoute.fromAddress, paymentRoute.fee.receiver, paymentRoute.toAddress]
  } else {
    return [paymentRoute.fromAddress, paymentRoute.toAddress]
  }
}

let transactionPlugins = ({ paymentRoute, exchangeRoute, event })=> {
  let paymentPlugins = []

  if(exchangeRoute) {
    paymentRoute.exchangePlugin = plugins[paymentRoute.blockchain][exchangeRoute.exchange.name]
    if(paymentRoute.exchangePlugin.wrap && paymentRoute.fromToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
      paymentPlugins.push(paymentRoute.exchangePlugin.wrap.address)
    } else if(paymentRoute.exchangePlugin.wrap && paymentRoute.fromToken.address == Blockchains[paymentRoute.blockchain].wrapped.address) {
      paymentPlugins.push(paymentRoute.exchangePlugin.unwrap.address)
    } else {
      paymentPlugins.push(paymentRoute.exchangePlugin.address)
    }
  }

  if(event == 'ifSwapped' && !paymentRoute.directTransfer) {
    paymentPlugins.push(plugins[paymentRoute.blockchain].paymentWithEvent.address)
  } else if(event == 'ifRoutedAndNative' && !paymentRoute.directTransfer && paymentRoute.toToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
    paymentPlugins.push(plugins[paymentRoute.blockchain].paymentWithEvent.address)
  } else {
    paymentPlugins.push(plugins[paymentRoute.blockchain].payment.address)
  }

  if(paymentRoute.fee) {
    if(event == 'ifRoutedAndNative' && !paymentRoute.directTransfer && paymentRoute.toToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
      paymentPlugins.push(plugins[paymentRoute.blockchain].paymentFeeWithEvent.address)
    } else {
      paymentPlugins.push(plugins[paymentRoute.blockchain].paymentFee.address)
    }
  }

  return paymentPlugins
}

let transactionValue = ({ paymentRoute })=> {
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
  getTransaction,
  getTransactionAmounts
}
