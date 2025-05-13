import { getTransaction as getSVMTransaction } from './platforms/svm/transaction'
import route from './route'
import routers from './routers'

const getTransaction = (paymentRoute)=>{
  if(paymentRoute.blockchain === 'solana') { // solanapay
    return getSVMTransaction({ paymentRoute })
  }
}

export {
  route,
  routers,
  getTransaction,
}
