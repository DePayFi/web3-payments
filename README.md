## Quickstart

```
yarn add @depay/web3-payments
```

or 

```
npm install --save @depay/web3-payments
```

```javascript
import { route } from '@depay/web3-payments'

let paymentRoutes = await route({
  accept: [{
    blockchain: 'ethereum',
    token: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
    amount: 20,
    fromAddress: '0x5Af489c8786A018EC4814194dC8048be1007e390',
    toAddress: '0xb0252f13850a4823706607524de0b146820F2240'
  }]
})
```

## Functionalities

### route

Routes payment and returns payment routes:

```javascript
import { route } from '@depay/web3-payments'

let paymentRoutes = await route({
  accept: [{
    blockchain: 'ethereum',
    token: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
    amount: 20,
    fromAddress: '0x5Af489c8786A018EC4814194dC8048be1007e390',
    toAddress: '0xb0252f13850a4823706607524de0b146820F2240'
  }]
})
```

Also allows to pass in multiple accepted means of payment: 

```javascript
import { route } from '@depay/web3-payments'

let paymentRoutes = await route({
  accept: [
    {
      blockchain: 'ethereum',
      token: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
      amount: 20,
      fromAddress: '0x5Af489c8786A018EC4814194dC8048be1007e390',
      toAddress: '0xb0252f13850a4823706607524de0b146820F2240'
    },{
      blockchain: 'bsc',
      token: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
      amount: 20,
      fromAddress: '0x5Af489c8786A018EC4814194dC8048be1007e390',
      toAddress: '0xb0252f13850a4823706607524de0b146820F2240'
    }
  ]
})
```

#### fromToken + fromAmount + toToken

In cases where you want to set the `fromToken` and `fromAmount` (instead of the target token and the target amount) when calculating payment routes you can pass `fromToken`, `fromAmount` + `toToken`.

Make sure to NOT pass `token` nor `amount` if you use that option!

```javascript
import { route } from '@depay/web3-payments'

let paymentRoutes = await route({
  accept: [
    {
      blockchain: 'bsc',
      fromAmount: 1,
      fromToken: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
      toToken: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
      fromAddress: '0x5Af489c8786A018EC4814194dC8048be1007e390',
      toAddress: '0xb0252f13850a4823706607524de0b146820F2240'
    }
  ]
})
```

#### Pay into Smart Contracts

In case you want to pay into smart contract (calling a smart contract method), you will need to pass `toContract` in addition to `toAddress`:

```javascript
import { route } from '@depay/web3-payments'

let paymentRoutes = await route({
  accept: [
    {
      blockchain: 'ethereum',
      token: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
      amount: 20,
      fromAddress: '0x5Af489c8786A018EC4814194dC8048be1007e390',
      toAddress: '0xb0252f13850a4823706607524de0b146820F2240',
      toContract: {
        signature: 'claim(address,uint256,bool)',
        params: ['true']
      }
    }
  ]
})
```

To contract needs to contain at lest the `signature` field. Depending on the `signature` field `params` also need to be provided.

The previous example after swapping payment tokens, will call the contract at `0xb0252f13850a4823706607524de0b146820F2240` calling method `claim` passing `address` from the payment sender
and amounts from the final token amounts also forwarding `params[0]` to pass the value for `bool`.

