import config from './config'
import route from './route'
import routers from './routers'
import { getTransaction as getSVMTransaction } from './platforms/svm/transaction'

const getTransaction = (paymentRoute)=>{
  if(paymentRoute.blockchain === 'solana') { // solanapay
    return getSVMTransaction({ paymentRoute })
  }
}

export {
  config,
  route,
  routers,
  getTransaction,
}
