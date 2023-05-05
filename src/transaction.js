/*#if _EVM

import { getTransaction as evmGetTransaction } from './platforms/evm/transaction'
let solanaGetTransaction = ()=>{}

/*#elif _SOLANA

let evmGetTransaction = ()=>{}
import { getTransaction as solanaGetTransaction} from './platforms/solana/transaction'

//#else */

import { getTransaction as evmGetTransaction } from './platforms/evm/transaction'
import { getTransaction as solanaGetTransaction} from './platforms/solana/transaction'

//#endif

import { supported } from './blockchains'

const getTransaction = ({ paymentRoute, event, fee })=>{
  if(supported.evm.includes(paymentRoute.blockchain)) {
    return evmGetTransaction({ paymentRoute, event, fee })
  } else if(supported.solana.includes(paymentRoute.blockchain)) {
    return solanaGetTransaction({ paymentRoute, event, fee })
  } else {
    throw('Blockchain not supported!')
  }
}

export {
  getTransaction
}
