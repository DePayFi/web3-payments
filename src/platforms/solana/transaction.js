import Blockchains from '@depay/web3-blockchains'
import routers from './routers'
import { BN, PublicKey, Buffer, TransactionInstruction, SystemProgram, struct, u64 } from '@depay/solana-web3.js'
import { request } from '@depay/web3-client'
import { Token } from '@depay/web3-tokens'

const getPaymentsAccountAddress = async({ from })=>{
  let seeds = [Buffer.from("payments"), new PublicKey(from).toBuffer()]

  let [ pdaPublicKey ] = await PublicKey.findProgramAddress(
    seeds, new PublicKey(routers.solana.address)
  )

  return pdaPublicKey
}

const getPaymentsAccountData = async({ from })=>{
  let address = (await getPaymentsAccountAddress({ from })).toString()
  console.log('address', address)
  return await request({
    blockchain: 'solana',
    address,
    api: struct([u64('anchorDiscriminator'), u64('nonce')]),
    cache: 1000 
  })
}

const createPaymentsAccount = async({ from })=> {
  console.log('createPaymentsAccount')

  let paymentsAccountData = await getPaymentsAccountData({ from })
  if(paymentsAccountData) { 
    console.log('NOT NEEDED')
    return
  }
  console.log('CREATE')

  const keys = [
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: new PublicKey(from), isSigner: true, isWritable: true },
    { pubkey: pdaPublicKey, isSigner: false, isWritable: true },
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

  return
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
  console.log('createSenderTokenAccount')
  if(
    paymentRoute.fromToken.address === Blockchains.solana.currency.address &&
    paymentRoute.toToken.address === Blockchains.solana.currency.address
  ){ // SOL <> SOL
    console.log('NOT NEEDED')
    return
  } else if (
    paymentRoute.fromToken.address === Blockchains.solana.currency.address
  ) {
    console.log('NEEDED')
  }
}

const createPaymentReceiverTokenAccount = async({ paymentRoute })=> {
  console.log('createPaymentReceiverTokenAccount')
  
  if(
    paymentRoute.fromToken.address === Blockchains.solana.currency.address &&
    paymentRoute.toToken.address === Blockchains.solana.currency.address
  ){ // SOL <> SOL
    console.log('NOT NEEDED')
    return
  } else {

    const token = paymentRoute.toToken.address === Blockchains.solana.currency.address ? Blockchains.solana.wrapped.address : paymentRoute.toToken.address

    const paymentReceiverTokenAccount = await getPaymentReceiverTokenAccount({ paymentRoute })
    if(paymentReceiverTokenAccount) {
      console.log('NOT NEEDED')
      return
    }

    console.log('NEEDED')
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
    owner: paymentRoute.fee.address
  })  
}

const getFeeReceiverTokenAccount = async ({ paymentRoute })=> {

  return await Token.solana.findAccount({
    token: paymentRoute.toToken.address,
    owner: paymentRoute.fee.address
  })
}

const createFeeReceiverTokenAccount = async({ paymentRoute })=> {
  console.log('createFeeReceiverTokenAccount')
  
  if(
    paymentRoute.fromToken.address === Blockchains.solana.currency.address &&
    paymentRoute.toToken.address === Blockchains.solana.currency.address
  ){
    console.log('NOT NEEDED')
    return
  }

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

  }
}

const routeSol = async({ paymentRoute, paymentsAccountData }) =>{
  console.log('routeSol')
  const keys = [
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: new PublicKey(paymentRoute.fromAddress), isSigner: true, isWritable: true },
    { pubkey: await getPaymentsAccountAddress({ from: paymentRoute.fromAddress }), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(paymentRoute.toAddress), isSigner: false, isWritable: true },
    { pubkey: new PublicKey(paymentRoute.toAddress), isSigner: false, isWritable: true },
  ]

  const data = Buffer.alloc(routers.solana.api.routeSol.layout.span)
  routers.solana.api.routeSol.layout.encode({
    anchorDiscriminator: routers.solana.api.routeSol.anchorDiscriminator,
    nonce: paymentsAccountData.nonce,
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
    nonce: paymentsAccountData.nonce,
    paymentAmount: new BN(paymentRoute.toAmount.toString()),
    feeAmount: new BN((paymentRoute.feeAmount || '0').toString())
  }, data)
  
  return new TransactionInstruction({ 
    keys,
    programId: new PublicKey(routers.solana.address),
    data 
  })    
}

const payment = async({ paymentRoute })=> {

  const paymentsAccountData = await getPaymentsAccountData({ from: paymentRoute.fromAddress })
  const paymentMethod = getPaymentMethod({ paymentRoute })

  switch(paymentMethod){
    
    case 'routeSol':
    return await routeSol({ paymentRoute, paymentsAccountData });
    
    case 'routeToken':
    return await routeToken({ paymentRoute, paymentsAccountData });
  }

}

const getTransaction = async({ paymentRoute })=> {

  let instructions = [
    await createPaymentsAccount({ from: paymentRoute.fromAddress }),
    await createSenderTokenAccount({ paymentRoute }),
    await createPaymentReceiverTokenAccount({ paymentRoute }),
    await createFeeReceiverTokenAccount({ paymentRoute }),
    await payment({ paymentRoute }),
  ].filter(Boolean).flat()

  console.log('instructions.length', instructions.length)

  return {
    blockchain: paymentRoute.blockchain,
    instructions
  }
}

export {
  getTransaction
}
