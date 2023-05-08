
## routeSol

```javascript
await Web3Client.setProviderEndpoints('solana', ['https://api.devnet.solana.com'])
Web3Blockchains.solana.stables.usd = ['BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k', 'H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm']
Web3Blockchains.solana.tokens[1].address = 'BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k'
Web3Blockchains.solana.tokens[2].address = 'H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm'

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: Web3Blockchains.solana.currency.address,
    amount: 0.1,
    toAddress: '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk',
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
await Web3Client.setProviderEndpoints('solana', ['https://api.devnet.solana.com'])
Web3Blockchains.solana.stables.usd = ['BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k', 'H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm']
Web3Blockchains.solana.tokens[1].address = 'BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k'
Web3Blockchains.solana.tokens[2].address = 'H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm'

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: 'BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k',
    amount: 0.01,
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

Make sure you do not have devUSDT in your wallet.

```javascript
await Web3Client.setProviderEndpoints('solana', ['https://api.devnet.solana.com'])
Web3Blockchains.solana.stables.usd = ['BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k', 'H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm']
Web3Blockchains.solana.tokens[1].address = 'BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k'
Web3Blockchains.solana.tokens[2].address = 'H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm'

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: 'H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm',
    amount: 1,
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

```javascript
await Web3Client.setProviderEndpoints('solana', ['https://api.devnet.solana.com'])
Web3Blockchains.solana.stables.usd = ['BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k', 'H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm']
Web3Blockchains.solana.tokens[1].address = 'BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k'
Web3Blockchains.solana.tokens[2].address = 'H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm'

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: 'BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k',
    amount: 0.5,
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

## routeOrcaSwap (SOL->WSOL<>TOKEN)

```javascript
await Web3Client.setProviderEndpoints('solana', ['https://api.devnet.solana.com'])
Web3Blockchains.solana.stables.usd = ['BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k', 'H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm']
Web3Blockchains.solana.tokens[1].address = 'BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k'
Web3Blockchains.solana.tokens[2].address = 'H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm'

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: 'BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k',
    amount: 0.5,
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

## routeOrcaSwap (TOKEN<>WSOL->SOL)

```javascript
await Web3Client.setProviderEndpoints('solana', ['https://api.devnet.solana.com'])
Web3Blockchains.solana.stables.usd = ['BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k', 'H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm']
Web3Blockchains.solana.tokens[1].address = 'BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k'
Web3Blockchains.solana.tokens[2].address = 'H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm'

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: Web3Blockchains.solana.currency.address,
    amount: 0.1,
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

let transaction = await paymentRoutes[0].getTransaction()

let wallet = (await Web3Wallets.getWallets())[0]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeOrcaTwoHopSwap (TOKEN<>TOKEN<>WSOL->SOL)

```javascript
await Web3Client.setProviderEndpoints('solana', ['https://api.devnet.solana.com'])
Web3Blockchains.solana.stables.usd = ['BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k', 'H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm']
Web3Blockchains.solana.tokens[1].address = 'BRjpCHtyQLNCo8gqRUr8jtdAj5AjPYQaoqbvcZiHok1k'
Web3Blockchains.solana.tokens[2].address = 'H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm'

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: 'Jd4M8bfJG3sAkd82RsGWyEXoaBXQP7njFzBwEaCTuDa',
    amount: 1,
    toAddress: '5AcFMJZkXo14r3Hj99iYd1HScPiM4hAcLZf552DfZkxa',
  }],
  from: {
    solana: '2UgCJaHU5y8NC4uWQcZYeV9a5RyYLF7iKYCybCsdFFD1',
  }
})

let transaction = await paymentRoutes[0].getTransaction()

console.log('transaction', transaction)

let wallet = (await Web3Wallets.getWallets())[0]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```
