const API = [{"inputs":[{"internalType":"address","name":"_PERMIT2","type":"address"},{"internalType":"address","name":"_FORWARDER","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"ExchangeCallFailed","type":"error"},{"inputs":[],"name":"ExchangeCallMissing","type":"error"},{"inputs":[],"name":"ExchangeNotApproved","type":"error"},{"inputs":[],"name":"ForwardingPaymentFailed","type":"error"},{"inputs":[],"name":"InsufficientBalanceInAfterPayment","type":"error"},{"inputs":[],"name":"InsufficientBalanceOutAfterPayment","type":"error"},{"inputs":[],"name":"NativeFeePaymentFailed","type":"error"},{"inputs":[],"name":"NativePaymentFailed","type":"error"},{"inputs":[],"name":"PaymentDeadlineReached","type":"error"},{"inputs":[],"name":"PaymentToZeroAddressNotAllowed","type":"error"},{"inputs":[],"name":"WrongAmountPaidIn","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"exchange","type":"address"}],"name":"Disabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"exchange","type":"address"}],"name":"Enabled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"FORWARDER","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERMIT2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"exchange","type":"address"},{"internalType":"bool","name":"enabled","type":"bool"}],"name":"enable","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"exchanges","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"bool","name":"permit2","type":"bool"},{"internalType":"uint256","name":"paymentAmount","type":"uint256"},{"internalType":"uint256","name":"feeAmount","type":"uint256"},{"internalType":"address","name":"tokenInAddress","type":"address"},{"internalType":"address","name":"exchangeAddress","type":"address"},{"internalType":"address","name":"tokenOutAddress","type":"address"},{"internalType":"address","name":"paymentReceiverAddress","type":"address"},{"internalType":"address","name":"feeReceiverAddress","type":"address"},{"internalType":"uint8","name":"exchangeType","type":"uint8"},{"internalType":"uint8","name":"receiverType","type":"uint8"},{"internalType":"bytes","name":"exchangeCallData","type":"bytes"},{"internalType":"bytes","name":"receiverCallData","type":"bytes"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct IDePayRouterV2.Payment","name":"payment","type":"tuple"}],"name":"pay","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"payable","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"bool","name":"permit2","type":"bool"},{"internalType":"uint256","name":"paymentAmount","type":"uint256"},{"internalType":"uint256","name":"feeAmount","type":"uint256"},{"internalType":"address","name":"tokenInAddress","type":"address"},{"internalType":"address","name":"exchangeAddress","type":"address"},{"internalType":"address","name":"tokenOutAddress","type":"address"},{"internalType":"address","name":"paymentReceiverAddress","type":"address"},{"internalType":"address","name":"feeReceiverAddress","type":"address"},{"internalType":"uint8","name":"exchangeType","type":"uint8"},{"internalType":"uint8","name":"receiverType","type":"uint8"},{"internalType":"bytes","name":"exchangeCallData","type":"bytes"},{"internalType":"bytes","name":"receiverCallData","type":"bytes"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"internalType":"struct IDePayRouterV2.Payment","name":"payment","type":"tuple"},{"components":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint160","name":"amount","type":"uint160"},{"internalType":"uint48","name":"expiration","type":"uint48"},{"internalType":"uint48","name":"nonce","type":"uint48"}],"internalType":"struct IPermit2.PermitDetails","name":"details","type":"tuple"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"sigDeadline","type":"uint256"}],"internalType":"struct IPermit2.PermitSingle","name":"permitSingle","type":"tuple"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"pay","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"pendingOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]

export default {

  ethereum: {
    address: '0xcbfc518FB621828fa6f0F4647D42931476ea473b',
    api: API
  },

  bsc: {
    address: '0xAc68Ee6Bc43Bf075C0522a15E665547CFd28628D',
    api: API
  },

  polygon: {
    address: '0x1eD1e2dEEEa8B5C802663780284eDa63f62A3825',
    api: API
  },

  fantom: {
    address: '0x8B127D169D232D5F3ebE1C3D06CE343FD7C1AA11',
    api: API
  },

  avalanche: {
    address: '0x8B127D169D232D5F3ebE1C3D06CE343FD7C1AA11',
    api: API
  },

  gnosis: {
    address: '0x8B127D169D232D5F3ebE1C3D06CE343FD7C1AA11',
    api: API
  },

  arbitrum: {
    address: '0x47dF3990e8827EfF23b01e1CD7de309E8C6364a2',
    api: API
  },

  optimism: {
    address: '0x47dF3990e8827EfF23b01e1CD7de309E8C6364a2',
    api: API
  },

  base: {
    address: '0xfAD2F276D464EAdB71435127BA2c2e9dDefb93a4',
    api: API
  },

}
