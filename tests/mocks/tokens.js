import { Token } from 'depay-web3-tokens'
import { mock } from 'depay-web3-mock'

let mockDecimals = ({ blockchain, api, token, decimals })=>{
  return mock({
    blockchain,
    call: {
      to: token,
      api,
      method: 'decimals',
      return: decimals
    }
  })
}

let mockBalance = ({ blockchain, api, token, account, balance })=>{
  mock({
    blockchain,
    call: {
      to: token,
      api,
      method: 'balanceOf',
      params: account,
      return: balance
    }
  })
}

let mockNotTransferable = ({ blockchain, api, token })=>{
  mock({
    blockchain,
    estimate: {
      api,
      to: token,
      method: 'transfer',
      return: Error('Not transferable')
    }
  })
}

let mockAllowance = ({ blockchain, api, token, account, spender, allowance })=>{
  mock({
    blockchain,
    call: {
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
  mockNotTransferable,
  mockAllowance,
}
