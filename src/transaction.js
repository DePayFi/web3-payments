/*#if _EVM

import { Token } from '@depay/web3-tokens-evm'

/*#elif _SOLANA

import { Token } from '@depay/web3-tokens-solana'

//#else */

import { Token } from '@depay/web3-tokens'

//#endif

import Blockchains from '@depay/web3-blockchains'
import plugins from './plugins'
import routers from './routers'
import { ethers } from 'ethers'

let getTransaction = async({ paymentRoute, event, fee })=> {
  let exchangeRoute = paymentRoute.exchangeRoutes[0]

  let transaction = {
    blockchain: paymentRoute.blockchain,
    to: transactionAddress({ paymentRoute, fee }),
    api: transactionApi({ paymentRoute, fee }),
    method: transactionMethod({ paymentRoute, fee }),
    params: transactionParams({ paymentRoute, exchangeRoute, event, fee }),
    value: transactionValue({ paymentRoute, exchangeRoute })
  }

  if(exchangeRoute) {
    if(paymentRoute.exchangePlugin && paymentRoute.exchangePlugin.prepareTransaction) {
      transaction = paymentRoute.exchangePlugin.prepareTransaction(transaction)
    }
  }

  return transaction
}

let transactionAddress = ({ paymentRoute, fee })=> {
  if(paymentRoute.directTransfer && !fee) {
    if(paymentRoute.toToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
      return paymentRoute.toAddress
    } else {
      return paymentRoute.toToken.address
    }
  } else {
    return routers[paymentRoute.blockchain].address
  }
}

let transactionApi = ({ paymentRoute, fee })=> {
  if(paymentRoute.directTransfer && !fee) {
    if(paymentRoute.toToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
      return undefined
    } else {
      return Token[paymentRoute.blockchain].DEFAULT
    }
  } else {
    return routers[paymentRoute.blockchain].api
  }
}

let transactionMethod = ({ paymentRoute, fee })=> {
  if(paymentRoute.directTransfer && !fee) {
    if(paymentRoute.toToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
      return undefined
    } else {
      return 'transfer'
    }
  } else {
    return 'route'
  }
}

let transactionParams = ({ paymentRoute, exchangeRoute, event, fee })=> {
  if(paymentRoute.directTransfer && !fee) {
    if(paymentRoute.toToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
      return undefined
    } else {
      return [paymentRoute.toAddress, paymentRoute.toAmount]
    }
  } else {
    return {
      path: transactionPath({ paymentRoute, exchangeRoute }),
      amounts: transactionAmounts({ paymentRoute, exchangeRoute, fee }),
      addresses: transactionAddresses({ paymentRoute, fee }),
      plugins: transactionPlugins({ paymentRoute, exchangeRoute, event, fee }),
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

let transactionAmounts = ({ paymentRoute, exchangeRoute, fee })=> {
  let amounts
  if(exchangeRoute) {
    if(exchangeRoute && exchangeRoute.exchange.wrapper) {
      amounts = [
        exchangeRoute.amountIn.toString(),
        subtractFee({ amount: exchangeRoute.amountOutMin.toString(), paymentRoute, fee })
      ]
    } else {
      amounts = [
        exchangeRoute.amountIn.toString(),
        subtractFee({ amount: exchangeRoute.amountOutMin.toString(), paymentRoute, fee }),
        Math.round(Date.now() / 1000) + 30 * 60, // 30 minutes
      ]
    }
  } else {
    amounts = [
      paymentRoute.toAmount, // from
      subtractFee({ amount: paymentRoute.toAmount, paymentRoute, fee }) // to
    ]
  }
  if(fee){
    amounts[4] = transactionFeeAmount({ paymentRoute, fee })
  }
  for(var i = 0; i < amounts.length; i++) {
    if(amounts[i] == undefined){ amounts[i] = '0' }
  }
  return amounts
}

let subtractFee = ({ amount, paymentRoute, fee })=> {
  if(fee) {
    let feeAmount = transactionFeeAmount({ paymentRoute, fee })
    return ethers.BigNumber.from(amount).sub(feeAmount).toString()
  } else {
    return amount
  }
}

let transactionFeeAmount = ({ paymentRoute, fee })=> {
  if(typeof fee.amount == 'string' && fee.amount.match('%')) {
    return ethers.BigNumber.from(paymentRoute.toAmount).mul(parseFloat(fee.amount)*10).div(1000).toString()
  } else if(typeof fee.amount == 'string') {
    return fee.amount
  } else if(typeof fee.amount == 'number') {
    return ethers.utils.parseUnits(fee.amount.toString(), paymentRoute.toDecimals).toString()
  } else {
    throw('Unknown fee amount type!')
  }
}

let transactionAddresses = ({ paymentRoute, fee })=> {
  if(fee) {
    return [paymentRoute.fromAddress, fee.receiver, paymentRoute.toAddress]
  } else {
    return [paymentRoute.fromAddress, paymentRoute.toAddress]
  }
}

let transactionPlugins = ({ paymentRoute, exchangeRoute, event, fee })=> {
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

  if(fee) {
    if(event == 'ifRoutedAndNative' && !paymentRoute.directTransfer && paymentRoute.toToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
      paymentPlugins.push(plugins[paymentRoute.blockchain].paymentFeeWithEvent.address)
    } else {
      paymentPlugins.push(plugins[paymentRoute.blockchain].paymentFee.address)
    }
  }

  return paymentPlugins
}

let transactionValue = ({ paymentRoute, exchangeRoute })=> {
  if(paymentRoute.fromToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
    if(exchangeRoute) {
      return exchangeRoute.amountIn.toString()
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
