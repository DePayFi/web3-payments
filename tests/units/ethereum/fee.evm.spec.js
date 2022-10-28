import fetchMock from 'fetch-mock'
import plugins from 'src/plugins'
import routers from 'src/routers'
import { Blockchain } from '@depay/web3-blockchains'
import { CONSTANTS } from '@depay/web3-constants'
import { ethers } from 'ethers'
import { mock, resetMocks, anything } from '@depay/web3-mock'
import { mockAssets } from 'tests/mocks/api'
import { mockBasics, mockDecimals, mockBalance, mockAllowance } from 'tests/mocks/tokens'
import { mockPair, mockAmounts } from 'tests/mocks/UniswapV2'
import { resetCache, getProvider } from '@depay/web3-client-evm'
import { route } from 'src/index.evm'
import { Token } from '@depay/web3-tokens-evm'

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
  let feeReceiver = '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'

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
    Blockchain.findByName(blockchain).tokens.forEach((token)=>{
      if(token.type == '20') {
        mock({ request: { return: '0', to: token.address, api: Token[blockchain].DEFAULT, method: 'balanceOf', params: accounts[0] }, provider, blockchain })
      }
    })

    mockBasics({ provider, blockchain, api: Token[blockchain].DEFAULT, token: DEPAY, decimals: 18, name: 'DePay', symbol: 'DEPAY' })

    mockDecimals({ provider, blockchain, api: Token[blockchain].ERC20, token: DAI, decimals: 18 })

    mockPair(provider, '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', [WETH, DEPAY])
    mockPair(provider, '0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', [DEPAY, WETH])
    mockPair(provider, '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11', [DAI, WETH])
    mockPair(provider, CONSTANTS[blockchain].ZERO, [DAI, DEPAY])

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
          amount: tokenAmountOut
        }],
        fee: {
          receiver: feeReceiver,
          amount: '9%'
        },
        from: { [blockchain]: fromAddress }
      })

      // not swapped
      expect(routes[0].transaction.method).toEqual('route')
      expect(routes[0].transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(routes[0].transaction.params.amounts).toEqual(['20000000000000000000', '18200000000000000000', '0', '0', '1800000000000000000'])
      expect(routes[0].transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])
      expect(routes[0].toAmount).toEqual('18200000000000000000')
      expect(routes[0].feeAmount).toEqual('1800000000000000000')

      // swapped
      expect(routes[1].transaction.method).toEqual('route')
      expect(routes[1].transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(routes[1].transaction.params.amounts[0]).toEqual('11055000000000000000')
      expect(routes[1].transaction.params.amounts[1]).toEqual('18200000000000000000')
      expect(routes[1].transaction.params.amounts[4]).toEqual('1800000000000000000')
      expect(routes[1].transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])
      expect(routes[1].toAmount).toEqual('18200000000000000000')
      expect(routes[1].feeAmount).toEqual('1800000000000000000')

      // swapped
      expect(routes[2].transaction.method).toEqual('route')
      expect(routes[2].transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(routes[2].transaction.params.amounts[0]).toEqual('301500000000000000')
      expect(routes[2].transaction.params.amounts[1]).toEqual('18200000000000000000')
      expect(routes[2].transaction.params.amounts[4]).toEqual('1800000000000000000')
      expect(routes[2].transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])
      expect(routes[2].toAmount).toEqual('18200000000000000000')
      expect(routes[2].feeAmount).toEqual('1800000000000000000')
    });

    it('allows for fees with decimals', async ()=>{

      let routes = await route({
        accept: [{
          toAddress,
          blockchain,
          token: toToken,
          amount: tokenAmountOut
        }],
        fee: {
          receiver: feeReceiver,
          amount: '1.5%'
        },
        from: { [blockchain]: fromAddress }
      })

      // not swapped
      expect(routes[0].transaction.method).toEqual('route')
      expect(routes[0].transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(routes[0].transaction.params.amounts).toEqual(['20000000000000000000', '19700000000000000000', '0', '0', '300000000000000000'])
      expect(routes[0].transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])

      // swapped
      expect(routes[1].transaction.method).toEqual('route')
      expect(routes[1].transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(routes[1].transaction.params.amounts[0]).toEqual('11055000000000000000')
      expect(routes[1].transaction.params.amounts[1]).toEqual('19700000000000000000')
      expect(routes[1].transaction.params.amounts[4]).toEqual('300000000000000000')
      expect(routes[1].transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])

      // swapped
      expect(routes[2].transaction.method).toEqual('route')
      expect(routes[2].transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(routes[2].transaction.params.amounts[0]).toEqual('301500000000000000')
      expect(routes[2].transaction.params.amounts[1]).toEqual('19700000000000000000')
      expect(routes[2].transaction.params.amounts[4]).toEqual('300000000000000000')
      expect(routes[2].transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])
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
      mockPair(provider, '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc', [WETH, USDC])
      mockPair(provider, '0xAE461cA67B15dc8dc81CE7615e0320dA1A9aB8D5', [DAI, USDC])
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
          amount: tokenAmountOut
        }],
        fee: {
          receiver: feeReceiver,
          amount: '1.5%'
        },
        from: { [blockchain]: fromAddress }
      })

      // not swapped
      expect(routes[0].transaction.method).toEqual('route')
      expect(routes[0].transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(routes[0].transaction.params.amounts).toEqual(['1002500', '987463', '0', '0', '15037'])
      expect(routes[0].transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])
    });

    it('throws error if amount percentage has more than 1 decimal', async ()=>{

      expect(()=>{
        route({
          accept: [{
            toAddress,
            blockchain,
            token: toToken,
            amount: tokenAmountOut
          }],
          fee: {
            receiver: feeReceiver,
            amount: '1.55%'
          },
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
          amount: tokenAmountOut
        }],
        fee: {
          receiver: feeReceiver,
          amount: 1.8
        },
        from: { [blockchain]: fromAddress }
      })

      // not swapped
      expect(routes[0].transaction.method).toEqual('route')
      expect(routes[0].directTransfer).toEqual(false)
      expect(routes[0].transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(routes[0].transaction.params.amounts).toEqual(['20000000000000000000', '18200000000000000000', '0', '0', '1800000000000000000'])
      expect(routes[0].transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])

      // swapped
      expect(routes[1].transaction.method).toEqual('route')
      expect(routes[0].directTransfer).toEqual(false)
      expect(routes[1].transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(routes[1].transaction.params.amounts[0]).toEqual('11055000000000000000')
      expect(routes[1].transaction.params.amounts[1]).toEqual('18200000000000000000')
      expect(routes[1].transaction.params.amounts[4]).toEqual('1800000000000000000')
      expect(routes[1].transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])

      // swapped
      expect(routes[2].transaction.method).toEqual('route')
      expect(routes[0].directTransfer).toEqual(false)
      expect(routes[2].transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(routes[2].transaction.params.amounts[0]).toEqual('301500000000000000')
      expect(routes[2].transaction.params.amounts[1]).toEqual('18200000000000000000')
      expect(routes[2].transaction.params.amounts[4]).toEqual('1800000000000000000')
      expect(routes[2].transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])
    });
  })

  describe('fee in absolute numbers as BN string', ()=>{
    it('adds fee amount and fee receiver to payment route transaction', async ()=>{

      let routes = await route({
        accept: [{
          toAddress,
          blockchain,
          token: toToken,
          amount: tokenAmountOut
        }],
        fee: {
          receiver: feeReceiver,
          amount: '1800000000000000000'
        },
        from: { [blockchain]: fromAddress }
      })

      // not swapped
      expect(routes[0].transaction.method).toEqual('route')
      expect(routes[0].transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(routes[0].transaction.params.amounts).toEqual(['20000000000000000000', '18200000000000000000', '0', '0', '1800000000000000000'])
      expect(routes[0].transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])

      // swapped
      expect(routes[1].transaction.method).toEqual('route')
      expect(routes[1].transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(routes[1].transaction.params.amounts[0]).toEqual('11055000000000000000')
      expect(routes[1].transaction.params.amounts[1]).toEqual('18200000000000000000')
      expect(routes[1].transaction.params.amounts[4]).toEqual('1800000000000000000')
      expect(routes[1].transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])

      // swapped
      expect(routes[2].transaction.method).toEqual('route')
      expect(routes[2].transaction.params.plugins).toContain(plugins[blockchain].paymentFee.address)
      expect(routes[2].transaction.params.amounts[0]).toEqual('301500000000000000')
      expect(routes[2].transaction.params.amounts[1]).toEqual('18200000000000000000')
      expect(routes[2].transaction.params.amounts[4]).toEqual('1800000000000000000')
      expect(routes[2].transaction.params.addresses).toEqual([accounts[0], feeReceiver, toAddress])
    });
  })
})
