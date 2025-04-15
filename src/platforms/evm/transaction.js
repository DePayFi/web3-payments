/*#if _EVM

import Token from '@depay/web3-tokens-evm'
import { request } from '@depay/web3-client-evm'

/*#elif _SVM

//#else */

import Token from '@depay/web3-tokens'
import { request } from '@depay/web3-client'

//#endif

import Blockchains from '@depay/web3-blockchains'
import routers from './routers'
import { ethers } from 'ethers'

const EXCHANGE_PROXIES = {
  'arbitrum': {
    [Blockchains.arbitrum.wrapped.address]: '0x7E655088214d0657251A51aDccE9109CFd23B5B5'
  },
  'avalanche': {
    [Blockchains.avalanche.wrapped.address]: '0x2d0a6275eaDa0d03226919ce6D93661E589B2d59'
  },
  'base': {
    [Blockchains.base.wrapped.address]: '0xD1711710843B125a6a01FfDF9b95fDc3064BeF7A'
  },
  'bsc': {
    [Blockchains.bsc.wrapped.address]: '0xeEb80d14abfB058AA78DE38813fe705c3e3b243E'
  },
  'ethereum': {
    [Blockchains.ethereum.wrapped.address]: '0x298f4980525594b3b982779cf74ba76819708D43'
  },
  'fantom': {
    [Blockchains.fantom.wrapped.address]: '0x2d0a6275eaDa0d03226919ce6D93661E589B2d59'
  },
  'gnosis': {
    [Blockchains.gnosis.wrapped.address]: '0x2d0a6275eaDa0d03226919ce6D93661E589B2d59'
  },
  'optimism': {
    [Blockchains.optimism.wrapped.address]: '0x69594057e2C0224deb1180c7a5Df9ec9d5B611B5'
  },
  'polygon': {
    [Blockchains.polygon.wrapped.address]: '0xaE59C9d3E055BdFAa583E169aA5Ebe395689476a'
  },
  'worldchain': {
    [Blockchains.worldchain.wrapped.address]: '0x2CA727BC33915823e3D05fe043d310B8c5b2dC5b'
  },
  'solana': {}
}

const getTransaction = async({ paymentRoute, options })=> {

  let deadline = options?.deadline || Math.ceil(new Date())+(1800*1000) // 30 minutes in ms (default)

  const transaction = {
    blockchain: paymentRoute.blockchain,
    to: transactionAddress({ paymentRoute, options }),
    api: transactionApi({ paymentRoute, options }),
    method: transactionMethod({ paymentRoute, options }),
    params: await transactionParams({ paymentRoute, options, deadline }),
    value: transactionValue({ paymentRoute })
  }

  transaction.deadline = deadline

  return transaction
}

const transactionAddress = ({ paymentRoute, options })=> {
  if(paymentRoute.directTransfer && !paymentRoute.fee && !paymentRoute.fee2 && options?.wallet?.name !== 'World App') {
    if(paymentRoute.toToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
      return paymentRoute.toAddress
    } else {
      return paymentRoute.toToken.address
    }
  } else {
    return routers[paymentRoute.blockchain].address
  }
}

const transactionApi = ({ paymentRoute, options })=> {
  if(paymentRoute.directTransfer && !paymentRoute.fee && !paymentRoute.fee2 && options?.wallet?.name !== 'World App') {
    if(paymentRoute.toToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
      return undefined
    } else {
      return Token[paymentRoute.blockchain].DEFAULT
    }
  } else {
    return routers[paymentRoute.blockchain].api
  }
}

const transactionMethod = ({ paymentRoute, options })=> {
  if(paymentRoute.directTransfer && !paymentRoute.fee && !paymentRoute.fee2 && options?.wallet?.name !== 'World App') {
    if(paymentRoute.toToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
      return undefined
    } else { // standard token transfer
      return 'transfer'
    }
  } else {
    return 'pay'
  }
}

const getExchangeType = ({ exchangeRoute, blockchain })=> {
  if( typeof exchangeRoute === 'undefined' ) { return 0 }
  if(exchangeRoute.exchange[blockchain].router.address === Blockchains[blockchain].wrapped.address) {
    return 2 // push
  } else {
    return 1 // pull
  }
}

