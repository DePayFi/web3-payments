# Using permit2 + simple transfer

```javascript
let routes = await Web3Payments.route({
  permit2: true,
  accept: [
    {
      blockchain: 'optimism',
      token: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      amount: 0.001,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950',
      fee: {
        amount: '1%',
        receiver: '0x08B277154218CCF3380CAE48d630DA13462E3950'
      }
    }
  ],
  from: {
    optimism: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
  }
})

let route = routes[0]

const wallet = (await Web3Wallets.getWallets())[0]

const signature = await wallet.sign(await route.getPermit2Signature())

const transaction = await route.getTransaction({ signature })
console.log('transaction', transaction)
wallet.sendTransaction(transaction)

```

# Using permit2 + exchange

```javascript
let routes = await Web3Payments.route({
  permit2: true,
  accept: [
    {
      blockchain: 'optimism',
      token: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      amount: 0.01,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    optimism: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
  }
})

let route = routes[1]

const wallet = (await Web3Wallets.getWallets())[0]

const signature = await wallet.sign(await route.getPermit2Signature())

const transaction = await route.getTransaction({ signature })
console.log('transaction', transaction)
wallet.sendTransaction(transaction)

```

# via Uniswap v3

```javascript
let routes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'optimism',
      token: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      amount: 1,
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
