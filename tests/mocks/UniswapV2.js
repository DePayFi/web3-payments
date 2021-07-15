import { UniswapV2Factory, UniswapV2Router } from '../apis'
import { mock } from 'depay-web3mock'

let mockPair = (pair, params)=>{
  mock({
    blockchain: 'ethereum',
    call: {
      to: '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f',
      api: UniswapV2Factory,
      method: 'getPair',
      params: params,
      return: pair
    }
  })
}

let mockAmounts = ({ method, params, amounts })=>{
  mock({
    blockchain: 'ethereum',
    call: {
      to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      api: UniswapV2Router,
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