const getExchangeCallData = ({ exchangeTransaction })=>{
  const contract = new ethers.Contract(exchangeTransaction.to, exchangeTransaction.api)
  const method = exchangeTransaction.method
  const params = exchangeTransaction.params
  
  let contractMethod
  let fragment
  fragment = contract.interface.fragments.find((fragment) => {
    return(
      fragment.name == method &&
      (fragment.inputs && params && typeof(params) === 'object' ? fragment.inputs.length == Object.keys(params).length : true)
    )
  })
  let paramsToEncode
  if(fragment.inputs.length === 1 && fragment.inputs[0].type === 'tuple') {
    contractMethod = method
    paramsToEncode = [params[fragment.inputs[0].name]]
  } else {
    contractMethod = `${method}(${fragment.inputs.map((input)=>input.type).join(',')})`
    paramsToEncode = fragment.inputs.map((input) => {
      if(input.type === 'tuple') {
        let tuple = {}
        input.components.forEach((component, index)=>{
          tuple[component.name] = params[input.name][index]
        })
        contractMethod = method
        return tuple
      } else {
        return params[input.name]
      }
    })
  }
  return contract.interface.encodeFunctionData(contractMethod, paramsToEncode)
}

const getPermit2SignatureTransferNonce = async({ address, blockchain })=>{
        
  const getBitmap = (address, word)=>request({
    blockchain: blockchain,
    address: Blockchains[blockchain].permit2,
    api: [{"inputs":[{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"AllowanceExpired","type":"error"},{"inputs":[],"name":"ExcessiveInvalidation","type":"error"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"uint256","name":"maxAmount","type":"uint256"}],"name":"InvalidAmount","type":"error"},{"inputs":[],"name":"InvalidContractSignature","type":"error"},{"inputs":[],"name":"InvalidNonce","type":"error"},{"inputs":[],"name":"InvalidSignature","type":"error"},{"inputs":[],"name":"InvalidSignatureLength","type":"error"},{"inputs":[],"name":"InvalidSigner","type":"error"},{"inputs":[],"name":"LengthMismatch","type":"error"},{"inputs":[{"internalType":"uint256","name":"signatureDeadline","type":"uint256"}],"name":"SignatureExpired","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint160","name":"amount","type":"uint160"},{"indexed":false,"internalType":"uint48","name":"expiration","type":"uint48"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"address","name":"spender","type":"address"}],"name":"Lockdown","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint48","name":"newNonce","type":"uint48"},{"indexed":false,"internalType":"uint48","name":"oldNonce","type":"uint48"}],"name":"NonceInvalidation","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint160","name":"amount","type":"uint160"},{"indexed":false,"internalType":"uint48","name":"expiration","type":"uint48"},{"indexed":false,"internalType":"uint48","name":"nonce","type":"uint48"}],"name":"Permit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"word","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"mask","type":"uint256"}],"name":"UnorderedNonceInvalidation","type":"event"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"uint48","name":"expiration","type":"uint48"},{"internalType":"uint48","name":"nonce","type":"uint48"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"uint48","name":"expiration","type":"uint48"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint48","name":"newNonce","type":"uint48"}],"name":"invalidateNonces","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"wordPos","type":"uint256"},{"internalType":"uint256","name":"mask","type":"uint256"}],"name":"invalidateUnorderedNonces","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"internalType":"struct IAllowanceTransfer.TokenSpenderPair[]","name":"approvals","type":"tuple[]"}],"name":"lockdown","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"nonceBitmap","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"uint48","name":"expiration","type":"uint48"},{"internalType":"uint48","name":"nonce","type":"uint48"}],"internalType":"struct IAllowanceTransfer.PermitDetails[]","name":"details","type":"tuple[]"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"sigDeadline","type":"uint256"}],"internalType":"struct IAllowanceTransfer.PermitBatch","name":"permitBatch","type":"tuple"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"uint48","name":"expiration","type":"uint48"},{"internalType":"uint48","name":"nonce","type":"uint48"}],"internalType":"struct IAllowanceTransfer.PermitDetails","name":"details","type":"tuple"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"sigDeadline","type":"uint256"}],"internalType":"struct IAllowanceTransfer.PermitSingle","name":"permitSingle","type":"tuple"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct ISignatureTransfer.TokenPermissions","name":"permitted","type":"tuple"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct ISignatureTransfer.PermitTransferFrom","name":"permit","type":"tuple"},{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"requestedAmount","type":"uint256"}],"internalType":"struct ISignatureTransfer.SignatureTransferDetails","name":"transferDetails","type":"tuple"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permitTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct ISignatureTransfer.TokenPermissions[]","name":"permitted","type":"tuple[]"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct ISignatureTransfer.PermitBatchTransferFrom","name":"permit","type":"tuple"},{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"requestedAmount","type":"uint256"}],"internalType":"struct ISignatureTransfer.SignatureTransferDetails[]","name":"transferDetails","type":"tuple[]"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permitTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct ISignatureTransfer.TokenPermissions","name":"permitted","type":"tuple"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct ISignatureTransfer.PermitTransferFrom","name":"permit","type":"tuple"},{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"requestedAmount","type":"uint256"}],"internalType":"struct ISignatureTransfer.SignatureTransferDetails","name":"transferDetails","type":"tuple"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes32","name":"witness","type":"bytes32"},{"internalType":"string","name":"witnessTypeString","type":"string"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permitWitnessTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct ISignatureTransfer.TokenPermissions[]","name":"permitted","type":"tuple[]"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct ISignatureTransfer.PermitBatchTransferFrom","name":"permit","type":"tuple"},{"components":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"requestedAmount","type":"uint256"}],"internalType":"struct ISignatureTransfer.SignatureTransferDetails[]","name":"transferDetails","type":"tuple[]"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"bytes32","name":"witness","type":"bytes32"},{"internalType":"string","name":"witnessTypeString","type":"string"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"permitWitnessTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"address","name":"token","type":"address"}],"internalType":"struct IAllowanceTransfer.AllowanceTransferDetails[]","name":"transferDetails","type":"tuple[]"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"address","name":"token","type":"address"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"}],
    method: 'nonceBitmap',
    params: [address, word]
  })

  const getFirstUnsetBit = (bitmap)=>{
    for (let i = 0; i < 256; i++) {
      if (bitmap.shr(i).and(1).eq(0)) {
        return i
      }
    }
    return -1
  }

  function buildNonce(word, bitPos) {
    return ethers.BigNumber.from(word).mul(256).add(bitPos)
  }

  let word = 0

  while(word < 1) {
    const bitmap = await getBitmap(address, word)
    if(bitmap.toString() != Blockchains[blockchain].maxInt) {
      const bitPos = getFirstUnsetBit(bitmap)
      if (bitPos >= 0) {
        // Build and return the nonce
        const nonce = buildNonce(word, bitPos)
        return nonce
      }
    }
    word = word+1;
  }
}

