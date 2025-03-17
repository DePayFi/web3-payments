/*#if _EVM

import { getTransaction as evmGetTransaction } from './platforms/evm/transaction'
let solanaGetTransaction = ()=>{}

/*#elif _SVM

let evmGetTransaction = ()=>{}
let evmGetTransactionAmounts = ()=>{}
import { getTransaction as solanaGetTransaction} from './platforms/svm/transaction'

//#else */

import { getTransaction as evmGetTransaction } from './platforms/evm/transaction'
import { getTransaction as solanaGetTransaction} from './platforms/svm/transaction'

//#endif

import { supported } from './blockchains'

const getTransaction = ({ paymentRoute, fee, options })=>{
  if(supported.evm.includes(paymentRoute.blockchain)) {
    return evmGetTransaction({ paymentRoute, fee, options })
  } else if(supported.solana.includes(paymentRoute.blockchain)) {
    return solanaGetTransaction({ paymentRoute, fee, options })
  } else {
    throw('Blockchain not supported!')
  }
}

export {
  getTransaction
}
