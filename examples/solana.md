
## routeSol

```javascript

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: Web3Blockchains.solana.currency.address,
    amount: 0.1,
    toAddress: '5AcFMJZkXo14r3Hj99iYd1HScPiM4hAcLZf552DfZkxa',
    fee: {
      amount: '1%',
      receiver: '3YrWvZAwNiBcMi6PigTRNHRuiTJ8jatwxgRYEx784oHW'
    }
  }],
  from: {
    solana: '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1',
  }
})

let transaction = await paymentRoutes[0].getTransaction()

let wallet = (await Web3Wallets.getWallets())[0]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeToken

```javascript

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    amount: 0.1,
    toAddress: '3YrWvZAwNiBcMi6PigTRNHRuiTJ8jatwxgRYEx784oHW',
    fee: {
      amount: '5%',
      receiver: '5s3M1WuqLyHYGPBnHuaEfFdd339aHtJVTKPdyRpbxHE2'
    }
  }],
  from: {
    solana: '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1',
  }
})

let transaction = await paymentRoutes[0].getTransaction()

let wallet = (await Web3Wallets.getWallets())[0]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeOrcaSwap (TOKEN<>TOKEN)

```javascript

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
    amount: 1,
    toAddress: '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk',
    fee: {
      amount: '5%',
      receiver: '3YrWvZAwNiBcMi6PigTRNHRuiTJ8jatwxgRYEx784oHW'
    }
  }],
  from: {
    solana: '5AcFMJZkXo14r3Hj99iYd1HScPiM4hAcLZf552DfZkxa',
  }
})

let transaction = await paymentRoutes[1].getTransaction()

let wallet = (await Web3Wallets.getWallets())[0]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeOrcaSwap (SOL->WSOL<>TOKEN)

```javascript

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    amount: 1,
    toAddress: '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk',
    fee: {
      amount: '5%',
      receiver: '3YrWvZAwNiBcMi6PigTRNHRuiTJ8jatwxgRYEx784oHW'
    }
  }],
  from: {
    solana: '5AcFMJZkXo14r3Hj99iYd1HScPiM4hAcLZf552DfZkxa',
  }
})

let transaction = await paymentRoutes[0].getTransaction()

let wallet = (await Web3Wallets.getWallets())[0]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeOrcaSwapSolOut (TOKEN<>WSOL->SOL)

```javascript

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: Web3Blockchains.solana.currency.address,
    amount: 0.001,
    toAddress: '3YrWvZAwNiBcMi6PigTRNHRuiTJ8jatwxgRYEx784oHW',
    fee: {
      amount: '1%',
      receiver: '5s3M1WuqLyHYGPBnHuaEfFdd339aHtJVTKPdyRpbxHE2'
    }
  }],
  from: {
    solana: '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk',
  }
})

let transaction = await paymentRoutes[1].getTransaction()

let wallet = (await Web3Wallets.getWallets())[0]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeOrcaTwoHopSwap (TOKEN<>TOKEN<>WSOL)

```javascript

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: Web3Blockchains.solana.wrapped.address,
    amount: 0.001,
    toAddress: '5AcFMJZkXo14r3Hj99iYd1HScPiM4hAcLZf552DfZkxa',
    fee: {
      amount: '1%',
      receiver: '5s3M1WuqLyHYGPBnHuaEfFdd339aHtJVTKPdyRpbxHE2'
    }
  }],
  from: {
    solana: '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1',
  }
})

let transaction = await paymentRoutes[8].getTransaction()

console.log('transaction', transaction)

let wallet = (await Web3Wallets.getWallets())[0]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeOrcaTwoHopSwapSolOut (TOKEN<>TOKEN<>WSOL->SOL)

```javascript

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: Web3Blockchains.solana.currency.address,
    amount: 0.001,
    toAddress: '5AcFMJZkXo14r3Hj99iYd1HScPiM4hAcLZf552DfZkxa',
    fee: {
      amount: '1%',
      receiver: '5s3M1WuqLyHYGPBnHuaEfFdd339aHtJVTKPdyRpbxHE2'
    }
  }],
  from: {
    solana: '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1',
  }
})

let transaction = await paymentRoutes[8].getTransaction()

let wallet = (await Web3Wallets.getWallets())[0]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```
