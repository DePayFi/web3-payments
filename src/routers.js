/*#if _EVM

import evmRouters from './platforms/evm/routers'
let solanaRouters = {}

/*#elif _SOLANA

let evmRouters = {}
import solanaRouters from './platforms/evm/routers'

//#else */

import evmRouters from './platforms/evm/routers'
import solanaRouters from './platforms/solana/routers'

//#endif

export default {... evmRouters, solanaRouters}

