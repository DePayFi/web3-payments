import Blockchains from '@depay/web3-blockchains'
import fetchMock from 'fetch-mock'
import { ethers } from 'ethers'
import { mock, resetMocks } from '@depay/web3-mock'
import { mockAssets } from 'tests/mocks/api'
import { mockBasics, mockDecimals, mockBalance, mockAllowance } from 'tests/mocks/tokens'
import { resetCache, getProvider } from '@depay/web3-client-evm'
import { route, plugins, routers } from 'dist/esm/index.evm'
import Token from '@depay/web3-tokens-evm'

describe('route wrapped', ()=> {

  const blockchain = 'ethereum'
  const accounts = ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045']
  const fromAddress = accounts[0]
  const toAddress = '0x65aBbdEd9B937E38480A50eca85A8E4D2c8350E4'
  const WRAPPED = Blockchains[blockchain].wrapped.address
  const NATIVE = Blockchains[blockchain].currency.address

  let provider, balanceBN, tokenAmountOut, tokenAmountOutBN, transaction
  
  beforeEach(async()=>{
    resetMocks()
    resetCache()
    fetchMock.reset()
    mock({ blockchain, accounts: { return: accounts } })
    provider = await getProvider(blockchain)
    balanceBN = '1000000000000000000000000'
    tokenAmountOut = 0.0001
    tokenAmountOutBN = ethers.utils.parseUnits(tokenAmountOut.toString())

    Blockchains.findByName(blockchain).tokens.forEach((token)=>{
      if(token.type == '20') {
        mock({ request: { return: '0', to: token.address, api: Token[blockchain].DEFAULT, method: 'balanceOf', params: accounts[0] }, provider, blockchain })
      }
    })

    mockAssets({ blockchain, account: fromAddress, assets: []})

    mockBasics({ provider, blockchain, api: Token[blockchain].DEFAULT, token: WRAPPED, decimals: 18, name: 'DePay', symbol: 'DEPAY' })
    mock({ provider, blockchain, balance: { for: fromAddress, return: balanceBN } })
  })

  it('provides payment route for NATIVE<>WRAPPED', async ()=>{

    let routes = await route({
      accept: [{
        blockchain,
        token: WRAPPED,
        amount: tokenAmountOut,
        toAddress,
      }],
      from: { [blockchain]: fromAddress }
    })
    expect(routes.length).toEqual(1)

    expect(routes[0].blockchain).toEqual(blockchain)
    expect(routes[0].fromToken.address).toEqual(NATIVE)
    expect(routes[0].toToken.address).toEqual(WRAPPED)
    expect(routes[0].toAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[0].fromAddress).toEqual(fromAddress)
    expect(routes[0].toAddress).toEqual(toAddress)
    expect(routes[0].fromBalance).toEqual(balanceBN)
    expect(routes[0].fromAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[0].exchangeRoutes.length).toEqual(1)
    transaction = await routes[0].getTransaction()
    expect(transaction.blockchain).toEqual(blockchain)
    expect(transaction.to).toEqual(routers[blockchain].address)
    expect(transaction.api).toEqual(routers[blockchain].api)
    expect(transaction.method).toEqual('pay')
    expect(transaction.params.payment.tokenInAddress).toEqual(NATIVE)
    expect(transaction.params.payment.tokenOutAddress).toEqual(WRAPPED)
    expect(transaction.params.payment.amountIn).toEqual(tokenAmountOutBN.toString())
    expect(transaction.params.payment.paymentAmount).toEqual(tokenAmountOutBN.toString())
    expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
    expect(routes[0].approvalRequired).toEqual(false)
    expect(routes[0].approvalTransaction).toEqual(undefined)
    expect(routes[0].directTransfer).toEqual(false)
  });

  it('provides payment route for WRAPPED<>NATIVE', async ()=>{

    mock({ request: { return: balanceBN.toString(), to: WRAPPED, api: Token[blockchain].DEFAULT, method: 'balanceOf', params: accounts[0] }, provider, blockchain })
    mockAllowance({ provider, blockchain, api: Token[blockchain].DEFAULT, token: WRAPPED, account: fromAddress, spender: routers[blockchain].address, allowance: '0' })
    mock({ provider, blockchain, balance: { for: fromAddress, return: '1000' } })

    let routes = await route({
      accept: [{
        blockchain,
        token: NATIVE,
        amount: tokenAmountOut,
        toAddress,
      }],
      from: { [blockchain]: fromAddress }
    })
    expect(routes.length).toEqual(1)

    expect(routes[0].blockchain).toEqual(blockchain)
    expect(routes[0].fromToken.address).toEqual(WRAPPED)
    expect(routes[0].toToken.address).toEqual(NATIVE)
    expect(routes[0].toAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[0].fromAddress).toEqual(fromAddress)
    expect(routes[0].toAddress).toEqual(toAddress)
    expect(routes[0].fromBalance).toEqual(balanceBN)
    expect(routes[0].fromAmount).toEqual(tokenAmountOutBN.toString())
    expect(routes[0].exchangeRoutes.length).toEqual(1)
    transaction = await routes[0].getTransaction()
    expect(transaction.blockchain).toEqual(blockchain)
    expect(transaction.to).toEqual(routers[blockchain].address)
    expect(transaction.api).toEqual(routers[blockchain].api)
    expect(transaction.method).toEqual('pay')
    expect(transaction.params.payment.tokenInAddress).toEqual(WRAPPED)
    expect(transaction.params.payment.tokenOutAddress).toEqual(NATIVE)
    expect(transaction.params.payment.amountIn).toEqual(tokenAmountOutBN.toString())
    expect(transaction.params.payment.paymentAmount).toEqual(tokenAmountOutBN.toString())
    expect(transaction.params.payment.paymentReceiverAddress).toEqual(toAddress)
    expect(routes[0].directTransfer).toEqual(false)
    expect(routes[0].approvalRequired).toEqual(true)

    let approvalTransaction = await routes[0].getRouterApprovalTransaction()
    expect(approvalTransaction.to).toEqual(WRAPPED)
    expect(approvalTransaction.method).toEqual('approve')
    expect(approvalTransaction.params).toEqual([routers[blockchain].address, Blockchains[blockchain].maxInt])
  });
})
