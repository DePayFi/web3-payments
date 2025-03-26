/*#if _EVM

let supported = ['ethereum', 'bsc', 'polygon', 'arbitrum', 'avalanche', 'gnosis', 'optimism', 'base', 'worldchain']
supported.evm = ['ethereum', 'bsc', 'polygon', 'arbitrum', 'avalanche', 'gnosis', 'optimism', 'base', 'worldchain']
supported.svm = []

/*#elif _SVM

let supported = ['solana']
supported.evm = []
supported.svm = ['solana']

//#else */

let supported = ['ethereum', 'bsc', 'polygon', 'solana', 'arbitrum', 'avalanche', 'gnosis', 'optimism', 'base', 'worldchain']
supported.evm = ['ethereum', 'bsc', 'polygon', 'arbitrum', 'avalanche', 'gnosis', 'optimism', 'base', 'worldchain']
supported.svm = ['solana']

//#endif

export { supported }
