import { BN, struct, u8, i64, u64, u128, bool } from '@depay/solana-web3.js'

export default {
  solana: {
    address: 'DePayR1gQfDmViCPKctnZXNtUgqRwnEqMax8LX9ho1Zg',
    exchanges: {
      orca: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
      raydiumCP: 'CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C',
      raydiumCL: 'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK',
    },
    alt: '8bYq3tcwX1NM2K2JYMjrEqAPtCXFPCjzPazFothc618e',
    api: {
      createEscrowSolAccount: {
        anchorDiscriminator: new BN("2482112285991870004"),
        layout: struct([
          u64("anchorDiscriminator"),
        ])
      },
      createEscrowTokenAccount: {
        anchorDiscriminator: new BN("16156440424245087"),
        layout: struct([
          u64("anchorDiscriminator"),
        ])
      },
      routeSol: {
        anchorDiscriminator: new BN("6497164560834983274"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeToken: {
        anchorDiscriminator: new BN("13483873682232752277"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeOrcaSwap: {
        anchorDiscriminator: new BN("9797248061404332986"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountIn"),
          bool("aToB"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeOrcaSwapSolOut: {
        anchorDiscriminator: new BN("13662217913752830165"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountIn"),
          bool("aToB"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeOrcaSwapSolIn: {
        anchorDiscriminator: new BN("16115018480206947614"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountIn"),
          bool("aToB"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeOrcaTwoHopSwap: {
        anchorDiscriminator: new BN("15695720599845325801"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountInOne"),
          u64("amountInTwo"),
          bool("aToBOne"),
          bool("aToBTwo"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeOrcaTwoHopSwapSolOut: {
        anchorDiscriminator: new BN("15074061855608091530"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountInOne"),
          u64("amountInTwo"),
          bool("aToBOne"),
          bool("aToBTwo"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeOrcaTwoHopSwapSolIn: {
        anchorDiscriminator: new BN("2678451299937372540"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountInOne"),
          u64("amountInTwo"),
          bool("aToBOne"),
          bool("aToBTwo"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeRaydiumClSwap: {
        anchorDiscriminator: new BN("2954182973248174268"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountIn"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeRaydiumClSwapSolOut: {
        anchorDiscriminator: new BN("18389700643710627390"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountIn"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeRaydiumClSwapSolIn: {
        anchorDiscriminator: new BN("564150378912976829"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountIn"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeRaydiumClTwoHopSwap: {
        anchorDiscriminator: new BN("3828760301615328551"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountInOne"),
          u64("amountInTwo"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
          u8("remainingAccountsSplit"),
        ])
      },
      routeRaydiumClTwoHopSwapSolOut: {
        anchorDiscriminator: new BN("11373220799455718953"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountInOne"),
          u64("amountInTwo"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
          u8("remainingAccountsSplit"),
        ])
      },
      routeRaydiumClTwoHopSwapSolIn: {
        anchorDiscriminator: new BN("1635173573630140652"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountInOne"),
          u64("amountInTwo"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
          u8("remainingAccountsSplit"),
        ])
      },
      routeRaydiumCpSwap: {
        anchorDiscriminator: new BN("7437765211943645137"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountIn"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeRaydiumCpSwapSolOut: {
        anchorDiscriminator: new BN("9045257739866411286"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountIn"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeRaydiumCpSwapSolIn: {
        anchorDiscriminator: new BN("432305509198797158"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountIn"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeRaydiumCpTwoHopSwap: {
        anchorDiscriminator: new BN("3384279312781294015"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountInOne"),
          u64("amountInTwo"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeRaydiumCpTwoHopSwapSolOut: {
        anchorDiscriminator: new BN("18428464202744806632"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountInOne"),
          u64("amountInTwo"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      },
      routeRaydiumCpTwoHopSwapSolIn: {
        anchorDiscriminator: new BN("16266677464406446072"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("amountInOne"),
          u64("amountInTwo"),
          u64("paymentAmount"),
          u64("feeAmount"),
          u64("feeAmount2"),
          u64("protocolAmount"),
          i64("deadline"),
        ])
      }
    }
  },
}
