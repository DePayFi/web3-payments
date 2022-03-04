import fetchMock from 'fetch-mock'
import plugins from 'src/plugins'
import routers from 'src/routers'
import { CONSTANTS } from '@depay/web3-constants'
import { ethers } from 'ethers'
import { getWallet } from '@depay/web3-wallets'
import { mock, resetMocks, anything } from '@depay/web3-mock'
import { mockAssets } from 'tests/mocks/api'
import { mockDecimals, mockBalance, mockAllowance } from 'tests/mocks/tokens'
import { mockPair, mockAmounts } from 'tests/mocks/UniswapV2'
import { resetCache, provider } from '@depay/web3-client'
import { route } from 'src'
import { Token } from '@depay/web3-tokens'

describe('route', ()=> {

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

    mockAllowance({ provider: provider(blockchain), blockchain, api: Token[blockchain].ERC20, token: DAI, account: fromAddress, spender: routers[blockchain].address, allowance: ethers.BigNumber.from('0') })
    mockAllowance({ provider: provider(blockchain), blockchain, api: Token[blockchain].ERC20, token: DEPAY, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })

    mock({ provider: provider(blockchain), blockchain, balance: { for: fromAddress, return: etherBalanceBN } })

  })

  it('provides an approve function together with the payment routing', async ()=>{

    mock({
      blockchain: 'ethereum',
      transaction: {
        from: fromAddress,
        to: DAI,
        api: Token[blockchain].DEFAULT,
        method: 'approve',
        params: ['0xae60aC8e69414C2Dc362D0e6a03af643d1D85b92', '115792089237316195423570985008687907853269984665640564039457584007913129639935']
      }
    })

    let routes = await route({
      accept: [{
        fromAddress,
        toAddress,
        blockchain,
        token: toToken,
        amount: tokenAmountOut
      }]
    })

    expect(routes.map((route)=>{ return route.fromToken.address })).toEqual([DEPAY, ETH, DAI])
    expect(routes.map((route)=>{ return typeof route.approvalTransaction })).toEqual(['undefined', 'undefined', 'object'])

    let wallet = getWallet()
    await wallet.sendTransaction(routes[2].approvalTransaction)
  })

  it('does not require approval for direct transfers', async ()=>{

    let routes = await route({
      accept: [{
        fromAddress,
        toAddress,
        blockchain,
        token: toToken,
        amount: tokenAmountOut
      }]
    })

    expect(routes[0].fromToken.address).toEqual(DEPAY)
    expect(routes[0].directTransfer).toEqual(true)
    expect(routes[0].approvalRequired).toEqual(false)
    expect(routes[0].approvalTransaction).toEqual(undefined)
  })
})
