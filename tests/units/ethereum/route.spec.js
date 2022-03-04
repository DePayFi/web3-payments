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

describe('route', ()=> {

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
    mockAllowance({ provider: provider(blockchain), blockchain, api: Token[blockchain].ERC20, token: DEPAY, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })

    mock({ provider: provider(blockchain), blockchain, balance: { for: fromAddress, return: etherBalanceBN } })
  })

  it('provides all possible payment routes based on wallet assets and decentralized exchange routes', async ()=>{

    let routes = await route({
      accept: [{
        fromAddress,
        toAddress,
        blockchain,
        token: toToken,
        amount: tokenAmountOut
      }]
    })

    // DEPAY (direct transfer)
    expect(routes[0].blockchain).toEqual(blockchain)
    expect(routes[0].fromToken.address).toEqual(DEPAY)
    expect(routes[0].toToken.address).toEqual(DEPAY)
    expect(routes[0].toAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[0].fromAddress).toEqual(fromAddress)
    expect(routes[0].toAddress).toEqual(toAddress)
    expect(routes[0].fromBalance).toEqual(DEPAYBalanceBN.toString())
    expect(routes[0].fromAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[0].exchangeRoutes).toEqual([])
    expect(routes[0].transaction.blockchain).toEqual(blockchain)
    expect(routes[0].transaction.to).toEqual(DEPAY)
    expect(routes[0].transaction.api).toEqual(Token[blockchain].DEFAULT)
    expect(routes[0].transaction.method).toEqual('transfer')
    expect(routes[0].transaction.params).toEqual([toAddress, tokenAmountOutBN.toString()])
    expect(routes[0].transaction.value).toEqual('0')

    // ETH/WETH
    expect(routes[1].blockchain).toEqual(blockchain)
    expect(routes[1].fromToken.address).toEqual(ETH)
    expect(routes[1].toToken.address).toEqual(DEPAY)
    expect(routes[1].toAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[1].fromAmount).toEqual(WETHAmountInBN.toString())
    expect(routes[1].fromAddress).toEqual(fromAddress)
    expect(routes[1].toAddress).toEqual(toAddress)
    expect(routes[1].fromBalance).toEqual(etherBalanceBN.toString())
    expect(routes[1].exchangeRoutes[0].tokenIn).toEqual(ETH)
    expect(routes[1].exchangeRoutes[0].tokenOut).toEqual(DEPAY)
    expect(routes[1].exchangeRoutes[0].path).toEqual([ETH, WETH, DEPAY])
    expect(routes[1].exchangeRoutes[0].amountIn).toEqual(WETHAmountInBN.toString())
    expect(routes[1].exchangeRoutes[0].amountOutMin).toEqual(tokenAmountOutBN.toString())
    expect(routes[1].exchangeRoutes[0].fromAddress).toEqual(fromAddress)
    expect(routes[1].exchangeRoutes[0].toAddress).toEqual(toAddress)
    expect(routes[1].exchangeRoutes[0].transaction.to).toEqual('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')
    expect(routes[1].exchangeRoutes[0].transaction.method).toEqual('swapExactETHForTokens')
    expect(routes[1].exchangeRoutes[0].transaction.params.amountOutMin).toEqual(tokenAmountOutBN.toString())
    expect(routes[1].exchangeRoutes[0].transaction.params.path).toEqual([WETH, DEPAY])
    expect(routes[1].exchangeRoutes[0].transaction.value).toEqual(WETHAmountInBN.toString())
    expect(routes[1].transaction.value).toEqual(WETHAmountInBN.toString())

    // DAI
    expect(routes[2].blockchain).toEqual(blockchain)
    expect(routes[2].fromToken.address).toEqual(DAI)
    expect(routes[2].toToken.address).toEqual(DEPAY)
    expect(routes[2].toAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[2].fromAmount).toEqual(DAIAmountInBN.toString())
    expect(routes[2].fromAddress).toEqual(fromAddress)
    expect(routes[2].toAddress).toEqual(toAddress)
    expect(routes[2].fromBalance).toEqual(DAIBalanceBN.toString())
    expect(routes[2].exchangeRoutes[0].tokenIn).toEqual(DAI)
    expect(routes[2].exchangeRoutes[0].tokenOut).toEqual(DEPAY)
    expect(routes[2].exchangeRoutes[0].path).toEqual([DAI, WETH, DEPAY])
    expect(routes[2].exchangeRoutes[0].amountIn).toEqual(DAIAmountInBN.toString())
    expect(routes[2].exchangeRoutes[0].amountOutMin).toEqual(tokenAmountOutBN.toString())
    expect(routes[2].exchangeRoutes[0].fromAddress).toEqual(fromAddress)
    expect(routes[2].exchangeRoutes[0].toAddress).toEqual(toAddress)
    expect(routes[2].exchangeRoutes[0].transaction.to).toEqual('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')
    expect(routes[2].exchangeRoutes[0].transaction.method).toEqual('swapExactTokensForTokens')
    expect(routes[2].exchangeRoutes[0].transaction.params.amountOutMin).toEqual(tokenAmountOutBN.toString())
    expect(routes[2].exchangeRoutes[0].transaction.params.path).toEqual([DAI, WETH, DEPAY])
    expect(routes[2].transaction.value).toEqual('0')
  });

  describe('exchange routes without plugins', ()=> {

    let uniswap_v2Plugin

    beforeEach(()=> {
      uniswap_v2Plugin = plugins[blockchain].uniswap_v2
      plugins[blockchain].uniswap_v2 = undefined
    })

    afterEach(()=> {
      plugins[blockchain].uniswap_v2 = uniswap_v2Plugin
    })

    it('filters routes which need to go through an exchange and that exchange has not a payment plugin yet', async ()=>{

      let routes = await route({
        accept: [{
          fromAddress,
          toAddress,
          blockchain,
          token: toToken,
          amount: tokenAmountOut,
        }]
      })

      expect(routes.map((route)=>route.fromToken.address)).toEqual([DEPAY])
    })
  })

  it('filters routes that are not routable on any decentralized exchange', async ()=>{
    mockPair(provider(blockchain), CONSTANTS[blockchain].ZERO, [DAI, WETH])

    let routes = await route({
      accept: [{
        fromAddress,
        toAddress,
        blockchain,
        token: toToken.toLowerCase(),
        amount: tokenAmountOut,
      }]
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([DEPAY, ETH])
  })

  it('filters routes with insufficient balance', async ()=>{
    mockBalance({ provider: provider(blockchain), blockchain, api: Token[blockchain].ERC20, token: DAI, account: fromAddress, balance: ethers.BigNumber.from('290000000000000000') })

    let routes = await route({
      accept: [{
        fromAddress,
        toAddress,
        blockchain,
        token: toToken,
        amount: tokenAmountOut,
      }]
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([DEPAY, ETH])    
  })
  
  it('filters native token route if user has insufficient balance', async ()=>{
    mock({ blockchain, balance: { for: fromAddress, return: ethers.BigNumber.from('10000000000000000000') } })

    let routes = await route({
      accept: [{
        fromAddress,
        toAddress,
        blockchain,
        token: toToken,
        amount: tokenAmountOut,
      }]
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([DEPAY, DAI])
  })

  it('it first uses the direct token transfer, then native token and last other tokens', async ()=>{
    let routes = await route({
      accept: [{
        fromAddress,
        toAddress,
        blockchain,
        token: toToken,
        amount: tokenAmountOut,
      }]
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([DEPAY, ETH, DAI])
  })
  
  it('sorts tokens that do not require approval before the once that do and provides approvalRequired and directTransfer status', async ()=>{

    let USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    let USDCAmountInBN = ethers.BigNumber.from('300000000000000000')
    
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
      },{
        "name": "USD Coin",
        "symbol": "USDC",
        "address": USDC,
        "type": "20"
      }
    ]})

    mockDecimals({ provider: provider(blockchain), blockchain, api: Token[blockchain].ERC20, token: USDC, decimals: 18 })
    mockPair(provider(blockchain), '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc', [USDC, WETH])
    mockPair(provider(blockchain), CONSTANTS[blockchain].ZERO, [USDC, DEPAY])
    mockAmounts({ provider: provider(blockchain), method: 'getAmountsIn', params: [tokenAmountOutBN, [USDC, WETH, DEPAY]], amounts: [USDCAmountInBN, WETHAmountInBN, tokenAmountOutBN] })
    mockBalance({ provider: provider(blockchain), blockchain, api: Token[blockchain].ERC20, token: USDC, account: fromAddress, balance: ethers.BigNumber.from('310000000000000000')})

    mockAllowance({ provider: provider(blockchain), blockchain, api: Token[blockchain].ERC20, token: USDC, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })
    mockAllowance({ provider: provider(blockchain), blockchain, api: Token[blockchain].ERC20, token: DAI, account: fromAddress, spender: routers[blockchain].address, allowance: ethers.BigNumber.from('0') })

    let routes = await route({
      accept: [{
        fromAddress,
        toAddress,
        blockchain,
        token: toToken,
        amount: tokenAmountOut,
      }]
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([DEPAY, ETH, USDC, DAI])
    expect(routes.map((route)=>route.approvalRequired)).toEqual([false, false, false, true])
    expect(routes.map((route)=>route.directTransfer)).toEqual([true, false, false, false])
  })

  describe('transaction', ()=> {

    it('performs direct TOKEN payments if it is the best option', async ()=>{

      let routeMock = mock({
        blockchain,
        transaction: {
          from: fromAddress,
          to: DEPAY,
          api: Token[blockchain].DEFAULT,
          method: 'transfer',
          params: [toAddress, tokenAmountOutBN]
        }
      })
       
      let routes = await route({
        accept: [{
          fromAddress,
          toAddress,
          blockchain,
          token: toToken,
          amount: tokenAmountOut,
        }]
      })

      let wallet = getWallet()
      let sentTransaction = await wallet.sendTransaction(routes[0].transaction)
      expect(sentTransaction.from).toEqual(accounts[0])
      expect(routeMock).toHaveBeenCalled()
    })

    it('performs ETH to TOKEN swap payments if it is the best option', async ()=>{

      mockBalance({ provider: provider(blockchain), blockchain, api: Token[blockchain].ERC20, token: DEPAY, account: fromAddress, balance: ethers.BigNumber.from('0') })

      let routeMock = mock({
        blockchain,
        transaction: {
          from: fromAddress,
          to: routers[blockchain].address,
          api: routers[blockchain].api,
          method: 'route',
          params: {
            path: [CONSTANTS[blockchain].NATIVE, DEPAY],
            amounts: [WETHAmountInBN, tokenAmountOutBN, anything],
            addresses: [fromAddress, toAddress],
            plugins: [plugins[blockchain].uniswap_v2.address, plugins[blockchain].payment.address],
            data: []  
          },
          value: 0
        }
      })

      let routes = await route({
        accept: [{
          fromAddress,
          toAddress,
          blockchain,
          token: toToken,
          amount: tokenAmountOut,
        }]
      })

      let wallet = getWallet()
      let sentTransaction = await wallet.sendTransaction(routes[0].transaction)
      expect(sentTransaction.from).toEqual(accounts[0])
      expect(routeMock).toHaveBeenCalled()
    })

    it('performs TOKEN_A to TOKEN_B swap payments if it is the best option', async ()=>{

      mockBalance({ provider: provider(blockchain), blockchain, api: Token[blockchain].ERC20, token: DEPAY, account: fromAddress, balance: ethers.BigNumber.from('0') })
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
            path: [DAI, CONSTANTS[blockchain].WRAPPED, DEPAY],
            amounts: [DAIAmountInBN, tokenAmountOutBN, anything],
            addresses: [fromAddress, toAddress],
            plugins: [plugins[blockchain].uniswap_v2.address, plugins[blockchain].payment.address],
            data: []  
          },
          value: 0
        }
      })

      let routes = await route({
        accept: [{
          fromAddress,
          toAddress,
          blockchain,
          token: toToken,
          amount: tokenAmountOut,
        }]
      })

      let wallet = getWallet()
      let sentTransaction = await wallet.sendTransaction(routes[0].transaction)
      expect(sentTransaction.from).toEqual(accounts[0])
      expect(routeMock).toHaveBeenCalled()
    })

    describe('NATIVE token payments', ()=> {

      beforeEach(()=> {
        toToken = CONSTANTS[blockchain].NATIVE        
      })

      it('performs direct ETH payments if it is the best option', async ()=>{

        mock({
          blockchain,
          balance: {
            for: fromAddress,
            return: tokenAmountOutBN.toString()
          }
        })

        let transactionMock = mock({
          blockchain,
          transaction: {
            from: fromAddress,
            to: toAddress,
            value: tokenAmountOutBN
          }
        })

        let routes = await route({
          accept: [{
            fromAddress,
            toAddress,
            blockchain,
            token: toToken,
            amount: tokenAmountOut,
          }]
        })

        let wallet = getWallet()
        let sentTransaction = await wallet.sendTransaction(routes[0].transaction)
        expect(sentTransaction.from).toEqual(accounts[0])
        expect(transactionMock).toHaveBeenCalled()
      })

      it('performs TOKEN to ETH swap payments if it is the best option', async ()=>{
        
        mock({
          blockchain,
          balance: {
            for: fromAddress,
            return: '0'
          }
        })

        mockAmounts({ provider: provider(blockchain), method: 'getAmountsIn', params: [tokenAmountOutBN, [DAI, WETH]], amounts: [DAIAmountInBN, tokenAmountOutBN] })

        let routeMock = mock({
          blockchain,
          transaction: {
            from: fromAddress,
            to: routers[blockchain].address,
            api: routers[blockchain].api,
            method: 'route',
            params: {
              path: [DAI, CONSTANTS[blockchain].NATIVE],
              amounts: [DAIAmountInBN, tokenAmountOutBN, anything],
              addresses: [fromAddress, toAddress],
              plugins: [plugins[blockchain].uniswap_v2.address, plugins[blockchain].payment.address],
              data: []  
            },
            value: 0
          }
        })

        let routes = await route({
          accept: [{
            fromAddress,
            toAddress,
            blockchain,
            token: toToken,
            amount: tokenAmountOut,
          }]
        })

        let wallet = getWallet()
        let sentTransaction = await wallet.sendTransaction(routes[0].transaction)
        expect(sentTransaction.from).toEqual(accounts[0])
        expect(routeMock).toHaveBeenCalled()
      })
    })
  })

  it('provides routes also for fromToken, fromAmount and toToken configuration', async ()=>{

    mockAmounts({ provider: provider(blockchain), method: 'getAmountsOut', params: [DAIAmountInBN, [DAI, WETH, DEPAY]], amounts: [DAIAmountInBN, WETHAmountInBN, tokenAmountOutBN] })

    let routes = await route({
      accept: [{
        fromAddress,
        toAddress,
        blockchain,
        fromToken: DAI,
        fromAmount: 0.3,
        toToken: toToken
      }]
    })

    expect(routes.length).toEqual(1)

    expect(routes[0].blockchain).toEqual(blockchain)
    expect(routes[0].fromToken.address).toEqual(DAI)
    expect(routes[0].toToken.address).toEqual(DEPAY)
    expect(routes[0].fromAmount).toEqual(DAIAmountInBN.toString())
    expect(routes[0].toAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[0].fromAddress).toEqual(fromAddress)
    expect(routes[0].toAddress).toEqual(toAddress)
    expect(routes[0].fromBalance).toEqual(DAIBalanceBN.toString())
    expect(routes[0].exchangeRoutes[0].tokenIn).toEqual(DAI)
    expect(routes[0].exchangeRoutes[0].tokenOut).toEqual(DEPAY)
    expect(routes[0].exchangeRoutes[0].path).toEqual([DAI, WETH, DEPAY])
    expect(routes[0].exchangeRoutes[0].amountIn).toEqual(DAIAmountInBN.toString())
    expect(routes[0].exchangeRoutes[0].amountOutMin).toEqual(tokenAmountOutBN.toString())
    expect(routes[0].exchangeRoutes[0].fromAddress).toEqual(fromAddress)
    expect(routes[0].exchangeRoutes[0].toAddress).toEqual(toAddress)
    expect(routes[0].exchangeRoutes[0].transaction.to).toEqual('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')
    expect(routes[0].exchangeRoutes[0].transaction.method).toEqual('swapExactTokensForTokens')
    expect(routes[0].exchangeRoutes[0].transaction.params.amountOutMin).toEqual(tokenAmountOutBN.toString())
    expect(routes[0].exchangeRoutes[0].transaction.params.path).toEqual([DAI, WETH, DEPAY])
    expect(routes[0].transaction.value).toEqual('0')
  });
})
