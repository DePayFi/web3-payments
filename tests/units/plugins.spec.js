import { plugins } from 'src'

describe('plugins', ()=> {

  it('exports the payment plugins', async ()=>{
    expect(plugins.ethereum.payment).toEqual('0x99F3F4685a7178F26EB4F4Ca8B75a1724F1577B9')
    expect(plugins.bsc.payment).toEqual('0x8B127D169D232D5F3ebE1C3D06CE343FD7C1AA11')
  })
})
