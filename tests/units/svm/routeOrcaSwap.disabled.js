import Blockchains from '@depay/web3-blockchains'
import fetchMock from 'fetch-mock'
import { mock, resetMocks } from '@depay/web3-mock'
import { mockAssets } from 'tests/mocks/api'
import { mockPool } from '../../mocks/orca'
import { resetCache, getProvider } from '@depay/web3-client'
import { route, routers } from 'src'
import { struct, u32, u64, PublicKey, SystemProgram } from '@depay/solana-web3.js'
import Token from '@depay/web3-tokens'
import { 
  mockBasics,
  getPaymentsAccountPublicKey,
  getTokenAccountAddress,
  mockPaymentsAccount,
  mockTokenBalance ,
  mockTokenAccount,
  mockEscrowOutTokenAccount,
  getEscrowOutTokenAccountAddress,
} from '../../mocks/solana'

describe('routeOrcaSwap', ()=> {

  const blockchain = 'solana'
  const fromAddress = '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1'
  const toAddress = '5AcFMJZkXo14r3Hj99iYd1HScPiM4hAcLZf552DfZkxa'
  const feeReceiverAddress = '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk'
  const accounts = [fromAddress]
  const fromToken = Blockchains.solana.stables.usd[0]
  const toToken = Blockchains.solana.stables.usd[1]
  const tokenAmountOut = 1
  const pool = '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2'
  const tokenVaultB = '9RfZwn2Prux6QesG1Noo4HzMEBv3rPndJ2bN2Wwd6a7p'
  const tokenVaultA = 'BVNo8ftg2LkkssnWT4ZWdtoFaevnfD6ExYeramwM27pe'
  const aToB = false

  let provider

  beforeEach(async()=>{
    resetMocks()
    resetCache()
    fetchMock.reset()
    provider = await getProvider('solana')
    mock({ provider, blockchain, accounts: { return: accounts } })
    mockAssets({ blockchain, account: fromAddress, assets: []})
    await mockBasics({ provider, fromAddress, toAddress, feeReceiverAddress, fromTokenAddress: fromToken, toTokenAddress: toToken })
    mockTokenBalance({ provider, tokenAddress: fromToken, tokenDecimals: 6, fromAddress, balance: '10000000' })
    await mockPool({
      provider,
      tokenA: toToken,
      tokenVaultA,
      tokenB: fromToken,
      tokenVaultB,
      aToB,
      pool,
    })
    await mockEscrowOutTokenAccount({ provider, tokenAddress: toToken })
  })

  it('routes a payment through an orcaSwap', async ()=>{

    let routes = await route({
      accept: [{
        blockchain,
        token: toToken,
        amount: tokenAmountOut,
        receiver: toAddress,
      }],
      from: { [blockchain]: fromAddress }
    })

    expect(routes.length).toEqual(1)
    expect(routes[0].blockchain).toEqual('solana')
    expect(routes[0].fromAddress).toEqual(fromAddress)
    expect(routes[0].fromToken.address).toEqual(fromToken)
    expect(routes[0].fromAmount).toEqual('25175')
    expect(routes[0].fromDecimals).toEqual(6)
    expect(routes[0].fromBalance).toEqual('10000000')
    expect(routes[0].toToken.address).toEqual(toToken)
    expect(routes[0].toAmount).toEqual('1000000')
    expect(routes[0].toDecimals).toEqual(6)
    expect(routes[0].toAddress).toEqual(toAddress)
    expect(routes[0].fee).toEqual(undefined)
    expect(routes[0].feeAmount).toEqual(undefined)
    expect(routes[0].exchangeRoutes.length).toEqual(1)
    expect(routes[0].approvalRequired).toEqual(false)
    expect(routes[0].approvalTransaction).toEqual(undefined)
    expect(routes[0].directTransfer).toEqual(false)

    let transaction = await routes[0].getTransaction()
    expect(transaction.deadline > Math.ceil(new Date().getTime()/1000)).toEqual(true)
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

    // create escrow out token account
    let createEscrowTokenAccountInstructionData = routers.solana.api.routeToken.layout.decode(transaction.instructions[2].data)
    expect(createEscrowTokenAccountInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.createEscrowTokenAccount.anchorDiscriminator.toString())
    expect(transaction.instructions[2].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[2].keys.length).toEqual(5)
    expect(transaction.instructions[2].keys[0]).toEqual({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false })
    expect(transaction.instructions[2].keys[1]).toEqual({ pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false })
    expect(transaction.instructions[2].keys[2]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[2].keys[3]).toEqual({ pubkey: new PublicKey(toToken), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[4]).toEqual({ pubkey: new PublicKey(await getEscrowOutTokenAccountAddress({ tokenAddress: toToken })), isSigner: false, isWritable: true })

    // routeOrcaSwap
    let routeOrcaSwapPaymentInstructionData = routers.solana.api.routeOrcaSwap.layout.decode(transaction.instructions[3].data)
    expect(routeOrcaSwapPaymentInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.routeOrcaSwap.anchorDiscriminator.toString())
    expect(routeOrcaSwapPaymentInstructionData.nonce.toString()).toEqual('0')
    expect(routeOrcaSwapPaymentInstructionData.amountIn.toString()).toEqual('25175')
    expect(routeOrcaSwapPaymentInstructionData.sqrtPriceLimit.toString()).toEqual('79226673515401279992447579055')
    expect(routeOrcaSwapPaymentInstructionData.amountSpecifiedIsInput).toEqual(true)
    expect(routeOrcaSwapPaymentInstructionData.aToB).toEqual(aToB)
    expect(routeOrcaSwapPaymentInstructionData.paymentAmount.toString()).toEqual('1000000')
    expect(routeOrcaSwapPaymentInstructionData.feeAmount.toString()).toEqual('0')
    expect(routeOrcaSwapPaymentInstructionData.deadline !== undefined).toEqual(true)
    expect(transaction.instructions[3].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[3].keys.length).toEqual(15)
    expect(transaction.instructions[3].keys[0]).toEqual({ pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false })
    expect(transaction.instructions[3].keys[1]).toEqual({ pubkey: new PublicKey(routers.solana.ammProgram), isSigner: false, isWritable: false })
    expect(transaction.instructions[3].keys[2]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[3].keys[3]).toEqual({ pubkey: await getPaymentsAccountPublicKey({ fromAddress }), isSigner: false, isWritable: true })
    expect(transaction.instructions[3].keys[4]).toEqual({ pubkey: new PublicKey(await Token.solana.findProgramAddress({ token: fromToken, owner: fromAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[3].keys[5]).toEqual({ pubkey: new PublicKey(pool), isSigner: false, isWritable: true })
    expect(transaction.instructions[3].keys[6]).toEqual({ pubkey: new PublicKey(tokenVaultA), isSigner: false, isWritable: true })
    expect(transaction.instructions[3].keys[7]).toEqual({ pubkey: new PublicKey(tokenVaultB), isSigner: false, isWritable: true })
    expect(transaction.instructions[3].keys[8]).toEqual({ pubkey: new PublicKey('7D5U3tQsDtVDPiYN62RYgrnEaWAC928FU2tRybhrBi85'), isSigner: false, isWritable: true })
    expect(transaction.instructions[3].keys[9]).toEqual({ pubkey: new PublicKey('4cTvR2Z2Z4Co8ZVNPfam6KH7joDy6UYAB9FhNik8ebim'), isSigner: false, isWritable: true })
    expect(transaction.instructions[3].keys[10]).toEqual({ pubkey: new PublicKey('2AYpxTiY8Pevp9V1KE7KasLYuZwfis4Xp2gogZ2bSGKV'), isSigner: false, isWritable: true })
    expect(transaction.instructions[3].keys[11]).toEqual({ pubkey: new PublicKey('E3dWxTAdckBzwuoEX1L2Ht3eDbEwnWpjmsprjuTDJZ3D'), isSigner: false, isWritable: false })
    expect(transaction.instructions[3].keys[12]).toEqual({ pubkey: new PublicKey(await getEscrowOutTokenAccountAddress({ tokenAddress: toToken })), isSigner: false, isWritable: true })
    expect(transaction.instructions[3].keys[13]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: toAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[3].keys[14]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: toAddress })), isSigner: false, isWritable: true })

  })

  it('routes a payment through an orcaSwap + fee', async ()=>{

    let routes = await route({
      accept: [{
        blockchain,
        token: toToken,
        amount: tokenAmountOut,
        receiver: toAddress,
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
    expect(routes[0].fromToken.address).toEqual(fromToken)
    expect(routes[0].fromAmount).toEqual('25175')
    expect(routes[0].fromDecimals).toEqual(6)
    expect(routes[0].fromBalance).toEqual('10000000')
    expect(routes[0].toToken.address).toEqual(toToken)
    expect(routes[0].toAmount).toEqual('990000')
    expect(routes[0].toDecimals).toEqual(6)
    expect(routes[0].toAddress).toEqual(toAddress)
    expect(routes[0].fee).toEqual({ amount: '1%', receiver: feeReceiverAddress })
    expect(routes[0].feeAmount).toEqual('10000')
    expect(routes[0].exchangeRoutes.length).toEqual(1)
    expect(routes[0].approvalRequired).toEqual(false)
    expect(routes[0].approvalTransaction).toEqual(undefined)
    expect(routes[0].directTransfer).toEqual(false)

    let transaction = await routes[0].getTransaction()
    expect(transaction.blockchain).toEqual('solana')
    expect(transaction.signers.length).toEqual(0)
    expect(transaction.alts).toEqual(['EYGgx5fYCZtLN2pvnR4Bhn5KpMffKwyHCms4VhjSvF2K'])
    expect(transaction.instructions.length).toEqual(5)

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

    // create escrow out token account
    let createEscrowTokenAccountInstructionData = routers.solana.api.routeToken.layout.decode(transaction.instructions[3].data)
    expect(createEscrowTokenAccountInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.createEscrowTokenAccount.anchorDiscriminator.toString())
    expect(transaction.instructions[3].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[3].keys.length).toEqual(5)
    expect(transaction.instructions[3].keys[0]).toEqual({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false })
    expect(transaction.instructions[3].keys[1]).toEqual({ pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false })
    expect(transaction.instructions[3].keys[2]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[3].keys[3]).toEqual({ pubkey: new PublicKey(toToken), isSigner: false, isWritable: true })
    expect(transaction.instructions[3].keys[4]).toEqual({ pubkey: new PublicKey(await getEscrowOutTokenAccountAddress({ tokenAddress: toToken })), isSigner: false, isWritable: true })

    // routeOrcaSwap
    let routeOrcaSwapPaymentInstructionData = routers.solana.api.routeOrcaSwap.layout.decode(transaction.instructions[4].data)
    expect(routeOrcaSwapPaymentInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.routeOrcaSwap.anchorDiscriminator.toString())
    expect(routeOrcaSwapPaymentInstructionData.nonce.toString()).toEqual('0')
    expect(routeOrcaSwapPaymentInstructionData.amountIn.toString()).toEqual('25175')
    expect(routeOrcaSwapPaymentInstructionData.sqrtPriceLimit.toString()).toEqual('79226673515401279992447579055')
    expect(routeOrcaSwapPaymentInstructionData.amountSpecifiedIsInput).toEqual(true)
    expect(routeOrcaSwapPaymentInstructionData.aToB).toEqual(aToB)
    expect(routeOrcaSwapPaymentInstructionData.paymentAmount.toString()).toEqual('990000')
    expect(routeOrcaSwapPaymentInstructionData.feeAmount.toString()).toEqual('10000')
    expect(transaction.instructions[4].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[4].keys.length).toEqual(15)
    expect(transaction.instructions[4].keys[0]).toEqual({ pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false })
    expect(transaction.instructions[4].keys[1]).toEqual({ pubkey: new PublicKey(routers.solana.ammProgram), isSigner: false, isWritable: false })
    expect(transaction.instructions[4].keys[2]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[4].keys[3]).toEqual({ pubkey: await getPaymentsAccountPublicKey({ fromAddress }), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[4]).toEqual({ pubkey: new PublicKey(await Token.solana.findProgramAddress({ token: fromToken, owner: fromAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[5]).toEqual({ pubkey: new PublicKey(pool), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[6]).toEqual({ pubkey: new PublicKey(tokenVaultA), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[7]).toEqual({ pubkey: new PublicKey(tokenVaultB), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[8]).toEqual({ pubkey: new PublicKey('7D5U3tQsDtVDPiYN62RYgrnEaWAC928FU2tRybhrBi85'), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[9]).toEqual({ pubkey: new PublicKey('4cTvR2Z2Z4Co8ZVNPfam6KH7joDy6UYAB9FhNik8ebim'), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[10]).toEqual({ pubkey: new PublicKey('2AYpxTiY8Pevp9V1KE7KasLYuZwfis4Xp2gogZ2bSGKV'), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[11]).toEqual({ pubkey: new PublicKey('E3dWxTAdckBzwuoEX1L2Ht3eDbEwnWpjmsprjuTDJZ3D'), isSigner: false, isWritable: false })
    expect(transaction.instructions[4].keys[12]).toEqual({ pubkey: new PublicKey(await getEscrowOutTokenAccountAddress({ tokenAddress: toToken })), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[13]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: toAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[14]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: feeReceiverAddress })), isSigner: false, isWritable: true })

  })

  it('does not create additional required accounts if conditions are met', async()=>{

    await mockTokenAccount({ provider, ownerAddress: toAddress, tokenAddress: toToken, exists: true })
    await mockTokenAccount({ provider, ownerAddress: feeReceiverAddress, tokenAddress: toToken, exists: true })
    await mockEscrowOutTokenAccount({ provider, tokenAddress: toToken, exists: true })
    await mockPaymentsAccount({ provider, fromAddress, nonce: '0' })

    let routes = await route({
      accept: [{
        blockchain,
        token: toToken,
        amount: tokenAmountOut,
        receiver: toAddress,
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
    expect(routes[0].fromToken.address).toEqual(fromToken)
    expect(routes[0].fromAmount).toEqual('25175')
    expect(routes[0].fromDecimals).toEqual(6)
    expect(routes[0].fromBalance).toEqual('10000000')
    expect(routes[0].toToken.address).toEqual(toToken)
    expect(routes[0].toAmount).toEqual('990000')
    expect(routes[0].toDecimals).toEqual(6)
    expect(routes[0].toAddress).toEqual(toAddress)
    expect(routes[0].fee).toEqual({ amount: '1%', receiver: feeReceiverAddress })
    expect(routes[0].feeAmount).toEqual('10000')
    expect(routes[0].exchangeRoutes.length).toEqual(1)
    expect(routes[0].approvalRequired).toEqual(false)
    expect(routes[0].approvalTransaction).toEqual(undefined)
    expect(routes[0].directTransfer).toEqual(false)

    let transaction = await routes[0].getTransaction()
    expect(transaction.blockchain).toEqual('solana')
    expect(transaction.signers.length).toEqual(0)
    expect(transaction.alts).toEqual(['EYGgx5fYCZtLN2pvnR4Bhn5KpMffKwyHCms4VhjSvF2K'])
    expect(transaction.instructions.length).toEqual(1)

    // routeOrcaSwap
    let routeOrcaSwapPaymentInstructionData = routers.solana.api.routeOrcaSwap.layout.decode(transaction.instructions[0].data)
    expect(routeOrcaSwapPaymentInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.routeOrcaSwap.anchorDiscriminator.toString())
    expect(routeOrcaSwapPaymentInstructionData.nonce.toString()).toEqual('0')
    expect(routeOrcaSwapPaymentInstructionData.amountIn.toString()).toEqual('25175')
    expect(routeOrcaSwapPaymentInstructionData.sqrtPriceLimit.toString()).toEqual('79226673515401279992447579055')
    expect(routeOrcaSwapPaymentInstructionData.amountSpecifiedIsInput).toEqual(true)
    expect(routeOrcaSwapPaymentInstructionData.aToB).toEqual(aToB)
    expect(routeOrcaSwapPaymentInstructionData.paymentAmount.toString()).toEqual('990000')
    expect(routeOrcaSwapPaymentInstructionData.feeAmount.toString()).toEqual('10000')
    expect(transaction.instructions[0].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[0].keys.length).toEqual(15)
    expect(transaction.instructions[0].keys[0]).toEqual({ pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false })
    expect(transaction.instructions[0].keys[1]).toEqual({ pubkey: new PublicKey(routers.solana.ammProgram), isSigner: false, isWritable: false })
    expect(transaction.instructions[0].keys[2]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[0].keys[3]).toEqual({ pubkey: await getPaymentsAccountPublicKey({ fromAddress }), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[4]).toEqual({ pubkey: new PublicKey(await Token.solana.findProgramAddress({ token: fromToken, owner: fromAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[5]).toEqual({ pubkey: new PublicKey(pool), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[6]).toEqual({ pubkey: new PublicKey(tokenVaultA), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[7]).toEqual({ pubkey: new PublicKey(tokenVaultB), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[8]).toEqual({ pubkey: new PublicKey('7D5U3tQsDtVDPiYN62RYgrnEaWAC928FU2tRybhrBi85'), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[9]).toEqual({ pubkey: new PublicKey('4cTvR2Z2Z4Co8ZVNPfam6KH7joDy6UYAB9FhNik8ebim'), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[10]).toEqual({ pubkey: new PublicKey('2AYpxTiY8Pevp9V1KE7KasLYuZwfis4Xp2gogZ2bSGKV'), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[11]).toEqual({ pubkey: new PublicKey('E3dWxTAdckBzwuoEX1L2Ht3eDbEwnWpjmsprjuTDJZ3D'), isSigner: false, isWritable: false })
    expect(transaction.instructions[0].keys[12]).toEqual({ pubkey: new PublicKey(await getEscrowOutTokenAccountAddress({ tokenAddress: toToken })), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[13]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: toAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[14]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: feeReceiverAddress })), isSigner: false, isWritable: true })

  })
})
