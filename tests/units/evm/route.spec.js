import Blockchains from '@depay/web3-blockchains'
import fetchMock from 'fetch-mock'
import routers from 'src/routers'
import Token from '@depay/web3-tokens'
import { ethers } from 'ethers'
import { getWallets } from '@depay/web3-wallets'
import { mock, resetMocks, anything } from '@depay/web3-mock'
import { mockAssets } from 'tests/mocks/api'
import { mockBasics, mockDecimals, mockBalance, mockAllowance } from 'tests/mocks/tokens'
import { mockPair, mockAmounts } from 'tests/mocks/UniswapV2'
import { resetCache, getProvider } from '@depay/web3-client'
import { route } from 'src'

describe('route', ()=> {

  let provider
  const blockchain = 'ethereum'
  const accounts = ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045']
  beforeEach(()=>{
    resetMocks()
    resetCache()
    fetchMock.reset()
    mock({ blockchain, accounts: { return: accounts } })
  })

  let DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
  let DEPAY = "0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb"
  let WETH = Blockchains[blockchain].wrapped.address
  let ETH = Blockchains[blockchain].currency.address
  let MAXINTBN = ethers.BigNumber.from(Blockchains[blockchain].maxInt)
  let etherBalanceBN
  let DAIBalanceBN
  let DEPAYBalanceBN
  let toToken
  let WETHAmountInBN
  let WETHAmountInSlippageBN
  let DAIAmountInBN
  let DAIAmountInSlippageBN
  let tokenAmountOut
  let tokenOutDecimals
  let tokenAmountOutBN
  let fromAddress
  let toAddress
  let transaction

  beforeEach(()=>{
    etherBalanceBN = ethers.BigNumber.from('18000000000000000000')
    DAIBalanceBN = ethers.BigNumber.from('310000000000000000')
    DEPAYBalanceBN = ethers.BigNumber.from('22000000000000000000')
    toToken = DEPAY
    WETHAmountInBN = ethers.BigNumber.from('11000000000000000000')
    WETHAmountInSlippageBN = ethers.BigNumber.from('55000000000000000')
    DAIAmountInBN = ethers.BigNumber.from('300000000000000000')
    DAIAmountInSlippageBN = ethers.BigNumber.from('1500000000000000')
    tokenAmountOut = 20
    tokenOutDecimals = 18
    tokenAmountOutBN = ethers.utils.parseUnits(tokenAmountOut.toString(), tokenOutDecimals)
    fromAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
    toAddress = '0x65aBbdEd9B937E38480A50eca85A8E4D2c8350E4'
  })

  beforeEach(async()=>{
    mock(blockchain)
    mockAssets({ blockchain, account: fromAddress, assets: [
      {
        "name": "Ether",
        "symbol": "ETH",
        "address": ETH,
        "type": "NATIVE",
        "decimals": 18
      }, {
        "name": "Dai Stablecoin",
        "symbol": "DAI",
        "address": DAI,
        "type": "20",
        "decimals": 18
      }, {
        "name": "DePay",
        "symbol": "DEPAY",
        "address": DEPAY,
        "type": "20",
        "decimals": 18
      }
    ]})

    provider = await getProvider(blockchain)
    Blockchains.findByName(blockchain).tokens.forEach((token)=>{
      if(token.type == '20') {
        mock({ request: { return: '0', to: token.address, api: Token[blockchain].DEFAULT, method: 'balanceOf', params: accounts[0] }, provider, blockchain })
      }
    })

    mockBasics({ provider, blockchain, api: Token[blockchain].DEFAULT, token: DEPAY, decimals: 18, name: 'DePay', symbol: 'DEPAY' })

    mockDecimals({ provider, blockchain, api: Token[blockchain].ERC20, token: DAI, decimals: 18 })

    mockPair({ blockchain, provider, pair: '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', params: [WETH, DEPAY] })
    mockPair({ blockchain, provider, pair: '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', params: [DEPAY, WETH] })
    mockPair({ blockchain, provider, pair: '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11', params: [DAI, WETH] })
    mockPair({ blockchain, provider, pair: Blockchains[blockchain].zero, params: [DAI, DEPAY] })

    mockAmounts({ blockchain, provider, method: 'getAmountsIn', params: [tokenAmountOutBN, [WETH, DEPAY]], amounts: [WETHAmountInBN, tokenAmountOutBN] })
    mockAmounts({ blockchain, provider, method: 'getAmountsIn', params: [tokenAmountOutBN, [DAI, WETH, DEPAY]], amounts: [DAIAmountInBN, WETHAmountInBN, tokenAmountOutBN] })

    mockBalance({ provider, blockchain, api: Token[blockchain].ERC20, token: DAI, account: fromAddress, balance: DAIBalanceBN })
    mockBalance({ provider, blockchain, api: Token[blockchain].ERC20, token: DEPAY, account: fromAddress, balance: DEPAYBalanceBN })

    mockAllowance({ provider, blockchain, api: Token[blockchain].ERC20, token: DAI, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })
    mockAllowance({ provider, blockchain, api: Token[blockchain].ERC20, token: DEPAY, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })

    mock({ provider, blockchain, balance: { for: fromAddress, return: etherBalanceBN } })
  })

  it('provides all possible payment routes based on wallet assets and decentralized exchange routes', async ()=>{

    let routes = await route({
      accept: [{
        blockchain,
        token: toToken,
        amount: tokenAmountOut,
        receiver: toAddress,
      }],
      from: { [blockchain]: fromAddress }
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
    transaction = await routes[0].getTransaction()
    expect(transaction.blockchain).toEqual(blockchain)
    expect(transaction.to).toEqual(DEPAY)
    expect(transaction.api).toEqual(Token[blockchain].DEFAULT)
    expect(transaction.method).toEqual('transfer')
    expect(transaction.params).toEqual([toAddress, tokenAmountOutBN.toString()])
    expect(transaction.value).toEqual('0')

    // ETH/WETH
    expect(routes[1].blockchain).toEqual(blockchain)
    expect(routes[1].fromToken.address).toEqual(ETH)
    expect(routes[1].toToken.address).toEqual(DEPAY)
    expect(routes[1].toAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[1].fromAmount).toEqual(WETHAmountInBN.add(WETHAmountInSlippageBN).toString())
    expect(routes[1].fromAddress).toEqual(fromAddress)
    expect(routes[1].toAddress).toEqual(toAddress)
    expect(routes[1].fromBalance).toEqual(etherBalanceBN.toString())
    expect(routes[1].exchangeRoutes[0].tokenIn).toEqual(ETH)
    expect(routes[1].exchangeRoutes[0].tokenOut).toEqual(DEPAY)
    expect(routes[1].exchangeRoutes[0].path).toEqual([ETH, WETH, DEPAY])
    expect(routes[1].exchangeRoutes[0].amountIn).toEqual(WETHAmountInBN.add(WETHAmountInSlippageBN).toString())
    expect(routes[1].exchangeRoutes[0].amountOutMin).toEqual(tokenAmountOutBN.toString())

    let exchangeTransaction = await routes[1].exchangeRoutes[0].getTransaction({ from: fromAddress })
    expect(exchangeTransaction.to).toEqual('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')
    expect(exchangeTransaction.method).toEqual('swapExactETHForTokens')
    expect(exchangeTransaction.params.amountOutMin).toEqual(tokenAmountOutBN.toString())
    expect(exchangeTransaction.params.path).toEqual([WETH, DEPAY])
    expect(exchangeTransaction.value).toEqual(WETHAmountInBN.add(WETHAmountInSlippageBN).toString())
    transaction = await routes[1].getTransaction()
    expect(transaction.value).toEqual(WETHAmountInBN.add(WETHAmountInSlippageBN).toString())

    // DAI
    expect(routes[2].blockchain).toEqual(blockchain)
    expect(routes[2].fromToken.address).toEqual(DAI)
    expect(routes[2].toToken.address).toEqual(DEPAY)
    expect(routes[2].toAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[2].fromAmount).toEqual(DAIAmountInBN.add(DAIAmountInSlippageBN).toString())
    expect(routes[2].fromAddress).toEqual(fromAddress)
    expect(routes[2].toAddress).toEqual(toAddress)
    expect(routes[2].fromBalance).toEqual(DAIBalanceBN.toString())
    expect(routes[2].exchangeRoutes[0].tokenIn).toEqual(DAI)
    expect(routes[2].exchangeRoutes[0].tokenOut).toEqual(DEPAY)
    expect(routes[2].exchangeRoutes[0].path).toEqual([DAI, WETH, DEPAY])
    expect(routes[2].exchangeRoutes[0].amountIn).toEqual(DAIAmountInBN.add(DAIAmountInSlippageBN).toString())
    expect(routes[2].exchangeRoutes[0].amountOutMin).toEqual(tokenAmountOutBN.toString())

    exchangeTransaction = await routes[2].exchangeRoutes[0].getTransaction({ from: fromAddress })
    expect(exchangeTransaction.to).toEqual('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')
    expect(exchangeTransaction.method).toEqual('swapExactTokensForTokens')
    expect(exchangeTransaction.params.amountOutMin).toEqual(tokenAmountOutBN.toString())
    expect(exchangeTransaction.params.path).toEqual([DAI, WETH, DEPAY])
    transaction = await routes[2].getTransaction()
    expect(transaction.value).toEqual('0')
  });

  it('filters routes that are not routable on any decentralized exchange', async ()=>{
    provider = await getProvider(blockchain)
    mockPair({ blockchain, provider, pair: Blockchains[blockchain].zero, params: [DAI, WETH] })

    let routes = await route({
      accept: [{
        blockchain,
        token: toToken.toLowerCase(),
        amount: tokenAmountOut,
        toAddress
      }],
      from: { [blockchain]: fromAddress }
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([DEPAY, ETH])
  })

  it('filters routes with insufficient balance', async ()=>{
    provider = await getProvider(blockchain)
    mockBalance({ provider, blockchain, api: Token[blockchain].ERC20, token: DAI, account: fromAddress, balance: ethers.BigNumber.from('290000000000000000') })

    let routes = await route({
      accept: [{
        blockchain,
        token: toToken,
        amount: tokenAmountOut,
        receiver: toAddress,
      }],
      from: { [blockchain]: fromAddress }
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([DEPAY, ETH])    
  })
  
  it('filters native token route if user has insufficient balance', async ()=>{
    mock({ blockchain, balance: { for: fromAddress, return: ethers.BigNumber.from('10000000000000000000') } })

    let routes = await route({
      accept: [{
        blockchain,
        token: toToken,
        amount: tokenAmountOut,
        receiver: toAddress,
      }],
      from: { [blockchain]: fromAddress }
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([DEPAY, DAI])
  })

  it('it first uses the direct token transfer, then native token and last other tokens', async ()=>{
    let routes = await route({
      accept: [{
        blockchain,
        token: toToken,
        amount: tokenAmountOut,
        receiver: toAddress,
      }],
      from: { [blockchain]: fromAddress }
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

    provider = await getProvider(blockchain)
    mockDecimals({ provider, blockchain, api: Token[blockchain].ERC20, token: USDC, decimals: 18 })
    mockPair({ blockchain, provider, pair: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc', params: [USDC, WETH] })
    mockPair({ blockchain, provider, pair: Blockchains[blockchain].zero, params: [USDC, DEPAY] })
    mockAmounts({ blockchain, provider, method: 'getAmountsIn', params: [tokenAmountOutBN, [USDC, WETH, DEPAY]], amounts: [USDCAmountInBN, WETHAmountInBN, tokenAmountOutBN] })
    mockBalance({ provider, blockchain, api: Token[blockchain].ERC20, token: USDC, account: fromAddress, balance: ethers.BigNumber.from('310000000000000000')})

    mockAllowance({ provider, blockchain, api: Token[blockchain].ERC20, token: USDC, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })
    mockAllowance({ provider, blockchain, api: Token[blockchain].ERC20, token: DAI, account: fromAddress, spender: routers[blockchain].address, allowance: ethers.BigNumber.from('0') })

    let routes = await route({
      accept: [{
        blockchain,
        token: toToken,
        amount: tokenAmountOut,
        receiver: toAddress,
      }],
      from: { [blockchain]: fromAddress }
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([DEPAY, ETH, USDC, DAI])
    expect(routes.map((route)=>route.approvalRequired)).toEqual([false, false, false, true])
    expect(routes.map((route)=>route.directTransfer)).toEqual([true, false, false, false])
  })

  it('sorts WRAPPED->NATIVE payments higher as swaps', async ()=>{

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
      },{
        "name": "Wrapped Ether",
        "symbol": "WETH",
        "address": WETH,
        "type": "20"
      }
    ]})

    provider = await getProvider(blockchain)
    mockDecimals({ provider, blockchain, api: Token[blockchain].ERC20, token: USDC, decimals: 18 })
    mockPair({ blockchain, provider, pair: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc', params: [USDC, WETH] })
    mockPair({ blockchain, provider, pair: Blockchains[blockchain].zero, params: [USDC, DEPAY] })
    mockAmounts({ blockchain, provider, method: 'getAmountsIn', params: [tokenAmountOutBN, [USDC, WETH]], amounts: [USDCAmountInBN, WETHAmountInBN, tokenAmountOutBN] })
    mockAmounts({ blockchain, provider, method: 'getAmountsIn', params: [tokenAmountOutBN, [DEPAY, WETH]], amounts: [USDCAmountInBN, WETHAmountInBN, tokenAmountOutBN] })
    mockAmounts({ blockchain, provider, method: 'getAmountsIn', params: [tokenAmountOutBN, [DAI, WETH]], amounts: [USDCAmountInBN, WETHAmountInBN, tokenAmountOutBN] })
    mockBalance({ provider, blockchain, api: Token[blockchain].ERC20, token: USDC, account: fromAddress, balance: ethers.BigNumber.from('310000000000000000')})
    mockBalance({ provider, blockchain, api: Token[blockchain].ERC20, token: WETH, account: fromAddress, balance: ethers.BigNumber.from('6000000000000000000000')})
    mock({ blockchain, balance: { for: fromAddress, return: '100000000000000000000' } })

    mockAllowance({ provider, blockchain, api: Token[blockchain].ERC20, token: WETH, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })
    mockAllowance({ provider, blockchain, api: Token[blockchain].ERC20, token: USDC, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })
    mockAllowance({ provider, blockchain, api: Token[blockchain].ERC20, token: DAI, account: fromAddress, spender: routers[blockchain].address, allowance: ethers.BigNumber.from('0') })

    let routes = await route({
      accept: [{
        blockchain,
        token: ETH,
        amount: tokenAmountOut,
        receiver: toAddress,
      }],
      from: { [blockchain]: fromAddress }
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([ETH, WETH, USDC, DEPAY, DAI])
    expect(routes.map((route)=>route.approvalRequired)).toEqual([false, false, false, false, true])
    expect(routes.map((route)=>route.directTransfer)).toEqual([true, false, false, false, false])
  })

  it('sorts NATIVE->WRAPPED payments higher as swaps', async ()=>{

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
      },{
        "name": "Wrapped Ether",
        "symbol": "WETH",
        "address": WETH,
        "type": "20"
      }
    ]})

    provider = await getProvider(blockchain)
    mockDecimals({ provider, blockchain, api: Token[blockchain].ERC20, token: USDC, decimals: 18 })
    mockPair({ blockchain, provider, pair: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc', params: [USDC, WETH] })
    mockPair({ blockchain, provider, pair: Blockchains[blockchain].zero, params: [USDC, DEPAY] })
    mockAmounts({ blockchain, provider, method: 'getAmountsIn', params: [tokenAmountOutBN, [USDC, WETH]], amounts: [USDCAmountInBN, WETHAmountInBN, tokenAmountOutBN] })
    mockAmounts({ blockchain, provider, method: 'getAmountsIn', params: [tokenAmountOutBN, [DEPAY, WETH]], amounts: [USDCAmountInBN, WETHAmountInBN, tokenAmountOutBN] })
    mockAmounts({ blockchain, provider, method: 'getAmountsIn', params: [tokenAmountOutBN, [DAI, WETH]], amounts: [USDCAmountInBN, WETHAmountInBN, tokenAmountOutBN] })
    mockBalance({ provider, blockchain, api: Token[blockchain].ERC20, token: USDC, account: fromAddress, balance: ethers.BigNumber.from('310000000000000000')})
    mockBalance({ provider, blockchain, api: Token[blockchain].ERC20, token: WETH, account: fromAddress, balance: ethers.BigNumber.from('6000000000000000000000')})
    mock({ blockchain, balance: { for: fromAddress, return: '100000000000000000000' } })

    mockAllowance({ provider, blockchain, api: Token[blockchain].ERC20, token: WETH, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })
    mockAllowance({ provider, blockchain, api: Token[blockchain].ERC20, token: USDC, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })
    mockAllowance({ provider, blockchain, api: Token[blockchain].ERC20, token: DAI, account: fromAddress, spender: routers[blockchain].address, allowance: ethers.BigNumber.from('0') })

    let routes = await route({
      accept: [{
        blockchain,
        token: WETH,
        amount: tokenAmountOut,
        receiver: toAddress,
      }],
      from: { [blockchain]: fromAddress }
    })

    expect(routes.map((route)=>route.fromToken.address)).toEqual([WETH, ETH, USDC, DEPAY, DAI])
    expect(routes.map((route)=>route.approvalRequired)).toEqual([false, false, false, false, true])
    expect(routes.map((route)=>route.directTransfer)).toEqual([true, false, false, false, false])
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
          blockchain,
          token: toToken,
          amount: tokenAmountOut,
          receiver: toAddress,
        }],
        from: { [blockchain]: fromAddress }
      })

      let wallet = (await getWallets())[0]
      let sentTransaction = await wallet.sendTransaction(await routes[0].getTransaction())
      expect(sentTransaction.from).toEqual(accounts[0])
      expect(routeMock).toHaveBeenCalled()
    })

    it('performs ETH to TOKEN swap payments if it is the best option', async ()=>{

      provider = await getProvider(blockchain)
      mockBalance({ provider, blockchain, api: Token[blockchain].ERC20, token: DEPAY, account: fromAddress, balance: ethers.BigNumber.from('0') })

      let routes = await route({
        accept: [{
          blockchain,
          token: toToken,
          amount: tokenAmountOut,
          receiver: toAddress,
        }],
        from: { [blockchain]: fromAddress }
      })

      let routeMock = mock({
        blockchain,
        transaction: {
          from: fromAddress,
          to: routers[blockchain].address,
          api: routers[blockchain].api,
          method: 'pay',
          params: {
            payment: {
              amountIn: WETHAmountInBN.add(WETHAmountInSlippageBN),
              permit2: false,
              paymentAmount: tokenAmountOutBN,
              feeAmount: 0,
              tokenInAddress: Blockchains[blockchain].currency.address,
              exchangeAddress: routes[0].exchangeRoutes[0].exchange[blockchain].router.address,
              tokenOutAddress: DEPAY,
              paymentReceiverAddress: toAddress,
              feeReceiverAddress: Blockchains[blockchain].zero,
              exchangeType: 1,
              receiverType: 0,
              exchangeCallData: anything,
              receiverCallData: Blockchains[blockchain].zero,
              deadline: anything,
            }
          },
          value: 0
        }
      })

      let wallet = (await getWallets())[0]
      let sentTransaction = await wallet.sendTransaction(await routes[0].getTransaction())
      expect(sentTransaction.from).toEqual(accounts[0])
      expect(routeMock).toHaveBeenCalled()
    })

    it('performs TOKEN_A to TOKEN_B swap payments if it is the best option', async ()=>{

      provider = await getProvider(blockchain)
      mockBalance({ provider, blockchain, api: Token[blockchain].ERC20, token: DEPAY, account: fromAddress, balance: ethers.BigNumber.from('0') })
      mock({
        blockchain,
        balance: {
          for: fromAddress,
          return: '0'
        }
      })

      let routes = await route({
        accept: [{
          blockchain,
          token: toToken,
          amount: tokenAmountOut,
          receiver: toAddress,
        }],
        from: { [blockchain]: fromAddress }
      })

      let routeMock = mock({
        blockchain,
        transaction: {
          from: fromAddress,
          to: routers[blockchain].address,
          api: routers[blockchain].api,
          method: 'pay',
          params: {
            payment: {
              amountIn: DAIAmountInBN.add(DAIAmountInSlippageBN),
              permit2: false,
              paymentAmount: tokenAmountOutBN,
              feeAmount: 0,
              tokenInAddress: DAI,
              exchangeAddress: routes[0].exchangeRoutes[0].exchange[blockchain].router.address,
              tokenOutAddress: DEPAY,
              paymentReceiverAddress: toAddress,
              feeReceiverAddress: Blockchains[blockchain].zero,
              exchangeType: 1,
              receiverType: 0,
              exchangeCallData: anything,
              receiverCallData: Blockchains[blockchain].zero,
              deadline: anything,
            }
          },
          value: 0
        }
      })

      let wallet = (await getWallets())[0]
      let sentTransaction = await wallet.sendTransaction(await routes[0].getTransaction())
      expect(sentTransaction.from).toEqual(accounts[0])
      expect(routeMock).toHaveBeenCalled()
    })

    describe('NATIVE token payments', ()=> {

      beforeEach(()=> {
        toToken = Blockchains[blockchain].currency.address        
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
            blockchain,
            token: toToken,
            amount: tokenAmountOut,
            receiver: toAddress,
          }],
          from: { [blockchain]: fromAddress }
        })

        let wallet = (await getWallets())[0]
        let sentTransaction = await wallet.sendTransaction(await routes[0].getTransaction())
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

        provider = await getProvider(blockchain)
        mockAmounts({ blockchain, provider, method: 'getAmountsIn', params: [tokenAmountOutBN, [DAI, WETH]], amounts: [DAIAmountInBN, tokenAmountOutBN] })

        let routes = await route({
          accept: [{
            blockchain,
            token: toToken,
            amount: tokenAmountOut,
            receiver: toAddress,
          }],
          from: { [blockchain]: fromAddress }
        })

        let routeMock = mock({
          blockchain,
          transaction: {
            from: fromAddress,
            to: routers[blockchain].address,
            api: routers[blockchain].api,
            method: 'pay',
            params: {
              payment: {
                amountIn: DAIAmountInBN.add(DAIAmountInSlippageBN),
                permit2: false,
                paymentAmount: tokenAmountOutBN,
                feeAmount: 0,
                tokenInAddress: DAI,
                exchangeAddress: routes[0].exchangeRoutes[0].exchange[blockchain].router.address,
                tokenOutAddress: Blockchains[blockchain].currency.address,
                paymentReceiverAddress: toAddress,
                feeReceiverAddress: Blockchains[blockchain].zero,
                exchangeType: 1,
                receiverType: 0,
                exchangeCallData: anything,
                receiverCallData: Blockchains[blockchain].zero,
                deadline: anything,
              }
            },
            value: 0
          }
        })

        let wallet = (await getWallets())[0]
        let sentTransaction = await wallet.sendTransaction(await routes[0].getTransaction())
        expect(sentTransaction.from).toEqual(accounts[0])
        expect(routeMock).toHaveBeenCalled()
      })
    })
  })
})
