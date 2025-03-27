import { routers } from 'src'

describe('routers', ()=> {

  it('exports the payment routers', async ()=>{
    
    expect(routers.ethereum.address).toEqual('0x365f7B56D2fB16C8Af89D7d33b420E4e013461e8')
    expect(typeof routers.ethereum.api === 'object').toEqual(true)

    expect(routers.bsc.address).toEqual('0x5F565EDfB9C446976a9F9910631cfeDb6A87220c')
    expect(typeof routers.bsc.api === 'object').toEqual(true)

    expect(routers.polygon.address).toEqual('0x50CFAB577623B1359602E11514a9482B061A941e')
    expect(typeof routers.polygon.api === 'object').toEqual(true)

    expect(routers.avalanche.address).toEqual('0x328FE8bbd30487BB7b5A8eEb909f892E9E229271')
    expect(typeof routers.avalanche.api === 'object').toEqual(true)

    expect(routers.gnosis.address).toEqual('0x328FE8bbd30487BB7b5A8eEb909f892E9E229271')
    expect(typeof routers.gnosis.api === 'object').toEqual(true)

    expect(routers.arbitrum.address).toEqual('0xA1cfbeeF344A52e18f748fd6a126f9426A40fbc7')
    expect(typeof routers.arbitrum.api === 'object').toEqual(true)

    expect(routers.optimism.address).toEqual('0x558302715e3011Be6695605c11A65526D2ba2245')
    expect(typeof routers.optimism.api === 'object').toEqual(true)

    expect(routers.base.address).toEqual('0x48825133EF08327535D0b24d73779E82BE6Ea4d9')
    expect(typeof routers.base.api === 'object').toEqual(true)
  })
})
