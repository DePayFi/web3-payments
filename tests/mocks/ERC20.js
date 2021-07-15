import { ERC20 } from 'depay-blockchain-token'
import { mock } from 'depay-web3mock'

let mockDecimals = ({ blockchain, token, decimals })=>{
  return mock({
    blockchain: 'ethereum',
    call: {
      to: token,
      api: ERC20,
      method: 'decimals',
      return: decimals
    }
  })
}

let mockBalance = ({ blockchain, token, account, balance })=>{
  mock({
    blockchain,
    call: {
      to: token,
      api: ERC20,
      method: 'balanceOf',
      params: account,
      return: balance
    }
  })
}

let mockNotTransferable = ({ blockchain, token })=>{
  mock({
    blockchain: 'ethereum',
    estimate: {
      api: ERC20,
      to: token,
      method: 'transfer',
      return: Error('Not transferable')
    }
  })
}

let mockAllowance = ({ blockchain, token, account, spender, allowance })=>{
  mock({
    blockchain,
    call: {
      to: token,
      api: ERC20,
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
