import CONSTANTS from 'depay-blockchain-constants'
import { ERC20 } from 'depay-blockchain-token'
import { mock, resetMocks } from 'depay-web3mock'
import { route, setApiKey } from '../../src'
import { UniswapV2Router } from '../apis'

let mockPair = (pair, params)=>{
  mock({
    blockchain: 'ethereum',
    call: {
      to: '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f',
      api: UniswapV2Router,
      method: 'getPair',
      params: params,
      return: pair
    }
  })
}

describe('route', ()=> {

  beforeEach(resetMocks)
  afterEach(resetMocks)

  it('provides all possible payment routes based on wallet assets and decentralized exchange routes', async ()=>{

    mock('ethereum')
    setApiKey('Test123')

    let assetsEthereum = [
      {
        "name": "Ether",
        "symbol": "ETH",
        "address": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        "type": "NATIVE",
        "balance": "458591489676110093"
      }, {
        "name": "Dai Stablecoin",
        "symbol": "DAI",
        "address": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        "type": "ERC20",
        "balance": "8007804249707967889272"
      }, {
        "name": "DePay",
        "symbol": "DEPAY",
        "address": "0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb",
        "type": "ERC20",
        "balance": "212816860003097638129"
      }, {
        "name": "KickToken",
        "symbol": "KICK",
        "address": "0xc12d1c73ee7dc3615ba4e37e4abfdbddfa38907e",
        "type": "ERC20",
        "balance": "888888000000000000000000"
      }
    ]

    mock({
      blockchain: 'ethereum',
      estimate: {
        api: ERC20,
        from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
        to: '0xc12d1c73ee7dc3615ba4e37e4abfdbddfa38907e',
        method: 'transfer',
        return: Error('Not transferarble')
      }
    })

    global.fetch = jest.fn((url, options)=>{
      expect(options).toEqual({ headers: { 'X-Api-Key': 'Test123' } })
      expect(url).toEqual('https://api.depay.pro/v1/assets?account=0xd8da6bf26964af9d7eed9e03e53415d37aa96045&blockchain=ethereum')
      return Promise.resolve({
        json: () => Promise.resolve(assetsEthereum)
      })
    })

    mock({
      blockchain: 'ethereum',
      call: {
        to: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
        api: ERC20,
        method: 'decimals',
        return: 18
      }
    })

    mock({
      blockchain: 'ethereum',
      call: {
        to: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        api: ERC20,
        method: 'decimals',
        return: 18
      }
    })

    mockPair('0xEF8cD6Cb5c841A4f02986e8A8ab3cC545d1B8B6d', ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0xa0bed124a09ac2bd941b10349d8d224fe3c955eb"])
    mockPair(CONSTANTS.ethereum.ZERO, ["0x6b175474e89094c44da98b954eedeac495271d0f", "0xa0bed124a09ac2bd941b10349d8d224fe3c955eb"])


    let routes = await route({
      from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      to: '0x65aBbdEd9B937E38480A50eca85A8E4D2c8350E4',
      blockchain: 'ethereum',
      token: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
      amount: 20
    })
  });
});
