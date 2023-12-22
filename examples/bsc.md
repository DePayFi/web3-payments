# via Pancakeswap v3

```javascript
let routes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'bsc',
      token: '0x55d398326f99059fF775485246999027B3197955',
      amount: 1,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    bsc: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
  }
})

let route = routes[1]
let transaction = await route.getTransaction()

const wallet = (await Web3Wallets.getWallets())[0]
wallet.sendTransaction(transaction)
```

# via Pancakeswap v3 (to BNB/NATIVE)

```javascript
let routes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'bsc',
      token: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      amount: 0.0001,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    bsc: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
  }
})

let route = routes[2]
let transaction = await route.getTransaction()

const wallet = (await Web3Wallets.getWallets())[0]
wallet.sendTransaction(transaction)
```

# via Uniswap V3

```javascript
let routes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'bsc',
      token: '0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b',
      amount: 1,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    bsc: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
  }
})

let route = routes[0]
let transaction = await route.getTransaction()

const wallet = (await Web3Wallets.getWallets())[0]
wallet.sendTransaction(transaction)
```

# via PancakeSwap v2

```javascript
let routes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'bsc',
      token: '0x2fa5daf6fe0708fbd63b1a7d1592577284f52256',
      amount: 1,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    bsc: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
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
      blockchain: 'bsc',
      token: Web3Blockchains.bsc.wrapped.address,
      amount: 0.001,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
    }
  ],
  from: {
    bsc: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
  }
})

let route = routes[1]
let transaction = await route.getTransaction()

const wallet = (await Web3Wallets.getWallets())[0]
wallet.sendTransaction(transaction)
```
