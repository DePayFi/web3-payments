
## routeSol

???

```javascript

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: Web3Blockchains.solana.currency.address,
    amount: 0.0001,
    receiver: '5AcFMJZkXo14r3Hj99iYd1HScPiM4hAcLZf552DfZkxa',
    fee: {
      amount: '1%',
      receiver: '3YrWvZAwNiBcMi6PigTRNHRuiTJ8jatwxgRYEx784oHW'
    },
    fee2: {
      amount: '2%',
      receiver: '5AcFMJZkXo14r3Hj99iYd1HScPiM4hAcLZf552DfZkxa'
    },
  }],
  from: {
    solana: '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1',
  }
})

let transaction = await paymentRoutes[0].getTransaction()

let wallet = (await Web3Wallets.getWallets())[1]

wallet.sendTransaction(transaction)
```

## routeToken

???

```javascript

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    amount: 0.01,
    receiver: '3YrWvZAwNiBcMi6PigTRNHRuiTJ8jatwxgRYEx784oHW',
    fee: {
      amount: '5%',
      receiver: '5s3M1WuqLyHYGPBnHuaEfFdd339aHtJVTKPdyRpbxHE2'
    },
    fee2: {
      amount: '3%',
      receiver: '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk'
    },
    protocolFee: '1%'
  }],
  from: {
    solana: '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1',
  }
})

let transaction = await paymentRoutes[0].getTransaction()

let wallet = (await Web3Wallets.getWallets())[1]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeOrcaSwap (TOKEN<>TOKEN)

???

```javascript

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: 'A9mUU4qviSctJVPJdBJWkb28deg915LYJKrzQ19ji3FM',
    amount: 0.10,
    receiver: '3YrWvZAwNiBcMi6PigTRNHRuiTJ8jatwxgRYEx784oHW',
    fee: {
      amount: '5%',
      receiver: '5s3M1WuqLyHYGPBnHuaEfFdd339aHtJVTKPdyRpbxHE2'
    },
    fee2: {
      amount: '3%',
      receiver: '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk'
    },
    protocolFee: '1%'
  }],
  from: {
    solana: '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1',
  }
})

let transaction = await paymentRoutes[2].getTransaction()

let wallet = (await Web3Wallets.getWallets())[1]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeOrcaSwapSolIn (SOL->WSOL<>TOKEN)

✓ v3 tested: https://solscan.io/tx/4wxz76aBk3s4uGGDVcmxezJYwmsy7uZdHCM37dCNi5yZWQpx1ubnLcqT8eCHoRcQfFzybL6Lhs3VbPFw9SG4FTVD

```javascript

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    amount: 0.01,
    receiver: '3YrWvZAwNiBcMi6PigTRNHRuiTJ8jatwxgRYEx784oHW',
    fee: {
      amount: '5%',
      receiver: '5s3M1WuqLyHYGPBnHuaEfFdd339aHtJVTKPdyRpbxHE2'
    },
    fee2: {
      amount: '3%',
      receiver: '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk'
    },
    protocolFee: '1%'
  }],
  from: {
    solana: '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1',
  }
})

let transaction = await paymentRoutes[0].getTransaction()

let wallet = (await Web3Wallets.getWallets())[1]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeOrcaSwapSolOut (TOKEN<>WSOL->SOL)

???

```javascript

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: Web3Blockchains.solana.currency.address,
    amount: 0.001,
    receiver: '3YrWvZAwNiBcMi6PigTRNHRuiTJ8jatwxgRYEx784oHW',
    fee: {
      amount: '1%',
      receiver: '5s3M1WuqLyHYGPBnHuaEfFdd339aHtJVTKPdyRpbxHE2'
    },
    fee2: {
      amount: '3%',
      receiver: '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk'
    },
    protocolFee: '1.5%'
  }],
  from: {
    solana: '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1',
  }
})

let transaction = await paymentRoutes[1].getTransaction()

let wallet = (await Web3Wallets.getWallets())[1]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeOrcaTwoHopSwap (TOKEN<>TOKEN<>TOKEN)

???

```javascript

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: 'DePay1miDBPWXs6PVQrdC5Vch2jemgEPaiyXLNLLa2NF',
    amount: 0.001,
    receiver: '5AcFMJZkXo14r3Hj99iYd1HScPiM4hAcLZf552DfZkxa',
    fee: {
      amount: '1%',
      receiver: '5s3M1WuqLyHYGPBnHuaEfFdd339aHtJVTKPdyRpbxHE2'
    },
    fee2: {
      amount: '3%',
      receiver: '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk'
    },
    protocolFee: '1.5%'
  }],
  from: {
    solana: '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1',
  }
})

let transaction = await paymentRoutes[1].getTransaction()

console.log('transaction', transaction)

let wallet = (await Web3Wallets.getWallets())[1]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeOrcaTwoHopSwap (SOL->WSOL<>TOKEN<>TOKEN)

???

```javascript

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: 'DePay1miDBPWXs6PVQrdC5Vch2jemgEPaiyXLNLLa2NF',
    amount: 0.001,
    receiver: '5AcFMJZkXo14r3Hj99iYd1HScPiM4hAcLZf552DfZkxa',
    fee: {
      amount: '1%',
      receiver: '5s3M1WuqLyHYGPBnHuaEfFdd339aHtJVTKPdyRpbxHE2'
    },
    fee2: {
      amount: '3%',
      receiver: '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk'
    },
    protocolFee: '1.5%'
  }],
  from: {
    solana: '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1',
  }
})

