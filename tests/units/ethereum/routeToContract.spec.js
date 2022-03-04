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

describe('route to contract as payment receiver', ()=> {

  const blockchain = 'ethereum'
  const accounts = ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045']
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

    mockAllowance({ provider: provider(blockchain), blockchain, api: Token[blockchain].ERC20, token: DAI, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })
    mockAllowance({ provider: provider(blockchain), blockchain, api: Token[blockchain].ERC20, token: DEPAY, account: fromAddress, spender: routers[blockchain].address, allowance: 0 })

    mock({ provider: provider(blockchain), blockchain, balance: { for: fromAddress, return: etherBalanceBN } })
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

    // DEPAY (direct transfer into smart contract goes through depay router none the less, to ensure approval!)
    expect(routes[0].blockchain).toEqual(blockchain)
    expect(routes[0].fromToken.address).toEqual(DEPAY)
    expect(routes[0].toToken.address).toEqual(DEPAY)
    expect(routes[0].toAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[0].fromAddress).toEqual(fromAddress)
    expect(routes[0].toAddress).toEqual(toAddress)
    expect(routes[0].toContract.signature).toEqual('claim(address,uint256,bool)')
    expect(routes[0].toContract.params[0]).toEqual('true')
    expect(routes[0].fromBalance).toEqual(DEPAYBalanceBN.toString())
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
    expect(routes[0].transaction.params.path).toEqual([DEPAY])
    expect(routes[0].transaction.params.plugins).toEqual([plugins[blockchain].contractCall.approveAndCallContractAddressAmountBoolean.address])
    expect(routes[0].transaction.params.data).toEqual(['claim(address,uint256,bool)', 'true'])
    expect(routes[0].approvalRequired).toEqual(true)

    // ETH/WETH
    expect(routes[1].blockchain).toEqual(blockchain)
    expect(routes[1].fromToken.address).toEqual(ETH)
    expect(routes[1].toToken.address).toEqual(DEPAY)
    expect(routes[1].toAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[1].fromAmount).toEqual(WETHAmountInBN.toString())
    expect(routes[1].fromAddress).toEqual(fromAddress)
    expect(routes[1].toAddress).toEqual(toAddress)
    expect(routes[1].fromBalance).toEqual(etherBalanceBN.toString())
    expect(routes[1].toContract.signature).toEqual('claim(address,uint256,bool)')
    expect(routes[1].toContract.params[0]).toEqual('true')
    expect(routes[1].transaction.api).toEqual(routers[blockchain].api)
    expect(routes[1].transaction.blockchain).toEqual(blockchain)
    expect(routes[1].transaction.to).toEqual(routers[blockchain].address)
    expect(routes[1].transaction.method).toEqual('route')
    expect(routes[1].transaction.value).toEqual(WETHAmountInBN.toString())
    expect(routes[1].transaction.params.addresses).toEqual([fromAddress, toAddress])
    expect(routes[1].transaction.params.amounts[0]).toEqual(WETHAmountInBN.toString())
    expect(routes[1].transaction.params.amounts[1]).toEqual('20000000000000000000')
    expect(routes[1].transaction.params.path).toEqual([ETH, DEPAY])
    expect(routes[1].transaction.params.plugins[0]).toEqual(plugins[blockchain].uniswap_v2.address)
    expect(routes[1].transaction.params.plugins[1]).toEqual(plugins[blockchain].contractCall.approveAndCallContractAddressAmountBoolean.address)
    expect(routes[1].transaction.params.data).toEqual(['claim(address,uint256,bool)', 'true'])
    expect(routes[1].approvalRequired).toEqual(false)

    // DAI
    expect(routes[2].blockchain).toEqual(blockchain)
    expect(routes[2].fromToken.address).toEqual(DAI)
    expect(routes[2].toToken.address).toEqual(DEPAY)
    expect(routes[2].toAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[2].fromAmount).toEqual(DAIAmountInBN.toString())
    expect(routes[2].fromAddress).toEqual(fromAddress)
    expect(routes[2].toAddress).toEqual(toAddress)
    expect(routes[2].fromBalance).toEqual(DAIBalanceBN.toString())
    expect(routes[2].transaction.value).toEqual('0')
    expect(routes[2].toContract.signature).toEqual('claim(address,uint256,bool)')
    expect(routes[2].toContract.params[0]).toEqual('true')
    expect(routes[2].transaction.api).toEqual(routers[blockchain].api)
    expect(routes[2].transaction.blockchain).toEqual(blockchain)
    expect(routes[2].transaction.to).toEqual(routers[blockchain].address)
    expect(routes[2].transaction.method).toEqual('route')
    expect(routes[2].transaction.params.addresses).toEqual([fromAddress, toAddress])
    expect(routes[2].transaction.params.amounts[0]).toEqual(DAIAmountInBN.toString())
    expect(routes[2].transaction.params.amounts[1]).toEqual('20000000000000000000')
    expect(routes[2].transaction.params.path).toEqual([DAI, WETH, DEPAY])
    expect(routes[2].transaction.params.plugins[0]).toEqual(plugins[blockchain].uniswap_v2.address)
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

    // DEPAY (direct transfer into smart contract goes through depay router none the less, to ensure approval!)
    expect(routes[0].blockchain).toEqual(blockchain)
    expect(routes[0].fromToken.address).toEqual(DEPAY)
    expect(routes[0].toToken.address).toEqual(DEPAY)
    expect(routes[0].toAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[0].fromAddress).toEqual(fromAddress)
    expect(routes[0].toAddress).toEqual(toAddress)
    expect(routes[0].toContract.signature).toEqual('claim(address,uint256,bool)')
    expect(routes[0].toContract.params[0]).toEqual('40000000000000000000')
    expect(routes[0].toContract.params[1]).toEqual('true')
    expect(routes[0].fromBalance).toEqual(DEPAYBalanceBN.toString())
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
    expect(routes[0].transaction.params.path).toEqual([DEPAY])
    expect(routes[0].transaction.params.plugins).toEqual([plugins[blockchain].contractCall.approveAndCallContractAddressPassedAmountBoolean.address])
    expect(routes[0].transaction.params.data).toEqual(['claim(address,uint256,bool)', 'true'])
    expect(routes[0].approvalRequired).toEqual(true)

    // ETH/WETH
    expect(routes[1].blockchain).toEqual(blockchain)
    expect(routes[1].fromToken.address).toEqual(ETH)
    expect(routes[1].toToken.address).toEqual(DEPAY)
    expect(routes[1].toAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[1].fromAmount).toEqual(WETHAmountInBN.toString())
    expect(routes[1].fromAddress).toEqual(fromAddress)
    expect(routes[1].toAddress).toEqual(toAddress)
    expect(routes[1].fromBalance).toEqual(etherBalanceBN.toString())
    expect(routes[1].toContract.signature).toEqual('claim(address,uint256,bool)')
    expect(routes[1].toContract.params[0]).toEqual('40000000000000000000')
    expect(routes[1].toContract.params[1]).toEqual('true')
    expect(routes[1].transaction.api).toEqual(routers[blockchain].api)
    expect(routes[1].transaction.blockchain).toEqual(blockchain)
    expect(routes[1].transaction.to).toEqual(routers[blockchain].address)
    expect(routes[1].transaction.method).toEqual('route')
    expect(routes[1].transaction.value).toEqual(WETHAmountInBN.toString())
    expect(routes[1].transaction.params.addresses).toEqual([fromAddress, toAddress])
    expect(routes[1].transaction.params.amounts[0]).toEqual(WETHAmountInBN.toString())
    expect(routes[1].transaction.params.amounts[1]).toEqual('20000000000000000000')
    expect(routes[1].transaction.params.amounts[3]).toEqual('0')
    expect(routes[1].transaction.params.amounts[4]).toEqual('0')
    expect(routes[1].transaction.params.amounts[5]).toEqual('40000000000000000000')
    expect(routes[1].transaction.params.path).toEqual([ETH, DEPAY])
    expect(routes[1].transaction.params.plugins[0]).toEqual(plugins[blockchain].uniswap_v2.address)
    expect(routes[1].transaction.params.plugins[1]).toEqual(plugins[blockchain].contractCall.approveAndCallContractAddressPassedAmountBoolean.address)
    expect(routes[1].transaction.params.data).toEqual(['claim(address,uint256,bool)', 'true'])
    expect(routes[1].approvalRequired).toEqual(false)

    // DAI
    expect(routes[2].blockchain).toEqual(blockchain)
    expect(routes[2].fromToken.address).toEqual(DAI)
    expect(routes[2].toToken.address).toEqual(DEPAY)
    expect(routes[2].toAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[2].fromAmount).toEqual(DAIAmountInBN.toString())
    expect(routes[2].fromAddress).toEqual(fromAddress)
    expect(routes[2].toAddress).toEqual(toAddress)
    expect(routes[2].fromBalance).toEqual(DAIBalanceBN.toString())
    expect(routes[2].transaction.value).toEqual('0')
    expect(routes[2].toContract.signature).toEqual('claim(address,uint256,bool)')
    expect(routes[2].toContract.params[0]).toEqual('40000000000000000000')
    expect(routes[2].toContract.params[1]).toEqual('true')
    expect(routes[2].transaction.api).toEqual(routers[blockchain].api)
    expect(routes[2].transaction.blockchain).toEqual(blockchain)
    expect(routes[2].transaction.to).toEqual(routers[blockchain].address)
    expect(routes[2].transaction.method).toEqual('route')
    expect(routes[2].transaction.params.addresses).toEqual([fromAddress, toAddress])
    expect(routes[2].transaction.params.amounts[0]).toEqual(DAIAmountInBN.toString())
    expect(routes[2].transaction.params.amounts[1]).toEqual('20000000000000000000')
    expect(routes[2].transaction.params.amounts[3]).toEqual('0')
    expect(routes[2].transaction.params.amounts[4]).toEqual('0')
    expect(routes[2].transaction.params.amounts[5]).toEqual('40000000000000000000')
    expect(routes[2].transaction.params.path).toEqual([DAI, WETH, DEPAY])
    expect(routes[2].transaction.params.plugins[0]).toEqual(plugins[blockchain].uniswap_v2.address)
    expect(routes[2].transaction.params.plugins[1]).toEqual(plugins[blockchain].contractCall.approveAndCallContractAddressPassedAmountBoolean.address)
    expect(routes[2].transaction.params.data).toEqual(['claim(address,uint256,bool)', 'true'])
    expect(routes[2].approvalRequired).toEqual(false)
  })
})
