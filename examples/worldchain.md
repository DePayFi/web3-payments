# via Uniswap v3

```javascript
let routes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'worldchain',
      token: '0x79A02482A880bCE3F13e09Da970dC34db4CD24d1',
      amount: 0.01,
      receiver: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    worldchain: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
  },
  best: (bestRoute)=>{
    console.log('bestRoute', bestRoute)
  }
})

let route = routes[2]
let transaction = await route.getTransaction()

const wallet = (await Web3Wallets.getWallets())[0]
wallet.sendTransaction(transaction)
```

# with allow

```javascript
let routes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'worldchain',
      token: '0x79A02482A880bCE3F13e09Da970dC34db4CD24d1',
      amount: 25.0,
      receiver: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    worldchain: '0xf46b99f7edbabdf1cceeffd3c697616036795767',
  },
  allow: {"worldchain":["0x2cFc85d8E48F8EAB294be644d9E25C3030863003","0x79A02482A880bCE3F13e09Da970dC34db4CD24d1"]},
  best: (bestRoute)=>{
    console.log('bestRoute', bestRoute)
  }
})

let route = routes[2]
let transaction = await route.getTransaction()

const wallet = (await Web3Wallets.getWallets())[0]
wallet.sendTransaction(transaction)
```
