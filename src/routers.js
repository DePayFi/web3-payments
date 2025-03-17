/*#if _EVM

import evmRouters from './platforms/evm/routers'
let svmRouters = {}

/*#elif _SVM

let evmRouters = {}
import svmRouters from './platforms/evm/routers'

//#else */

import evmRouters from './platforms/evm/routers'
import svmRouters from './platforms/svm/routers'

//#endif

export default {... evmRouters, ...svmRouters}

