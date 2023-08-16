const API = [{"inputs":[{"internalType":"address","name":"_PERMIT2","type":"address"},{"internalType":"address","name":"_FORWARDER","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"exchange","type":"address"}],"name":"Disabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"exchange","type":"address"}],"name":"Enabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"FORWARDER","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERMIT2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"exchange","type":"address"},{"internalType":"bool","name":"enabled","type":"bool"}],"name":"enable","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"exchanges","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"bool","name":"permit2","type":"bool"},{"internalType":"uint256","name":"paymentAmount","type":"uint256"},{"internalType":"uint256","name":"feeAmount","type":"uint256"},{"internalType":"address","name":"tokenInAddress","type":"address"},{"internalType":"address","name":"exchangeAddress","type":"address"},{"internalType":"address","name":"tokenOutAddress","type":"address"},{"internalType":"address","name":"paymentReceiverAddress","type":"address"},{"internalType":"address","name":"feeReceiverAddress","type":"address"},{"internalType":"uint8","name":"exchangeType","type":"uint8"},{"internalType":"uint8","name":"receiverType","type":"uint8"},{"internalType":"bytes","name":"exchangeCallData","type":"bytes"},{"internalType":"bytes","name":"receiverCallData","type":"bytes"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct IDePayRouterV2.Payment","name":"payment","type":"tuple"}],"name":"pay","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"bool","name":"permit2","type":"bool"},{"internalType":"uint256","name":"paymentAmount","type":"uint256"},{"internalType":"uint256","name":"feeAmount","type":"uint256"},{"internalType":"address","name":"tokenInAddress","type":"address"},{"internalType":"address","name":"exchangeAddress","type":"address"},{"internalType":"address","name":"tokenOutAddress","type":"address"},{"internalType":"address","name":"paymentReceiverAddress","type":"address"},{"internalType":"address","name":"feeReceiverAddress","type":"address"},{"internalType":"uint8","name":"exchangeType","type":"uint8"},{"internalType":"uint8","name":"receiverType","type":"uint8"},{"internalType":"bytes","name":"exchangeCallData","type":"bytes"},{"internalType":"bytes","name":"receiverCallData","type":"bytes"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct IDePayRouterV2.Payment","name":"payment","type":"tuple"},{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"uint48","name":"expiration","type":"uint48"},{"internalType":"uint48","name":"nonce","type":"uint48"}],"internalType":"struct IPermit2.PermitDetails","name":"details","type":"tuple"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"sigDeadline","type":"uint256"}],"internalType":"struct IPermit2.PermitSingle","name":"permitSingle","type":"tuple"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"pay","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]

export default {

  ethereum: {
    address: '0xF491525C7655f362716335D526E57b387799d058',
    api: API
  },

  bsc: {
    address: '0xdb3f47b1D7B577E919D639B4FD0EBcEFD4aABb70',
    api: API
  },

  polygon: {
    address: '0x39E7C98BF4ac3E4C394dD600397f5f7Ee3779BE8',
    api: API
  },

  fantom: {
    address: '0x78C0F1c712A9AA2004C1F401A7307d8bCB62abBd',
    api: API
  },

  avalanche: {
    address: '0x5EC3153BACebb5e49136cF2d457f26f5Df1B6780',
    api: API
  },

  gnosis: {
    address: '0x5EC3153BACebb5e49136cF2d457f26f5Df1B6780',
    api: API
  },

  arbitrum: {
    address: '0x5EC3153BACebb5e49136cF2d457f26f5Df1B6780',
    api: API
  },

  optimism: {
    address: '0x5EC3153BACebb5e49136cF2d457f26f5Df1B6780',
    api: API
  },

}
