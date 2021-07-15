let mockAssets = (blockchain, assets)=>{
  global.fetch = jest.fn((url, options)=>{
    expect(options).toEqual({ headers: { 'X-Api-Key': 'Test123' } })
    expect(url).toEqual('https://api.depay.pro/v1/assets?account=0xd8da6bf26964af9d7eed9e03e53415d37aa96045&blockchain='+blockchain)
    return Promise.resolve({
      json: () => Promise.resolve(assets)
    })
  })
}


export {
  mockAssets
}
