import Blockchains from '@depay/web3-blockchains'
import routers from './routers'
import { BN, PublicKey, Buffer, TransactionMessage, VersionedTransaction, TransactionInstruction, SystemProgram, Keypair, struct, u64, u128, bool, publicKey } from '@depay/solana-web3.js'
import { request, getProvider } from '@depay/web3-client'
import Token from '@depay/web3-tokens'

const getWSolSenderAccountKeypairIfNeeded = async ({ paymentRoute })=> {

  if(
    paymentRoute.fromToken.address === Blockchains.solana.currency.address &&
    paymentRoute.toToken.address !== Blockchains.solana.currency.address
  ){
    return Keypair.generate()
  }
}

const getWSolEscrowAccountKeypairIfNeeded = async ({ paymentRoute })=> {

  if(
    paymentRoute.fromToken.address !== Blockchains.solana.currency.address &&
    paymentRoute.toToken.address === Blockchains.solana.currency.address
  ){
    return Keypair.generate()
  }
}

const createWSolSenderAccount = async ({ wSolSenderAccountKeypair, paymentRoute })=>{

  if(!wSolSenderAccountKeypair) {
    return
  }

  const wSolStartAmount = paymentRoute.fromToken.address === Blockchains.solana.currency.address ? new BN(paymentRoute.fromAmount) : new BN('0')
  const provider = await getProvider('solana')
  const rent = new BN(await provider.getMinimumBalanceForRentExemption(Token.solana.TOKEN_LAYOUT.span))
  const owner = paymentRoute.fromAddress
  const lamports = wSolStartAmount.add(rent)

  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: new PublicKey(owner),
    newAccountPubkey: wSolSenderAccountKeypair.publicKey,
    programId: new PublicKey(Token.solana.TOKEN_PROGRAM),
    space: Token.solana.TOKEN_LAYOUT.span,
    lamports
  })

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

