/*#if _EVM

import evmPlugins from './platforms/evm/plugins'
let solanaPlugins = {}

/*#elif _SOLANA

let evmPlugins = {}
import solanaPlugins from './platforms/solana/plugins'

//#else */

import evmPlugins from './platforms/evm/plugins'
import solanaPlugins from './platforms/solana/plugins'

//#endif

export default {... evmPlugins, solanaPlugins}

