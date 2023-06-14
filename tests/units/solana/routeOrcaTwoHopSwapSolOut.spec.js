import Blockchains from '@depay/web3-blockchains'
import fetchMock from 'fetch-mock'
import { mock, resetMocks } from '@depay/web3-mock'
import { mockAssets } from 'tests/mocks/api'
import { mockPools } from '../../mocks/orca'
import { resetCache, getProvider } from '@depay/web3-client'
import { route, routers } from 'src'
import { struct, u8, u32, u64, publicKey, PublicKey, SystemProgram } from '@depay/solana-web3.js'
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
  getEscrowOutSolAccountAddress,
  mockEscrowOutSolAccount,
} from '../../mocks/solana'

describe('routeTwoHopOrcaSwapSolOut', ()=> {

  const blockchain = 'solana'
  const fromAddress = '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1'
  const toAddress = '5AcFMJZkXo14r3Hj99iYd1HScPiM4hAcLZf552DfZkxa'
  const feeReceiverAddress = '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk'
  const accounts = [fromAddress]
  const fromToken = Blockchains.solana.tokens[4].address
  const toToken = Blockchains.solana.currency.address
  const tokenAmountOut = 0.0001
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
      tokenA: Blockchains.solana.wrapped.address,
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
    expect(routes[0].fromDecimals).toEqual(5)
    expect(routes[0].fromBalance).toEqual('10000000')
    expect(routes[0].toToken.address).toEqual(toToken)
    expect(routes[0].toAmount).toEqual('100000')
    expect(routes[0].toDecimals).toEqual(9)
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
    expect(transaction.signers.length).toEqual(1)
    expect(transaction.alts).toEqual(['EYGgx5fYCZtLN2pvnR4Bhn5KpMffKwyHCms4VhjSvF2K'])
    expect(transaction.instructions.length).toEqual(7)

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

    // create SOL payment receiver
    let transferToReceiverInstructionData = struct([ u32('instruction'), u64('amount') ]).decode(transaction.instructions[2].data)
    expect(transferToReceiverInstructionData.amount.toString()).toEqual('790880')
    expect(transaction.instructions[2].programId.toString()).toEqual(SystemProgram.programId.toString())
    expect(transaction.instructions[2].keys.length).toEqual(2)
    expect(transaction.instructions[2].keys[0]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[2].keys[1]).toEqual({ pubkey: new PublicKey(toAddress), isSigner: false, isWritable: true })

    // create escrow out sol account
    let createEscrowOutSolAccountInstructionData = routers.solana.api.createEscrowSolAccount.layout.decode(transaction.instructions[3].data)
    expect(createEscrowOutSolAccountInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.createEscrowSolAccount.anchorDiscriminator.toString())
    expect(transaction.instructions[3].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[3].keys.length).toEqual(3)
    expect(transaction.instructions[3].keys[0]).toEqual({ pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false })
    expect(transaction.instructions[3].keys[1]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[3].keys[2]).toEqual({ pubkey: await getEscrowOutSolAccountAddress(), isSigner: false, isWritable: true })

    // create temp WSOL account
    let createTempWSolEscrowAccountInstructionData = struct([ u32('instruction'), u64('amount') ]).decode(transaction.instructions[4].data)
    expect(createTempWSolEscrowAccountInstructionData.amount.toString()).toEqual('2039280')
    expect(transaction.instructions[4].programId.toString()).toEqual(SystemProgram.programId.toString())
    expect(transaction.instructions[4].keys.length).toEqual(2)
    expect(transaction.instructions[4].keys[0]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[4].keys[1].isSigner).toEqual(true)
    expect(transaction.instructions[4].keys[1].isWritable).toEqual(true)

    // initalize temp WSOL token account
    let initializeTempWSolEscrowAccountInstructionData = struct([ u8('instruction'), publicKey('owner') ]).decode(transaction.instructions[5].data)
    expect(initializeTempWSolEscrowAccountInstructionData.instruction).toEqual(18)
    expect(initializeTempWSolEscrowAccountInstructionData.owner.toString()).toEqual((await getEscrowOutSolAccountAddress()).toString())
    expect(transaction.instructions[5].programId.toString()).toEqual(Token.solana.TOKEN_PROGRAM)
    expect(transaction.instructions[5].keys.length).toEqual(2)
    expect(transaction.instructions[5].keys[0]).toEqual({ pubkey: transaction.instructions[4].keys[1].pubkey, isSigner: false, isWritable: true })
    expect(transaction.instructions[5].keys[1]).toEqual({ pubkey: new PublicKey(Blockchains.solana.wrapped.address), isSigner: false, isWritable: false })

    // routeOrcaTwoHopSwap
    let routeOrcaTwoHopSwapSolOutPaymentInstructionData = routers.solana.api.routeOrcaTwoHopSwapSolOut.layout.decode(transaction.instructions[6].data)
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.routeOrcaTwoHopSwapSolOut.anchorDiscriminator.toString())
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.nonce.toString()).toEqual('0')
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.amountIn.toString()).toEqual('64')
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.amountSpecifiedIsInput).toEqual(true)
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.aToBOne).toEqual(false)
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.aToBTwo).toEqual(false)
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.sqrtPriceLimitOne.toString()).toEqual('79226673515401279992447579055')
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.sqrtPriceLimitTwo.toString()).toEqual('79226673515401279992447579055')
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.paymentAmount.toString()).toEqual('100000')
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.feeAmount.toString()).toEqual('0')
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.deadline !== undefined).toEqual(true)
    expect(transaction.instructions[6].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[6].keys.length).toEqual(25)
    expect(transaction.instructions[6].keys[0]).toEqual({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false })
    expect(transaction.instructions[6].keys[1]).toEqual({ pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false })
    expect(transaction.instructions[6].keys[2]).toEqual({ pubkey: new PublicKey(routers.solana.ammProgram), isSigner: false, isWritable: false })
    expect(transaction.instructions[6].keys[3]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[6].keys[4]).toEqual({ pubkey: await getPaymentsAccountPublicKey({ fromAddress }), isSigner: false, isWritable: true })
    expect(transaction.instructions[6].keys[5]).toEqual({ pubkey: new PublicKey(await Token.solana.findProgramAddress({ token: fromToken, owner: fromAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[6].keys[6]).toEqual({ pubkey: new PublicKey(poolOne), isSigner: false, isWritable: true })
    expect(transaction.instructions[6].keys[7]).toEqual({ pubkey: new PublicKey(poolTwo), isSigner: false, isWritable: true })
    expect(transaction.instructions[6].keys[8]).toEqual({ pubkey: new PublicKey(tokenVaultOneA), isSigner: false, isWritable: true })
    expect(transaction.instructions[6].keys[9]).toEqual({ pubkey: new PublicKey(tokenVaultOneB), isSigner: false, isWritable: true })
    expect(transaction.instructions[6].keys[10]).toEqual({ pubkey: new PublicKey(await Token.solana.findProgramAddress({ token: tokenMiddle, owner: fromAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[6].keys[11]).toEqual({ pubkey: new PublicKey(tokenVaultTwoA), isSigner: false, isWritable: true })
    expect(transaction.instructions[6].keys[12]).toEqual({ pubkey: new PublicKey(tokenVaultTwoB), isSigner: false, isWritable: true })
    expect(transaction.instructions[6].keys[13]).toEqual({ pubkey: new PublicKey('FzCQDciKKMbLEqPQ3BwuxnTU3M95QgAJHtuqu7uTWKJ2'), isSigner: false, isWritable: true })
    expect(transaction.instructions[6].keys[14]).toEqual({ pubkey: new PublicKey('FzCQDciKKMbLEqPQ3BwuxnTU3M95QgAJHtuqu7uTWKJ2'), isSigner: false, isWritable: true })
    expect(transaction.instructions[6].keys[15]).toEqual({ pubkey: new PublicKey('FzCQDciKKMbLEqPQ3BwuxnTU3M95QgAJHtuqu7uTWKJ2'), isSigner: false, isWritable: true })
    expect(transaction.instructions[6].keys[16]).toEqual({ pubkey: new PublicKey('4YfkSFsJbpaPuREp5Zoy7W6qeQEN2CS3cmsHzFb2aQmh'), isSigner: false, isWritable: true })
    expect(transaction.instructions[6].keys[17]).toEqual({ pubkey: new PublicKey('7PW4JcLTEAPDuTXyUjdG8dJUh1yrcyMe3kB1HWCZ3NEB'), isSigner: false, isWritable: true })
    expect(transaction.instructions[6].keys[18]).toEqual({ pubkey: new PublicKey('CMdAyAQ35L1voiUz6rrsD53MLo7LrAtx17vifToEU4W8'), isSigner: false, isWritable: true })
    expect(transaction.instructions[6].keys[19]).toEqual({ pubkey: new PublicKey('D5BDybh7EtuiGrEfJHXosToj3hkFJcNwMRVEGeVkpah2'), isSigner: false, isWritable: false })
    expect(transaction.instructions[6].keys[20]).toEqual({ pubkey: new PublicKey('2X2KJM4yQbd6S57MYPLh1WMHJnokH4r1s1P4AKxPgvoN'), isSigner: false, isWritable: false })
    expect(transaction.instructions[6].keys[21].isSigner).toEqual(false)
    expect(transaction.instructions[6].keys[21].isWritable).toEqual(true)
    expect(transaction.instructions[6].keys[22]).toEqual({ pubkey: new PublicKey(await await getEscrowOutSolAccountAddress()), isSigner: false, isWritable: true })
    expect(transaction.instructions[6].keys[23]).toEqual({ pubkey: new PublicKey(toAddress), isSigner: false, isWritable: true })
    expect(transaction.instructions[6].keys[24]).toEqual({ pubkey: new PublicKey(toAddress), isSigner: false, isWritable: true })

  })

  it('routes a payment through a twoHopOrcaSwapSolOut + fee', async ()=>{

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
    expect(routes[0].fromDecimals).toEqual(5)
    expect(routes[0].fromBalance).toEqual('10000000')
    expect(routes[0].toToken.address).toEqual(toToken)
    expect(routes[0].toAmount).toEqual('99000')
    expect(routes[0].toDecimals).toEqual(9)
    expect(routes[0].toAddress).toEqual(toAddress)
    expect(routes[0].fee).toEqual({ amount: '1%', receiver: feeReceiverAddress })
    expect(routes[0].feeAmount).toEqual('1000')
    expect(routes[0].exchangeRoutes.length).toEqual(1)
    expect(routes[0].approvalRequired).toEqual(false)
    expect(routes[0].approvalTransaction).toEqual(undefined)
    expect(routes[0].directTransfer).toEqual(false)

    let transaction = await routes[0].getTransaction()
    expect(transaction.blockchain).toEqual('solana')
    expect(transaction.signers.length).toEqual(1)
    expect(transaction.alts).toEqual(['EYGgx5fYCZtLN2pvnR4Bhn5KpMffKwyHCms4VhjSvF2K'])
    expect(transaction.instructions.length).toEqual(8)

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

    // create SOL payment receiver
    let transferToReceiverInstructionData = struct([ u32('instruction'), u64('amount') ]).decode(transaction.instructions[2].data)
    expect(transferToReceiverInstructionData.amount.toString()).toEqual('791880')
    expect(transaction.instructions[2].programId.toString()).toEqual(SystemProgram.programId.toString())
    expect(transaction.instructions[2].keys.length).toEqual(2)
    expect(transaction.instructions[2].keys[0]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[2].keys[1]).toEqual({ pubkey: new PublicKey(toAddress), isSigner: false, isWritable: true })

    // create SOL fee receiver
    let transferToFeeReceiverInstructionData = struct([ u32('instruction'), u64('amount') ]).decode(transaction.instructions[3].data)
    expect(transferToFeeReceiverInstructionData.amount.toString()).toEqual('889880')
    expect(transaction.instructions[3].programId.toString()).toEqual(SystemProgram.programId.toString())
    expect(transaction.instructions[3].keys.length).toEqual(2)
    expect(transaction.instructions[3].keys[0]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[3].keys[1]).toEqual({ pubkey: new PublicKey(feeReceiverAddress), isSigner: false, isWritable: true })

    // create escrow out sol account
    let createEscrowOutSolAccountInstructionData = routers.solana.api.createEscrowSolAccount.layout.decode(transaction.instructions[4].data)
    expect(createEscrowOutSolAccountInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.createEscrowSolAccount.anchorDiscriminator.toString())
    expect(transaction.instructions[4].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[4].keys.length).toEqual(3)
    expect(transaction.instructions[4].keys[0]).toEqual({ pubkey: new PublicKey('11111111111111111111111111111111'), isSigner: false, isWritable: false })
    expect(transaction.instructions[4].keys[1]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[4].keys[2]).toEqual({ pubkey: await getEscrowOutSolAccountAddress(), isSigner: false, isWritable: true })

    // create temp WSOL account
    let createTempWSolEscrowAccountInstructionData = struct([ u32('instruction'), u64('amount') ]).decode(transaction.instructions[5].data)
    expect(createTempWSolEscrowAccountInstructionData.amount.toString()).toEqual('2039280')
    expect(transaction.instructions[5].programId.toString()).toEqual(SystemProgram.programId.toString())
    expect(transaction.instructions[5].keys.length).toEqual(2)
    expect(transaction.instructions[5].keys[0]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[5].keys[1].isSigner).toEqual(true)
    expect(transaction.instructions[5].keys[1].isWritable).toEqual(true)

    // initalize temp WSOL token account
    let initializeTempWSolEscrowAccountInstructionData = struct([ u8('instruction'), publicKey('owner') ]).decode(transaction.instructions[6].data)
    expect(initializeTempWSolEscrowAccountInstructionData.instruction).toEqual(18)
    expect(initializeTempWSolEscrowAccountInstructionData.owner.toString()).toEqual((await getEscrowOutSolAccountAddress()).toString())
    expect(transaction.instructions[6].programId.toString()).toEqual(Token.solana.TOKEN_PROGRAM)
    expect(transaction.instructions[6].keys.length).toEqual(2)
    expect(transaction.instructions[6].keys[0]).toEqual({ pubkey: transaction.instructions[5].keys[1].pubkey, isSigner: false, isWritable: true })
    expect(transaction.instructions[6].keys[1]).toEqual({ pubkey: new PublicKey(Blockchains.solana.wrapped.address), isSigner: false, isWritable: false })

    // routeOrcaTwoHopSwap
    let routeOrcaTwoHopSwapSolOutPaymentInstructionData = routers.solana.api.routeOrcaTwoHopSwapSolOut.layout.decode(transaction.instructions[7].data)
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.routeOrcaTwoHopSwapSolOut.anchorDiscriminator.toString())
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.nonce.toString()).toEqual('0')
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.amountIn.toString()).toEqual('64')
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.amountSpecifiedIsInput).toEqual(true)
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.aToBOne).toEqual(false)
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.aToBTwo).toEqual(false)
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.sqrtPriceLimitOne.toString()).toEqual('79226673515401279992447579055')
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.sqrtPriceLimitTwo.toString()).toEqual('79226673515401279992447579055')
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.paymentAmount.toString()).toEqual('99000')
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.feeAmount.toString()).toEqual('1000')
    expect(transaction.instructions[7].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[7].keys.length).toEqual(25)
    expect(transaction.instructions[7].keys[0]).toEqual({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false })
    expect(transaction.instructions[7].keys[1]).toEqual({ pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false })
    expect(transaction.instructions[7].keys[2]).toEqual({ pubkey: new PublicKey(routers.solana.ammProgram), isSigner: false, isWritable: false })
    expect(transaction.instructions[7].keys[3]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[7].keys[4]).toEqual({ pubkey: await getPaymentsAccountPublicKey({ fromAddress }), isSigner: false, isWritable: true })
    expect(transaction.instructions[7].keys[5]).toEqual({ pubkey: new PublicKey(await Token.solana.findProgramAddress({ token: fromToken, owner: fromAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[7].keys[6]).toEqual({ pubkey: new PublicKey(poolOne), isSigner: false, isWritable: true })
    expect(transaction.instructions[7].keys[7]).toEqual({ pubkey: new PublicKey(poolTwo), isSigner: false, isWritable: true })
    expect(transaction.instructions[7].keys[8]).toEqual({ pubkey: new PublicKey(tokenVaultOneA), isSigner: false, isWritable: true })
    expect(transaction.instructions[7].keys[9]).toEqual({ pubkey: new PublicKey(tokenVaultOneB), isSigner: false, isWritable: true })
    expect(transaction.instructions[7].keys[10]).toEqual({ pubkey: new PublicKey(await Token.solana.findProgramAddress({ token: tokenMiddle, owner: fromAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[7].keys[11]).toEqual({ pubkey: new PublicKey(tokenVaultTwoA), isSigner: false, isWritable: true })
    expect(transaction.instructions[7].keys[12]).toEqual({ pubkey: new PublicKey(tokenVaultTwoB), isSigner: false, isWritable: true })
    expect(transaction.instructions[7].keys[13]).toEqual({ pubkey: new PublicKey('FzCQDciKKMbLEqPQ3BwuxnTU3M95QgAJHtuqu7uTWKJ2'), isSigner: false, isWritable: true })
    expect(transaction.instructions[7].keys[14]).toEqual({ pubkey: new PublicKey('FzCQDciKKMbLEqPQ3BwuxnTU3M95QgAJHtuqu7uTWKJ2'), isSigner: false, isWritable: true })
    expect(transaction.instructions[7].keys[15]).toEqual({ pubkey: new PublicKey('FzCQDciKKMbLEqPQ3BwuxnTU3M95QgAJHtuqu7uTWKJ2'), isSigner: false, isWritable: true })
    expect(transaction.instructions[7].keys[16]).toEqual({ pubkey: new PublicKey('4YfkSFsJbpaPuREp5Zoy7W6qeQEN2CS3cmsHzFb2aQmh'), isSigner: false, isWritable: true })
    expect(transaction.instructions[7].keys[17]).toEqual({ pubkey: new PublicKey('7PW4JcLTEAPDuTXyUjdG8dJUh1yrcyMe3kB1HWCZ3NEB'), isSigner: false, isWritable: true })
    expect(transaction.instructions[7].keys[18]).toEqual({ pubkey: new PublicKey('CMdAyAQ35L1voiUz6rrsD53MLo7LrAtx17vifToEU4W8'), isSigner: false, isWritable: true })
    expect(transaction.instructions[7].keys[19]).toEqual({ pubkey: new PublicKey('D5BDybh7EtuiGrEfJHXosToj3hkFJcNwMRVEGeVkpah2'), isSigner: false, isWritable: false })
    expect(transaction.instructions[7].keys[20]).toEqual({ pubkey: new PublicKey('2X2KJM4yQbd6S57MYPLh1WMHJnokH4r1s1P4AKxPgvoN'), isSigner: false, isWritable: false })
    expect(transaction.instructions[7].keys[21].isSigner).toEqual(false)
    expect(transaction.instructions[7].keys[21].isWritable).toEqual(true)
    expect(transaction.instructions[7].keys[22]).toEqual({ pubkey: new PublicKey(await await getEscrowOutSolAccountAddress()), isSigner: false, isWritable: true })
    expect(transaction.instructions[7].keys[23]).toEqual({ pubkey: new PublicKey(toAddress), isSigner: false, isWritable: true })
    expect(transaction.instructions[7].keys[24]).toEqual({ pubkey: new PublicKey(feeReceiverAddress), isSigner: false, isWritable: true })

  })

  it('does not create additional required accounts if conditions are met', async()=>{

    mock({ provider, blockchain, balance: { for: toAddress, return: 1000000 } })
    mock({ provider, blockchain, balance: { for: feeReceiverAddress, return: 1000000 } })
    await mockTokenAccount({ provider, ownerAddress: fromAddress, tokenAddress: tokenMiddle, exists: true })
    await mockEscrowOutTokenAccount({ provider, tokenAddress: toToken, exists: true })
    await mockPaymentsAccount({ provider, fromAddress, nonce: '0' })
    await mockEscrowOutSolAccount({ provider, exists: true })

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
    expect(routes[0].fromDecimals).toEqual(5)
    expect(routes[0].fromBalance).toEqual('10000000')
    expect(routes[0].toToken.address).toEqual(toToken)
    expect(routes[0].toAmount).toEqual('99000')
    expect(routes[0].toDecimals).toEqual(9)
    expect(routes[0].toAddress).toEqual(toAddress)
    expect(routes[0].fee).toEqual({ amount: '1%', receiver: feeReceiverAddress })
    expect(routes[0].feeAmount).toEqual('1000')
    expect(routes[0].exchangeRoutes.length).toEqual(1)
    expect(routes[0].approvalRequired).toEqual(false)
    expect(routes[0].approvalTransaction).toEqual(undefined)
    expect(routes[0].directTransfer).toEqual(false)

    let transaction = await routes[0].getTransaction()
    expect(transaction.blockchain).toEqual('solana')
    expect(transaction.signers.length).toEqual(1)
    expect(transaction.alts).toEqual(['EYGgx5fYCZtLN2pvnR4Bhn5KpMffKwyHCms4VhjSvF2K'])
    expect(transaction.instructions.length).toEqual(3)

    // create temp WSOL account
    let createTempWSolEscrowAccountInstructionData = struct([ u32('instruction'), u64('amount') ]).decode(transaction.instructions[0].data)
    expect(createTempWSolEscrowAccountInstructionData.amount.toString()).toEqual('2039280')
    expect(transaction.instructions[0].programId.toString()).toEqual(SystemProgram.programId.toString())
    expect(transaction.instructions[0].keys.length).toEqual(2)
    expect(transaction.instructions[0].keys[0]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[0].keys[1].isSigner).toEqual(true)
    expect(transaction.instructions[0].keys[1].isWritable).toEqual(true)

    // initalize temp WSOL token account
    let initializeTempWSolEscrowAccountInstructionData = struct([ u8('instruction'), publicKey('owner') ]).decode(transaction.instructions[1].data)
    expect(initializeTempWSolEscrowAccountInstructionData.instruction).toEqual(18)
    expect(initializeTempWSolEscrowAccountInstructionData.owner.toString()).toEqual((await getEscrowOutSolAccountAddress()).toString())
    expect(transaction.instructions[1].programId.toString()).toEqual(Token.solana.TOKEN_PROGRAM)
    expect(transaction.instructions[1].keys.length).toEqual(2)
    expect(transaction.instructions[1].keys[0]).toEqual({ pubkey: transaction.instructions[0].keys[1].pubkey, isSigner: false, isWritable: true })
    expect(transaction.instructions[1].keys[1]).toEqual({ pubkey: new PublicKey(Blockchains.solana.wrapped.address), isSigner: false, isWritable: false })

    // routeOrcaTwoHopSwap
    let routeOrcaTwoHopSwapSolOutPaymentInstructionData = routers.solana.api.routeOrcaTwoHopSwapSolOut.layout.decode(transaction.instructions[2].data)
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.anchorDiscriminator.toString()).toEqual(routers.solana.api.routeOrcaTwoHopSwapSolOut.anchorDiscriminator.toString())
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.nonce.toString()).toEqual('0')
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.amountIn.toString()).toEqual('64')
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.amountSpecifiedIsInput).toEqual(true)
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.aToBOne).toEqual(false)
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.aToBTwo).toEqual(false)
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.sqrtPriceLimitOne.toString()).toEqual('79226673515401279992447579055')
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.sqrtPriceLimitTwo.toString()).toEqual('79226673515401279992447579055')
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.paymentAmount.toString()).toEqual('99000')
    expect(routeOrcaTwoHopSwapSolOutPaymentInstructionData.feeAmount.toString()).toEqual('1000')
    expect(transaction.instructions[2].programId.toString()).toEqual(routers.solana.address)
    expect(transaction.instructions[2].keys.length).toEqual(25)
    expect(transaction.instructions[2].keys[0]).toEqual({ pubkey: SystemProgram.programId, isSigner: false, isWritable: false })
    expect(transaction.instructions[2].keys[1]).toEqual({ pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false })
    expect(transaction.instructions[2].keys[2]).toEqual({ pubkey: new PublicKey(routers.solana.ammProgram), isSigner: false, isWritable: false })
    expect(transaction.instructions[2].keys[3]).toEqual({ pubkey: new PublicKey(fromAddress), isSigner: true, isWritable: true })
    expect(transaction.instructions[2].keys[4]).toEqual({ pubkey: await getPaymentsAccountPublicKey({ fromAddress }), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[5]).toEqual({ pubkey: new PublicKey(await Token.solana.findProgramAddress({ token: fromToken, owner: fromAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[6]).toEqual({ pubkey: new PublicKey(poolOne), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[7]).toEqual({ pubkey: new PublicKey(poolTwo), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[8]).toEqual({ pubkey: new PublicKey(tokenVaultOneA), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[9]).toEqual({ pubkey: new PublicKey(tokenVaultOneB), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[10]).toEqual({ pubkey: new PublicKey(await Token.solana.findProgramAddress({ token: tokenMiddle, owner: fromAddress })), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[11]).toEqual({ pubkey: new PublicKey(tokenVaultTwoA), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[12]).toEqual({ pubkey: new PublicKey(tokenVaultTwoB), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[13]).toEqual({ pubkey: new PublicKey('FzCQDciKKMbLEqPQ3BwuxnTU3M95QgAJHtuqu7uTWKJ2'), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[14]).toEqual({ pubkey: new PublicKey('FzCQDciKKMbLEqPQ3BwuxnTU3M95QgAJHtuqu7uTWKJ2'), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[15]).toEqual({ pubkey: new PublicKey('FzCQDciKKMbLEqPQ3BwuxnTU3M95QgAJHtuqu7uTWKJ2'), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[16]).toEqual({ pubkey: new PublicKey('4YfkSFsJbpaPuREp5Zoy7W6qeQEN2CS3cmsHzFb2aQmh'), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[17]).toEqual({ pubkey: new PublicKey('7PW4JcLTEAPDuTXyUjdG8dJUh1yrcyMe3kB1HWCZ3NEB'), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[18]).toEqual({ pubkey: new PublicKey('CMdAyAQ35L1voiUz6rrsD53MLo7LrAtx17vifToEU4W8'), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[19]).toEqual({ pubkey: new PublicKey('D5BDybh7EtuiGrEfJHXosToj3hkFJcNwMRVEGeVkpah2'), isSigner: false, isWritable: false })
    expect(transaction.instructions[2].keys[20]).toEqual({ pubkey: new PublicKey('2X2KJM4yQbd6S57MYPLh1WMHJnokH4r1s1P4AKxPgvoN'), isSigner: false, isWritable: false })
    expect(transaction.instructions[2].keys[21].isSigner).toEqual(false)
    expect(transaction.instructions[2].keys[21].isWritable).toEqual(true)
    expect(transaction.instructions[2].keys[22]).toEqual({ pubkey: new PublicKey(await await getEscrowOutSolAccountAddress()), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[23]).toEqual({ pubkey: new PublicKey(toAddress), isSigner: false, isWritable: true })
    expect(transaction.instructions[2].keys[24]).toEqual({ pubkey: new PublicKey(feeReceiverAddress), isSigner: false, isWritable: true })
  })
})
