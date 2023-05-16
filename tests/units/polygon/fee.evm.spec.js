import Blockchains from '@depay/web3-blockchains'
import fetchMock from 'fetch-mock'
import { ethers } from 'ethers'
import { mock, resetMocks, anything } from '@depay/web3-mock'
import { mockAssets } from 'tests/mocks/api'
import { mockBasics, mockDecimals, mockBalance, mockAllowance } from 'tests/mocks/tokens'
import { mockPair, mockAmounts } from 'tests/mocks/QuickSwap'
import { resetCache, getProvider } from '@depay/web3-client-evm'
import { route, plugins, routers } from 'dist/esm/index.evm'
import { Token } from '@depay/web3-tokens-evm'

describe('fee', ()=> {

  let provider
  const blockchain = 'polygon'
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

    mockPair(provider, '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', [WETH, DEPAY])
    mockPair(provider, '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', [DEPAY, WETH])
    mockPair(provider, '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11', [DAI, WETH])
    mockPair(provider, Blockchains[blockchain].zero, [DAI, DEPAY])

    mockAmounts({ provider, method: 'getAmountsIn', params: [tokenAmountOutBN, [WETH, DEPAY]], amounts: [WETHAmountInBN, tokenAmountOutBN] })
    mockAmounts({ provider, method: 'getAmountsIn', params: [tokenAmountOutBN, [DAI, WETH, DEPAY]], amounts: [DAIAmountInBN, WETHAmountInBN, tokenAmountOutBN] })

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
      expect(transaction.method).toEqual('route')
      expect(transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(transaction.params.amounts).toEqual(['20000000000000000000', '18200000000000000000', '0', '0', '1800000000000000000'])
      expect(transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])
      expect(routes[0].toAmount).toEqual('18200000000000000000')
      expect(routes[0].feeAmount).toEqual('1800000000000000000')

      // swapped
      transaction = await routes[1].getTransaction()
      expect(transaction.method).toEqual('route')
      expect(transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(transaction.params.amounts[0]).toEqual('11055000000000000000')
      expect(transaction.params.amounts[1]).toEqual('18200000000000000000')
      expect(transaction.params.amounts[4]).toEqual('1800000000000000000')
      expect(transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])
      expect(routes[1].toAmount).toEqual('18200000000000000000')
      expect(routes[1].feeAmount).toEqual('1800000000000000000')

      // swapped
      transaction = await routes[2].getTransaction()
      expect(transaction.method).toEqual('route')
      expect(transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(transaction.params.amounts[0]).toEqual('301500000000000000')
      expect(transaction.params.amounts[1]).toEqual('18200000000000000000')
      expect(transaction.params.amounts[4]).toEqual('1800000000000000000')
      expect(transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])
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
      expect(transaction.method).toEqual('route')
      expect(transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(transaction.params.amounts).toEqual(['20000000000000000000', '19700000000000000000', '0', '0', '300000000000000000'])
      expect(transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])

      // swapped
      transaction = await routes[1].getTransaction()
      expect(transaction.method).toEqual('route')
      expect(transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(transaction.params.amounts[0]).toEqual('11055000000000000000')
      expect(transaction.params.amounts[1]).toEqual('19700000000000000000')
      expect(transaction.params.amounts[4]).toEqual('300000000000000000')
      expect(transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])

      // swapped
      transaction = await routes[2].getTransaction()
      expect(transaction.method).toEqual('route')
      expect(transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(transaction.params.amounts[0]).toEqual('301500000000000000')
      expect(transaction.params.amounts[1]).toEqual('19700000000000000000')
      expect(transaction.params.amounts[4]).toEqual('300000000000000000')
      expect(transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])
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
      expect(transaction.method).toEqual('route')
      expect(routes[0].directTransfer).toEqual(false)
      expect(transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(transaction.params.amounts).toEqual(['20000000000000000000', '18200000000000000000', '0', '0', '1800000000000000000'])
      expect(transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])

      // swapped
      transaction = await routes[1].getTransaction()
      expect(transaction.method).toEqual('route')
      expect(routes[0].directTransfer).toEqual(false)
      expect(transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(transaction.params.amounts[0]).toEqual('11055000000000000000')
      expect(transaction.params.amounts[1]).toEqual('18200000000000000000')
      expect(transaction.params.amounts[4]).toEqual('1800000000000000000')
      expect(transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])

      // swapped
      transaction = await routes[2].getTransaction()
      expect(transaction.method).toEqual('route')
      expect(routes[0].directTransfer).toEqual(false)
      expect(transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(transaction.params.amounts[0]).toEqual('301500000000000000')
      expect(transaction.params.amounts[1]).toEqual('18200000000000000000')
      expect(transaction.params.amounts[4]).toEqual('1800000000000000000')
      expect(transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])
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
      expect(transaction.method).toEqual('route')
      expect(transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(transaction.params.amounts).toEqual(['20000000000000000000', '18200000000000000000', '0', '0', '1800000000000000000'])
      expect(transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])

      // swapped
      transaction = await routes[1].getTransaction()
      expect(transaction.method).toEqual('route')
      expect(transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(transaction.params.amounts[0]).toEqual('11055000000000000000')
      expect(transaction.params.amounts[1]).toEqual('18200000000000000000')
      expect(transaction.params.amounts[4]).toEqual('1800000000000000000')
      expect(transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])

      // swapped
      transaction = await routes[2].getTransaction()
      expect(transaction.method).toEqual('route')
      expect(transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(transaction.params.amounts[0]).toEqual('301500000000000000')
      expect(transaction.params.amounts[1]).toEqual('18200000000000000000')
      expect(transaction.params.amounts[4]).toEqual('1800000000000000000')
      expect(transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])
    });
  })
})
