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

## with permit2

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

let route = routes[5]

const wallet = (await Web3Wallets.getWallets())[0]

// let approvalTransaction = await route.getPermit2ApprovalTransaction()
// if(approvalTransaction) {
//   wallet.sendTransaction(approvalTransaction)
// }

let signatureData = await route.getPermit2ApprovalSignature()
let signature = await wallet.sign(signatureData)

let transaction = await route.getTransaction({
  signature,
  signatureNonce: signatureData.message.nonce,
  signatureDeadline: signatureData.message.deadline
})
wallet.sendTransaction(transaction)
```

## with all fees

```javascript
let routes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'optimism',
      token: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
      amount: 0.01,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950',
      fee: {
        amount: '1%',
        receiver: '0x08B277154218CCF3380CAE48d630DA13462E3950'
      },
      fee2: {
        amount: '1%',
        receiver: '0x8a4aDA571ab235BF7d586d02E534D08552B3dedb'
      },
      protocolFee: '1%'
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
