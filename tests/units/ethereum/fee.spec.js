import fetchMock from 'fetch-mock'
import plugins from 'src/plugins'
import routers from 'src/routers'
import { CONSTANTS } from '@depay/web3-constants'
import { ethers } from 'ethers'
import { mock, resetMocks, anything } from '@depay/web3-mock'
import { mockAssets } from 'tests/mocks/api'
import { mockDecimals, mockBalance, mockAllowance } from 'tests/mocks/tokens'
import { mockPair, mockAmounts } from 'tests/mocks/UniswapV2'
import { resetCache, provider } from '@depay/web3-client'
import { route } from 'src'
import { Token } from '@depay/web3-tokens'

describe('fee', ()=> {

  const blockchain = 'ethereum'
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']
  beforeEach(resetMocks)
  beforeEach(()=>mock({ blockchain, accounts: { return: accounts } }))
  beforeEach(resetCache)
  beforeEach(()=>fetchMock.reset())

  let DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
  let DEPAY = "0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb"
  let WETH = CONSTANTS[blockchain].WRAPPED
  let ETH = CONSTANTS[blockchain].NATIVE
  let MAXINTBN = ethers.BigNumber.from(CONSTANTS[blockchain].MAXINT)
  let etherBalanceBN
  let DAIBalanceBN
  let DEPAYBalanceBN
  let toToken
  let WETHAmountInBN
  let DAIAmountInBN
  let tokenAmountOut
  let tokenOutDecimals
  let tokenAmountOutBN
  let fromAddress
  let toAddress
  let feeReceiver = '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'

  beforeEach(()=>{
    etherBalanceBN = ethers.BigNumber.from('18000000000000000000')
    DAIBalanceBN = ethers.BigNumber.from('310000000000000000')
    DEPAYBalanceBN = ethers.BigNumber.from('22000000000000000000')
    toToken = DEPAY
    WETHAmountInBN = ethers.BigNumber.from('11000000000000000000')
    DAIAmountInBN = ethers.BigNumber.from('300000000000000000')
    tokenAmountOut = 20
    tokenOutDecimals = 18
    tokenAmountOutBN = ethers.utils.parseUnits(tokenAmountOut.toString(), tokenOutDecimals)
    fromAddress = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
    toAddress = '0x65aBbdEd9B937E38480A50eca85A8E4D2c8350E4'
  })

  beforeEach(()=>{
    mock(blockchain)
    mockAssets({ blockchain, account: fromAddress, assets: [
      {
        "name": "Ether",
        "symbol": "ETH",
        "address": ETH,
        "type": "NATIVE"
      }, {
        "name": "Dai Stablecoin",
        "symbol": "DAI",
        "address": DAI,
        "type": "20"
      }, {
        "name": "DePay",
        "symbol": "DEPAY",
        "address": DEPAY,
        "type": "20"
      }
    ]})
    mockDecimals({ provider: provider(blockchain), blockchain, api: Token[blockchain].ERC20, token: DEPAY, decimals: 18 })
    mockDecimals({ provider: provider(blockchain), blockchain, api: Token[blockchain].ERC20, token: DAI, decimals: 18 })

    mockPair(provider(blockchain), '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', [WETH, DEPAY])
    mockPair(provider(blockchain), '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', [DEPAY, WETH])
    mockPair(provider(blockchain), '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11', [DAI, WETH])
    mockPair(provider(blockchain), CONSTANTS[blockchain].ZERO, [DAI, DEPAY])

    mockAmounts({ provider: provider(blockchain), method: 'getAmountsIn', params: [tokenAmountOutBN, [WETH, DEPAY]], amounts: [WETHAmountInBN, tokenAmountOutBN] })
    mockAmounts({ provider: provider(blockchain), method: 'getAmountsIn', params: [tokenAmountOutBN, [DAI, WETH, DEPAY]], amounts: [DAIAmountInBN, WETHAmountInBN, tokenAmountOutBN] })

    mockBalance({ provider: provider(blockchain), blockchain, api: Token[blockchain].ERC20, token: DAI, account: fromAddress, balance: DAIBalanceBN })
    mockBalance({ provider: provider(blockchain), blockchain, api: Token[blockchain].ERC20, token: DEPAY, account: fromAddress, balance: DEPAYBalanceBN })

    mockAllowance({ provider: provider(blockchain), blockchain, api: Token[blockchain].ERC20, token: DAI, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })
    mockAllowance({ provider: provider(blockchain), blockchain, api: Token[blockchain].ERC20, token: DEPAY, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })

    mock({ provider: provider(blockchain), blockchain, balance: { for: fromAddress, return: etherBalanceBN } })
  })

  describe('fee in percentage', ()=>{
    it('adds fee amount and fee receiver to payment route transaction', async ()=>{

      let routes = await route({
        accept: [{
          fromAddress,
          toAddress,
          blockchain,
          token: toToken,
          amount: tokenAmountOut
        }],
        fee: {
          receiver: feeReceiver,
          amount: '9%'
        }
      })

      // not swapped
      expect(routes[0].transaction.method).toEqual('route')
      expect(routes[0].transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(routes[0].transaction.params.amounts).toEqual(['20000000000000000000', '18200000000000000000', '0', '0', '1800000000000000000'])
      expect(routes[0].transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])

      // swapped
      expect(routes[1].transaction.method).toEqual('route')
      expect(routes[1].transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(routes[1].transaction.params.amounts[0]).toEqual('11000000000000000000')
      expect(routes[1].transaction.params.amounts[1]).toEqual('18200000000000000000')
      expect(routes[1].transaction.params.amounts[4]).toEqual('1800000000000000000')
      expect(routes[1].transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])

      // swapped
      expect(routes[2].transaction.method).toEqual('route')
      expect(routes[2].transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(routes[2].transaction.params.amounts[0]).toEqual('300000000000000000')
      expect(routes[2].transaction.params.amounts[1]).toEqual('18200000000000000000')
      expect(routes[2].transaction.params.amounts[4]).toEqual('1800000000000000000')
      expect(routes[2].transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])
    });
  })

  describe('fee in absolute numbers as pure number', ()=>{
    it('adds fee amount and fee receiver to payment route transaction', async ()=>{

      let routes = await route({
        accept: [{
          fromAddress,
          toAddress,
          blockchain,
          token: toToken,
          amount: tokenAmountOut
        }],
        fee: {
          receiver: feeReceiver,
          amount: 1.8
        }
      })

      // not swapped
      expect(routes[0].transaction.method).toEqual('route')
      expect(routes[0].transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(routes[0].transaction.params.amounts).toEqual(['20000000000000000000', '18200000000000000000', '0', '0', '1800000000000000000'])
      expect(routes[0].transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])

      // swapped
      expect(routes[1].transaction.method).toEqual('route')
      expect(routes[1].transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(routes[1].transaction.params.amounts[0]).toEqual('11000000000000000000')
      expect(routes[1].transaction.params.amounts[1]).toEqual('18200000000000000000')
      expect(routes[1].transaction.params.amounts[4]).toEqual('1800000000000000000')
      expect(routes[1].transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])

      // swapped
      expect(routes[2].transaction.method).toEqual('route')
      expect(routes[2].transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(routes[2].transaction.params.amounts[0]).toEqual('300000000000000000')
      expect(routes[2].transaction.params.amounts[1]).toEqual('18200000000000000000')
      expect(routes[2].transaction.params.amounts[4]).toEqual('1800000000000000000')
      expect(routes[2].transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])
    });
  })

  describe('fee in absolute numbers as BN string', ()=>{
    it('adds fee amount and fee receiver to payment route transaction', async ()=>{

      let routes = await route({
        accept: [{
          fromAddress,
          toAddress,
          blockchain,
          token: toToken,
          amount: tokenAmountOut
        }],
        fee: {
          receiver: feeReceiver,
          amount: '1800000000000000000'
        }
      })

      // not swapped
      expect(routes[0].transaction.method).toEqual('route')
      expect(routes[0].transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(routes[0].transaction.params.amounts).toEqual(['20000000000000000000', '18200000000000000000', '0', '0', '1800000000000000000'])
      expect(routes[0].transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])

      // swapped
      expect(routes[1].transaction.method).toEqual('route')
      expect(routes[1].transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(routes[1].transaction.params.amounts[0]).toEqual('11000000000000000000')
      expect(routes[1].transaction.params.amounts[1]).toEqual('18200000000000000000')
      expect(routes[1].transaction.params.amounts[4]).toEqual('1800000000000000000')
      expect(routes[1].transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])

      // swapped
      expect(routes[2].transaction.method).toEqual('route')
      expect(routes[2].transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(routes[2].transaction.params.amounts[0]).toEqual('300000000000000000')
      expect(routes[2].transaction.params.amounts[1]).toEqual('18200000000000000000')
      expect(routes[2].transaction.params.amounts[4]).toEqual('1800000000000000000')
      expect(routes[2].transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])
    });
  })
})
