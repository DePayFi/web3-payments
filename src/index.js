import { getTransaction as getSolanaTransaction } from './platforms/solana/transaction'
import route from './route'
import routers from './routers'

const getTransaction = (paymentRoute)=>{
  if(paymentRoute.blockchain === 'solana') {
    return getSolanaTransaction({ paymentRoute })
  }
}

export {
  route,
  routers,
  getTransaction,
}
