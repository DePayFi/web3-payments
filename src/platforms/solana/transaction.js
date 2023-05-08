import Blockchains from '@depay/web3-blockchains'
import routers from './routers'
import { BN, PublicKey, Buffer, Transaction, TransactionMessage, VersionedTransaction, TransactionInstruction, SystemProgram, struct, u64, u128, bool, Keypair } from '@depay/solana-web3.js'
import { request, getProvider } from '@depay/web3-client'
import { Token } from '@depay/web3-tokens'

const getWSolSenderAccountKeypairIfNeeded = async ({ paymentRoute })=> {

  if(
    paymentRoute.fromToken.address === Blockchains.solana.currency.address &&
    paymentRoute.toToken.address !== Blockchains.solana.currency.address
  ){
    return Keypair.generate()
  }
}

const createWSolSenderAccount = async ({ wSolSenderAccountKeypair, paymentRoute })=>{

  if(!wSolSenderAccountKeypair) {
    console.log('createWSolSenderAccount NOT NEEDED')
    return
  }

  const wSolStartAmount = paymentRoute.fromToken.address === Blockchains.solana.currency.address ? new BN(paymentRoute.fromAmount) : new BN('0')
  const provider = await getProvider('solana')
  const rent = new BN(await provider.getMinimumBalanceForRentExemption(Token.solana.TOKEN_LAYOUT.span))
  const owner = paymentRoute.fromAddress
  const lamports = wSolStartAmount.add(rent)

  console.log('createWSolSenderAccount NEEDED')
  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: new PublicKey(owner),
    newAccountPubkey: wSolSenderAccountKeypair.publicKey,
    programId: new PublicKey(Token.solana.TOKEN_PROGRAM),
    space: Token.solana.TOKEN_LAYOUT.span,
    lamports
  })
  createAccountInstruction.signers = [wSolSenderAccountKeypair]

  const initializeAccountInstruction = Token.solana.initializeAccountInstruction({
    account: wSolSenderAccountKeypair.publicKey.toString(),
    token: Blockchains.solana.wrapped.address,
    owner
  })

  return [
    createAccountInstruction,
    initializeAccountInstruction
  ]
}

const getMiddleToken = ({ paymentRoute })=>{
  let path = [...paymentRoute.exchangeRoutes[0].path]
  if(path.indexOf(Blockchains.solana.currency.address) > -1) { path.splice(path.indexOf(Blockchains.solana.currency.address), 1) }
  if(path.indexOf(paymentRoute.fromToken.address) > -1) { path.splice(path.indexOf(paymentRoute.fromToken.address), 1) }
  if(path.indexOf(paymentRoute.toToken.address) > -1) { path.splice(path.indexOf(paymentRoute.toToken.address), 1) }

  if(path.length === 2 && path[0] === Blockchains.solana.wrapped.address) {
    return path[1]
  } else { 
    return path[0]
  }
}

const getMiddleTokenAccountAddress = async ({ paymentRoute })=>{

  return await Token.solana.findProgramAddress({
    token: getMiddleToken({ paymentRoute }),
    owner: paymentRoute.fromAddress
  })
}

const getMiddleTokenAccount = async ({ paymentRoute })=> {

  return await Token.solana.findAccount({
    token: getMiddleToken({ paymentRoute }),
    owner: paymentRoute.toAddress
  })
}

const createTokenMiddleAccount = async ({ paymentRoute })=>{

  if(
    paymentRoute.exchangeRoutes.length === 0 ||
    getFixedPath(paymentRoute.exchangeRoutes[0].path).length <= 2
  ) {
    console.log('createTokenMiddleAccount NOT NEEDED exchangeRoutes <= 2')
    return
  }

  const middleTokenAccount = await getMiddleTokenAccount({ paymentRoute })
  if(middleTokenAccount) {
    console.log('createTokenMiddleAccount NOT NEEDED middle token account found')
    return
  }

  console.log('createTokenMiddleAccount NEEDED')
  return Token.solana.createAssociatedTokenAccountInstruction({
    token: getMiddleToken({ paymentRoute }),
    owner: paymentRoute.fromAddress,
    payer: paymentRoute.fromAddress,
  })
}

