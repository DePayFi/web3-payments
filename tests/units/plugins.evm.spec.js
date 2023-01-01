import { plugins } from 'src/index.evm'

describe('plugins', ()=> {

  it('exports the payment plugins', async ()=>{
    expect(plugins.ethereum.payment.address).toEqual('0x99F3F4685a7178F26EB4F4Ca8B75a1724F1577B9')
    expect(plugins.ethereum.uniswap_v2.address).toEqual('0xe04b08Dfc6CaA0F4Ec523a3Ae283Ece7efE00019')
    expect(plugins.ethereum.paymentWithEvent.address).toEqual('0xD8fBC10787b019fE4059Eb5AA5fB11a5862229EF')
    expect(plugins.bsc.payment.address).toEqual('0x8B127D169D232D5F3ebE1C3D06CE343FD7C1AA11')
    expect(plugins.bsc.pancakeswap.address).toEqual('0xAC3Ec4e420DD78bA86d932501E1f3867dbbfb77B')
    expect(plugins.bsc.paymentWithEvent.address).toEqual('0x1869E236c03eE67B9FfEd3aCA139f4AeBA79Dc21')
  })
})
