import { routers } from 'src'

describe('routers', ()=> {

  it('exports the payment routers', async ()=>{
    
    expect(routers.ethereum.address).toEqual('0xF491525C7655f362716335D526E57b387799d058')
    expect(typeof routers.ethereum.api === 'object').toEqual(true)

    expect(routers.bsc.address).toEqual('0xdb3f47b1D7B577E919D639B4FD0EBcEFD4aABb70')
    expect(typeof routers.bsc.api === 'object').toEqual(true)

    expect(routers.polygon.address).toEqual('0x39E7C98BF4ac3E4C394dD600397f5f7Ee3779BE8')
    expect(typeof routers.polygon.api === 'object').toEqual(true)

    expect(routers.fantom.address).toEqual('0x78C0F1c712A9AA2004C1F401A7307d8bCB62abBd')
    expect(typeof routers.fantom.api === 'object').toEqual(true)

    expect(routers.avalanche.address).toEqual('0x5EC3153BACebb5e49136cF2d457f26f5Df1B6780')
    expect(typeof routers.avalanche.api === 'object').toEqual(true)

    expect(routers.gnosis.address).toEqual('0x5EC3153BACebb5e49136cF2d457f26f5Df1B6780')
    expect(typeof routers.gnosis.api === 'object').toEqual(true)

    expect(routers.arbitrum.address).toEqual('0x5EC3153BACebb5e49136cF2d457f26f5Df1B6780')
    expect(typeof routers.arbitrum.api === 'object').toEqual(true)

    expect(routers.optimism.address).toEqual('0x5EC3153BACebb5e49136cF2d457f26f5Df1B6780')
    expect(typeof routers.optimism.api === 'object').toEqual(true)
  })
})
