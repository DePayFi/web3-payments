import fetchMock from 'fetch-mock'
import plugins from 'src/plugins'
import routers from 'src/routers'
import { Blockchain } from '@depay/web3-blockchains'
import { CONSTANTS } from '@depay/web3-constants'
import { ethers } from 'ethers'
import { mock, resetMocks, anything } from '@depay/web3-mock'
import { mockAssets } from 'tests/mocks/api'
import { mockBasics, mockDecimals, mockBalance, mockAllowance } from 'tests/mocks/tokens'
import { mockPair, mockAmounts } from 'tests/mocks/UniswapV2'
import { resetCache, getProvider } from '@depay/web3-client-evm'
import { route } from 'src/index.evm'
import { Token } from '@depay/web3-tokens-evm'

describe('event', ()=> {

  let provider
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

  beforeEach(async()=>{
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

    provider = await getProvider(blockchain)
    Blockchain.findByName(blockchain).tokens.forEach((token)=>{
      if(token.type == '20') {
        mock({ request: { return: '0', to: token.address, api: Token[blockchain].DEFAULT, method: 'balanceOf', params: accounts[0] }, provider, blockchain })
      }
    })

    mockBasics({ provider, blockchain, api: Token[blockchain].DEFAULT, token: DEPAY, decimals: 18, name: 'DePay', symbol: 'DEPAY' })

    mockDecimals({ provider, blockchain, api: Token[blockchain].ERC20, token: DAI, decimals: 18 })

    mockPair(provider, '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', [WETH, DEPAY])
    mockPair(provider, '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', [DEPAY, WETH])
    mockPair(provider, '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11', [DAI, WETH])
    mockPair(provider, CONSTANTS[blockchain].ZERO, [DAI, DEPAY])

    mockAmounts({ provider, method: 'getAmountsIn', params: [tokenAmountOutBN, [WETH, DEPAY]], amounts: [WETHAmountInBN, tokenAmountOutBN] })
    mockAmounts({ provider, method: 'getAmountsIn', params: [tokenAmountOutBN, [DAI, WETH, DEPAY]], amounts: [DAIAmountInBN, WETHAmountInBN, tokenAmountOutBN] })

    mockBalance({ provider, blockchain, api: Token[blockchain].ERC20, token: DAI, account: fromAddress, balance: DAIBalanceBN })
    mockBalance({ provider, blockchain, api: Token[blockchain].ERC20, token: DEPAY, account: fromAddress, balance: DEPAYBalanceBN })

    mockAllowance({ provider, blockchain, api: Token[blockchain].ERC20, token: DAI, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })
    mockAllowance({ provider, blockchain, api: Token[blockchain].ERC20, token: DEPAY, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })

    mock({ provider, blockchain, balance: { for: fromAddress, return: etherBalanceBN } })
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

    // swapped, event
    expect(routes[1].transaction.method).toEqual('route')
    expect(routes[1].transaction.params.plugins).toContain(plugins[blockchain].paymentWithEvent.address)
    expect(routes[1].transaction.params.plugins).not.toContain(plugins[blockchain].payment.address)

    // swapped, event
    expect(routes[2].transaction.method).toEqual('route')
    expect(routes[2].transaction.params.plugins).toContain(plugins[blockchain].paymentWithEvent.address)
    expect(routes[1].transaction.params.plugins).not.toContain(plugins[blockchain].payment.address)

  })

  it('`ifRoutedAndNative` emits an event for payment and fee if routed through the router and toToken is native', async ()=>{
    let routes
    
    routes = await route({
      accept: [{
        toAddress,
        blockchain,
        token: CONSTANTS[blockchain].NATIVE,
        amount: 0.0001
      }],
      event: 'ifRoutedAndNative',
      from: { [blockchain]: fromAddress },
      fee: {
        receiver: '0x4e260bB2b25EC6F3A59B478fCDe5eD5B8D783B02',
        amount: '1%'
      }
    })

    expect(routes[0].transaction.params.plugins[0]).toEqual(plugins[blockchain].paymentWithEvent.address)
    expect(routes[0].transaction.params.plugins[1]).toEqual(plugins[blockchain].paymentFeeWithEvent.address)

    routes = await route({
      accept: [{
        toAddress,
        blockchain,
        token: CONSTANTS[blockchain].WRAPPED,
        amount: 0.0001
      }],
      event: 'ifRoutedAndNative',
      from: { [blockchain]: fromAddress },
      fee: {
        receiver: '0x4e260bB2b25EC6F3A59B478fCDe5eD5B8D783B02',
        amount: '1%'
      }
    })

    expect(routes[0].transaction.params.plugins[0]).not.toEqual(plugins[blockchain].paymentWithEvent.address)
    expect(routes[0].transaction.params.plugins[1]).toEqual(plugins[blockchain].payment.address)
    expect(routes[0].transaction.params.plugins[2]).toEqual(plugins[blockchain].paymentFee.address)
  })
})
