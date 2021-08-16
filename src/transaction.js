import plugins from './plugins'
import routers from './routers'
import { CONSTANTS } from 'depay-web3-constants'
import { ethers } from 'ethers'
import { Transaction } from 'depay-web3-transaction'

let routeToTransaction = ({ paymentRoute })=> {
  let exchangePlugin
  let exchangeRoute = paymentRoute.exchangeRoutes[0]
  if(exchangeRoute) { exchangePlugin = plugins[paymentRoute.blockchain][exchangeRoute.exchange.name] }
  let transaction = new Transaction({
    blockchain: paymentRoute.blockchain,
    address: routers[paymentRoute.blockchain].address,
    api: routers[paymentRoute.blockchain].api,
    method: 'route',
    params: {
      path: transactionPath({ paymentRoute, exchangeRoute }),
      amounts: transactionAmounts({ paymentRoute, exchangeRoute }),
      addresses: transactionAddresses({ paymentRoute }),
      plugins: transactionPlugins({ paymentRoute, exchangeRoute }),
      data: []
    },
    value: transactionValue({ paymentRoute, exchangeRoute })
  })
  if(exchangeRoute && exchangePlugin) {
    transaction = exchangePlugin.prepareTransaction(transaction)
  }
  return transaction
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
