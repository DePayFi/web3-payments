import { routers } from 'src'

describe('routers', ()=> {

  it('exports the payment routers', async ()=>{
    
    expect(routers.ethereum.address).toEqual('0x365f7B56D2fB16C8Af89D7d33b420E4e013461e8')
    expect(typeof routers.ethereum.api === 'object').toEqual(true)

    expect(routers.bsc.address).toEqual('0x5F565EDfB9C446976a9F9910631cfeDb6A87220c')
    expect(typeof routers.bsc.api === 'object').toEqual(true)

    expect(routers.polygon.address).toEqual('0xe04b08Dfc6CaA0F4Ec523a3Ae283Ece7efE00019')
    expect(typeof routers.polygon.api === 'object').toEqual(true)

    expect(routers.avalanche.address).toEqual('0x39E7C98BF4ac3E4C394dD600397f5f7Ee3779BE8')
    expect(typeof routers.avalanche.api === 'object').toEqual(true)

    expect(routers.gnosis.address).toEqual('0x328FE8bbd30487BB7b5A8eEb909f892E9E229271')
    expect(typeof routers.gnosis.api === 'object').toEqual(true)

    expect(routers.arbitrum.address).toEqual('0x328FE8bbd30487BB7b5A8eEb909f892E9E229271')
    expect(typeof routers.arbitrum.api === 'object').toEqual(true)

    expect(routers.optimism.address).toEqual('0x558302715e3011Be6695605c11A65526D2ba2245')
    expect(typeof routers.optimism.api === 'object').toEqual(true)

    expect(routers.base.address).toEqual('0x48825133EF08327535D0b24d73779E82BE6Ea4d9')
    expect(typeof routers.base.api === 'object').toEqual(true)

    expect(routers.worldchain.address).toEqual('0x886eb82a7e5E7310F66A0E83748662A17E391eb0')
    expect(typeof routers.base.api === 'object').toEqual(true)
  })
})