If you want to know more about paying into smart contracts, checkout the [depay-evm-router](https://github.com/depayfi/depay-evm-router).

Read following the currently supported contract call signatures:

##### signature(address,uint256,bool)

###### While inferring uint256 from paid amount:

```javascript
import { route } from '@depay/web3-payments'

let paymentRoutes = await route({
  accept: [
    {
      blockchain: 'ethereum',
      token: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
      amount: 20,
      fromAddress: '0x5Af489c8786A018EC4814194dC8048be1007e390',
      toAddress: '0xb0252f13850a4823706607524de0b146820F2240',
      toContract: {
        signature: 'claim(address,uint256,bool)',
        params: ['true']
      }
    }
  ]
})
```

###### Passing uint256 explicitly:

```javascript
import { route } from '@depay/web3-payments'

let paymentRoutes = await route({
  accept: [
    {
      blockchain: 'ethereum',
      token: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
      amount: 20,
      fromAddress: '0x5Af489c8786A018EC4814194dC8048be1007e390',
      toAddress: '0xb0252f13850a4823706607524de0b146820F2240',
      toContract: {
        signature: 'claim(address,uint256,bool)',
        params: ['40000000000000000000', 'true']
      }
    }
  ]
})
```

#### whitelist

Allows only fromTokens (from the sender) that are part of the whitelist:

```javacript
let paymentRoutes = await route({

  whitelist: {
    ethereum: [
      '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // ETH
      '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
      '0x6b175474e89094c44da98b954eedeac495271d0f'  // DAI
    ],
    bsc: [
      '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // BNB
      '0xe9e7cea3dedca5984780bafc599bd69add087d56', // BUSD
      '0x55d398326f99059ff775485246999027b3197955'  // BSC-USD
    ]
  }
})

```

#### blacklist

Filters fromTokens to not be used for payment routing:

```javacript
let paymentRoutes = await route({

  blacklist: {
    ethereum: [
      '0x6b175474e89094c44da98b954eedeac495271d0f'  // DAI
    ],
    bsc: [
      '0x55d398326f99059ff775485246999027b3197955'  // BSC-USD
    ]
  }
})

```

#### event

Allows to emit events as part of the payment transaction.

[DePayRouterV1PaymentEvent02](https://github.com/DePayFi/depay-evm-router#depayrouterv1paymentevent02)

Possible values:

`ifSwapped`: Only emits an event if payment requires swap, otherwise no dedicated payment event is emited. Use classic transfer event in case of a direct payment (does not go through the DePay router).

```javascript
let paymentRoutes = await route({
  accept: [
    {
      blockchain: 'ethereum',
      token: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
      amount: 20,
      fromAddress: '0x5Af489c8786A018EC4814194dC8048be1007e390',
      toAddress: '0xb0252f13850a4823706607524de0b146820F2240'
    },{
      blockchain: 'bsc',
      token: '0xa0bEd124a09ac2Bd941b10349d8d224fe3c955eb',
      amount: 20,
      fromAddress: '0x5Af489c8786A018EC4814194dC8048be1007e390',
      toAddress: '0xb0252f13850a4823706607524de0b146820F2240'
    }
  ]
  event: 'ifSwapped'
})
```

Events are not emitted if payment receiver is a smart contract. Make sure your smart contract emits events in that case!

#### fee

`route` allows you also to configure a `fee` that is taken from the payment amount and is sent to another receiver (the fee receiver):

```javascript
let paymentRoutes = await route({
  accept: [...],
  fee: {
    amount: '3%',
    receiver: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'
  }
})

// splits 0.3 of the amount paid and sends it to the feeReceiver
```

`fee.amount` can be passed as percentage (String with ending %) or as a BigNumber string or as a pure number/decimal

```javascript
let paymentRoutes = await route({
  accept: [...],
  fee: {
    amount: '300000000000000000',
    receiver: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'
  }
})
// splits 0.3 of the amount paid and sends it to the feeReceiver
```

```javascript
let paymentRoutes = await route({
  accept: [...],
  fee: {
    amount: 0.3,
    receiver: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'
  }
})
// splits 0.3 of the amount paid and sends it to the feeReceiver
```

### routers

Exports basic router information (address and api):

```javascript
import { routers } from '@depay/web3-payments'

routers.ethereum.address // 0xae60aC8e69414C2Dc362D0e6a03af643d1D85b92
```

### plugins

Exports plugin addresses:

```javascript
import { plugins } from '@depay/web3-payments'

plugins.ethereum.payment // 0x99F3F4685a7178F26EB4F4Ca8B75a1724F1577B9
```

## Domain Knowledge

### Payment Routing Priorities

1. If user has request token in his wallet, direct token transfer to receiver will be prioritized

2. Any token that can be liquidated on decentralized exchange and has been already been approved for the DePay router will be second priority

3. All other liquefiable tokens that still require token approval will be prioritized last

## Data Structures

### PaymentRoute

Payment routes are provided in the following structure:

```
{
  blockchain: String (e.g. ethereum)
  fromToken: Token (see @depay/web3-tokens)
  fromBalance: BigNumber (e.g. <BigNumber '10000000000000000000'>)
  fromAddress: String (e.g. '0xd8da6bf26964af9d7eed9e03e53415d37aa96045')
  fromAmount: BigNumber (e.g. <BigNumber '31000000000000000000'>)
  fromDecimals: number (e.g. 18)
  toToken: Token (see @depay/web3-tokens)
  toAmount: BigNumber (e.g. <BigNumber '21000000000000000000'>)
  toDecimals: number (e.g. 18)
  toAddress: String (e.g. '0x65aBbdEd9B937E38480A50eca85A8E4D2c8350E4')
  exchangeRoutes: Array (list of exchange routes offering to convert )
  transaction: Transaction (see @depay/web3-wallets for details)
  approvalRequired: Boolean (e.g. true)
  approvalTransaction: Transaction (to approve the fromToken being used from the payment router to perform the payment)
  directTransfer: Boolean (e.g. true)
}
```

`approvalRequired`: indicates if a upfront token approval is required in order to perform the payment, make sure you execute `approve` before executing the payment transaction itself.

`directTransfer`: indicates if the payment does not require any swapping/exchanging.

See [@depay/web3-wallets](https://github.com/DePayFi/web3-wallets#sendtransaction) for details about the transaction format.

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
