import Blockchains from '@depay/web3-blockchains'
import routers from './routers'
import { ComputeBudgetProgram, BN, PublicKey, Buffer, TransactionMessage, VersionedTransaction, TransactionInstruction, SystemProgram, Keypair, struct, u64, u128, bool, publicKey } from '@depay/solana-web3.js'
import { request, getProvider } from '@depay/web3-client'
import Token from '@depay/web3-tokens'

const createComputeInstruction = async ({ paymentRoute })=> {

  if(
    paymentRoute.exchangeRoutes.length > 0 &&
    getFixedPath(paymentRoute.exchangeRoutes[0].path).length > 2 &&
    paymentRoute.exchangeRoutes[0].exchange.name == 'raydium_cl'
  ) {
    return ComputeBudgetProgram.setComputeUnitLimit({ units: 300000 })
  }
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

const getFee2ReceiverTokenAccountAddress = async ({ paymentRoute })=> {

  return await Token.solana.findProgramAddress({
    token: paymentRoute.toToken.address,
    owner: paymentRoute.fee2.receiver
  })  
}

const getFeeReceiverTokenAccount = async ({ paymentRoute })=> {

  return await Token.solana.findAccount({
    token: paymentRoute.toToken.address,
    owner: paymentRoute.fee.receiver
  })
}

const getFee2ReceiverTokenAccount = async ({ paymentRoute })=> {

  return await Token.solana.findAccount({
    token: paymentRoute.toToken.address,
    owner: paymentRoute.fee2.receiver
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

const createFee2ReceiverAccount = async({ paymentRoute })=> {
  
  if(!paymentRoute.fee2) {
    return
  }
  
  if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {

    const feeReceiverBalance = await request({ blockchain: 'solana', method: 'balance', address: paymentRoute.fee2.receiver })
    const provider = await getProvider('solana')
    const rent = new BN(await provider.getMinimumBalanceForRentExemption(0))
    const feeAmount = new BN(paymentRoute.feeAmount2)

    if(new BN(feeReceiverBalance).add(feeAmount).gt(rent)) {
      return
    }
    
    return SystemProgram.transfer({
      fromPubkey: new PublicKey(paymentRoute.fromAddress),
      toPubkey: new PublicKey(paymentRoute.fee2.receiver),
      lamports: rent.sub(feeAmount)
    })
  
  } else {

    const token = paymentRoute.toToken.address

    const feeReceiverTokenAccount = await getFee2ReceiverTokenAccount({ paymentRoute })
    
    if(feeReceiverTokenAccount) {
      return
    }

    return Token.solana.createAssociatedTokenAccountInstruction({
      token,
      owner: paymentRoute.fee2.receiver,
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

const createEscrowOutSolAccount = async({ paymentRoute })=> {

  return; // this is only ever needed once and never again

  if(
    paymentRoute.toToken.address != Blockchains.solana.currency.address &&
    paymentRoute.fromToken.address != Blockchains.solana.currency.address
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

const getEscrowInWSolAccountPublicKey = async()=>{

  let seeds = [
    Buffer.from("escrow"),
    new PublicKey(Blockchains.solana.wrapped.address).toBuffer()
  ]
  
  let [ pdaPublicKey, bump ] = await PublicKey.findProgramAddress(
    seeds, new PublicKey(routers.solana.address)
  )

  return pdaPublicKey
}

const getEscrowInWSolAccountData = async({ paymentRoute })=>{
  return await request({
    blockchain: 'solana',
    address: (await getEscrowInWSolAccountPublicKey()).toString(),
    api: Token.solana.TOKEN_LAYOUT,
    cache: 1000
  })
}

const createEscrowInWSOLTokenAccount = async({ paymentRoute })=> {

  return; // this is only ever needed once and never again

  if(
    paymentRoute.fromToken.address !== Blockchains.solana.currency.address ||
    paymentRoute.exchangeRoutes[0].path[1] != Blockchains.solana.wrapped.address
  ) {
    return
  }

  const escrowInWSolAccount = await getEscrowInWSolAccountData({ paymentRoute })

  if(escrowInWSolAccount) {
    return
  }

  const keys = [
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    { pubkey: new PublicKey(Blockchains.solana.wrapped.address), isSigner: false, isWritable: true },
    { pubkey: await getEscrowInWSolAccountPublicKey({ paymentRoute }), isSigner: false, isWritable: true },
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

const getEscrowOutWSolAccountPublicKey = async()=>{

  let seeds = [Buffer.from("escrow_wsol")]
  
  let [ pdaPublicKey, bump ] = await PublicKey.findProgramAddress(
    seeds, new PublicKey(routers.solana.address)
  )

  return pdaPublicKey
}

const getEscrowOutAccountPublicKey = async({ paymentRoute })=>{

  let seeds = [
    Buffer.from("escrow"),
    new PublicKey(paymentRoute.toToken.address === Blockchains.solana.currency.address ? Blockchains.solana.wrapped.address : paymentRoute.toToken.address).toBuffer()
  ]
  
  let [ pdaPublicKey, bump ] = await PublicKey.findProgramAddress(
    seeds, new PublicKey(routers.solana.address)
  )

  return pdaPublicKey
}

const getEscrowOutAccountData = async({ paymentRoute })=>{
  return await request({
    blockchain: 'solana',
    address: (await getEscrowOutAccountPublicKey({ paymentRoute })).toString(),
    api: Token.solana.TOKEN_LAYOUT,
    cache: 1000
  })
}

const createEscrowOutTokenAccount = async({ paymentRoute })=> {

  if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {
    return
  }

  const escrowOutAccount = await getEscrowOutAccountData({ paymentRoute })

  if(escrowOutAccount) {
    return
  }

  const keys = [
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    { pubkey: new PublicKey(paymentRoute.toToken.address === Blockchains.solana.currency.address ? Blockchains.solana.wrapped.address : paymentRoute.toToken.address), isSigner: false, isWritable: true },
    { pubkey: await getEscrowOutAccountPublicKey({ paymentRoute }), isSigner: false, isWritable: true },
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

const getEscrowMiddleAccountPublicKey = async({ paymentRoute })=>{

  let seeds = [
    Buffer.from("escrow"),
    new PublicKey(getFixedPath(paymentRoute.exchangeRoutes[0].path)[1]).toBuffer()
  ]
  
  let [ pdaPublicKey, bump ] = await PublicKey.findProgramAddress(
    seeds, new PublicKey(routers.solana.address)
  )

  return pdaPublicKey
}

const getEscrowMiddleAccountData = async({ paymentRoute })=>{
  return await request({
    blockchain: 'solana',
    address: (await getEscrowMiddleAccountPublicKey({ paymentRoute })).toString(),
    api: Token.solana.TOKEN_LAYOUT,
    cache: 1000
  })
}

const createEscrowMiddleTokenAccount = async({ paymentRoute })=> {

  if(
    paymentRoute.exchangeRoutes == undefined ||
    paymentRoute.exchangeRoutes[0] == undefined ||
    getFixedPath(paymentRoute.exchangeRoutes[0].path).length <= 2
  ) {
    return
  }

  const escrowMiddleAccount = await getEscrowMiddleAccountData({ paymentRoute })

  if(escrowMiddleAccount) {
    return
  }

  const keys = [
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    { pubkey: new PublicKey(getFixedPath(paymentRoute.exchangeRoutes[0].path)[1]), isSigner: false, isWritable: true },
    { pubkey: await getEscrowMiddleAccountPublicKey({ paymentRoute }), isSigner: false, isWritable: true },
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

// returns the actual path on the dex without including native currency
const getFixedPath = (path)=> {
  return path.map((step)=>step===Blockchains.solana.currency.address ? Blockchains.solana.wrapped.address : step).filter(Boolean)
}

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
    getFixedPath(paymentRoute.exchangeRoutes[0].path).length === 2 &&
    paymentRoute.exchangeRoutes[0].exchange.name == 'orca'
  ) {

    if(paymentRoute.fromToken.address === Blockchains.solana.currency.address) {

      return 'routeOrcaSwapSolIn'

    } else if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {

      return 'routeOrcaSwapSolOut'

    } else {

      return 'routeOrcaSwap'

    }

  } else if (
    paymentRoute.exchangeRoutes.length > 0 &&
    getFixedPath(paymentRoute.exchangeRoutes[0].path).length > 2 &&
    paymentRoute.exchangeRoutes[0].exchange.name == 'orca'
  ) {

    if(paymentRoute.fromToken.address === Blockchains.solana.currency.address) {

      return 'routeOrcaTwoHopSwapSolIn'

    } else if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {

      return 'routeOrcaTwoHopSwapSolOut'

    } else {

      return 'routeOrcaTwoHopSwap'

    }

  } else if (
    paymentRoute.exchangeRoutes.length > 0 &&
    getFixedPath(paymentRoute.exchangeRoutes[0].path).length === 2 &&
    paymentRoute.exchangeRoutes[0].exchange.name == 'raydium_cp'
  ) {

    if(paymentRoute.fromToken.address === Blockchains.solana.currency.address) {

      return 'routeRaydiumCpSwapSolIn'

    } else if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {

      return 'routeRaydiumCpSwapSolOut'

    } else {

      return 'routeRaydiumCpSwap'

    }

  } else if (
    paymentRoute.exchangeRoutes.length > 0 &&
    getFixedPath(paymentRoute.exchangeRoutes[0].path).length > 2 &&
    paymentRoute.exchangeRoutes[0].exchange.name == 'raydium_cp'
  ) {

    if(paymentRoute.fromToken.address === Blockchains.solana.currency.address) {
      
      return 'routeRaydiumCpTwoHopSwapSolIn'

    } else if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {

      return 'routeRaydiumCpTwoHopSwapSolOut'

    } else {

      return 'routeRaydiumCpTwoHopSwap'

    }

  } else if (
    paymentRoute.exchangeRoutes.length > 0 &&
    getFixedPath(paymentRoute.exchangeRoutes[0].path).length === 2 &&
    paymentRoute.exchangeRoutes[0].exchange.name == 'raydium_cl'
  ) {

    if(paymentRoute.fromToken.address === Blockchains.solana.currency.address) {

      return 'routeRaydiumClSwapSolIn'

    } else if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {

      return 'routeRaydiumClSwapSolOut'

    } else {

      return 'routeRaydiumClSwap'

    }

  } else if (
    paymentRoute.exchangeRoutes.length > 0 &&
    getFixedPath(paymentRoute.exchangeRoutes[0].path).length > 2 &&
    paymentRoute.exchangeRoutes[0].exchange.name == 'raydium_cl'
  ) {

    if(paymentRoute.fromToken.address === Blockchains.solana.currency.address) {

      return 'routeRaydiumClTwoHopSwapSolIn'

    } else if(paymentRoute.toToken.address === Blockchains.solana.currency.address) {

      return 'routeRaydiumClTwoHopSwapSolOut'

    } else {

      return 'routeRaydiumClTwoHopSwap'

    }

  } else {

    throw 'Payment method does not exist!'

  }
}

const getDeadline = ()=>{
  return Math.ceil(new Date().getTime())+(5 *60*1000) // 5 minutes in milliseconds
}

const routeSol = async({ paymentRoute, deadline }) =>{

  const paymentReceiverPublicKey = new PublicKey(paymentRoute.toAddress)
  const feeReceiverPublicKey = paymentRoute.fee ? new PublicKey(paymentRoute.fee.receiver) : paymentReceiverPublicKey
  const feeReceiver2PublicKey = paymentRoute.fee2 ? new PublicKey(paymentRoute.fee2.receiver) : paymentReceiverPublicKey

  const keys = [
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    { pubkey: paymentReceiverPublicKey, isSigner: false, isWritable: true },
    { pubkey: feeReceiverPublicKey, isSigner: false, isWritable: true },
    { pubkey: feeReceiver2PublicKey, isSigner: false, isWritable: true },
    { pubkey: await getEscrowSolAccountPublicKey(), isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.routeSol.layout.span)
  routers.solana.api.routeSol.layout.encode({
    anchorDiscriminator: routers.solana.api.routeSol.anchorDiscriminator,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data)
  
  return new TransactionInstruction({
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const routeToken = async({ paymentRoute, deadline }) =>{

  const senderTokenAccountAddress = await getPaymentSenderTokenAccountAddress({ paymentRoute })
  const paymentReceiverTokenAccountAddress = await getPaymentReceiverTokenAccountAddress({ paymentRoute })
  const feeReceiverTokenAccountAddress = paymentRoute.fee ? await getFeeReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress
  const fee2ReceiverTokenAccountAddress = paymentRoute.fee2 ? await getFee2ReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress

  const keys = [
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    { pubkey: new PublicKey(senderTokenAccountAddress), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(paymentReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(feeReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(fee2ReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    { pubkey: await getEscrowOutAccountPublicKey({ paymentRoute }), isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.routeToken.layout.span)
  routers.solana.api.routeToken.layout.encode({
    anchorDiscriminator: routers.solana.api.routeToken.anchorDiscriminator,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data)
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers.solana.address),
    data 
  })    
}

const routeOrcaSwap = async({ paymentRoute, deadline }) =>{

  const senderTokenAccountAddress = await getPaymentSenderTokenAccountAddress({ paymentRoute })
  const paymentReceiverTokenAccountAddress = await getPaymentReceiverTokenAccountAddress({ paymentRoute })
  const feeReceiverTokenAccountAddress = paymentRoute.fee ? await getFeeReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress
  const fee2ReceiverTokenAccountAddress = paymentRoute.fee2 ? await getFee2ReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress
  const escrowOutPublicKey = await getEscrowOutAccountPublicKey({ paymentRoute })
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress })
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers.solana.exchanges.orca)

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
    { pubkey: new PublicKey(routers.solana.exchanges.orca), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
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
    { pubkey: exchangeRouteSwapInstruction.keys[10].pubkey, isSigner: false, isWritable: true },
    // escrow_out
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(feeReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver2
    { pubkey: new PublicKey(fee2ReceiverTokenAccountAddress), isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.routeOrcaSwap.layout.span)
  routers.solana.api.routeOrcaSwap.layout.encode({
    anchorDiscriminator: routers.solana.api.routeOrcaSwap.anchorDiscriminator,
    amountIn: exchangeRouteSwapInstructionData.amount,
    aToB: exchangeRouteSwapInstructionData.aToB,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data)
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const routeOrcaSwapSolIn = async({ paymentRoute, deadline }) =>{

  const paymentReceiverTokenAccountPublicKey = new PublicKey(await getPaymentReceiverTokenAccountAddress({ paymentRoute }))
  const feeReceiverTokenAccountPublicKey = paymentRoute.fee ? new PublicKey(await getFeeReceiverTokenAccountAddress({ paymentRoute })) : paymentReceiverTokenAccountPublicKey
  const feeReceiver2TokenAccountPublicKey = paymentRoute.fee2 ? new PublicKey(await getFee2ReceiverTokenAccountAddress({ paymentRoute })) : paymentReceiverTokenAccountPublicKey
  const escrowOutPublicKey = await getEscrowOutAccountPublicKey({ paymentRoute })
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress })
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers.solana.exchanges.orca)

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
    { pubkey: new PublicKey(routers.solana.exchanges.orca), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // escrow_in
    { pubkey: await getEscrowInWSolAccountPublicKey(), isSigner: false, isWritable: true },
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
    { pubkey: exchangeRouteSwapInstruction.keys[10].pubkey, isSigner: false, isWritable: true },
    // escrow_out
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: paymentReceiverTokenAccountPublicKey, isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: feeReceiverTokenAccountPublicKey, isSigner: false, isWritable: true },
    // fee2_receiver
    { pubkey: feeReceiver2TokenAccountPublicKey, isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.routeOrcaSwapSolIn.layout.span)
  routers.solana.api.routeOrcaSwapSolIn.layout.encode({
    anchorDiscriminator: routers.solana.api.routeOrcaSwapSolIn.anchorDiscriminator,
    amountIn: exchangeRouteSwapInstructionData.amount,
    aToB: exchangeRouteSwapInstructionData.aToB,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data)
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const routeOrcaSwapSolOut = async({ paymentRoute, deadline }) =>{

  const senderTokenAccountAddress = await getPaymentSenderTokenAccountAddress({ paymentRoute })
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress })
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers.solana.exchanges.orca)

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
    { pubkey: new PublicKey(routers.solana.exchanges.orca), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
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
    { pubkey: exchangeRouteSwapInstruction.keys[10].pubkey, isSigner: false, isWritable: true },
    // escrow_out_mint
    { pubkey: new PublicKey(Blockchains.solana.wrapped.address), isSigner: false, isWritable: false },
    // escrow_out
    { pubkey: await getEscrowOutWSolAccountPublicKey(), isSigner: false, isWritable: true },
    // escrow_out_sol
    { pubkey: await getEscrowSolAccountPublicKey(), isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentRoute.toAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(paymentRoute.fee ? paymentRoute.fee.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
    // fee2_receiver
    { pubkey: new PublicKey(paymentRoute.fee2 ? paymentRoute.fee2.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.routeOrcaSwapSolOut.layout.span)
  routers.solana.api.routeOrcaSwapSolOut.layout.encode({
    anchorDiscriminator: routers.solana.api.routeOrcaSwapSolOut.anchorDiscriminator,
    amountIn: exchangeRouteSwapInstructionData.amount,
    aToB: exchangeRouteSwapInstructionData.aToB,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data)
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const routeOrcaTwoHopSwap = async({ paymentRoute, deadline }) =>{

  const paymentReceiverTokenAccountPublicKey = new PublicKey(await getPaymentReceiverTokenAccountAddress({ paymentRoute }))
  const feeReceiverTokenAccountPublicKey = paymentRoute.fee ? new PublicKey(await getFeeReceiverTokenAccountAddress({ paymentRoute })) : paymentReceiverTokenAccountPublicKey
  const feeReceiver2TokenAccountPublicKey = paymentRoute.fee2 ? new PublicKey(await getFee2ReceiverTokenAccountAddress({ paymentRoute })) : paymentReceiverTokenAccountPublicKey
  const escrowOutPublicKey = await getEscrowOutAccountPublicKey({ paymentRoute })
  const escrowMiddlePublicKey = await getEscrowMiddleAccountPublicKey({ paymentRoute })
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress })
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers.solana.exchanges.orca)
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
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // amm_program
    { pubkey: new PublicKey(routers.solana.exchanges.orca), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
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
    { pubkey: exchangeRouteSwapInstruction.keys[18].pubkey, isSigner: false, isWritable: true },
    // oracle_two
    { pubkey: exchangeRouteSwapInstruction.keys[19].pubkey, isSigner: false, isWritable: true },
    // escrow_middle
    { pubkey: escrowMiddlePublicKey, isSigner: false, isWritable: true },
    // escrow_out
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: paymentReceiverTokenAccountPublicKey, isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: feeReceiverTokenAccountPublicKey, isSigner: false, isWritable: true },
    // fee_receiver2
    { pubkey: feeReceiver2TokenAccountPublicKey, isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.routeOrcaTwoHopSwap.layout.span)
  routers.solana.api.routeOrcaTwoHopSwap.layout.encode({
    anchorDiscriminator: routers.solana.api.routeOrcaTwoHopSwap.anchorDiscriminator,
    amountInOne: new BN(paymentRoute.exchangeRoutes[0].amounts[0].toString()),
    amountInTwo: new BN(paymentRoute.exchangeRoutes[0].amounts[1].toString()),
    aToBOne: exchangeRouteSwapInstructionData.aToBOne,
    aToBTwo: exchangeRouteSwapInstructionData.aToBTwo,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data)

  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const routeOrcaTwoHopSwapSolIn = async({ paymentRoute, deadline }) =>{

  const paymentReceiverTokenAccountPublicKey = new PublicKey(await getPaymentReceiverTokenAccountAddress({ paymentRoute }))
  const feeReceiverTokenAccountPublicKey = paymentRoute.fee ? new PublicKey(await getFeeReceiverTokenAccountAddress({ paymentRoute })) : paymentReceiverTokenAccountPublicKey
  const feeReceiver2TokenAccountPublicKey = paymentRoute.fee2 ? new PublicKey(await getFee2ReceiverTokenAccountAddress({ paymentRoute })) : paymentReceiverTokenAccountPublicKey
  const escrowOutPublicKey = await getEscrowOutAccountPublicKey({ paymentRoute })
  const escrowMiddlePublicKey = await getEscrowMiddleAccountPublicKey({ paymentRoute })
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress })
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers.solana.exchanges.orca)
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
    { pubkey: new PublicKey(routers.solana.exchanges.orca), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // escrow_in
    { pubkey: await getEscrowInWSolAccountPublicKey(), isSigner: false, isWritable: true },
    // whirlpool_one
    exchangeRouteSwapInstruction.keys[2],
    // whirlpool_two
    exchangeRouteSwapInstruction.keys[3],
    // token_vault_one_a
    exchangeRouteSwapInstruction.keys[5],
    // token_vault_one_b
    exchangeRouteSwapInstruction.keys[7],
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
    { pubkey: exchangeRouteSwapInstruction.keys[18].pubkey, isSigner: false, isWritable: true },
    // oracle_two
    { pubkey: exchangeRouteSwapInstruction.keys[19].pubkey, isSigner: false, isWritable: true },
    // escrow_middle
    { pubkey: escrowMiddlePublicKey, isSigner: false, isWritable: true },
    // escrow_out
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: paymentReceiverTokenAccountPublicKey, isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: feeReceiverTokenAccountPublicKey, isSigner: false, isWritable: true },
    // fee_receiver2
    { pubkey: feeReceiver2TokenAccountPublicKey, isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.routeOrcaTwoHopSwapSolIn.layout.span)
  routers.solana.api.routeOrcaTwoHopSwapSolIn.layout.encode({
    anchorDiscriminator: routers.solana.api.routeOrcaTwoHopSwapSolIn.anchorDiscriminator,
    amountInOne: new BN(paymentRoute.exchangeRoutes[0].amounts[0].toString()),
    amountInTwo: new BN(paymentRoute.exchangeRoutes[0].amounts[1].toString()),
    aToBOne: exchangeRouteSwapInstructionData.aToBOne,
    aToBTwo: exchangeRouteSwapInstructionData.aToBTwo,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data)

  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const routeOrcaTwoHopSwapSolOut = async({ paymentRoute, deadline }) =>{

  const middleTokenAccountPublicKey = new PublicKey(await getMiddleTokenAccountAddress({ paymentRoute }))
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress })
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers.solana.exchanges.orca)
  const senderTokenAccountPublicKey = new PublicKey(await getPaymentSenderTokenAccountAddress({ paymentRoute }))
  const escrowMiddlePublicKey = await getEscrowMiddleAccountPublicKey({ paymentRoute })

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
    { pubkey: new PublicKey(routers.solana.exchanges.orca), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
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
    { pubkey: exchangeRouteSwapInstruction.keys[18].pubkey, isSigner: false, isWritable: true },
    // oracle_two
    { pubkey: exchangeRouteSwapInstruction.keys[19].pubkey, isSigner: false, isWritable: true },
    // escrow_middle
    { pubkey: escrowMiddlePublicKey, isSigner: false, isWritable: true },
    // escrow_out_mint
    { pubkey: new PublicKey(Blockchains.solana.wrapped.address), isSigner: false, isWritable: false },
    // escrow_out
    { pubkey: await getEscrowOutWSolAccountPublicKey(), isSigner: false, isWritable: true },
    // escrow_out_sol
    { pubkey: await getEscrowSolAccountPublicKey(), isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentRoute.toAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(paymentRoute.fee ? paymentRoute.fee.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
    // fee_receiver2
    { pubkey: new PublicKey(paymentRoute.fee2 ? paymentRoute.fee2.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.routeOrcaTwoHopSwapSolOut.layout.span)
  routers.solana.api.routeOrcaTwoHopSwapSolOut.layout.encode({
    anchorDiscriminator: routers.solana.api.routeOrcaTwoHopSwapSolOut.anchorDiscriminator,
    amountInOne: new BN(paymentRoute.exchangeRoutes[0].amounts[0].toString()),
    amountInTwo: new BN(paymentRoute.exchangeRoutes[0].amounts[1].toString()),
    aToBOne: exchangeRouteSwapInstructionData.aToBOne,
    aToBTwo: exchangeRouteSwapInstructionData.aToBTwo,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data)
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const routeRaydiumCpSwap = async({ paymentRoute, deadline }) =>{

  const senderTokenAccountAddress = await getPaymentSenderTokenAccountAddress({ paymentRoute })
  const paymentReceiverTokenAccountAddress = await getPaymentReceiverTokenAccountAddress({ paymentRoute })
  const feeReceiverTokenAccountAddress = paymentRoute.fee ? await getFeeReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress
  const fee2ReceiverTokenAccountAddress = paymentRoute.fee2 ? await getFee2ReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress
  const escrowOutPublicKey = await getEscrowOutAccountPublicKey({ paymentRoute })
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress })
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers.solana.exchanges.raydiumCP)

  const keys = [
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // cp_swap_program
    { pubkey: new PublicKey(routers.solana.exchanges.raydiumCP), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // authority
    exchangeRouteSwapInstruction.keys[1],
    // amm_config
    exchangeRouteSwapInstruction.keys[2],
    // pool_state
    exchangeRouteSwapInstruction.keys[3],
    // input_token_account
    { pubkey: new PublicKey(senderTokenAccountAddress), isSigner: false, isWritable: true },
    // input_vault
    exchangeRouteSwapInstruction.keys[6],
    // output_vault
    exchangeRouteSwapInstruction.keys[7],
    // input_token_mint
    exchangeRouteSwapInstruction.keys[10],
    // output_token_mint
    exchangeRouteSwapInstruction.keys[11],
    // observation_state
    exchangeRouteSwapInstruction.keys[12],
    // escrow_out
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(feeReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver2
    { pubkey: new PublicKey(fee2ReceiverTokenAccountAddress), isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.routeRaydiumCpSwap.layout.span)
  routers.solana.api.routeRaydiumCpSwap.layout.encode({
    anchorDiscriminator: routers.solana.api.routeRaydiumCpSwap.anchorDiscriminator,
    amountIn: new BN(paymentRoute.fromAmount.toString()),
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data)
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const routeRaydiumCpSwapSolIn = async({ paymentRoute, deadline }) =>{

  const paymentReceiverTokenAccountAddress = await getPaymentReceiverTokenAccountAddress({ paymentRoute })
  const feeReceiverTokenAccountAddress = paymentRoute.fee ? await getFeeReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress
  const fee2ReceiverTokenAccountAddress = paymentRoute.fee2 ? await getFee2ReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress
  const escrowOutPublicKey = await getEscrowOutAccountPublicKey({ paymentRoute })
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress })
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers.solana.exchanges.raydiumCP)

  const keys = [
    // system_program
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // cp_swap_program
    { pubkey: new PublicKey(routers.solana.exchanges.raydiumCP), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // authority
    exchangeRouteSwapInstruction.keys[1],
    // amm_config
    exchangeRouteSwapInstruction.keys[2],
    // pool_state
    exchangeRouteSwapInstruction.keys[3],
    // escrow_in
    { pubkey: await getEscrowInWSolAccountPublicKey(), isSigner: false, isWritable: true },
    // input_vault
    exchangeRouteSwapInstruction.keys[6],
    // output_vault
    exchangeRouteSwapInstruction.keys[7],
    // input_token_mint
    exchangeRouteSwapInstruction.keys[10],
    // output_token_mint
    exchangeRouteSwapInstruction.keys[11],
    // observation_state
    exchangeRouteSwapInstruction.keys[12],
    // escrow_out
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(feeReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver2
    { pubkey: new PublicKey(fee2ReceiverTokenAccountAddress), isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.routeRaydiumCpSwapSolIn.layout.span)
  routers.solana.api.routeRaydiumCpSwapSolIn.layout.encode({
    anchorDiscriminator: routers.solana.api.routeRaydiumCpSwapSolIn.anchorDiscriminator,
    amountIn: new BN(paymentRoute.fromAmount.toString()),
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data)
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const routeRaydiumCpSwapSolOut = async({ paymentRoute, deadline }) =>{

  const senderTokenAccountAddress = await getPaymentSenderTokenAccountAddress({ paymentRoute })
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress })
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers.solana.exchanges.raydiumCP)

  const keys = [
    // system_program
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // cp_swap_program
    { pubkey: new PublicKey(routers.solana.exchanges.raydiumCP), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // authority
    exchangeRouteSwapInstruction.keys[1],
    // amm_config
    exchangeRouteSwapInstruction.keys[2],
    // pool_state
    exchangeRouteSwapInstruction.keys[3],
    // input_token_account
    { pubkey: new PublicKey(senderTokenAccountAddress), isSigner: false, isWritable: true },
    // input_vault
    exchangeRouteSwapInstruction.keys[6],
    // output_vault
    exchangeRouteSwapInstruction.keys[7],
    // input_token_mint
    exchangeRouteSwapInstruction.keys[10],
    // output_token_mint
    exchangeRouteSwapInstruction.keys[11],
    // observation_state
    exchangeRouteSwapInstruction.keys[12],
    // escrow_out
    { pubkey: await getEscrowOutWSolAccountPublicKey(), isSigner: false, isWritable: true },
    // escrow_out_sol
    { pubkey: await getEscrowSolAccountPublicKey(), isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentRoute.toAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(paymentRoute.fee ? paymentRoute.fee.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
    // fee_receiver2
    { pubkey: new PublicKey(paymentRoute.fee2 ? paymentRoute.fee2.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.routeRaydiumCpSwapSolOut.layout.span)
  routers.solana.api.routeRaydiumCpSwapSolOut.layout.encode({
    anchorDiscriminator: routers.solana.api.routeRaydiumCpSwapSolOut.anchorDiscriminator,
    amountIn: new BN(paymentRoute.fromAmount.toString()),
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data)
  
  return new TransactionInstruction({
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const routeRaydiumCpTwoHopSwap = async({ paymentRoute, deadline }) =>{
  throw('PENDING');
}

const routeRaydiumCpTwoHopSwapSolIn = async({ paymentRoute, deadline }) =>{
  throw('PENDING');
}

const routeRaydiumCpTwoHopSwapSolOut = async({ paymentRoute, deadline }) =>{
  throw('PENDING');
}

const routeRaydiumClSwap = async({ paymentRoute, deadline }) =>{

  const senderTokenAccountAddress = await getPaymentSenderTokenAccountAddress({ paymentRoute })
  const paymentReceiverTokenAccountAddress = await getPaymentReceiverTokenAccountAddress({ paymentRoute })
  const feeReceiverTokenAccountAddress = paymentRoute.fee ? await getFeeReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress
  const fee2ReceiverTokenAccountAddress = paymentRoute.fee2 ? await getFee2ReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress
  const escrowOutPublicKey = await getEscrowOutAccountPublicKey({ paymentRoute })
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress })
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers.solana.exchanges.raydiumCL)

  const keys = [
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // token_program_2022
    { pubkey: new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'), isSigner: false, isWritable: false },
    // clmm_program
    { pubkey: new PublicKey(routers.solana.exchanges.raydiumCL), isSigner: false, isWritable: false },
    // memo_program
    { pubkey: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // amm_config
    exchangeRouteSwapInstruction.keys[1],
    // pool_state
    exchangeRouteSwapInstruction.keys[2],
    // input_token_account
    { pubkey: new PublicKey(senderTokenAccountAddress), isSigner: false, isWritable: true },
    // input_vault
    exchangeRouteSwapInstruction.keys[5],
    // output_vault
    exchangeRouteSwapInstruction.keys[6],
    // input_token_mint
    exchangeRouteSwapInstruction.keys[11],
    // output_token_mint
    exchangeRouteSwapInstruction.keys[12],
    // observation_state
    exchangeRouteSwapInstruction.keys[7],
    // escrow_out
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(feeReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver2
    { pubkey: new PublicKey(fee2ReceiverTokenAccountAddress), isSigner: false, isWritable: true },
  ].concat(exchangeRouteSwapInstruction.keys.slice(13)) // remaining accounts from index 12 onwards

  const data = Buffer.alloc(routers.solana.api.routeRaydiumClSwap.layout.span)
  routers.solana.api.routeRaydiumClSwap.layout.encode({
    anchorDiscriminator: routers.solana.api.routeRaydiumClSwap.anchorDiscriminator,
    amountIn: new BN(paymentRoute.fromAmount.toString()),
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data)
  
  return new TransactionInstruction({
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const routeRaydiumClSwapSolIn = async({ paymentRoute, deadline }) =>{

  const paymentReceiverTokenAccountAddress = await getPaymentReceiverTokenAccountAddress({ paymentRoute })
  const feeReceiverTokenAccountAddress = paymentRoute.fee ? await getFeeReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress
  const fee2ReceiverTokenAccountAddress = paymentRoute.fee2 ? await getFee2ReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress
  const escrowOutPublicKey = await getEscrowOutAccountPublicKey({ paymentRoute })
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress })
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers.solana.exchanges.raydiumCL)

  const keys = [
    // system_program
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // token_program_2022
    { pubkey: new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'), isSigner: false, isWritable: false },
    // clmm_program
    { pubkey: new PublicKey(routers.solana.exchanges.raydiumCL), isSigner: false, isWritable: false },
    // memo_program
    { pubkey: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // amm_config
    exchangeRouteSwapInstruction.keys[1],
    // pool_state
    exchangeRouteSwapInstruction.keys[2],
    // escrow_in
    { pubkey: await getEscrowInWSolAccountPublicKey(), isSigner: false, isWritable: true },
    // input_vault
    exchangeRouteSwapInstruction.keys[5],
    // output_vault
    exchangeRouteSwapInstruction.keys[6],
    // input_token_mint
    exchangeRouteSwapInstruction.keys[11],
    // output_token_mint
    exchangeRouteSwapInstruction.keys[12],
    // observation_state
    exchangeRouteSwapInstruction.keys[7],
    // escrow_out
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(feeReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver2
    { pubkey: new PublicKey(fee2ReceiverTokenAccountAddress), isSigner: false, isWritable: true },
  ].concat(exchangeRouteSwapInstruction.keys.slice(13)) // remaining accounts from index 12 onwards

  const data = Buffer.alloc(routers.solana.api.routeRaydiumClSwapSolIn.layout.span)
  routers.solana.api.routeRaydiumClSwapSolIn.layout.encode({
    anchorDiscriminator: routers.solana.api.routeRaydiumClSwapSolIn.anchorDiscriminator,
    amountIn: new BN(paymentRoute.exchangeRoutes[0].amounts[0].toString()),
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data)
  
  return new TransactionInstruction({
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })

}

const routeRaydiumClSwapSolOut = async({ paymentRoute, deadline }) =>{

  const senderTokenAccountAddress = await getPaymentSenderTokenAccountAddress({ paymentRoute })
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress })
  const exchangeRouteSwapInstruction = exchangeRouteTransaction.instructions.find((instruction)=>instruction.programId.toString() === routers.solana.exchanges.raydiumCL)

  const keys = [
    // system_program
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // token_program_2022
    { pubkey: new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'), isSigner: false, isWritable: false },
    // clmm_program
    { pubkey: new PublicKey(routers.solana.exchanges.raydiumCL), isSigner: false, isWritable: false },
    // memo_program
    { pubkey: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // amm_config
    exchangeRouteSwapInstruction.keys[1],
    // pool_state
    exchangeRouteSwapInstruction.keys[2],
    // input_token_account
    { pubkey: new PublicKey(senderTokenAccountAddress), isSigner: false, isWritable: true },
    // input_vault
    exchangeRouteSwapInstruction.keys[5],
    // output_vault
    exchangeRouteSwapInstruction.keys[6],
    // input_token_mint
    exchangeRouteSwapInstruction.keys[11],
    // output_token_mint
    exchangeRouteSwapInstruction.keys[12],
    // observation_state
    exchangeRouteSwapInstruction.keys[7],
    // escrow_out
    { pubkey: await getEscrowOutWSolAccountPublicKey(), isSigner: false, isWritable: true },
    // escrow_out_sol
    { pubkey: await getEscrowSolAccountPublicKey(), isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentRoute.toAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(paymentRoute.fee ? paymentRoute.fee.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
    // fee2_receiver
    { pubkey: new PublicKey(paymentRoute.fee2 ? paymentRoute.fee2.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
  ].concat(exchangeRouteSwapInstruction.keys.slice(13)) // remaining accounts from index 12 onwards

  const data = Buffer.alloc(routers.solana.api.routeRaydiumClSwapSolOut.layout.span)
  routers.solana.api.routeRaydiumClSwapSolOut.layout.encode({
    anchorDiscriminator: routers.solana.api.routeRaydiumClSwapSolOut.anchorDiscriminator,
    amountIn: new BN(paymentRoute.fromAmount.toString()),
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
  }, data)
  
  return new TransactionInstruction({
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const routeRaydiumClTwoHopSwap = async({ paymentRoute, deadline }) =>{

  const senderTokenAccountAddress = await getPaymentSenderTokenAccountAddress({ paymentRoute })
  const paymentReceiverTokenAccountAddress = await getPaymentReceiverTokenAccountAddress({ paymentRoute })
  const feeReceiverTokenAccountAddress = paymentRoute.fee ? await getFeeReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress
  const fee2ReceiverTokenAccountAddress = paymentRoute.fee2 ? await getFee2ReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress
  const escrowMiddlePublicKey = await getEscrowMiddleAccountPublicKey({ paymentRoute })
  const escrowOutPublicKey = await getEscrowOutAccountPublicKey({ paymentRoute })
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress })
  const exchangeRouteSwapInstructions = exchangeRouteTransaction.instructions.filter((instruction)=>instruction.programId.toString() === routers.solana.exchanges.raydiumCL)
  const exchangeRouteSwapInstructionOne = exchangeRouteSwapInstructions[0]
  const exchangeRouteSwapInstructionTwo = exchangeRouteSwapInstructions[1]

  const keys = [
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // token_program_2022
    { pubkey: new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'), isSigner: false, isWritable: false },
    // clmm_program
    { pubkey: new PublicKey(routers.solana.exchanges.raydiumCL), isSigner: false, isWritable: false },
    // memo_program
    { pubkey: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // amm_config_one
    exchangeRouteSwapInstructionOne.keys[1],
    // amm_config_two
    exchangeRouteSwapInstructionTwo.keys[1],
    // pool_state_one
    exchangeRouteSwapInstructionOne.keys[2],
    // pool_state_two
    exchangeRouteSwapInstructionTwo.keys[2],
    // input_token_account
    { pubkey: new PublicKey(senderTokenAccountAddress), isSigner: false, isWritable: true },
    // input_vault
    exchangeRouteSwapInstructionOne.keys[5],
    // input_token_mint
    exchangeRouteSwapInstructionOne.keys[11],
    // middle_vault_one
    exchangeRouteSwapInstructionOne.keys[6],
    // middle_vault_two
    exchangeRouteSwapInstructionTwo.keys[5],
    // middle_token_mint
    exchangeRouteSwapInstructionOne.keys[12],
    // escrow_middle
    { pubkey: escrowMiddlePublicKey, isSigner: false, isWritable: true },
    // output_vault
    exchangeRouteSwapInstructionTwo.keys[6],
    // output_token_mint
    exchangeRouteSwapInstructionTwo.keys[12],
    // observation_state_one
    exchangeRouteSwapInstructionOne.keys[7],
    // observation_state_two
    exchangeRouteSwapInstructionTwo.keys[7],
    // escrow_out
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(feeReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver2
    { pubkey: new PublicKey(fee2ReceiverTokenAccountAddress), isSigner: false, isWritable: true },
  ].concat(exchangeRouteSwapInstructionOne.keys.slice(13)).concat(exchangeRouteSwapInstructionTwo.keys.slice(13)) // remaining accounts from index 12 onwards

  const data = Buffer.alloc(routers.solana.api.routeRaydiumClTwoHopSwap.layout.span)
  routers.solana.api.routeRaydiumClTwoHopSwap.layout.encode({
    anchorDiscriminator: routers.solana.api.routeRaydiumClTwoHopSwap.anchorDiscriminator,
    amountInOne: new BN(paymentRoute.exchangeRoutes[0].amounts[0].toString()),
    amountInTwo: new BN(paymentRoute.exchangeRoutes[0].amounts[1].toString()),
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
    remainingAccountsSplit: exchangeRouteSwapInstructionOne.keys.slice(13).length,
  }, data)
  
  return new TransactionInstruction({
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const routeRaydiumClTwoHopSwapSolIn = async({ paymentRoute, deadline }) =>{

  const paymentReceiverTokenAccountAddress = await getPaymentReceiverTokenAccountAddress({ paymentRoute })
  const feeReceiverTokenAccountAddress = paymentRoute.fee ? await getFeeReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress
  const fee2ReceiverTokenAccountAddress = paymentRoute.fee2 ? await getFee2ReceiverTokenAccountAddress({ paymentRoute }) : paymentReceiverTokenAccountAddress
  const escrowMiddlePublicKey = await getEscrowMiddleAccountPublicKey({ paymentRoute })
  const escrowOutPublicKey = await getEscrowOutAccountPublicKey({ paymentRoute })
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress })
  const exchangeRouteSwapInstructions = exchangeRouteTransaction.instructions.filter((instruction)=>instruction.programId.toString() === routers.solana.exchanges.raydiumCL)
  const exchangeRouteSwapInstructionOne = exchangeRouteSwapInstructions[0]
  const exchangeRouteSwapInstructionTwo = exchangeRouteSwapInstructions[1]

  const keys = [
    // system_program
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // token_program_2022
    { pubkey: new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'), isSigner: false, isWritable: false },
    // clmm_program
    { pubkey: new PublicKey(routers.solana.exchanges.raydiumCL), isSigner: false, isWritable: false },
    // memo_program
    { pubkey: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // amm_config_one
    exchangeRouteSwapInstructionOne.keys[1],
    // amm_config_two
    exchangeRouteSwapInstructionTwo.keys[1],
    // pool_state_one
    exchangeRouteSwapInstructionOne.keys[2],
    // pool_state_two
    exchangeRouteSwapInstructionTwo.keys[2],
    // input_vault
    exchangeRouteSwapInstructionOne.keys[5],
    // input_token_mint
    exchangeRouteSwapInstructionOne.keys[11],
    // escrow_in
    { pubkey: await getEscrowInWSolAccountPublicKey(), isSigner: false, isWritable: true },
    // middle_vault_one
    exchangeRouteSwapInstructionOne.keys[6],
    // middle_vault_two
    exchangeRouteSwapInstructionTwo.keys[5],
    // middle_token_mint
    exchangeRouteSwapInstructionOne.keys[12],
    // escrow_middle
    { pubkey: escrowMiddlePublicKey, isSigner: false, isWritable: true },
    // output_vault
    exchangeRouteSwapInstructionTwo.keys[6],
    // output_token_mint
    exchangeRouteSwapInstructionTwo.keys[12],
    // observation_state_one
    exchangeRouteSwapInstructionOne.keys[7],
    // observation_state_two
    exchangeRouteSwapInstructionTwo.keys[7],
    // escrow_out
    { pubkey: escrowOutPublicKey, isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(feeReceiverTokenAccountAddress), isSigner: false, isWritable: true },
    // fee_receiver2
    { pubkey: new PublicKey(fee2ReceiverTokenAccountAddress), isSigner: false, isWritable: true },
  ].concat(exchangeRouteSwapInstructionOne.keys.slice(13)).concat(exchangeRouteSwapInstructionTwo.keys.slice(13)) // remaining accounts from index 12 onwards

  const data = Buffer.alloc(routers.solana.api.routeRaydiumClTwoHopSwapSolIn.layout.span)
  routers.solana.api.routeRaydiumClTwoHopSwapSolIn.layout.encode({
    anchorDiscriminator: routers.solana.api.routeRaydiumClTwoHopSwapSolIn.anchorDiscriminator,
    amountInOne: new BN(paymentRoute.exchangeRoutes[0].amounts[0].toString()),
    amountInTwo: new BN(paymentRoute.exchangeRoutes[0].amounts[1].toString()),
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
    remainingAccountsSplit: exchangeRouteSwapInstructionOne.keys.slice(13).length,
  }, data)
  
  return new TransactionInstruction({
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const routeRaydiumClTwoHopSwapSolOut = async({ paymentRoute, deadline }) =>{

  const senderTokenAccountAddress = await getPaymentSenderTokenAccountAddress({ paymentRoute })
  const escrowMiddlePublicKey = await getEscrowMiddleAccountPublicKey({ paymentRoute })
  const escrowOutWsolPublicKey = await getEscrowInWSolAccountPublicKey()
  const exchangeRouteTransaction = await paymentRoute.exchangeRoutes[0].getTransaction({ account: paymentRoute.fromAddress })
  const exchangeRouteSwapInstructions = exchangeRouteTransaction.instructions.filter((instruction)=>instruction.programId.toString() === routers.solana.exchanges.raydiumCL)
  const exchangeRouteSwapInstructionOne = exchangeRouteSwapInstructions[0]
  const exchangeRouteSwapInstructionTwo = exchangeRouteSwapInstructions[1]

  const keys = [
    // system_program
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    // token_program
    { pubkey: new PublicKey(Token.solana.TOKEN_PROGRAM), isSigner: false, isWritable: false },
    // token_program_2022
    { pubkey: new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'), isSigner: false, isWritable: false },
    // clmm_program
    { pubkey: new PublicKey(routers.solana.exchanges.raydiumCL), isSigner: false, isWritable: false },
    // memo_program
    { pubkey: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'), isSigner: false, isWritable: false },
    // sender
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    // amm_config_one
    exchangeRouteSwapInstructionOne.keys[1],
    // amm_config_two
    exchangeRouteSwapInstructionTwo.keys[1],
    // pool_state_one
    exchangeRouteSwapInstructionOne.keys[2],
    // pool_state_two
    exchangeRouteSwapInstructionTwo.keys[2],
    // input_token_account
    { pubkey: new PublicKey(senderTokenAccountAddress), isSigner: false, isWritable: true },
    // input_vault
    exchangeRouteSwapInstructionOne.keys[5],
    // input_token_mint
    exchangeRouteSwapInstructionOne.keys[11],
    // middle_vault_one
    exchangeRouteSwapInstructionOne.keys[6],
    // middle_vault_two
    exchangeRouteSwapInstructionTwo.keys[5],
    // middle_token_mint
    exchangeRouteSwapInstructionOne.keys[12],
    // escrow_middle
    { pubkey: escrowMiddlePublicKey, isSigner: false, isWritable: true },
    // output_vault
    exchangeRouteSwapInstructionTwo.keys[6],
    // output_token_mint
    exchangeRouteSwapInstructionTwo.keys[12],
    // observation_state_one
    exchangeRouteSwapInstructionOne.keys[7],
    // observation_state_two
    exchangeRouteSwapInstructionTwo.keys[7],
    // escrow_out
    { pubkey: await getEscrowOutWSolAccountPublicKey(), isSigner: false, isWritable: true },
    // escrow_out_sol
    { pubkey: await getEscrowSolAccountPublicKey(), isSigner: false, isWritable: true },
    // payment_receiver
    { pubkey: new PublicKey(paymentRoute.toAddress), isSigner: false, isWritable: true },
    // fee_receiver
    { pubkey: new PublicKey(paymentRoute.fee ? paymentRoute.fee.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
    // fee2_receiver
    { pubkey: new PublicKey(paymentRoute.fee2 ? paymentRoute.fee2.receiver : paymentRoute.toAddress), isSigner: false, isWritable: true },
  ].concat(exchangeRouteSwapInstructionOne.keys.slice(13)).concat(exchangeRouteSwapInstructionTwo.keys.slice(13)) // remaining accounts from index 12 onwards

  const data = Buffer.alloc(routers.solana.api.routeRaydiumClTwoHopSwapSolOut.layout.span)
  routers.solana.api.routeRaydiumClTwoHopSwapSolOut.layout.encode({
    anchorDiscriminator: routers.solana.api.routeRaydiumClTwoHopSwapSolOut.anchorDiscriminator,
    amountInOne: new BN(paymentRoute.exchangeRoutes[0].amounts[0].toString()),
    amountInTwo: new BN(paymentRoute.exchangeRoutes[0].amounts[1].toString()),
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString()),
    feeAmount2: new BN((paymentRoute.feeAmount2 || '0').toString()),
    protocolAmount: new BN((paymentRoute.protocolFeeAmount || '0').toString()),
    deadline: new BN(deadline),
    remainingAccountsSplit: exchangeRouteSwapInstructionOne.keys.slice(13).length,
  }, data)
  
  return new TransactionInstruction({
    keys,
    programId: new PublicKey(routers.solana.address),
    data
  })
}

const payment = async({ paymentRoute, deadline })=> {

  const paymentMethod = getPaymentMethod({ paymentRoute })

  switch(paymentMethod){
    
    case 'routeSol':
    return await routeSol({ paymentRoute, deadline });
    
    case 'routeToken':
    return await routeToken({ paymentRoute, deadline });

    case 'routeOrcaSwap':
    return await routeOrcaSwap({ paymentRoute, deadline });

    case 'routeOrcaSwapSolIn':
    return await routeOrcaSwapSolIn({ paymentRoute, deadline });

    case 'routeOrcaSwapSolOut':
    return await routeOrcaSwapSolOut({ paymentRoute, deadline });

    case 'routeOrcaTwoHopSwap':
    return await routeOrcaTwoHopSwap({ paymentRoute, deadline });

    case 'routeOrcaTwoHopSwapSolIn':
    return await routeOrcaTwoHopSwapSolIn({ paymentRoute, deadline });

    case 'routeOrcaTwoHopSwapSolOut':
    return await routeOrcaTwoHopSwapSolOut({ paymentRoute, deadline });

    case 'routeRaydiumCpSwap':
    return await routeRaydiumCpSwap({ paymentRoute, deadline });

    case 'routeRaydiumCpSwapSolIn':
    return await routeRaydiumCpSwapSolIn({ paymentRoute, deadline });

    case 'routeRaydiumCpSwapSolOut':
    return await routeRaydiumCpSwapSolOut({ paymentRoute, deadline });

    case 'routeRaydiumCpTwoHopSwap':
    return await routeRaydiumCpTwoHopSwap({ paymentRoute, deadline });

    case 'routeRaydiumCpTwoHopSwapSolIn':
    return await routeRaydiumCpTwoHopSwapSolIn({ paymentRoute, deadline });

    case 'routeRaydiumCpTwoHopSwapSolOut':
    return await routeRaydiumCpTwoHopSwapSolOut({ paymentRoute, deadline });

    case 'routeRaydiumClSwap':
    return await routeRaydiumClSwap({ paymentRoute, deadline });

    case 'routeRaydiumClSwapSolIn':
    return await routeRaydiumClSwapSolIn({ paymentRoute, deadline });

    case 'routeRaydiumClSwapSolOut':
    return await routeRaydiumClSwapSolOut({ paymentRoute, deadline });

    case 'routeRaydiumClTwoHopSwap':
    return await routeRaydiumClTwoHopSwap({ paymentRoute, deadline });

    case 'routeRaydiumClTwoHopSwapSolIn':
    return await routeRaydiumClTwoHopSwapSolIn({ paymentRoute, deadline });

    case 'routeRaydiumClTwoHopSwapSolOut':
    return await routeRaydiumClTwoHopSwapSolOut({ paymentRoute, deadline });

  }

}

const getTransaction = async({ paymentRoute })=> {

  const deadline = paymentRoute.deadline || getDeadline()

  let instructions = (
    await Promise.all([
      createComputeInstruction({ paymentRoute }),
      createTokenMiddleAccount({ paymentRoute }),
      createPaymentReceiverAccount({ paymentRoute }),
      createFeeReceiverAccount({ paymentRoute }),
      createFee2ReceiverAccount({ paymentRoute }),
      createEscrowInWSOLTokenAccount({ paymentRoute }),
      createEscrowOutSolAccount({ paymentRoute }),
      createEscrowMiddleTokenAccount({ paymentRoute }),
      createEscrowOutTokenAccount({ paymentRoute }),
      payment({ paymentRoute, deadline }),
    ])
  )
  instructions = instructions.filter(Boolean).flat()

  const transaction = {
    blockchain: paymentRoute.blockchain,
    instructions,
    alts: [routers.solana.alt]
  }

  // debug(transaction, paymentRoute)

  transaction.deadline = deadline

  return transaction
}

const debug = async(transaction, paymentRoute)=>{
  console.log('transaction.instructions.length', transaction.instructions.length)
  transaction.instructions.forEach((instruction)=>{
    console.log('------')
    console.log(instruction.keys.map((key)=>key.pubkey.toString()))
  })
  const provider = await getProvider('solana')
  let recentBlockhash = (await provider.getLatestBlockhash()).blockhash
  console.log('transaction.alts', transaction.alts.map((alt)=>alt.toString()))
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

  let result
  try{ result = await provider.simulateTransaction(tx) } catch(e) { console.log('error', e) }
  console.log('SIMULATE')
  console.log('SIMULATION RESULT', result)
}

export {
  getTransaction
}
