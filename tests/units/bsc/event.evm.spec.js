import Blockchains from '@depay/web3-blockchains'
import fetchMock from 'fetch-mock'
import { ethers } from 'ethers'
import { mock, resetMocks, anything } from '@depay/web3-mock'
import { mockAssets } from 'tests/mocks/api'
import { mockBasics, mockDecimals, mockBalance, mockAllowance } from 'tests/mocks/tokens'
import { mockPair, mockAmounts } from 'tests/mocks/Pancakeswap'
import { resetCache, getProvider } from '@depay/web3-client-evm'
import { route, plugins, routers } from 'dist/esm/index.evm'
import { Token } from '@depay/web3-tokens-evm'

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
  let WBNB = Blockchains[blockchain].wrapped.address
  let BNB = Blockchains[blockchain].currency.address
  let MAXINTBN = ethers.BigNumber.from(Blockchains[blockchain].maxInt)
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
  let transaction

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
    Blockchains.findByName(blockchain).tokens.forEach((token)=>{
      if(token.type == '20') {
        mock({ request: { return: '0', to: token.address, api: Token[blockchain].DEFAULT, method: 'balanceOf', params: accounts[0] }, provider, blockchain })
      }
    })

    mockBasics({ provider, blockchain, api: Token[blockchain].DEFAULT, token: BUSD, decimals: 18, name: 'BUSD', symbol: 'BUSD' })

    mockDecimals({ provider, blockchain, api: Token[blockchain].BEP20, token: CAKE, decimals: 18 })

    mockPair(provider, '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', [WBNB, BUSD])
    mockPair(provider, '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', [BUSD, WBNB])
    mockPair(provider, '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11', [CAKE, WBNB])
    mockPair(provider, Blockchains[blockchain].zero, [CAKE, BUSD])

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
    transaction = await routes[0].getTransaction()
    expect(transaction.method).toEqual('transfer')

    // swapped, event
    transaction = await routes[1].getTransaction()
    expect(transaction.method).toEqual('route')
    expect(transaction.params.plugins).toContain(plugins[blockchain].paymentWithEvent.address)
    expect(transaction.params.plugins).not.toContain(plugins[blockchain].payment.address)

    // swapped, event
    transaction = await routes[2].getTransaction()
    expect(transaction.method).toEqual('route')
    expect(transaction.params.plugins).toContain(plugins[blockchain].paymentWithEvent.address)
    expect(transaction.params.plugins).not.toContain(plugins[blockchain].payment.address)

  })

  it('`ifRoutedAndNative` emits an event for payment and fee if routed through the router and toToken is native', async ()=>{
    let routes
    
    routes = await route({
      accept: [{
        toAddress,
        blockchain,
        token: Blockchains[blockchain].currency.address,
        amount: 0.0001,
        fee: {
          receiver: '0x4e260bB2b25EC6F3A59B478fCDe5eD5B8D783B02',
          amount: '1%'
        }
      }],
      event: 'ifRoutedAndNative',
      from: { [blockchain]: fromAddress },
    })

    transaction = await routes[0].getTransaction()
    expect(transaction.params.plugins[0]).toEqual(plugins[blockchain].paymentWithEvent.address)
    expect(transaction.params.plugins[1]).toEqual(plugins[blockchain].paymentFeeWithEvent.address)

    routes = await route({
      accept: [{
        toAddress,
        blockchain,
        token: Blockchains[blockchain].wrapped.address,
        amount: 0.0001,
        fee: {
          receiver: '0x4e260bB2b25EC6F3A59B478fCDe5eD5B8D783B02',
          amount: '1%'
        }
      }],
      event: 'ifRoutedAndNative',
      from: { [blockchain]: fromAddress },
    })

    transaction = await routes[0].getTransaction()
    expect(transaction.params.plugins[0]).not.toEqual(plugins[blockchain].paymentWithEvent.address)
    expect(transaction.params.plugins[1]).toEqual(plugins[blockchain].payment.address)
    expect(transaction.params.plugins[2]).toEqual(plugins[blockchain].paymentFee.address)
  })
})
