// lower blockchain cost is better
const getBlockchainCost = (blockchain) => {
  // in $USD
  switch(blockchain) {
    case 'solana':
      return 0.0097
      break;
    case 'worldchain':
      return 0.0032
      break;
    case 'gnosis':
      return 0.00033
      break;
    case 'base':
      return 0.0033
      break;
    case 'optimism':
      return 0.03
      break;
    case 'polygon':
      return 0.011
      break;
    case 'fantom':
      return 0.0017
      break;
    case 'avalanche':
      return 0.18
      break;
    case 'arbitrum':
      return 0.03
      break;
    case 'bsc':
      return 0.39
      break;
    case 'ethereum':
      return 10.0
      break;
    default:
      return 100
  }
}

export {
  getBlockchainCost
}
