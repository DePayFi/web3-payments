// lower blockchain cost is better
const getBlockchainCost = (blockchain) => {
  // in $USD
  switch(blockchain) {
    case 'solana':
      return 0.000125
      break;
    case 'worldchain':
      return 0.0043
      break;
    case 'gnosis':
      return 0.0090
      break;
    case 'base':
      return 0.0095
      break;
    case 'optimism':
      return 0.0096
      break;
    case 'polygon':
      return 0.011
      break;
    case 'fantom':
      return 0.05
      break;
    case 'avalanche':
      return 0.10
      break;
    case 'arbitrum':
      return 0.11
      break;
    case 'bsc':
      return 0.20
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
