## Quickstart

```
yarn add depay-payment-routing
```

or 

```
npm install --save depay-payment-routing
```

```javascript
import { route, setApiKey } from 'depay-payment-routing'

setApiKey('YOUR-PERSONAL-API-KEY')
let paymentRoutes = route({
  from: '0x5Af489c8786A018EC4814194dC8048be1007e390',
  to: '0xb0252f13850a4823706607524de0b146820F2240',
  blockchain: 'ethereum',
  token: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
  amount: 20
})
```

## Functionalities

### route

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
