import plugins from 'src/plugins'
import routers from 'src/routers'
import { CONSTANTS } from '@depay/web3-constants'
import { ethers } from 'ethers'
import { mock, connect, resetMocks, mockJsonRpcProvider } from '@depay/web3-mock'
import { mockDecimals, mockBalance, mockAllowance } from 'tests/mocks/tokens'
import { mockPair as mockPancakeSwapPair, mockAmounts as mockPancakeSwapAmounts } from 'tests/mocks/Pancakeswap'
import { mockPair as mockUniswapPair, mockAmounts as mockUniswapAmounts } from 'tests/mocks/UniswapV2'
import { resetCache, provider } from '@depay/web3-client'
import { route } from 'src'
import { Token } from '@depay/web3-tokens'

describe('route', ()=> {

  const blockchain = 'ethereum'
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']
  beforeEach(resetMocks)
  beforeEach(()=>mock({ blockchain, accounts: { return: accounts } }))
  beforeEach(resetCache)

  let fromAddress = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
  let toAddress = '0x65aBbdEd9B937E38480A50eca85A8E4D2c8350E4'
  let USDT_ethereum = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  let USDT_bsc = '0x55d398326f99059fF775485246999027B3197955'
  let DAI_ethereum = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
  let DAI_bsc = '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3'
  let BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"
  let WBNB = CONSTANTS.bsc.WRAPPED
  let WETH = CONSTANTS.ethereum.WRAPPED
  let amount = 20
  let USDT_ethereum_amount = ethers.utils.parseUnits(amount.toString(), 6)
  let DAI_ethereum_amount = ethers.utils.parseUnits(amount.toString(), 18)
  let USDT_bsc_amount = ethers.utils.parseUnits(amount.toString(), 18)
  let DAI_bsc_amount = ethers.utils.parseUnits(amount.toString(), 18)
  let WBNB_USDT_bsc_amountIn = '42583516996966217'
  let WBNB_DAI_bsc_amountIn = '42637725883740112'
  let BUSD_bsc_amountIn = '20103018081713941531'
  let ETH_balance = ethers.utils.parseUnits('2', 18)
  let BNB_balance = ethers.utils.parseUnits('13', 18)
  let BUSD_balance = ethers.utils.parseUnits('210', 18)
  let DAI_ethereum_balance = ethers.utils.parseUnits('300', 18)
  let WETH_USDT_ethereum_amountIn = '5867269117675793'
  let WETH_DAI_ethereum_amountIn = '5850357640672031'
  let DAI_ethereum_amountIn = '20163901534128454768'

  it('whitelists accepted fromTokens and only calculates routes for those', async ()=>{

    mock('ethereum')

    mockDecimals({ provider: provider('ethereum'), blockchain: 'ethereum', api: Token.ethereum.ERC20, token: USDT_ethereum, decimals: 6 })
    mockDecimals({ provider: provider('ethereum'), blockchain: 'ethereum', api: Token.ethereum.ERC20, token: DAI_ethereum, decimals: 18 })
    mockUniswapPair(provider('ethereum'), '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852', [WETH, USDT_ethereum])
    mockUniswapPair(provider('ethereum'), '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852', [USDT_ethereum, WETH])
    mockUniswapPair(provider('ethereum'), '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11', [WETH, DAI_ethereum])
    mockUniswapPair(provider('ethereum'), '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11', [DAI_ethereum, WETH])
    mockUniswapPair(provider('ethereum'), CONSTANTS.ethereum.ZERO, [DAI_ethereum, USDT_ethereum])
    mock({ provider: provider('ethereum'), blockchain: 'ethereum', balance: { for: fromAddress, return: ETH_balance } })
    mockBalance({ provider: provider('ethereum'), blockchain: 'ethereum', api: Token.ethereum.ERC20, token: DAI_ethereum, account: fromAddress, balance: DAI_ethereum_balance })
    mockUniswapAmounts({ provider: provider('ethereum'), method: 'getAmountsIn', params: [USDT_ethereum_amount, [WETH, USDT_ethereum]], amounts: [WETH_USDT_ethereum_amountIn, USDT_ethereum_amount] })
    mockUniswapAmounts({ provider: provider('ethereum'), method: 'getAmountsIn', params: [DAI_ethereum_amount, [WETH, DAI_ethereum]], amounts: [WETH_DAI_ethereum_amountIn, DAI_ethereum_amount] })
    mockUniswapAmounts({ provider: provider('ethereum'), method: 'getAmountsIn', params: [USDT_ethereum_amount, [DAI_ethereum, WETH, USDT_ethereum]], amounts: [DAI_ethereum_amountIn, WETH_DAI_ethereum_amountIn, USDT_ethereum_amount] })
    mockAllowance({ provider: provider('ethereum'), blockchain: 'ethereum', api: Token.ethereum.ERC20, token: DAI_ethereum, account: fromAddress, spender: routers.ethereum.address, allowance: CONSTANTS.ethereum.MAXINT })

    mockDecimals({ provider: provider('bsc'), blockchain: 'bsc', api: Token.bsc.BEP20, token: USDT_bsc, decimals: 18 })
    mockDecimals({ provider: provider('bsc'), blockchain: 'bsc', api: Token.bsc.BEP20, token: DAI_bsc, decimals: 18 })
    mockDecimals({ provider: provider('bsc'), blockchain: 'bsc', api: Token.bsc.BEP20, token: BUSD, decimals: 18 })
    mockPancakeSwapPair(provider('bsc'), '0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE', [WBNB, USDT_bsc])
    mockPancakeSwapPair(provider('bsc'), '0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE', [USDT_bsc, WBNB])
    mockPancakeSwapPair(provider('bsc'), '0xc7c3cCCE4FA25700fD5574DA7E200ae28BBd36A3', [WBNB, DAI_bsc])
    mockPancakeSwapPair(provider('bsc'), '0xc7c3cCCE4FA25700fD5574DA7E200ae28BBd36A3', [DAI_bsc, WBNB])
    mockPancakeSwapPair(provider('bsc'), CONSTANTS.bsc.ZERO, [BUSD, USDT_bsc])
    mockPancakeSwapPair(provider('bsc'), CONSTANTS.bsc.ZERO, [BUSD, DAI_bsc])
    mockPancakeSwapPair(provider('bsc'), '0x66FDB2eCCfB58cF098eaa419e5EfDe841368e489', [BUSD, WBNB])
    mockPancakeSwapAmounts({ provider: provider('bsc'), method: 'getAmountsIn', params: [USDT_bsc_amount ,[WBNB, USDT_bsc]], amounts: [WBNB_USDT_bsc_amountIn, USDT_bsc_amount] })
    mockPancakeSwapAmounts({ provider: provider('bsc'), method: 'getAmountsIn', params: [DAI_bsc_amount ,[WBNB, DAI_bsc]], amounts: [WBNB_DAI_bsc_amountIn, DAI_bsc_amount] })
    mockPancakeSwapAmounts({ provider: provider('bsc'), method: 'getAmountsIn', params: [USDT_bsc_amount ,[BUSD, WBNB, USDT_bsc]], amounts: [BUSD_bsc_amountIn, WBNB_USDT_bsc_amountIn, USDT_bsc_amount] })
    mockPancakeSwapAmounts({ provider: provider('bsc'), method: 'getAmountsIn', params: [DAI_bsc_amount ,[BUSD, WBNB, DAI_bsc]], amounts: [BUSD_bsc_amountIn, WBNB_DAI_bsc_amountIn, DAI_bsc_amount] })
    mock({ provider: provider('bsc'), blockchain: 'bsc', balance: { for: fromAddress, return: BNB_balance } })
    mockBalance({ provider: provider('bsc'), blockchain: 'bsc', api: Token.bsc.BEP20, token: BUSD, account: fromAddress, balance: BUSD_balance })
    mockAllowance({ provider: provider('bsc'), blockchain: 'bsc', api: Token.bsc.BEP20, token: BUSD, account: fromAddress, spender: routers.bsc.address, allowance: CONSTANTS.bsc.MAXINT })

    connect('ethereum')

    let routes = await route({
      accept: [
        { amount, blockchain: 'ethereum', token: USDT_ethereum, fromAddress, toAddress },
        { amount, blockchain: 'ethereum', token: DAI_ethereum, fromAddress, toAddress },
        { amount, blockchain: 'bsc', token: USDT_bsc, fromAddress, toAddress },
        { amount, blockchain: 'bsc', token: DAI_bsc, fromAddress, toAddress }
      ],
      whitelist: {
        ethereum: [
          CONSTANTS.ethereum.NATIVE,
          DAI_ethereum,
        ],
        bsc: [
          CONSTANTS.bsc.NATIVE,
          BUSD
        ]
      }
    })

    expect(routes[0].blockchain).toEqual('bsc')
    expect(routes[0].fromToken.address).toEqual(CONSTANTS.bsc.NATIVE)
    expect(routes[0].fromBalance).toEqual(BNB_balance.toString())
    expect(routes[0].toToken.address).toEqual(USDT_bsc)
    expect(routes[0].toAmount).toEqual(USDT_bsc_amount.toString())
    expect(routes[0].transaction.blockchain).toEqual('bsc')
    expect(routes[0].transaction.to).toEqual(routers.bsc.address)
    expect(routes[0].transaction.method).toEqual('route')
    expect(routes[0].transaction.params.path).toEqual([CONSTANTS.bsc.NATIVE, USDT_bsc])
    expect(routes[0].transaction.params.amounts[0]).toEqual(WBNB_USDT_bsc_amountIn.toString())
    expect(routes[0].transaction.params.amounts[1]).toEqual(USDT_bsc_amount.toString())
    expect(routes[0].transaction.params.addresses[0]).toEqual(fromAddress)
    expect(routes[0].transaction.params.addresses[1]).toEqual(toAddress)
    expect(routes[0].transaction.params.plugins[0]).toEqual(plugins.bsc.pancakeswap.address)
    expect(routes[0].transaction.params.plugins[1]).toEqual(plugins.bsc.payment.address)
    expect(routes[0].approvalRequired).toEqual(false)
    expect(routes[0].approvalTransaction).toEqual(undefined)
    expect(routes[0].directTransfer).toEqual(false)
    expect(routes[0].fromAmount).toEqual(WBNB_USDT_bsc_amountIn.toString())

    expect(routes[1].blockchain).toEqual('bsc')
    expect(routes[1].fromToken.address).toEqual(BUSD)
    expect(routes[1].fromBalance).toEqual(BUSD_balance.toString())
    expect(routes[1].toToken.address).toEqual(USDT_bsc)
    expect(routes[1].toAmount).toEqual(USDT_bsc_amount.toString())
    expect(routes[1].transaction.blockchain).toEqual('bsc')
    expect(routes[1].transaction.to).toEqual(routers.bsc.address)
    expect(routes[1].transaction.method).toEqual('route')
    expect(routes[1].transaction.params.path).toEqual([BUSD, WBNB, USDT_bsc])
    expect(routes[1].transaction.params.amounts[0]).toEqual(BUSD_bsc_amountIn.toString())
    expect(routes[1].transaction.params.amounts[1]).toEqual(USDT_bsc_amount.toString())
    expect(routes[1].transaction.params.addresses[0]).toEqual(fromAddress)
    expect(routes[1].transaction.params.addresses[1]).toEqual(toAddress)
    expect(routes[1].transaction.params.plugins[0]).toEqual(plugins.bsc.pancakeswap.address)
    expect(routes[1].transaction.params.plugins[1]).toEqual(plugins.bsc.payment.address)
    expect(routes[1].approvalRequired).toEqual(false)
    expect(routes[1].approvalTransaction).toEqual(undefined)
    expect(routes[1].directTransfer).toEqual(false)
    expect(routes[1].fromAmount).toEqual(BUSD_bsc_amountIn.toString())

    expect(routes[2].blockchain).toEqual('ethereum')
    expect(routes[2].fromToken.address).toEqual(DAI_ethereum)
    expect(routes[2].fromBalance).toEqual(DAI_ethereum_balance.toString())
    expect(routes[2].toToken.address).toEqual(DAI_ethereum)
    expect(routes[2].toAmount).toEqual(USDT_bsc_amount.toString())
    expect(routes[2].transaction.blockchain).toEqual('ethereum')
    expect(routes[2].transaction.to).toEqual(DAI_ethereum)
    expect(routes[2].transaction.method).toEqual('transfer')
    expect(routes[2].transaction.params).toEqual([toAddress, DAI_ethereum_amount.toString()])
    expect(routes[2].transaction.value).toEqual('0')
    expect(routes[2].approvalRequired).toEqual(false)
    expect(routes[2].approvalTransaction).toEqual(undefined)
    expect(routes[2].directTransfer).toEqual(true)
    expect(routes[2].fromAmount).toEqual(DAI_ethereum_amount.toString())

    expect(routes[3].blockchain).toEqual('ethereum')
    expect(routes[3].fromToken.address).toEqual(CONSTANTS.ethereum.NATIVE)
    expect(routes[3].fromBalance).toEqual(ETH_balance.toString())
    expect(routes[3].toToken.address).toEqual(DAI_ethereum)
    expect(routes[3].toAmount).toEqual(DAI_ethereum_amount.toString())
    expect(routes[3].transaction.blockchain).toEqual('ethereum')
    expect(routes[3].transaction.to).toEqual(routers.ethereum.address)
    expect(routes[3].transaction.method).toEqual('route')
    expect(routes[3].transaction.params.path).toEqual([CONSTANTS.ethereum.NATIVE, DAI_ethereum])
    expect(routes[3].transaction.params.amounts[0]).toEqual(WETH_DAI_ethereum_amountIn.toString())
    expect(routes[3].transaction.params.amounts[1]).toEqual(DAI_ethereum_amount.toString())
    expect(routes[3].transaction.params.addresses[0]).toEqual(fromAddress)
    expect(routes[3].transaction.params.addresses[1]).toEqual(toAddress)
    expect(routes[3].transaction.params.plugins[0]).toEqual(plugins.ethereum.uniswap_v2.address)
    expect(routes[3].transaction.params.plugins[1]).toEqual(plugins.ethereum.payment.address)
    expect(routes[3].approvalRequired).toEqual(false)
    expect(routes[3].approvalTransaction).toEqual(undefined)
    expect(routes[3].directTransfer).toEqual(false)
    expect(routes[3].fromAmount).toEqual(WETH_DAI_ethereum_amountIn.toString())
  })
})
