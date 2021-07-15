import CONSTANTS from 'depay-blockchain-constants'
import { DePayRouterV1 } from '../../src/constants'
import { ethers } from 'ethers'
import { mock, resetMocks } from 'depay-web3mock'
import { mockAssets } from '../mocks/DePayPRO'
import { mockDecimals, mockBalance, mockNotTransferable, mockAllowance } from '../mocks/ERC20'
import { mockPair, mockAmounts } from '../mocks/UniswapV2'
import { resetCache } from 'depay-blockchain-client'
import { route, setApiKey } from '../../src'

describe('route', ()=> {

  beforeEach(resetMocks)
  beforeEach(resetCache)
  afterEach(resetMocks)

  let DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
  let DEPAY = "0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb"
  let WETH = CONSTANTS.ethereum.WRAPPED
  let ETH = CONSTANTS.ethereum.NATIVE
  let MAXINTBN = ethers.BigNumber.from(CONSTANTS.ethereum.MAXINT)
  let etherBalanceBN
  let DAIBalanceBN
  let DEPAYBalanceBN
  let toToken
  let WETHAmountInBN
  let DAIAmountInBN
  let tokenAmountOut
  let tokenOutDecimals
  let tokenAmountOutBN
  let from
  let to

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
    from = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
    to = '0x65aBbdEd9B937E38480A50eca85A8E4D2c8350E4'
  })

  beforeEach(()=>{
    setApiKey('Test123')
    mock('ethereum')
    mockAssets('ethereum', [
      {
        "name": "Ether",
        "symbol": "ETH",
        "address": ETH,
        "type": "NATIVE"
      }, {
        "name": "Dai Stablecoin",
        "symbol": "DAI",
        "address": DAI,
        "type": "ERC20"
      }, {
        "name": "DePay",
        "symbol": "DEPAY",
        "address": DEPAY,
        "type": "ERC20"
      }
    ])
    
    mockDecimals({ blockchain: 'ethereum', token: DEPAY, decimals: 18 })
    mockDecimals({ blockchain: 'ethereum', token: DAI, decimals: 18 })

    mockPair('0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', [WETH, DEPAY])
    mockPair('0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', [DEPAY, WETH])
    mockPair('0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11', [DAI, WETH])
    mockPair(CONSTANTS.ethereum.ZERO, [DAI, DEPAY])

    mockAmounts({ method: 'getAmountsIn', params: [tokenAmountOutBN, [WETH, DEPAY]], amounts: [WETHAmountInBN, tokenAmountOutBN] })
    mockAmounts({ method: 'getAmountsIn', params: [tokenAmountOutBN, [DAI, WETH, DEPAY]], amounts: [DAIAmountInBN, WETHAmountInBN, tokenAmountOutBN] })

    mockBalance({ blockchain: 'ethereum', token: DAI, account: from, balance: DAIBalanceBN })
    mockBalance({ blockchain: 'ethereum', token: DEPAY, account: from, balance: DEPAYBalanceBN })

    mockAllowance({ blockchain: 'ethereum', token: DAI, account: from, spender: DePayRouterV1, allowance: MAXINTBN })
    mockAllowance({ blockchain: 'ethereum', token: DEPAY, account: from, spender: DePayRouterV1, allowance: MAXINTBN })

    mock({ blockchain: 'ethereum', balance: { for: from, return: etherBalanceBN } })
  })

  it('provides all possible payment routes based on wallet assets and decentralized exchange routes', async ()=>{

    let routes = await route({
      from,
      to,
      blockchain: 'ethereum',
      token: toToken,
      amount: tokenAmountOut
    })

    // DEPAY (direct transfer)
    expect(routes[0].blockchain).toEqual('ethereum')
    expect(routes[0].fromToken.address).toEqual(DEPAY)
    expect(routes[0].toToken.address).toEqual(DEPAY)
    expect(routes[0].fromBalance).toEqual(DEPAYBalanceBN)
    expect(routes[0].exchangeRoutes).toEqual([])

    // ETH/WETH
    expect(routes[1].blockchain).toEqual('ethereum')
    expect(routes[1].fromToken.address).toEqual(ETH)
    expect(routes[1].toToken.address).toEqual(DEPAY)
    expect(routes[1].fromBalance).toEqual(etherBalanceBN)
    expect(routes[1].exchangeRoutes[0].tokenIn).toEqual(ETH)
    expect(routes[1].exchangeRoutes[0].tokenOut).toEqual(DEPAY)
    expect(routes[1].exchangeRoutes[0].path).toEqual([ETH, DEPAY])
    expect(routes[1].exchangeRoutes[0].amountIn).toEqual(WETHAmountInBN)
    expect(routes[1].exchangeRoutes[0].amountOutMin).toEqual(tokenAmountOutBN)
    expect(routes[1].exchangeRoutes[0].from).toEqual(from)
    expect(routes[1].exchangeRoutes[0].to).toEqual(to)
    expect(routes[1].exchangeRoutes[0].transaction.address).toEqual('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')
    expect(routes[1].exchangeRoutes[0].transaction.method).toEqual('swapExactETHForTokens')
    expect(routes[1].exchangeRoutes[0].transaction.params.amountOutMin).toEqual(tokenAmountOutBN)
    expect(routes[1].exchangeRoutes[0].transaction.params.path).toEqual([WETH, DEPAY])
    expect(routes[1].exchangeRoutes[0].transaction.value).toEqual(WETHAmountInBN)

    // DAI
    expect(routes[2].blockchain).toEqual('ethereum')
    expect(routes[2].fromToken.address).toEqual(DAI)
    expect(routes[2].toToken.address).toEqual(DEPAY)
    expect(routes[2].fromBalance).toEqual(DAIBalanceBN)
    expect(routes[2].exchangeRoutes[0].tokenIn).toEqual(DAI)
    expect(routes[2].exchangeRoutes[0].tokenOut).toEqual(DEPAY)
    expect(routes[2].exchangeRoutes[0].path).toEqual([DAI, WETH, DEPAY])
    expect(routes[2].exchangeRoutes[0].amountIn).toEqual(DAIAmountInBN)
    expect(routes[2].exchangeRoutes[0].amountOutMin).toEqual(tokenAmountOutBN)
    expect(routes[2].exchangeRoutes[0].from).toEqual(from)
    expect(routes[2].exchangeRoutes[0].to).toEqual(to)
    expect(routes[2].exchangeRoutes[0].transaction.address).toEqual('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')
    expect(routes[2].exchangeRoutes[0].transaction.method).toEqual('swapExactTokensForTokens')
    expect(routes[2].exchangeRoutes[0].transaction.params.amountOutMin).toEqual(tokenAmountOutBN)
    expect(routes[2].exchangeRoutes[0].transaction.params.path).toEqual([DAI, WETH, DEPAY])

  });

  it('filters routes with tokens that are not transferable', async ()=>{
    mockNotTransferable({ token: DAI })
    
    let routes = await route({
      from,
      to,
      blockchain: 'ethereum',
      token: toToken,
      amount: tokenAmountOut
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([DEPAY, ETH])
  })

  it('filters routes that are not routable on any decentralized exchange', async ()=>{
    mockPair(CONSTANTS.ethereum.ZERO, [DAI, WETH])

    let routes = await route({
      from,
      to,
      blockchain: 'ethereum',
      token: toToken,
      amount: tokenAmountOut
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([DEPAY, ETH])
  })

  it('filters routes with insufficient balance', async ()=>{
    mockBalance({ blockchain: 'ethereum', token: DAI, account: from, balance: ethers.BigNumber.from('290000000000000000') })

    let routes = await route({
      from,
      to,
      blockchain: 'ethereum',
      token: toToken,
      amount: tokenAmountOut
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([DEPAY, ETH])    
  })
  
  it('filters native token route if user has insufficient balance', async ()=>{
    mock({ blockchain: 'ethereum', balance: { for: from, return: ethers.BigNumber.from('10000000000000000000') } })

    let routes = await route({
      from,
      to,
      blockchain: 'ethereum',
      token: toToken,
      amount: tokenAmountOut
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([DEPAY, DAI])
  })

  it('it first uses the direct token transfer, then native token and last other tokens', async ()=>{
    let routes = await route({
      from,
      to,
      blockchain: 'ethereum',
      token: toToken,
      amount: tokenAmountOut
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([DEPAY, ETH, DAI])
  })
  
  it('it sorts tokens that do not require approval before the once that do', async ()=>{

    let USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    let USDCAmountInBN = ethers.BigNumber.from('300000000000000000')
    
    mockAssets('ethereum', [
      {
        "name": "Ether",
        "symbol": "ETH",
        "address": ETH,
        "type": "NATIVE"
      }, {
        "name": "Dai Stablecoin",
        "symbol": "DAI",
        "address": DAI,
        "type": "ERC20"
      }, {
        "name": "DePay",
        "symbol": "DEPAY",
        "address": DEPAY,
        "type": "ERC20"
      },{
        "name": "USD Coin",
        "symbol": "USDC",
        "address": USDC,
        "type": "ERC20"
      }
    ])

    mockDecimals({ blockchain: 'ethereum', token: USDC, decimals: 18 })
    mockPair('0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc', [USDC, WETH])
    mockPair(CONSTANTS.ethereum.ZERO, [USDC, DEPAY])
    mockAmounts({ method: 'getAmountsIn', params: [tokenAmountOutBN, [USDC, WETH, DEPAY]], amounts: [USDCAmountInBN, WETHAmountInBN, tokenAmountOutBN] })
    mockBalance({ blockchain: 'ethereum', token: USDC, account: from, balance: ethers.BigNumber.from('310000000000000000')})

    mockAllowance({ blockchain: 'ethereum', token: USDC, account: from, spender: DePayRouterV1, allowance: MAXINTBN })
    mockAllowance({ blockchain: 'ethereum', token: DAI, account: from, spender: DePayRouterV1, allowance: ethers.BigNumber.from('0') })

    let routes = await route({
      from,
      to,
      blockchain: 'ethereum',
      token: toToken,
      amount: tokenAmountOut
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([DEPAY, ETH, USDC, DAI])
  })
});
