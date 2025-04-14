import Blockchains from '@depay/web3-blockchains'
import fetchMock from 'fetch-mock'
import routers from 'src/routers'
import { ethers } from 'ethers'
import { mock, resetMocks, anything } from '@depay/web3-mock'
import { mockBestRoute, mockAllRoutes } from 'tests/mocks/api'
import { mockBasics, mockDecimals, mockBalance, mockAllowance } from 'tests/mocks/tokens'
import { mockPair, mockAmounts } from 'tests/mocks/UniswapV2'
import { resetCache, getProvider } from '@depay/web3-client'
import { route } from 'src'
import Token from '@depay/web3-tokens'

describe('fee', ()=> {

  let provider
  const blockchain = 'ethereum'
  const accounts = ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045']
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
  let fromAccounts
  let toAddress
  let feeReceiver = '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'
  let feeReceiver2 = '0x1dCf54C768352d5A5be0F08891262fd0E53A37ce'
  let transaction
  let bestRoute 
  let allRoutes
  let accept

  beforeEach(resetMocks)
  beforeEach(()=>mock({ blockchain, accounts: { return: accounts } }))
  beforeEach(resetCache)
  beforeEach(()=>fetchMock.reset())

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
    fromAccounts = { [blockchain]: fromAddress }
    toAddress = '0x65aBbdEd9B937E38480A50eca85A8E4D2c8350E4'
  })

  beforeEach(async()=>{
    mock(blockchain)

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

    mockAllowance({ provider, blockchain, api: Token[blockchain].ERC20, token: DAI, account: fromAddress, spender: Blockchains[blockchain].permit2, allowance: MAXINTBN })
    mockAllowance({ provider, blockchain, api: Token[blockchain].ERC20, token: DEPAY, account: fromAddress, spender: Blockchains[blockchain].permit2, allowance: MAXINTBN })

    mock({ provider, blockchain, balance: { for: fromAddress, return: etherBalanceBN } })

    accept = [{ amount: tokenAmountOut, blockchain, token: toToken, receiver: toAddress }]

    bestRoute = {
      "blockchain": "ethereum",
      "fromToken": DEPAY,
      "fromAmount": tokenAmountOutBN.toString(),
      "toToken": DEPAY,
      "toAmount": tokenAmountOutBN.toString(),
      "fromDecimals": 18,
      "fromName": "DePay",
      "fromSymbol": "DEPAY",
      "toDecimals": 18,
      "toName": "DePay",
      "toSymbol": "DEPAY"
    }
    allRoutes = [
      bestRoute,
      {
        "blockchain": "ethereum",
        "fromToken": ETH,
        "fromAmount": WETHAmountInBN.toString(),
        "toToken": DEPAY,
        "toAmount": tokenAmountOutBN.toString(),
        "fromDecimals": 18,
        "fromName": "Ether",
        "fromSymbol": "ETH",
        "toDecimals": 18,
        "toName": "DePay",
        "toSymbol": "DEPAY",
        "pairsData": [{ "id": "0x", "exchange": "uniswap_v2" }]
      },
      {
        "blockchain": "ethereum",
        "fromToken": DAI,
        "fromAmount": DAIAmountInBN.toString(),
        "toToken": DEPAY,
        "toAmount": tokenAmountOutBN.toString(),
        "fromDecimals": 18,
        "fromName": "DAI",
        "fromSymbol": "DAI",
        "toDecimals": 18,
        "toName": "DePay",
        "toSymbol": "DEPAY",
        "pairsData": [{ "id": "0x", "exchange": "uniswap_v2" }]
      },
    ]

    mockBestRoute({ fromAccounts, accept, route: bestRoute })
    mockAllRoutes({ fromAccounts, accept, routes: allRoutes })
  })

  describe('fee in percentage', ()=>{
    
    it('adds fee amount and fee receiver to payment route transaction', async ()=>{

      let routes = await route({
        accept: [{
          blockchain,
          token: toToken,
          amount: tokenAmountOut,
          receiver: toAddress,
          fee: {
            receiver: feeReceiver,
            amount: '9%'
          },
        }],
        from: fromAccounts
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
          receiver: toAddress,
          blockchain,
          token: toToken,
          amount: tokenAmountOut,
          fee: {
            receiver: feeReceiver,
            amount: '1.5%'
          },
        }],
        from: fromAccounts
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

      bestRoute = {
        "blockchain": "ethereum",
        "fromToken": USDC,
        "fromAmount": tokenAmountOutBN.toString(),
        "toToken": USDC,
        "toAmount": tokenAmountOutBN.toString(),
        "fromDecimals": 18,
        "fromName": "DePay",
        "fromSymbol": "DEPAY",
        "toDecimals": 18,
        "toName": "DePay",
        "toSymbol": "DEPAY"
      }

      mockBestRoute({ fromAccounts, accept: [{ amount: tokenAmountOut, blockchain, token: toToken, receiver: toAddress }], route: bestRoute })
      mockAllRoutes({ fromAccounts, accept: [{ amount: tokenAmountOut, blockchain, token: toToken, receiver: toAddress }], routes: [bestRoute] })

      let routes = await route({
        accept: [{
          receiver: toAddress,
          blockchain,
          token: toToken,
          amount: tokenAmountOut,
          fee: {
            receiver: feeReceiver,
            amount: '1.5%'
          },
        }],
        from: fromAccounts
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

    it('throws error if any fee percentage has more than 1 decimal', async ()=>{

      expect(()=>{
        route({
          accept: [{
            receiver: toAddress,
            blockchain,
            token: toToken,
            amount: tokenAmountOut,
            fee: {
              receiver: feeReceiver,
              amount: '1.55%'
            },
          }],
          from: fromAccounts
        })  
      }).toThrow('Only up to 1 decimal is supported for fee amounts in percent!')

      expect(()=>{
        route({
          accept: [{
            receiver: toAddress,
            blockchain,
            token: toToken,
            amount: tokenAmountOut,
            fee2: {
              receiver: feeReceiver,
              amount: '1.55%'
            },
          }],
          from: fromAccounts
        })  
      }).toThrow('Only up to 1 decimal is supported for fee amounts in percent!')

      expect(()=>{
        route({
          accept: [{
            receiver: toAddress,
            blockchain,
            token: toToken,
            amount: tokenAmountOut,
            protocolFee: '1.55%'
          }],
          from: fromAccounts
        })  
      }).toThrow('Only up to 1 decimal is supported for fee amounts in percent!')
    });

    it('throws error if any fee amount is 0', async ()=>{

      expect(()=>{
        route({
          accept: [{
            receiver: toAddress,
            blockchain,
            token: toToken,
            amount: tokenAmountOut,
            fee: {
              receiver: feeReceiver,
              amount: '0'
            },
          }],
          from: fromAccounts
        })  
      }).toThrow('Zero fee is not possible!')

      expect(()=>{
        route({
          accept: [{
            receiver: toAddress,
            blockchain,
            token: toToken,
            amount: tokenAmountOut,
            fee2: {
              receiver: feeReceiver,
              amount: '0'
            },
          }],
          from: fromAccounts
        })  
      }).toThrow('Zero fee is not possible!')

      expect(()=>{
        route({
          accept: [{
            receiver: toAddress,
            blockchain,
            token: toToken,
            amount: tokenAmountOut,
            protocolFee: '0'
          }],
          from: fromAccounts
        })  
      }).toThrow('Zero fee is not possible!')

      expect(()=>{
        route({
          accept: [{
            receiver: toAddress,
            blockchain,
            token: toToken,
            amount: tokenAmountOut,
            fee: {
              receiver: feeReceiver,
              amount: 0
            },
          }],
          from: fromAccounts
        })  
      }).toThrow('Zero fee is not possible!')

      expect(()=>{
        route({
          accept: [{
            receiver: toAddress,
            blockchain,
            token: toToken,
            amount: tokenAmountOut,
            fee2: {
              receiver: feeReceiver,
              amount: 0
            },
          }],
          from: fromAccounts
        })  
      }).toThrow('Zero fee is not possible!')

      expect(()=>{
        route({
          accept: [{
            receiver: toAddress,
            blockchain,
            token: toToken,
            amount: tokenAmountOut,
            protocolFee: 0
          }],
          from: fromAccounts
        })  
      }).toThrow('Zero fee is not possible!')
    });
  })

  describe('fee in absolute numbers as pure number', ()=>{
    
    it('adds fee amount and fee receiver to payment route transaction', async ()=>{

      let routes = await route({
        accept: [{
          receiver: toAddress,
          blockchain,
          token: toToken,
          amount: tokenAmountOut,
          fee: {
            receiver: feeReceiver,
            amount: 1.8
          },
        }],
        from: fromAccounts
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

  describe('fee in absolute numbers as BN string', ()=>{
    
    it('adds fee amount and fee receiver to payment route transaction', async ()=>{

      let routes = await route({
        accept: [{
          receiver: toAddress,
          blockchain,
          token: toToken,
          amount: tokenAmountOut,
          fee: {
            receiver: feeReceiver,
            amount: '1800000000000000000'
          },
        }],
        from: fromAccounts
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

  describe('fee + fee2 + protocolFee', ()=>{

    describe('as BN', ()=>{

      it('adds all 3 fee amounts and fee receivers to payment route transaction', async ()=>{

        let routes = await route({
          accept: [{
            receiver: toAddress,
            blockchain,
            token: toToken,
            amount: tokenAmountOut,
            fee: {
              receiver: feeReceiver,
              amount: '1800000000000000000'
            },
            fee2: {
              receiver: feeReceiver2,
              amount: '1200000000000000000'
            },
            protocolFee: '1100000000000000000',
          }],
          from: fromAccounts
        })

        // not swapped
        transaction = await routes[0].getTransaction()
        expect(transaction.method).toEqual('pay')
        expect(transaction.params.payment.amountIn).toEqual('20000000000000000000')
        expect(transaction.params.payment.paymentAmount).toEqual('15900000000000000000')
        expect(transaction.params.payment.feeAmount).toEqual('1800000000000000000')
        expect(transaction.params.payment.feeAmount2).toEqual('1200000000000000000')
        expect(transaction.params.payment.protocolAmount).toEqual('1100000000000000000')
        expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
        expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)
        expect(transaction.params.payment.feeReceiverAddress2).toEqual(feeReceiver2)

        // swapped
        transaction = await routes[1].getTransaction()
        expect(transaction.method).toEqual('pay')
        expect(transaction.params.payment.amountIn).toEqual('11055000000000000000')
        expect(transaction.params.payment.paymentAmount).toEqual('15900000000000000000')
        expect(transaction.params.payment.feeAmount).toEqual('1800000000000000000')
        expect(transaction.params.payment.feeAmount2).toEqual('1200000000000000000')
        expect(transaction.params.payment.protocolAmount).toEqual('1100000000000000000')
        expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
        expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)
        expect(transaction.params.payment.feeReceiverAddress2).toEqual(feeReceiver2)

        // swapped
        transaction = await routes[2].getTransaction()
        expect(transaction.method).toEqual('pay')
        expect(transaction.params.payment.amountIn).toEqual('301500000000000000')
        expect(transaction.params.payment.paymentAmount).toEqual('15900000000000000000')
        expect(transaction.params.payment.feeAmount).toEqual('1800000000000000000')
        expect(transaction.params.payment.feeAmount2).toEqual('1200000000000000000')
        expect(transaction.params.payment.protocolAmount).toEqual('1100000000000000000')
        expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
        expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)
        expect(transaction.params.payment.feeReceiverAddress2).toEqual(feeReceiver2)
      });
    })

    describe('as number', ()=>{
      
      it('adds all 3 fee amounts and fee receivers to payment route transaction', async ()=>{

        let routes = await route({
          accept: [{
            receiver: toAddress,
            blockchain,
            token: toToken,
            amount: tokenAmountOut,
            fee: {
              receiver: feeReceiver,
              amount: 1.8
            },
            fee2: {
              receiver: feeReceiver2,
              amount: 1.2
            },
            protocolFee: 1.1,
          }],
          from: fromAccounts
        })

        // not swapped
        transaction = await routes[0].getTransaction()
        expect(transaction.method).toEqual('pay')
        expect(transaction.params.payment.amountIn).toEqual('20000000000000000000')
        expect(transaction.params.payment.paymentAmount).toEqual('15900000000000000000')
        expect(transaction.params.payment.feeAmount).toEqual('1800000000000000000')
        expect(transaction.params.payment.feeAmount2).toEqual('1200000000000000000')
        expect(transaction.params.payment.protocolAmount).toEqual('1100000000000000000')
        expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
        expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)
        expect(transaction.params.payment.feeReceiverAddress2).toEqual(feeReceiver2)

        // swapped
        transaction = await routes[1].getTransaction()
        expect(transaction.method).toEqual('pay')
        expect(transaction.params.payment.amountIn).toEqual('11055000000000000000')
        expect(transaction.params.payment.paymentAmount).toEqual('15900000000000000000')
        expect(transaction.params.payment.feeAmount).toEqual('1800000000000000000')
        expect(transaction.params.payment.feeAmount2).toEqual('1200000000000000000')
        expect(transaction.params.payment.protocolAmount).toEqual('1100000000000000000')
        expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
        expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)
        expect(transaction.params.payment.feeReceiverAddress2).toEqual(feeReceiver2)

        // swapped
        transaction = await routes[2].getTransaction()
        expect(transaction.method).toEqual('pay')
        expect(transaction.params.payment.amountIn).toEqual('301500000000000000')
        expect(transaction.params.payment.paymentAmount).toEqual('15900000000000000000')
        expect(transaction.params.payment.feeAmount).toEqual('1800000000000000000')
        expect(transaction.params.payment.feeAmount2).toEqual('1200000000000000000')
        expect(transaction.params.payment.protocolAmount).toEqual('1100000000000000000')
        expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
        expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)
        expect(transaction.params.payment.feeReceiverAddress2).toEqual(feeReceiver2)
      });
    })

    describe('as percentage', ()=>{

      it('adds all 3 fee amounts and fee receivers to payment route transaction', async ()=>{

        let routes = await route({
          accept: [{
            receiver: toAddress,
            blockchain,
            token: toToken,
            amount: tokenAmountOut,
            fee: {
              receiver: feeReceiver,
              amount: '2%'
            },
            fee2: {
              receiver: feeReceiver2,
              amount: '1%'
            },
            protocolFee: '1.5%',
          }],
          from: fromAccounts
        })

        // not swapped
        transaction = await routes[0].getTransaction()
        expect(transaction.method).toEqual('pay')
        expect(transaction.params.payment.amountIn).toEqual('20000000000000000000')
        expect(transaction.params.payment.paymentAmount).toEqual('19100000000000000000')
        expect(transaction.params.payment.feeAmount).toEqual('400000000000000000')
        expect(transaction.params.payment.feeAmount2).toEqual('200000000000000000')
        expect(transaction.params.payment.protocolAmount).toEqual('300000000000000000')
        expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
        expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)
        expect(transaction.params.payment.feeReceiverAddress2).toEqual(feeReceiver2)

        // swapped
        transaction = await routes[1].getTransaction()
        expect(transaction.method).toEqual('pay')
        expect(transaction.params.payment.amountIn).toEqual('11055000000000000000')
        expect(transaction.params.payment.paymentAmount).toEqual('19100000000000000000')
        expect(transaction.params.payment.feeAmount).toEqual('400000000000000000')
        expect(transaction.params.payment.feeAmount2).toEqual('200000000000000000')
        expect(transaction.params.payment.protocolAmount).toEqual('300000000000000000')
        expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
        expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)
        expect(transaction.params.payment.feeReceiverAddress2).toEqual(feeReceiver2)

        // swapped
        transaction = await routes[2].getTransaction()
        expect(transaction.method).toEqual('pay')
        expect(transaction.params.payment.amountIn).toEqual('301500000000000000')
        expect(transaction.params.payment.paymentAmount).toEqual('19100000000000000000')
        expect(transaction.params.payment.feeAmount).toEqual('400000000000000000')
        expect(transaction.params.payment.feeAmount2).toEqual('200000000000000000')
        expect(transaction.params.payment.protocolAmount).toEqual('300000000000000000')
        expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
        expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)
        expect(transaction.params.payment.feeReceiverAddress2).toEqual(feeReceiver2)
      });
      
    })

    describe('mixed', ()=>{
      
      it('adds all 3 fee amounts and fee receivers to payment route transaction', async ()=>{

        let routes = await route({
          accept: [{
            receiver: toAddress,
            blockchain,
            token: toToken,
            amount: tokenAmountOut,
            fee: {
              receiver: feeReceiver,
              amount: 2
            },
            fee2: {
              receiver: feeReceiver2,
              amount: '1%'
            },
            protocolFee: '300000000000000000',
          }],
          from: fromAccounts
        })

        // not swapped
        transaction = await routes[0].getTransaction()
        expect(transaction.method).toEqual('pay')
        expect(transaction.params.payment.amountIn).toEqual('20000000000000000000')
        expect(transaction.params.payment.paymentAmount).toEqual('17500000000000000000')
        expect(transaction.params.payment.feeAmount).toEqual('2000000000000000000')
        expect(transaction.params.payment.feeAmount2).toEqual('200000000000000000')
        expect(transaction.params.payment.protocolAmount).toEqual('300000000000000000')
        expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
        expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)
        expect(transaction.params.payment.feeReceiverAddress2).toEqual(feeReceiver2)

        // swapped
        transaction = await routes[1].getTransaction()
        expect(transaction.method).toEqual('pay')
        expect(transaction.params.payment.amountIn).toEqual('11055000000000000000')
        expect(transaction.params.payment.paymentAmount).toEqual('17500000000000000000')
        expect(transaction.params.payment.feeAmount).toEqual('2000000000000000000')
        expect(transaction.params.payment.feeAmount2).toEqual('200000000000000000')
        expect(transaction.params.payment.protocolAmount).toEqual('300000000000000000')
        expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
        expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)
        expect(transaction.params.payment.feeReceiverAddress2).toEqual(feeReceiver2)

        // swapped
        transaction = await routes[2].getTransaction()
        expect(transaction.method).toEqual('pay')
        expect(transaction.params.payment.amountIn).toEqual('301500000000000000')
        expect(transaction.params.payment.paymentAmount).toEqual('17500000000000000000')
        expect(transaction.params.payment.feeAmount).toEqual('2000000000000000000')
        expect(transaction.params.payment.feeAmount2).toEqual('200000000000000000')
        expect(transaction.params.payment.protocolAmount).toEqual('300000000000000000')
        expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
        expect(transaction.params.payment.feeReceiverAddress).toEqual(feeReceiver)
        expect(transaction.params.payment.feeReceiverAddress2).toEqual(feeReceiver2)
      });

    })
  })
})
