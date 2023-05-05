

export default {
  solana: {
    payment: {
      address: '0x99F3F4685a7178F26EB4F4Ca8B75a1724F1577B9'
    },
    weth: {
      wrap: { address: '0xF4cc97D00dD0639c3e383D7CafB3d815616cbB2C' },
      unwrap: { address: '0xcA575c6C5305e8127F3D376bb22776eAD370De4a' },
    },
    uniswap_v2: {
      address: '0xe04b08Dfc6CaA0F4Ec523a3Ae283Ece7efE00019',
      prepareTransaction: ()=>{}
    },
    paymentWithEvent: {
      address: '0xD8fBC10787b019fE4059Eb5AA5fB11a5862229EF'
    },
    paymentFee: {
      address: '0x874Cb669D7BFff79d4A6A30F4ea52c5e413BD6A7',
    },
    paymentFeeWithEvent: {
      address: '0x981cAd45c768d56136FDBb2C5E115F33D971bE6C'
    }
  },
}
