## routeSol

https://solscan.io/tx/4AxQNUvKuphLzS17DerWgF9KvTHStAW5mDLjskng8s7QZ3VN76QYmxQGNFcgf48wwVHoRf6GUho5GMi5fTsaP6mN

```javascript

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: Web3Blockchains.solana.currency.address,
    amount: 0.001,
    receiver: '5AcFMJZkXo14r3Hj99iYd1HScPiM4hAcLZf552DfZkxa',
    fee: {
      amount: '1%',
      receiver: '3YrWvZAwNiBcMi6PigTRNHRuiTJ8jatwxgRYEx784oHW'
    },
    fee2: {
      amount: '2%',
      receiver: '5AcFMJZkXo14r3Hj99iYd1HScPiM4hAcLZf552DfZkxa'
    },
    protocolFee: '4%'
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

https://solscan.io/tx/573aH6iUHToDvRQtJbsmB8jpi2yk2YYeJpkK8YAaZwxvVGEhmFurfo4ytJkAAMEEge7y3MwZcUebxpLvAmKSVdrj

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

https://solscan.io/tx/2b1rAmfJf5SiCMxPsRkBWeWhKGEyV9nenpq1yP9SPxGyVBirQeSxRXxvvsd8a9j3CUskEcLiE25iJGf1Vvw1SDo2

```javascript

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: 'A1KLoBrKBde8Ty9qtNQUtq3C2ortoC3u7twggz7sEto6',
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

## routeOrcaSwapSolIn (SOL->WSOL<>TOKEN)

https://solscan.io/tx/3jHP99jQvpSLFkLJai71aYx3a3BszeJM1QK46DBcH6h2kBCYYL5TsMonZTaahaV89bNbexhxzqY9oqyuQdcM6As6


```javascript

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
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

https://solscan.io/tx/2MEukCUZXxpKmWo7NWXg6jt2sWHV9UqcK9rpSB7mXa2KbUzJijwWaF9dse4MQS7RbscZSWDXjAWAr8JVKkboC6jr

```javascript

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: Web3Blockchains.solana.currency.address,
    amount: 0.0001,
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

let transaction = await paymentRoutes[2].getTransaction()

let wallet = (await Web3Wallets.getWallets())[1]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeOrcaTwoHopSwap (TOKEN<>TOKEN<>TOKEN)

https://solscan.io/tx/5hxnYRqKZYY9NCtoMzkLpxFgJLbrHe5W1mxKsaHUBds7wzVZWdoRe7CB6p4j948UP2GKpX1vUPvis9qqB4yyEWH8

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

## routeOrcaTwoHopSwap (SOL->WSOL<>TOKEN<>TOKEN)

https://solscan.io/tx/k7WkyGJCQ795RoNQc3tH9kcZY3vswuWRPf97Snam5trwTTQQQQpLALq8Qt6gLfeZBky3F5PSiYbodWdTU8hfXdR

```javascript

let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: 'DePay1miDBPWXs6PVQrdC5Vch2jemgEPaiyXLNLLa2NF',
    amount: 0.1,
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

https://solscan.io/tx/5hmH62HriwYSRVMrXoq4KmhEkfJbmupjEtsGtfq2KEZ8wJVQZxc7GXisYEZmATfh7n76ukeA1SSxn1G33sB55ERi

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

let transaction = await paymentRoutes[1].getTransaction()

let wallet = (await Web3Wallets.getWallets())[1]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeRaydiumCPSwap (TOKEN<>TOKEN)

https://solscan.io/tx/4JABxuvEnDewQzKCpEsxPVG1LH9XR6k9pctSBW2o3r88HW9MqLpvJSMwqVLwfZ3UdyCEMY46VmSxDtF2SRdPf5cu

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

let transaction = await paymentRoutes[1].getTransaction()

let wallet = (await Web3Wallets.getWallets())[1]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeRaydiumCPSwapSolIn (SOL->WSOL<>TOKEN)

https://solscan.io/tx/4ksz2HWFTAQHanyrURvn4fDifM7Xpos8u66QHgvbBGT7Nqg8ABGhVabZ4xTWvSNRo8RqKonEQznTW1SoPMwwB4kv

```javascript
let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: '7kN5FQMD8ja4bzysEgc5FXmryKd6gCgjiWnhksjHCFb3',
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
````