const createEscrowOutWSolAccount = async ({ wSolEscrowAccountKeypair, paymentRoute })=>{

  if(!wSolEscrowAccountKeypair) {
    return
  }

  const provider = await getProvider('solana')
  const rent = new BN(await provider.getMinimumBalanceForRentExemption(Token.solana.TOKEN_LAYOUT.span))
  const owner = await getEscrowSolAccountPublicKey()

  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: new PublicKey(paymentRoute.fromAddress),
    newAccountPubkey: wSolEscrowAccountKeypair.publicKey,
    programId: new PublicKey(Token.solana.TOKEN_PROGRAM),
    space: Token.solana.TOKEN_LAYOUT.span,
    lamports: rent
  })

  const initializeAccountInstruction = Token.solana.initializeAccountInstruction({
    account: wSolEscrowAccountKeypair.publicKey.toString(),
    token: Blockchains.solana.wrapped.address,
    owner: owner.toString()
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

  return await request({
    blockchain: 'solana',
    address: await getMiddleTokenAccountAddress({ paymentRoute }),
    api: Token.solana.TOKEN_LAYOUT,
    cache: 1000
  })
}

const createTokenMiddleAccount = async ({ paymentRoute })=>{

  if(
    paymentRoute.exchangeRoutes.length === 0 ||
    getFixedPath(paymentRoute.exchangeRoutes[0].path).length <= 2
  ) {
    return
  }

  const middleTokenAccount = await getMiddleTokenAccount({ paymentRoute })
  if(middleTokenAccount) {
    return
  }

  return Token.solana.createAssociatedTokenAccountInstruction({
    token: getMiddleToken({ paymentRoute }),
    owner: paymentRoute.fromAddress,
    payer: paymentRoute.fromAddress,
  })
}

const closeWSolSenderAccount = async ({ wSolSenderAccountKeypair, paymentRoute })=>{

  if(!wSolSenderAccountKeypair) {
    return
  }
  
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
    return
  }
  
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

const createPaymentReceiverAccount = async({ paymentRoute })=> {
  
  if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {

    const paymentReceiverBalance = await request({ blockchain: 'solana', method: 'balance', address: paymentRoute.toAddress })
    const provider = await getProvider('solana')
    const rent = new BN(await provider.getMinimumBalanceForRentExemption(0))
    const paymentAmount = new BN(paymentRoute.toAmount)

    if(new BN(paymentReceiverBalance).add(paymentAmount).gt(rent)) {
      return
    }
    
    return SystemProgram.transfer({
      fromPubkey: new PublicKey(paymentRoute.fromAddress),
      toPubkey: new PublicKey(paymentRoute.toAddress),
      lamports: rent.sub(paymentAmount)
    })
  
  } else {

    const token = paymentRoute.toToken.address

    const paymentReceiverTokenAccount = await getPaymentReceiverTokenAccount({ paymentRoute })
    if(paymentReceiverTokenAccount) {
      return
    }

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
    return
  }
  
  if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {

    const feeReceiverBalance = await request({ blockchain: 'solana', method: 'balance', address: paymentRoute.fee.receiver })
    const provider = await getProvider('solana')
    const rent = new BN(await provider.getMinimumBalanceForRentExemption(0))
    const feeAmount = new BN(paymentRoute.feeAmount)

    if(new BN(feeReceiverBalance).add(feeAmount).gt(rent)) {
      return
    }
    
    return SystemProgram.transfer({
      fromPubkey: new PublicKey(paymentRoute.fromAddress),
      toPubkey: new PublicKey(paymentRoute.fee.receiver),
      lamports: rent.sub(feeAmount)
    })
  
  } else {

    const token = paymentRoute.toToken.address

    const feeReceiverTokenAccount = await getFeeReceiverTokenAccount({ paymentRoute })
    
    if(feeReceiverTokenAccount) {
      return
    }

    return Token.solana.createAssociatedTokenAccountInstruction({
      token,
      owner: paymentRoute.fee.receiver,
      payer: paymentRoute.fromAddress,
    })
  }
}

const getEscrowSolAccountPublicKey = async()=>{

  let seeds = [Buffer.from("escrow_sol")]
  
  let [ pdaPublicKey, bump ] = await PublicKey.findProgramAddress(
    seeds, new PublicKey(routers.solana.address)
  )

  return pdaPublicKey
}

const getEscrowSolAccountData = async({ paymentRoute })=>{
  return await request({
    blockchain: 'solana',
    address: (await getEscrowSolAccountPublicKey()).toString(),
    api: struct([ u64('amount'), publicKey('owner') ]),
    cache: 1000
  })
}

const getEscrowAccountPublicKey = async({ paymentRoute })=>{

  let seeds = [
    Buffer.from("escrow"),
    new PublicKey(paymentRoute.toToken.address === Blockchains.solana.currency.address ? Blockchains.solana.wrapped.address : paymentRoute.toToken.address).toBuffer()
  ]
  
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

  if(paymentRoute.exchangeRoutes.length === 0 || paymentRoute.toToken.address === Blockchains.solana.currency.address) {
    return
  }

  const escrowAccount = await getEscrowAccountData({ paymentRoute })

  if(escrowAccount) {
    return
  }

  const keys = [
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    { pubkey: new PublicKey(paymentRoute.toToken.address === Blockchains.solana.currency.address ? Blockchains.solana.wrapped.address : paymentRoute.toToken.address), isSigner: false, isWritable: true },
    { pubkey: await getEscrowAccountPublicKey({ paymentRoute }), isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.createEscrowTokenAccount.layout.span)
  routers.solana.api.createEscrowTokenAccount.layout.encode({
    anchorDiscriminator: routers.solana.api.createEscrowTokenAccount.anchorDiscriminator
  }, data)
  
  return new TransactionInstruction({
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const createEscrowOutSolAccount = async({ paymentRoute })=> {

  if(
    paymentRoute.exchangeRoutes.length === 0 ||
    paymentRoute.toToken.address != Blockchains.solana.currency.address
  ) {
    return
  }

  const escrowAccount = await getEscrowSolAccountData({ paymentRoute })

  if(escrowAccount) {
    return
  }

  const keys = [
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    { pubkey: await getEscrowSolAccountPublicKey(), isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.createEscrowSolAccount.layout.span)
  routers.solana.api.createEscrowSolAccount.layout.encode({
    anchorDiscriminator: routers.solana.api.createEscrowSolAccount.anchorDiscriminator
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

    if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {

      return 'routeOrcaSwapSolOut'

    } else {

      return 'routeOrcaSwap'

    }

  } else if (
    paymentRoute.exchangeRoutes.length > 0 &&
    getFixedPath(paymentRoute.exchangeRoutes[0].path).length > 2
  ) {

    if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {

      return 'routeOrcaTwoHopSwapSolOut'

    } else {

      return 'routeOrcaTwoHopSwap'

    }

  } else {

    throw 'Payment method does not exist!'

  }
}

const getDeadline = ()=>{
  return Math.ceil(new Date().getTime()/1000)+1800 // 30 Minutes (lower causes wallet simulation issues)
}

const getNonce = (paymentsAccountData)=>{
  return paymentsAccountData ? paymentsAccountData.nonce : new BN('0')
}

const routeSol = async({ paymentRoute, nonce, deadline }) =>{

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
    nonce,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data)
  
  return new TransactionInstruction({
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const routeToken = async({ paymentRoute, nonce, deadline }) =>{

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
    nonce,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data)
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers.solana.address),
    data 
  })    
}

const routeOrcaSwap = async({ paymentRoute, nonce, wSolSenderAccountKeypair, deadline }) =>{

  const senderTokenAccountAddress = wSolSenderAccountKeypair ? wSolSenderAccountKeypair.publicKey : await getPaymentSenderTokenAccountAddress({ paymentRoute })
  const paymentReceiverTokenAccountAddress = await getPaymentReceiverTokenAccountAddress({ paymentRoute })
  const feeReceiverTokenAccountAddress = paymentRoute.fee ? await getFeeReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress
  const escrowOutPublicKey = await getEscrowAccountPublicKey({ paymentRoute })
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress })
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

  const keys = [
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // amm_program
    { pubkey: new PublicKey(routers.solana.ammProgram), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // payments
    { pubkey: await getPaymentsAccountAddress({ from: paymentRoute.fromAddress }), isSigner: false, isWritable: true },
    // sender_token_account
    { pubkey: new PublicKey(senderTokenAccountAddress), isSigner: false, isWritable: true },
    // whirlpool
    exchangeRouteSwapInstruction.keys[2],
    // token_vault_a
    exchangeRouteSwapInstruction.keys[4],
    // token_vault_b
    exchangeRouteSwapInstruction.keys[6],
    // tick_array_0
    exchangeRouteSwapInstruction.keys[7],
    // tick_array_1
    exchangeRouteSwapInstruction.keys[8],
    // tick_array_2
    exchangeRouteSwapInstruction.keys[9],
    // oracle
    exchangeRouteSwapInstruction.keys[10],
    // escrow_out
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(feeReceiverTokenAccountAddress), isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.routeOrcaSwap.layout.span)
  routers.solana.api.routeOrcaSwap.layout.encode({
    anchorDiscriminator: routers.solana.api.routeOrcaSwap.anchorDiscriminator,
    nonce,
    amountIn: exchangeRouteSwapInstructionData.amount,
    sqrtPriceLimit: exchangeRouteSwapInstructionData.sqrtPriceLimit,
    amountSpecifiedIsInput: exchangeRouteSwapInstructionData.amountSpecifiedIsInput,
    aToB: exchangeRouteSwapInstructionData.aToB,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data)
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const routeOrcaSwapSolOut = async({ paymentRoute, nonce, wSolEscrowAccountKeypair, deadline }) =>{

  const senderTokenAccountAddress = await getPaymentSenderTokenAccountAddress({ paymentRoute })
  const escrowOutWsolPublicKey = wSolEscrowAccountKeypair.publicKey
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress })
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

  const keys = [
    // system_program
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // amm_program
    { pubkey: new PublicKey(routers.solana.ammProgram), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // payments
    { pubkey: await getPaymentsAccountAddress({ from: paymentRoute.fromAddress }), isSigner: false, isWritable: true },
    // sender_token_account
    { pubkey: new PublicKey(senderTokenAccountAddress), isSigner: false, isWritable: true },
    // whirlpool
    exchangeRouteSwapInstruction.keys[2],
    // token_vault_a
    exchangeRouteSwapInstruction.keys[4],
    // token_vault_b
    exchangeRouteSwapInstruction.keys[6],
    // tick_array_0
    exchangeRouteSwapInstruction.keys[7],
    // tick_array_1
    exchangeRouteSwapInstruction.keys[8],
    // tick_array_2
    exchangeRouteSwapInstruction.keys[9],
    // oracle
    exchangeRouteSwapInstruction.keys[10],
    // escrow_out
    { pubkey: escrowOutWsolPublicKey, isSigner: false, isWritable: true },
    // escrow_out_sol
    { pubkey: await getEscrowSolAccountPublicKey(), isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentRoute.toAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(paymentRoute.fee ? paymentRoute.fee.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.routeOrcaSwapSolOut.layout.span)
  routers.solana.api.routeOrcaSwapSolOut.layout.encode({
    anchorDiscriminator: routers.solana.api.routeOrcaSwapSolOut.anchorDiscriminator,
    nonce,
    amountIn: exchangeRouteSwapInstructionData.amount,
    sqrtPriceLimit: exchangeRouteSwapInstructionData.sqrtPriceLimit,
    amountSpecifiedIsInput: exchangeRouteSwapInstructionData.amountSpecifiedIsInput,
    aToB: exchangeRouteSwapInstructionData.aToB,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data)
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const routeOrcaTwoHopSwap = async({ paymentRoute, nonce, wSolSenderAccountKeypair, deadline }) =>{

  const paymentReceiverTokenAccountPublicKey = new PublicKey(await getPaymentReceiverTokenAccountAddress({ paymentRoute }))
  const feeReceiverTokenAccountPublicKey = paymentRoute.fee ? new PublicKey(await getFeeReceiverTokenAccountAddress({ paymentRoute })) : paymentReceiverTokenAccountPublicKey
  const escrowOutPublicKey = await getEscrowAccountPublicKey({ paymentRoute })
  const middleTokenAccountPublicKey = new PublicKey(await getMiddleTokenAccountAddress({ paymentRoute }))
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress })
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers.solana.ammProgram)
  const senderTokenAccountPublicKey = wSolSenderAccountKeypair ? wSolSenderAccountKeypair.publicKey : new PublicKey(await getPaymentSenderTokenAccountAddress({ paymentRoute }))

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

  const keys = [
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // amm_program
    { pubkey: new PublicKey(routers.solana.ammProgram), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // payments
    { pubkey: await getPaymentsAccountAddress({ from: paymentRoute.fromAddress }), isSigner: false, isWritable: true },
    // whirlpool_one
    exchangeRouteSwapInstruction.keys[2],
    // whirlpool_two
    exchangeRouteSwapInstruction.keys[3],
    // sender_token_account
    { pubkey: senderTokenAccountPublicKey, isSigner: false, isWritable: true },
    // token_vault_one_a
    exchangeRouteSwapInstruction.keys[5],
    // token_vault_one_b
    exchangeRouteSwapInstruction.keys[7],
    // middle_token_account
    { pubkey: middleTokenAccountPublicKey, isSigner: false, isWritable: true },
    // token_vault_two_a
    exchangeRouteSwapInstruction.keys[9],
    // token_vault_two_b
    exchangeRouteSwapInstruction.keys[11],
    // tick_array_one_0
    exchangeRouteSwapInstruction.keys[12],
    // tick_array_one_1
    exchangeRouteSwapInstruction.keys[13],
    // tick_array_one_2
    exchangeRouteSwapInstruction.keys[14],
    // tick_array_two_0
    exchangeRouteSwapInstruction.keys[15],
    // tick_array_two_1
    exchangeRouteSwapInstruction.keys[16],
    // tick_array_two_2
    exchangeRouteSwapInstruction.keys[17],
    // oracle_one
    exchangeRouteSwapInstruction.keys[18],
    // oracle_two
    exchangeRouteSwapInstruction.keys[19],
    // escrow_out
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: paymentReceiverTokenAccountPublicKey, isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: feeReceiverTokenAccountPublicKey, isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.routeOrcaTwoHopSwap.layout.span)
  routers.solana.api.routeOrcaTwoHopSwap.layout.encode({
    anchorDiscriminator: routers.solana.api.routeOrcaTwoHopSwap.anchorDiscriminator,
    nonce,
    amountIn: exchangeRouteSwapInstructionData.amount,
    amountSpecifiedIsInput: exchangeRouteSwapInstructionData.amountSpecifiedIsInput,
    aToBOne: exchangeRouteSwapInstructionData.aToBOne,
    aToBTwo: exchangeRouteSwapInstructionData.aToBTwo,
    sqrtPriceLimitOne: exchangeRouteSwapInstructionData.sqrtPriceLimitOne,
    sqrtPriceLimitTwo: exchangeRouteSwapInstructionData.sqrtPriceLimitTwo,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data)
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const routeOrcaTwoHopSwapSolOut = async({ paymentRoute, nonce, wSolEscrowAccountKeypair, deadline }) =>{

  const middleTokenAccountPublicKey = new PublicKey(await getMiddleTokenAccountAddress({ paymentRoute }))
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress })
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers.solana.ammProgram)
  const senderTokenAccountPublicKey = new PublicKey(await getPaymentSenderTokenAccountAddress({ paymentRoute }))

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

  const keys = [
    // system_program
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // amm_program
    { pubkey: new PublicKey(routers.solana.ammProgram), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // payments
    { pubkey: await getPaymentsAccountAddress({ from: paymentRoute.fromAddress }), isSigner: false, isWritable: true },
    // sender_token_account
    { pubkey: senderTokenAccountPublicKey, isSigner: false, isWritable: true },
    // whirlpool_one
    exchangeRouteSwapInstruction.keys[2],
    // whirlpool_two
    exchangeRouteSwapInstruction.keys[3],
    // token_vault_one_a
    exchangeRouteSwapInstruction.keys[5],
    // token_vault_one_b
    exchangeRouteSwapInstruction.keys[7],
    // middle_token_account
    { pubkey: middleTokenAccountPublicKey, isSigner: false, isWritable: true },
    // token_vault_two_a
    exchangeRouteSwapInstruction.keys[9],
    // token_vault_two_b
    exchangeRouteSwapInstruction.keys[11],
    // tick_array_one_0
    exchangeRouteSwapInstruction.keys[12],
    // tick_array_one_1
    exchangeRouteSwapInstruction.keys[13],
    // tick_array_one_2
    exchangeRouteSwapInstruction.keys[14],
    // tick_array_two_0
    exchangeRouteSwapInstruction.keys[15],
    // tick_array_two_1
    exchangeRouteSwapInstruction.keys[16],
    // tick_array_two_2
    exchangeRouteSwapInstruction.keys[17],
    // oracle_one
    exchangeRouteSwapInstruction.keys[18],
    // oracle_two
    exchangeRouteSwapInstruction.keys[19],
    // escrow_out
    { pubkey: wSolEscrowAccountKeypair.publicKey, isSigner: false, isWritable: true },
    // escrow_out_sol
    { pubkey: await getEscrowSolAccountPublicKey(), isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentRoute.toAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(paymentRoute.fee ? paymentRoute.fee.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.routeOrcaTwoHopSwapSolOut.layout.span)
  routers.solana.api.routeOrcaTwoHopSwapSolOut.layout.encode({
    anchorDiscriminator: routers.solana.api.routeOrcaTwoHopSwapSolOut.anchorDiscriminator,
    nonce,
    amountIn: exchangeRouteSwapInstructionData.amount,
    amountSpecifiedIsInput: exchangeRouteSwapInstructionData.amountSpecifiedIsInput,
    aToBOne: exchangeRouteSwapInstructionData.aToBOne,
    aToBTwo: exchangeRouteSwapInstructionData.aToBTwo,
    sqrtPriceLimitOne: exchangeRouteSwapInstructionData.sqrtPriceLimitOne,
    sqrtPriceLimitTwo: exchangeRouteSwapInstructionData.sqrtPriceLimitTwo,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data)
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const payment = async({ paymentRoute, wSolSenderAccountKeypair, wSolEscrowAccountKeypair, nonce, deadline })=> {

  const paymentMethod = getPaymentMethod({ paymentRoute })

  switch(paymentMethod){
    
    case 'routeSol':
    return await routeSol({ paymentRoute, nonce, deadline });
    
    case 'routeToken':
    return await routeToken({ paymentRoute, nonce, deadline });

    case 'routeOrcaSwap':
    return await routeOrcaSwap({ paymentRoute, nonce, wSolSenderAccountKeypair, deadline });

    case 'routeOrcaSwapSolOut':
    return await routeOrcaSwapSolOut({ paymentRoute, nonce, wSolEscrowAccountKeypair, deadline });

    case 'routeOrcaTwoHopSwap':
    return await routeOrcaTwoHopSwap({ paymentRoute, nonce, wSolSenderAccountKeypair, deadline });

    case 'routeOrcaTwoHopSwapSolOut':
    return await routeOrcaTwoHopSwapSolOut({ paymentRoute, nonce, wSolEscrowAccountKeypair, deadline });

  }

}

const getTransaction = async({ paymentRoute })=> {

  const paymentsAccountData = await getPaymentsAccountData({ from: paymentRoute.fromAddress })
  const deadline = getDeadline()
  const nonce = getNonce(paymentsAccountData)

  const wSolSenderAccountKeypair = await getWSolSenderAccountKeypairIfNeeded({ paymentRoute })
  const wSolEscrowAccountKeypair = await getWSolEscrowAccountKeypairIfNeeded({ paymentRoute })

  let instructions = (
    await Promise.all([
      createPaymentsAccount({ from: paymentRoute.fromAddress }),
      createWSolSenderAccount({ paymentRoute, wSolSenderAccountKeypair }),
      createTokenMiddleAccount({ paymentRoute }),
      createPaymentReceiverAccount({ paymentRoute }),
      createFeeReceiverAccount({ paymentRoute }),
      createEscrowOutSolAccount({ paymentRoute }), // needs to happen before createEscrowOutWSolAccount
      createEscrowOutWSolAccount({ paymentRoute, wSolEscrowAccountKeypair }),
      createEscrowOutTokenAccount({ paymentRoute }),
      payment({ paymentRoute, wSolSenderAccountKeypair, wSolEscrowAccountKeypair, nonce, deadline }),
      closeWSolSenderAccount({ paymentRoute, wSolSenderAccountKeypair }),
    ])
  ).filter(Boolean).flat()

  const transaction = {
    blockchain: paymentRoute.blockchain,
    instructions,
    signers: [wSolSenderAccountKeypair, wSolEscrowAccountKeypair].filter(Boolean),
    alts: [routers.solana.alt]
  }

  // debug(transaction, paymentRoute)

  transaction.deadline = deadline
  transaction.nonce = nonce.toString()

  return transaction
}

const debug = async(transaction, paymentRoute)=>{
  console.log('transaction.instructions.length', transaction.instructions.length)
  const provider = await getProvider('solana')
  let recentBlockhash = (await provider.getLatestBlockhash()).blockhash
  const messageV0 = new TransactionMessage({
    payerKey: new PublicKey(paymentRoute.fromAddress),
    recentBlockhash,
    instructions: transaction.instructions,
  }).compileToV0Message(
    transaction.alts ? await Promise.all(transaction.alts.map(async(alt)=>{
      return provider.getAddressLookupTable(new PublicKey(alt)).then((res) => res.value)
    })) : undefined
  )
  const tx = new VersionedTransaction(messageV0)
  if(transaction.signers.length) {
    tx.sign(Array.from(new Set(transaction.signers)))
  }

  let result
  try{ result = await provider.simulateTransaction(tx) } catch(e) { console.log('error', e) }
  console.log('SIMULATE')
  console.log('SIMULATION RESULT', result)
}

export {
  getTransaction
}
