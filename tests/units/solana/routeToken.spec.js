import Blockchains from '@depay/web3-blockchains'
import fetchMock from 'fetch-mock'
import { mock, resetMocks } from '@depay/web3-mock'
import { mockAssets } from 'tests/mocks/api'
import { struct, u32, u64, PublicKey, SystemProgram } from '@depay/solana-web3.js'
import { resetCache, getProvider } from '@depay/web3-client'
import { route, routers } from 'src'
import { 
  mockBasics,
  getPaymentsAccountPublicKey,
  getTokenAccountAddress,
  mockPaymentsAccount,
  mockTokenBalance ,
  mockTokenAccount
} from '../../mocks/solana'

describe('routeToken', ()=> {

  const blockchain = 'solana'
  const fromAddress = '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1'
  const toAddress = '5AcFMJZkXo14r3Hj99iYd1HScPiM4hAcLZf552DfZkxa'
  const feeReceiverAddress = '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk'
  const accounts = [fromAddress]
  const toToken = Blockchains.solana.stables.usd[0]
  const tokenAmountOut = 1

  let provider

  beforeEach(async()=>{
    resetMocks()
    resetCache()
    fetchMock.reset()
    provider = await getProvider('solana')
    mock({ provider, blockchain, accounts: { return: accounts } })
    mockAssets({ blockchain, account: fromAddress, assets: []})
    await mockBasics({ provider, fromAddress, toAddress, feeReceiverAddress, fromTokenAddress: toToken })
    mockTokenBalance({ provider, tokenAddress: toToken, tokenDecimals: 6, fromAddress, balance: '10000000' })
  })

  it('routes a token payment', async ()=>{

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
    expect(routes[0].fromToken.address).toEqual(toToken)
    expect(routes[0].fromAmount).toEqual('1000000')
    expect(routes[0].fromDecimals).toEqual(6)
    expect(routes[0].fromBalance).toEqual('10000000')
    expect(routes[0].toToken.address).toEqual(toToken)
    expect(routes[0].toAmount).toEqual('1000000')
    expect(routes[0].toDecimals).toEqual(6)
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

    // create associated token account for payment receiver
    expect(transaction.instructions[1].programId.toString()).toEqual('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
    expect(transaction.instructions[1].keys.length).toEqual(6)
    expect(transaction.instructions[1].keys[0]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[1].keys[1]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: toAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[1].keys[2]).toEqual({ pubkey: new PublicKey(toAddress), isSigner: false, isWritable: false })
    expect(transaction.instructions[1].keys[3]).toEqual({ pubkey: new PublicKey(toToken), isSigner: false, isWritable: false })
    expect(transaction.instructions[1].keys[4]).toEqual({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false })
    expect(transaction.instructions[1].keys[5]).toEqual({ pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false })

    // route token payment
    let routeTokenPaymentInstructionData = routers.solana.api.routeToken.layout.decode(transaction.instructions[2].data)
    expect(routeTokenPaymentInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.routeToken.anchorDiscriminator.toString())
    expect(routeTokenPaymentInstructionData.nonce.toString()).toEqual('0')
    expect(routeTokenPaymentInstructionData.paymentAmount.toString()).toEqual('1000000')
    expect(routeTokenPaymentInstructionData.feeAmount.toString()).toEqual('0')
    expect(transaction.instructions[2].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[2].keys.length).toEqual(6)
    expect(transaction.instructions[2].keys[0]).toEqual({ pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false })
    expect(transaction.instructions[2].keys[1]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[2].keys[2]).toEqual({ pubkey: await getPaymentsAccountPublicKey({ fromAddress }), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[3]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: fromAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[4]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: toAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[5]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: toAddress })), isSigner: false, isWritable: true })
  })

  it('routes a token payment with fee', async ()=>{

    let routes = await route({
      accept: [{
        blockchain,
        token: toToken,
        amount: tokenAmountOut,
        toAddress,
        fee: {
          amount: '1%',
          receiver: feeReceiverAddress
        }
      }],
      from: { [blockchain]: fromAddress }
    })

    expect(routes.length).toEqual(1)
    expect(routes[0].blockchain).toEqual('solana')
    expect(routes[0].fromAddress).toEqual(fromAddress)
    expect(routes[0].fromToken.address).toEqual(toToken)
    expect(routes[0].fromAmount).toEqual('1000000')
    expect(routes[0].fromDecimals).toEqual(6)
    expect(routes[0].fromBalance).toEqual('10000000')
    expect(routes[0].toToken.address).toEqual(toToken)
    expect(routes[0].toAmount).toEqual('990000')
    expect(routes[0].toDecimals).toEqual(6)
    expect(routes[0].toAddress).toEqual(toAddress)
    expect(routes[0].fee).toEqual({ amount: '1%', receiver: feeReceiverAddress })
    expect(routes[0].feeAmount).toEqual('10000')
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

    // create associated token account for payment receiver
    expect(transaction.instructions[1].programId.toString()).toEqual('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
    expect(transaction.instructions[1].keys.length).toEqual(6)
    expect(transaction.instructions[1].keys[0]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[1].keys[1]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: toAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[1].keys[2]).toEqual({ pubkey: new PublicKey(toAddress), isSigner: false, isWritable: false })
    expect(transaction.instructions[1].keys[3]).toEqual({ pubkey: new PublicKey(toToken), isSigner: false, isWritable: false })
    expect(transaction.instructions[1].keys[4]).toEqual({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false })
    expect(transaction.instructions[1].keys[5]).toEqual({ pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false })

    // create associated token account for fee receiver
    expect(transaction.instructions[2].programId.toString()).toEqual('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
    expect(transaction.instructions[2].keys.length).toEqual(6)
    expect(transaction.instructions[2].keys[0]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[2].keys[1]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: feeReceiverAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[2]).toEqual({ pubkey: new PublicKey(feeReceiverAddress), isSigner: false, isWritable: false })
    expect(transaction.instructions[2].keys[3]).toEqual({ pubkey: new PublicKey(toToken), isSigner: false, isWritable: false })
    expect(transaction.instructions[2].keys[4]).toEqual({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false })
    expect(transaction.instructions[2].keys[5]).toEqual({ pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false })

    // route token payment
    let routeTokenPaymentInstructionData = routers.solana.api.routeToken.layout.decode(transaction.instructions[3].data)
    expect(routeTokenPaymentInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.routeToken.anchorDiscriminator.toString())
    expect(routeTokenPaymentInstructionData.nonce.toString()).toEqual('0')
    expect(routeTokenPaymentInstructionData.paymentAmount.toString()).toEqual('990000')
    expect(routeTokenPaymentInstructionData.feeAmount.toString()).toEqual('10000')
    expect(transaction.instructions[3].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[3].keys.length).toEqual(6)
    expect(transaction.instructions[3].keys[0]).toEqual({ pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false })
    expect(transaction.instructions[3].keys[1]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[3].keys[2]).toEqual({ pubkey: await getPaymentsAccountPublicKey({ fromAddress }), isSigner: false, isWritable: true })
    expect(transaction.instructions[3].keys[3]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: fromAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[3].keys[4]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: toAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[3].keys[5]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: feeReceiverAddress })), isSigner: false, isWritable: true })
  })

  it('does not create additional required accounts if conditions are met', async()=>{

    await mockTokenAccount({ provider, ownerAddress: toAddress, tokenAddress: toToken, exists: true })
    await mockTokenAccount({ provider, ownerAddress: feeReceiverAddress, tokenAddress: toToken, exists: true })
    await mockPaymentsAccount({ provider, fromAddress, nonce: '0' })

    let routes = await route({
      accept: [{
        blockchain,
        token: toToken,
        amount: tokenAmountOut,
        toAddress,
        fee: {
          amount: '1%',
          receiver: feeReceiverAddress
        }
      }],
      from: { [blockchain]: fromAddress }
    })

    expect(routes.length).toEqual(1)
    expect(routes[0].blockchain).toEqual('solana')
    expect(routes[0].fromAddress).toEqual(fromAddress)
    expect(routes[0].fromToken.address).toEqual(toToken)
    expect(routes[0].fromAmount).toEqual('1000000')
    expect(routes[0].fromDecimals).toEqual(6)
    expect(routes[0].fromBalance).toEqual('10000000')
    expect(routes[0].toToken.address).toEqual(toToken)
    expect(routes[0].toAmount).toEqual('990000')
    expect(routes[0].toDecimals).toEqual(6)
    expect(routes[0].toAddress).toEqual(toAddress)
    expect(routes[0].fee).toEqual({ amount: '1%', receiver: feeReceiverAddress })
    expect(routes[0].feeAmount).toEqual('10000')
    expect(routes[0].exchangeRoutes).toEqual([])
    expect(routes[0].approvalRequired).toEqual(false)
    expect(routes[0].approvalTransaction).toEqual(undefined)
    expect(routes[0].directTransfer).toEqual(true)

    let transaction = await routes[0].getTransaction()
    expect(transaction.blockchain).toEqual('solana')
    expect(transaction.signers.length).toEqual(0)
    expect(transaction.alts).toEqual(['EYGgx5fYCZtLN2pvnR4Bhn5KpMffKwyHCms4VhjSvF2K'])
    expect(transaction.instructions.length).toEqual(1)

    // route token payment
    let routeTokenPaymentInstructionData = routers.solana.api.routeToken.layout.decode(transaction.instructions[0].data)
    expect(routeTokenPaymentInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.routeToken.anchorDiscriminator.toString())
    expect(routeTokenPaymentInstructionData.nonce.toString()).toEqual('0')
    expect(routeTokenPaymentInstructionData.paymentAmount.toString()).toEqual('990000')
    expect(routeTokenPaymentInstructionData.feeAmount.toString()).toEqual('10000')
    expect(transaction.instructions[0].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[0].keys.length).toEqual(6)
    expect(transaction.instructions[0].keys[0]).toEqual({ pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false })
    expect(transaction.instructions[0].keys[1]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[0].keys[2]).toEqual({ pubkey: await getPaymentsAccountPublicKey({ fromAddress }), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[3]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: fromAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[4]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: toAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[5]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: feeReceiverAddress })), isSigner: false, isWritable: true })
  })
})
