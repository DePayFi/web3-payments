# via Uniswap v3

```javascript
let routes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'base',
      token: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA',
      amount: 0.1,
      toAddress: '0x4e260bB2b25EC6F3A59B478fCDe5eD5B8D783B02'
    }
  ],
  from: {
    base: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
  }
})

let route = routes[1]
let transaction = await route.getTransaction()

const wallet = (await Web3Wallets.getWallets())[0]
wallet.sendTransaction(transaction)
```

# via Wrapped

```javascript
let routes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'base',
      token: Web3Blockchains.base.wrapped.address,
      amount: 0.001,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    base: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
  }
})

let route = routes[0]
let transaction = await route.getTransaction()

const wallet = (await Web3Wallets.getWallets())[0]
wallet.sendTransaction(transaction)
```

# protocol + fee


# via Uniswap v2

```javascript
let routes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'base',
      token: '0x2dc90fa3a0f178ba4bee16cac5d6c9a5a7b4c6cb', // DRINK
      amount: 1,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    base: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
  }
})

let route = routes[1]
let transaction = await route.getTransaction()

const wallet = (await Web3Wallets.getWallets())[0]
wallet.sendTransaction(transaction)
```
