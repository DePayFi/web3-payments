import Blockchains from '@depay/web3-blockchains'
import fetchMock from 'fetch-mock'
import { mock, resetMocks } from '@depay/web3-mock'
import { mockAssets } from 'tests/mocks/api'
import { mockPools } from '../../mocks/orca'
import { resetCache, getProvider } from '@depay/web3-client'
import { route, routers } from 'src'
import { struct, u32, u64, PublicKey, SystemProgram } from '@depay/solana-web3.js'
import { Token } from '@depay/web3-tokens'
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

describe('routeTwoHopOrcaSwap', ()=> {

  const blockchain = 'solana'
  const fromAddress = '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1'
  const toAddress = '5AcFMJZkXo14r3Hj99iYd1HScPiM4hAcLZf552DfZkxa'
  const feeReceiverAddress = '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk'
  const accounts = [fromAddress]
  const fromToken = Blockchains.solana.tokens[4].address
  const toToken = Blockchains.solana.tokens[5].address
  const tokenAmountOut = 1
  const tokenVaultOneA = "B7zr34ZBzViYUj9TH4JhxrmhM7cRcKvRDzywDPnfvZ5g"
  const tokenVaultTwoA = "446TEqLqaxm66kCDDwaah2cZQDXa99jAWVXobAYPdFVh"
  const tokenMiddle = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  const tokenAccountOut = '3VCor9E7BmH83jds6Nvwu2FNcjEZqgcocqAiyiB9dEG4'
  const tokenAccountB = 'F7e4iBrxoSmHhEzhuBcXXs1KAknYvEoZWieiocPvrCD9'
  const tokenVaultOneB = "531qdY5CSNjRqBd6oqDEqDuAxi6mEXMpaVhB3byLFw2P"
  const tokenVaultTwoB = "HbvV7HQbX8PwydvVhxbrqD74QZEurnzY18QzieWi7hUf"
  const poolOne = "AFCKH5AnW2inQdV3RgcLyk9PgLUhbN6Xy64pceJSwrfs"
  const poolTwo = "CZqbzVsVQQtBy1X15gHxipWFnC3Hkar62LJ49XuSK7ec"

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
    await mockPools({
      provider,
      poolOne,
      poolTwo,
      tokenA: toToken,
      tokenMiddle,
      tokenB: fromToken,
      tokenVaultOneA,
      tokenVaultOneB,
      tokenVaultTwoA,
      tokenVaultTwoB,
      aToBOne: true,
      aToBTwo: true,
    })
    await mockEscrowOutTokenAccount({ provider, tokenAddress: toToken })
    await mockTokenAccount({ provider, tokenAddress: tokenMiddle, ownerAddress: fromAddress  })
  })

  it('routes a payment through a twoHopOrcaSwap', async ()=>{

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
    expect(routes[0].fromToken.address).toEqual(fromToken)
    expect(routes[0].fromAmount).toEqual('64')
    expect(routes[0].fromDecimals).toEqual(6)
    expect(routes[0].fromBalance).toEqual('10000000')
    expect(routes[0].toToken.address).toEqual(toToken)
    expect(routes[0].toAmount).toEqual('100000')
    expect(routes[0].toDecimals).toEqual(5)
    expect(routes[0].toAddress).toEqual(toAddress)
    expect(routes[0].fee).toEqual(undefined)
    expect(routes[0].feeAmount).toEqual(undefined)
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

    // create token middle account
    expect(transaction.instructions[1].programId.toString()).toEqual('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
    expect(transaction.instructions[1].keys.length).toEqual(6)
    expect(transaction.instructions[1].keys[0]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[1].keys[1]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: tokenMiddle, ownerAddress: fromAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[1].keys[2]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: false, isWritable: false })
    expect(transaction.instructions[1].keys[3]).toEqual({ pubkey: new PublicKey(tokenMiddle), isSigner: false, isWritable: false })
    expect(transaction.instructions[1].keys[4]).toEqual({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false })
    expect(transaction.instructions[1].keys[5]).toEqual({ pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false })

    // create associated token account for payment receiver
    expect(transaction.instructions[2].programId.toString()).toEqual('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
    expect(transaction.instructions[2].keys.length).toEqual(6)
    expect(transaction.instructions[2].keys[0]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[2].keys[1]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: toAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[2]).toEqual({ pubkey: new PublicKey(toAddress), isSigner: false, isWritable: false })
    expect(transaction.instructions[2].keys[3]).toEqual({ pubkey: new PublicKey(toToken), isSigner: false, isWritable: false })
    expect(transaction.instructions[2].keys[4]).toEqual({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false })
    expect(transaction.instructions[2].keys[5]).toEqual({ pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false })

    // create escrow out token account
    let createEscrowTokenAccountInstructionData = routers.solana.api.createEscrowTokenAccount.layout.decode(transaction.instructions[3].data)
    expect(createEscrowTokenAccountInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.createEscrowTokenAccount.anchorDiscriminator.toString())
    expect(transaction.instructions[3].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[3].keys.length).toEqual(5)
    expect(transaction.instructions[3].keys[0]).toEqual({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false })
    expect(transaction.instructions[3].keys[1]).toEqual({ pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false })
    expect(transaction.instructions[3].keys[2]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[3].keys[3]).toEqual({ pubkey: new PublicKey(toToken), isSigner: false, isWritable: true })
    expect(transaction.instructions[3].keys[4]).toEqual({ pubkey: new PublicKey(await getEscrowOutTokenAccountAddress({ tokenAddress: toToken })), isSigner: false, isWritable: true })

    // routeOrcaTwoHopSwap
    let routeOrcaTwoHopSwapPaymentInstructionData = routers.solana.api.routeOrcaTwoHopSwap.layout.decode(transaction.instructions[4].data)
    expect(routeOrcaTwoHopSwapPaymentInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.routeOrcaTwoHopSwap.anchorDiscriminator.toString())
    expect(routeOrcaTwoHopSwapPaymentInstructionData.nonce.toString()).toEqual('0')
    expect(routeOrcaTwoHopSwapPaymentInstructionData.amountIn.toString()).toEqual('64')
    expect(routeOrcaTwoHopSwapPaymentInstructionData.amountSpecifiedIsInput).toEqual(true)
    expect(routeOrcaTwoHopSwapPaymentInstructionData.aToBOne).toEqual(false)
    expect(routeOrcaTwoHopSwapPaymentInstructionData.aToBTwo).toEqual(false)
    expect(routeOrcaTwoHopSwapPaymentInstructionData.sqrtPriceLimitOne.toString()).toEqual('79226673515401279992447579055')
    expect(routeOrcaTwoHopSwapPaymentInstructionData.sqrtPriceLimitTwo.toString()).toEqual('79226673515401279992447579055')
    expect(routeOrcaTwoHopSwapPaymentInstructionData.paymentAmount.toString()).toEqual('100000')
    expect(routeOrcaTwoHopSwapPaymentInstructionData.feeAmount.toString()).toEqual('0')
    expect(transaction.instructions[4].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[4].keys.length).toEqual(23)
    expect(transaction.instructions[4].keys[0]).toEqual({ pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false })
    expect(transaction.instructions[4].keys[1]).toEqual({ pubkey: new PublicKey(routers.solana.ammProgram), isSigner: false, isWritable: false })
    expect(transaction.instructions[4].keys[2]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[4].keys[3]).toEqual({ pubkey: await getPaymentsAccountPublicKey({ fromAddress }), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[4]).toEqual({ pubkey: new PublicKey(poolOne), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[5]).toEqual({ pubkey: new PublicKey(poolTwo), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[6]).toEqual({ pubkey: new PublicKey(await Token.solana.findProgramAddress({ token: fromToken, owner: fromAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[7]).toEqual({ pubkey: new PublicKey(tokenVaultOneA), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[8]).toEqual({ pubkey: new PublicKey(tokenVaultOneB), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[9]).toEqual({ pubkey: new PublicKey(await Token.solana.findProgramAddress({ token: tokenMiddle, owner: fromAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[10]).toEqual({ pubkey: new PublicKey(tokenVaultTwoA), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[11]).toEqual({ pubkey: new PublicKey(tokenVaultTwoB), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[12]).toEqual({ pubkey: new PublicKey('FzCQDciKKMbLEqPQ3BwuxnTU3M95QgAJHtuqu7uTWKJ2'), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[13]).toEqual({ pubkey: new PublicKey('A6FdY6RXuHbrZvpt5ucefwDHvm99Vog9VUi1BQRfCny6'), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[14]).toEqual({ pubkey: new PublicKey('5ziJFbeTMgNLmRJYks622QmYcezESqU7UQkVAKLeKmEu'), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[15]).toEqual({ pubkey: new PublicKey('4YfkSFsJbpaPuREp5Zoy7W6qeQEN2CS3cmsHzFb2aQmh'), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[16]).toEqual({ pubkey: new PublicKey('7PW4JcLTEAPDuTXyUjdG8dJUh1yrcyMe3kB1HWCZ3NEB'), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[17]).toEqual({ pubkey: new PublicKey('CMdAyAQ35L1voiUz6rrsD53MLo7LrAtx17vifToEU4W8'), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[18]).toEqual({ pubkey: new PublicKey('D5BDybh7EtuiGrEfJHXosToj3hkFJcNwMRVEGeVkpah2'), isSigner: false, isWritable: false })
    expect(transaction.instructions[4].keys[19]).toEqual({ pubkey: new PublicKey('2X2KJM4yQbd6S57MYPLh1WMHJnokH4r1s1P4AKxPgvoN'), isSigner: false, isWritable: false })
    expect(transaction.instructions[4].keys[20]).toEqual({ pubkey: new PublicKey(await getEscrowOutTokenAccountAddress({ tokenAddress: toToken })), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[21]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: toAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[22]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: toAddress })), isSigner: false, isWritable: true })

  })

  it('routes a payment through a twoHopOrcaSwap + fee', async ()=>{

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
    expect(routes[0].fromToken.address).toEqual(fromToken)
    expect(routes[0].fromAmount).toEqual('64')
    expect(routes[0].fromDecimals).toEqual(6)
    expect(routes[0].fromBalance).toEqual('10000000')
    expect(routes[0].toToken.address).toEqual(toToken)
    expect(routes[0].toAmount).toEqual('99000')
    expect(routes[0].toDecimals).toEqual(5)
    expect(routes[0].toAddress).toEqual(toAddress)
    expect(routes[0].fee).toEqual({ amount: '1%', receiver: feeReceiverAddress })
    expect(routes[0].feeAmount).toEqual('1000')
    expect(routes[0].exchangeRoutes.length).toEqual(1)
    expect(routes[0].approvalRequired).toEqual(false)
    expect(routes[0].approvalTransaction).toEqual(undefined)
    expect(routes[0].directTransfer).toEqual(false)

    let transaction = await routes[0].getTransaction()
    expect(transaction.blockchain).toEqual('solana')
    expect(transaction.signers.length).toEqual(0)
    expect(transaction.alts).toEqual(['EYGgx5fYCZtLN2pvnR4Bhn5KpMffKwyHCms4VhjSvF2K'])
    expect(transaction.instructions.length).toEqual(6)

    // create payments account
    let createPaymentsAccountInstructionData = routers.solana.api.createPaymentsAccount.layout.decode(transaction.instructions[0].data)
    expect(createPaymentsAccountInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.createPaymentsAccount.anchorDiscriminator.toString())
    expect(transaction.instructions[0].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[0].keys.length).toEqual(3)
    expect(transaction.instructions[0].keys[0]).toEqual({ pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false })
    expect(transaction.instructions[0].keys[1]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[0].keys[2]).toEqual({ pubkey: await getPaymentsAccountPublicKey({ fromAddress }), isSigner: false, isWritable: true })

    // create token middle account
    expect(transaction.instructions[1].programId.toString()).toEqual('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
    expect(transaction.instructions[1].keys.length).toEqual(6)
    expect(transaction.instructions[1].keys[0]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[1].keys[1]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: tokenMiddle, ownerAddress: fromAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[1].keys[2]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: false, isWritable: false })
    expect(transaction.instructions[1].keys[3]).toEqual({ pubkey: new PublicKey(tokenMiddle), isSigner: false, isWritable: false })
    expect(transaction.instructions[1].keys[4]).toEqual({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false })
    expect(transaction.instructions[1].keys[5]).toEqual({ pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false })

    // create associated token account for payment receiver
    expect(transaction.instructions[2].programId.toString()).toEqual('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
    expect(transaction.instructions[2].keys.length).toEqual(6)
    expect(transaction.instructions[2].keys[0]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[2].keys[1]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: toAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[2]).toEqual({ pubkey: new PublicKey(toAddress), isSigner: false, isWritable: false })
    expect(transaction.instructions[2].keys[3]).toEqual({ pubkey: new PublicKey(toToken), isSigner: false, isWritable: false })
    expect(transaction.instructions[2].keys[4]).toEqual({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false })
    expect(transaction.instructions[2].keys[5]).toEqual({ pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false })

    // create associated token account for fee receiver
    expect(transaction.instructions[3].programId.toString()).toEqual('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
    expect(transaction.instructions[3].keys.length).toEqual(6)
    expect(transaction.instructions[3].keys[0]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[3].keys[1]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: feeReceiverAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[3].keys[2]).toEqual({ pubkey: new PublicKey(feeReceiverAddress), isSigner: false, isWritable: false })
    expect(transaction.instructions[3].keys[3]).toEqual({ pubkey: new PublicKey(toToken), isSigner: false, isWritable: false })
    expect(transaction.instructions[3].keys[4]).toEqual({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false })
    expect(transaction.instructions[3].keys[5]).toEqual({ pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false })

    // create escrow out token account
    let createEscrowTokenAccountInstructionData = routers.solana.api.routeToken.layout.decode(transaction.instructions[4].data)
    expect(createEscrowTokenAccountInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.createEscrowTokenAccount.anchorDiscriminator.toString())
    expect(transaction.instructions[4].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[4].keys.length).toEqual(5)
    expect(transaction.instructions[4].keys[0]).toEqual({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false })
    expect(transaction.instructions[4].keys[1]).toEqual({ pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false })
    expect(transaction.instructions[4].keys[2]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[4].keys[3]).toEqual({ pubkey: new PublicKey(toToken), isSigner: false, isWritable: true })
    expect(transaction.instructions[4].keys[4]).toEqual({ pubkey: new PublicKey(await getEscrowOutTokenAccountAddress({ tokenAddress: toToken })), isSigner: false, isWritable: true })

    // routeOrcaTwoHopSwap
    let routeOrcaTwoHopSwapPaymentInstructionData = routers.solana.api.routeOrcaTwoHopSwap.layout.decode(transaction.instructions[5].data)
    expect(routeOrcaTwoHopSwapPaymentInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.routeOrcaTwoHopSwap.anchorDiscriminator.toString())
    expect(routeOrcaTwoHopSwapPaymentInstructionData.nonce.toString()).toEqual('0')
    expect(routeOrcaTwoHopSwapPaymentInstructionData.amountIn.toString()).toEqual('64')
    expect(routeOrcaTwoHopSwapPaymentInstructionData.amountSpecifiedIsInput).toEqual(true)
    expect(routeOrcaTwoHopSwapPaymentInstructionData.aToBOne).toEqual(false)
    expect(routeOrcaTwoHopSwapPaymentInstructionData.aToBTwo).toEqual(false)
    expect(routeOrcaTwoHopSwapPaymentInstructionData.sqrtPriceLimitOne.toString()).toEqual('79226673515401279992447579055')
    expect(routeOrcaTwoHopSwapPaymentInstructionData.sqrtPriceLimitTwo.toString()).toEqual('79226673515401279992447579055')
    expect(routeOrcaTwoHopSwapPaymentInstructionData.paymentAmount.toString()).toEqual('99000')
    expect(routeOrcaTwoHopSwapPaymentInstructionData.feeAmount.toString()).toEqual('1000')
    expect(transaction.instructions[5].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[5].keys.length).toEqual(23)
    expect(transaction.instructions[5].keys[0]).toEqual({ pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false })
    expect(transaction.instructions[5].keys[1]).toEqual({ pubkey: new PublicKey(routers.solana.ammProgram), isSigner: false, isWritable: false })
    expect(transaction.instructions[5].keys[2]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[5].keys[3]).toEqual({ pubkey: await getPaymentsAccountPublicKey({ fromAddress }), isSigner: false, isWritable: true })
    expect(transaction.instructions[5].keys[4]).toEqual({ pubkey: new PublicKey(poolOne), isSigner: false, isWritable: true })
    expect(transaction.instructions[5].keys[5]).toEqual({ pubkey: new PublicKey(poolTwo), isSigner: false, isWritable: true })
    expect(transaction.instructions[5].keys[6]).toEqual({ pubkey: new PublicKey(await Token.solana.findProgramAddress({ token: fromToken, owner: fromAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[5].keys[7]).toEqual({ pubkey: new PublicKey(tokenVaultOneA), isSigner: false, isWritable: true })
    expect(transaction.instructions[5].keys[8]).toEqual({ pubkey: new PublicKey(tokenVaultOneB), isSigner: false, isWritable: true })
    expect(transaction.instructions[5].keys[9]).toEqual({ pubkey: new PublicKey(await Token.solana.findProgramAddress({ token: tokenMiddle, owner: fromAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[5].keys[10]).toEqual({ pubkey: new PublicKey(tokenVaultTwoA), isSigner: false, isWritable: true })
    expect(transaction.instructions[5].keys[11]).toEqual({ pubkey: new PublicKey(tokenVaultTwoB), isSigner: false, isWritable: true })
    expect(transaction.instructions[5].keys[12]).toEqual({ pubkey: new PublicKey('FzCQDciKKMbLEqPQ3BwuxnTU3M95QgAJHtuqu7uTWKJ2'), isSigner: false, isWritable: true })
    expect(transaction.instructions[5].keys[13]).toEqual({ pubkey: new PublicKey('A6FdY6RXuHbrZvpt5ucefwDHvm99Vog9VUi1BQRfCny6'), isSigner: false, isWritable: true })
    expect(transaction.instructions[5].keys[14]).toEqual({ pubkey: new PublicKey('5ziJFbeTMgNLmRJYks622QmYcezESqU7UQkVAKLeKmEu'), isSigner: false, isWritable: true })
    expect(transaction.instructions[5].keys[15]).toEqual({ pubkey: new PublicKey('4YfkSFsJbpaPuREp5Zoy7W6qeQEN2CS3cmsHzFb2aQmh'), isSigner: false, isWritable: true })
    expect(transaction.instructions[5].keys[16]).toEqual({ pubkey: new PublicKey('7PW4JcLTEAPDuTXyUjdG8dJUh1yrcyMe3kB1HWCZ3NEB'), isSigner: false, isWritable: true })
    expect(transaction.instructions[5].keys[17]).toEqual({ pubkey: new PublicKey('CMdAyAQ35L1voiUz6rrsD53MLo7LrAtx17vifToEU4W8'), isSigner: false, isWritable: true })
    expect(transaction.instructions[5].keys[18]).toEqual({ pubkey: new PublicKey('D5BDybh7EtuiGrEfJHXosToj3hkFJcNwMRVEGeVkpah2'), isSigner: false, isWritable: false })
    expect(transaction.instructions[5].keys[19]).toEqual({ pubkey: new PublicKey('2X2KJM4yQbd6S57MYPLh1WMHJnokH4r1s1P4AKxPgvoN'), isSigner: false, isWritable: false })
    expect(transaction.instructions[5].keys[20]).toEqual({ pubkey: new PublicKey(await getEscrowOutTokenAccountAddress({ tokenAddress: toToken })), isSigner: false, isWritable: true })
    expect(transaction.instructions[5].keys[21]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: toAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[5].keys[22]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: feeReceiverAddress })), isSigner: false, isWritable: true })

  })

  it('does not create additional required accounts if conditions are met', async()=>{

    await mockTokenAccount({ provider, ownerAddress: fromAddress, tokenAddress: tokenMiddle, exists: true })
    await mockTokenAccount({ provider, ownerAddress: toAddress, tokenAddress: toToken, exists: true })
    await mockTokenAccount({ provider, ownerAddress: feeReceiverAddress, tokenAddress: toToken, exists: true })
    await mockEscrowOutTokenAccount({ provider, tokenAddress: toToken, exists: true })
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
    expect(routes[0].fromToken.address).toEqual(fromToken)
    expect(routes[0].fromAmount).toEqual('64')
    expect(routes[0].fromDecimals).toEqual(6)
    expect(routes[0].fromBalance).toEqual('10000000')
    expect(routes[0].toToken.address).toEqual(toToken)
    expect(routes[0].toAmount).toEqual('99000')
    expect(routes[0].toDecimals).toEqual(5)
    expect(routes[0].toAddress).toEqual(toAddress)
    expect(routes[0].fee).toEqual({ amount: '1%', receiver: feeReceiverAddress })
    expect(routes[0].feeAmount).toEqual('1000')
    expect(routes[0].exchangeRoutes.length).toEqual(1)
    expect(routes[0].approvalRequired).toEqual(false)
    expect(routes[0].approvalTransaction).toEqual(undefined)
    expect(routes[0].directTransfer).toEqual(false)

    let transaction = await routes[0].getTransaction()
    expect(transaction.blockchain).toEqual('solana')
    expect(transaction.signers.length).toEqual(0)
    expect(transaction.alts).toEqual(['EYGgx5fYCZtLN2pvnR4Bhn5KpMffKwyHCms4VhjSvF2K'])
    expect(transaction.instructions.length).toEqual(1)

    // routeOrcaTwoHopSwap
    let routeOrcaTwoHopSwapPaymentInstructionData = routers.solana.api.routeOrcaTwoHopSwap.layout.decode(transaction.instructions[0].data)
    expect(routeOrcaTwoHopSwapPaymentInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.routeOrcaTwoHopSwap.anchorDiscriminator.toString())
    expect(routeOrcaTwoHopSwapPaymentInstructionData.nonce.toString()).toEqual('0')
    expect(routeOrcaTwoHopSwapPaymentInstructionData.amountIn.toString()).toEqual('64')
    expect(routeOrcaTwoHopSwapPaymentInstructionData.amountSpecifiedIsInput).toEqual(true)
    expect(routeOrcaTwoHopSwapPaymentInstructionData.aToBOne).toEqual(false)
    expect(routeOrcaTwoHopSwapPaymentInstructionData.aToBTwo).toEqual(false)
    expect(routeOrcaTwoHopSwapPaymentInstructionData.sqrtPriceLimitOne.toString()).toEqual('79226673515401279992447579055')
    expect(routeOrcaTwoHopSwapPaymentInstructionData.sqrtPriceLimitTwo.toString()).toEqual('79226673515401279992447579055')
    expect(routeOrcaTwoHopSwapPaymentInstructionData.paymentAmount.toString()).toEqual('99000')
    expect(routeOrcaTwoHopSwapPaymentInstructionData.feeAmount.toString()).toEqual('1000')
    expect(transaction.instructions[0].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[0].keys.length).toEqual(23)
    expect(transaction.instructions[0].keys[0]).toEqual({ pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false })
    expect(transaction.instructions[0].keys[1]).toEqual({ pubkey: new PublicKey(routers.solana.ammProgram), isSigner: false, isWritable: false })
    expect(transaction.instructions[0].keys[2]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[0].keys[3]).toEqual({ pubkey: await getPaymentsAccountPublicKey({ fromAddress }), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[4]).toEqual({ pubkey: new PublicKey(poolOne), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[5]).toEqual({ pubkey: new PublicKey(poolTwo), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[6]).toEqual({ pubkey: new PublicKey(await Token.solana.findProgramAddress({ token: fromToken, owner: fromAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[7]).toEqual({ pubkey: new PublicKey(tokenVaultOneA), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[8]).toEqual({ pubkey: new PublicKey(tokenVaultOneB), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[9]).toEqual({ pubkey: new PublicKey(await Token.solana.findProgramAddress({ token: tokenMiddle, owner: fromAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[10]).toEqual({ pubkey: new PublicKey(tokenVaultTwoA), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[11]).toEqual({ pubkey: new PublicKey(tokenVaultTwoB), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[12]).toEqual({ pubkey: new PublicKey('FzCQDciKKMbLEqPQ3BwuxnTU3M95QgAJHtuqu7uTWKJ2'), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[13]).toEqual({ pubkey: new PublicKey('A6FdY6RXuHbrZvpt5ucefwDHvm99Vog9VUi1BQRfCny6'), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[14]).toEqual({ pubkey: new PublicKey('5ziJFbeTMgNLmRJYks622QmYcezESqU7UQkVAKLeKmEu'), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[15]).toEqual({ pubkey: new PublicKey('4YfkSFsJbpaPuREp5Zoy7W6qeQEN2CS3cmsHzFb2aQmh'), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[16]).toEqual({ pubkey: new PublicKey('7PW4JcLTEAPDuTXyUjdG8dJUh1yrcyMe3kB1HWCZ3NEB'), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[17]).toEqual({ pubkey: new PublicKey('CMdAyAQ35L1voiUz6rrsD53MLo7LrAtx17vifToEU4W8'), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[18]).toEqual({ pubkey: new PublicKey('D5BDybh7EtuiGrEfJHXosToj3hkFJcNwMRVEGeVkpah2'), isSigner: false, isWritable: false })
    expect(transaction.instructions[0].keys[19]).toEqual({ pubkey: new PublicKey('2X2KJM4yQbd6S57MYPLh1WMHJnokH4r1s1P4AKxPgvoN'), isSigner: false, isWritable: false })
    expect(transaction.instructions[0].keys[20]).toEqual({ pubkey: new PublicKey(await getEscrowOutTokenAccountAddress({ tokenAddress: toToken })), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[21]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: toAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[0].keys[22]).toEqual({ pubkey: new PublicKey(await getTokenAccountAddress({ tokenAddress: toToken, ownerAddress: feeReceiverAddress })), isSigner: false, isWritable: true })

  })
})
