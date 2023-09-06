import { routers } from 'dist/esm/index.evm'

describe('routers', ()=> {

  it('exports the payment routers', async ()=>{
    
    expect(routers.ethereum.address).toEqual('0xcbfc518FB621828fa6f0F4647D42931476ea473b')
    expect(typeof routers.ethereum.api === 'object').toEqual(true)

    expect(routers.bsc.address).toEqual('0xAc68Ee6Bc43Bf075C0522a15E665547CFd28628D')
    expect(typeof routers.bsc.api === 'object').toEqual(true)

    expect(routers.polygon.address).toEqual('0x1eD1e2dEEEa8B5C802663780284eDa63f62A3825')
    expect(typeof routers.polygon.api === 'object').toEqual(true)

    expect(routers.fantom.address).toEqual('0x8B127D169D232D5F3ebE1C3D06CE343FD7C1AA11')
    expect(typeof routers.fantom.api === 'object').toEqual(true)

    expect(routers.avalanche.address).toEqual('0x8B127D169D232D5F3ebE1C3D06CE343FD7C1AA11')
    expect(typeof routers.avalanche.api === 'object').toEqual(true)

    expect(routers.gnosis.address).toEqual('0x8B127D169D232D5F3ebE1C3D06CE343FD7C1AA11')
    expect(typeof routers.gnosis.api === 'object').toEqual(true)

    expect(routers.arbitrum.address).toEqual('0x47dF3990e8827EfF23b01e1CD7de309E8C6364a2')
    expect(typeof routers.arbitrum.api === 'object').toEqual(true)

    expect(routers.optimism.address).toEqual('0x47dF3990e8827EfF23b01e1CD7de309E8C6364a2')
    expect(typeof routers.optimism.api === 'object').toEqual(true)

    expect(routers.base.address).toEqual('0xfAD2F276D464EAdB71435127BA2c2e9dDefb93a4')
    expect(typeof routers.base.api === 'object').toEqual(true)
  })
})