let transaction = await paymentRoutes[1].getTransaction()

let wallet = (await Web3Wallets.getWallets())[1]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeOrcaTwoHopSwapSolOut (TOKEN<>TOKEN<>WSOL->SOL)

???

```javascript

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: Web3Blockchains.solana.currency.address,
    amount: 0.001,
    receiver: '5AcFMJZkXo14r3Hj99iYd1HScPiM4hAcLZf552DfZkxa',
    fee: {
      amount: '1%',
      receiver: '5s3M1WuqLyHYGPBnHuaEfFdd339aHtJVTKPdyRpbxHE2'
    },
    fee2: {
      amount: '3%',
      receiver: '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk'
    },
    protocolFee: '1.5%'
  }],
  from: {
    solana: '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1',
  }
})

let transaction = await paymentRoutes[2].getTransaction()

let wallet = (await Web3Wallets.getWallets())[1]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeRaydiumCPSwap (TOKEN<>TOKEN)

???

```javascript
let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: '2YxixFk9sdoB9BPXpkeyW53fE3Kqo9U1mQ46S3z2bEYE',
    amount: 1,
    receiver: '3YrWvZAwNiBcMi6PigTRNHRuiTJ8jatwxgRYEx784oHW',
    fee: {
      amount: '5%',
      receiver: '5s3M1WuqLyHYGPBnHuaEfFdd339aHtJVTKPdyRpbxHE2'
    },
    fee2: {
      amount: '3%',
      receiver: '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk'
    },
    protocolFee: '1%'
  }],
  from: {
    solana: '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1',
  }
})

let transaction = await paymentRoutes[0].getTransaction()

let wallet = (await Web3Wallets.getWallets())[1]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeRaydiumCPSwap (SOL->WSOL<>TOKEN)

???

## routeRaydiumCPSwapSolOut (TOKEN<>WSOL->SOL)

???

```javascript
let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: Web3Blockchains.solana.currency.address,
    amount: 0.0001,
    receiver: '3YrWvZAwNiBcMi6PigTRNHRuiTJ8jatwxgRYEx784oHW',
    fee: {
      amount: '5%',
      receiver: '5s3M1WuqLyHYGPBnHuaEfFdd339aHtJVTKPdyRpbxHE2'
    },
    fee2: {
      amount: '3%',
      receiver: '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk'
    },
    protocolFee: '1%'
  }],
  from: {
    solana: '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1',
  }
})

let transaction = await paymentRoutes[1].getTransaction()

let wallet = (await Web3Wallets.getWallets())[1]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeRaydiumCPTwoHopSwap (TOKEN<>TOKEN<>TOKEN)

??? PENDING (to be added in web3-exchanges first)

## routeRaydiumCPTwoHopSwapSolIn (SOL->WSOL<>TOKEN<>TOKEN)

??? PENDING (no intermediary USDC/USDT to WSOL on CP yet, to be added in web3-exchanges first)

## routeRaydiumCPTwoHopSwapSolOut (TOKEN<>TOKEN<>WSOL->SOL)

??? PENDING (no intermediary USDC/USDT to WSOL on CP yet, to be added in web3-exchanges first)

## routeRaydiumCLSwap (TOKEN<>TOKEN)

✓ v3 tested: https://solscan.io/tx/4gJYBBMhdgriMnpSK5pHUCCb3XSDF2XaWhWentdvZDQ7QePPobj8BdyrtMVNjmPPc8xGBP2kA8XsrymthzPoR5Hs???

```javascript
let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    amount: 0.01,
    receiver: '3YrWvZAwNiBcMi6PigTRNHRuiTJ8jatwxgRYEx784oHW',
    fee: {
      amount: '5%',
      receiver: '5s3M1WuqLyHYGPBnHuaEfFdd339aHtJVTKPdyRpbxHE2'
    },
    fee2: {
      amount: '3%',
      receiver: '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk'
    },
    protocolFee: '1%'
  }],
  from: {
    solana: '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1',
  }
})

let transaction = await paymentRoutes[3].getTransaction()

let wallet = (await Web3Wallets.getWallets())[1]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeRaydiumCLSwapSolIn (SOL->WSOL<>TOKEN)

✓ v3 tested: https://solscan.io/tx/3bWAGv5PJGeBrJ2kwE1hntajLM76VBEZNQcKj1s6BNS1LKNwY6PnUaGdsz9TSjj7UMK5CW8fxwdLMLKsxiUPi5Tp

