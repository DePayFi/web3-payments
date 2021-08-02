import { PancakeswapFactory, PancakeswapRouter } from '../apis'
import { mock } from 'depay-web3-mock'

let mockPair = (pair, params)=>{
  mock({
    blockchain: 'bsc',
    call: {
      to: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
      api: PancakeswapFactory,
      method: 'getPair',
      params: params,
      return: pair
    }
  })
}

let mockAmounts = ({ method, params, amounts })=>{
  mock({
    blockchain: 'bsc',
    call: {
      to: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
      api: PancakeswapRouter,
      method,
      params,
      return: amounts
    }
  })
}

export {
  mockPair,
  mockAmounts,
}
