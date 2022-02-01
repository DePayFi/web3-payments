import { ethers } from 'ethers'
import { findByName } from '@depay/web3-exchanges'
import { mock } from '@depay/web3-mock'

let exchange = findByName('pancakeswap')

let mockPair = (provider, pair, params)=>{
  mock({
    provider: provider,
    blockchain: 'bsc',
    call: {
      to: pair,
      api: exchange.contracts.pair.api,
      method: 'getReserves',
      return: [ethers.utils.parseUnits('1000', 18), ethers.utils.parseUnits('1000', 18), '1629804922']
    }
  })
  mock({
    provider: provider,
    blockchain: 'bsc',
    call: {
      to: pair,
      api: exchange.contracts.pair.api,
      method: 'token0',
      return: params[0]
    }
  })
  mock({
    provider: provider,
    blockchain: 'bsc',
    call: {
      to: pair,
      api: exchange.contracts.pair.api,
      method: 'token1',
      return: params[1]
    }
  })
  mock({
    provider,
    blockchain: 'bsc',
    call: {
      to: exchange.contracts.factory.address,
      api: exchange.contracts.factory.api,
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
    call: {
      to: exchange.contracts.router.address,
      api: exchange.contracts.router.api,
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
