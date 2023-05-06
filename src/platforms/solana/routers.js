import { BN, struct, u64, u128, bool } from '@depay/solana-web3.js'

export default {
  solana: {
    address: 'DePayRG7ZySPWzeK9Kvq7aPeif7sdbBZNh6DHcvNj7F7',
    api: {
      createPaymentsAccount: {
        anchorDiscriminator: new BN("8445995362644372894"),
        layout: struct([
          u64("anchorDiscriminator"),
        ])
      },
      createEscrowAccount: {
        anchorDiscriminator: new BN("103653380020343698"),
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
        ])
      },
      routeToken: {
        anchorDiscriminator: new BN("13483873682232752277"),
        layout: struct([
          u64("anchorDiscriminator"),
          u64("nonce"),
          u64("paymentAmount"),
          u64("feeAmount"),
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
        ])
      }
    }
  },
}
