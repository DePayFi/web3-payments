// lower blockchain cost is better
const getBlockchainCost = (blockchain) => {
  // in $USD
  switch(blockchain) {
    case 'solana':
      return 0.000125
      break;
    case 'gnosis':
      return 0.009
      break;
    case 'polygon':
      return 0.01
      break;
    case 'fantom':
      return 0.05
      break;
    case 'avalanche':
      return 0.10
      break;
    case 'bsc':
      return 0.20
      break;
    case 'arbitrum':
      return 0.30
      break;
    case 'optimism':
      return 0.40
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
