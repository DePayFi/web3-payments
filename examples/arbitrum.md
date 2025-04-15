# via Uniswap v3

```javascript
let routes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'arbitrum',
      token: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      amount: 1,
      receiver: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    arbitrum: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
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
      blockchain: 'arbitrum',
      token: Web3Blockchains.arbitrum.wrapped.address,
      amount: 0.001,
      receiver: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    arbitrum: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
  }
})

let route = routes[0]
let transaction = await route.getTransaction()

const wallet = (await Web3Wallets.getWallets())[0]
wallet.sendTransaction(transaction)
```
