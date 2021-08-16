import fetchMock from 'fetch-mock'
import plugins from 'src/plugins'
import routers from 'src/routers'
import { CONSTANTS } from 'depay-web3-constants'
import { ethers } from 'ethers'
import { mock, resetMocks, anything } from 'depay-web3-mock'
import { mockAssets } from 'tests/mocks/DePayPRO'
import { mockDecimals, mockBalance, mockNotTransferable, mockAllowance } from 'tests/mocks/tokens'
import { mockPair, mockAmounts } from 'tests/mocks/Pancakeswap'
import { resetCache } from 'depay-web3-client'
import { route } from 'src'
import { Token } from 'depay-web3-tokens'

describe('route', ()=> {

  beforeEach(resetMocks)
  beforeEach(resetCache)
  beforeEach(()=>fetchMock.reset())
  afterEach(resetMocks)

  let blockchain = 'bsc'
  let apiKey = 'Test123'
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
    mockAssets(blockchain, [
      {
        "name": "Binance Coin",
        "symbol": "BNB",
        "address": BNB,
        "type": "NATIVE"
      }, {
        "name": "CAKE Stablecoin",
        "symbol": "CAKE",
        "address": CAKE,
        "type": "BEP20"
      }, {
        "name": "BUSD",
        "symbol": "BUSD",
        "address": BUSD,
        "type": "BEP20"
      }
    ])
    mockDecimals({ blockchain, api: Token[blockchain].BEP20, token: BUSD, decimals: 18 })
    mockDecimals({ blockchain, api: Token[blockchain].BEP20, token: CAKE, decimals: 18 })

    mockPair('0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', [WBNB, BUSD])
    mockPair('0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', [BUSD, WBNB])
    mockPair('0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11', [CAKE, WBNB])
    mockPair(CONSTANTS[blockchain].ZERO, [CAKE, BUSD])

    mockAmounts({ method: 'getAmountsIn', params: [tokenAmountOutBN, [WBNB, BUSD]], amounts: [WBNBAmountInBN, tokenAmountOutBN] })
    mockAmounts({ method: 'getAmountsIn', params: [tokenAmountOutBN, [CAKE, WBNB, BUSD]], amounts: [CAKEAmountInBN, WBNBAmountInBN, tokenAmountOutBN] })

    mockBalance({ blockchain, api: Token[blockchain].BEP20, token: CAKE, account: fromAddress, balance: CAKEBalanceBN })
    mockBalance({ blockchain, api: Token[blockchain].BEP20, token: BUSD, account: fromAddress, balance: BUSDBalanceBN })

    mockAllowance({ blockchain, api: Token[blockchain].BEP20, token: CAKE, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })
    mockAllowance({ blockchain, api: Token[blockchain].BEP20, token: BUSD, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })

    mock({ blockchain, balance: { for: fromAddress, return: bnbBalanceBN } })
  })

  it('provides all possible payment routes based on wallet assets and decentralized exchange routes', async ()=>{

    let routes = await route({
      fromAddress,
      toAddress,
      blockchain,
      token: toToken,
      amount: tokenAmountOut,
      apiKey
    })

    // BUSD (direct transfer)
    expect(routes[0].blockchain).toEqual(blockchain)
    expect(routes[0].fromToken.address).toEqual(BUSD)
    expect(routes[0].toToken.address).toEqual(BUSD)
    expect(routes[0].toAmount).toEqual(tokenAmountOutBN)
    expect(routes[0].fromAddress).toEqual(fromAddress)
    expect(routes[0].toAddress).toEqual(toAddress)
    expect(routes[0].fromBalance).toEqual(BUSDBalanceBN)
    expect(routes[0].exchangeRoutes).toEqual([])
    expect(routes[0].transaction.value).toEqual(ethers.BigNumber.from('0'))

    // BNB/WBNB
    expect(routes[1].blockchain).toEqual(blockchain)
    expect(routes[1].fromToken.address).toEqual(BNB)
    expect(routes[1].toToken.address).toEqual(BUSD)
    expect(routes[1].toAmount).toEqual(tokenAmountOutBN)
    expect(routes[1].fromAddress).toEqual(fromAddress)
    expect(routes[1].toAddress).toEqual(toAddress)
    expect(routes[1].fromBalance).toEqual(bnbBalanceBN)
    expect(routes[1].exchangeRoutes[0].tokenIn).toEqual(BNB)
    expect(routes[1].exchangeRoutes[0].tokenOut).toEqual(BUSD)
    expect(routes[1].exchangeRoutes[0].path).toEqual([BNB, WBNB, BUSD])
    expect(routes[1].exchangeRoutes[0].amountIn).toEqual(WBNBAmountInBN)
    expect(routes[1].exchangeRoutes[0].amountOutMin).toEqual(tokenAmountOutBN)
    expect(routes[1].exchangeRoutes[0].fromAddress).toEqual(fromAddress)
    expect(routes[1].exchangeRoutes[0].toAddress).toEqual(toAddress)
    expect(routes[1].exchangeRoutes[0].transaction.address).toEqual('0x10ED43C718714eb63d5aA57B78B54704E256024E')
    expect(routes[1].exchangeRoutes[0].transaction.method).toEqual('swapExactETHForTokens')
    expect(routes[1].exchangeRoutes[0].transaction.params.amountOutMin).toEqual(tokenAmountOutBN)
    expect(routes[1].exchangeRoutes[0].transaction.params.path).toEqual([WBNB, BUSD])
    expect(routes[1].exchangeRoutes[0].transaction.value).toEqual(WBNBAmountInBN)
    expect(routes[1].transaction.value).toEqual(WBNBAmountInBN)

    // CAKE
    expect(routes[2].blockchain).toEqual(blockchain)
    expect(routes[2].fromToken.address).toEqual(CAKE)
    expect(routes[2].toToken.address).toEqual(BUSD)
    expect(routes[2].toAmount).toEqual(tokenAmountOutBN)
    expect(routes[2].fromAddress).toEqual(fromAddress)
    expect(routes[2].toAddress).toEqual(toAddress)
    expect(routes[2].fromBalance).toEqual(CAKEBalanceBN)
    expect(routes[2].exchangeRoutes[0].tokenIn).toEqual(CAKE)
    expect(routes[2].exchangeRoutes[0].tokenOut).toEqual(BUSD)
    expect(routes[2].exchangeRoutes[0].path).toEqual([CAKE, WBNB, BUSD])
    expect(routes[2].exchangeRoutes[0].amountIn).toEqual(CAKEAmountInBN)
    expect(routes[2].exchangeRoutes[0].amountOutMin).toEqual(tokenAmountOutBN)
    expect(routes[2].exchangeRoutes[0].fromAddress).toEqual(fromAddress)
    expect(routes[2].exchangeRoutes[0].toAddress).toEqual(toAddress)
    expect(routes[2].exchangeRoutes[0].transaction.address).toEqual('0x10ED43C718714eb63d5aA57B78B54704E256024E')
    expect(routes[2].exchangeRoutes[0].transaction.method).toEqual('swapExactTokensForTokens')
    expect(routes[2].exchangeRoutes[0].transaction.params.amountOutMin).toEqual(tokenAmountOutBN)
    expect(routes[2].exchangeRoutes[0].transaction.params.path).toEqual([CAKE, WBNB, BUSD])
    expect(routes[2].transaction.value).toEqual(ethers.BigNumber.from('0'))
  });

  it('filters routes with tokens that are not transferable', async ()=>{
    mockNotTransferable({ blockchain, api: Token[blockchain].BEP20, token: CAKE })
    
    let routes = await route({
      fromAddress,
      toAddress,
      blockchain,
      token: toToken,
      amount: tokenAmountOut,
      apiKey
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([BUSD, BNB])
  })

  it('filters routes that are not routable on any decentralized exchange', async ()=>{
    mockPair(CONSTANTS[blockchain].ZERO, [CAKE, WBNB])

    let routes = await route({
      fromAddress,
      toAddress,
      blockchain,
      token: toToken,
      amount: tokenAmountOut,
      apiKey
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([BUSD, BNB])
  })

  it('filters routes with insufficient balance', async ()=>{
    mockBalance({ blockchain, api: Token[blockchain].BEP20, token: CAKE, account: fromAddress, balance: ethers.BigNumber.from('290000000000000000') })

    let routes = await route({
      fromAddress,
      toAddress,
      blockchain,
      token: toToken,
      amount: tokenAmountOut,
      apiKey
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([BUSD, BNB])    
  })
  
  it('filters native token route if user has insufficient balance', async ()=>{
    mock({ blockchain, balance: { for: fromAddress, return: ethers.BigNumber.from('10000000000000000000') } })

    let routes = await route({
      fromAddress,
      toAddress,
      blockchain,
      token: toToken,
      amount: tokenAmountOut,
      apiKey
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([BUSD, CAKE])
  })

  it('it first uses the direct token transfer, then native token and last other tokens', async ()=>{
    let routes = await route({
      fromAddress,
      toAddress,
      blockchain,
      token: toToken,
      amount: tokenAmountOut,
      apiKey
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([BUSD, BNB, CAKE])
  })
  
  it('sorts tokens that do not require approval before the once that do and provides approvalRequired and directTransfer status', async ()=>{

    let USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    let USDCAmountInBN = ethers.BigNumber.from('300000000000000000')
    
    mockAssets(blockchain, [
      {
        "name": "Binance Coin",
        "symbol": "BNB",
        "address": BNB,
        "type": "NATIVE"
      }, {
        "name": "CAKE Stablecoin",
        "symbol": "CAKE",
        "address": CAKE,
        "type": "BEP20"
      }, {
        "name": "BUSD",
        "symbol": "BUSD",
        "address": BUSD,
        "type": "BEP20"
      },{
        "name": "USD Coin",
        "symbol": "USDC",
        "address": USDC,
        "type": "BEP20"
      }
    ])

    mockDecimals({ blockchain, api: Token[blockchain].BEP20, token: USDC, decimals: 18 })
    mockPair('0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc', [USDC, WBNB])
    mockPair(CONSTANTS[blockchain].ZERO, [USDC, BUSD])
    mockAmounts({ method: 'getAmountsIn', params: [tokenAmountOutBN, [USDC, WBNB, BUSD]], amounts: [USDCAmountInBN, WBNBAmountInBN, tokenAmountOutBN] })
    mockBalance({ blockchain, api: Token[blockchain].BEP20, token: USDC, account: fromAddress, balance: ethers.BigNumber.from('310000000000000000')})

    mockAllowance({ blockchain, api: Token[blockchain].BEP20, token: USDC, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })
    mockAllowance({ blockchain, api: Token[blockchain].BEP20, token: CAKE, account: fromAddress, spender: routers[blockchain].address, allowance: ethers.BigNumber.from('0') })

    let routes = await route({
      fromAddress,
      toAddress,
      blockchain,
      token: toToken,
      amount: tokenAmountOut,
      apiKey
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([BUSD, BNB, USDC, CAKE])
    expect(routes.map((route)=>route.approvalRequired)).toEqual([false, false, false, true])
    expect(routes.map((route)=>route.directTransfer)).toEqual([true, false, false, false])
  })

  describe('transaction', ()=> {

    it('performs direct TOKEN payments if it is the best option', async ()=>{

      let routeMock = mock({
        blockchain,
        transaction: {
          from: fromAddress,
          to: routers[blockchain].address,
          api: routers[blockchain].api,
          method: 'route',
          params: {
            path: [BUSD],
            amounts: [tokenAmountOutBN],
            addresses: [fromAddress, toAddress],
            plugins: [plugins[blockchain].payment],
            data: []  
          },
          value: 0
        }
      })
       
      let routes = await route({
        fromAddress,
        toAddress,
        blockchain,
        token: toToken,
        amount: tokenAmountOut,
        apiKey
      })

      await routes[0].transaction.submit()
      expect(routeMock).toHaveBeenCalled()
    })

    it('performs BNB to TOKEN swap payments if it is the best option', async ()=>{

      mockBalance({ blockchain, api: Token[blockchain].BEP20, token: BUSD, account: fromAddress, balance: ethers.BigNumber.from('0') })

      let routeMock = mock({
        blockchain,
        transaction: {
          from: fromAddress,
          to: routers[blockchain].address,
          api: routers[blockchain].api,
          method: 'route',
          params: {
            path: [CONSTANTS[blockchain].NATIVE, CONSTANTS[blockchain].WRAPPED, BUSD],
            amounts: [WBNBAmountInBN, tokenAmountOutBN, anything],
            addresses: [fromAddress, toAddress],
            plugins: [plugins[blockchain].pancakeswap, plugins[blockchain].payment],
            data: []  
          },
          value: 0
        }
      })

      let routes = await route({
        fromAddress,
        toAddress,
        blockchain,
        token: toToken,
        amount: tokenAmountOut,
        apiKey
      })

      await routes[0].transaction.submit()
      expect(routeMock).toHaveBeenCalled()
    })

    it('performs TOKEN_A to TOKEN_B swap payments if it is the best option', async ()=>{

      mockBalance({ blockchain, api: Token[blockchain].BEP20, token: BUSD, account: fromAddress, balance: ethers.BigNumber.from('0') })
      mock({
        blockchain,
        balance: {
          for: fromAddress,
          return: '0'
        }
      })

      let routeMock = mock({
        blockchain,
        transaction: {
          from: fromAddress,
          to: routers[blockchain].address,
          api: routers[blockchain].api,
          method: 'route',
          params: {
            path: [CAKE, CONSTANTS[blockchain].WRAPPED, BUSD],
            amounts: [CAKEAmountInBN, tokenAmountOutBN, anything],
            addresses: [fromAddress, toAddress],
            plugins: [plugins[blockchain].pancakeswap, plugins[blockchain].payment],
            data: []  
          },
          value: 0
        }
      })

      let routes = await route({
        fromAddress,
        toAddress,
        blockchain,
        token: toToken,
        amount: tokenAmountOut,
        apiKey
      })

      await routes[0].transaction.submit()
      expect(routeMock).toHaveBeenCalled()
    })

    describe('NATIVE token payments', ()=> {

      beforeEach(()=> {
        toToken = CONSTANTS[blockchain].NATIVE        
      })

      it('performs direct BNB payments if it is the best option', async ()=>{

        mock({
          blockchain,
          balance: {
            for: fromAddress,
            return: tokenAmountOutBN.toString()
          }
        })

        let routeMock = mock({
          blockchain,
          transaction: {
            from: fromAddress,
            to: routers[blockchain].address,
            api: routers[blockchain].api,
            method: 'route',
            params: {
              path: [CONSTANTS[blockchain].NATIVE],
              amounts: [tokenAmountOutBN],
              addresses: [fromAddress, toAddress],
              plugins: [plugins[blockchain].payment],
              data: []  
            },
            value: tokenAmountOutBN
          }
        })

        let routes = await route({
          fromAddress,
          toAddress,
          blockchain,
          token: toToken,
          amount: tokenAmountOut,
          apiKey
        })

        await routes[0].transaction.submit()
        expect(routeMock).toHaveBeenCalled()
      })

      it('performs TOKEN to ETH swap payments if it is the best option', async ()=>{
        
        mock({
          blockchain,
          balance: {
            for: fromAddress,
            return: '0'
          }
        })

        mockAmounts({ method: 'getAmountsIn', params: [tokenAmountOutBN, [CAKE, WBNB]], amounts: [CAKEAmountInBN, tokenAmountOutBN] })

        let routeMock = mock({
          blockchain,
          transaction: {
            from: fromAddress,
            to: routers[blockchain].address,
            api: routers[blockchain].api,
            method: 'route',
            params: {
              path: [CAKE, CONSTANTS[blockchain].WRAPPED, CONSTANTS[blockchain].NATIVE],
              amounts: [CAKEAmountInBN, tokenAmountOutBN, anything],
              addresses: [fromAddress, toAddress],
              plugins: [plugins[blockchain].pancakeswap, plugins[blockchain].payment],
              data: []  
            },
            value: 0
          }
        })

        let routes = await route({
          fromAddress,
          toAddress,
          blockchain,
          token: toToken,
          amount: tokenAmountOut,
          apiKey
        })

        await routes[0].transaction.submit()
        expect(routeMock).toHaveBeenCalled()
      })
    })
  })
})
