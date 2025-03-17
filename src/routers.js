/*#if _EVM

import evmRouters from './platforms/evm/routers'
let solanaRouters = {}

/*#elif _SVM

let evmRouters = {}
import solanaRouters from './platforms/evm/routers'

//#else */

import evmRouters from './platforms/evm/routers'
import solanaRouters from './platforms/svm/routers'

//#endif

export default {... evmRouters, ...solanaRouters}

