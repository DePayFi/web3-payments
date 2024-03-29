import { ethers } from 'ethers'
import Exchanges from '@depay/web3-exchanges'
import { mock } from '@depay/web3-mock'

let mockPair = ({ blockchain, provider, pair, params })=>{
  let exchange
  switch (blockchain) {
    case 'ethereum':
      exchange = Exchanges.uniswap_v2.ethereum
    break;
    case 'bsc':
      exchange = Exchanges.pancakeswap.bsc
    break;
  }
  mock({
    provider: provider,
    blockchain,
    request: {
      to: pair,
      api: exchange.pair.api,
      method: 'getReserves',
      return: [ethers.utils.parseUnits('1000', 18), ethers.utils.parseUnits('1000', 18), '1629804922']
    }
  })
  mock({
    provider: provider,
    blockchain,
    request: {
      to: pair,
      api: exchange.pair.api,
      method: 'token0',
      return: params[0]
    }
  })
  mock({
    provider: provider,
    blockchain,
    request: {
      to: pair,
      api: exchange.pair.api,
      method: 'token1',
      return: params[1]
    }
  })
  mock({
    provider,
    blockchain,
    request: {
      to: exchange.factory.address,
      api: exchange.factory.api,
      method: 'getPair',
      params: params,
      return: pair
    }
  })
}

let mockAmounts = ({ blockchain, provider, method, params, amounts })=>{
  let exchange
  switch (blockchain) {
    case 'ethereum':
      exchange = Exchanges.uniswap_v2.ethereum
    break;
    case 'bsc':
      exchange = Exchanges.pancakeswap.bsc
    break;
  }
  return mock({
    provider,
    blockchain,
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
