/*#if _EVM

import { 
  getRouterApprovalTransaction as evmGetRouterApprovalTransaction,
  getPermit2ApprovalTransaction as evmGetPermit2ApprovalTransaction,
  getPermit2ApprovalSignature as evmGetPermit2ApprovalSignature
} from './platforms/evm/approval'

/*#elif _SOLANA

let evmGetRouterApprovalTransaction = ()=>{}
let evmGetPermit2ApprovalTransaction = ()=>{}
let evmGetPermit2ApprovalTransaction = ()=>{}

//#else */

import { 
  getRouterApprovalTransaction as evmGetRouterApprovalTransaction,
  getPermit2ApprovalTransaction as evmGetPermit2ApprovalTransaction,
  getPermit2ApprovalSignature as evmGetPermit2ApprovalSignature
} from './platforms/evm/approval'

//#endif

import { supported } from './blockchains'

const getRouterApprovalTransaction = ({ paymentRoute, options })=>{
  if(supported.evm.includes(paymentRoute.blockchain)) {
    return evmGetRouterApprovalTransaction({ paymentRoute, options })
  } else if(supported.solana.includes(paymentRoute.blockchain)) {
  } else {
    throw('Blockchain not supported!')
  }
}

const getPermit2ApprovalTransaction = ({ paymentRoute, options })=>{
  if(supported.evm.includes(paymentRoute.blockchain)) {
    return evmGetPermit2ApprovalTransaction({ paymentRoute, options })
  } else if(supported.solana.includes(paymentRoute.blockchain)) {
  } else {
    throw('Blockchain not supported!')
  }
}

const getPermit2ApprovalSignature = ({ paymentRoute, options })=>{
  if(supported.evm.includes(paymentRoute.blockchain)) {
    return evmGetPermit2ApprovalTransaction({ paymentRoute, options })
  } else if(supported.solana.includes(paymentRoute.blockchain)) {
  } else {
    throw('Blockchain not supported!')
  }
}

export {
  getRouterApprovalTransaction,
  getPermit2ApprovalTransaction,
  getPermit2ApprovalSignature,
}
