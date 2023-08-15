import Blockchains from '@depay/web3-blockchains'
import fetchMock from 'fetch-mock'
import routers from 'src/routers'
import { ethers } from 'ethers'
import { mock, resetMocks, anything } from '@depay/web3-mock'
import { mockAssets } from 'tests/mocks/api'
import { mockBasics, mockDecimals, mockBalance, mockAllowance } from 'tests/mocks/tokens'
import { mockPair, mockAmounts } from 'tests/mocks/UniswapV2'
import { resetCache, getProvider } from '@depay/web3-client'
import { route } from 'src'
import Token from '@depay/web3-tokens'

describe('fee', ()=> {

  let provider
  const blockchain = 'ethereum'
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']
  beforeEach(resetMocks)
  beforeEach(()=>mock({ blockchain, accounts: { return: accounts } }))
  beforeEach(resetCache)
  beforeEach(()=>fetchMock.reset())

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
  let DAIAmountInBN
  let tokenAmountOut
  let tokenOutDecimals
  let tokenAmountOutBN
  let fromAddress
  let toAddress
  let feeReceiver = '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'
  let transaction

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
    Blockchains[blockchain].stables.usd.forEach((stable)=>{
      mockPair({ blockchain, provider, pair: Blockchains[blockchain].zero, params: [stable, DEPAY] })
    })

    mockAmounts({ blockchain, provider, method: 'getAmountsIn', params: [tokenAmountOutBN, [WETH, DEPAY]], amounts: [WETHAmountInBN, tokenAmountOutBN] })
    mockAmounts({ blockchain, provider, method: 'getAmountsIn', params: [tokenAmountOutBN, [DAI, WETH, DEPAY]], amounts: [DAIAmountInBN, WETHAmountInBN, tokenAmountOutBN] })

    mockBalance({ provider, blockchain, api: Token[blockchain].ERC20, token: DAI, account: fromAddress, balance: DAIBalanceBN })
    mockBalance({ provider, blockchain, api: Token[blockchain].ERC20, token: DEPAY, account: fromAddress, balance: DEPAYBalanceBN })

    mockAllowance({ provider, blockchain, api: Token[blockchain].ERC20, token: DAI, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })
    mockAllowance({ provider, blockchain, api: Token[blockchain].ERC20, token: DEPAY, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })

    mock({ provider, blockchain, balance: { for: fromAddress, return: etherBalanceBN } })
  })

  describe('fee in percentage', ()=>{
    
    it('adds fee amount and fee receiver to payment route transaction', async ()=>{

      let routes = await route({
        accept: [{
          toAddress,
          blockchain,
          token: toToken,
          amount: tokenAmountOut,
          fee: {
            receiver: feeReceiver,
            amount: '9%'
          },
        }],
        from: { [blockchain]: fromAddress }
      })

      // not swapped
      transaction = await routes[0].getTransaction()
      expect(transaction.method).toEqual('pay')
      expect(transaction.params.payment.amountIn).toEqual('20000000000000000000')
      expect(transaction.params.payment.paymentAmount).toEqual('18200000000000000000')
      expect(transaction.params.payment.feeAmount).toEqual('1800000000000000000')
      expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
      expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)
      expect(routes[0].toAmount).toEqual('18200000000000000000')
      expect(routes[0].feeAmount).toEqual('1800000000000000000')

      // swapped
      transaction = await routes[1].getTransaction()
      expect(transaction.method).toEqual('pay')
      console.log('transaction.params', transaction.params)
      expect(transaction.params.payment.amountIn).toEqual('11055000000000000000')
      expect(transaction.params.payment.paymentAmount).toEqual('18200000000000000000')
      expect(transaction.params.payment.feeAmount).toEqual('1800000000000000000')
      expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
      expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)
      expect(routes[1].toAmount).toEqual('18200000000000000000')
      expect(routes[1].feeAmount).toEqual('1800000000000000000')

      // swapped
      transaction = await routes[2].getTransaction()
      expect(transaction.method).toEqual('pay')
      expect(transaction.params.payment.amountIn).toEqual('301500000000000000')
      expect(transaction.params.payment.paymentAmount).toEqual('18200000000000000000')
      expect(transaction.params.payment.feeAmount).toEqual('1800000000000000000')
      expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
      expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)
      expect(routes[2].toAmount).toEqual('18200000000000000000')
      expect(routes[2].feeAmount).toEqual('1800000000000000000')
    });

    it('allows for fees with decimals', async ()=>{

      let routes = await route({
        accept: [{
          toAddress,
          blockchain,
          token: toToken,
          amount: tokenAmountOut,
          fee: {
            receiver: feeReceiver,
            amount: '1.5%'
          },
        }],
        from: { [blockchain]: fromAddress }
      })

      // not swapped
      transaction = await routes[0].getTransaction()
      expect(transaction.method).toEqual('pay')
      expect(transaction.params.payment.amountIn).toEqual('20000000000000000000')
      expect(transaction.params.payment.paymentAmount).toEqual('19700000000000000000')
      expect(transaction.params.payment.feeAmount).toEqual('300000000000000000')
      expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
      expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)

      // swapped
      transaction = await routes[1].getTransaction()
      expect(transaction.method).toEqual('pay')
      expect(transaction.params.payment.amountIn).toEqual('11055000000000000000')
      expect(transaction.params.payment.paymentAmount).toEqual('19700000000000000000')
      expect(transaction.params.payment.feeAmount).toEqual('300000000000000000')
      expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
      expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)

      // swapped
      transaction = await routes[2].getTransaction()
      expect(transaction.method).toEqual('pay')
      expect(transaction.params.payment.amountIn).toEqual('301500000000000000')
      expect(transaction.params.payment.paymentAmount).toEqual('19700000000000000000')
      expect(transaction.params.payment.feeAmount).toEqual('300000000000000000')
      expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
      expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)
    });

    it('rounds fee amounts for small decimal tokens', async ()=>{

      let USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
      toToken = USDC
      tokenAmountOut = 1.0025
      tokenOutDecimals = 6
      tokenAmountOutBN = ethers.utils.parseUnits(tokenAmountOut.toString(), tokenOutDecimals)

      mockAssets({ blockchain, account: fromAddress, assets: [{
        "name": "USD Coin",
        "symbol": "USDC",
        "address": USDC,
        "type": "20"
      }]})

      provider = await getProvider(blockchain)
      mockBasics({ provider, blockchain, api: Token[blockchain].DEFAULT, token: USDC, decimals: 6, name: 'USD Coin', symbol: 'USDC' })
      mockPair({ blockchain, provider, pair: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc', params: [WETH, USDC] })
      Blockchains[blockchain].stables.usd.forEach((stable)=>{
        mockPair({ blockchain, provider, pair: Blockchains[blockchain].zero, params: [DEPAY, stable] })
        mockPair({ blockchain, provider, pair: Blockchains[blockchain].zero, params: [stable, WETH] })
      })
      mockPair({ blockchain, provider, pair: '0xAE461cA67B15dc8dc81CE7615e0320dA1A9aB8D5', params: [DAI, USDC] })
      mock({ provider, blockchain, balance: { for: fromAddress, return: '0' } })
      mockBalance({ provider, blockchain, api: Token[blockchain].ERC20, token: USDC, account: fromAddress, balance: '10000000' })
      mockAllowance({ provider, blockchain, api: Token[blockchain].ERC20, token: USDC, account: fromAddress, spender: routers[blockchain].address, allowance: MAXINTBN })
      mockBalance({ provider, blockchain, api: Token[blockchain].ERC20, token: WETH, account: fromAddress, balance: '0' })
      mockBalance({ provider, blockchain, api: Token[blockchain].ERC20, token: DAI, account: fromAddress, balance: '0' })

      let routes = await route({
        accept: [{
          toAddress,
          blockchain,
          token: toToken,
          amount: tokenAmountOut,
          fee: {
            receiver: feeReceiver,
            amount: '1.5%'
          },
        }],
        from: { [blockchain]: fromAddress }
      })

      // not swapped
      transaction = await routes[0].getTransaction()
      expect(transaction.method).toEqual('pay')
      expect(transaction.params.payment.amountIn).toEqual('1002500')
      expect(transaction.params.payment.paymentAmount).toEqual('987463')
      expect(transaction.params.payment.feeAmount).toEqual('15037')
      expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
      expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)
    });

    it('throws error if amount percentage has more than 1 decimal', async ()=>{

      expect(()=>{
        route({
          accept: [{
            toAddress,
            blockchain,
            token: toToken,
            amount: tokenAmountOut,
            fee: {
              receiver: feeReceiver,
              amount: '1.55%'
            },
          }],
          from: { [blockchain]: fromAddress }
        })  
      }).toThrow('Only up to 1 decimal is supported for fee amounts!')
    });
  })

  describe('fee in absolute numbers as pure number', ()=>{
    
    it('adds fee amount and fee receiver to payment route transaction', async ()=>{

      let routes = await route({
        accept: [{
          toAddress,
          blockchain,
          token: toToken,
          amount: tokenAmountOut,
          fee: {
            receiver: feeReceiver,
            amount: 1.8
          },
        }],
        from: { [blockchain]: fromAddress }
      })

      // not swapped
      transaction = await routes[0].getTransaction()
      expect(transaction.method).toEqual('pay')
      expect(transaction.params.payment.amountIn).toEqual('20000000000000000000')
      expect(transaction.params.payment.paymentAmount).toEqual('18200000000000000000')
      expect(transaction.params.payment.feeAmount).toEqual('1800000000000000000')
      expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
      expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)
      expect(routes[0].directTransfer).toEqual(false)

      // swapped
      transaction = await routes[1].getTransaction()
      expect(transaction.method).toEqual('pay')
      expect(transaction.params.payment.amountIn).toEqual('11055000000000000000')
      expect(transaction.params.payment.paymentAmount).toEqual('18200000000000000000')
      expect(transaction.params.payment.feeAmount).toEqual('1800000000000000000')
      expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
      expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)
      expect(routes[1].directTransfer).toEqual(false)

      // swapped
      transaction = await routes[2].getTransaction()
      expect(transaction.method).toEqual('pay')
      expect(transaction.params.payment.amountIn).toEqual('301500000000000000')
      expect(transaction.params.payment.paymentAmount).toEqual('18200000000000000000')
      expect(transaction.params.payment.feeAmount).toEqual('1800000000000000000')
      expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
      expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)
      expect(routes[2].directTransfer).toEqual(false)
    });
  })

  describe('fee in absolute numbers as BN string', ()=>{
    
    it('adds fee amount and fee receiver to payment route transaction', async ()=>{

      let routes = await route({
        accept: [{
          toAddress,
          blockchain,
          token: toToken,
          amount: tokenAmountOut,
          fee: {
            receiver: feeReceiver,
            amount: '1800000000000000000'
          },
        }],
        from: { [blockchain]: fromAddress }
      })

      // not swapped
      transaction = await routes[0].getTransaction()
      expect(transaction.method).toEqual('pay')
      expect(transaction.params.payment.amountIn).toEqual('20000000000000000000')
      expect(transaction.params.payment.paymentAmount).toEqual('18200000000000000000')
      expect(transaction.params.payment.feeAmount).toEqual('1800000000000000000')
      expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
      expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)

      // swapped
      transaction = await routes[1].getTransaction()
      expect(transaction.method).toEqual('pay')
      expect(transaction.params.payment.amountIn).toEqual('11055000000000000000')
      expect(transaction.params.payment.paymentAmount).toEqual('18200000000000000000')
      expect(transaction.params.payment.feeAmount).toEqual('1800000000000000000')
      expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
      expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)

      // swapped
      transaction = await routes[2].getTransaction()
      expect(transaction.method).toEqual('pay')
      expect(transaction.params.payment.amountIn).toEqual('301500000000000000')
      expect(transaction.params.payment.paymentAmount).toEqual('18200000000000000000')
      expect(transaction.params.payment.feeAmount).toEqual('1800000000000000000')
      expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
      expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)
    });
  })
})