## routeRaydiumCPSwapSolOut (TOKEN<>WSOL->SOL)

https://solscan.io/tx/2PQgRJMxCem8C8HD6yHMB48VbvF8VThqvUwMuiAgChBiroTQeySX851k16yygb55EoUYkc6YFNZfxS5L62BrnXMn

```javascript
let paymentRoutes = await Web3Payments.route({
  accept: [{
    blockchain: 'solana',
    token: Web3Blockchains.solana.currency.address,
    amount: 0.00001,
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

## routeRaydiumCPTwoHopSwap (TOKEN<>TOKEN<>TOKEN)

??? PENDING (no intermediary USDC/USDT to WSOL on CP yet, to be added in web3-exchanges first)

## routeRaydiumCPTwoHopSwapSolIn (SOL->WSOL<>TOKEN<>TOKEN)

??? PENDING (no intermediary USDC/USDT to WSOL on CP yet, to be added in web3-exchanges first)

## routeRaydiumCPTwoHopSwapSolOut (TOKEN<>TOKEN<>WSOL->SOL)

??? PENDING (no intermediary USDC/USDT to WSOL on CP yet, to be added in web3-exchanges first)

## routeRaydiumCLSwap (TOKEN<>TOKEN)

https://solscan.io/tx/5jZShBn46yHQu8AdLJu1hJDtpLfH19dt1u2y8937F934J26mr9JpDSNiX9QjNaeV2ptaDADZzypmLFWxTHruzBX9

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

let transaction = await paymentRoutes[4].getTransaction()

let wallet = (await Web3Wallets.getWallets())[1]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeRaydiumCLSwapSolIn (SOL->WSOL<>TOKEN)

https://solscan.io/tx/4yGTbXzLvjym6xoKE7cqoB1MjJdZp9TsuDAHZVAPE43DcryVFG9kK2DUrcSZ99EzEq6w5AmkBP47NvshLo4ERRAs

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

let transaction = await paymentRoutes[1].getTransaction()

let wallet = (await Web3Wallets.getWallets())[1]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeRaydiumCLSwapSolOut (TOKEN<>WSOL->SOL)

https://solscan.io/tx/2KKwrmAsiBMdjhKtRhPJLJqJQGxZASbCb6PTk1R6AriBhN5hAT1guMNJ43ZwmLLB6mrDeNHfbat7airctCW7p98s

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

let transaction = await paymentRoutes[5].getTransaction()

let wallet = (await Web3Wallets.getWallets())[1]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```

## routeRaydiumCLTwoHopSwap (TOKEN<>TOKEN<>TOKEN)

https://solscan.io/tx/4XprhzwNT2cxWStBZAamtEbaFLWZrrvYZVV94M87uGRG1QwNGG6YQVcD42VXT24BqvboPv7Svd5r3tNX6zsQRr5F

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

https://solscan.io/tx/32t9zTEqULXR8qxY7HhNAadQDz2ECPusKDxCXGZppyTAegxoAm3riEGkHFuFjA4yQJP8yUBdgvEedEpy6dPuzVji

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

https://solscan.io/tx/5441Pd21UA2CPk7oFV2buduDgX47V3Dj1rFuN6vSqCGdLid7mvXgpjvLqWapFrvsWpj8drB2ea85aDeWoke4GYUe

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

let transaction = await paymentRoutes[3].getTransaction()

let wallet = (await Web3Wallets.getWallets())[1]

transaction.sent = (transaction)=>{ console.log('sent', transaction) }
transaction.succeeded = (transaction)=>{ console.log('succeeded', transaction) }
transaction.failed = (transaction)=>{ console.log('failed', transaction) }

wallet.sendTransaction(transaction)
```
