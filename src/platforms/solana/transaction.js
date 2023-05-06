/*#if _EVM

/*#elif _SOLANA

//#else */

//#endif

import routers from './routers'

const createPaymentsAccount = async({ from })=> {

}

const getTransaction = async({ paymentRoute, event, fee })=> {

  console.log('paymentRoute', paymentRoute)

  let instructions = [
    await createPaymentsAccount({ from: paymentRoute.fromAddress })
  ].filter(Boolean)

  return {
    blockchain: paymentRoute.blockchain,
    instructions
  }
}

export {
  getTransaction
}
