# via Uniswap v3

```javascript
let routes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'optimism',
      token: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      amount: 0.01,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    optimism: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
  }
})

let route = routes[0]
let transaction = await route.getTransaction()

const wallet = (await Web3Wallets.getWallets())[0]
wallet.sendTransaction(transaction)
```

# via Wrapped

```javascript
let routes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'optimism',
      token: Web3Blockchains.optimism.wrapped.address,
      amount: 0.001,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    optimism: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
  }
})

let route = routes[0]
let transaction = await route.getTransaction()

const wallet = (await Web3Wallets.getWallets())[0]
wallet.sendTransaction(transaction)
```
