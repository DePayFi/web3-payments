import Blockchains from '@depay/web3-blockchains'

const prepareUniswapTransaction = (transaction)=>{
  transaction.params.path = transaction.params.path.filter((token, index, path)=>{
    if(
      index == 1 &&
      token == Blockchains[transaction.blockchain].wrapped.address &&
      path[0] == Blockchains[transaction.blockchain].currency.address
    ) { 
      return false
    } else if (
      index == path.length-2 &&
      token == Blockchains[transaction.blockchain].wrapped.address &&
      path[path.length-1] == Blockchains[transaction.blockchain].currency.address
    ) {
      return false
    } else {
      return true
    }
  })
  return transaction
}

const plugins = {}

export default {
  ethereum: {
    payment: {
      address: '0x99F3F4685a7178F26EB4F4Ca8B75a1724F1577B9'
    },
    weth: {
      wrap: { address: '0xF4cc97D00dD0639c3e383D7CafB3d815616cbB2C' },
      unwrap: { address: '0xcA575c6C5305e8127F3D376bb22776eAD370De4a' },
    },
    uniswap_v2: {
      address: '0xe04b08Dfc6CaA0F4Ec523a3Ae283Ece7efE00019',
      prepareTransaction: prepareUniswapTransaction
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
  bsc: {
    payment: {
      address: '0x8B127D169D232D5F3ebE1C3D06CE343FD7C1AA11',
    },
    wbnb: {
      wrap: { address: '0xf361888459a4C863a8498ee344C2688C9196Be51' },
      unwrap: { address: '0x65693291C20271f5e5030261766D1D6b3AC9d44E' },
    },
    pancakeswap: {
      address: '0xAC3Ec4e420DD78bA86d932501E1f3867dbbfb77B',
      prepareTransaction: prepareUniswapTransaction
    },
    paymentWithEvent: {
      address: '0x1869E236c03eE67B9FfEd3aCA139f4AeBA79Dc21'
    },
    paymentFee: {
      address: '0xae33f10AD57A38113f74FCdc1ffA6B1eC47B94E3',
    },
    paymentFeeWithEvent: {
      address: '0xF1a05D715AaBFA380543719F7bA8754d0331c5A9'
    }
  },
  polygon: {
    payment: {
      address: '0x78C0F1c712A9AA2004C1F401A7307d8bCB62abBd'
    },
    wmatic: {
      wrap: { address: '0x8B62F604499c1204573664447D445690E0A0011b' },
      unwrap: { address: '0x2fd0a07a4F73285d0eBa8176426BF9B8c0121206' },
    },
    quickswap: {
      address: '0x0Dfb7137bC64b63F7a0de7Cb9CDa178702666220',
      prepareTransaction: prepareUniswapTransaction
    },
    paymentWithEvent: {
      address: '0xfAD2F276D464EAdB71435127BA2c2e9dDefb93a4'
    },
    paymentFee: {
      address: '0xd625c7087E940b2A91ed8bD8db45cB24D3526B56',
    },
    paymentFeeWithEvent: {
      address: '0xBC56ED8E32b64a33f64Ed7A5fF9EACdFC117e07a'
    }
  },
}
