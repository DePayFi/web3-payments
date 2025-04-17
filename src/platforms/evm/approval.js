/*#if _EVM

import Token from '@depay/web3-tokens-evm'

/*#elif _SVM

import Token from '@depay/web3-tokens-svm'

//#else */

import Token from '@depay/web3-tokens'

//#endif

import Blockchains from '@depay/web3-blockchains'
import routers from './routers'
import { getPermit2SignatureTransferNonce } from './transaction'

const getRouterApprovalTransaction = async({ paymentRoute, options })=> {
  return({
    blockchain: paymentRoute.blockchain,
    to: paymentRoute.fromToken.address,
    api: Token[paymentRoute.blockchain].DEFAULT,
    method: 'approve',
    params: [routers[paymentRoute.blockchain].address, (options?.amount || Blockchains[paymentRoute.blockchain].maxInt)]
  })
}

const getPermit2ApprovalTransaction = async({ paymentRoute, options })=> {
  return({
    blockchain: paymentRoute.blockchain,
    to: paymentRoute.fromToken.address,
    api: Token[paymentRoute.blockchain].DEFAULT,
    method: 'approve',
    params: [Blockchains[paymentRoute.blockchain].permit2, (options?.amount || Blockchains[paymentRoute.blockchain].maxInt)]
  })
}

const getPermit2ApprovalSignature = async({ paymentRoute, options })=> {

  const domain = {
    name: "Permit2",
    chainId: Blockchains[paymentRoute.blockchain].networkId,
    verifyingContract: Blockchains[paymentRoute.blockchain].permit2
  }

  const types = {
    TokenPermissions: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    EIP712Domain: [
      { name: "name", type: "string" }, 
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" }
    ],
    PermitTransferFrom: [
      { name: "permitted", type: "TokenPermissions" },
      { name: "spender", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" }
    ],
  }

  let deadline = options?.deadline || Math.ceil(new Date()/1000)+(3600) // 60 minutes in seconds (default)
  
  const nonce = await getPermit2SignatureTransferNonce({ blockchain: paymentRoute.blockchain, address: paymentRoute.fromAddress })

  const data = {
    permitted: {
      token: paymentRoute.fromToken.address,
      amount: paymentRoute.fromAmount.toString(),
    },
    spender: routers[paymentRoute.blockchain].address,
    nonce: nonce.toString(),
    deadline: deadline.toString()
  }

  return {
    domain,
    types,
    message: data,
    primaryType: "PermitTransferFrom"
  }
}

export {
  getRouterApprovalTransaction,
  getPermit2ApprovalTransaction,
  getPermit2ApprovalSignature,
}
