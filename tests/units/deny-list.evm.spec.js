import Blockchains from '@depay/web3-blockchains'
import fetchMock from 'fetch-mock'
import { ethers } from 'ethers'
import { mock, connect, resetMocks, mockJsonRpcProvider } from '@depay/web3-mock'
import { mockBestRoute, mockAllRoutes } from 'tests/mocks/api'
import { mockBasics, mockDecimals, mockBalance, mockAllowance } from 'tests/mocks/tokens'
import { mockPair, mockAmounts } from 'tests/mocks/UniswapV2'
import { resetCache, getProvider } from '@depay/web3-client-evm'
import { route, plugins, routers } from 'dist/esm/index.evm'
import Token from '@depay/web3-tokens-evm'

describe('deny list (evm)', ()=> {

    let provider
  let accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']
  let fromAddress = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
  let fromAccounts = { ethereum: fromAddress, bsc: fromAddress }
  let toAddress = '0x65aBbdEd9B937E38480A50eca85A8E4D2c8350E4'
  let USDT_ethereum = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
  let USDT_bsc = '0x55d398326f99059fF775485246999027B3197955'
  let DAI_ethereum = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
  let DAI_bsc = '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3'
  let BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"
  let WBNB = Blockchains.bsc.wrapped.address
  let WETH = Blockchains.ethereum.wrapped.address
  let amount = 20
  let USDT_ethereum_amount = ethers.utils.parseUnits(amount.toString(), 6)
  let DAI_ethereum_amount = ethers.utils.parseUnits(amount.toString(), 18)
  let USDT_bsc_amount = ethers.utils.parseUnits(amount.toString(), 18)
  let DAI_bsc_amount = ethers.utils.parseUnits(amount.toString(), 18)
  let WBNB_USDT_bsc_amountIn = '42583516996966217'
  let WBNB_USDT_bsc_amountInSlippage = '212917584984831'
  let WBNB_DAI_bsc_amountIn = '42637725883740112'
  let WBNB_DAI_bsc_amountInSlippage = '42637725883740112'
  let BUSD_bsc_amountIn = '20103018081713941531'
  let ETH_balance = ethers.utils.parseUnits('2', 18)
  let BNB_balance = ethers.utils.parseUnits('13', 18)
  let BUSD_balance = ethers.utils.parseUnits('210', 18)
  let DAI_ethereum_balance = ethers.utils.parseUnits('300', 18)
  let WETH_USDT_ethereum_amountIn = '5867269117675793'
  let WETH_DAI_ethereum_amountIn = '5850357640672031'
  let WETH_DAI_ethereum_amountInSlippage = '29251788203360'
  let DAI_ethereum_amountIn = '20163901534128454768'
  let transaction
  let bestRoute = {
    "blockchain": "bsc",
    "fromToken": Blockchains.bsc.currency.address,
    "fromAmount": ethers.BigNumber.from(WBNB_USDT_bsc_amountIn).add(ethers.BigNumber.from(WBNB_USDT_bsc_amountInSlippage)).toString(),
    "toToken": USDT_bsc,
    "toAmount": USDT_bsc_amount.toString(),
    "fromDecimals": 18,
    "fromName": "BNB",
    "fromSymbol": "BNB",
    "toDecimals": 6,
    "toName": "Tether USD",
    "toSymbol": "USDT",
    "pairsData": [{ "id": "0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE", "exchange": "pancakeswap" }]
  }
  let allRoutes = [
    bestRoute,
    {
      "blockchain": "ethereum",
      "fromToken": Blockchains.ethereum.currency.address,
      "fromAmount": ethers.BigNumber.from(WETH_DAI_ethereum_amountIn).add(ethers.BigNumber.from(WETH_DAI_ethereum_amountInSlippage)).toString(),
      "toToken": DAI_ethereum,
      "toAmount": DAI_ethereum_amount.toString(),
      "fromDecimals": 18,
      "fromName": "Ether",
      "fromSymbol": "ETH",
      "toDecimals": 18,
      "toName": "DAI",
      "toSymbol": "DAI",
      "pairsData": [{ "id": "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11", "exchange": "uniswap_v2" }]
    }
  ]
  const deny = {
    ethereum: [
      DAI_ethereum,
    ],
    bsc: [
      BUSD,
    ]
  }

  const accept = [
    { amount, blockchain: 'ethereum', token: USDT_ethereum, receiver: toAddress },
    { amount, blockchain: 'ethereum', token: DAI_ethereum, receiver: toAddress },
    { amount, blockchain: 'bsc', token: USDT_bsc, receiver: toAddress },
    { amount, blockchain: 'bsc', token: DAI_bsc, receiver: toAddress }
  ]

  beforeEach(resetMocks)
  beforeEach(()=>{
    mock({ blockchain: 'ethereum', accounts: { return: accounts } })
    mock({ blockchain: 'bsc', accounts: { return: accounts } })
  })
  beforeEach(resetCache)
  beforeEach(()=>fetchMock.reset())
  beforeEach(()=>{

    mockBestRoute({ fromAccounts, accept, deny, route: bestRoute })
    mockAllRoutes({ fromAccounts, accept, deny, routes: allRoutes })

  })

  it('denies fromTokens and only calculates routes for all the others', async ()=>{

    mock('ethereum')

    provider = await getProvider('ethereum')
    Blockchains.findByName('ethereum').tokens.forEach((token)=>{
      if(token.type == '20') {
        mock({ request: { return: '0', to: token.address, api: Token['ethereum'].DEFAULT, method: 'balanceOf', params: accounts[0] }, provider, blockchain: 'ethereum' })
      }
    })

    mockBasics({ provider, blockchain: 'ethereum', api: Token['ethereum'].DEFAULT, token: USDT_ethereum, decimals: 6, name: 'USDT', symbol: 'USDT' })
    mockBasics({ provider, blockchain: 'ethereum', api: Token['ethereum'].DEFAULT, token: DAI_ethereum, decimals: 18, name: 'DAI', symbol: 'DAI' })

    mockPair({ blockchain: 'ethereum', provider, pair: '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852', params: [WETH, USDT_ethereum] })
    mockPair({ blockchain: 'ethereum', provider, pair: '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852', params: [USDT_ethereum, WETH] })
    mockPair({ blockchain: 'ethereum', provider, pair: '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11', params: [WETH, DAI_ethereum] })
    mockPair({ blockchain: 'ethereum', provider, pair: '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11', params: [DAI_ethereum, WETH] })
    mockPair({ blockchain: 'ethereum', provider, pair: Blockchains.ethereum.zero, params: [DAI_ethereum, USDT_ethereum] })
    mock({ provider, blockchain: 'ethereum', balance: { for: fromAddress, return: ETH_balance } })
    mockBalance({ provider, blockchain: 'ethereum', api: Token.ethereum.ERC20, token: DAI_ethereum, account: fromAddress, balance: DAI_ethereum_balance })
    mockAmounts({ blockchain: 'ethereum', provider, method: 'getAmountsIn', params: [USDT_ethereum_amount, [WETH, USDT_ethereum]], amounts: [WETH_USDT_ethereum_amountIn, USDT_ethereum_amount] })
    mockAmounts({ blockchain: 'ethereum', provider, method: 'getAmountsIn', params: [DAI_ethereum_amount, [WETH, DAI_ethereum]], amounts: [WETH_DAI_ethereum_amountIn, DAI_ethereum_amount] })
    mockAmounts({ blockchain: 'ethereum', provider, method: 'getAmountsIn', params: [USDT_ethereum_amount, [DAI_ethereum, WETH, USDT_ethereum]], amounts: [DAI_ethereum_amountIn, WETH_DAI_ethereum_amountIn, USDT_ethereum_amount] })
    mockAllowance({ provider, blockchain: 'ethereum', api: Token.ethereum.ERC20, token: DAI_ethereum, account: fromAddress, spender: routers.ethereum.address, allowance: Blockchains.ethereum.currency.address })

    provider = await getProvider('bsc')
    Blockchains.findByName('bsc').tokens.forEach((token)=>{
      if(token.type == '20') {
        mock({ request: { return: '0', to: token.address, api: Token['bsc'].DEFAULT, method: 'balanceOf', params: accounts[0] }, provider, blockchain: 'bsc' })
      }
    })

    mockBasics({ provider, blockchain: 'bsc', api: Token['bsc'].DEFAULT, token: USDT_bsc, decimals: 18, name: 'USDT', symbol: 'USDT' })
    mockBasics({ provider, blockchain: 'bsc', api: Token['bsc'].DEFAULT, token: DAI_bsc, decimals: 18, name: 'USDT', symbol: 'USDT' })
    mock({ request: { return: '0', to: DAI_bsc, api: Token['bsc'].DEFAULT, method: 'balanceOf', params: accounts[0] }, provider, blockchain: 'bsc' })
    mockBasics({ provider, blockchain: 'bsc', api: Token['bsc'].DEFAULT, token: BUSD, decimals: 18, name: 'USDT', symbol: 'USDT' })

    mockPair({ blockchain: 'bsc', provider, pair: '0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE', params: [WBNB, USDT_bsc] })
    mockPair({ blockchain: 'bsc', provider, pair: '0x16b9a82891338f9bA80E2D6970FddA79D1eb0daE', params: [USDT_bsc, WBNB] })
    mockPair({ blockchain: 'bsc', provider, pair: '0xc7c3cCCE4FA25700fD5574DA7E200ae28BBd36A3', params: [WBNB, DAI_bsc] })
    mockPair({ blockchain: 'bsc', provider, pair: '0xc7c3cCCE4FA25700fD5574DA7E200ae28BBd36A3', params: [DAI_bsc, WBNB] })
    mockPair({ blockchain: 'bsc', provider, pair: Blockchains.bsc.zero, params: [BUSD, USDT_bsc] })
    mockPair({ blockchain: 'bsc', provider, pair: Blockchains.bsc.zero, params: [BUSD, DAI_bsc] })
    mockPair({ blockchain: 'bsc', provider, pair: '0x66FDB2eCCfB58cF098eaa419e5EfDe841368e489', params: [BUSD, WBNB] })
    mockAmounts({ blockchain: 'bsc', provider, method: 'getAmountsIn', params: [USDT_bsc_amount ,[WBNB, USDT_bsc]], amounts: [WBNB_USDT_bsc_amountIn, USDT_bsc_amount] })
    mockAmounts({ blockchain: 'bsc', provider, method: 'getAmountsIn', params: [DAI_bsc_amount ,[WBNB, DAI_bsc]], amounts: [WBNB_DAI_bsc_amountIn, DAI_bsc_amount] })
    mockAmounts({ blockchain: 'bsc', provider, method: 'getAmountsIn', params: [USDT_bsc_amount ,[BUSD, WBNB, USDT_bsc]], amounts: [BUSD_bsc_amountIn, WBNB_USDT_bsc_amountIn, USDT_bsc_amount] })
    mockAmounts({ blockchain: 'bsc', provider, method: 'getAmountsIn', params: [DAI_bsc_amount ,[BUSD, WBNB, DAI_bsc]], amounts: [BUSD_bsc_amountIn, WBNB_DAI_bsc_amountIn, DAI_bsc_amount] })
    mock({ provider, blockchain: 'bsc', balance: { for: fromAddress, return: BNB_balance } })
    mockBalance({ provider, blockchain: 'bsc', api: Token.bsc.BEP20, token: BUSD, account: fromAddress, balance: BUSD_balance })
    mockAllowance({ provider, blockchain: 'bsc', api: Token.bsc.BEP20, token: BUSD, account: fromAddress, spender: routers.bsc.address, allowance: Blockchains.bsc.maxInt })

    connect('ethereum')

    let routes = await route({
      accept,
      from: fromAccounts,
      deny
    })

    expect(routes.length).toEqual(2)

    expect(routes[0].blockchain).toEqual('bsc')
    expect(routes[0].fromToken.address).toEqual(Blockchains.bsc.currency.address)
    expect(routes[0].fromBalance.toString()).toEqual(BNB_balance.toString())
    expect(routes[0].toToken.address).toEqual(USDT_bsc)
    expect(routes[0].toAmount.toString()).toEqual(USDT_bsc_amount.toString())
    transaction = await routes[0].getTransaction()
    expect(transaction.blockchain).toEqual('bsc')
    expect(transaction.to).toEqual(routers.bsc.address)
    expect(routes[0].approvalRequired).toEqual(false)
    expect(routes[0].approvalTransaction).toEqual(undefined)
    expect(routes[0].fromAmount.toString()).toEqual(
      ethers.BigNumber.from(WBNB_USDT_bsc_amountIn).add(ethers.BigNumber.from(WBNB_USDT_bsc_amountInSlippage)).toString()
    )

    expect(routes[1].blockchain).toEqual('ethereum')
    expect(routes[1].fromToken.address).toEqual(Blockchains.ethereum.currency.address)
    expect(routes[1].fromBalance.toString()).toEqual(ETH_balance.toString())
    expect(routes[1].toToken.address).toEqual(DAI_ethereum)
    expect(routes[1].toAmount.toString()).toEqual(DAI_ethereum_amount.toString())
    transaction = await routes[1].getTransaction()
    expect(transaction.blockchain).toEqual('ethereum')
    expect(transaction.to).toEqual(routers.ethereum.address)
    expect(routes[1].approvalRequired).toEqual(false)
    expect(routes[1].approvalTransaction).toEqual(undefined)
    expect(routes[1].fromAmount.toString()).toEqual(
      ethers.BigNumber.from(WETH_DAI_ethereum_amountIn).add(ethers.BigNumber.from(WETH_DAI_ethereum_amountInSlippage)).toString()
    )
  })
})
