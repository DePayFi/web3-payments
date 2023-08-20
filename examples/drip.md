```javascript
let paymentRoutes = await Web3Payments.route({
  accept: [
    {
      blockchain: 'bsc',
      token: Web3Blockchains.bsc.currency.address,
      amount: 0.1,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950',
    },
    {
      blockchain: 'avalanche',
      token: Web3Blockchains.avalanche.currency.address,
      amount: 0.1,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950',
    },
    {
      blockchain: 'ethereum',
      token: Web3Blockchains.ethereum.currency.address,
      amount: 0.1,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950',
    },
    {
      blockchain: 'gnosis',
      token: Web3Blockchains.gnosis.currency.address,
      amount: 0.1,
      toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950',
    },
  ],
  from: {
    bsc: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
    avalanche: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
    gnosis: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
    ethereum: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
  },
  drip: (route)=>{
    console.log('DRIP', route)
  }
})
```
