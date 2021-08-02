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
  from: '0x5Af489c8786A018EC4814194dC8048be1007e390',
  to: '0xb0252f13850a4823706607524de0b146820F2240',
  token: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
  amount: 20
})
```

## Functionalities

### route

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
