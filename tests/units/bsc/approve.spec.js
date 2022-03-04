import fetchMock from 'fetch-mock'
import plugins from 'src/plugins'
import routers from 'src/routers'
import { CONSTANTS } from '@depay/web3-constants'
import { ethers } from 'ethers'
import { getWallet } from '@depay/web3-wallets'
import { mock, resetMocks, anything } from '@depay/web3-mock'
import { mockAssets } from 'tests/mocks/api'
import { mockDecimals, mockBalance, mockAllowance } from 'tests/mocks/tokens'
import { mockPair, mockAmounts } from 'tests/mocks/Pancakeswap'
import { resetCache, provider } from '@depay/web3-client'
import { route } from 'src'
import { Token } from '@depay/web3-tokens'

describe('route', ()=> {

  const blockchain = 'bsc'
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']
  beforeEach(resetMocks)
  beforeEach(()=>mock({ blockchain, accounts: { return: accounts } }))
  beforeEach(resetCache)
  beforeEach(()=>fetchMock.reset())

  let CAKE = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82"
  let BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"
  let WBNB = CONSTANTS[blockchain].WRAPPED
  let BNB = CONSTANTS[blockchain].NATIVE
  let MAXINTBN = ethers.BigNumber.from(CONSTANTS[blockchain].MAXINT)
  let bnbBalanceBN
  let CAKEBalanceBN
  let BUSDBalanceBN
  let toToken
  let WBNBAmountInBN
  let CAKEAmountInBN
  let tokenAmountOut
  let tokenOutDecimals
  let tokenAmountOutBN
  let fromAddress
  let toAddress

  beforeEach(()=>{
    bnbBalanceBN = ethers.BigNumber.from('18000000000000000000')
    CAKEBalanceBN = ethers.BigNumber.from('310000000000000000')
    BUSDBalanceBN = ethers.BigNumber.from('22000000000000000000')
    toToken = BUSD
    WBNBAmountInBN = ethers.BigNumber.from('11000000000000000000')
    CAKEAmountInBN = ethers.BigNumber.from('300000000000000000')
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
        "name": "Binance Coin",
        "symbol": "BNB",
        "address": BNB,
        "type": "NATIVE"
      }, {
        "name": "CAKE Stablecoin",
        "symbol": "CAKE",
        "address": CAKE,
        "type": "20"
      }, {
        "name": "BUSD",
        "symbol": "BUSD",
        "address": BUSD,
        "type": "20"
      }
    ]})
    mockDecimals({ provider: provider(blockchain), blockchain, api: Token[blockchain].BEP20, token: BUSD, decimals: 18 })
    mockDecimals({ provider: provider(blockchain), blockchain, api: Token[blockchain].BEP20, token: CAKE, decimals: 18 })

    mockPair(provider(blockchain), '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', [WBNB, BUSD])
    mockPair(provider(blockchain), '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', [BUSD, WBNB])
    mockPair(provider(blockchain), '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11', [CAKE, WBNB])
    mockPair(provider(blockchain), CONSTANTS[blockchain].ZERO, [CAKE, BUSD])

    mockAmounts({ provider: provider(blockchain), method: 'getAmountsIn', params: [tokenAmountOutBN, [WBNB, BUSD]], amounts: [WBNBAmountInBN, tokenAmountOutBN] })
    mockAmounts({ provider: provider(blockchain), method: 'getAmountsIn', params: [tokenAmountOutBN, [CAKE, WBNB, BUSD]], amounts: [CAKEAmountInBN, WBNBAmountInBN, tokenAmountOutBN] })

    mockBalance({ provider: provider(blockchain), blockchain, api: Token[blockchain].BEP20, token: CAKE, account: fromAddress, balance: CAKEBalanceBN })
    mockBalance({ provider: provider(blockchain), blockchain, api: Token[blockchain].BEP20, token: BUSD, account: fromAddress, balance: BUSDBalanceBN })

    mockAllowance({ provider: provider(blockchain), blockchain, api: Token[blockchain].BEP20, token: BUSD, account: fromAddress, spender: routers[blockchain].address, allowance: ethers.BigNumber.from('0') })
    mockAllowance({ provider: provider(blockchain), blockchain, api: Token[blockchain].BEP20, token: CAKE, account: fromAddress, spender: routers[blockchain].address, allowance: ethers.BigNumber.from('0') })

    mock({ provider: provider(blockchain), blockchain, balance: { for: fromAddress, return: bnbBalanceBN } })
  })

  it('provides an approve function together with the payment routing', async ()=>{

    mock({
      blockchain: 'bsc',
      transaction: {
        from: fromAddress,
        to: CAKE,
        api: Token[blockchain].DEFAULT,
        method: 'approve',
        params: ['0x0dfb7137bc64b63f7a0de7cb9cda178702666220', '115792089237316195423570985008687907853269984665640564039457584007913129639935']
      }
    })

    let routes = await route({
      accept: [{
        fromAddress,
        toAddress,
        blockchain,
        token: toToken,
        amount: tokenAmountOut,
      }]
    })

    expect(routes.map((route)=>{ return route.fromToken.address })).toEqual([BUSD, BNB, CAKE])
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

    expect(routes[0].fromToken.address).toEqual(BUSD)
    expect(routes[0].directTransfer).toEqual(true)
    expect(routes[0].approvalRequired).toEqual(false)
    expect(routes[0].approvalTransaction).toEqual(undefined)
  })
})
