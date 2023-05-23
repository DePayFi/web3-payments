import { BN, struct, i64, u64, u128, bool } from '@depay/solana-web3.js'

export default {
  solana: {
    address: 'DePayRG7ZySPWzeK9Kvq7aPeif7sdbBZNh6DHcvNj7F7',
    ammProgram: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc',
    alt: 'EYGgx5fYCZtLN2pvnR4Bhn5KpMffKwyHCms4VhjSvF2K',
    api: {
      createPaymentsAccount: {
        anchorDiscriminator: new BN("8445995362644372894"),
        layout: struct([
          u64("anchorDiscriminator"),
        ])
      },
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
          u64("nonce"),
          u64("paymentAmount"),
          u64("feeAmount"),
          i64("deadline"),
        ])
      },
      routeToken: {
        anchorDiscriminator: new BN("13483873682232752277"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("nonce"),
          u64("paymentAmount"),
          u64("feeAmount"),
          i64("deadline"),
        ])
      },
      routeOrcaSwap: {
        anchorDiscriminator: new BN("9797248061404332986"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("nonce"),
          u64("amountIn"),
          u128("sqrtPriceLimit"),
          bool("amountSpecifiedIsInput"),
          bool("aToB"),
          u64("paymentAmount"),
          u64("feeAmount"),
          i64("deadline"),
        ])
      },
      routeOrcaSwapSolOut: {
        anchorDiscriminator: new BN("13662217913752830165"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("nonce"),
          u64("amountIn"),
          u128("sqrtPriceLimit"),
          bool("amountSpecifiedIsInput"),
          bool("aToB"),
          u64("paymentAmount"),
          u64("feeAmount"),
          i64("deadline"),
        ])
      },
      routeOrcaTwoHopSwap: {
        anchorDiscriminator: new BN("15695720599845325801"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("nonce"),
          u64("amountIn"),
          bool("amountSpecifiedIsInput"),
          bool("aToBOne"),
          bool("aToBTwo"),
          u128("sqrtPriceLimitOne"),
          u128("sqrtPriceLimitTwo"),
          u64("paymentAmount"),
          u64("feeAmount"),
          i64("deadline"),
        ])
      },
      routeOrcaTwoHopSwapSolOut: {
        anchorDiscriminator: new BN("15074061855608091530"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("nonce"),
          u64("amountIn"),
          bool("amountSpecifiedIsInput"),
          bool("aToBOne"),
          bool("aToBTwo"),
          u128("sqrtPriceLimitOne"),
          u128("sqrtPriceLimitTwo"),
          u64("paymentAmount"),
          u64("feeAmount"),
          i64("deadline"),
        ])
      }
    }
  },
}
