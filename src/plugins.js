/*#if _EVM

import evmPlugins from './platforms/evm/plugins'

/*#elif _SOLANA

let evmPlugins = {}

//#else */

import evmPlugins from './platforms/evm/plugins'

//#endif

export default {... evmPlugins}

