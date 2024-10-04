# via Uniswap v3

```javascript
let routes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'polygon',
      token: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      amount: 0.01,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    polygon: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
  }
})

let route = routes[1]
let transaction = await route.getTransaction()

const wallet = (await Web3Wallets.getWallets())[0]
wallet.sendTransaction(transaction)
```

# via quickswap

```javascript
let routes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'polygon',
      token: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      amount: 1,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    polygon: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
  }
})

let route = routes[2]
let transaction = await route.getTransaction()

const wallet = (await Web3Wallets.getWallets())[0]
wallet.sendTransaction(transaction)
```

# via Wrapped

```javascript
let routes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'polygon',
      token: Web3Blockchains.polygon.wrapped.address,
      amount: 0.001,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    polygon: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
  }
})

let route = routes[0]
let transaction = await route.getTransaction()

const wallet = (await Web3Wallets.getWallets())[0]
wallet.sendTransaction(transaction)
```
