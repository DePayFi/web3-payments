import Token from '@depay/web3-tokens'
import { mock } from '@depay/web3-mock'

let mockBasics = ({ provider, blockchain, api, token, decimals, name, symbol })=>{
  return [
    mock({ provider, blockchain, request: { to: token, api, method: 'decimals', return: decimals }}),
    mock({ provider, blockchain, request: { to: token, api, method: 'name', return: name }}),
    mock({ provider, blockchain, request: { to: token, api, method: 'symbol', return: symbol }}),
  ]
}

let mockDecimals = ({ provider, blockchain, api, token, decimals })=>{
  return mock({
    provider,
    blockchain,
    request: {
      to: token,
      api,
      method: 'decimals',
      return: decimals
    }
  })
}

let mockBalance = ({ provider, blockchain, api, token, account, balance })=>{
  mock({
    provider,
    blockchain,
    request: {
      to: token,
      api,
      method: 'balanceOf',
      params: account,
      return: balance
    }
  })
}

let mockAllowance = ({ provider, blockchain, api, token, account, spender, allowance })=>{
  mock({
    provider,
    blockchain,
    request: {
      to: token,
      api,
      method: 'allowance',
      params: [account, spender],
      return: allowance
    }
  })
}

export {
  mockDecimals,
  mockBalance,
  mockAllowance,
  mockBasics,
}
