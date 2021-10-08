import plugins from './plugins'
import routers from './routers'
import { CONSTANTS } from 'depay-web3-constants'
import { ethers } from 'ethers'
import { Token } from 'depay-web3-tokens'

let getTransaction = ({ paymentRoute, event })=> {
  let exchangeRoute = paymentRoute.exchangeRoutes[0]

  let transaction = {
    blockchain: paymentRoute.blockchain,
    to: transactionAddress({ paymentRoute }),
    api: transactionApi({ paymentRoute }),
    method: transactionMethod({ paymentRoute }),
    params: transactionParams({ paymentRoute, exchangeRoute, event }),
    value: transactionValue({ paymentRoute, exchangeRoute })
  }

  if(exchangeRoute) {
    if(paymentRoute.exchangePlugin) {
      transaction = paymentRoute.exchangePlugin.prepareTransaction(transaction)
    }
  }

  if(paymentRoute.contractCallPlugin) {
    transaction = paymentRoute.contractCallPlugin.prepareTransaction(transaction, paymentRoute.toContract)
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

let transactionParams = ({ paymentRoute, exchangeRoute, event })=> {
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

let transactionAmounts = ({ paymentRoute, exchangeRoute })=> {
  if(exchangeRoute) {
    return [
      exchangeRoute.amountIn.toString(),
      exchangeRoute.amountOutMin.toString(),
      exchangeRoute.transaction.params.deadline
    ]
  } else {
    return [paymentRoute.toAmount, paymentRoute.toAmount]
  }
}

let transactionAddresses = ({ paymentRoute })=> {
  return [paymentRoute.fromAddress, paymentRoute.toAddress]
}

let transactionPlugins = ({ paymentRoute, exchangeRoute, event })=> {
  let paymentPlugins = []

  if(exchangeRoute) {
    paymentRoute.exchangePlugin = plugins[paymentRoute.blockchain][exchangeRoute.exchange.name]
    paymentPlugins.push(paymentRoute.exchangePlugin.address)
  }

  if(paymentRoute.toContract) {
    let signature = paymentRoute.toContract.signature.match(/\(.*\)/)
    if(signature && signature?.length) {
      signature = signature[0].replace(/[\(\)]/g, '')
      let splitSignature = signature.split(',')
      if(splitSignature[0] == 'address' && splitSignature[1].match('uint') && splitSignature[2] == 'bool' && Number.isNaN(parseInt(paymentRoute.toContract.params[0]))) {
        paymentRoute.contractCallPlugin = plugins[paymentRoute.blockchain].contractCall.approveAndCallContractAddressAmountBoolean
      } else if(splitSignature[0] == 'address' && splitSignature[1].match('uint') && splitSignature[2] == 'bool' && !Number.isNaN(parseInt(paymentRoute.toContract.params[0]))) {
        paymentRoute.contractCallPlugin = plugins[paymentRoute.blockchain].contractCall.approveAndCallContractAddressPassedAmountBoolean
      } else {
        throw('No payment plugins exists to pay into contract with signature:', signature)
      }
      paymentPlugins.push(paymentRoute.contractCallPlugin.address)
    }
  } else if(event == 'ifSwapped' && !paymentRoute.directTransfer) {
    paymentPlugins.push(plugins[paymentRoute.blockchain].paymentWithEvent.address)
  } else {
    paymentPlugins.push(plugins[paymentRoute.blockchain].payment.address)
  }

  return paymentPlugins
}

let transactionValue = ({ paymentRoute, exchangeRoute })=> {
  if(paymentRoute.fromToken.address == CONSTANTS[paymentRoute.blockchain].NATIVE) {
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