const closeWSolSenderAccount = async ({ wSolSenderAccountKeypair, paymentRoute })=>{

  if(!wSolSenderAccountKeypair) {
    console.log('closeWSolSenderAccount NOT NEEDED')
    return
  }
  
  console.log('closeWSolSenderAccount NEEDED')
  return Token.solana.closeAccountInstruction({
    account: wSolSenderAccountKeypair.publicKey.toString(),
    owner: paymentRoute.fromAddress
  })
}

const getPaymentsAccountAddress = async({ from })=>{
  let seeds = [Buffer.from("payments"), new PublicKey(from).toBuffer()]

  let [ pdaPublicKey ] = await PublicKey.findProgramAddress(
    seeds, new PublicKey(routers.solana.address)
  )

  return pdaPublicKey
}

const getPaymentsAccountData = async({ from })=>{
  let address = (await getPaymentsAccountAddress({ from })).toString()
  return await request({
    blockchain: 'solana',
    address,
    api: struct([u64('anchorDiscriminator'), u64('nonce')]),
    cache: 1000 
  })
}

const createPaymentsAccount = async({ from })=> {

  let paymentsAccountData = await getPaymentsAccountData({ from })
  if(paymentsAccountData) { 
    console.log('createPaymentsAccount NOT NEEDED')
    return
  }
  
  console.log('createPaymentsAccount NEEDED')
  const keys = [
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: new PublicKey(from), isSigner: true, isWritable: true },
    { pubkey: await getPaymentsAccountAddress({ from }), isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.createPaymentsAccount.layout.span)
  routers.solana.api.createPaymentsAccount.layout.encode({
    anchorDiscriminator: routers.solana.api.createPaymentsAccount.anchorDiscriminator
  }, data)
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const getPaymentSenderTokenAccountAddress = async ({ paymentRoute })=> {

  return await Token.solana.findProgramAddress({
    token: paymentRoute.fromToken.address,
    owner: paymentRoute.fromAddress
  })
}

const getPaymentReceiverTokenAccountAddress = async ({ paymentRoute })=> {

  return await Token.solana.findProgramAddress({
    token: paymentRoute.toToken.address,
    owner: paymentRoute.toAddress
  })
}

const getPaymentReceiverTokenAccount = async ({ paymentRoute })=> {

  return await Token.solana.findAccount({
    token: paymentRoute.toToken.address,
    owner: paymentRoute.toAddress
  })  
}

const createSenderTokenAccount = async({ paymentRoute })=> {

  if(
    paymentRoute.fromToken.address === Blockchains.solana.currency.address &&
    paymentRoute.toToken.address === Blockchains.solana.currency.address
  ){ // SOL <> SOL
    console.log('createSenderTokenAccount NOT NEEDED')
    return
  } else if (
    paymentRoute.fromToken.address === Blockchains.solana.currency.address
  ) {
    console.log('createSenderTokenAccount NEEDED')
    throw('PENDING INTEGRATION')
  }
}

const createPaymentReceiverAccount = async({ paymentRoute })=> {
  
  if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {

    const paymentReceiverBalance = await request({ blockchain: 'solana', method: 'balance', address: paymentRoute.toAddress })
    const provider = await getProvider('solana')
    const rent = new BN(await provider.getMinimumBalanceForRentExemption(0))
    const feeAmount = new BN(paymentRoute.feeAmount)

    if(new BN(paymentReceiverBalance).add(feeAmount).gt(rent)) {
      console.log('createPaymentReceiverAccount NOT NEEDED')
      return
    }
    
    console.log('createPaymentReceiverAccount NEEDED')
    return SystemProgram.transfer({
      fromPubkey: new PublicKey(paymentRoute.fromAddress),
      toPubkey: new PublicKey(paymentRoute.toAddress),
      lamports: rent.sub(feeAmount)
    })
  
  } else {

    const token = paymentRoute.toToken.address === Blockchains.solana.currency.address ? Blockchains.solana.wrapped.address : paymentRoute.toToken.address

    const paymentReceiverTokenAccount = await getPaymentReceiverTokenAccount({ paymentRoute })
    if(paymentReceiverTokenAccount) {
      console.log('createPaymentReceiverAccount NOT NEEDED')
      return
    }

    console.log('createPaymentReceiverAccount NEEDED')
    return Token.solana.createAssociatedTokenAccountInstruction({
      token,
      owner: paymentRoute.toAddress,
      payer: paymentRoute.fromAddress,
    })
  }
}

const getFeeReceiverTokenAccountAddress = async ({ paymentRoute })=> {

  return await Token.solana.findProgramAddress({
    token: paymentRoute.toToken.address,
    owner: paymentRoute.fee.receiver
  })  
}

const getFeeReceiverTokenAccount = async ({ paymentRoute })=> {

  return await Token.solana.findAccount({
    token: paymentRoute.toToken.address,
    owner: paymentRoute.fee.receiver
  })
}

const createFeeReceiverAccount = async({ paymentRoute })=> {
  
  if(!paymentRoute.fee) {
    console.log('createFeeReceiverAccount NOT NEEDED')
    return
  }
  
  if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {

    const feeReceiverBalance = await request({ blockchain: 'solana', method: 'balance', address: paymentRoute.fee.receiver })
    const provider = await getProvider('solana')
    const rent = new BN(await provider.getMinimumBalanceForRentExemption(0))
    const feeAmount = new BN(paymentRoute.feeAmount)

    if(new BN(feeReceiverBalance).add(feeAmount).gt(rent)) {
      console.log('createFeeReceiverAccount NOT NEEDED')
      return
    }
    
    console.log('createFeeReceiverAccount NEEDED')
    return SystemProgram.transfer({
      fromPubkey: new PublicKey(paymentRoute.fromAddress),
      toPubkey: new PublicKey(paymentRoute.fee.receiver),
      lamports: rent.sub(feeAmount)
    })
  
  } else {

    const token = paymentRoute.toToken.address === Blockchains.solana.currency.address ? Blockchains.solana.wrapped.address : paymentRoute.toToken.address

    const feeReceiverTokenAccount = await getFeeReceiverTokenAccount({ paymentRoute })
    if(feeReceiverTokenAccount) {
      console.log('createFeeReceiverAccount NOT NEEDED')
      return
    }

    console.log('createFeeReceiverAccount NEEDED')

    return Token.solana.createAssociatedTokenAccountInstruction({
      token,
      owner: paymentRoute.fee.receiver,
      payer: paymentRoute.fromAddress,
    })
  }
}

const getEscrowAccountPublicKey = async({ paymentRoute })=>{

  let seeds = [Buffer.from("escrow"), new PublicKey(paymentRoute.toToken.address).toBuffer()]
  
  let [ pdaPublicKey, bump ] = await PublicKey.findProgramAddress(
    seeds, new PublicKey(routers.solana.address)
  )

  return pdaPublicKey
}

const getEscrowAccountData = async({ paymentRoute })=>{
  return await request({
    blockchain: 'solana',
    address: (await getEscrowAccountPublicKey({ paymentRoute })).toString(),
    api: Token.solana.TOKEN_LAYOUT,
    cache: 1000 
  })
}

const createEscrowOutTokenAccount = async({ paymentRoute })=> {

  if(paymentRoute.exchangeRoutes.length === 0) {
    console.log('createEscrowOutTokenAccount NOT NEEDED')
    return
  }

  const escrowAccount = await getEscrowAccountData({ paymentRoute })

  if(escrowAccount) {
    console.log('createEscrowOutTokenAccount NOT NEEDED')
    return
  }

  console.log('createEscrowOutTokenAccount NEEDED')
  const keys = [
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    { pubkey: new PublicKey(paymentRoute.toToken.address), isSigner: false, isWritable: true },
    { pubkey: await getEscrowAccountPublicKey({ paymentRoute }), isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.createEscrowAccount.layout.span)
  routers.solana.api.createEscrowAccount.layout.encode({
    anchorDiscriminator: routers.solana.api.createEscrowAccount.anchorDiscriminator
  }, data)
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const getFixedPath = (path)=> path.filter((step)=>step!==Blockchains.solana.currency.address)

const getPaymentMethod = ({ paymentRoute })=>{

  if(
    paymentRoute.fromToken.address === Blockchains.solana.currency.address &&
    paymentRoute.toToken.address === Blockchains.solana.currency.address
  ){

    return 'routeSol'

  } else if (
    paymentRoute.fromToken.address !== Blockchains.solana.currency.address &&
    paymentRoute.toToken.address !== Blockchains.solana.currency.address &&
    paymentRoute.exchangeRoutes.length === 0
  ) {

    return 'routeToken'

  } else if (
    paymentRoute.exchangeRoutes.length > 0 &&
    getFixedPath(paymentRoute.exchangeRoutes[0].path).length === 2
  ) {

    return 'routeOrcaSwap'

  } else if (
    paymentRoute.exchangeRoutes.length > 0 &&
    getFixedPath(paymentRoute.exchangeRoutes[0].path).length > 2
  ) {

    return 'routeOrcaTwoHopSwap'

  } else {

    console.log('paymentRoute', paymentRoute)
    throw 'Payment method does not exist!'

  }
}

const routeSol = async({ paymentRoute, paymentsAccountData }) =>{
  console.log('routeSol')

  const paymentReceiverPublicKey = new PublicKey(paymentRoute.toAddress)
  const feeReceiverPublicKey = paymentRoute.fee ? new PublicKey(paymentRoute.fee.receiver) : paymentReceiverPublicKey

  const keys = [
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    { pubkey: await getPaymentsAccountAddress({ from: paymentRoute.fromAddress }), isSigner: false, isWritable: true },
    { pubkey: paymentReceiverPublicKey, isSigner: false, isWritable: true },
    { pubkey: feeReceiverPublicKey, isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.routeSol.layout.span)
  routers.solana.api.routeSol.layout.encode({
    anchorDiscriminator: routers.solana.api.routeSol.anchorDiscriminator,
    nonce: paymentsAccountData ? paymentsAccountData.nonce : new BN('0'),
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString())
  }, data)
  
  return new TransactionInstruction({
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const routeToken = async({ paymentRoute, paymentsAccountData }) =>{
  console.log('routeToken')

  const senderTokenAccountAddress = await getPaymentSenderTokenAccountAddress({ paymentRoute })
  const paymentReceiverTokenAccountAddress = await getPaymentReceiverTokenAccountAddress({ paymentRoute })
  const feeReceiverTokenAccountAddress = paymentRoute.fee ? await getFeeReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress

  const keys = [
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    { pubkey: await getPaymentsAccountAddress({ from: paymentRoute.fromAddress }), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(senderTokenAccountAddress), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(paymentReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(feeReceiverTokenAccountAddress), isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.routeToken.layout.span)
  routers.solana.api.routeToken.layout.encode({
    anchorDiscriminator: routers.solana.api.routeToken.anchorDiscriminator,
    nonce: paymentsAccountData ? paymentsAccountData.nonce : new BN('0'),
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString())
  }, data)
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers.solana.address),
    data 
  })    
}

const routeOrcaSwap = async({ paymentRoute, paymentsAccountData, wSolSenderAccountKeypair }) =>{
  console.log('routeOrcaSwap')

  const senderTokenAccountAddress = wSolSenderAccountKeypair ? wSolSenderAccountKeypair.publicKey : await getPaymentSenderTokenAccountAddress({ paymentRoute })
  const paymentReceiverTokenAccountAddress = await getPaymentReceiverTokenAccountAddress({ paymentRoute })
  const feeReceiverTokenAccountAddress = paymentRoute.fee ? await getFeeReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress
  const escrowOutPublicKey = await getEscrowAccountPublicKey({ paymentRoute })
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ from: paymentRoute.fromAddress })
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers.solana.ammProgram)

  const SWAP_LAYOUT = struct([
    u64("anchorDiscriminator"),
    u64("amount"),
    u64("otherAmountThreshold"),
    u128("sqrtPriceLimit"),
    bool("amountSpecifiedIsInput"),
    bool("aToB"),
  ])
  const exchangeRouteSwapInstructionData = SWAP_LAYOUT.decode(exchangeRouteSwapInstruction.data)

  const tokenOwnerAccountA = exchangeRouteSwapInstructionData.aToB ? new PublicKey(senderTokenAccountAddress) : escrowOutPublicKey
  const tokenOwnerAccountB = exchangeRouteSwapInstructionData.aToB ? escrowOutPublicKey : new PublicKey(senderTokenAccountAddress)

  const keys = [
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(routers.solana.ammProgram), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    { pubkey: await getPaymentsAccountAddress({ from: paymentRoute.fromAddress }), isSigner: false, isWritable: true },
    exchangeRouteSwapInstruction.keys[2],
    { pubkey: tokenOwnerAccountA, isSigner: false, isWritable: true },
    exchangeRouteSwapInstruction.keys[4],
    { pubkey: tokenOwnerAccountB, isSigner: false, isWritable: true },
    exchangeRouteSwapInstruction.keys[6],
    exchangeRouteSwapInstruction.keys[7],
    exchangeRouteSwapInstruction.keys[8],
    exchangeRouteSwapInstruction.keys[9],
    exchangeRouteSwapInstruction.keys[10],
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    { pubkey: new PublicKey(paymentReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(feeReceiverTokenAccountAddress), isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.routeOrcaSwap.layout.span)
  console.log({
    anchorDiscriminator: routers.solana.api.routeOrcaSwap.anchorDiscriminator,
    nonce: paymentsAccountData ? paymentsAccountData.nonce : new BN('0'),
    amountIn: exchangeRouteSwapInstructionData.amount,
    sqrtPriceLimit: exchangeRouteSwapInstructionData.sqrtPriceLimit,
    amountSpecifiedIsInput: exchangeRouteSwapInstructionData.amountSpecifiedIsInput,
    aToB: exchangeRouteSwapInstructionData.aToB,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString())
  })
  routers.solana.api.routeOrcaSwap.layout.encode({
    anchorDiscriminator: routers.solana.api.routeOrcaSwap.anchorDiscriminator,
    nonce: paymentsAccountData ? paymentsAccountData.nonce : new BN('0'),
    amountIn: exchangeRouteSwapInstructionData.amount,
    sqrtPriceLimit: exchangeRouteSwapInstructionData.sqrtPriceLimit,
    amountSpecifiedIsInput: exchangeRouteSwapInstructionData.amountSpecifiedIsInput,
    aToB: exchangeRouteSwapInstructionData.aToB,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString())
  }, data)
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const routeOrcaTwoHopSwap = async({ paymentRoute, paymentsAccountData, wSolSenderAccountKeypair }) =>{
  console.log('routeOrcaTwoHopSwap')

  const paymentReceiverTokenAccountPublicKey = new PublicKey(await getPaymentReceiverTokenAccountAddress({ paymentRoute }))
  const feeReceiverTokenAccountPublicKey = paymentRoute.fee ? new PublicKey(await getFeeReceiverTokenAccountAddress({ paymentRoute })) : paymentReceiverTokenAccountPublicKey
  const escrowOutPublicKey = await getEscrowAccountPublicKey({ paymentRoute })
  const middleTokenAccountPublicKey = new PublicKey(await getMiddleTokenAccountAddress({ paymentRoute }))
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ from: paymentRoute.fromAddress })
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers.solana.ammProgram)

  const SWAP_LAYOUT = struct([
    u64("anchorDiscriminator"),
    u64("amount"),
    u64("otherAmountThreshold"),
    bool("amountSpecifiedIsInput"),
    bool("aToBOne"),
    bool("aToBTwo"),
    u128("sqrtPriceLimitOne"),
    u128("sqrtPriceLimitTwo"),
  ])
  const exchangeRouteSwapInstructionData = SWAP_LAYOUT.decode(exchangeRouteSwapInstruction.data)

  let tokenOwnerAccountOneA
  if(exchangeRouteSwapInstructionData.aToBOne && wSolSenderAccountKeypair && paymentRoute.fromToken.address == Blockchains.solana.currency.address) {
    tokenOwnerAccountOneA = wSolSenderAccountKeypair.publicKey 
  } else if(exchangeRouteSwapInstructionData.aToBOne) {
    tokenOwnerAccountOneA = await getPaymentSenderTokenAccountAddress({ paymentRoute })
  } else {
    tokenOwnerAccountOneA = middleTokenAccountPublicKey
  }

  let tokenOwnerAccountOneB
  if(!exchangeRouteSwapInstructionData.aToBOne && wSolSenderAccountKeypair && paymentRoute.fromToken.address == Blockchains.solana.currency.address) {
    tokenOwnerAccountOneB = wSolSenderAccountKeypair.publicKey 
  } else if(!exchangeRouteSwapInstructionData.aToBOne) {
    tokenOwnerAccountOneB = await getPaymentSenderTokenAccountAddress({ paymentRoute })
  } else {
    tokenOwnerAccountOneB = middleTokenAccountPublicKey
  }

  let tokenOwnerAccountTwoA
  let tokenOwnerAccountTwoB
  if(exchangeRouteSwapInstructionData.aToBTwo) {
    tokenOwnerAccountTwoA = middleTokenAccountPublicKey
    tokenOwnerAccountTwoB = escrowOutPublicKey
  } else {
    tokenOwnerAccountTwoA = escrowOutPublicKey
    tokenOwnerAccountTwoB = middleTokenAccountPublicKey
  }

  const keys = [
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(routers.solana.ammProgram), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    { pubkey: await getPaymentsAccountAddress({ from: paymentRoute.fromAddress }), isSigner: false, isWritable: true },
    exchangeRouteSwapInstruction.keys[2],
    exchangeRouteSwapInstruction.keys[3],
    { pubkey: tokenOwnerAccountOneA, isSigner: false, isWritable: true },
    exchangeRouteSwapInstruction.keys[5],
    { pubkey: tokenOwnerAccountOneB, isSigner: false, isWritable: true },
    exchangeRouteSwapInstruction.keys[7],
    { pubkey: tokenOwnerAccountTwoA, isSigner: false, isWritable: true },
    exchangeRouteSwapInstruction.keys[9],
    { pubkey: tokenOwnerAccountTwoB, isSigner: false, isWritable: true },
    exchangeRouteSwapInstruction.keys[11],
    exchangeRouteSwapInstruction.keys[12],
    exchangeRouteSwapInstruction.keys[13],
    exchangeRouteSwapInstruction.keys[14],
    exchangeRouteSwapInstruction.keys[15],
    exchangeRouteSwapInstruction.keys[16],
    exchangeRouteSwapInstruction.keys[17],
    exchangeRouteSwapInstruction.keys[18],
    exchangeRouteSwapInstruction.keys[19],
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    { pubkey: paymentReceiverTokenAccountPublicKey, isSigner: false, isWritable: true },
    { pubkey: feeReceiverTokenAccountPublicKey, isSigner: false, isWritable: true },
  ]

  console.log('keys', keys)
  console.log('keys', keys.map((k)=>k.pubkey.toString()))

  const data = Buffer.alloc(routers.solana.api.routeOrcaTwoHopSwap.layout.span)
  routers.solana.api.routeOrcaTwoHopSwap.layout.encode({
    anchorDiscriminator: routers.solana.api.routeOrcaTwoHopSwap.anchorDiscriminator,
    nonce: paymentsAccountData ? paymentsAccountData.nonce : new BN('0'),
    amountIn: exchangeRouteSwapInstructionData.amount,
    amountSpecifiedIsInput: exchangeRouteSwapInstructionData.amountSpecifiedIsInput,
    aToBOne: exchangeRouteSwapInstructionData.aToBOne,
    aToBTwo: exchangeRouteSwapInstructionData.aToBTwo,
    sqrtPriceLimitOne: exchangeRouteSwapInstructionData.sqrtPriceLimitOne,
    sqrtPriceLimitTwo: exchangeRouteSwapInstructionData.sqrtPriceLimitTwo,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString())
  }, data)

  console.log('data', {
    anchorDiscriminator: routers.solana.api.routeOrcaTwoHopSwap.anchorDiscriminator,
    nonce: paymentsAccountData ? paymentsAccountData.nonce : new BN('0'),
    amountIn: exchangeRouteSwapInstructionData.amount,
    amountSpecifiedIsInput: exchangeRouteSwapInstructionData.amountSpecifiedIsInput,
    aToBOne: exchangeRouteSwapInstructionData.aToBOne,
    aToBTwo: exchangeRouteSwapInstructionData.aToBTwo,
    sqrtPriceLimitOne: exchangeRouteSwapInstructionData.sqrtPriceLimitOne,
    sqrtPriceLimitTwo: exchangeRouteSwapInstructionData.sqrtPriceLimitTwo,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString())
  })
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const payment = async({ paymentRoute, wSolSenderAccountKeypair })=> {

  const paymentsAccountData = await getPaymentsAccountData({ from: paymentRoute.fromAddress })
  const paymentMethod = getPaymentMethod({ paymentRoute })

  switch(paymentMethod){
    
    case 'routeSol':
    return await routeSol({ paymentRoute, paymentsAccountData });
    
    case 'routeToken':
    return await routeToken({ paymentRoute, paymentsAccountData });

    case 'routeOrcaSwap':
    return await routeOrcaSwap({ paymentRoute, paymentsAccountData, wSolSenderAccountKeypair });

    case 'routeOrcaTwoHopSwap':
    return await routeOrcaTwoHopSwap({ paymentRoute, paymentsAccountData, wSolSenderAccountKeypair });
  }

}

