/*#if _EVM

import { getPermit2Signature as evmGetPermit2Signature } from './platforms/evm/permit2'

/*#elif _SOLANA

//#else */

import { getPermit2Signature as evmGetPermit2Signature } from './platforms/evm/permit2'

//#endif

import { supported } from './blockchains'

const getPermit2Signature = ({ paymentRoute })=>{
  if(supported.evm.includes(paymentRoute.blockchain)) {
    return evmGetPermit2Signature({ paymentRoute })
  } else if(supported.solana.includes(paymentRoute.blockchain)) {
    return
  } else {
    throw('Blockchain not supported!')
  }
}

export {
  getPermit2Signature
}
