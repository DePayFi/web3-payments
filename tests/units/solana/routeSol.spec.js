import Blockchains from '@depay/web3-blockchains'
import fetchMock from 'fetch-mock'
import { mock, resetMocks } from '@depay/web3-mock'
import { mockAssets } from 'tests/mocks/api'
import { struct, u32, u64, PublicKey, SystemProgram } from '@depay/solana-web3.js'
import { resetCache, getProvider } from '@depay/web3-client'
import { route, routers } from 'src'
import { mockBasics, getPaymentsAccountPublicKey, mockPaymentsAccount } from '../../mocks/solana'

describe('routeSol', ()=> {

  const blockchain = 'solana'
  const fromAddress = '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1'
  const toAddress = '5AcFMJZkXo14r3Hj99iYd1HScPiM4hAcLZf552DfZkxa'
  const feeReceiverAddress = '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk'
  const accounts = [fromAddress]
  const toToken = Blockchains.solana.currency.address
  const tokenAmountOut = 0.000001

  let provider

  beforeEach(async()=>{
    resetMocks()
    resetCache()
    fetchMock.reset()
    provider = await getProvider('solana')
    mock({ provider, blockchain, accounts: { return: accounts } })
    mockAssets({ blockchain, account: fromAddress, assets: [
      {
        "name": "Solana",
        "symbol": "SOL",
        "address": Blockchains.solana.currency.address,
        "type": "NATIVE",
        "decimals": Blockchains.solana.currency.decimals
      }
    ]})
    await mockBasics({ provider, fromAddress, toAddress, feeReceiverAddress })
    mock({ provider, blockchain, balance: { for: fromAddress, return: 1100000000 } })
  })

  it('routes a SOL payment', async ()=>{

    let routes = await route({
      accept: [{
        blockchain,
        token: toToken,
        amount: tokenAmountOut,
        toAddress,
      }],
      from: { [blockchain]: fromAddress }
    })

    expect(routes.length).toEqual(1)
    expect(routes[0].blockchain).toEqual('solana')
    expect(routes[0].fromAddress).toEqual(fromAddress)
    expect(routes[0].fromToken.address).toEqual(Blockchains.solana.currency.address)
    expect(routes[0].fromAmount).toEqual('1000')
    expect(routes[0].fromDecimals).toEqual(9)
    expect(routes[0].fromBalance).toEqual('1100000000')
    expect(routes[0].toToken.address).toEqual(Blockchains.solana.currency.address)
    expect(routes[0].toAmount).toEqual('1000')
    expect(routes[0].toDecimals).toEqual(9)
    expect(routes[0].toAddress).toEqual(toAddress)
    expect(routes[0].fee).toEqual(undefined)
    expect(routes[0].feeAmount).toEqual(undefined)
    expect(routes[0].exchangeRoutes).toEqual([])
    expect(routes[0].approvalRequired).toEqual(false)
    expect(routes[0].approvalTransaction).toEqual(undefined)
    expect(routes[0].directTransfer).toEqual(true)

    let transaction = await routes[0].getTransaction()
    expect(transaction.blockchain).toEqual('solana')
    expect(transaction.signers.length).toEqual(0)
    expect(transaction.alts).toEqual(['EYGgx5fYCZtLN2pvnR4Bhn5KpMffKwyHCms4VhjSvF2K'])
    expect(transaction.instructions.length).toEqual(3)

    // create payments account
    let createPaymentsAccountInstructionData = routers.solana.api.createPaymentsAccount.layout.decode(transaction.instructions[0].data)
    expect(createPaymentsAccountInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.createPaymentsAccount.anchorDiscriminator.toString())
    expect(transaction.instructions[0].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[0].keys.length).toEqual(3)
    expect(transaction.instructions[0].keys[0]).toEqual({ pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false })
    expect(transaction.instructions[0].keys[1]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[0].keys[2]).toEqual({ pubkey: await getPaymentsAccountPublicKey({ fromAddress }), isSigner: false, isWritable: true })

    // create receiver account
    let transferToReceiverInstructionData = struct([ u32('instruction'), u64('amount') ]).decode(transaction.instructions[1].data)
    expect(transferToReceiverInstructionData.amount.toString()).toEqual('889880')
    expect(transaction.instructions[1].programId.toString()).toEqual(SystemProgram.programId.toString())
    expect(transaction.instructions[1].keys.length).toEqual(2)
    expect(transaction.instructions[1].keys[0]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[1].keys[1]).toEqual({ pubkey: new PublicKey(toAddress), isSigner: false, isWritable: true })
    
    // route payment
    let routeSolPaymentInstructionData = routers.solana.api.routeSol.layout.decode(transaction.instructions[2].data)
    expect(routeSolPaymentInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.routeSol.anchorDiscriminator.toString())
    expect(routeSolPaymentInstructionData.nonce.toString()).toEqual('0')
    expect(routeSolPaymentInstructionData.paymentAmount.toString()).toEqual('1000')
    expect(routeSolPaymentInstructionData.feeAmount.toString()).toEqual('0')
    expect(transaction.instructions[2].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[2].keys.length).toEqual(5)
    expect(transaction.instructions[2].keys[0]).toEqual({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false })
    expect(transaction.instructions[2].keys[1]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[2].keys[2]).toEqual({ pubkey: await getPaymentsAccountPublicKey({ fromAddress }), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[3]).toEqual({ pubkey: new PublicKey(toAddress), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[4]).toEqual({ pubkey: new PublicKey(toAddress), isSigner: false, isWritable: true })

  })

  it('routes a SOL payment with fee', async ()=>{

    let routes = await route({
      accept: [{
        blockchain,
        token: toToken,
        amount: tokenAmountOut,
        toAddress,
        fee: {
          amount: '1%',
          receiver: feeReceiverAddress,
        }
      }],
      from: { [blockchain]: fromAddress }
    })

    expect(routes.length).toEqual(1)
    expect(routes[0].blockchain).toEqual('solana')
    expect(routes[0].fromAddress).toEqual(fromAddress)
    expect(routes[0].fromToken.address).toEqual(Blockchains.solana.currency.address)
    expect(routes[0].fromAmount).toEqual('1000')
    expect(routes[0].fromDecimals).toEqual(9)
    expect(routes[0].fromBalance).toEqual('1100000000')
    expect(routes[0].toToken.address).toEqual(Blockchains.solana.currency.address)
    expect(routes[0].toAmount).toEqual('990')
    expect(routes[0].toDecimals).toEqual(9)
    expect(routes[0].toAddress).toEqual(toAddress)
    expect(routes[0].fee).toEqual({ amount: '1%', receiver: feeReceiverAddress })
    expect(routes[0].feeAmount).toEqual('10')
    expect(routes[0].exchangeRoutes).toEqual([])
    expect(routes[0].approvalRequired).toEqual(false)
    expect(routes[0].approvalTransaction).toEqual(undefined)
    expect(routes[0].directTransfer).toEqual(true)

    let transaction = await routes[0].getTransaction()
    expect(transaction.blockchain).toEqual('solana')
    expect(transaction.signers.length).toEqual(0)
    expect(transaction.alts).toEqual(['EYGgx5fYCZtLN2pvnR4Bhn5KpMffKwyHCms4VhjSvF2K'])
    expect(transaction.instructions.length).toEqual(4)

    // create payments account
    let createPaymentsAccountInstructionData = routers.solana.api.createPaymentsAccount.layout.decode(transaction.instructions[0].data)
    expect(createPaymentsAccountInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.createPaymentsAccount.anchorDiscriminator.toString())
    expect(transaction.instructions[0].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[0].keys.length).toEqual(3)
    expect(transaction.instructions[0].keys[0]).toEqual({ pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false })
    expect(transaction.instructions[0].keys[1]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[0].keys[2]).toEqual({ pubkey: await getPaymentsAccountPublicKey({ fromAddress }), isSigner: false, isWritable: true })

    // create payment receiver account
    let transferToReceiverInstructionData = struct([ u32('instruction'), u64('amount') ]).decode(transaction.instructions[1].data)
    expect(transferToReceiverInstructionData.amount.toString()).toEqual('889890')
    expect(transaction.instructions[1].programId.toString()).toEqual(SystemProgram.programId.toString())
    expect(transaction.instructions[1].keys.length).toEqual(2)
    expect(transaction.instructions[1].keys[0]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[1].keys[1]).toEqual({ pubkey: new PublicKey(toAddress), isSigner: false, isWritable: true })

    // create fee receiver account
    let transferToFeeReceiverInstructionData = struct([ u32('instruction'), u64('amount') ]).decode(transaction.instructions[2].data)
    expect(transferToFeeReceiverInstructionData.amount.toString()).toEqual('890870')
    expect(transaction.instructions[2].programId.toString()).toEqual(SystemProgram.programId.toString())
    expect(transaction.instructions[2].keys.length).toEqual(2)
    expect(transaction.instructions[2].keys[0]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[2].keys[1]).toEqual({ pubkey: new PublicKey(feeReceiverAddress), isSigner: false, isWritable: true })
    
    // route payment
    let routeSolPaymentInstructionData = routers.solana.api.routeSol.layout.decode(transaction.instructions[3].data)
    expect(routeSolPaymentInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.routeSol.anchorDiscriminator.toString())
    expect(routeSolPaymentInstructionData.nonce.toString()).toEqual('0')
    expect(routeSolPaymentInstructionData.paymentAmount.toString()).toEqual('990')
    expect(routeSolPaymentInstructionData.feeAmount.toString()).toEqual('10')
    expect(transaction.instructions[3].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[3].keys.length).toEqual(5)
    expect(transaction.instructions[3].keys[0]).toEqual({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false })
    expect(transaction.instructions[3].keys[1]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[3].keys[2]).toEqual({ pubkey: await getPaymentsAccountPublicKey({ fromAddress }), isSigner: false, isWritable: true })
    expect(transaction.instructions[3].keys[3]).toEqual({ pubkey: new PublicKey(toAddress), isSigner: false, isWritable: true })
    expect(transaction.instructions[3].keys[4]).toEqual({ pubkey: new PublicKey(feeReceiverAddress), isSigner: false, isWritable: true })

  })

  it('does not create additional required accounts if conditions are met', async()=>{

    mock({ provider, blockchain, balance: { for: toAddress, return: 1000000 } })
    mock({ provider, blockchain, balance: { for: feeReceiverAddress, return: 1000000 } })
    await mockPaymentsAccount({ provider, fromAddress, nonce: '0' })

    let routes = await route({
      accept: [{
        blockchain,
        token: toToken,
        amount: tokenAmountOut,
        toAddress,
        fee: {
          amount: '1%',
          receiver: feeReceiverAddress,
        }
      }],
      from: { [blockchain]: fromAddress }
    })

    expect(routes.length).toEqual(1)
    expect(routes[0].blockchain).toEqual('solana')
    expect(routes[0].fromAddress).toEqual(fromAddress)
    expect(routes[0].fromToken.address).toEqual(Blockchains.solana.currency.address)
    expect(routes[0].fromAmount).toEqual('1000')
    expect(routes[0].fromDecimals).toEqual(9)
    expect(routes[0].fromBalance).toEqual('1100000000')
    expect(routes[0].toToken.address).toEqual(Blockchains.solana.currency.address)
    expect(routes[0].toAmount).toEqual('990')
    expect(routes[0].toDecimals).toEqual(9)
    expect(routes[0].toAddress).toEqual(toAddress)
    expect(routes[0].fee).toEqual({ amount: '1%', receiver: feeReceiverAddress })
    expect(routes[0].feeAmount).toEqual('10')
    expect(routes[0].exchangeRoutes).toEqual([])
    expect(routes[0].approvalRequired).toEqual(false)
    expect(routes[0].approvalTransaction).toEqual(undefined)
    expect(routes[0].directTransfer).toEqual(true)

    let transaction = await routes[0].getTransaction()
    expect(transaction.blockchain).toEqual('solana')
    expect(transaction.signers.length).toEqual(0)
    expect(transaction.alts).toEqual(['EYGgx5fYCZtLN2pvnR4Bhn5KpMffKwyHCms4VhjSvF2K'])
    expect(transaction.instructions.length).toEqual(1)

    // route payment
    let routeSolPaymentInstructionData = routers.solana.api.routeSol.layout.decode(transaction.instructions[0].data)
    expect(routeSolPaymentInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.routeSol.anchorDiscriminator.toString())
    expect(routeSolPaymentInstructionData.nonce.toString()).toEqual('0')
    expect(routeSolPaymentInstructionData.paymentAmount.toString()).toEqual('990')
    expect(routeSolPaymentInstructionData.feeAmount.toString()).toEqual('10')
    expect(transaction.instructions[0].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[0].keys.length).toEqual(5)
    expect(transaction.instructions[0].keys[0]).toEqual({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false })
    expect(transaction.instructions[0].keys[1]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[0].keys[2]).toEqual({ pubkey: await getPaymentsAccountPublicKey({ fromAddress }), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[3]).toEqual({ pubkey: new PublicKey(toAddress), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[4]).toEqual({ pubkey: new PublicKey(feeReceiverAddress), isSigner: false, isWritable: true })
  })
})