const transactionParams = async ({ paymentRoute, options, deadline })=> {
  if(paymentRoute.directTransfer && !paymentRoute.fee && !paymentRoute.fee2 && options?.wallet?.name !== 'World App') {
    if(paymentRoute.toToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
      return undefined
    } else { // standard token transfer
      return [paymentRoute.toAddress, paymentRoute.toAmount]
    }
  } else {
    const exchangeRoute = paymentRoute.exchangeRoutes[0]
    const exchangeType = getExchangeType({ exchangeRoute, blockchain: paymentRoute.blockchain })
    const exchangeTransaction = !exchangeRoute ? undefined : await exchangeRoute.getTransaction({
      account: routers[paymentRoute.blockchain].address,
      inputTokenPushed: exchangeType === 2
    })
    const exchangeCallData = !exchangeTransaction ? Blockchains[paymentRoute.blockchain].zero : getExchangeCallData({ exchangeTransaction })
    let exchangeAddress = Blockchains[paymentRoute.blockchain].zero
    if (exchangeRoute) {
      if(
        paymentRoute.blockchain === 'bsc' &&
        exchangeRoute.exchange.name === 'pancakeswap_v3' &&
        paymentRoute.toToken.address === Blockchains[paymentRoute.blockchain].currency.address
      ) {
        // bsc pancakeswap_v3 requries smart router exchange address for converting and paying out BNB/NATIVE
        exchangeAddress = exchangeRoute.exchange[paymentRoute.blockchain].smartRouter.address
      } else { // proxy exchange or exchange directly
        exchangeAddress = EXCHANGE_PROXIES[exchangeTransaction.blockchain][exchangeRoute.exchange[paymentRoute.blockchain].router.address] || exchangeRoute.exchange[paymentRoute.blockchain].router.address
      }
    }
    let params
    if(options && options?.wallet?.name === 'World App' && paymentRoute.blockchain === 'worldchain'){
      
      const permitDeadline = Math.floor(Date.now() / 1000) + 30 * 60 // 60 minutes in seconds (default)
      const nonce = await getPermit2SignatureTransferNonce({ blockchain: paymentRoute.blockchain, address: paymentRoute.fromAddress })
      
      const permitTransfer = {
        permitted: {
          token: paymentRoute.fromToken.address,
          amount: paymentRoute.fromAmount.toString(),
        },
        nonce: nonce.toString(),
        deadline: permitDeadline.toString(),
      }

      params = {
        args: [
          [ // payment
            paymentRoute.fromAmount.toString(), // amountIn
            paymentRoute.toAmount.toString(), // paymentAmount
            (paymentRoute.feeAmount || 0).toString(), // feeAmount
            (paymentRoute.feeAmount2 || 0).toString(), // feeAmount
            (paymentRoute.protocolFeeAmount || 0).toString(), // protocolAmount
            deadline.toString(), // deadline
            paymentRoute.fromToken.address, // tokenInAddress
            exchangeAddress, // exchangeAddress
            paymentRoute.toToken.address, // tokenOutAddress
            paymentRoute.toAddress, // paymentReceiverAddress
            paymentRoute.fee ? paymentRoute.fee.receiver : Blockchains[paymentRoute.blockchain].zero, // feeReceiverAddress
            paymentRoute.fee2 ? paymentRoute.fee2.receiver : Blockchains[paymentRoute.blockchain].zero, // feeReceiverAddress2
            exchangeType, // exchangeType
            0, // receiverType
            true, // permit2
            exchangeCallData, // exchangeCallData
            '0x', // receiverCallData
          ],
          [ // permitTransferFromAndSignature
            [ // permitTransferFrom
              [ // permitted
                paymentRoute.fromToken.address, // token
                paymentRoute.fromAmount.toString() // amount
              ],
              nonce.toString(), // nonce
              permitDeadline.toString() // deadline
            ],
            "PERMIT2_SIGNATURE_PLACEHOLDER_0"
          ]
        ],
        permit2: {
          ...permitTransfer,
          spender: routers[paymentRoute.blockchain].address,
        },
      }

    } else {

      params = {
        payment: {
          amountIn: paymentRoute.fromAmount,
          paymentAmount: paymentRoute.toAmount,
          feeAmount: (paymentRoute.feeAmount || 0).toString(),
          feeAmount2: (paymentRoute.feeAmount2 || 0).toString(),
          protocolAmount: (paymentRoute.protocolFeeAmount || 0).toString(),
          tokenInAddress: paymentRoute.fromToken.address,
          exchangeAddress,
          tokenOutAddress: paymentRoute.toToken.address,
          paymentReceiverAddress: paymentRoute.toAddress,
          feeReceiverAddress: paymentRoute.fee ? paymentRoute.fee.receiver : Blockchains[paymentRoute.blockchain].zero,
          feeReceiverAddress2: paymentRoute.fee2 ? paymentRoute.fee2.receiver : Blockchains[paymentRoute.blockchain].zero,
          exchangeType: exchangeType,
          receiverType: 0,
          exchangeCallData: exchangeCallData,
          receiverCallData: Blockchains[paymentRoute.blockchain].zero,
          deadline,
        }
      }

      if(options?.signature) {

        params = [
          {...params.payment, permit2: true},
          { // permitTransferFromAndSignature
            permitTransferFrom: {
               permitted: {
                token: paymentRoute.fromToken.address,
                amount: paymentRoute.fromAmount.toString(),
              },
              nonce: options.signatureNonce,
              deadline: options.signatureDeadline
            },
            signature: options.signature
          }
        ]

      }
    }

    return params
  }
}

const transactionValue = ({ paymentRoute })=> {
  if(paymentRoute.fromToken.address == Blockchains[paymentRoute.blockchain].currency.address) {
    if(!paymentRoute.directTransfer) {
      return paymentRoute.fromAmount.toString()
    } else { // direct payment
      return paymentRoute.toAmount.toString()
    }
  } else {
    return ethers.BigNumber.from('0').toString()
  }
}

export {
  getTransaction,
  getPermit2SignatureTransferNonce,
}
