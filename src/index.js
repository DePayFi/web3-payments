import { getTransaction as getSolanaTransaction } from './platforms/solana/transaction'
import plugins from './plugins.js'
import route from './route.js'
import routers from './routers.js'

const getTransaction = (paymentRoute)=>{
  if(paymentRoute.blockchain === 'solana') {
    return getSolanaTransaction({ paymentRoute })
  }
}

export {
  route,
  routers,
  plugins,
  getTransaction,
}
