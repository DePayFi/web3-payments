import plugins from './plugins'
import routers from './routers'
import { CONSTANTS } from 'depay-web3-constants'
import { ethers } from 'ethers'
import { Token } from 'depay-web3-tokens'
import { Transaction } from 'depay-web3-transaction'

let routeToTransaction = ({ paymentRoute })=> {
  let exchangeRoute = paymentRoute.exchangeRoutes[0]

  let transaction = new Transaction({
    blockchain: paymentRoute.blockchain,
    address: transactionAddress({ paymentRoute }),
    api: transactionApi({ paymentRoute }),
    method: transactionMethod({ paymentRoute }),
    params: transactionParams({ paymentRoute, exchangeRoute }),
    value: transactionValue({ paymentRoute, exchangeRoute })
  })

  if(exchangeRoute) {
    let exchangePlugin = plugins[paymentRoute.blockchain][exchangeRoute.exchange.name]
    if(exchangePlugin) {
      transaction = exchangePlugin.prepareTransaction(transaction)
    }
  }
  return transaction
}

let transactionAddress = ({ paymentRoute })=> {
  if(paymentRoute.directTransfer) {
    if(paymentRoute.toToken.address == CONSTANTS[paymentRoute.blockchain].NATIVE) {
      return paymentRoute.toAddress
    } else {
      return paymentRoute.toToken.address
    }
  } else {
    return routers[paymentRoute.blockchain].address
  }
}

let transactionApi = ({ paymentRoute })=> {
  if(paymentRoute.directTransfer) {
    if(paymentRoute.toToken.address == CONSTANTS[paymentRoute.blockchain].NATIVE) {
      return undefined
    } else {
      return Token[paymentRoute.blockchain].DEFAULT
    }
  } else {
    return routers[paymentRoute.blockchain].api
  }
}

let transactionMethod = ({ paymentRoute })=> {
  if(paymentRoute.directTransfer) {
    if(paymentRoute.toToken.address == CONSTANTS[paymentRoute.blockchain].NATIVE) {
      return undefined
    } else {
      return 'transfer'
    }
  } else {
    return 'route'
  }
}

let transactionParams = ({ paymentRoute, exchangeRoute })=> {
  if(paymentRoute.directTransfer) {
    if(paymentRoute.toToken.address == CONSTANTS[paymentRoute.blockchain].NATIVE) {
      return undefined
    } else {
      return [paymentRoute.toAddress, paymentRoute.toAmount]
    }
  } else {
    return {
      path: transactionPath({ paymentRoute, exchangeRoute }),
      amounts: transactionAmounts({ paymentRoute, exchangeRoute }),
      addresses: transactionAddresses({ paymentRoute }),
      plugins: transactionPlugins({ paymentRoute, exchangeRoute }),
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

let transactionAmounts = ({ paymentRoute, exchangeRoute })=> {
  if(exchangeRoute) {
    return [
      exchangeRoute.amountIn,
      exchangeRoute.amountOutMin,
      exchangeRoute.transaction.params.deadline
    ]
  } else {
    return [paymentRoute.toAmount]
  }
}

let transactionAddresses = ({ paymentRoute })=> {
  return [paymentRoute.fromAddress, paymentRoute.toAddress]
}

let transactionPlugins = ({ paymentRoute, exchangeRoute })=> {
  if(exchangeRoute) {
    return [
      plugins[paymentRoute.blockchain][exchangeRoute.exchange.name].address,
      plugins[paymentRoute.blockchain].payment.address
    ]
  } else {
    return [
      plugins[paymentRoute.blockchain].payment.address
    ]
  }
}

let transactionValue = ({ paymentRoute, exchangeRoute })=> {
  if(paymentRoute.fromToken.address == CONSTANTS[paymentRoute.blockchain].NATIVE) {
    if(exchangeRoute) {
      return exchangeRoute.amountIn
    } else { // direct payment
      return paymentRoute.toAmount
    }
  } else {
    return ethers.BigNumber.from('0')
  }
}

export {
  routeToTransaction
}
