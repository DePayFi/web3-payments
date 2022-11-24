import fetchMock from 'fetch-mock'
import plugins from 'src/plugins'
import routers from 'src/routers'
import { Blockchain } from '@depay/web3-blockchains'
import { CONSTANTS } from '@depay/web3-constants'
import { ethers } from 'ethers'
import { mock, connect, resetMocks, mockJsonRpcProvider } from '@depay/web3-mock'
import { mockAssets } from 'tests/mocks/api'
import { mockBasics, mockDecimals, mockBalance, mockAllowance } from 'tests/mocks/tokens'
import { mockPair as mockPancakeSwapPair, mockAmounts as mockPancakeSwapAmounts } from 'tests/mocks/Pancakeswap'
import { mockPair as mockUniswapPair, mockAmounts as mockUniswapAmounts } from 'tests/mocks/UniswapV2'
import { resetCache, getProvider } from '@depay/web3-client-evm'
import { route } from 'src/index.evm'
import { Token } from '@depay/web3-tokens-evm'

describe('update', ()=> {

  let provider
  const blockchain = 'ethereum'
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']
  
  beforeEach(()=>{
    fetchMock.reset()
    resetMocks()
    resetCache()
    mock({ blockchain, accounts: { return: accounts } })
  })

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
  let WBNB_USDT_bsc_amountInBN = ethers.BigNumber.from(WBNB_USDT_bsc_amountIn)
  let WBNB_USDT_bsc_amountSlippageInBN = ethers.BigNumber.from('212917584984831')
  let WBNB_DAI_bsc_amountIn = '42637725883740112'
  let BUSD_bsc_amountIn = '20103018081713941531'
  let BUSD_bsc_amountInBN = ethers.BigNumber.from(BUSD_bsc_amountIn)
  let BUSD_bsc_amountSlippageInBN = ethers.BigNumber.from('100515090408569707')
  let ETH_balance = ethers.utils.parseUnits('2', 18)
  let BNB_balance = ethers.utils.parseUnits('13', 18)
  let BUSD_balance = ethers.utils.parseUnits('210', 18)
  let DAI_ethereum_balance = ethers.utils.parseUnits('300', 18)
  let WETH_USDT_ethereum_amountIn = '5867269117675793'
  let WETH_DAI_ethereum_amountIn = '5850357640672031'
  let WETH_DAI_ethereum_amountInBN = ethers.BigNumber.from(WETH_DAI_ethereum_amountIn)
  let WETH_DAI_ethereum_amountSlippageInBN = ethers.BigNumber.from('29251788203360')
  let DAI_ethereum_amountIn = '20163901534128454768'
  let DEPAY = "0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb"

  it('updates payment routes with intermediate results', async ()=>{

    mock('ethereum')

    mockAssets({ blockchain: 'ethereum', delay: 1000, account: fromAddress, assets: [
      {
        "name": "Ether",
        "symbol": "ETH",
        "address": CONSTANTS.ethereum.NATIVE,
        "type": "NATIVE"
      }, {
        "name": "Dai Stablecoin",
        "symbol": "DAI",
        "address": DAI_ethereum,
        "type": "20"
      }, {
        "name": "DePay",
        "symbol": "DEPAY",
        "address": DEPAY,
        "type": "20",
        "decimals": 18
      }
    ]})

    provider = await getProvider('ethereum')
    Blockchain.findByName('ethereum').tokens.forEach((token)=>{
      if(token.type == '20') {
        mock({ request: { return: '0', to: token.address, api: Token['ethereum'].DEFAULT, method: 'balanceOf', params: accounts[0] }, provider, blockchain: 'ethereum' })
      }
    })

    mockDecimals({ provider, blockchain: 'ethereum', api: Token.ethereum.ERC20, token: USDT_ethereum, decimals: 6 })
    mockDecimals({ provider, blockchain: 'ethereum', api: Token.ethereum.ERC20, token: DEPAY, decimals: 18 })
    mockDecimals({ provider, blockchain: 'ethereum', api: Token.ethereum.ERC20, token: DAI_ethereum, decimals: 18 })
    mockUniswapPair(provider, '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852', [WETH, USDT_ethereum])
    mockUniswapPair(provider, '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852', [USDT_ethereum, WETH])
    mockUniswapPair(provider, '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11', [WETH, DAI_ethereum])
    mockUniswapPair(provider, '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11', [DAI_ethereum, WETH])
    mockUniswapPair(provider, '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', [DEPAY, WETH])
    mockUniswapPair(provider, '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', [WETH, DEPAY])
    mockUniswapPair(provider, CONSTANTS.ethereum.ZERO, [DEPAY, DAI_ethereum])
    mockUniswapPair(provider, CONSTANTS.ethereum.ZERO, [DAI_ethereum, DEPAY])
    mockUniswapPair(provider, CONSTANTS.ethereum.ZERO, [DEPAY, USDT_ethereum])
    mockUniswapPair(provider, CONSTANTS.ethereum.ZERO, [DAI_ethereum, USDT_ethereum])
    mock({ provider, blockchain: 'ethereum', balance: { for: fromAddress, return: ETH_balance } })
    mockBalance({ provider, blockchain: 'ethereum', api: Token.ethereum.ERC20, token: DAI_ethereum, account: fromAddress, balance: DAI_ethereum_balance })
    mockBalance({ provider, blockchain: 'ethereum', api: Token.ethereum.ERC20, token: DEPAY, account: fromAddress, balance: '2000000000000000000000' })
    mockUniswapAmounts({ provider, method: 'getAmountsIn', params: [USDT_ethereum_amount, [WETH, USDT_ethereum]], amounts: [WETH_USDT_ethereum_amountIn, USDT_ethereum_amount] })
    mockUniswapAmounts({ provider, method: 'getAmountsIn', params: [DAI_ethereum_amount, [WETH, DAI_ethereum]], amounts: [WETH_DAI_ethereum_amountIn, DAI_ethereum_amount] })
    mockUniswapAmounts({ provider, method: 'getAmountsIn', params: [USDT_ethereum_amount, [DAI_ethereum, WETH, USDT_ethereum]], amounts: [DAI_ethereum_amountIn, WETH_DAI_ethereum_amountIn, USDT_ethereum_amount] })
    mockUniswapAmounts({ provider, method: 'getAmountsIn', params: ['20000000000000000000', [DEPAY, WETH, USDT_ethereum]], amounts: ['20000000000000000000', WETH_DAI_ethereum_amountIn, USDT_ethereum_amount] })
    mockUniswapAmounts({ provider, method: 'getAmountsIn', params: ['20000000000000000000', [DEPAY, WETH, DAI_ethereum]], amounts: ['20000000000000000000', WETH_DAI_ethereum_amountIn, DAI_ethereum_amount] })
    mockUniswapAmounts({ provider, method: 'getAmountsIn', params: ['20000000', [DEPAY, WETH, USDT_ethereum]], amounts: ['20000000', WETH_DAI_ethereum_amountIn, USDT_ethereum_amount] })
    mockAllowance({ provider, blockchain: 'ethereum', api: Token.ethereum.ERC20, token: DAI_ethereum, account: fromAddress, spender: routers.ethereum.address, allowance: CONSTANTS.ethereum.MAXINT })
    mockAllowance({ provider, blockchain: 'ethereum', api: Token.ethereum.ERC20, token: DEPAY, account: fromAddress, spender: routers.ethereum.address, allowance: CONSTANTS.ethereum.MAXINT })

    mockBasics({ provider, blockchain: 'ethereum', api: Token['ethereum'].DEFAULT, token: USDT_ethereum, decimals: 6, name: 'USDT', symbol: 'USDT' })
    mockBasics({ provider, blockchain: 'ethereum', api: Token['ethereum'].DEFAULT, token: DAI_ethereum, decimals: 18, name: 'DAI', symbol: 'DAI' })

    provider = await getProvider('bsc')
    mockAssets({ provider, blockchain: 'bsc', account: fromAddress, assets: [
      {
        "name": "Binance Coin",
        "symbol": "BNB",
        "address": CONSTANTS.bsc.NATIVE,
        "type": "NATIVE"
      }, {
        "name": "BUSD",
        "symbol": "BUSD",
        "address": BUSD,
        "type": "20"
      }
    ]})

    Blockchain.findByName('bsc').tokens.forEach((token)=>{
      if(token.type == '20') {
        mock({ request: { return: '0', to: token.address, api: Token['bsc'].DEFAULT, method: 'balanceOf', params: accounts[0] }, provider, blockchain: 'bsc' })
      }
    })

    mockDecimals({ provider, blockchain: 'bsc', api: Token.bsc.BEP20, token: USDT_bsc, decimals: 18 })
    mockDecimals({ provider, blockchain: 'bsc', api: Token.bsc.BEP20, token: DAI_bsc, decimals: 18 })
    mockDecimals({ provider, blockchain: 'bsc', api: Token.bsc.BEP20, token: BUSD, decimals: 18 })
    mockPancakeSwapPair(provider, '0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE', [WBNB, USDT_bsc])
    mockPancakeSwapPair(provider, '0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE', [USDT_bsc, WBNB])
    mockPancakeSwapPair(provider, '0xc7c3cCCE4FA25700fD5574DA7E200ae28BBd36A3', [WBNB, DAI_bsc])
    mockPancakeSwapPair(provider, '0xc7c3cCCE4FA25700fD5574DA7E200ae28BBd36A3', [DAI_bsc, WBNB])
    mockPancakeSwapPair(provider, CONSTANTS.bsc.ZERO, [BUSD, USDT_bsc])
    mockPancakeSwapPair(provider, CONSTANTS.bsc.ZERO, [BUSD, DAI_bsc])
    mockPancakeSwapPair(provider, '0x66FDB2eCCfB58cF098eaa419e5EfDe841368e489', [BUSD, WBNB])
    mockPancakeSwapAmounts({ provider, method: 'getAmountsIn', params: [USDT_bsc_amount ,[WBNB, USDT_bsc]], amounts: [WBNB_USDT_bsc_amountIn, USDT_bsc_amount] })
    mockPancakeSwapAmounts({ provider, method: 'getAmountsIn', params: [DAI_bsc_amount ,[WBNB, DAI_bsc]], amounts: [WBNB_DAI_bsc_amountIn, DAI_bsc_amount] })
    mockPancakeSwapAmounts({ provider, method: 'getAmountsIn', params: [USDT_bsc_amount ,[BUSD, WBNB, USDT_bsc]], amounts: [BUSD_bsc_amountIn, WBNB_USDT_bsc_amountIn, USDT_bsc_amount] })
    mockPancakeSwapAmounts({ provider, method: 'getAmountsIn', params: [DAI_bsc_amount ,[BUSD, WBNB, DAI_bsc]], amounts: [BUSD_bsc_amountIn, WBNB_DAI_bsc_amountIn, DAI_bsc_amount] })
    mock({ provider, blockchain: 'bsc', balance: { for: fromAddress, return: BNB_balance } })
    mockBalance({ provider, blockchain: 'bsc', api: Token.bsc.BEP20, token: BUSD, account: fromAddress, balance: BUSD_balance })
    mockAllowance({ provider, blockchain: 'bsc', api: Token.bsc.BEP20, token: BUSD, account: fromAddress, spender: routers.bsc.address, allowance: CONSTANTS.bsc.MAXINT })
    mockBalance({ provider, blockchain: 'bsc', api: Token.bsc.BEP20, token: DAI_bsc, account: fromAddress, balance: '0' })

    mockBasics({ provider, blockchain: 'bsc', api: Token['bsc'].DEFAULT, token: USDT_bsc, decimals: 18, name: 'USDT', symbol: 'USDT' })
    mockBasics({ provider, blockchain: 'bsc', api: Token['bsc'].DEFAULT, token: DAI_bsc, decimals: 18, name: 'DAI', symbol: 'DAI' })

    connect('ethereum')

    let currentRoutes

    route({
      accept: [
        { amount, blockchain: 'ethereum', token: USDT_ethereum, fromAddress, toAddress },
        { amount, blockchain: 'ethereum', token: DAI_ethereum, fromAddress, toAddress },
        { amount, blockchain: 'bsc', token: USDT_bsc, fromAddress, toAddress },
        { amount, blockchain: 'bsc', token: DAI_bsc, fromAddress, toAddress }
      ],
      from: { ethereum: fromAddress, bsc: fromAddress },
      update: {
        every: 200,
        callback: (routes)=>{
          currentRoutes = routes
        }
      }
    })

    await new Promise((r) => setTimeout(r, 300))

    expect(currentRoutes.length).toEqual(4)

    expect(currentRoutes[0].blockchain).toEqual('bsc')
    expect(currentRoutes[0].fromToken.address).toEqual(CONSTANTS.bsc.NATIVE)
    expect(currentRoutes[0].fromBalance).toEqual(BNB_balance.toString())
    expect(currentRoutes[0].toToken.address).toEqual(USDT_bsc)
    expect(currentRoutes[0].toAmount).toEqual(USDT_bsc_amount.toString())
    expect(currentRoutes[0].transaction.blockchain).toEqual('bsc')
    expect(currentRoutes[0].transaction.to).toEqual(routers.bsc.address)
    expect(currentRoutes[0].transaction.method).toEqual('route')
    expect(currentRoutes[0].transaction.params.path).toEqual([CONSTANTS.bsc.NATIVE, USDT_bsc])
    expect(currentRoutes[0].transaction.params.amounts[0]).toEqual(WBNB_USDT_bsc_amountInBN.add(WBNB_USDT_bsc_amountSlippageInBN).toString())
    expect(currentRoutes[0].transaction.params.amounts[1]).toEqual(USDT_bsc_amount.toString())
    expect(currentRoutes[0].transaction.params.addresses[0]).toEqual(fromAddress)
    expect(currentRoutes[0].transaction.params.addresses[1]).toEqual(toAddress)
    expect(currentRoutes[0].transaction.params.plugins[0]).toEqual(plugins.bsc.pancakeswap.address)
    expect(currentRoutes[0].transaction.params.plugins[1]).toEqual(plugins.bsc.payment.address)
    expect(currentRoutes[0].approvalRequired).toEqual(false)
    expect(currentRoutes[0].approvalTransaction).toEqual(undefined)
    expect(currentRoutes[0].directTransfer).toEqual(false)
    expect(currentRoutes[0].fromAmount).toEqual(WBNB_USDT_bsc_amountInBN.add(WBNB_USDT_bsc_amountSlippageInBN).toString())
    expect(currentRoutes[0].toDecimals).toEqual(18)
    expect(currentRoutes[0].fromDecimals).toEqual(18)

    expect(currentRoutes[1].blockchain).toEqual('bsc')
    expect(currentRoutes[1].fromToken.address).toEqual(BUSD)
    expect(currentRoutes[1].fromBalance).toEqual(BUSD_balance.toString())
    expect(currentRoutes[1].toToken.address).toEqual(USDT_bsc)
    expect(currentRoutes[1].toAmount).toEqual(USDT_bsc_amount.toString())
    expect(currentRoutes[1].transaction.blockchain).toEqual('bsc')
    expect(currentRoutes[1].transaction.to).toEqual(routers.bsc.address)
    expect(currentRoutes[1].transaction.method).toEqual('route')
    expect(currentRoutes[1].transaction.params.path).toEqual([BUSD, WBNB, USDT_bsc])
    expect(currentRoutes[1].transaction.params.amounts[0]).toEqual(BUSD_bsc_amountInBN.add(BUSD_bsc_amountSlippageInBN).toString())
    expect(currentRoutes[1].transaction.params.amounts[1]).toEqual(USDT_bsc_amount.toString())
    expect(currentRoutes[1].transaction.params.addresses[0]).toEqual(fromAddress)
    expect(currentRoutes[1].transaction.params.addresses[1]).toEqual(toAddress)
    expect(currentRoutes[1].transaction.params.plugins[0]).toEqual(plugins.bsc.pancakeswap.address)
    expect(currentRoutes[1].transaction.params.plugins[1]).toEqual(plugins.bsc.payment.address)
    expect(currentRoutes[1].approvalRequired).toEqual(false)
    expect(currentRoutes[1].approvalTransaction).toEqual(undefined)
    expect(currentRoutes[1].directTransfer).toEqual(false)
    expect(currentRoutes[1].fromAmount).toEqual(BUSD_bsc_amountInBN.add(BUSD_bsc_amountSlippageInBN).toString())
    expect(currentRoutes[1].toDecimals).toEqual(18)
    expect(currentRoutes[1].fromDecimals).toEqual(18)

    expect(currentRoutes[2].blockchain).toEqual('ethereum')
    expect(currentRoutes[2].fromToken.address).toEqual(DAI_ethereum)
    expect(currentRoutes[2].fromBalance).toEqual(DAI_ethereum_balance.toString())
    expect(currentRoutes[2].toToken.address).toEqual(DAI_ethereum)
    expect(currentRoutes[2].toAmount).toEqual(USDT_bsc_amount.toString())
    expect(currentRoutes[2].transaction.blockchain).toEqual('ethereum')
    expect(currentRoutes[2].transaction.to).toEqual(DAI_ethereum)
    expect(currentRoutes[2].transaction.method).toEqual('transfer')
    expect(currentRoutes[2].transaction.params).toEqual([toAddress, DAI_ethereum_amount.toString()])
    expect(currentRoutes[2].transaction.value).toEqual('0')
    expect(currentRoutes[2].approvalRequired).toEqual(false)
    expect(currentRoutes[2].approvalTransaction).toEqual(undefined)
    expect(currentRoutes[2].directTransfer).toEqual(true)
    expect(currentRoutes[2].fromAmount).toEqual(DAI_ethereum_amount.toString())
    expect(currentRoutes[2].toDecimals).toEqual(18)
    expect(currentRoutes[2].fromDecimals).toEqual(18)

    expect(currentRoutes[3].blockchain).toEqual('ethereum')
    expect(currentRoutes[3].fromToken.address).toEqual(CONSTANTS.ethereum.NATIVE)
    expect(currentRoutes[3].fromBalance).toEqual(ETH_balance.toString())
    expect(currentRoutes[3].toToken.address).toEqual(DAI_ethereum)
    expect(currentRoutes[3].toAmount).toEqual(DAI_ethereum_amount.toString())
    expect(currentRoutes[3].transaction.blockchain).toEqual('ethereum')
    expect(currentRoutes[3].transaction.to).toEqual(routers.ethereum.address)
    expect(currentRoutes[3].transaction.method).toEqual('route')
    expect(currentRoutes[3].transaction.params.path).toEqual([CONSTANTS.ethereum.NATIVE, DAI_ethereum])
    expect(currentRoutes[3].transaction.params.amounts[0]).toEqual(WETH_DAI_ethereum_amountInBN.add(WETH_DAI_ethereum_amountSlippageInBN).toString())
    expect(currentRoutes[3].transaction.params.amounts[1]).toEqual(DAI_ethereum_amount.toString())
    expect(currentRoutes[3].transaction.params.addresses[0]).toEqual(fromAddress)
    expect(currentRoutes[3].transaction.params.addresses[1]).toEqual(toAddress)
    expect(currentRoutes[3].transaction.params.plugins[0]).toEqual(plugins.ethereum.uniswap_v2.address)
    expect(currentRoutes[3].transaction.params.plugins[1]).toEqual(plugins.ethereum.payment.address)
    expect(currentRoutes[3].approvalRequired).toEqual(false)
    expect(currentRoutes[3].approvalTransaction).toEqual(undefined)
    expect(currentRoutes[3].directTransfer).toEqual(false)
    expect(currentRoutes[3].fromAmount).toEqual(WETH_DAI_ethereum_amountInBN.add(WETH_DAI_ethereum_amountSlippageInBN).toString())
    expect(currentRoutes[3].toDecimals).toEqual(18)
    expect(currentRoutes[3].fromDecimals).toEqual(18)

    await new Promise((r) => setTimeout(r, 1500))

    expect(currentRoutes.length).toEqual(5)

    expect(currentRoutes[4].blockchain).toEqual('ethereum')
    expect(currentRoutes[4].fromToken.address).toEqual(DEPAY)
    expect(currentRoutes[4].fromBalance).toEqual('2000000000000000000000')
    expect(currentRoutes[4].toToken.address).toEqual(USDT_ethereum)
    expect(currentRoutes[4].toAmount).toEqual(USDT_ethereum_amount.toString())
    expect(currentRoutes[4].transaction.blockchain).toEqual('ethereum')
    expect(currentRoutes[4].transaction.to).toEqual(routers.ethereum.address)
    expect(currentRoutes[4].transaction.method).toEqual('route')
    expect(currentRoutes[4].transaction.params.path).toEqual([DEPAY, WETH, USDT_ethereum])
    expect(currentRoutes[4].transaction.params.amounts[0]).toEqual('20100000')
    expect(currentRoutes[4].transaction.params.amounts[1]).toEqual('20000000')
    expect(currentRoutes[4].transaction.params.addresses[0]).toEqual(fromAddress)
    expect(currentRoutes[4].transaction.params.addresses[1]).toEqual(toAddress)
    expect(currentRoutes[4].transaction.params.plugins[0]).toEqual(plugins.ethereum.uniswap_v2.address)
    expect(currentRoutes[4].transaction.params.plugins[1]).toEqual(plugins.ethereum.payment.address)
    expect(currentRoutes[4].approvalRequired).toEqual(false)
    expect(currentRoutes[4].approvalTransaction).toEqual(undefined)
    expect(currentRoutes[4].directTransfer).toEqual(false)
    expect(currentRoutes[4].fromAmount).toEqual('20100000')
    expect(currentRoutes[4].toDecimals).toEqual(6)
    expect(currentRoutes[4].fromDecimals).toEqual(18)

  })
})
