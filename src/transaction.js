import plugins from './plugins'
import routers from './routers'
import { CONSTANTS } from '@depay/web3-constants'
import { ethers } from 'ethers'
import { Token } from '@depay/web3-tokens'

let getTransaction = ({ paymentRoute, event, fee })=> {
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
    if(paymentRoute.exchangePlugin) {
      transaction = paymentRoute.exchangePlugin.prepareTransaction(transaction)
    }
  }

  if(paymentRoute.contractCallPlugin) {
    transaction = paymentRoute.contractCallPlugin.prepareTransaction(transaction, paymentRoute.toContract)
  }

  return transaction
}

let transactionAddress = ({ paymentRoute, fee })=> {
  if(paymentRoute.directTransfer && !fee) {
    if(paymentRoute.toToken.address == CONSTANTS[paymentRoute.blockchain].NATIVE) {
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
    if(paymentRoute.toToken.address == CONSTANTS[paymentRoute.blockchain].NATIVE) {
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
    if(paymentRoute.toToken.address == CONSTANTS[paymentRoute.blockchain].NATIVE) {
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
    if(paymentRoute.toToken.address == CONSTANTS[paymentRoute.blockchain].NATIVE) {
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
    amounts = [
      exchangeRoute.amountIn.toString(),
      subtractFee({ amount: exchangeRoute.amountOutMin.toString(), paymentRoute, fee }),
      exchangeRoute.transaction.params.deadline
    ]
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
    return ethers.BigNumber.from(paymentRoute.toAmount).div(100).mul(parseFloat(fee.amount)).toString()
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

  if(fee) {
    paymentPlugins.push(plugins[paymentRoute.blockchain].paymentFee.address)
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
