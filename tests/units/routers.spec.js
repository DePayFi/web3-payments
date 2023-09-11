import { routers } from 'src'

describe('routers', ()=> {

  it('exports the payment routers', async ()=>{
    
    expect(routers.ethereum.address).toEqual('0x6466F27B169C908Ba8174d80aEfa7173CbC3D0c7')
    expect(typeof routers.ethereum.api === 'object').toEqual(true)

    expect(routers.bsc.address).toEqual('0x7ea09401db4692a8AEF4111b75bD32AE758f552A')
    expect(typeof routers.bsc.api === 'object').toEqual(true)

    expect(routers.polygon.address).toEqual('0x50CFAB577623B1359602E11514a9482B061A941e')
    expect(typeof routers.polygon.api === 'object').toEqual(true)

    expect(routers.fantom.address).toEqual('0xFee05C41195985909DDfc9127Db1f94559c46db3')
    expect(typeof routers.fantom.api === 'object').toEqual(true)

    expect(routers.avalanche.address).toEqual('0xFee05C41195985909DDfc9127Db1f94559c46db3')
    expect(typeof routers.avalanche.api === 'object').toEqual(true)

    expect(routers.gnosis.address).toEqual('0xFee05C41195985909DDfc9127Db1f94559c46db3')
    expect(typeof routers.gnosis.api === 'object').toEqual(true)

    expect(routers.arbitrum.address).toEqual('0xA1cfbeeF344A52e18f748fd6a126f9426A40fbc7')
    expect(typeof routers.arbitrum.api === 'object').toEqual(true)

    expect(routers.optimism.address).toEqual('0x8698E529E9867eEbcC68b4792daC627cd8870736')
    expect(typeof routers.optimism.api === 'object').toEqual(true)

    expect(routers.base.address).toEqual('0x8B127D169D232D5F3ebE1C3D06CE343FD7C1AA11')
    expect(typeof routers.base.api === 'object').toEqual(true)
  })
})
