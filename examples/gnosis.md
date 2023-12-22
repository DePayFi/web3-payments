# via Honeyswap

```javascript
let routes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'gnosis',
      token: '0x4ECaBa5870353805a9F068101A40E0f32ed605C6',
      amount: 1,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    gnosis: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
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
      blockchain: 'gnosis',
      token: Web3Blockchains.gnosis.wrapped.address,
      amount: 0.001,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    gnosis: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
  }
})

let route = routes[0]
let transaction = await route.getTransaction()

const wallet = (await Web3Wallets.getWallets())[0]
wallet.sendTransaction(transaction)
```

```javascript
let routes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'gnosis',
      token: Web3Blockchains.gnosis.currency.address,
      amount: 0.001,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    gnosis: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
  }
})

let route = routes[2]
let transaction = await route.getTransaction()

const wallet = (await Web3Wallets.getWallets())[0]
wallet.sendTransaction(transaction)
```