```javascript
let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: 'MEFNBXixkEbait3xn9bkm8WsJzXtVsaJEn4c8Sam21u',
    amount: 0.01,
    receiver: '3YrWvZAwNiBcMi6PigTRNHRuiTJ8jatwxgRYEx784oHW',
    fee: {
      amount: '5%',
      receiver: '5s3M1WuqLyHYGPBnHuaEfFdd339aHtJVTKPdyRpbxHE2'
    },
    fee2: {
      amount: '3%',
      receiver: '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk'
    },
    protocolFee: '1%'
  }],
  from: {
    solana: '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1',
  }
})

let transaction = await paymentRoutes[0].getTransaction()

let wallet = (await Web3Wallets.getWallets())[1]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeRaydiumCLSwapSolOut (TOKEN<>WSOL->SOL)

✓ v3 tested: https://solscan.io/tx/5Q2ZRFEbGwZU7734xNgguPhGiSw66DforwZQhWhfNdvfFC25fLUopPHhYi3JzZbGrfJ8WwyZJns3untSS1tXxDLu

```javascript
let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: Web3Blockchains.solana.currency.address,
    amount: 0.0001,
    receiver: '3YrWvZAwNiBcMi6PigTRNHRuiTJ8jatwxgRYEx784oHW',
    fee: {
      amount: '5%',
      receiver: '5s3M1WuqLyHYGPBnHuaEfFdd339aHtJVTKPdyRpbxHE2'
    },
    fee2: {
      amount: '3%',
      receiver: '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk'
    },
    protocolFee: '1%'
  }],
  from: {
    solana: '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1',
  }
})

let transaction = await paymentRoutes[2].getTransaction()

let wallet = (await Web3Wallets.getWallets())[1]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeRaydiumCLTwoHopSwap (TOKEN<>TOKEN<>TOKEN)

✓ v3 tested: https://solscan.io/tx/mdnkSbQ3VKgX834gW8rL5yEdGtZrxyMEd1Y3iqforsV2jJAC1nAHh1BE6dnj2A57wbE42ZknjGNpJGUoAoTexNU

```javascript
let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: 'BLUv63M5ib2U62EeYhjHgC5dBe5cbW87TbeCQEqjpoDe',
    amount: 0.05,
    receiver: '3YrWvZAwNiBcMi6PigTRNHRuiTJ8jatwxgRYEx784oHW',
    fee: {
      amount: '5%',
      receiver: '5s3M1WuqLyHYGPBnHuaEfFdd339aHtJVTKPdyRpbxHE2'
    },
    fee2: {
      amount: '3%',
      receiver: '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk'
    },
    protocolFee: '1%'
  }],
  from: {
    solana: '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1',
  }
})

let transaction = await paymentRoutes[1].getTransaction()

let wallet = (await Web3Wallets.getWallets())[1]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeRaydiumCLTwoHopSwapSolIn (SOL->WSOL<>TOKEN<>TOKEN)

✓ v3 tested: https://solscan.io/tx/rSSAfFCUf9wxSNZhouzXPFzYhqw1XNvKzK9VJYysHT8V7BsoHDAbZkBStUdrN3Y1Rzhq8TozruQbZKK2Z7N18RF

```javascript
let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: 'BLUv63M5ib2U62EeYhjHgC5dBe5cbW87TbeCQEqjpoDe',
    amount: 0.05,
    receiver: '3YrWvZAwNiBcMi6PigTRNHRuiTJ8jatwxgRYEx784oHW',
    fee: {
      amount: '5%',
      receiver: '5s3M1WuqLyHYGPBnHuaEfFdd339aHtJVTKPdyRpbxHE2'
    },
    fee2: {
      amount: '3%',
      receiver: '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk'
    },
    protocolFee: '1%'
  }],
  from: {
    solana: '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1',
  }
})

let transaction = await paymentRoutes[0].getTransaction()

let wallet = (await Web3Wallets.getWallets())[1]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeRaydiumCLTwoHopSwapSolOut (TOKEN<>TOKEN<>WSOL->SOL)

✓ v3 tested: https://solscan.io/tx/2G9JkV6oLr8UvFwEjtXoUM2piFZeVoWQ6eGzeCVUBiocYrYW465JNMFQeEmc9r9JoqmfWAZc36GUSJqgdKWGKKEf

```javascript
let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: Web3Blockchains.solana.currency.address,
    amount: 0.0001,
    receiver: '3YrWvZAwNiBcMi6PigTRNHRuiTJ8jatwxgRYEx784oHW',
    fee: {
      amount: '5%',
      receiver: '5s3M1WuqLyHYGPBnHuaEfFdd339aHtJVTKPdyRpbxHE2'
    },
    fee2: {
      amount: '3%',
      receiver: '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk'
    },
    protocolFee: '1%'
  }],
  from: {
    solana: '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1',
  }
})

let transaction = await paymentRoutes[2].getTransaction()

let wallet = (await Web3Wallets.getWallets())[1]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```
