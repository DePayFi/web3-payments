import fetchMock from 'fetch-mock'
import plugins from 'src/plugins'
import routers from 'src/routers'
import { Blockchain } from '@depay/web3-blockchains'
import { CONSTANTS } from '@depay/web3-constants'
import { ethers } from 'ethers'
import { mock, resetMocks, anything } from '@depay/web3-mock'
import { mockAssets } from 'tests/mocks/api'
import { mockBasics, mockDecimals, mockBalance, mockAllowance } from 'tests/mocks/tokens'
import { mockPair, mockAmounts } from 'tests/mocks/Pancakeswap'
import { resetCache, getProvider } from '@depay/web3-client'
import { route } from 'src'
import { Token } from '@depay/web3-tokens'

describe('route', ()=> {

  let provider
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

  beforeEach(async()=>{
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
    
    provider = await getProvider(blockchain)
    Blockchain.findByName(blockchain).tokens.forEach((token)=>{
      if(token.type == '20') {
        mock({ request: { return: '0', to: token.address, api: Token[blockchain].DEFAULT, method: 'balanceOf', params: accounts[0] }, provider, blockchain })
      }
    })

    mockBasics({ provider, blockchain, api: Token[blockchain].DEFAULT, token: BUSD, decimals: 18, name: 'BUSD', symbol: 'BUSD' })

    mockDecimals({ provider, blockchain, api: Token[blockchain].BEP20, token: CAKE, decimals: 18 })

    mockPair(provider, '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', [WBNB, BUSD])
    mockPair(provider, '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', [BUSD, WBNB])
    mockPair(provider, '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11', [CAKE, WBNB])
    mockPair(provider, CONSTANTS[blockchain].ZERO, [CAKE, BUSD])

    mockAmounts({ provider, method: 'getAmountsIn', params: [tokenAmountOutBN, [WBNB, BUSD]], amounts: [WBNBAmountInBN, tokenAmountOutBN] })
    mockAmounts({ provider, method: 'getAmountsIn', params: [tokenAmountOutBN, [CAKE, WBNB, BUSD]], amounts: [CAKEAmountInBN, WBNBAmountInBN, tokenAmountOutBN] })

    mockBalance({ provider, blockchain, api: Token[blockchain].BEP20, token: CAKE, account: fromAddress, balance: CAKEBalanceBN })
    mockBalance({ provider, blockchain, api: Token[blockchain].BEP20, token: BUSD, account: fromAddress, balance: BUSDBalanceBN })

    mockAllowance({ provider, blockchain, api: Token[blockchain].BEP20, token: CAKE, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })
    mockAllowance({ provider, blockchain, api: Token[blockchain].BEP20, token: BUSD, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })

    mock({ provider, blockchain, balance: { for: fromAddress, return: bnbBalanceBN } })
  })

  it('`ifSwapped` emits an event if payment route contains a swap and needs to be send through the router smart contract', async ()=>{

    let routes = await route({
      accept: [{
        toAddress,
        blockchain,
        token: toToken,
        amount: tokenAmountOut
      }],
      event: 'ifSwapped',
      from: { [blockchain]: fromAddress }
    })

    // not swapped, no event
    expect(routes[0].transaction.method).toEqual('transfer')
    expect(routes[0].event).toEqual(false)

    // swapped, event
    expect(routes[1].transaction.method).toEqual('route')
    expect(routes[1].transaction.params.plugins).toContain(plugins[blockchain].paymentWithEvent.address)
    expect(routes[1].transaction.params.plugins).not.toContain(plugins[blockchain].payment.address)
    expect(routes[1].event).toEqual(true)

    // swapped, event
    expect(routes[2].transaction.method).toEqual('route')
    expect(routes[2].transaction.params.plugins).toContain(plugins[blockchain].paymentWithEvent.address)
    expect(routes[1].transaction.params.plugins).not.toContain(plugins[blockchain].payment.address)
    expect(routes[2].event).toEqual(true)

  });
})