const getTransaction = async({ paymentRoute })=> {

  const wSolSenderAccountKeypair = await getWSolSenderAccountKeypairIfNeeded({ paymentRoute })

  let instructions = (
    await Promise.all([
      createPaymentsAccount({ from: paymentRoute.fromAddress }),
      createWSolSenderAccount({ paymentRoute, wSolSenderAccountKeypair }),
      createTokenMiddleAccount({ paymentRoute }),
      createPaymentReceiverAccount({ paymentRoute }),
      createFeeReceiverAccount({ paymentRoute }),
      createEscrowOutTokenAccount({ paymentRoute }),
      payment({ paymentRoute, wSolSenderAccountKeypair }),
      closeWSolSenderAccount({ paymentRoute, wSolSenderAccountKeypair }),
    ])
  ).filter(Boolean).flat()

  debug(instructions)

  return {
    blockchain: paymentRoute.blockchain,
    instructions
  }
}

const debug = async(instructions)=>{
  console.log('instructions.length', instructions.length)
  const provider = await getProvider('solana')
  // let simulation = new Transaction({ feePayer: new PublicKey('2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1') })
  // instructions.forEach((instruction)=>simulation.add(instruction))
  // let result
  // console.log('SIMULATE')
  // console.log('SIMULATION RESULT', result)
  let recentBlockhash = (await provider.getLatestBlockhash()).blockhash
  const messageV0 = new TransactionMessage({
    payerKey: new PublicKey('2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1'),
    recentBlockhash,
    instructions,
  }).compileToV0Message()
  const simulation = new VersionedTransaction(messageV0)
  let signers = transaction.instructions.map((instruction)=>instruction.signers).filter(Boolean).flat()
  if(signers.length) {
    simulation.sign(Array.from(new Set(signers)))
  }

  let result
  try{ result = await provider.simulateTransaction(simulation) } catch(e) { console.log('error', e) }
  console.log('SIMULATE')
  console.log('SIMULATION RESULT', result)
}

export {
  getTransaction
}
