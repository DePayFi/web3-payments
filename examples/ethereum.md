# via Uniswap V3

```javascript
let routes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'ethereum',
      token: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      amount: 1,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    ethereum: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
  }
})

let route = routes[0]
let transaction = await route.getTransaction()

const wallet = (await Web3Wallets.getWallets())[0]
wallet.sendTransaction(transaction)
```

# via Uniswap V2

```javascript
let routes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'ethereum',
      token: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      amount: 1,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    ethereum: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
  }
})

let route = routes[5]
let transaction = await route.getTransaction()

const wallet = (await Web3Wallets.getWallets())[0]
wallet.sendTransaction(transaction)
```

# via Wrapped

```javascript
let routes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'ethereum',
      token: Web3Blockchains.ethereum.wrapped.address,
      amount: 0.001,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    ethereum: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
  }
})

let route = routes[0]
let transaction = await route.getTransaction()

const wallet = (await Web3Wallets.getWallets())[0]
wallet.sendTransaction(transaction)
```
