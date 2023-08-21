```javascript
let paymentRoutes = await Web3Payments.route({
  accept: [
     {
        blockchain: 'polygon',
        amount: 0.01,
        token: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
      },
      {
        blockchain: 'bsc',
        amount: 0.01,
        token: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
        toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
      },
      {
        blockchain: 'ethereum',
        amount: 0.01,
        token: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
      },
      {
        blockchain: 'solana',
        amount: 0.001,
        token: '11111111111111111111111111111111',
        toAddress: '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk'
      },
      {
        blockchain: 'optimism',
        amount: 0.001,
        token: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
        toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
      },
      {
        blockchain: 'arbitrum',
        amount: 0.001,
        token: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
      },
      {
        blockchain: 'fantom',
        amount: 0.001,
        token: '0x28a92dde19D9989F39A49905d7C9C2FAc7799bDf',
        toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
      },
      {
        blockchain: 'avalanche',
        amount: 0.001,
        token: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
        toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
      },
      {
        blockchain: 'gnosis',
        amount: 0.001,
        token: '0x4ECaBa5870353805a9F068101A40E0f32ed605C6',
        toAddress: '0x08B277154218CCF3380CAE48d630DA13462E3950'
      },
  ],
  from: {
    bsc: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
    avalanche: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
    gnosis: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
    ethereum: '0x317D875cA3B9f8d14f960486C0d1D1913be74e90',
    solana: '3Hrw6AsNyJAp71Nkgo4tzJwvGM47DzqMdAtf8ojptkXk',
  },
  drip: (route)=>{
    console.log('DRIP', route)
  }
})

console.log('ALL', paymentRoutes)
```
