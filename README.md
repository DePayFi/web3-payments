## Quickstart

```
yarn add depay-web3-payments
```

or 

```
npm install --save depay-web3-payments
```

```javascript
import { route, setApiKey } from 'depay-web3-payments'

setApiKey('YOUR-PERSONAL-API-KEY')

let paymentRoutes = route({
  blockchain: 'ethereum',
  token: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
  amount: 20,
  fromAddress: '0x5Af489c8786A018EC4814194dC8048be1007e390',
  toAddress: '0xb0252f13850a4823706607524de0b146820F2240'
})

///
```

## Functionalities

### route

Routes payment and returns payment routes:

```javascript
import { route, setApiKey } from 'depay-web3-payments'

setApiKey('YOUR-PERSONAL-API-KEY')

let paymentRoutes = route({
  blockchain: 'ethereum',
  token: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
  amount: 20,
  fromAddress: '0x5Af489c8786A018EC4814194dC8048be1007e390',
  toAddress: '0xb0252f13850a4823706607524de0b146820F2240'
})
```

## Data Structures

### PaymentRoute

Payment routes are provided in the following structure:

```
{
  blockchain: String (e.g. ethereum)
  fromToken: String (e.g. '0x6B175474E89094C44Da98b954EedeAC495271d0F')
  fromBalance: BigNumber (e.g. <BigNumber '10000000000000000000'>)
  toToken: String (e.g. '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb')
  toAmount: BigNumber (e.g. <BigNumber '21000000000000000000'>)
  fromAddress: String (e.g. '0xd8da6bf26964af9d7eed9e03e53415d37aa96045')
  toAddress: String (e.g. '0x65aBbdEd9B937E38480A50eca85A8E4D2c8350E4')
  exchangeRoutes: Array (list of exchange routes offering to convert )
  transaction: depay-web3-transaction (transaction to submit the payment)
}
```

See https://github.com/DePayFi/depay-web3-transaction for detailed transaction features.

## Support

This library supports the following blockchains:

- [Ethereum](https://ethereum.org)
- [Binance Smart Chain](https://www.binance.org/en/smartChain)

This library supports the following decentralized exchanges:

- [Uniswap v2](https://uniswap.org)
- [PancakeSwap v2](https://pancakeswap.info)

Soon:
- [Uniswap v3](https://uniswap.org)
- [SushiSwap](https://sushi.com)
- [Curve](https://curve.fi)

## Development

### Get started

```
yarn install
yarn dev
```

### Release

```
npm publish
```
