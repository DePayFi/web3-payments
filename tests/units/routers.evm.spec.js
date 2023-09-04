import { routers } from 'dist/esm/index.evm'

describe('routers', ()=> {

  it('exports the payment routers', async ()=>{
    
    expect(routers.ethereum.address).toEqual('0x93C946371fE3B2439a78E9572C8be6134678E54E')
    expect(typeof routers.ethereum.api === 'object').toEqual(true)

    expect(routers.bsc.address).toEqual('0xB0645B8Bb814733Dde4C4f745890f9720e8152fc')
    expect(typeof routers.bsc.api === 'object').toEqual(true)

    expect(routers.polygon.address).toEqual('0x673271Af8f91A44cdBA143B96ac4B63210556f91')
    expect(typeof routers.polygon.api === 'object').toEqual(true)

    expect(routers.fantom.address).toEqual('0x67d907B883120DD7c78C503cF0049aD271804b46')
    expect(typeof routers.fantom.api === 'object').toEqual(true)

    expect(routers.avalanche.address).toEqual('0xC9850b32475f4fdE5c972EA6f967982a3c435D10')
    expect(typeof routers.avalanche.api === 'object').toEqual(true)

    expect(routers.gnosis.address).toEqual('0xC9850b32475f4fdE5c972EA6f967982a3c435D10')
    expect(typeof routers.gnosis.api === 'object').toEqual(true)

    expect(routers.arbitrum.address).toEqual('0xC9850b32475f4fdE5c972EA6f967982a3c435D10')
    expect(typeof routers.arbitrum.api === 'object').toEqual(true)

    expect(routers.optimism.address).toEqual('0xC9850b32475f4fdE5c972EA6f967982a3c435D10')
    expect(typeof routers.optimism.api === 'object').toEqual(true)

    expect(routers.base.address).toEqual('0x2CA727BC33915823e3D05fe043d310B8c5b2dC5b')
    expect(typeof routers.base.api === 'object').toEqual(true)
  })
})
