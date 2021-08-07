import { routers } from 'src'

describe('routers', ()=> {

  it('exports the payment routers', async ()=>{
    expect(routers.ethereum.address).toEqual('0xae60aC8e69414C2Dc362D0e6a03af643d1D85b92')
    expect(routers.bsc.address).toEqual('0x0Dfb7137bC64b63F7a0de7Cb9CDa178702666220')
  })
})
