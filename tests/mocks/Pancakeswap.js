import { ethers } from 'ethers'
import { find } from '@depay/web3-exchanges'
import { mock } from '@depay/web3-mock'

let exchange = find('bsc', 'pancakeswap')

let mockPair = (provider, pair, params)=>{
  mock({
    provider: provider,
    blockchain: 'bsc',
    request: {
      to: pair,
      api: exchange.pair.api,
      method: 'getReserves',
      return: [ethers.utils.parseUnits('1000', 18), ethers.utils.parseUnits('1000', 18), '1629804922']
    }
  })
  mock({
    provider: provider,
    blockchain: 'bsc',
    request: {
      to: pair,
      api: exchange.pair.api,
      method: 'token0',
      return: params[0]
    }
  })
  mock({
    provider: provider,
    blockchain: 'bsc',
    request: {
      to: pair,
      api: exchange.pair.api,
      method: 'token1',
      return: params[1]
    }
  })
  mock({
    provider,
    blockchain: 'bsc',
    request: {
      to: exchange.factory.address,
      api: exchange.factory.api,
      method: 'getPair',
      params: params,
      return: pair
    }
  })
}

let mockAmounts = ({ provider, method, params, amounts })=>{
  return mock({
    provider,
    blockchain: 'bsc',
    request: {
      to: exchange.router.address,
      api: exchange.router.api,
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
