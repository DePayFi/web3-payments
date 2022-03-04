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

describe('route to contract as payment receiver', ()=> {

  const blockchain = 'bsc'
  const accounts = ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045']
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

    mockAllowance({ provider: provider(blockchain), blockchain, api: Token[blockchain].BEP20, token: CAKE, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })
    mockAllowance({ provider: provider(blockchain), blockchain, api: Token[blockchain].BEP20, token: BUSD, account: fromAddress, spender: routers[blockchain].address, allowance: '0' })

    mock({ provider: provider(blockchain), blockchain, balance: { for: fromAddress, return: bnbBalanceBN } })
  })

  it('constructs payment transaction in a way that allows to pay into a smart contract with address, amount and boolean', async ()=>{

    let routes = await route({
      accept: [{
        fromAddress,
        toAddress,
        toContract: {
          signature: 'claim(address,uint256,bool)',
          params: ['true']
        },
        blockchain,
        token: toToken,
        amount: tokenAmountOut
      }]
    })

    // direct transfer into smart contract goes through router none the less, to ensure approval!
    expect(routes[0].blockchain).toEqual(blockchain)
    expect(routes[0].fromToken.address).toEqual(BUSD)
    expect(routes[0].toToken.address).toEqual(BUSD)
    expect(routes[0].toAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[0].fromAddress).toEqual(fromAddress)
    expect(routes[0].toAddress).toEqual(toAddress)
    expect(routes[0].toContract.signature).toEqual('claim(address,uint256,bool)')
    expect(routes[0].toContract.params[0]).toEqual('true')
    expect(routes[0].fromBalance).toEqual(BUSDBalanceBN.toString())
    expect(routes[0].fromAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[0].exchangeRoutes).toEqual([])
    expect(routes[0].transaction.api).toEqual(routers[blockchain].api)
    expect(routes[0].transaction.blockchain).toEqual(blockchain)
    expect(routes[0].transaction.to).toEqual(routers[blockchain].address)
    expect(routes[0].transaction.method).toEqual('route')
    expect(routes[0].transaction.value).toEqual('0')
    expect(routes[0].transaction.params.addresses).toEqual([fromAddress, toAddress])
    expect(routes[0].transaction.params.amounts[0]).toEqual('20000000000000000000')
    expect(routes[0].transaction.params.amounts[1]).toEqual('20000000000000000000')
    expect(routes[0].transaction.params.path).toEqual([BUSD])
    expect(routes[0].transaction.params.plugins).toEqual([plugins[blockchain].contractCall.approveAndCallContractAddressAmountBoolean.address])
    expect(routes[0].transaction.params.data).toEqual(['claim(address,uint256,bool)', 'true'])
    expect(routes[0].approvalRequired).toEqual(true)

    // BNB/WBNB
    expect(routes[1].blockchain).toEqual(blockchain)
    expect(routes[1].fromToken.address).toEqual(BNB)
    expect(routes[1].toToken.address).toEqual(BUSD)
    expect(routes[1].toAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[1].fromAmount).toEqual(WBNBAmountInBN.toString())
    expect(routes[1].fromAddress).toEqual(fromAddress)
    expect(routes[1].toAddress).toEqual(toAddress)
    expect(routes[1].fromBalance).toEqual(bnbBalanceBN.toString())
    expect(routes[1].toContract.signature).toEqual('claim(address,uint256,bool)')
    expect(routes[1].toContract.params[0]).toEqual('true')
    expect(routes[1].transaction.api).toEqual(routers[blockchain].api)
    expect(routes[1].transaction.blockchain).toEqual(blockchain)
    expect(routes[1].transaction.to).toEqual(routers[blockchain].address)
    expect(routes[1].transaction.method).toEqual('route')
    expect(routes[1].transaction.value).toEqual(WBNBAmountInBN.toString())
    expect(routes[1].transaction.params.addresses).toEqual([fromAddress, toAddress])
    expect(routes[1].transaction.params.amounts[0]).toEqual(WBNBAmountInBN.toString())
    expect(routes[1].transaction.params.amounts[1]).toEqual('20000000000000000000')
    expect(routes[1].transaction.params.path).toEqual([BNB, BUSD])
    expect(routes[1].transaction.params.plugins[0]).toEqual(plugins[blockchain].pancakeswap.address)
    expect(routes[1].transaction.params.plugins[1]).toEqual(plugins[blockchain].contractCall.approveAndCallContractAddressAmountBoolean.address)
    expect(routes[1].transaction.params.data).toEqual(['claim(address,uint256,bool)', 'true'])
    expect(routes[1].approvalRequired).toEqual(false)

    // CAKE
    expect(routes[2].blockchain).toEqual(blockchain)
    expect(routes[2].fromToken.address).toEqual(CAKE)
    expect(routes[2].toToken.address).toEqual(BUSD)
    expect(routes[2].toAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[2].fromAmount).toEqual(CAKEAmountInBN.toString())
    expect(routes[2].fromAddress).toEqual(fromAddress)
    expect(routes[2].toAddress).toEqual(toAddress)
    expect(routes[2].fromBalance).toEqual(CAKEBalanceBN.toString())
    expect(routes[2].transaction.value).toEqual('0')
    expect(routes[2].toContract.signature).toEqual('claim(address,uint256,bool)')
    expect(routes[2].toContract.params[0]).toEqual('true')
    expect(routes[2].transaction.api).toEqual(routers[blockchain].api)
    expect(routes[2].transaction.blockchain).toEqual(blockchain)
    expect(routes[2].transaction.to).toEqual(routers[blockchain].address)
    expect(routes[2].transaction.method).toEqual('route')
    expect(routes[2].transaction.params.addresses).toEqual([fromAddress, toAddress])
    expect(routes[2].transaction.params.amounts[0]).toEqual(CAKEAmountInBN.toString())
    expect(routes[2].transaction.params.amounts[1]).toEqual('20000000000000000000')
    expect(routes[2].transaction.params.path).toEqual([CAKE, WBNB, BUSD])
    expect(routes[2].transaction.params.plugins[0]).toEqual(plugins[blockchain].pancakeswap.address)
    expect(routes[2].transaction.params.plugins[1]).toEqual(plugins[blockchain].contractCall.approveAndCallContractAddressAmountBoolean.address)
    expect(routes[2].transaction.params.data).toEqual(['claim(address,uint256,bool)', 'true'])
    expect(routes[2].approvalRequired).toEqual(false)
  })

  it('constructs payment transaction in a way that allows to pay into a smart contract with address passed amount and boolean', async ()=>{

    let routes = await route({
      accept: [{
        fromAddress,
        toAddress,
        toContract: {
          signature: 'claim(address,uint256,bool)',
          params: ['40000000000000000000', 'true']
        },
        blockchain,
        token: toToken,
        amount: tokenAmountOut
      }]
    })

    // direct transfer into smart contract goes through router none the less, to ensure approval!
    expect(routes[0].blockchain).toEqual(blockchain)
    expect(routes[0].fromToken.address).toEqual(BUSD)
    expect(routes[0].toToken.address).toEqual(BUSD)
    expect(routes[0].toAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[0].fromAddress).toEqual(fromAddress)
    expect(routes[0].toAddress).toEqual(toAddress)
    expect(routes[0].toContract.signature).toEqual('claim(address,uint256,bool)')
    expect(routes[0].toContract.params[0]).toEqual('40000000000000000000')
    expect(routes[0].toContract.params[1]).toEqual('true')
    expect(routes[0].fromBalance).toEqual(BUSDBalanceBN.toString())
    expect(routes[0].fromAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[0].exchangeRoutes).toEqual([])
    expect(routes[0].transaction.api).toEqual(routers[blockchain].api)
    expect(routes[0].transaction.blockchain).toEqual(blockchain)
    expect(routes[0].transaction.to).toEqual(routers[blockchain].address)
    expect(routes[0].transaction.method).toEqual('route')
    expect(routes[0].transaction.value).toEqual('0')
    expect(routes[0].transaction.params.addresses).toEqual([fromAddress, toAddress])
    expect(routes[0].transaction.params.amounts[0]).toEqual('20000000000000000000')
    expect(routes[0].transaction.params.amounts[1]).toEqual('20000000000000000000')
    expect(routes[0].transaction.params.amounts[2]).toEqual('0')
    expect(routes[0].transaction.params.amounts[3]).toEqual('0')
    expect(routes[0].transaction.params.amounts[4]).toEqual('0')
    expect(routes[0].transaction.params.amounts[5]).toEqual('40000000000000000000')
    expect(routes[0].transaction.params.path).toEqual([BUSD])
    expect(routes[0].transaction.params.plugins).toEqual([plugins[blockchain].contractCall.approveAndCallContractAddressPassedAmountBoolean.address])
    expect(routes[0].transaction.params.data).toEqual(['claim(address,uint256,bool)', 'true'])
    expect(routes[0].approvalRequired).toEqual(true)

    // BNB/WBNB
    expect(routes[1].blockchain).toEqual(blockchain)
    expect(routes[1].fromToken.address).toEqual(BNB)
    expect(routes[1].toToken.address).toEqual(BUSD)
    expect(routes[1].toAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[1].fromAmount).toEqual(WBNBAmountInBN.toString())
    expect(routes[1].fromAddress).toEqual(fromAddress)
    expect(routes[1].toAddress).toEqual(toAddress)
    expect(routes[1].fromBalance).toEqual(bnbBalanceBN.toString())
    expect(routes[1].toContract.signature).toEqual('claim(address,uint256,bool)')
    expect(routes[1].toContract.params[0]).toEqual('40000000000000000000')
    expect(routes[1].toContract.params[1]).toEqual('true')
    expect(routes[1].transaction.api).toEqual(routers[blockchain].api)
    expect(routes[1].transaction.blockchain).toEqual(blockchain)
    expect(routes[1].transaction.to).toEqual(routers[blockchain].address)
    expect(routes[1].transaction.method).toEqual('route')
    expect(routes[1].transaction.value).toEqual(WBNBAmountInBN.toString())
    expect(routes[1].transaction.params.addresses).toEqual([fromAddress, toAddress])
    expect(routes[1].transaction.params.amounts[0]).toEqual(WBNBAmountInBN.toString())
    expect(routes[1].transaction.params.amounts[1]).toEqual('20000000000000000000')
    expect(routes[1].transaction.params.amounts[3]).toEqual('0')
    expect(routes[1].transaction.params.amounts[4]).toEqual('0')
    expect(routes[1].transaction.params.amounts[5]).toEqual('40000000000000000000')
    expect(routes[1].transaction.params.path).toEqual([BNB, BUSD])
    expect(routes[1].transaction.params.plugins[0]).toEqual(plugins[blockchain].pancakeswap.address)
    expect(routes[1].transaction.params.plugins[1]).toEqual(plugins[blockchain].contractCall.approveAndCallContractAddressPassedAmountBoolean.address)
    expect(routes[1].transaction.params.data).toEqual(['claim(address,uint256,bool)', 'true'])
    expect(routes[1].approvalRequired).toEqual(false)

    // CAKE
    expect(routes[2].blockchain).toEqual(blockchain)
    expect(routes[2].fromToken.address).toEqual(CAKE)
    expect(routes[2].toToken.address).toEqual(BUSD)
    expect(routes[2].toAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[2].fromAmount).toEqual(CAKEAmountInBN.toString())
    expect(routes[2].fromAddress).toEqual(fromAddress)
    expect(routes[2].toAddress).toEqual(toAddress)
    expect(routes[2].fromBalance).toEqual(CAKEBalanceBN.toString())
    expect(routes[2].transaction.value).toEqual('0')
    expect(routes[2].toContract.signature).toEqual('claim(address,uint256,bool)')
    expect(routes[2].toContract.params[0]).toEqual('40000000000000000000')
    expect(routes[2].toContract.params[1]).toEqual('true')
    expect(routes[2].transaction.api).toEqual(routers[blockchain].api)
    expect(routes[2].transaction.blockchain).toEqual(blockchain)
    expect(routes[2].transaction.to).toEqual(routers[blockchain].address)
    expect(routes[2].transaction.method).toEqual('route')
    expect(routes[2].transaction.params.addresses).toEqual([fromAddress, toAddress])
    expect(routes[2].transaction.params.amounts[0]).toEqual(CAKEAmountInBN.toString())
    expect(routes[2].transaction.params.amounts[1]).toEqual('20000000000000000000')
    expect(routes[2].transaction.params.amounts[3]).toEqual('0')
    expect(routes[2].transaction.params.amounts[4]).toEqual('0')
    expect(routes[2].transaction.params.amounts[5]).toEqual('40000000000000000000')
    expect(routes[2].transaction.params.path).toEqual([CAKE, WBNB, BUSD])
    expect(routes[2].transaction.params.plugins[0]).toEqual(plugins[blockchain].pancakeswap.address)
    expect(routes[2].transaction.params.plugins[1]).toEqual(plugins[blockchain].contractCall.approveAndCallContractAddressPassedAmountBoolean.address)
    expect(routes[2].transaction.params.data).toEqual(['claim(address,uint256,bool)', 'true'])
    expect(routes[2].approvalRequired).toEqual(false)
  })
})
